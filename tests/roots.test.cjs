const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={app:{innerHTML:''},toast:{style:{}}},store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),json=s=>JSON.parse(run(`JSON.stringify(${s})`));
assert.equal(run('words.length'),611);assert.equal(run('new Set(words.map(w=>w.word)).size'),611);
assert.deepEqual(json("components(words.find(w=>w.word==='prediction')).map(c=>c[0])"),['pre-','dict']);
assert.deepEqual(json("components(words.find(w=>w.word==='acceptable')).map(c=>[c[0],c[2]])"),[['ac-',null],['cap','cept']]);
assert.deepEqual(json("components(referenceWords.find(w=>w.word==='floriculture')).map(c=>c[0])"),['flor','cult']);
assert.deepEqual(json("components(referenceWords.find(w=>w.word==='aviculture')).map(c=>c[0])"),['avi','cult']);
assert.deepEqual(json("components(referenceWords.find(w=>w.word==='cardiogram')).map(c=>c[0])"),['cardi','gram']);
// Unknown words and words outside this reference hide the entire decomposition.
for(const word of ['recently','happiness','business','cap','bell','cloud','improvement'])assert.equal(run(`rootMarkup({word:'${word}'})`),'');
for(const item of json('[...words,...referenceWords]')){
 const parts=json(`components(${JSON.stringify(item)})`);
 for(const [id] of parts){assert(['字首','字根','字尾'].includes(run(`rootInfo[${JSON.stringify(id)}].kind`)));assert(!id.startsWith('stem:'));}
 for(const [id] of parts)assert(!run(`excludedSuffixes.has(rootInfo[${JSON.stringify(id)}].label)`));
}
assert(!run("familyOptions().some(([id])=>id==='-ly'||id==='-ness')"));
run("active=words.find(w=>w.word==='contradict');browse=true;revealed=true;view='study';selectedRoot='dict';render()");
assert(nodes.app.innerHTML.includes('contra- ＋ dict'));assert(nodes.app.innerHTML.includes('Membean')&&nodes.app.innerHTML.includes('Etymonline'));assert(!nodes.app.innerHTML.includes('字尾'));assert(!nodes.app.innerHTML.includes('詞幹'));assert(run("rootMatches('dict','contradict').length")>10);assert.equal((nodes.app.innerHTML.match(/class="list-item"/g)||[]).length,10);
run("active=referenceWords.find(w=>w.word==='floriculture');selectedRoot=null;render()");assert(nodes.app.innerHTML.includes('flor ＋ cult'));assert.equal((nodes.app.innerHTML.match(/data-root=/g)||[]).length,2);
run("active=words.find(w=>w.word==='happiness');selectedRoot=null;render()");assert(!nodes.app.innerHTML.includes('root-buttons'));assert(!nodes.app.innerHTML.includes('class="parts"'));
run("view='library';family='dict';render()");assert(nodes.results.innerHTML.includes('dictionary'));assert(nodes.results.innerHTML.includes('predictable'));assert(!nodes.results.innerHTML.includes('occasionally'));
console.log('Passed: 611 practice identities, curated root-only decomposition, prefix/root variants, multiple roots, hidden unsupported words, 10-word related limit, and root-based filtering.');
