const C='central-lucas-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(C)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k=>k!==C)
            .map(k=>caches.delete(k))
        )
      )
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(C).then(cache=>{
          cache.put(e.request,copy);
        });
        return response;
      })
      .catch(()=>caches.match(e.request))
  );
});
