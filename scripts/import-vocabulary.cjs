// Idempotently import reviewed batches into the existing bundled data format.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const batches=fs.readdirSync(path.join(root,'src/vocabulary')).filter(f=>/^batch-\d+\.json$/.test(f)).sort().map(f=>JSON.parse(fs.readFileSync(path.join(root,'src/vocabulary',f),'utf8')));
const entries=batches.flatMap(b=>b.entries);
const ids=new Set();
for(const w of entries){
 if(ids.has(w.word))throw Error('Duplicate batch identity: '+w.word);ids.add(w.word);
 if(!w.zh||!w.pos||!w.kk||!Array.isArray(w.example)||w.example.length!==2||!w.example[0].trim()||typeof w.example[1]!=='string')throw Error('Incomplete entry: '+w.word);
 if(!new RegExp('(?:^|[^A-Za-z])'+w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^A-Za-z])','i').test(w.example[0]))throw Error('Example must use target word: '+w.word);
}
const block=(name,body)=>`// BEGIN IMPORTED ${name}\n${body}\n// END IMPORTED ${name}\n`;
function strip(s,name){return s.replace(new RegExp('// BEGIN IMPORTED '+name+'\\n[\\s\\S]*?// END IMPORTED '+name+'\\n'),'')}
let data=fs.readFileSync(path.join(root,'dist/data.js'),'utf8');
data=strip(strip(data,'WORDS'),'KK');
const boundary=data.indexOf('\n];');
const initial=JSON.parse(data.slice(data.indexOf('['),boundary+2));
for(const w of initial)if(ids.has(w.word))throw Error('Already in original vocabulary: '+w.word);
const added=entries.map(({example,kk,...word})=>word);
data=data.slice(0,boundary)+'\n'+block('WORDS',',\n'+JSON.stringify(added,null,1).slice(1,-1).trim())+data.slice(boundary);
data=data.replace('const kkVariants=',block('KK','Object.assign(kkPronunciations,'+JSON.stringify(Object.fromEntries(entries.map(w=>[w.word,w.kk])),null,1)+');')+'const kkVariants=');
fs.writeFileSync(path.join(root,'dist/data.js'),data);
let app=strip(fs.readFileSync(path.join(root,'dist/app.js'),'utf8'),'EXAMPLES');
app=app.replace('const key=',block('EXAMPLES','Object.assign(examples,'+JSON.stringify(Object.fromEntries(entries.map(w=>[w.word,w.example])),null,1)+');')+'const key=');
fs.writeFileSync(path.join(root,'dist/app.js'),app);
console.log(`Imported ${entries.length} additional words; ${initial.length+entries.length} total.`);
