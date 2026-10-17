const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/original-111.json','utf8'));
const batch=JSON.parse(fs.readFileSync(__dirname+'/../src/vocabulary/batch-001.json','utf8'));
class Clock extends Date{constructor(...args){super(...(args.length?args:['2026-10-05T00:00:00Z']))}static now(){return Date.parse('2026-10-05T00:00:00Z')}}
function setup(saved){
 const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map();
 if(saved)store.set('word-roots-v1',JSON.stringify(saved));
 const ctx=vm.createContext({Date:Clock,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
 for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),nodes,store};
}
let {run,nodes}=setup();const json=s=>JSON.parse(run(`JSON.stringify(${s})`));
assert.deepEqual(json('words.slice(0,111)'),baseline,'Existing identities/content/pronunciations must remain intact');
assert.equal(batch.addedWords,500);assert.equal(batch.entries.length,500);
assert.equal(run('words.length'),6834);assert.equal(run('new Set(words.map(w=>w.word)).size'),6834);
assert.deepEqual(json('words.slice(111,611).map(w=>w.word)'),batch.entries.map(w=>w.word));
for(const item of batch.entries){
 assert.equal(item.level,1);assert(item.zh&&item.pos&&item.kk);
 assert(new RegExp('\\b'+item.word+'\\b','i').test(item.example[0]));
 assert(/[\u3400-\u9fff]/.test(item.example[1]));
 assert.deepEqual(json(`examples[${JSON.stringify(item.word)}]`),item.example);
}
assert.deepEqual(json("components(words.find(w=>w.word==='finish')).map(c=>c[0])"),['fin']);
assert.deepEqual(json("components(words.find(w=>w.word==='card')).map(c=>c[0])"),['chart']);
for(const word of ['cap','father'])assert.equal(run(`rootMarkup(words.find(w=>w.word==='${word}'))`),'','Do not infer roots from matching substrings');
run("view='library';query='ability';render()");assert(nodes.results.innerHTML.includes('data-word="ability"'));
run("query='胡蘿蔔';results()");assert(nodes.results.innerHTML.includes('data-word="carrot"'));
assert(nodes.app.innerHTML.includes('大考中心高中英文參考詞彙表'));
// A user who finished all previous words receives exactly the 500 additions.
run("state.cards=Object.fromEntries(words.slice(0,111).map(w=>[w.word,scheduleReview(null,3,new Date('2026-11-10T00:00:00Z')).card]));state.logs=words.slice(0,111).map(w=>({word:w.word,day:'2026-10-04',rating:3,first:true}));state.excluded=[words[0].word];save()");
const saved=json('state'),priorCards=saved.cards;
({run,nodes}=setup(saved));
assert.deepEqual(json('state.cards'),priorCards);assert.deepEqual(json('state.logs'),saved.logs);assert.deepEqual(json('state.excluded'),saved.excluded);
assert.equal(run('fresh().length'),5684);assert.equal(run('due().length'),0);
assert.equal(run('learningTotals().learned'),111);assert.equal(run('learningTotals().total'),5795);
assert.equal(run('learningTotals().percentage'),1.9);
assert.equal(run("estimatedNewWordDate(new Date('2026-10-05T00:00:00Z'))"),new Date(Date.parse('2026-10-05T00:00:00Z')+568*86400000).toISOString().slice(0,10).replaceAll('-','/'));
run('start()');assert.notEqual(run('active.level'),1);assert.equal(run('total'),10);
let attempts=0;while(run('Boolean(active)')){run('rate(3)');assert(++attempts<=10)}
assert.equal(run('learnedToday()'),10);assert.equal(run('fresh().length'),5674);
nodes.back.onclick();assert(nodes.app.innerHTML.includes('>繼續學習</button>'));
nodes.start.onclick();assert.equal(run('total'),10);
while(run('Boolean(active)'))run('rate(3)');assert.equal(run('fresh().length'),5664);
assert.deepEqual(json(`validateBackup({...state,version:2}).cards`),json('state.cards'));
// Legacy exports from the old word bank still import after expansion.
const legacy={version:1,limit:5,logs:[{word:baseline[0].word,day:'2026-10-04',rating:3,first:true}],cards:{[baseline[0].word]:{due:Date.parse('2026-10-10'),interval:5,reps:1,ease:2.5}},excluded:[baseline[1].word]};
assert.deepEqual(json(`validateBackup(${JSON.stringify(legacy)}).logs`),legacy.logs);
assert.deepEqual(json(`validateBackup(${JSON.stringify(legacy)}).excluded`),legacy.excluded);
assert(fs.readFileSync(__dirname+'/../dist/index.html','utf8').includes('6834 字'));
console.log('Passed: 500 complete additions, 6834 unique identities, unchanged original content/progress, new-word search, conservative roots, full old-bank completion, forecasts, continued batches and old/new backups.');
