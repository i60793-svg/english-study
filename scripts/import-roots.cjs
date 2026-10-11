// Rebuild the browser catalog from the reviewed per-word source records.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'..'),file=path.join(dir,'dist/data.js');
const review=JSON.parse(fs.readFileSync(path.join(dir,'src/roots/review.json'),'utf8'));
const source=fs.readFileSync(file,'utf8'),ctx=vm.createContext({});vm.runInContext(source,ctx);
const practice=vm.runInContext('words.map(w=>w.word)',ctx);
if(practice.length!==Object.keys(review.words).length||practice.some(w=>!review.words[w]))throw Error('Every practice word must have a review record');
const entries={...review.words,...review.references},decompositions={},notes={},sources={};
for(const [word,e] of Object.entries(entries)){
 if(!e.parts.length)continue;
 if(e.status!=='verified'||!e.sources.some(s=>s.url.startsWith('https://www.etymonline.com/word/')))throw Error('Missing etymology verification: '+word);
 for(const [id] of e.parts){const info=review.roots[id];if(!info?.source||!info.meaning||!['字根','字首','字尾'].includes(info.kind))throw Error('Unknown component: '+word+' '+id);if(info.kind==='字尾'&&review.excludedSuffixes.includes(info.label))throw Error('Excluded suffix: '+word);}
 decompositions[word]=e.parts;notes[word]=e.note;sources[word]=e.sources;
}
const rootInfo=Object.fromEntries(Object.entries(review.roots).map(([id,r])=>[id,{label:r.label,kind:r.kind,meaning:r.meaning,source:r.source}]));
const runtime='// BEGIN REVIEWED ROOTS\n'+
 'const rootSource='+JSON.stringify({title:'Membean',url:'https://membean.com/roots'})+';\n'+
 'const rootInfo='+JSON.stringify(rootInfo,null,1)+';\n'+
 'const excludedSuffixes=new Set('+JSON.stringify(review.excludedSuffixes)+');\n'+
 'const decompositions='+JSON.stringify(decompositions,null,1)+';\n'+
 'const decompositionNotes='+JSON.stringify(notes,null,1)+';\n'+
 'const decompositionSources='+JSON.stringify(sources,null,1)+';\n// END REVIEWED ROOTS\n';
let result;
if(source.includes('// BEGIN REVIEWED ROOTS'))result=source.replace(/\/\/ BEGIN REVIEWED ROOTS[\s\S]*?\/\/ END REVIEWED ROOTS\n/,runtime);
else{const start=source.lastIndexOf('\n//',source.indexOf('const rootSource='));const end=source.indexOf('// Reference examples');result=source.slice(0,start)+'\n'+runtime+source.slice(end);}
result=result.replace(/function components\(w\)\{[\s\S]*?\n\}/,`function components(w){
 // Reviewed mappings are authoritative. Legacy refs never create a decomposition.
 const parts=decompositions[w.word]||[];
 return parts.filter(c=>rootInfo[c[0]]&&!(rootInfo[c[0]].kind==='字尾'&&excludedSuffixes.has(rootInfo[c[0]].label)));
}`);
fs.writeFileSync(file,result);console.log(JSON.stringify({reviewed:practice.length,displayed:practice.filter(w=>decompositions[w]?.length).length,roots:Object.keys(rootInfo).length}));
