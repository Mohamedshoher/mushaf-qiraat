const V='mushaf-v13', CORE=['./','index.html','kubra.html','style.css','app.js','amiri_sub.woff2','manifest.webmanifest','icon-192.png','icon-512.png','data/pages.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{ if(r&&r.ok){ const c=r.clone(); caches.open(V).then(x=>x.put(e.request,c)) } return r }).catch(()=>hit);
    return hit||net;
  }));
});
