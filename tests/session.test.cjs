const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Keep time frozen: retries must work even when no minute has elapsed.
const timestamp=Date.parse('2026-10-04T10:00:00Z');
class Clock extends Date {constructor(...args){super(...(args.length?args:[timestamp]));}static now(){return timestamp;}}
function setup(saved){
 const nodes={app:{innerHTML:''},toast:{style:{}}};
 const store=new Map([['word-roots-test-reset-20261004-2043','done']]);
 if(saved)store.set('word-roots-v1',JSON.stringify(saved));
 const ctx=vm.createContext({Date:Clock,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
 for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),nodes,store};
}
let {run,nodes,store}=setup();
run('state.limit=5;start()');
const first=run('active.word');
assert.equal(run('queue.length'),4);
run('revealed=true;render()');assert(nodes.app.innerHTML.includes('本輪再練'));
run('rate(1)');
assert.equal(run('queue.at(-1).word'),first);
assert.equal(run('state.cards[words[0].word].due>Date.now()'),true);
// Finish all other new words; the forgotten card follows without another Start.
for(let i=0;i<4;i++)run('rate(3)');
assert.equal(run('active.word'),first);
assert.equal(run('learnedToday()'),5);
assert.equal(run('total'),6);
assert(nodes.app.innerHTML.includes('6 / 6'));
// With no other cards left, repeated forgetting still keeps this session open.
run('rate(1)');assert.equal(run('active.word'),first);
assert.equal(run('total'),7);
assert(nodes.app.innerHTML.includes('7 / 7'));
run('rate(3)');assert.equal(run('active'),undefined);
assert(nodes.app.innerHTML.includes('這輪完成了'));
run('start()');assert.equal(run('active'),undefined);
assert.equal(run('learnedToday()'),5);

// Reload after interruption before the retry time: resume forgotten work,
// fill only the unused new-word quota, and avoid duplicate review entries.
({run,nodes,store}=setup());
run('state.limit=5;start();rate(1)');
const backup=JSON.parse(store.get('word-roots-v1'));
({run,nodes}=setup(backup));
assert.equal(run('due().length'),1);
assert(nodes.app.innerHTML.includes('開始學習'));
run('start()');assert.equal(run('active.word'),first);
assert.equal(run('queue.length'),4);
assert.equal(run('total'),5);
run('rate(3)');assert.equal(run('due().length'),0);

// Reviews are not capped by the new-word limit and do not consume it.
({run,nodes}=setup());
run(`state.limit=5;words.slice(0,8).forEach(w=>{
 state.cards[w.word]=scheduleReview(null,3,new Date(Date.now()-6*86400000)).card;
 state.logs.push({word:w.word,rating:3,day:'2026-09-28',first:true});
});state.excluded=[words[1].word];start()`);
assert.equal(run('total'),12); // Seven due reviews plus five new words.
const seen=[];
while(run('Boolean(active)')){seen.push(run('active.word'));run('rate(3)');}
assert.equal(seen.length,12);assert.equal(new Set(seen).size,12);
assert(!seen.includes(run('words[1].word')));
assert.equal(run('learnedToday()'),5);

// Forget then opt out: no retry survives exclusion, including after restart.
({run}=setup());
run('state.limit=5;state.excluded=words.slice(1).map(w=>w.word);start();rate(1);excludeActiveWord()');
assert.equal(run('active'),undefined);
run('start()');assert.equal(run('active'),undefined);
assert.equal(run('due().length'),0);
// Opting out of a new word must fill the still-unused daily slot in this round.
({run,nodes}=setup());
run('state.limit=5;start();excludeActiveWord()');
for(let i=0;i<4;i++)run('rate(3)');
assert.equal(run('learnedToday()'),4);
assert.equal(run('Boolean(active)'),true,'The fifth new word must follow automatically');
run('rate(3)');assert.equal(run('active'),undefined);
assert.equal(run('learnedToday()'),5);
assert.equal(run('fresh().slice(0,Math.max(0,state.limit-learnedToday())).length'),0);
run('view="home";render()');assert(!nodes.app.innerHTML.includes('>開始學習</button>'));
// Multiple exclusions plus a forgotten word still complete the quota once.
({run}=setup());
run('state.limit=5;start();excludeActiveWord();excludeActiveWord();rate(1)');
let attempts=0;
while(run('Boolean(active)')){run('rate(3)');assert(++attempts<15);}
assert.equal(run('learnedToday()'),5);
assert.equal(run('due().length'),0);
run('start()');assert.equal(run('active'),undefined);
console.log('Passed: one-session daily quota including replacement after exclusions, all due reviews, immediate/repeated tail retries, progress counters, reload before one minute and latest grade resolution.');
