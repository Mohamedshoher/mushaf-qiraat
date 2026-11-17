
const VER=((document.currentScript&&document.currentScript.src.match(/[?&]v=(\d+)/))||[])[1]||'';
let D=null; const CFG=window.MUSHAF||{kind:'sughra',data:'data/sughra.json'};
const $=id=>document.getElementById(id);
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const red=s=>esc(s).replace(/\u0005(\w\w)(\w)/g,'<span class="u $2" data-t="$1">').replace(/\u0007/g,'</span>').replace(/(\u06DD[\u0660-\u0669]+)/g,'<span class="ayn">$1</span>').replace(/\u0001/g,'<span class="r">').replace(/[\u0002\u0004]/g,'</span>').replace(/\u0003/g,'<span class="gh">');
const MKS='[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u08D3-\\u08FF]';
const RE_GH=new RegExp('^(\\u0001?)([\u0644\u0631])('+MKS+'*)');
function ghn(prev,w){
  if(!prev) return w;
  const m=w.match(RE_GH); if(!m||m[3].indexOf('\u0651')<0) return w;
  let p=prev.replace(/[\u0001-\u0004]/g,'').replace(/[\u06D6-\u06DC\u06DE\u06E9\u06DD\u0660-\u0669\s]+$/,'');
  if(!p) return w;
  const cl=p.match(new RegExp('(.)('+MKS+'*)$')); if(!cl) return w;
  let ok=false;
  if(cl[1]==='\u0646'&&cl[2].indexOf('\u06E1')<0&&cl[2].indexOf('\u0652')<0) ok=true;
  else if(/[\u08F0-\u08F2\u064B-\u064D]/.test(cl[2])) ok=true;
  else if(/[\u0627\u0649]/.test(cl[1])&&cl[2]===''){ const q=p.slice(0,-1).match(new RegExp('(.)('+MKS+'*)$')); if(q&&/[\u08F0-\u08F2\u064B-\u064D]/.test(q[2])) ok=true; }
  if(!ok) return w;
  return m[1]+'\u0003'+m[2]+m[3]+'\u0004'+w.slice(m[0].length);
}
function prevWordOf(p,li){
  const L=D.pages[p-1]; if(li>0){ const l=L[li-1]; if(l[0]==='j'||l[0]==='c'){ const a=l[2].split(' '); return a[a.length-1]; } return ''; }
  if(p>1){ const l=D.pages[p-2]; const x=l[l.length-1]; if(x&&x[0]==='j'){ const a=x[2].split(' '); return a[a.length-1]; } }
  return '';
}
function plain(n){return n.replace(/ٱ/g,'ا').replace(/ا\u0653/g,'آ').replace(/(^|\s)ال(?=[\u064B-\u0652]*\u0653)/g,'$1آل').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/ٱ/g,'ا').replace(/(^|\s)ءا/g,'$1آ')}
let cur=1;
let VIEW=0; try{ VIEW=+localStorage.getItem('mushaf-view')||0 }catch(e){}
if(![0,2,3].includes(VIEW)) VIEW=0;
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{try{fitLines()}catch(e){}});
function fitLines(){
  document.querySelectorAll('#txt .ln.j, #txt .ln.lg').forEach(e=>{if(e.dataset.b)e.style.fontSize=e.dataset.b+'cqw';const o=e.scrollWidth,w=e.clientWidth;if(o>w+1){e.style.fontSize=(parseFloat(e.style.fontSize)*w/o*0.995).toFixed(2)+'cqw'}});
  const g={};
  document.querySelectorAll('#txt .ln.lg[data-g]').forEach(e=>{ const f=parseFloat(e.style.fontSize); if(!(g[e.dataset.g]<=f)) g[e.dataset.g]=f });
  document.querySelectorAll('#txt .ln.lg[data-g]').forEach(e=>{ const f=g[e.dataset.g]; e.style.fontSize=f+'cqw'; e.style.lineHeight=e.style.height=(f*2.05).toFixed(2)+'cqw' });
}
function splitBal(parts,n){
  const wt=parts.map(w=>(w.replace(/[\u0001-\u0004\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').length||1)+0.5);
  const N=parts.length; if(n>N) n=N; if(n<=1) return [[0,N]];
  const pre=[0]; wt.forEach(x=>pre.push(pre[pre.length-1]+x));
  const sum=(a,b)=>pre[b]-pre[a];
  let best=null,bs=1e9;
  const rec=(cuts,start)=>{
    if(cuts.length===n-1){ const b=[0,...cuts,N]; let mx=0,mn=1e9; for(let i=0;i<n;i++){const x=sum(b[i],b[i+1]); mx=Math.max(mx,x); mn=Math.min(mn,x)} const sc=mx*1000+(mx-mn); if(sc<bs){bs=sc;best=b} return }
    for(let c=start;c<=N-(n-1-cuts.length);c++) rec([...cuts,c],c+1);
  };
  rec([],1);
  return best.slice(0,-1).map((x,i)=>[x,best[i+1]]);
}
function lineHTML(t,size,text,p,li,mk){
  const hm=D.hl[p]||{}; mk=mk||{};
  const parts=text.split(' ');
  const wsA=parts.map((w0,wi)=>{
    const w=(t==='j'&&CFG.kind==='kubra')?ghn(wi>0?parts[wi-1]:prevWordOf(p,li),w0):w0;
    const wu=usulWrap(w,wi+1<parts.length?parts[wi+1]:nextWordOf(p,li));
    const c=hm[li+':'+wi];
    const f=mk[li+':'+wi]?' fd':'';
    const di=' data-i="'+li+':'+wi+'"';
    const pl=()=>'<span class="q"'+di+'>'+(f?'<span class="fd">'+red(wu)+'</span>':red(wu))+'</span>';
    if(c===undefined) return pl();
    if(CFG.kind==='kubra'&&!srcShow(c)) return pl();
    if(c>=0&&D.com[c]&&D.com[c].so&&!(rivOn()&&RIW===D.com[c].so)) return pl();
    return '<span class="w hl'+f+(c>=0?' k':'')+rvCls(c)+'"'+di+(c>=0?' tabindex="0" role="button" data-c="'+c+'"':'')+'>'+red(wu)+'</span>';
  });
  const ws=wsA.join(' ');
  if(t==='h') return '<div class="ln h" style="font-size:5.7cqw"><span class="in">'+esc(plain(text.replace(/[\u0001\u0002]/g,'')))+'</span></div>';
  if(VIEW&&t==='j'){
    const sp=splitBal(parts,VIEW), f=(20.5/398*100*VIEW*0.97).toFixed(2);
    return '<div class="lgrp">'+sp.map(([a,b])=>'<div class="ln j lg" data-g="'+li+'" data-b="'+f+'" style="font-size:'+f+'cqw;line-height:'+(f*2.05).toFixed(2)+'cqw;height:'+(f*2.05).toFixed(2)+'cqw">'+wsA.slice(a,b).join(' ')+'</div>').join('')+'</div>';
  }
  if(VIEW&&t!=='h'){
    const f=(size/398*100*1.5).toFixed(2);
    return '<div class="lgrp"><div class="ln '+t+' lg" data-g="'+li+'" data-b="'+f+'" style="font-size:'+f+'cqw;line-height:'+(f*2.05).toFixed(2)+'cqw;height:'+(f*2.05).toFixed(2)+'cqw">'+ws+'</div></div>';
  }
  const fs=(t==='j'?20.5:size)/398*100,fs2=fs.toFixed(2);
  return '<div class="ln '+t+'" style="font-size:'+fs2+'cqw" data-b="'+fs2+'">'+ws+'</div>';
}
function render(p,q){
  p=Math.max(1,Math.min(604,p|0)); cur=p;
  const mk=q?findIn(p,q).marks:null;
  $('txt').innerHTML=D.pages[p-1].map((l,i)=>lineHTML(l[0],l[1],l[2],p,i,mk)).join('');
  $('txt').classList.toggle('rwm',rivOn());
  document.body.classList.toggle('lgv',!!VIEW);
  fitLines();
  $('pg').value=p;
  try{localStorage.setItem('mushaf-page',String(p))}catch(e){}
  try{ if(location.hash!=='#p-'+p){ try{history.replaceState(history.state,'','#p-'+p)}catch(e2){location.hash='p-'+p} } }catch(e){}
  window.scrollTo({top:0}); try{ qClear() }catch(e){}
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
function srcLine(m){
  if(CFG.kind!=='kubra') return '';
  const s=[];
  if(m.r&&!m.hd) s.push('تحبير التيسير');
  if(m.hd) s.push('الهادي لمحيسن');
  if(m.zh) s.push('زيادة من منحة مولى البر');
  if(m.tj) s.push('التوجيه: ابن زنجلة');
  return s.length?'<p class="srcl">المصدر: '+s.map(esc).join(' · ')+'</p>':'';
}

const SRCN={T:'تحبير التيسير',H:'الهادي لمحيسن',Z:'زيادات منحة مولى البر'};
let SRC={T:1,H:1,Z:1};
try{ const s=JSON.parse(localStorage.getItem('mushaf-src')||'null'); if(s&&typeof s==='object') SRC=Object.assign(SRC,s) }catch(e){}
function srcKeys(m){ const k=[]; if(!m) return k; if(m.hd) k.push('H'); else if(m.r) k.push('T'); if(m.zh) k.push('Z'); if(!k.length) k.push('T'); return k }
function srcShow(c){ if(c<0) return SRC.T&&SRC.H&&SRC.Z; return srcKeys(D.com[c]).some(k=>SRC[k]) }
function srcPanel(){
  const cnt={T:0,H:0,Z:0};
  Object.values(D.hl).forEach(pg=>Object.values(pg).forEach(c=>{ if(c>=0) srcKeys(D.com[c]).forEach(k=>cnt[k]++) }));
  const all=SRC.T&&SRC.H&&SRC.Z;
  $('srcpan').innerHTML='<div class="rvh"><b>اختر المصادر</b><button class="rvx">تم</button></div>'
   +'<button class="rvall'+(all?' cur':'')+'" data-a="1">الكل</button>'
   +Object.keys(SRCN).map(k=>'<label class="srcrow"><input type="checkbox" data-k="'+k+'"'+(SRC[k]?' checked':'')+'> <span>'+SRCN[k]+'</span> <small>'+cnt[k].toLocaleString('ar-EG')+' موضع</small></label>').join('')
   +'<p class="rvnote">يظهر التظليل للمصادر المحددة فقط؛ والكلمة التي لها أكثر من مصدر تظهر إن اختير أحدها.</p>';
  const ap=()=>{ try{localStorage.setItem('mushaf-src',JSON.stringify(SRC))}catch(e){}; render(cur); srcPanel() };
  $('srcpan').querySelector('.rvall').onclick=()=>{ SRC={T:1,H:1,Z:1}; ap() };
  $('srcpan').querySelectorAll('input[data-k]').forEach(x=>x.onchange=()=>{ SRC[x.dataset.k]=x.checked?1:0; if(!SRC.T&&!SRC.H&&!SRC.Z) SRC[x.dataset.k]=1; ap() });
  $('srcpan').querySelector('.rvx').onclick=closeSrc;
}
function openSrc(){ srcPanel(); $('srcpop').classList.add('o') }
function closeSrc(){ $('srcpop').classList.remove('o'); $('tg').focus() }
function open_(c,el){
  const m=D.com[c]; if(!m) return;
  let tail='';
  if(CFG.kind==='kubra'){
    if(m.tt||!(m.st||m.sx||m.dt||m.dx)){
      const tv=m.tt?verses(m.tt):'<p class="none">لا شاهد</p>';
      tail='<div class="sec"><h2>طيبة النشر'+(m.tn?' <span class="num">البيت '+esc(m.tn)+(m.tf?' — '+esc(m.tf):'')+'</span>':'')+'</h2>'+tv+'</div>';
    } else {
      const sh=m.st||m.sx, du=m.dt||m.dx;
      tail=(sh?'<div class="sec"><h2>الشاطبية'+((m.sn||m.sxn)?' <span class="num">البيت '+esc(m.sn||m.sxn)+'</span>':'')+'</h2>'+verses(sh)+(!m.st&&m.gq?'<p class="none">شاهد مُستكمَل يحتاج مراجعة</p>':'')+'</div>':'')
       +(du?'<div class="sec"><h2>الدرة'+((m.dn||m.dxn)?' <span class="num">البيت '+esc(m.dn||m.dxn)+'</span>':'')+'</h2>'+verses(du)+'</div>':'')
       +'<p class="none">لا بيت لها في طيبة النشر؛ الدليل من الشاطبية أو الدرة.</p>';
    }
  } else {
    const sh=m.st?verses(m.st):(m.sx?verses(m.sx)+(m.gq?'<p class="none">شاهد مُستكمَل يحتاج مراجعة</p>':''):'<p class="none">'+esc(m.ns||'لا شاهد')+'</p>');
    const du=m.dt?verses(m.dt):(m.dx?verses(m.dx)+(m.gq?'<p class="none">شاهد مُستكمَل يحتاج مراجعة</p>':''):'<p class="none">'+esc(m.nd||'لا شاهد')+'</p>');
    tail='<div class="sec"><h2>الشاطبية'+((m.sn||m.sxn)?' <span class="num">البيت '+esc(m.sn||m.sxn)+'</span>':'')+'</h2>'+sh+'</div>'
     +'<div class="sec"><h2>الدرة'+((m.dn||m.dxn)?' <span class="num">البيت '+esc(m.dn||m.dxn)+'</span>':'')+'</h2>'+du+'</div>';
  }
  let zth='';
  if(CFG.kind==='kubra'&&m.zh){
    const vv=(m.zq||[]).map(n=>D.mv&&D.mv[n]?'<div class="mv"><span class="num">'+AR(n)+'</span>'+esc(D.mv[n]).replace(' … ','<br>')+'</div>':'').join('');
    const hh=esc(m.zh).split('\n').map(x=>'<p class="mh">'+x.replace(/^([^:：]{1,60})[:：]/,'<b>$1</b>:')+'</p>').join('');
    zth='<div class="sec zs"><h2>زيادة النشر على الشاطبية والدرة <span class="num">منحة مولي البر'+(m.zb&&m.zb!=='فرش الحروف'?' — '+esc(m.zb):'')+'</span></h2>'+vv+'<div class="hs"><span class="hl2">الحاصل</span>'+hh+'</div></div>';
  }
  const tjh=m.tj?'<div class="sec"><h2>توجيه القراءة <span class="num">حجة القراءات لابن زنجلة'+(m.tp?' — ص '+esc(m.tp):'')+'</span></h2>'+(m.tjs&&m.tjs.length&&m.rs?'<div class="tjl">'+m.tjs.slice().sort((a,b)=>a.i-b.i).map(x=>{const r=m.rs[x.i-1];return '<div class="tji"><div class="tjw"><span class="tjn">'+(x.i).toLocaleString('ar-EG')+'</span>'+(r?esc(r.w):'')+(r&&r.who?' <span class="tjwho">'+esc(r.who)+'</span>':'')+'</div><p class="tj">'+esc(x.t)+'</p></div>'}).join('')+'</div>':'<p class="tj">'+esc(m.tj)+'</p>')+'</div>':'';
  $('sin').innerHTML='<div class="sh-top"><div class="sh-w">'+el.innerHTML+'</div><button id="cl" aria-label="إغلاق">إغلاق</button></div>'
   +srcLine(m)
   +rivCard(m)
   +(m.r||m.rs?'<div class="sec"><h2>القراءات'+(m.hd?' <span class=num>الهادي لمحيسن'+(m.hb?' — '+esc(m.hb):'')+'</span>':'')+'</h2>'+rdHTML(m)+'</div>':'')+(m.r||m.tt?tail:'')+zth+tjh;
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
const JUZ=[[1, 1, 1, 1], [2, 22, 2, 142], [3, 42, 2, 253], [4, 62, 3, 93], [5, 82, 4, 24], [6, 102, 4, 148], [7, 121, 5, 82], [8, 142, 6, 111], [9, 162, 7, 88], [10, 182, 8, 41], [11, 201, 9, 93], [12, 222, 11, 6], [13, 242, 12, 53], [14, 262, 15, 1], [15, 282, 17, 1], [16, 302, 18, 75], [17, 322, 21, 1], [18, 342, 23, 1], [19, 362, 25, 21], [20, 382, 27, 56], [21, 402, 29, 46], [22, 422, 33, 31], [23, 442, 36, 28], [24, 462, 39, 32], [25, 482, 41, 47], [26, 502, 46, 1], [27, 522, 51, 31], [28, 542, 58, 1], [29, 562, 67, 1], [30, 582, 78, 1]];
const NRM=s=>plain(String(s)).replace(/[ً-ٰٟۖ-ۭـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/^\s*سوره\s*/,'').trim();
function buildDrawer(){
  $('dsurahs').innerHTML=D.surahs.map((s,i)=>'<li data-q="'+esc(NRM(s[1])+' '+NRM('سورة '+s[1])+' '+s[0])+'"><button data-p="'+s[2]+'" data-i="'+i+'"><span class="n">'+AR(s[0])+'</span><span>'+esc(plain(s[1]).replace(/ي$/,'ى'))+'</span><small>ص '+AR(s[2])+'</small></button></li>').join('');
  $('djuz').innerHTML=JUZ.map(j=>{const s=D.surahs[j[2]-1];return '<li><button data-p="'+j[1]+'"><span>الجزء '+AR(j[0])+'<em>'+esc(plain(s?s[1]:'').replace(/ي$/,'ى'))+' '+AR(j[3])+'</em></span><small>ص '+AR(j[1])+'</small></button></li>'}).join('');
  const q=$('dq');
  q.addEventListener('input',()=>{const v=NRM(q.value);let n=0;document.querySelectorAll('#dsurahs li').forEach(li=>{const ok=!v||li.dataset.q.includes(v);li.hidden=!ok;if(ok)n++});$('dnone').hidden=n>0});
  const tab=t=>{const s=t==='S';$('tabS').setAttribute('aria-selected',s);$('tabJ').setAttribute('aria-selected',!s);$('paneS').hidden=!s;$('paneJ').hidden=s;try{localStorage.setItem('mushaf-dtab',t)}catch(e){};markDrawer()};
  $('tabS').onclick=()=>tab('S'); $('tabJ').onclick=()=>tab('J');
  let t0='S'; try{t0=localStorage.getItem('mushaf-dtab')||'S'}catch(e){}; tab(t0);
}
function surahIdx(p){let k=0;D.surahs.forEach((x,i)=>{if(x[2]<=p)k=i});return k}
function juzIdx(p){let k=0;JUZ.forEach((x,i)=>{if(x[1]<=p)k=i});return k}
function markDrawer(){
  const k=surahIdx(cur); document.querySelectorAll('#dsurahs button').forEach((b,i)=>b.classList.toggle('cur',i===k));
  const j=juzIdx(cur); document.querySelectorAll('#djuz button').forEach((b,i)=>b.classList.toggle('cur',i===j));
  document.querySelectorAll('.seg a').forEach(a=>{ a.classList.toggle('cur',a.dataset.k===CFG.kind); a.href=a.dataset.h+'#p-'+cur });
}
function showDrawer(){
  if(drOpen) return; drOpen=true; markDrawer();
  $('drawer').classList.add('o'); $('back').classList.add('o'); $('drawer').setAttribute('aria-hidden','false');
  try{history.pushState({dr:1},'')}catch(e){}
  const c=document.querySelector(($('paneJ').hidden?'#dsurahs':'#djuz')+' button.cur'); if(c) c.scrollIntoView({block:'center'});
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
$('txt').addEventListener('click',e=>{const el=e.target.closest('.w.hl.k'); if(el&&($('leaf').classList.contains('on')||rivOn())) open_(+el.dataset.c,el)});
$('nx').onclick=()=>render(cur+1); $('pv').onclick=()=>render(cur-1);
$('pg').addEventListener('change',()=>render(+$('pg').value||1));
$('mn').onclick=()=>showDrawer(); $('dclose').onclick=()=>closeDrawer();
$('drawer').addEventListener('click',e=>{const b=e.target.closest('button[data-p]'); if(!b) return; const pp=+b.dataset.p; closeDrawer(()=>render(pp))});
let ex=null,ey=0,edge=false;
document.addEventListener('touchstart',e=>{const t=e.touches[0]; ex=t.clientX; ey=t.clientY; edge=(innerWidth-ex)<=26&&!drOpen&&!shOpen},{passive:true});
document.addEventListener('touchend',e=>{
  if(ex===null) return; const t=e.changedTouches[0], dx=t.clientX-ex, dy=t.clientY-ey, ed=edge; ex=null;
  if(Math.abs(dy)>Math.abs(dx)) return;
  if(ed&&dx<-50) showDrawer(); else if(drOpen&&dx>60) closeDrawer();
},{passive:true});
if(CFG.kind==='kubra'){ $('leaf').classList.add('on'); $('tg').onclick=openSrc; } else
$('tg').onclick=()=>{const on=!$('leaf').classList.contains('on'); $('leaf').classList.toggle('on',on); $('tg').classList.toggle('on',on); $('tg').setAttribute('aria-pressed',on)};
let x0=null;
$('leaf').addEventListener('touchstart',e=>{x0=(innerWidth-e.touches[0].clientX)<=26?null:e.touches[0].clientX},{passive:true});
$('leaf').addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>70)render(dx>0?cur+1:cur-1)},{passive:true});
window.addEventListener('hashchange',()=>{const m=/^#p-(\d+)$/.exec(location.hash); if(m&&+m[1]!==cur) render(+m[1])});
try{ if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(()=>{}) }catch(e){}

const RW=['Q','W','B','QN','DA','S','H','DZ','SH','HF','KH','KD','AH','DK','IW','IJ','RW','RH','IS','ID'];
const RWN={Q:'قالون',W:'ورش',B:'البزي',QN:'قنبل',DA:'الدوري عن أبي عمرو',S:'السوسي',H:'هشام',DZ:'ابن ذكوان',SH:'شعبة',HF:'حفص',KH:'خلف عن حمزة',KD:'خلاد',AH:'أبو الحارث',DK:'الدوري عن الكسائي',IW:'ابن وردان',IJ:'ابن جماز',RW:'رويس',RH:'روح',IS:'إسحاق',ID:'إدريس'};
const IMAMS=[['نافع',['Q','W']],['ابن كثير',['B','QN']],['أبو عمرو',['DA','S']],['ابن عامر',['H','DZ']],['عاصم',['SH','HF']],['حمزة',['KH','KD']],['الكسائي',['AH','DK']],['أبو جعفر',['IW','IJ']],['يعقوب',['RW','RH']],['خلف العاشر',['IS','ID']]];
const RWS={DA:'الدوري',DK:'الدوري',KH:'خلف'}, RWB={DA:'دوري أبي عمرو',DK:'دوري الكسائي'};
const ASL={IW:['Q','W'],IJ:['Q','W'],RW:['DA','S'],RH:['DA','S'],IS:['KH','KD'],ID:['KH','KD']};
const ASLN={IW:'نافع',IJ:'نافع',RW:'أبي عمرو',RH:'أبي عمرو',IS:'حمزة',ID:'حمزة'};
let RIW='',RMODE='diff';
try{RIW=localStorage.getItem('mushaf-riw')||'';RMODE=localStorage.getItem('mushaf-rmode')||'diff'}catch(e){}

const USL_ON=true;
const USL_N={mt:'المد المتصل',mf:'المد المنفصل',mj:'صلة ميم الجمع'};
const USL_R={"Q": {"mt": {"v": "التوسط (٤ حركات)", "d": 0, "sn": "١٦٨", "st": "إِذَا أَلِفٌ أَوْ يَاؤُهَا بَعْدَ كَسْرَةٍ ... أَوِ الْوَاوُ عَنْ ضَمٍّ لَقِي الْهَمْزَ طُوِّلَا"}, "mf": {"v": "القصر أو التوسط", "d": 1, "sn": "١٦٩", "st": "فَإِنْ يَنْفَصِلْ فَالْقَصْرَ بَادِرْهُ طَالِباً ... بِخُلْفِهِماَ يُرْوِيكَ دَرًّا وَمُخْضَلَا"}, "mj": {"v": "وجهان: صلة الميم أو إسكانها", "d": 1, "sn": "١١١", "st": "وَصِلْ ضَمَّ مِيمِ الْجَمْعِ قَبْلَ مُحَرَّكٍ ... دِرَاكاً وَقاَلُونٌ بِتَخْيِيرِهِ جَلَا"}}};
const nextWordOf=(p,li)=>{ const L=D.pages[p-1]; let l=L[li+1]; if(!l&&p<604) l=D.pages[p][0]; if(!l||l[0]==='h') return ''; return l[2].split(' ')[0] };
function usulWrap(w,nx){
  if(!USL_ON||!rivOn()||!USL_R[RIW]) return w;
  const T=USL_R[RIW], K=/[\u0001-\u0004]/g;
  const isMark=c=>/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(c), isCtl=c=>/[\u0001-\u0004]/.test(c);
  const cl=[]; for(const c of w){ if(!isCtl(c)&&isMark(c)&&cl.length&&!isCtl(cl[cl.length-1][0])) cl[cl.length-1].push(c); else cl.push([c]); }
  const HZ=/[ءأإؤئ]/, MD=/[اآويى]/;
  const nxs=(nx||'').replace(K,''); const nb=nxs.replace(/^[\u064B-\u065F\u0670\u06D6-\u06ED]+/,'')[0]||'';
  const tag=new Array(cl.length).fill('');
  const idx=cl.map((c,i)=>isCtl(c[0])?-1:i).filter(i=>i>=0);
  idx.forEach((i,k)=>{
    const c=cl[i], s=c.join(''), b=c[0];
    if(!s.includes('\u0653')&&b!=='آ') return;
    if(!(MD.test(b)||/[\u0670\u06E5\u06E6]/.test(s))) return;
    // الحروف التالية في الكلمة (من غير الألف الساكنة الأخيرة)
    let rest=idx.slice(k+1).map(j=>cl[j]);
    const silent=r=>r.length===1&&r[0][0]==='ا';
    if(rest.length&&silent(rest[rest.length-1]) && rest.length===1) rest=[];
    if(rest.length){
      const r0=rest[0], rs=r0.join('');
      if(HZ.test(r0[0])||/[\u0654\u0655]/.test(rs)){ const first=(k===1&&/[\u0670]/.test(s)); tag[i]=first?'mf':'mt'; }
    } else if(HZ.test(nb)) tag[i]='mf';
  });
  // ميم الجمع
  const plain=w.replace(K,'');
  if(T.mj && /[هكت][\u064F\u0650]\u0645[\u0652\u06E1]$/.test(plain) && nb && nb!=='ٱ'){
    for(let k=idx.length-1;k>=0;k--){ if(cl[idx[k]][0]==='م'){ tag[idx[k]]='mj'; break } }
  }
  let out='';
  for(let i=0;i<cl.length;i++){
    const t=tag[i], c=cl[i];
    if(!t||!T[t]||c.some(isCtl)){ out+=c.join(''); continue }
    const op='\u0005'+t+(T[t].d?'d':'n');
    const nx2=cl[i+1];
    if(/[اآ]/.test(c[0])&&i>0&&cl[i-1][0]==='ل'&&!isCtl(cl[i-1][0])&&out.endsWith(cl[i-1].join(''))){ out=out.slice(0,out.length-cl[i-1].join('').length)+op+cl[i-1].join('')+c.join('')+'\u0007' }
    else out+=op+c.join('')+'\u0007';
  }
  return out;
}
$('txt').addEventListener('click',e=>{
  const el=e.target.closest('.u.d'); if(!el||!rivOn()) return;
  const t=el.dataset.t, T=(USL_R[RIW]||{})[t]; if(!T) return;
  $('sin').innerHTML='<div class="sh-top"><div class="sh-w">'+esc(USL_N[t])+'</div><button id="cl" aria-label="إغلاق">إغلاق</button></div>'
   +'<div class="sec"><h2>'+esc(RWN[RIW]||'')+' <span class="num">'+esc(USL_N[t])+'</span></h2><ul class="rd"><li>'+esc(T.v)+'</li></ul></div>'
   +'<div class="sec rvs"><h2>الشاطبية <span class="num">البيت '+esc(T.sn)+'</span></h2>'+verses(T.st)+'<p class="none">نموذج تجريبي: القيمة تحتاج مراجعتك.</p></div>';
  showSheet(); $('cl').onclick=()=>close_(); $('cl').focus();
});

const rivOn=()=>CFG.kind==='sughra'&&!!RIW;
const rbit=c=>1<<RW.indexOf(c);
function linesOf(m,code){ if(!m||!m.rv) return null; const b=rbit(code),L=[]; m.rv.forEach((x,j)=>{ if(x&b) L.push(j) }); return L }
const sameL=(a,b)=>!!a&&!!b&&a.length===b.length&&a.every((x,i)=>x===b[i]);
function rivDiff(m){ const a=linesOf(m,RIW); if(a===null) return true; return !sameL(a,linesOf(m,'HF')) }
function rvCls(c){
  if(!rivOn()||c<0) return '';
  const m=D.com[c]; if(!m||!m.rv) return '';
  const d=rivDiff(m);
  if(RMODE==='diff'&&RIW!=='HF') return d?' rv1':' rv0';
  return d?' rv1':'';
}
function sevenSame(m){ const f=linesOf(m,RW[0]); return RW.slice(1,14).every(r=>sameL(linesOf(m,r),f)) }
function rivShahid(m,L){
  if(m.so) return '<p class="none">مصدر هذا الوجه جداول توفيق ضمرة في رواية شعبة؛ شاهد الشاطبية لم يُضَف بعد.</p>';
  const i=RW.indexOf(RIW);
  const shat=(lab)=> (m.st||m.sx)?'<div class="rvs"><span class="num">'+lab+((m.sn||m.sxn)?' — البيت '+esc(m.sn||m.sxn):'')+'</span>'+verses(m.st||m.sx)+(!m.st&&m.gq?'<p class="none">شاهد مُستكمَل يحتاج مراجعة</p>':'')+'</div>':'';
  if(i<14){
    const s=shat('الشاطبية'); if(s) return s;
    if(sevenSame(m)) return '<p class="none">لم يختلف رواة الشاطبية في هذه الكلمة.</p>';
    return '<p class="none">شاهد الشاطبية لهذه الكلمة لم يُضَف بعد.</p>';
  }
  const A0=ASL[RIW];
  if(A0&&sameL(linesOf(m,A0[0]),linesOf(m,A0[1]))&&sameL(linesOf(m,A0[0]),L)){
    const s=shat('شاهد الأصل من الشاطبية');
    return '<p class="asl">سكتت عنه الدرة فهو على أصله: قرأ كقراءة '+ASLN[RIW]+'.</p>'+(s||(sevenSame(m)?'':'<p class="none">شاهد الشاطبية لهذه الكلمة لم يُضَف بعد.</p>'));
  }
  if(m.dt||m.dx) return '<div class="rvs"><span class="num">الدرة'+((m.dn||m.dxn)?' — البيت '+esc(m.dn||m.dxn):'')+'</span>'+verses(m.dt||m.dx)+(!m.dt&&m.gq?'<p class="none">شاهد مُستكمَل يحتاج مراجعة</p>':'')+'</div>';
  const A=ASL[RIW]; if(A&&A.some(a=>sameL(linesOf(m,a),L))){
    const s=shat('شاهد الأصل من الشاطبية');
    return '<p class="asl">سكتت عنه الدرة فهو على أصله: قرأ كقراءة '+ASLN[RIW]+'.</p>'+(s||(sevenSame(m)?'':'<p class="none">شاهد الشاطبية لهذه الكلمة لم يُضَف بعد.</p>'));
  }
  if(m.dz) return '<p class="none">لم يذكره ناظم الدرة نصاً، والمعتمد هنا نص المصحف الأصلي.</p>';
  return '<p class="none">شاهد الدرة لهذه الكلمة لم يُضَف بعد.</p>';
}
function rivCard(m){
  if(!rivOn()||!m.rv) return '';
  const L=linesOf(m,RIW), kh=m.rk&&(m.rk&rbit(RIW));
  let h='<div class="sec rv"><h2>رواية '+RWN[RIW]+(kh?' <span class="num">له وجهان</span>':'')+'</h2>';
  if(!L.length) h+='<p class="rd1">يقرأ هنا كما هو مرسوم في المصحف، لا خلاف له في هذه الكلمة.</p>';
  else h+=L.map(j=>'<div class="rvl">'+(L.length>1?'<span class="tjn">'+AR(j+1)+'</span>':'')+rdItem({w:m.rs[j].w,how:m.rs[j].how})+'</div>').join('');
  if(m.rc) h+='<p class="asl">يختلف حكمه بين الوصل والابتداء كما هو مبيَّن.</p>';
  h+=rivShahid(m,L);
  const T=(m.tjs||[]).filter(x=>L.includes(x.i-1));
  if(T.length) h+='<div class="rvt"><span class="num">توجيه قراءته — ابن زنجلة</span>'+T.map(x=>'<p class="tj">'+esc(x.t)+'</p>').join('')+'</div>';
  else if(L.length&&m.tj) h+='<p class="none">لم يذكر ابن زنجلة توجيهاً خاصاً بهذه القراءة.</p>';
  return h+'</div>';
}
function rvLabel(){ const l=$('rvlab'); if(!l) return; l.textContent=CFG.kind!=='sughra'?'قريباً':(RIW?(RWB[RIW]||RWN[RIW]):'بلا رواية'); $('rvbtn').classList.toggle('on',CFG.kind==='sughra'&&!!RIW) }
function rvPanel(){
  const p=$('rvpan');
  if(CFG.kind!=='sughra'){ p.innerHTML='<div class="rvh"><b>الرواية</b><button class="rvx">إغلاق</button></div><p class="rvnote">اختيار الرواية متاح الآن في مصحف العشر الصغرى، ويأتي في الكبرى بعد ضبط أوجه الطيبة.</p>'; return }
  p.innerHTML='<div class="rvh"><b>اختر الرواية</b><button class="rvx">إغلاق</button></div>'
   +'<button class="rvall'+(RIW?'':' cur')+'" data-r="">بلا رواية — كل مواضع الخلاف</button>'
   +IMAMS.map(([n,rs])=>'<div class="rvrow"><span>'+n+'</span>'+rs.map(r=>'<button data-r="'+r+'"'+(r===RIW?' class="cur"':'')+'>'+(RWS[r]||RWN[r])+'</button>').join('')+'</div>').join('')
   +((RIW&&RIW!=='HF')?'<div class="rvm"><b>التظليل</b><label><input type="radio" name="rvm" value="diff"'+(RMODE==='diff'?' checked':'')+'> مواضع مخالفة حفص فقط</label><label><input type="radio" name="rvm" value="all"'+(RMODE==='all'?' checked':'')+'> كل مواضع الخلاف</label></div>':'');
  p.querySelectorAll('input[name=rvm]').forEach(x=>x.onchange=()=>{ RMODE=x.value; try{localStorage.setItem('mushaf-rmode',RMODE)}catch(e){}; render(cur); closeRv() });
}
let rvOpen=false;
function openRv(){ rvPanel(); rvOpen=true; $('rvpop').classList.add('o'); const c=$('rvpan').querySelector('.cur'); if(c) c.focus() }
function closeRv(){ rvOpen=false; $('rvpop').classList.remove('o'); $('rvbtn').focus() }
function buildRiv(){
  rvLabel();
  $('rvbtn').onclick=openRv;
  $('rvpop').addEventListener('click',e=>{
    if(e.target===$('rvpop')||e.target.closest('.rvx')) return closeRv();
    const b=e.target.closest('button[data-r]'); if(!b) return;
    RIW=b.dataset.r; try{localStorage.setItem('mushaf-riw',RIW)}catch(e){}
    rvLabel(); render(cur);
    if(RIW&&RIW!=='HF') rvPanel(); else closeRv();
  });
  document.addEventListener('keydown',e=>{ if(rvOpen&&e.key==='Escape'){ e.stopPropagation(); closeRv() } },true);
}

function start(){
  buildDrawer(); buildRiv();
  let p=1;const m=/^#p-(\d+)$/.exec(location.hash);
  if(m) p=+m[1]; else try{p=+localStorage.getItem('mushaf-page')||1}catch(e){}
  render(p);
}
Promise.all([fetch('data/pages.json?v='+VER).then(r=>r.json()),fetch(CFG.data+'?v='+VER).then(r=>r.json())])
 .then(([a,b])=>{ D=Object.assign({},a,b); $('txt').innerHTML=''; start(); })
 .catch(()=>{ $('txt').innerHTML='<p class="ld">تعذّر تحميل المصحف. تحقّق من الاتصال ثم أعد فتح الصفحة.</p>' });

if($('srcpop')){ $('srcpop').addEventListener('click',e=>{ if(e.target===$('srcpop')) closeSrc() }); document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&$('srcpop').classList.contains('o')) closeSrc() }) }

/* اختيار طريقة العرض في القائمة الجانبية */
(function(){
  const dr=$('drawer'); if(!dr) return;
  const box=document.createElement('div'); box.className='vw'; box.innerHTML='<div class="dh3">طريقة العرض</div><div class="vws" role="group" aria-label="طريقة العرض"></div>';
  const dh=dr.querySelector('.dh'); dh.parentNode.insertBefore(box,dh.nextSibling);
  const opts=[[0,'صفحة المصحف'],[2,'كبير: سطران'],[3,'أكبر: ٣ أسطر']], g=box.querySelector('.vws');
  const mark=()=>g.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===VIEW)));
  opts.forEach(([v,t])=>{ const b=document.createElement('button'); b.type='button'; b.dataset.v=v; b.textContent=t; g.appendChild(b) });
  g.addEventListener('click',e=>{ const b=e.target.closest('button[data-v]'); if(!b) return; VIEW=+b.dataset.v; try{localStorage.setItem('mushaf-view',String(VIEW))}catch(e2){} mark(); closeDrawer(()=>render(cur)) });
  mark();
})();

/* تحديد كلمة أو أكثر والسؤال عنها في NotebookLM */
const ARD=t=>+t.replace(/[\u0660-\u0669]/g,c=>c.charCodeAt(0)-0x660);
function ayahOf(p,li,wi){
  const L=D.pages[p-1]; let hc=0; for(let i=0;i<li;i++) if(L[i][0]==='h') hc++;
  let sIdx; if(hc>0){ const st=D.surahs.filter(x=>x[2]===p); sIdx=st[hc-1]?st[hc-1][0]:null } else { let k=null; D.surahs.forEach(x=>{ if(x[2]<p) k=x[0] }); sIdx=k||1 }
  const scan=(txt,from)=>{ const t=txt.replace(/[\u0001-\u0004\u0005-\u0007]/g,'').split(' '); for(let j=from;j<t.length;j++){ const m=/\u06DD([\u0660-\u0669]+)/.exec(t[j]); if(m) return ARD(m[1]) } return null };
  let a=scan(L[li][2],wi+1);
  for(let i=li+1;a===null&&i<L.length;i++) if(L[i][0]!=='h') a=scan(L[i][2],0);
  for(let q=p+1;a===null&&q<=Math.min(604,p+3);q++){ for(const l of D.pages[q-1]){ if(l[0]==='h') continue; a=scan(l[2],0); if(a!==null) break } }
  return {s:sIdx,a:a};
}

let QS=null; // {a:العنصر الأول المضغوط, e:العنصر الأخير, els:[...]}
const QMAX=14;
const qAll=()=>[...document.querySelectorAll('#txt [data-i]')];
function qClear(){ document.querySelectorAll('#txt .qsel').forEach(x=>x.classList.remove('qsel')); QS=null; const b=$('qbar'); if(b) b.classList.remove('o') }
const BK={
  farida:'١) «فريدة الدهر في تأصيل وجمع القراءات» (رابطه على المكتبة الشاملة: https://shamela.ws/book/29909)',
  hadi:'«الهادي شرح طيبة النشر في القراءات العشر، والكشف عن علل القراءات وتوجيهها» للدكتور محمد سالم محيسن',
  budur:'«البدور الزاهرة في القراءات العشر المتواترة من طريقي الشاطبية والدرة» للشيخ عبد الفتاح بن عبد الغني القاضي'
};
const BOOKS={
  kubra:{mushaf:'مصحف القراءات العشر الكبرى (من طريق طيبة النشر)',books:[BK.farida.replace('١) ',''),BK.hadi]},
  sughra:{mushaf:'مصحف القراءات العشر الصغرى (من طريقي الشاطبية والدرة)',books:[BK.budur]}
};

/* روابط دفاتر NotebookLM: ضع الرابط بين علامتي التنصيص */
const NB={
  kubra:'',   // دفتر الكبرى (الفريدة + الهادي)
  sughra:''   // دفتر الصغرى (البدور الزاهرة)
};
function nbPrompt(q){
  const B=BOOKS[CFG.kind]||BOOKS.sughra, n=B.books.length, ph=q.n>1;
  const names=B.books.map(x=>x.replace(/\s*\(رابطه[^)]*\)/,'')).join(' ، ');
  return 'اعتمد على المصادر المرفوعة في هذا الدفتر وحدها ('+names+')، ولا تستعمل أي معلومة من خارجها.\n\n'
  +'ابحث عن '+(ph?'العبارة القرآنية («'+q.t+'») كجملة واحدة متصلة':'الكلمة القرآنية «'+q.t+'»')+' ('+q.p+')\n'
  +'موضعها: '+q.loc+' (صفحة '+q.pg+' من '+B.mushaf+').\n\n'
  +'أعطني الخلاصة'+(n>1?' مفصولة حسب كل كتاب':'')+':\n'
  +'١) مذاهب القرّاء: من قرأ بماذا (القراء أو الرواة، ومن قرأ بالوجه الآخر).\n'
  +'٢) الرواة والطرق وما فيه من خلاف أو تحرير، إن ذُكر.\n'
  +'٣) الشاهد (بيت الشاطبية أو الدرة أو الطيبة) إن وُجد.\n'
  +'٤) التوجيه إن ذُكر.\n'
  +'٥) النصوص المنقولة بحروفها بين علامتي تنصيص، مع اسم الكتاب ورقم الجزء والصفحة، وميّز المتن عن الحاشية.\n\n'
  +'إن لم تجد '+(ph?'العبارة':'الكلمة')+' أو الآية في المصادر فقل صراحة: «لم أجد في المصادر»، ولا تخمّن ولا تُكمل من عندك. '
  +(ph?'ابحث عن العبارة كلها وعمّا قيل في كلماتها مجتمعةً، ولا تفرّقها إلا إن ربط الكتاب بينها.':'لا تخلط هذا الموضع بالكلمة نفسها في سورة أخرى.');
}
function qRange(x,y){ const all=qAll(), i=all.indexOf(x), j=all.indexOf(y); if(i<0||j<0) return [x]; return all.slice(Math.min(i,j),Math.max(i,j)+1) }
function qSelect(el){
  const raw=e=>e.textContent.replace(/[\u0001-\u0007]/g,'').trim();
  if(!raw(el)||/۝/.test(raw(el))) return;
  let els;
  if(QS&&QS.a!==el){
    els=qRange(QS.a,el);
    if(els.filter(e=>!/۝/.test(raw(e))).length>QMAX){ qToast('الحدّ الأقصى '+QMAX+' كلمة'); return }
    QS.e=el;
  } else if(QS&&QS.a===el&&QS.els.length===1){ qClear(); return }
  else { qClear(); QS={a:el,e:el}; els=[el] }
  QS.els=els;
  document.querySelectorAll('#txt .qsel').forEach(x=>x.classList.remove('qsel'));
  els.forEach(e=>e.classList.add('qsel'));
  const words=els.filter(e=>!/۝/.test(raw(e)));
  const f=words[0], l=words[words.length-1];
  const pos=e=>{ const [li,wi]=e.dataset.i.split(':').map(Number); return ayahOf(cur,li,wi) };
  const A=pos(f), Z=pos(l), nm=x=>{const r=D.surahs.find(y=>y[0]===x.s); return r?plain(r[1]):'؟'};
  const loc=(A.s===Z.s&&A.a===Z.a)?'سورة '+nm(A)+'، الآية '+(A.a||'؟')
    :(A.s===Z.s)?'سورة '+nm(A)+'، الآيات '+(A.a||'؟')+' – '+(Z.a||'؟')
    :'من سورة '+nm(A)+' الآية '+(A.a||'؟')+' إلى سورة '+nm(Z)+' الآية '+(Z.a||'؟');
  const t=words.map(raw).join(' ');
  QS.q={t,p:plain(t),n:words.length,loc,pg:cur};
  let b=$('qbar');
  if(!b){ b=document.createElement('div'); b.id='qbar'; b.className='qbar'; b.setAttribute('role','dialog');
    b.innerHTML='<div class="qt"></div><div class="qb"><button id="qask" type="button">اسأل NotebookLM</button><button id="qcl" type="button" aria-label="إغلاق">✕</button></div>';
    document.body.appendChild(b);
    $('qcl').onclick=qClear;
    $('qask').onclick=()=>{ if(!QS||!QS.q) return; const txt=nbPrompt(QS.q), url=NB[CFG.kind]||'';
      const done=()=>qToast(url?'نُسخ السؤال — الصقه في الدفتر':'نُسخ السؤال، لكن رابط الدفتر لم يُضبط بعد');
      try{ navigator.clipboard.writeText(txt).then(done,()=>{ qFallback(txt); done() }) }catch(e){ qFallback(txt); done() }
      if(url) window.open(url,'_blank','noopener');
    };
  }
  b.querySelector('.qt').innerHTML='<b>«'+esc(t)+'»</b><br><span class="qs">'+esc(loc)+(QS.q.n===1?'':' — '+QS.q.n+' كلمات')+'</span>'+(QS.q.n===1?'<span class="qh">انقر كلمة أخرى لتوسيع التحديد</span>':'');
  b.classList.add('o');
}
function qFallback(txt){ const a=document.createElement('textarea'); a.value=txt; a.style.cssText='position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try{document.execCommand('copy')}catch(e){} a.remove() }
function qToast(m){ let t=$('qtoast'); if(!t){ t=document.createElement('div'); t.id='qtoast'; t.className='qtoast'; document.body.appendChild(t) } t.textContent=m; t.classList.add('o'); clearTimeout(qToast.h); qToast.h=setTimeout(()=>t.classList.remove('o'),3500) }
(function(){
  const tx=$('txt'); let timer=null,lp=false,sx=0,sy=0;
  tx.addEventListener('click',e=>{
    if(lp){ lp=false; e.stopPropagation(); e.preventDefault(); return }
    const w=e.target.closest('[data-i]'); if(!w) return;
    if(w.classList.contains('q')||QS){ e.stopPropagation(); e.preventDefault(); qSelect(w) }
  },true);
  tx.addEventListener('pointerdown',e=>{ const w=e.target.closest('[data-i]'); if(!w) return; sx=e.clientX; sy=e.clientY; clearTimeout(timer); timer=setTimeout(()=>{ lp=true; qSelect(w) },520) });
  const stop=()=>clearTimeout(timer);
  tx.addEventListener('pointerup',stop); tx.addEventListener('pointercancel',stop); tx.addEventListener('pointermove',e=>{ if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10) stop() });
  tx.addEventListener('contextmenu',e=>{ if(e.target.closest('[data-i]')) e.preventDefault() });
})();
