const BASE=new URL('./',self.location.href);
const HOME=BASE.href;
const CACHE='english-study-pages-'+encodeURIComponent(BASE.pathname)+'-cbcc559b8b63';
const PRECACHE=['./','icon.svg','manifest.json'].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('english-study-pages-'+encodeURIComponent(BASE.pathname)+'-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),cached=await cache.match(HOME);
   // The entire page is self-contained, so cached HTML cannot mix JS versions.
   const update=fetch(request).then(response=>{
    if(response.ok&&response.type==='basic')return cache.put(HOME,response.clone()).then(()=>response);
    return response;
   });
   if(cached){event.waitUntil(update.catch(()=>undefined));return cached;}
   try{return await update}catch{const fallback=await cache.match(HOME);if(fallback)return fallback;throw Error('No cached page')}
  })());
 }else if(PRECACHE.includes(url.href)){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),cached=await cache.match(url.href);
   if(cached)return cached;
   const response=await fetch(request);if(response.ok)await cache.put(url.href,response.clone());return response;
  })());
 }
});
