const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
for(const base of ['https://example.test/english-study/','https://example.test/']){
 const events={},cacheNames=[],urls=[],deleted=[];
 const ctx={URL,self:{location:{href:base+'sw.js',origin:'https://example.test'},addEventListener:(n,h)=>events[n]=h,skipWaiting(){},clients:{claim(){}}},caches:{open:async name=>{cacheNames.push(name);return {addAll:async paths=>urls.push(...paths)}},keys:async()=>['english-study-pages-'+encodeURIComponent(new URL(base).pathname)+'-old','english-study-pages-%2Fother%2F-old'],delete:async n=>deleted.push(n)}};
 vm.runInNewContext(fs.readFileSync('dist/sw.js','utf8'),ctx);let task;events.install({waitUntil:p=>task=p});await task;
 assert.deepEqual(urls,[base,base+'icon.svg',base+'manifest.json']);events.activate({waitUntil:p=>task=p});await task;assert.equal(deleted.length,1);
 let intercepted=false;events.fetch({request:{method:'GET',url:'https://example.test/other/file',mode:'cors'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
}
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('href="./manifest.json"'));assert(!html.includes('href="/icon.svg"'));assert(!html.includes('register("/sw.js")'));assert(!html.includes('__BUILD_HASH__'));
console.log('Passed: Pages root/subpath installation, manifest/icon URLs and scoped cache cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1});
