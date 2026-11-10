
let D=null; const CFG=window.MUSHAF||{kind:'sughra',data:'data/sughra.json'};
const $=id=>document.getElementById(id);
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const red=s=>esc(s).replace(/\u0001/g,'<span class="r">').replace(/\u0002/g,'</span>');
function plain(n){return n.replace(/ٱ/g,'ا').replace(/ا\u0653/g,'آ').replace(/(^|\s)ال(?=[\u064B-\u0652]*\u0653)/g,'$1آل').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/ٱ/g,'ا').replace(/(^|\s)ءا/g,'$1آ')}
let cur=1;
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{try{fitLines()}catch(e){}});
function fitLines(){document.querySelectorAll('#txt .ln.j').forEach(e=>{if(e.dataset.b)e.style.fontSize=e.dataset.b+'cqw';const o=e.scrollWidth,w=e.clientWidth;if(o>w+1){e.style.fontSize=(parseFloat(e.style.fontSize)*w/o*0.995).toFixed(2)+'cqw'}})}
function lineHTML(t,size,text,p,li,mk){
  const hm=D.hl[p]||{}; mk=mk||{};
  const ws=text.split(' ').map((w,wi)=>{
    const c=hm[li+':'+wi];
    const f=mk[li+':'+wi]?' fd':'';
    if(c===undefined) return f?'<span class="fd">'+red(w)+'</span>':red(w);
    return '<span class="w hl'+f+(c>=0?' k':'')+'"'+(c>=0?' tabindex="0" role="button" data-c="'+c+'"':'')+'>'+red(w)+'</span>';
  }).join(' ');
  if(t==='h') return '<div class="ln h" style="font-size:5.7cqw"><span class="in">'+esc(plain(text.replace(/[\u0001\u0002]/g,'')))+'</span></div>';
  const fs=(t==='j'?20.5:size)/398*100,fs2=fs.toFixed(2);
  return '<div class="ln '+t+'" style="font-size:'+fs2+'cqw" data-b="'+fs2+'">'+ws+'</div>';
}
function render(p,q){
  p=Math.max(1,Math.min(604,p|0)); cur=p;
  const mk=q?findIn(p,q).marks:null;
  $('txt').innerHTML=D.pages[p-1].map((l,i)=>lineHTML(l[0],l[1],l[2],p,i,mk)).join('');
  fitLines();
  $('pg').value=p;
  try{localStorage.setItem('mushaf-page',String(p))}catch(e){}
  try{ if(location.hash!=='#p-'+p){ try{history.replaceState(history.state,'','#p-'+p)}catch(e2){location.hash='p-'+p} } }catch(e){}
  window.scrollTo({top:0});
  try{ if(D.surahs) markDrawer() }catch(e){}
}
function fmt(x){
  const m=x.match(/«([^»]+)»/);
  const g=t=>esc(t).replace(/«([^»]+)»/g,'<span class="ge">$1</span>');
  if(!m) return g(x);
  const rest=x.replace(m[0],'').replace(/\s+/g,' ').replace(/^\s*و(?=\s)/,'').trim();
  return '<span class="gw">'+esc(m[1])+'</span>'+g(rest);
}
function rdItem(x){
  const w=esc(x.w||'');
  const detail=[x.who?'<b class="wo">'+esc(x.who)+'</b>':'', x.how?esc(x.how):''].filter(Boolean).join(' — ');
  return '<span class="gw">'+w+'</span>'+(detail?'<span class="wh">'+detail+'</span>':'');
}
function rdHTML(m){
  let h='';
  const rs=m.rs;
  if(rs&&rs.length){
    h=rs.length>1?'<ol class="rd">'+rs.map(x=>'<li>'+rdItem(x)+'</li>').join('')+'</ol>':'<div class="rd1">'+rdItem(rs[0])+'</div>';
    if(m.nt&&m.nt.length) h+='<ul class="nt">'+m.nt.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';
    return h;
  }
  return items(m.r);
}
function items(r){
  const a=r.split(/\s*؛\s*|[،,]\s*(?=و(?:الباقون|قرأ|وقف|واف|ابن|أبو|حمزة|الكسائي|خلف|نافع|عاصم|يعقوب|قالون|ورش|البزي|قنبل|هشام|حفص|شعبة|خلاد|رويس|روح|المدني|المكي|البصري|الكوفي|الشامي|الأزرق|الدوري|السوسي))/).map(x=>x.trim().replace(/[،,؛]$/,'')).filter(Boolean);
  if(a.length<2) return '<p class="rd1">'+fmt(a[0]||r)+'</p>';
  return '<ol class="rd">'+a.map(x=>'<li>'+fmt(x)+'</li>').join('')+'</ol>';
}
function verses(t){return t.split('\n').map(v=>'<p class="v">'+v.split(' ... ').map(h=>'<span>'+esc(h)+'</span>').join('')+'</p>').join('')}
function open_(c,el){
  const m=D.com[c]; if(!m) return;
  let tail='';
  if(CFG.kind==='kubra'){
    const tv=m.tt?verses(m.tt):'<p class="none">لا شاهد</p>';
    tail='<div class="sec"><h2>طيبة النشر'+(m.tn?' <span class="num">البيت '+esc(m.tn)+'</span>':'')+'</h2>'+tv+'</div>';
  } else {
    const sh=m.st?verses(m.st):'<p class="none">'+esc(m.ns||'لا شاهد')+'</p>';
    const du=m.dt?verses(m.dt):'<p class="none">'+esc(m.nd||'لا شاهد')+'</p>';
    tail='<div class="sec"><h2>الشاطبية'+(m.sn?' <span class="num">البيت '+esc(m.sn)+'</span>':'')+'</h2>'+sh+'</div>'
     +'<div class="sec"><h2>الدرة'+(m.dn?' <span class="num">البيت '+esc(m.dn)+'</span>':'')+'</h2>'+du+'</div>';
  }
  $('sin').innerHTML='<div class="sh-top"><div class="sh-w">'+el.innerHTML+'</div><button id="cl" aria-label="إغلاق">إغلاق</button></div>'
   +'<div class="sec"><h2>القراءات</h2>'+rdHTML(m)+'</div>'+tail;
  showSheet(); $('cl').onclick=()=>close_(); $('cl').focus();
}
let shOpen=false, pend=null;
function showSheet(){ $('sheet').classList.add('o'); $('back').classList.add('o'); if(!shOpen){ shOpen=true; try{history.pushState({sh:1},'')}catch(e){} } }
function hideSheet(){ shOpen=false; $('sheet').classList.remove('o'); $('back').classList.remove('o'); }
function close_(cb){
  if(typeof cb!=='function') cb=null;
  if(!shOpen){ if(cb)cb(); return }
  let viaHist=false; try{ viaHist=!!(history.state&&history.state.sh) }catch(e){}
  if(viaHist){ pend=cb; try{history.back(); return}catch(e){} }
  hideSheet(); if(cb)cb();
}
let drOpen=false, drPend=null;
function buildDrawer(){
  $('dsurahs').innerHTML=D.surahs.map((s,i)=>'<li><button data-p="'+s[2]+'" data-i="'+i+'"><span class="n">'+AR(s[0])+'</span><span>'+esc(plain(s[1]).replace(/ي$/,'ى'))+'</span><small>ص '+AR(s[2])+'</small></button></li>').join('');
}
function surahIdx(p){let k=0;D.surahs.forEach((x,i)=>{if(x[2]<=p)k=i});return k}
function markDrawer(){
  const k=surahIdx(cur); document.querySelectorAll('#dsurahs button').forEach((b,i)=>b.classList.toggle('cur',i===k));
  document.querySelectorAll('.mushafs a').forEach(a=>{ a.classList.toggle('cur',a.dataset.k===CFG.kind); a.href=a.dataset.h+'#p-'+cur });
}
function showDrawer(){
  if(drOpen) return; drOpen=true; markDrawer();
  $('drawer').classList.add('o'); $('back').classList.add('o'); $('drawer').setAttribute('aria-hidden','false');
  try{history.pushState({dr:1},'')}catch(e){}
  const c=document.querySelector('#dsurahs button.cur'); if(c) c.scrollIntoView({block:'center'});
}
function hideDrawer(){ drOpen=false; $('drawer').classList.remove('o'); if(!shOpen) $('back').classList.remove('o'); $('drawer').setAttribute('aria-hidden','true') }
function closeDrawer(cb){
  if(typeof cb!=='function') cb=null;
  if(!drOpen){ if(cb)cb(); return }
  let viaHist=false; try{ viaHist=!!(history.state&&history.state.dr) }catch(e){}
  if(viaHist){ drPend=cb; try{history.back(); return}catch(e){} }
  hideDrawer(); if(cb)cb();
}
window.addEventListener('popstate',()=>{
  if(shOpen){ hideSheet(); const c=pend; pend=null; if(c) c(); }
  else if(drOpen){ hideDrawer(); const c=drPend; drPend=null; if(c) c(); }
});

const NM=s=>s.replace(/[\u0001\u0002]/g,'').replace(/[ً-ٰٟۖ-ۭـ۝]/g,'').replace(/[ٱأإآءئؤ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^ء-ي ]/g,'').replace(/ا/g,'').replace(/\s+/g,' ').trim();
const PC={};
function pageIdx(p){
  if(PC[p]) return PC[p];
  const ws=[]; D.pages[p-1].forEach((l,li)=>l[2].split(' ').forEach((w,wi)=>{const n=NM(w); if(n) ws.push({li,wi,n,w})}));
  let S='',pos=[]; ws.forEach(x=>{ if(S) S+=' '; pos.push(S.length); S+=x.n; });
  return PC[p]={ws,S,pos};
}
function findIn(p,q){
  const {ws,S,pos}=pageIdx(p), marks={}, hits=[]; if(!q) return {marks,hits};
  let i=S.indexOf(q);
  while(i>=0){
    const e=i+q.length; let a=-1,b=-1;
    pos.forEach((st,k)=>{ const en=st+ws[k].n.length; if(en>i&&st<e){ if(a<0)a=k; b=k; marks[ws[k].li+':'+ws[k].wi]=1; } });
    hits.push([a,b]); i=S.indexOf(q,e);
  }
  return {marks,hits};
}
function surahOf(p){let k=0;D.surahs.forEach((x,i)=>{if(x[2]<=p)k=i});return D.surahs[k][1]}
const clean=w=>esc(w.replace(/[\u0001\u0002]/g,''));
function doSearch(raw){
  const q=NM(raw), box=$('sres');
  if(q.length<2){box.innerHTML='<p class="sc">اكتب حرفين على الأقل.</p>';return}
  const out=[]; let total=0;
  for(let p=1;p<=604;p++){
    const {ws}=pageIdx(p), r=findIn(p,q);
    r.hits.forEach(h=>{ total++; if(out.length<150){
      const a=Math.max(0,h[0]-4), b=Math.min(ws.length-1,h[1]+4);
      const t=ws.slice(a,b+1).map((x,k)=>{const i=a+k; return (i>=h[0]&&i<=h[1])?'<mark>'+clean(x.w)+'</mark>':clean(x.w)}).join(' ');
      out.push('<li><button data-p="'+p+'"><span class="m">صفحة '+AR(p)+' · سورة '+esc(surahOf(p))+'</span><span class="t">'+t+'</span></button></li>');
    }});
  }
  box.innerHTML=total?'<p class="sc">'+AR(total)+' نتيجة'+(total>out.length?' (تظهر أول '+AR(out.length)+')':'')+'</p><ol class="rs">'+out.join('')+'</ol>':'<p class="sc">لا نتائج.</p>';
  box.dataset.q=q;
}
function openSearch(){
  $('sin').innerHTML='<div class="sh-top"><h2 style="margin:0;font-size:16px;font-family:system-ui,sans-serif;color:var(--accent)">بحث في المصحف</h2><button id="cl" aria-label="إغلاق">إغلاق</button></div>'
   +'<div class="sq" style="margin-top:10px"><input id="qi" type="search" enterkeyhint="search" placeholder="اكتب كلمة أو آية (بغير تشكيل)" autocomplete="off"><button id="qg">بحث</button></div><div id="sres"></div>';
  showSheet(); $('cl').onclick=()=>close_();
  const go=()=>doSearch($('qi').value);
  $('qg').onclick=go; $('qi').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});
  $('sres').addEventListener('click',e=>{const b=e.target.closest('button[data-p]'); if(!b) return; const q=$('sres').dataset.q, pp=+b.dataset.p; close_(()=>render(pp,q))});
  $('qi').focus();
}
$('sb').onclick=openSearch;
$('back').onclick=()=>{ if(shOpen) close_(); else closeDrawer(); };
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(shOpen) return close_(); return closeDrawer(); }
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  if(e.key==='ArrowLeft') render(cur+1); else if(e.key==='ArrowRight') render(cur-1);
  if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('hl')){e.preventDefault();e.target.click()}
});
$('txt').addEventListener('click',e=>{const el=e.target.closest('.w.hl.k'); if(el&&$('leaf').classList.contains('on')) open_(+el.dataset.c,el)});
$('nx').onclick=()=>render(cur+1); $('pv').onclick=()=>render(cur-1);
$('pg').addEventListener('change',()=>render(+$('pg').value||1));
$('mn').onclick=()=>showDrawer(); $('dclose').onclick=()=>closeDrawer();
$('dsurahs').addEventListener('click',e=>{const b=e.target.closest('button[data-p]'); if(!b) return; const pp=+b.dataset.p; closeDrawer(()=>render(pp))});
let ex=null,ey=0,edge=false;
document.addEventListener('touchstart',e=>{const t=e.touches[0]; ex=t.clientX; ey=t.clientY; edge=(innerWidth-ex)<=26&&!drOpen&&!shOpen},{passive:true});
document.addEventListener('touchend',e=>{
  if(ex===null) return; const t=e.changedTouches[0], dx=t.clientX-ex, dy=t.clientY-ey, ed=edge; ex=null;
  if(Math.abs(dy)>Math.abs(dx)) return;
  if(ed&&dx<-50) showDrawer(); else if(drOpen&&dx>60) closeDrawer();
},{passive:true});
$('tg').onclick=()=>{const on=!$('leaf').classList.contains('on'); $('leaf').classList.toggle('on',on); $('tg').classList.toggle('on',on); $('tg').setAttribute('aria-pressed',on)};
let x0=null;
$('leaf').addEventListener('touchstart',e=>{x0=(innerWidth-e.touches[0].clientX)<=26?null:e.touches[0].clientX},{passive:true});
$('leaf').addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>70)render(dx>0?cur+1:cur-1)},{passive:true});
window.addEventListener('hashchange',()=>{const m=/^#p-(\d+)$/.exec(location.hash); if(m&&+m[1]!==cur) render(+m[1])});
try{ if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(()=>{}) }catch(e){}
function start(){
  buildDrawer();
  let p=1;const m=/^#p-(\d+)$/.exec(location.hash);
  if(m) p=+m[1]; else try{p=+localStorage.getItem('mushaf-page')||1}catch(e){}
  render(p);
}
Promise.all([fetch('data/pages.json').then(r=>r.json()),fetch(CFG.data).then(r=>r.json())])
 .then(([a,b])=>{ D=Object.assign({},a,b); $('txt').innerHTML=''; start(); })
 .catch(()=>{ $('txt').innerHTML='<p class="ld">تعذّر تحميل المصحف. تحقّق من الاتصال ثم أعد فتح الصفحة.</p>' });
