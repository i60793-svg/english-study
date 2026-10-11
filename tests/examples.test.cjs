const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),entries=JSON.parse(run('JSON.stringify(words.map(w=>({word:w.word,example:examples[w.word]})))'));
assert.equal(entries.length,611);
for(const {word,example} of entries){
 assert(Array.isArray(example)&&example.length===2,word);const [en,zh]=example;
 assert(new RegExp('\\b'+word+'\\b','i').test(en),word+' absent from example');assert(/[\u3400-\u9fff]/.test(zh),word+' lacks Chinese');
 run(`active=words.find(w=>w.word===${JSON.stringify(word)});browse=true;revealed=true;selectedRoot=null;view='study';render()`);
 assert(nodes.app.innerHTML.includes(run(`esc(${JSON.stringify(en)})`)),word+' English not rendered');assert(nodes.app.innerHTML.includes(run(`esc(${JSON.stringify(zh)})`)),word+' Chinese not rendered');
}
run('browse=false;revealed=false;render()');assert(!nodes.app.innerHTML.includes(run('esc(examples[active.word][0])')));
assert.equal(run('state.logs.length'),0);
console.log('Passed: every one of the 611 cards has a target-word English sentence and Chinese translation, both render after reveal, and examples stay hidden before reveal.');
