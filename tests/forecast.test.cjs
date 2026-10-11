const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),forecast=()=>run("estimatedNewWordDate(new Date('2026-10-03T20:38:27Z'))");
assert.equal(forecast(),'2026/12/04');
run('state.limit=5');assert.equal(forecast(),'2027/02/03');
run('state.limit=20');assert.equal(forecast(),'2026/11/03');
run("state.limit=10;words.slice(0,10).forEach(w=>{state.cards[w.word]={};state.logs.push({word:w.word,day:'2026-10-04',first:true})})");assert.equal(forecast(),'2026/12/04');
// Partial learning does not spend the daily quota twice, reviews do not use it.
run("state.cards={};state.logs=[];words.slice(0,3).forEach(w=>{state.cards[w.word]={};state.logs.push({word:w.word,day:'2026-10-04',first:true})});state.logs.push({word:words[0].word,day:'2026-10-04',first:false})");assert.equal(forecast(),'2026/12/04');
run("state.cards={};state.logs=[];state.excluded=words.slice(0,words.length-10).map(w=>w.word)");assert.equal(forecast(),'2026/10/04');
run("state.logs=words.slice(words.length-10).map(w=>({word:w.word,day:'2026-10-04',first:true}))");assert.equal(forecast(),'2026/10/05');
run('state.cards=Object.fromEntries(words.map(w=>[w.word,{}]));state.excluded=[]');assert.equal(forecast(),'2026/10/04');
run('state.cards={};state.logs=[];state.excluded=words.slice(0,words.length-11).map(w=>w.word)');assert.equal(run("estimatedNewWordDate(new Date('2026-12-31T01:00:00Z'))"),'2027/01/01');
const markup=run('learningSummaryMarkup()');assert(/預計學完新字：\d{4}\/\d{2}\/\d{2}/.test(markup));assert(!markup.includes('／'));assert(!markup.includes('剩餘'));
console.log('Passed: Taiwan calendar dates, daily limits, partial/completed quota, review exclusion, excluded words, zero remaining, year rollover and exact summary format.');
