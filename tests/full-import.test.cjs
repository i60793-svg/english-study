const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/..';const load=p=>JSON.parse(fs.readFileSync(root+'/'+p,'utf8'));
const baseline=load('tests/fixtures/pre-full-import.json'),sources=load('src/vocabulary/source-wordlists.json'),audit=load('src/vocabulary/full-import-audit.json');
const nodes={app:{innerHTML:''},toast:{style:{}}};let writes=0;const state={scheduler:'fsrs-6',schedulerVersion:6,cards:{},logs:[],excluded:['occasionally'],limit:5};const saved=JSON.stringify(state);
const ctx=vm.createContext({Date,Intl,console,setTimeout(){},setInterval(){},navigator:{},localStorage:{getItem:k=>k==='word-roots-v1'?saved:k.includes('test-reset')?'done':null,setItem(){writes++}},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const p of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(root+'/dist/'+p,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),json=s=>JSON.parse(run(`JSON.stringify(${s})`)),words=json('words'),ids=new Set(words.map(w=>w.word));
assert.equal(words.length,6834);assert.equal(ids.size,words.length);
for(const name of ['legacy','current'])for(const word of sources[name])assert(ids.has(word),'Missing source word '+word);
assert.deepEqual(words.slice(0,611),baseline.map(({example,...w})=>w));for(const w of baseline)assert.deepEqual(json(`examples[${JSON.stringify(w.word)}]`),w.example);
for(const w of words){
 assert(w.zh&&w.pos&&w.kk,'Incomplete word '+w.word);const e=json(`examples[${JSON.stringify(w.word)}]`);assert(e&&e[0].trim(),'Missing English '+w.word);assert(typeof e[1]==='string');
 const escaped=w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');assert(new RegExp('(?:^|[^A-Za-z])'+escaped+'(?:$|[^A-Za-z])','i').test(e[0]),'Example missing target '+w.word);
}
assert.equal(writes,0,'Import does not reset or rewrite existing progress');assert.deepEqual(json('state.excluded'),['occasionally']);
run("view='library';query='';family='';render()");assert.equal((nodes.results.innerHTML.match(/data-word=/g)||[]).length,150);assert(nodes.results.innerHTML.includes('library-more'));nodes['library-more'].onclick();assert.equal((nodes.results.innerHTML.match(/data-word=/g)||[]).length,300);
run("query='zinc';results()");assert(nodes.results.innerHTML.includes('data-word="zinc"'));assert.equal((nodes.results.innerHTML.match(/data-word=/g)||[]).length,1);
const pending=words.find(w=>w.exampleProvenance?.translationStatus==='pending');assert(pending);run(`active=words.find(w=>w.word===${JSON.stringify(pending.word)});browse=true;revealed=true;view='study';render()`);assert(nodes.app.innerHTML.includes('中文翻譯尚待核對'));assert(nodes.app.innerHTML.includes('CC BY 2.0 FR'));
const retained=json('state');assert.deepEqual(json(`validateBackup(${JSON.stringify({...retained,version:2})}).excluded`),['occasionally']);
assert.equal(audit.added,6223);assert.equal(audit.count,6834);
console.log('Passed: complete old/new source coverage, 6834 unique entries, unchanged 611 original entries/examples, KK and target-word examples, preserved storage/exclusions/backups, paged library and full-bank search, honest translation/source status.');
