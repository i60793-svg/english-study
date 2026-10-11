const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const review=JSON.parse(fs.readFileSync(__dirname+'/../src/roots/review.json','utf8'));
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/../dist/data.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),json=s=>JSON.parse(run(`JSON.stringify(${s})`));
const parts=w=>json(`components({word:${JSON.stringify(w)}})`),ids=w=>parts(w).map(c=>c[0]);
assert.equal(Object.keys(review.words).length,611);
for(const w of json('words')){
 const e=review.words[w.word];assert(e&&e.note,'Missing review disposition: '+w.word);
 assert.deepEqual(parts(w.word),e.parts,'Runtime data differs from review: '+w.word);
 if(e.parts.length){
  assert.equal(e.status,'verified');assert(e.sources.some(s=>/^https:\/\/www\.etymonline\.com\/word\//.test(s.url)));
  for(const [id] of e.parts){const r=review.roots[id];assert(r&&r.meaning&&r.source);assert(!review.excludedSuffixes.includes(r.label));}
 }else assert(['no-display','unavailable'].includes(e.status));
}
assert.deepEqual(ids('resist'),['re-','sist']);assert.match(parts('resist')[0][1],/對抗/);
assert.deepEqual(ids('assist'),['ad-','sist']);assert.equal(parts('assist')[0][2],'as-');
assert.deepEqual(ids('unhappy'),['un-']);assert.deepEqual(ids('rewrite'),['re-']);
assert.deepEqual(ids('actress'),['act','-ess']);assert.equal(run("rootInfo['-ess'].kind"),'字尾');
assert.deepEqual(ids('cardiogram'),['cardi','gram']);assert.equal(run("rootInfo.gram.kind"),'字尾');
assert.deepEqual(ids('floriculture'),['flor','cult']);assert.deepEqual(ids('aviculture'),['avi','cult']);
assert.deepEqual(ids('card'),['chart']);assert(!ids('airport').includes('port'));assert.deepEqual(ids('airport'),['port-harbor']);
assert.deepEqual(ids('transport'),['trans-','port']);
assert.deepEqual(ids('prepare'),['pre-','par-ready']);assert(!ids('prepare').includes('par-see'));
assert.deepEqual(ids('parent'),['par-birth']);assert.deepEqual(ids('unable'),['un-','abil']);
for(const w of ['happiness','business','carefully','bell','cap','cloud','improvement','recently'])assert.deepEqual(parts(w),[]);
assert.deepEqual(parts('unreviewed'),[]);assert.deepEqual(json("components({word:'unreviewed',refs:['dict']})"),[]);
assert(run("familyOptions().some(([id])=>id==='-ess')"));assert(run("familyOptions().some(([id])=>id==='sist')"));
assert(!run("familyOptions().some(([id,r])=>excludedSuffixes.has(r.label))"));
assert.deepEqual(json("rootMatches('-ess','actress').map(w=>w.word)"),['princess','hostess','lioness']);
assert(!run("rootMatches('port','transport').some(w=>w.word==='airport')"));
assert(!run("rootMatches('cardi','cardiogram').some(w=>w.word==='card')"));
assert(Object.values(review.words).some(e=>e.sources.some(s=>s.url.startsWith('https://root.eng.tw/'))));
assert(!fs.readFileSync(__dirname+'/../dist/data.js','utf8').includes('scribd.com'));
console.log('Passed: 611 individual review dispositions, verified sources, selected semantic suffixes, contextual prefixes, homograph isolation, no legacy fallback, Chinese supplements and source/runtime consistency.');
