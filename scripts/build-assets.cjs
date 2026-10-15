// Static build: keep source JS/CSS editable, deliver one coherent initial HTML.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const vm=require('node:vm'),content=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(dist,'data.js'),'utf8'),content);
const rootReview=JSON.parse(fs.readFileSync(path.join(root,'src/roots/review.json'),'utf8'));
const rootWords=vm.runInContext('words.map(w=>w.word)',content);
if(rootWords.length!==Object.keys(rootReview.words).length||rootWords.some(w=>!rootReview.words[w]))throw Error('Every practice word requires an individual root review');
for(const [word,e] of Object.entries({...rootReview.words,...rootReview.references})){
 const actual=vm.runInContext(`JSON.stringify(components({word:${JSON.stringify(word)}}))`,content);
 if(actual!==JSON.stringify(e.parts))throw Error('Root review has not been imported: '+word);
}
const appSource=fs.readFileSync(path.join(dist,'app.js'),'utf8');
vm.runInContext(appSource.slice(0,appSource.indexOf('const key=')),content);
const missingExamples=vm.runInContext("words.filter(w=>!Array.isArray(examples[w.word])||examples[w.word].length!==2||!examples[w.word].every(s=>typeof s==='string')||!examples[w.word][0].trim()).map(w=>w.word)",content);
if(missingExamples.length)throw Error('Missing bilingual examples: '+missingExamples.join(', '));
const missingKK=vm.runInContext("[...words,...referenceWords].filter(w=>typeof w.kk!=='string'||!w.kk.trim()).map(w=>w.word)",content);
if(missingKK.length)throw Error('Missing KK pronunciations: '+missingKK.join(', '));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'english-study-build-'));
function minify(input,extension){
 const source=path.join(temporary,'input.'+extension),output=path.join(temporary,'output.'+extension);
 fs.writeFileSync(source,input);
 cp.execFileSync('npm',['exec','--yes','--package=esbuild@0.28.2','--','esbuild',source,'--minify','--charset=utf8','--target=es2020','--outfile='+output],{cwd:root,stdio:['ignore','ignore','pipe']});
 return fs.readFileSync(output,'utf8');
}
try{
 const scriptFiles=['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'];
 const jsSource=scriptFiles.map(f=>fs.readFileSync(path.join(dist,f),'utf8').replace(/\/\/# sourceMappingURL=.*$/gm,'')).join('\n;\n');
 let html=fs.readFileSync(path.join(root,'src/index.template.html'),'utf8').replace('__WORD_COUNT__',String(vm.runInContext('words.length',content)));
 const baseStyle=html.match(/<style>([\s\S]*?)<\/style>/)[1];
 const css=minify(baseStyle+'\n'+fs.readFileSync(path.join(dist,'theme.css'),'utf8'),'css');
 const js=minify(jsSource,'js').replace(/<\/script/gi,'<\\/script');
 html=html.replace(/<style>[\s\S]*?<\/style>/,()=>'<style>'+css+'</style>')
  .replace(/<link rel="stylesheet" href="\/theme\.css">/,'')
  .replace(/<script src="[^"]+"><\/script>/g,'')
  .replace('</body>',()=>'<script>'+js+'</script></body>');
 const hash=crypto.createHash('sha256').update(html).digest('hex').slice(0,12);
 fs.writeFileSync(path.join(dist,'index.html'),html);
 const worker=fs.readFileSync(path.join(root,'src/service-worker.js'),'utf8').replace('__BUILD_HASH__',hash);
 fs.writeFileSync(path.join(dist,'sw.js'),worker);
 console.log(JSON.stringify({htmlBytes:Buffer.byteLength(html),jsBefore:Buffer.byteLength(jsSource),jsAfter:Buffer.byteLength(js),initialExternalScripts:0,build:hash}));
}finally{fs.rmSync(temporary,{recursive:true,force:true})}
