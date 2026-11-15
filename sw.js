const V='mushaf-v31', CORE=['./','index.html','kubra.html','style.css','app.js','amiri_sub.woff2','kf.otf','manifest.webmanifest','icon-192.png','icon-512.png','data/pages.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// الصفحات والشيفرة والأنماط: الشبكة أولاً حتى لا يختلط ملف قديم بصفحة جديدة؛ والباقي من الذاكرة أولاً
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url), core=e.request.mode==='navigate'||/\.(html|js|css)$/.test(u.pathname)||u.pathname.endsWith('/');
  const put=r=>{ if(r&&r.ok){ const c=r.clone(); caches.open(V).then(x=>x.put(e.request,c)) } return r };
  if(core) e.respondWith(fetch(e.request,{cache:'no-cache'}).then(put).catch(()=>caches.match(e.request,{ignoreSearch:true})));
  else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(put)));
});
