const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const paths=['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'];
function setup({offline=false,invalid=false,cacheFailure=false}={}){
 const nodes={app:{innerHTML:''},toast:{style:{}}},storage=new Map(),entries=new Map([['english-study-pages-%2Fenglish-study%2F-old','old'],['english-study-pages-%2Fenglish-study%2F-current','old'],['unrelated-cache','untouched']]);let reloads=0,requests=0;
 const ctx=vm.createContext({Date,Intl,URL,Response,AbortController,console,setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>{},navigator:{},location:{origin:'https://example.test',reload:()=>reloads++},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{baseURI:'https://example.test/english-study/',querySelectorAll:()=>[],getElementById:id=>nodes[id]??={style:{},setAttribute(){},removeAttribute(){}}},
  caches:{keys:async()=>[...entries.keys()],open:async name=>({put:async(key,response)=>{assert.equal(key,'https://example.test/english-study/');if(cacheFailure)throw Error('cache full');entries.set(name,await response.text())}})},
  fetch:async(url,options)=>{requests++;assert.equal(new URL(url).pathname,'/english-study/index.html');assert.equal(options.cache,'no-store');if(offline)throw Error('offline');return new Response(invalid?'Sign in':'<html><title>英文不散</title><div id="app">new</div></html>',{headers:{'content-type':'text/html'}})}
 });for(const p of paths)vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+p,'utf8'),ctx);
 return {ctx,nodes,storage,entries,counts:()=>({reloads,requests})};
}
(async()=>{
 const s=setup();assert(s.nodes.app.innerHTML.includes('class="home-tools"'));assert(s.nodes.app.innerHTML.includes('id="update-site"'));assert.equal(typeof s.nodes['update-site'].onclick,'function');
 s.storage.set('word-roots-v1','existing learning progress');const before=JSON.stringify([...s.storage]);
 await Promise.all([s.nodes['update-site'].onclick(),s.nodes['update-site'].onclick()]);assert.deepEqual(s.counts(),{reloads:1,requests:1});assert.equal(JSON.stringify([...s.storage]),before);
 assert(s.entries.get('english-study-pages-%2Fenglish-study%2F-old').includes('new'));assert(s.entries.get('english-study-pages-%2Fenglish-study%2F-current').includes('new'));assert.equal(s.entries.get('unrelated-cache'),'untouched');
 for(const opts of [{offline:true},{invalid:true},{cacheFailure:true}]){
  const fail=setup(opts),prior=JSON.stringify([...fail.storage]);await fail.nodes['update-site'].onclick();assert.equal(fail.counts().reloads,0);assert.equal(JSON.stringify([...fail.storage]),prior);assert.equal(fail.nodes['update-site'].disabled,false);assert.equal(fail.nodes['update-site'].textContent,'更新');assert.match(fail.nodes.toast.textContent,/更新失敗/);
 }
 console.log('Passed: update button, fresh download bypassing old worker routes, app-cache replacement, one reload, progress preservation, unrelated-cache preservation and recoverable offline/invalid/cache failures.');
})().catch(e=>{console.error(e);process.exitCode=1});
