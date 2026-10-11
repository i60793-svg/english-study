const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let now=Date.parse('2026-10-05T00:00:00Z');
class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const nodes={app:{innerHTML:''},toast:{style:{}}},scrolls=[];
const store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date:Clock,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},confirm:()=>false,scrollTo:options=>scrolls.push(options),localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
// Yesterday evening's Hard review must be available next morning, not evening.
run("state.cards[words[0].word]=scheduleReview(null,2,new Date('2026-10-04T12:00:00Z')).card");
assert.equal(run('due().length'),1);
now=Date.parse('2026-10-04T15:59:00Z');assert.equal(run('due().length'),0);
now=Date.parse('2026-10-04T16:00:00Z');assert.equal(run('due().length'),1);
run("state.cards[words[1].word]=scheduleReview(null,3,new Date('2026-10-04T12:00:00Z')).card");
assert.equal(run('due().length'),1,'Five-day card must not appear early');
run('state.excluded=[words[0].word]');assert.equal(run('due().length'),0);
// Device UTC date is Oct 4 while Taiwan is Oct 5.
run("state.logs=['2026-10-03','2026-10-04','2026-10-05'].map(day=>({word:words[0].word,rating:3,day,first:false}))");
assert.equal(run('learningStreak()'),3);
run("state.logs.pop()");assert.equal(run('learningStreak()'),2);
run("state.logs=state.logs.filter(l=>l.day!=='2026-10-04')");assert.equal(run('learningStreak()'),0);
run("state.logs=['2025-12-30','2025-12-31','2026-01-01'].map(day=>({word:words[0].word,rating:3,day}))");
assert.equal(run("learningStreak(new Date('2025-12-31T16:01:00Z'))"),3);
// Reject dates JavaScript silently normalizes and truthy non-boolean flags.
for(const log of [{day:'2026-02-30',first:true},{day:'2026-10-04',first:'false'}]){
 assert.throws(()=>run(`validateBackup({version:1,cards:{},limit:10,logs:[{word:words[0].word,rating:3,...${JSON.stringify(log)}}]})`));
}
run('state.logs=[];state.cards={};state.excluded=[];start()');assert.equal(scrolls.at(-1).top,0);
run('rate(3)');assert.equal(scrolls.length,2,'Every new card returns to the top');
// A canceled or invalid import clears the input so the same file can be picked again.
(async()=>{
 run('view="record";render()');const snapshot=store.get('word-roots-v1');
 const target={value:'backup.json',files:[{name:'backup.json',text:async()=>JSON.stringify({version:1,cards:{},logs:[],limit:5})}]};
 await nodes.import.onchange({target});assert.equal(target.value,'');assert.equal(store.get('word-roots-v1'),snapshot);
 target.value='broken.json';target.files=[{name:'broken.json',text:async()=>'{'}];
 await nodes.import.onchange({target});assert.equal(target.value,'');assert.equal(store.get('word-roots-v1'),snapshot);
 console.log('Passed: Taiwan calendar review dates, no early future reviews, midnight/year boundary streaks, malformed backup rejection, next-card scroll and same-file import retry.');
})().catch(e=>{console.error(e);process.exitCode=1});
