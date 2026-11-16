const N='44', V='mushaf-v'+N;
const CORE=['./','index.html','kubra.html','style.css?v='+N,'app.js?v='+N,'amiri_sub.woff2','kf.otf','manifest.webmanifest','icon-192.png','icon-512.png','data/pages.json?v='+N,'data/sughra.json?v='+N,'data/kubra.json?v='+N];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// الإقلاع من الذاكرة دائماً (يعمل بلا إنترنت وبسرعة)؛ والصفحات تُحدَّث في الخلفية فتظهر في الفتحة التالية.
// الملفات ذات ?v= ثابتة بنسختها فتُقدَّم من الذاكرة مباشرة.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  const nav=e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html');
  const put=r=>{ if(r&&r.ok){ const c=r.clone(); caches.open(V).then(x=>x.put(e.request,c)) } return r };
  if(nav){
    e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
      const net=fetch(e.request).then(put).catch(()=>hit);
      return hit||net;
    }));
  } else {
    e.respondWith(caches.match(e.request).then(hit=>hit||caches.match(e.request,{ignoreSearch:true}).then(h2=>h2||fetch(e.request).then(put))));
  }
});
