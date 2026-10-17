const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(saved){
 const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
 if(saved)store.set('word-roots-v1',JSON.stringify(saved));
 const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
 for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),nodes,store};
}
let {run,nodes,store}=setup();
const json=s=>JSON.parse(run(`JSON.stringify(${s})`));
assert.equal(run('studyWords.length'),5795);
assert.equal(run("words.find(w=>w.word==='no').level"),1);
assert.equal(run("fresh().some(w=>w.word==='no')"),false);
run("state.cards.no=scheduleReview(null,1,new Date()).card;state.logs.push({word:'no',day:day(),first:true,rating:1});save()");
const prior=json('state');
assert.equal(run("due().some(w=>w.level===1)"),false);
assert.equal(run('learnedToday()'),0);
assert.equal(run('learningTotals().learned'),0);
assert.equal(run('learningTotals().total'),5795);
assert.equal(run('learningTotals().days'),1);
run('state.limit=5;start()');
for(let i=0;i<5;i++){assert.notEqual(run('active.level'),1);assert.equal(run('queue.some(w=>w.level===1)'),false);run('rate(3)');}
assert.equal(run('active'),undefined);
assert.equal(run('learnedToday()'),5);
assert.deepEqual(json('state.cards.no'),prior.cards.no);
assert.deepEqual(json("state.logs.filter(l=>l.word==='no')"),prior.logs);
const saved=json('state');({run,nodes,store}=setup(saved));
assert.deepEqual(json('state.cards'),saved.cards);
assert.deepEqual(json('state.logs'),saved.logs);
assert.deepEqual(json('state.excluded'),saved.excluded);
run("view='library';query='no';render()");assert(nodes.results.innerHTML.includes('data-word="no"'));
console.log('Passed: Level 1 new/review/forgotten cards skipped, daily quota and progress exclude Level 1, records survive reload, library remains searchable.');
