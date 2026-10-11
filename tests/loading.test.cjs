const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const html=fs.readFileSync(__dirname+'/../dist/index.html','utf8');
assert(!/<script\s+src=/.test(html));assert(!/<link[^>]+rel="stylesheet"/.test(html));
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(inline.length,1);
const nodes={app:{innerHTML:''},toast:{style:{}}};const store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const ctx=vm.createContext({Date,Intl,console,setInterval:()=>{},setTimeout:()=>{},navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
vm.runInContext(inline[0][1],ctx);assert(nodes.app.innerHTML.includes('daily-quote'));assert(nodes.app.innerHTML.includes('累計學習'));assert(/預計學完新字：\d{4}\/\d{2}\/\d{2}/.test(nodes.app.innerHTML));
nodes.start.onclick();assert(nodes.app.innerHTML.includes('查看意思'));nodes.reveal.onclick();assert(nodes.app.innerHTML.includes('data-rate="3"'));vm.runInContext('rate(3)',ctx);assert.equal(JSON.parse(store.get('word-roots-v1')).logs.length,1);assert.equal(JSON.parse(store.get('word-roots-v1')).scheduler,'fsrs-6');
const handlers={},cacheEntries=new Map([['/',new Response('<html>cached</html>')]]);let fetches=0,networkResolve,offline=false;
const networkResponse=()=>{const r=new Response('<html>updated</html>');Object.defineProperty(r,'type',{value:'basic'});return r};
const worker=vm.createContext({URL,console,self:{location:{origin:'https://example.test'},addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>({match:async k=>cacheEntries.get(k)?.clone(),put:async(k,v)=>cacheEntries.set(k,v),addAll:async()=>{}}),keys:async()=>[],delete:async()=>true},fetch:()=>{fetches++;if(offline)return Promise.reject(Error('offline'));return new Promise(resolve=>networkResolve=resolve)}});
vm.runInContext(fs.readFileSync(__dirname+'/../dist/sw.js','utf8'),worker);
function navigate(){const waits=[];let response;handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://example.test/'},respondWith:p=>response=p,waitUntil:p=>waits.push(p)});return {response,waits}}
(async()=>{
 const event=navigate();const result=await event.response;assert.equal(await result.text(),'<html>cached</html>');assert.equal(fetches,1);assert(networkResolve);networkResolve(networkResponse());await Promise.all(event.waits);assert.equal(await cacheEntries.get('/').clone().text(),'<html>updated</html>');
 offline=true;const offlineEvent=navigate();assert.equal(await(await offlineEvent.response).text(),'<html>updated</html>');await Promise.all(offlineEvent.waits);
 const priorBytes=Buffer.byteLength(fs.readFileSync(__dirname+'/../src/index.template.html','utf8'))+fs.statSync(__dirname+'/../dist/theme.css').size+['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'].reduce((n,f)=>n+fs.statSync(__dirname+'/../dist/'+f).size,0);
 assert(Buffer.byteLength(html)<priorBytes);console.log(JSON.stringify({checks:'minified home, FSRS scoring, cached navigation without waiting for network, background update, offline fallback',beforeBytes:priorBytes,afterBytes:Buffer.byteLength(html),gzipBytes:zlib.gzipSync(html).length}));
})().catch(e=>{console.error(e);process.exitCode=1});
