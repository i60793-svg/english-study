const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),entries=JSON.parse(run('JSON.stringify([...words,...referenceWords])'));
for(const w of entries){
 assert.equal(typeof w.kk,'string',w.word);assert(w.kk.includes('ˋ'),w.word+' stress missing');assert(!/[0-9ː]/.test(w.kk),w.word+' unconverted ARPABET/IPA');
 assert(!w.kk.includes('eɪ')&&!w.kk.includes('oʊ'),w.word+' requires KK e/o');
 const markup=run(`kkMarkup(${JSON.stringify(w)})`);assert(markup.includes('KK '));assert(markup.includes('['+w.kk+']'),w.word);
}
for(const w of JSON.parse(run('JSON.stringify(words)'))){
 run(`active=words.find(w=>w.word===${JSON.stringify(w.word)});view='study';browse=false;revealed=false;render()`);
 assert(nodes.app.innerHTML.includes('kk-pronunciation'),w.word+' front missing KK');assert(!nodes.app.innerHTML.includes('undefined'),w.word);
 run('browse=true;revealed=true;render()');assert(nodes.app.innerHTML.includes('['+w.kk+']'),w.word+' preview missing KK');
}
run("view='library';family='';query='';render()");assert.equal((nodes.results.innerHTML.match(/aria-label="美式 KK 音標"/g)||[]).length,150);
run("view='study';active=words.find(w=>w.word==='contradict');selectedRoot='dict';revealed=true;browse=true;render()");assert(nodes.app.innerHTML.includes('edict'));assert(nodes.app.innerHTML.includes('[ˋidɪkt]'));
run("active=words.find(w=>w.word==='import');selectedRoot=null;render()");assert(nodes.app.innerHTML.includes('動詞 [ɪmˋpɔrt]'));assert(nodes.app.innerHTML.includes('名詞 [ˋɪmˏpɔrt]'));
assert.equal(run('state.logs.length'),0);console.log('Passed: KK coverage for all practice words and all related references, KK symbols/stress, both card faces, library, related lists and noun/verb stress variants.');
