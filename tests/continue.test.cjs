const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(saved){
 const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
 if(saved)store.set('word-roots-v1',JSON.stringify(saved));
 const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
 for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),nodes,store};
}
let {run,nodes,store}=setup();
run('state.limit=5;start()');const excluded=run('active.word');run('excludeActiveWord()');
const forgotten=run('active.word');run('rate(1)');
let attempts=0;while(run('Boolean(active)')){run('rate(3)');assert(++attempts<10);}
assert.equal(run('learnedToday()'),5);
assert(nodes.app.innerHTML.includes('這輪完成了'));
assert(nodes.app.innerHTML.includes(excluded));assert(nodes.app.innerHTML.includes('(不再出現)'));
assert.equal((nodes.app.innerHTML.match(/class="list-item"/g)||[]).length,6);
assert.equal(run(`sessionWords.filter(w=>w.word===${JSON.stringify(forgotten)}).length`),1);
assert.equal(run('sessionWords.length'),6);
assert.equal((nodes.app.innerHTML.match(/class="kk-pronunciation"/g)||[]).length,6);
const firstGroup=JSON.parse(run('JSON.stringify(sessionWords.map(w=>w.word))'));
nodes.back.onclick();assert(nodes.app.innerHTML.includes('>繼續學習</button>'));
nodes.start.onclick();assert.equal(run('total'),5);
while(run('Boolean(active)')){assert(!firstGroup.includes(run('active.word')));run('rate(3)');}
assert.equal(run('learnedToday()'),10);
assert.equal(run('sessionWords.length'),5);
assert(!nodes.app.innerHTML.includes(excluded),'Completion list contains only the current round');
// Daily progress survives reload; an extra group can still be started.
({run,nodes}=setup(JSON.parse(store.get('word-roots-v1'))));
assert(nodes.app.innerHTML.includes('>繼續學習</button>'));
nodes.start.onclick();assert.equal(run('total'),5);
while(run('Boolean(active)'))run('rate(3)');assert.equal(run('learnedToday()'),15);
// Exhaustion produces a disabled, honest end state instead of an empty round.
run('state.excluded.push(...fresh().map(w=>w.word));view="home";render()');
assert(/id="start" disabled>全部完成/.test(nodes.app.innerHTML));
for(const limit of [5,10,20]){
 ({run,nodes}=setup());run(`state.limit=${limit};start()`);
 while(run('Boolean(active)'))run('rate(3)');
 nodes.back.onclick();nodes.start.onclick();assert.equal(run('total'),limit);
 while(run('Boolean(active)'))run('rate(3)');
 assert.equal(run('learnedToday()'),limit*2);
}
console.log('Passed: completion lists all encountered words including exclusions, deduplicates retries, shows KK, resets per round, continues exact-size new groups, preserves daily counts after reload and handles exhaustion.');
