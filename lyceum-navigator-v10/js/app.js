// Інтерфейс: меню, форма маршруту, поверхи, масштаб, фото планів, геолокація, інформація.
(function(){'use strict';const LN=window.LN,M=LN.M,$=id=>document.getElementById(id);
const S={view:'nav',f:'AB1',path:null,sel:null,vb:null};
const lab=n=>n.name||'коридор',TYPE={room:'Кабінет',hall:'Зал',exit:'Вихід',stairs:'Сходи'};
const bf=b=>LN.FLOORS.filter(F=>F.b===b).sort((a,c)=>a.level-c.level);
try{const s=JSON.parse(localStorage.getItem('ln:v3'));if(s&&LN.floor(s.f))S.f=s.f}catch(e){}
const save=()=>{try{localStorage.setItem('ln:v3',JSON.stringify({f:S.f}))}catch(e){}};
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

/* ---------- масштаб і переміщення схеми ---------- */
const svg=$('svg'),base=()=>svg._base||[0,0,100,100];
function applyVB(){const b=base();svg.setAttribute('viewBox',(S.vb||b).join(' '));svg.classList.toggle('zoomed',!!S.vb);$('zReset').disabled=!S.vb;$('zOut').disabled=!S.vb;$('zIn').disabled=!!S.vb&&S.vb[2]<=b[2]/10+1e-6}
function clampVB(v){const b=base();let w=Math.min(b[2],v[2]);if(w>=b[2]-1e-6)return null;
 w=Math.max(w,b[2]/10);const h=w*b[3]/b[2];
 return [Math.min(Math.max(v[0],b[0]),b[0]+b[2]-w),Math.min(Math.max(v[1],b[1]),b[1]+b[3]-h),w,h]}
function setVB(v){S.vb=clampVB(v);applyVB()}
/* плавний зум для кнопок і підгонки маршруту */
let tw=0;const RM=window.matchMedia('(prefers-reduced-motion:reduce)');
const rep=e=>{e.style.animation='none';void e.offsetWidth;e.style.animation=''};
function stopTween(){if(tw){cancelAnimationFrame(tw);tw=0;applyVB()}}
function tweenVB(v){stopTween();const to=clampVB(v),dest=to||base(),from=(svg.getAttribute('viewBox')||dest.join(' ')).split(/\s+/).map(Number);
 S.vb=to;applyVB();if(RM.matches||from.length<4||from.some(isNaN))return;
 const t0=performance.now(),D=520;
 const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/D)),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  svg.setAttribute('viewBox',from.map((a,i)=>a+(dest[i]-a)*e).join(' '));
  if(k<1)tw=requestAnimationFrame(f);else{tw=0;applyVB()}};
 tw=requestAnimationFrame(f)}
function zoomAt(k,cx,cy){const v=S.vb||base(),w=v[2]/k,r=w/v[2];setVB([cx-(cx-v[0])*r,cy-(cy-v[1])*r,w,v[3]*r])}
function toSvg(x,y){const pt=svg.createSVGPoint();pt.x=x;pt.y=y;return pt.matrixTransform(svg.getScreenCTM().inverse())}
function zoomCenter(k){const v=S.vb||base(),cx=v[0]+v[2]/2,cy=v[1]+v[3]/2,w=v[2]/k,r=w/v[2];tweenVB([cx-(cx-v[0])*r,cy-(cy-v[1])*r,w,v[3]*r])}
function fitRoute(){S.vb=null;if(!S.path)return;fitPts(S.path.map(i=>M.nodes[i]).filter(n=>n.f===S.f))}
function fitPts(pts){if(pts.length<2){tweenVB(base());return}
 const b=base(),xs=pts.map(n=>n.x),ys=pts.map(n=>n.y),pad=8,
  x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),
  w=Math.max(x1-x0+2*pad,(y1-y0+2*pad)*b[2]/b[3]);
 if(w>b[2]*.85){tweenVB(base());return}
 const h=w*b[3]/b[2];tweenVB([(x0+x1)/2-w/2,(y0+y1)/2-h/2,w,h])}
(function(){const ptrs=new Map();let drag=null,pinch=null,moved=false;
 svg.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();stopTween();const p=toSvg(e.clientX,e.clientY);zoomAt(e.deltaY<0?1.25:.8,p.x,p.y)},{passive:false});
 svg.addEventListener('pointerdown',e=>{stopTween();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};drag=null}
  else if(ptrs.size===1)drag={x:e.clientX,y:e.clientY,vb:S.vb&&S.vb.slice()}});
 svg.addEventListener('pointermove',e=>{const o=ptrs.get(e.pointerId);if(!o)return;o.x=e.clientX;o.y=e.clientY;
  if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch.d>0&&Math.abs(d-pinch.d)>1){const m=toSvg((a.x+b.x)/2,(a.y+b.y)/2);zoomAt(d/pinch.d,m.x,m.y);pinch.d=d;moved=true}return}
  if(drag&&drag.vb&&S.vb){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<5)return;
   if(!moved){moved=true;try{svg.setPointerCapture(e.pointerId)}catch(_){}svg.classList.add('drag')}
   const k=drag.vb[2]/svg.getBoundingClientRect().width;setVB([drag.vb[0]-dx*k,drag.vb[1]-dy*k,drag.vb[2],drag.vb[3]])}});
 const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size){drag=null;svg.classList.remove('drag')}else if(ptrs.size===1){const o=[...ptrs.values()][0];drag={x:o.x,y:o.y,vb:S.vb&&S.vb.slice()}}};
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
 svg.addEventListener('click',e=>{if(moved){moved=false;return}const id=e.target.dataset&&e.target.dataset.id;if(id)select(id)})})();

/* ---------- відображення ---------- */
const menu=document.querySelector('.menu'),pill=document.createElement('i');pill.className='pill nt';menu.insertBefore(pill,menu.firstChild);menu.classList.add('has-pill');
function movePill(instant){const b=menu.querySelector('button.on');if(!b)return;pill.classList.toggle('nt',!!instant);
 pill.style.width=b.offsetWidth+'px';pill.style.height=b.offsetHeight+'px';pill.style.transform='translate('+b.offsetLeft+'px,'+b.offsetTop+'px)';
 if(instant){void pill.offsetWidth;pill.classList.remove('nt')}}
let booted=false;
function setView(v){const changed=v!==S.view||!booted;S.view=v;document.querySelectorAll('.menu button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 $('routeCard').hidden=v!=='nav';$('mapCard').hidden=v==='info'||v==='qr'||v==='plan'||v==='staff';$('staffView').hidden=v!=='staff';$('planView').hidden=v!=='plan';if(v==='plan')renderPlan();$('infoView').hidden=v!=='info';$('qrView').hidden=v!=='qr';$('work').className='work '+v;if(v!=='nav'&&v!=='map')walkOff(true);movePill(!booted);booted=true;if(v==='nav'||v==='map')draw(false,changed)}
function draw(animate,enter,dir){stopTween();const F=LN.floor(S.f);LN.renderFloor(svg,S.f,{path:S.path,sel:S.sel,pos:S.pos,animate,enter,dir,vb:S.vb});applyVB();
 $('flab').textContent=LN.floorName(S.f);if(enter){rep($('flab'));rep(svg)}
 const L=bf(F.b),i=L.findIndex(x=>x.id===S.f);$('fDown').disabled=i<=0;$('fUp').disabled=i>=L.length-1;
 const bc=$('bchips');if(bc.children.length!==LN.BUILDINGS.length){bc.innerHTML='';LN.BUILDINGS.forEach(b=>{const e=document.createElement('button');e.textContent=b.name;e.dataset.b=b.id;e.onclick=()=>{if(b.id!==LN.floor(S.f).b)show(bf(b.id)[0].id)};bc.appendChild(e)})}
 [...bc.children].forEach(e=>e.classList.toggle('on',e.dataset.b===F.b))}
function show(f,animate){const o=LN.level(S.f),n=LN.level(f),ch=f!==S.f;S.f=f;S.vb=null;save();draw(animate,ch||!!animate,n>o?1:n<o?-1:0);if(S.path)fitRoute()}
function step(d){const L=bf(LN.floor(S.f).b),i=L.findIndex(x=>x.id===S.f)+d;if(L[i])show(L[i].id)}
function msg(t,c){const e=$('rmsg');e.textContent=t;e.className='rmsg '+(c||'');rep(e)}
function renderSteps(){const ol=$('steps');ol.innerHTML='';if(!S.path)return;const seg=LN.steps(S.path);
 seg.forEach((s,k)=>{const li=document.createElement('li'),nx=seg[k+1];li.innerHTML='<b></b><small></small>';
  li.firstChild.textContent=s.i===s.j?(k===0?'Початок: ':k===seg.length-1?'Кінець: ':'Проходьте сходами: ')+lab(s.from):lab(s.from)+' → '+lab(s.to);
  li.lastChild.textContent=LN.floorName(s.f)+(nx?' · '+(LN.level(nx.f)>LN.level(s.f)?'підніміться':'спуститесь')+' на '+LN.level(nx.f)+' поверх':'');
  const gd=LN.guide(S.path,s);if(gd.length){const ul=document.createElement('div');ul.className='how';gd.forEach(t=>{const l=document.createElement('div');l.textContent=t;ul.appendChild(l)});li.appendChild(ul)}
  li.style.setProperty('--i',Math.min(k,8));li.tabIndex=0;li.onclick=()=>show(s.f);li.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(s.f)}};ol.appendChild(li)})}
/* ---------- Покроковий режим ---------- */
let W=null;const wb=$('walkBar'),mobile=window.matchMedia('(max-width:900px)');
function walkOff(silent){if(W===null&&wb.hidden)return;W=null;wb.hidden=true;S.pos=null;document.querySelectorAll('.steps li.cur').forEach(l=>l.classList.remove('cur'));if(!silent&&S.path)draw()}
function walkGo(k){if(!S.path)return;const seg=LN.steps(S.path);k=Math.max(0,Math.min(seg.length-1,k));
 const first=W===null,s=seg[k],ch=S.f!==s.f,o=LN.level(S.f),n=LN.level(s.f);
 W=k;S.pos=s.from.id;S.sel=null;$('rinfo').hidden=true;if(ch){S.f=s.f;S.vb=null;save()}
 draw(false,ch,n>o?1:n<o?-1:0);
 const pts=S.path.slice(s.i,s.j+1).map(i=>M.nodes[i]);fitPts(pts.length<2?[pts[0],pts[0]]:pts);
 const li=$('steps').children[k];wb.hidden=false;
 $('wN').textContent='Крок '+(k+1)+' з '+seg.length;$('wT').textContent=li.children[0].textContent;
 const gd=[...li.querySelectorAll('.how div')].slice(0,2).map(d=>d.textContent).join(' · ');
 $('wS').textContent=li.children[1].textContent+(gd?' · '+gd:'');$('wP').style.width=((k+1)/seg.length*100)+'%';
 $('wNext').textContent=k===seg.length-1?'Готово ✓':'Далі ▶';$('wPrev').disabled=k===0;
 document.querySelectorAll('.steps li').forEach((l,j)=>l.classList.toggle('cur',j===k));
 if(mobile.matches){if(first)$('mapCard').scrollIntoView({behavior:'smooth',block:'start'})}else $('mapCard').scrollIntoView({block:'nearest',behavior:'smooth'})}
function walkNext(){if(W===null)return;if(W>=LN.steps(S.path).length-1){walkOff(true);msg('Ви на місці! 🎉 Маршрут завершено.','ok');draw()}else walkGo(W+1)}
/* ---------- Найближчий вихід / сходи ---------- */
function nearest(type){const a=LN.find($('qa').value);
 if(a.err){msg('«Звідки?»: '+a.err+'\nВкажіть, де ви зараз, — і я знайду найближче.','err');$('qa').focus();return}
 let best=null;Object.values(M.nodes).forEach(n=>{if(n.type!==type||n.id===a.ent.id)return;const r=LN.route(a.ent.id,n.id);if(r&&(!best||r.len<best.r.len))best={n,r}});
 const w=type==='exit'?'виходу':'сходів';
 if(!best){msg('Досяжного '+w+' за схемою не знайдено.','err');return}
 $('qb').value=M.ents.find(x=>x.id===best.n.id).value;start();
 msg((type==='exit'?'Найближчий вихід: ':'Найближчі сходи: ')+best.n.name+'.\nЦе демонстраційна схема, а не офіційний план евакуації.','ok')}
/* ---------- QR поточного маршруту ---------- */
function routeQR(){if(!S.path)return;const A=LN.find($('qa').value),B=LN.find($('qb').value);if(A.err||B.err)return;
 const typed=$('qBase').value.trim().replace(/#.*$/,''),base=/^https?:/.test(location.protocol)?location.href.split('#')[0]:typed,box=$('qrBox'),cap=$('qrCap'),d=$('qrDlg');
 if(!/^https?:\/\//i.test(base)){box.textContent='';cap.textContent='Щоб QR відкривався на телефоні, відкрийте навігатор за адресою https://… (або впишіть її в розділі «QR-коди»).'}
 else{box.innerHTML=qrSvg(base+'#a='+encodeURIComponent(tok(A.ent))+'&b='+encodeURIComponent(tok(B.ent)));cap.textContent=A.ent.value.split(' · ')[0]+' → '+B.ent.value.split(' · ')[0]}
 if(d.showModal)d.showModal();else d.setAttribute('open','')}
function start(){const a=LN.find($('qa').value),b=LN.find($('qb').value);walkOff(true);S.pos=null;S.path=null;renderSteps();['walk','qrRoute','share','copyTxt'].forEach(i=>$(i).hidden=true);
 if(a.err||b.err){msg([a.err&&'«Звідки?»: '+a.err,b.err&&'«Куди?»: '+b.err].filter(Boolean).join('\n'),'err');draw();return}
 if(a.ent.id===b.ent.id){msg('Початок і кінець збігаються.','err');draw();return}
 const r=LN.route(a.ent.id,b.ent.id);
 if(!r){const fa=LN.floor(M.nodes[a.ent.id].f).b,fb=LN.floor(M.nodes[b.ent.id].f).b;
  msg(fa!==fb?'Маршрут між корпусами неможливо побудувати: переходи між корпусами ще не підтверджені ліцеєм.':'Маршрут неможливо побудувати: між цими приміщеннями немає підтвердженого проходу.','err');draw();return}
 S.path=r.path;S.sel=null;$('rinfo').hidden=true;msg('≈'+Math.round(r.len*.9)+' м · ~'+Math.max(1,Math.round(r.len*.9/80))+' хв пішки. Маршрут за демонстраційною схемою — не підтверджений ліцеєм.','ok');renderSteps();$('share').hidden=false;$('copyTxt').hidden=false;$('walk').hidden=false;$('qrRoute').hidden=false;addRec(M.ents.find(e=>e.id===a.ent.id).value,M.ents.find(e=>e.id===b.ent.id).value);try{history.replaceState(null,'','#a='+encodeURIComponent($('qa').value)+'&b='+encodeURIComponent($('qb').value))}catch(e){}show(M.nodes[r.path[0]].f,true)}
function clear(){walkOff(true);S.pos=null;['walk','qrRoute'].forEach(i=>$(i).hidden=true);S.path=null;S.vb=null;msg('');renderSteps();$('share').hidden=true;$('copyTxt').hidden=true;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}draw()}
const RK='ln:recent',getRec=()=>{try{return JSON.parse(localStorage.getItem(RK))||[]}catch(e){return[]}};
function addRec(a,b){try{const l=getRec().filter(x=>!(x.a===a&&x.b===b));l.unshift({a,b});localStorage.setItem(RK,JSON.stringify(l.slice(0,4)))}catch(e){}renderRec()}
function renderRec(){const box=$('recent'),l=getRec().filter(x=>M.ents.some(e=>e.value===x.a)&&M.ents.some(e=>e.value===x.b));box.innerHTML='';box.hidden=!l.length;if(!l.length)return;
 const s=document.createElement('small');s.textContent='Недавні маршрути';box.appendChild(s);
 l.forEach(x=>{const b=document.createElement('button');b.textContent=x.a.replace('Кабінет ','')+' → '+x.b.replace('Кабінет ','');b.onclick=()=>{$('qa').value=x.a;$('qb').value=x.b;start()};box.appendChild(b)})}
function shareLink(){const u=location.href.split('#')[0]+'#a='+encodeURIComponent($('qa').value)+'&b='+encodeURIComponent($('qb').value),st=$('share');
 const ok=()=>{st.textContent='✓ Посилання скопійовано';setTimeout(()=>st.textContent='🔗 Скопіювати посилання на маршрут',2000)};
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(u).then(ok,()=>prompt('Скопіюйте посилання:',u));else prompt('Скопіюйте посилання:',u)}
function fromHash(){const at=location.hash.match(/^#at=(.+)$/);if(at){try{const t=decodeURIComponent(at[1]),e=M.ents.find(x=>x.id===t)||LN.find(t).ent;if(e){$('qa').value=e.value;try{localStorage.setItem('ln:me',e.id)}catch(_){}if(LN.G)LN.G.here(e);setView('nav');S.f=e.f;S.vb=null;save();select(e.id,true);msg('📍 Ви тут: '+e.value.split(' · ')[0]+'. Оберіть, куди йти.','ok');setTimeout(()=>$('qb').focus(),300)}}catch(_){}return}const m=location.hash.match(/^#a=([^&]*)&b=(.*)$/);if(!m)return;try{const rs=t=>{const e=M.ents.find(x=>x.id===t);return e?{ent:e}:LN.find(t)},A=rs(decodeURIComponent(m[1])),B=rs(decodeURIComponent(m[2]));$('qa').value=A.ent?A.ent.value:decodeURIComponent(m[1]);$('qb').value=B.ent?B.ent.value:decodeURIComponent(m[2]);setView('nav');start()}catch(e){}}
function copy(t,btn,label){const ok=()=>{btn.textContent='✓ Скопійовано';setTimeout(()=>btn.textContent=label,1800)};
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(ok,()=>prompt('Скопіюйте:',t));else prompt('Скопіюйте:',t)}
function routeText(){if(!S.path)return'';const seg=LN.steps(S.path);return 'Маршрут: '+$('qa').value+' → '+$('qb').value+'\n'+seg.map((s,k)=>(k+1)+') '+LN.floorName(s.f)+': '+[lab(s.from)+' → '+lab(s.to),...LN.guide(S.path,s)].join('; ')).join('\n')}
const FK='ln:fav',getFav=()=>{try{return JSON.parse(localStorage.getItem(FK))||[]}catch(e){return[]}};
function toggleFav(id){let l=getFav();l=l.includes(id)?l.filter(x=>x!==id):[id,...l];try{localStorage.setItem(FK,JSON.stringify(l.slice(0,8)))}catch(e){}renderFavs()}
function renderFavs(){const box=$('favs'),l=getFav().map(id=>M.ents.find(e=>e.id===id)).filter(Boolean);box.innerHTML='';box.hidden=!l.length;if(!l.length)return;
 const s=document.createElement('small');s.textContent='⭐ Мої місця (натисніть — «Куди?»)';box.appendChild(s);
 l.forEach(e=>{const b=document.createElement('button');b.textContent=e.value.split(' · ')[0];b.onclick=()=>{$('qb').value=e.value;if($('qa').value)start();else $('qa').focus()};box.appendChild(b)})}
/* ---------- Розклад ---------- */
const TT='ln:tt',getTT=()=>{try{return JSON.parse(localStorage.getItem(TT))||[]}catch(e){return[]}},saveTT=l=>{try{localStorage.setItem(TT,JSON.stringify(l))}catch(e){}},DAYS=['Щодня','Пн','Вт','Ср','Чт','Пт'];
function nextLesson(){const now=new Date(),t=('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2),l=getTT().filter(x=>x.d===0||x.d===now.getDay()).sort((a,b)=>a.t<b.t?-1:1);return{next:l.find(x=>x.t>t),prev:[...l].reverse().find(x=>x.t<=t),all:l}}
function renderPlan(){const box=$('ttList'),l=getTT().sort((a,b)=>a.d-b.d||(a.t<b.t?-1:1));box.innerHTML='';if(!l.length)box.textContent='Поки порожньо. Додайте уроки — і Гоша підкаже, куди йти далі.';
 l.forEach(x=>{const r=document.createElement('div');r.className='row tt';r.innerHTML='<b></b><small></small><button class="ghost" aria-label="Видалити">✕</button>';r.children[0].textContent=x.t+' · '+x.r.split(' · ')[0];r.children[1].textContent=DAYS[x.d];
  r.children[2].onclick=()=>{saveTT(getTT().filter(y=>!(y.d===x.d&&y.t===x.t&&y.r===x.r)));renderPlan()};box.appendChild(r)});
 const n=nextLesson();$('ttNext').textContent=n.next?'Наступний урок: '+n.next.t+' · '+n.next.r.split(' · ')[0]:(n.all.length?'На сьогодні уроки завершено ✅':'Розклад на сьогодні порожній');$('ttGo').hidden=!n.next}
/* ---------- QR-коди ---------- */
const tok=e=>{const r=M.rooms.find(x=>x.id===e.id);return r?r.num.replace(/В/g,'V').replace(/Г/g,'G').replace(/Е/g,'E'):e.id};
function qrSvg(t){const q=new window.QRCodeLib(-1,0);q.addData(t);q.make();const n=q.getModuleCount(),m=4;let d='';
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+='M'+(c+m)+' '+(r+m)+'h1v1h-1z';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+2*m)+' '+(n+2*m)+'" shape-rendering="crispEdges" role="img" aria-label="QR-код"><rect width="100%" height="100%" fill="#fff"/><path d="'+d+'"/></svg>'}
function genQR(){const box=$('qOut'),st=$('qMsg'),base=$('qBase').value.trim().replace(/#.*$/,'');box.innerHTML='';$('qPrint').hidden=true;
 if(!/^https?:\/\//i.test(base)){st.textContent='Вкажіть адресу сайту, за якою навігатор відкривається в інтернеті (починається з https://). Адреса file:// на телефонах не працює.';st.className='rmsg err';return}
 const A=LN.find($('qFrom').value);if(A.err){st.textContent='«Звідки?»: '+A.err;st.className='rmsg err';return}
 const t=$('qTo').value.trim();let list;
 if(t){const B=LN.find(t);if(B.err){st.textContent='«Куди?»: '+B.err;st.className='rmsg err';return}list=[B.ent]}
 else list=M.ents.filter(e=>M.rooms.some(r=>r.id===e.id));
 list=list.filter(e=>e.id!==A.ent.id);const ok=list.filter(e=>LN.route(A.ent.id,e.id)),skip=list.length-ok.length;
 if(!ok.length){st.textContent='Між цими точками немає маршруту (інший корпус або немає проходу).';st.className='rmsg err';return}
 try{localStorage.setItem('ln:base',base)}catch(e){}
 ok.forEach((B,qi)=>{const url=base+'#a='+encodeURIComponent(tok(A.ent))+'&b='+encodeURIComponent(tok(B)),c=document.createElement('div');c.className='qrc';c.style.setProperty('--i',Math.min(qi,20));
  c.innerHTML=qrSvg(url)+'<div class="cap"><div><b>Звідки:</b> <span class="f"></span><small class="ff"></small></div><div class="arrow">↓</div><div><b>Куди:</b> <span class="t"></span><small class="tf"></small></div></div>';
  c.querySelector('.f').textContent=A.ent.value.split(' · ')[0];c.querySelector('.ff').textContent=LN.floorName(A.ent.f);c.querySelector('.t').textContent=B.value.split(' · ')[0];c.querySelector('.tf').textContent=LN.floorName(B.f);box.appendChild(c)});
 st.textContent='Створено QR-кодів: '+ok.length+(skip?' (пропущено без маршруту: '+skip+')':'')+'.';st.className='rmsg ok';$('qPrint').hidden=false}
function select(id,en){S.sel=id;const n=M.nodes[id],r=M.rooms.find(x=>x.id===id),box=$('rinfo');
 box.hidden=false;box.innerHTML='<div><b></b><small></small><p></p></div><div class="acts"><button id="rFrom">Звідси</button><button id="rTo">Сюди</button><button id="rFav" aria-label="В обрані" title="В обрані"></button><button id="rX" class="ghost" aria-label="Закрити">✕</button></div>';$('rFav').textContent=getFav().includes(id)?'★':'☆';$('rFav').onclick=()=>{toggleFav(id);$('rFav').textContent=getFav().includes(id)?'★':'☆'};
 box.querySelector('b').textContent=n.name;
 box.querySelector('small').textContent=TYPE[r?r.kind:n.type]+' · '+LN.floorName(n.f)+' · ID: '+id;
 box.querySelector('p').textContent=(r&&r.note?r.note+' ':'')+'Статус: демонстраційні дані, не підтверджено.';
 const val=()=>M.ents.find(e=>e.id===id).value,toNav=()=>{setView('nav');$('routeCard').scrollIntoView({behavior:'smooth',block:'start'})};
 $('rFrom').onclick=()=>{$('qa').value=val();toNav()};$('rTo').onclick=()=>{$('qb').value=val();toNav()};$('rX').onclick=()=>{S.sel=null;box.hidden=true;draw()};rep(box);draw(false,en)}
function rooms(){const q=LN.norm($('flt').value),box=$('rooms');box.innerHTML='';
 const list=M.rooms.filter(r=>!q||LN.norm(r.name).includes(q)||LN.norm(r.num).includes(q));
 if(!list.length){box.textContent='Нічого не знайдено.';return}
 list.forEach(r=>{const b=document.createElement('button');b.className='row';b.innerHTML='<b></b><small></small>';b.firstChild.textContent=r.name;b.lastChild.textContent=LN.floorName(r.f);
  b.onclick=()=>{S.f=r.f;S.vb=null;save();setView('map');select(r.id,true)};box.appendChild(b)})}
function photos(){const F=LN.floor(S.f),box=$('photoBox'),d=$('photoDlg');box.innerHTML='';
 $('photoTtl').textContent='Фото плану евакуації · '+LN.floorName(S.f);
 (F.photos||[]).forEach(p=>{const im=new Image();im.src='photos/'+p+'.jpg';im.alt='Фото плану евакуації: '+LN.floorName(S.f);box.appendChild(im)});
 if(d.showModal)d.showModal();else d.setAttribute('open','')}

$('ls').innerHTML=M.ents.map(e=>'<option value="'+esc(e.value)+'">').join('');
$('open').innerHTML=LN.OPEN.map(t=>'<li>'+esc(t)+'</li>').join('');
document.querySelectorAll('.menu button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
$('go').onclick=start;$('clr').onclick=clear;$('flt').oninput=rooms;
$('swap').onclick=()=>{$('swap').classList.toggle('flip');const a=$('qa').value;$('qa').value=$('qb').value;$('qb').value=a;if(S.path)start()};
['qa','qb'].forEach(i=>$(i).addEventListener('keydown',e=>{if(e.key==='Enter')start()}));
$('fUp').onclick=()=>step(1);$('fDown').onclick=()=>step(-1);
$('zIn').onclick=()=>zoomCenter(1.5);$('zOut').onclick=()=>zoomCenter(1/1.5);$('zReset').onclick=()=>tweenVB(base());
const dlg=$('photoDlg');function closeDlg(d){if(!d.open||d.classList.contains('out'))return;if(RM.matches){d.close();return}d.classList.add('out');setTimeout(()=>{d.classList.remove('out');d.close()},250)}
$('photoBtn').onclick=photos;$('photoX').onclick=()=>closeDlg(dlg);
$('photoDlg').addEventListener('click',e=>{if(e.target===e.currentTarget)closeDlg(e.currentTarget)});
$('share').onclick=shareLink;$('copyTxt').onclick=()=>copy(routeText(),$('copyTxt'),'📋 Скопіювати кроки текстом');renderFavs();
$('ttAdd').onclick=()=>{const f=LN.find($('ttRoom').value),t=$('ttTime').value;if(f.err||!t){$('ttMsg').textContent=f.err||'Вкажіть час початку.';return}$('ttMsg').textContent='';saveTT([...getTT(),{d:+$('ttDay').value,t,r:f.ent.value}]);$('ttRoom').value='';renderPlan()};
$('ttGo').onclick=()=>{const n=nextLesson();if(!n.next)return;if(n.prev)$('qa').value=n.prev.r;$('qb').value=n.next.r;setView('nav');start()};
const big=()=>{const on=document.documentElement.classList.contains('big');$('aa').setAttribute('aria-pressed',on)};try{if(localStorage.getItem('ln:big')==='1')document.documentElement.classList.add('big')}catch(e){}big();
$('aa').onclick=()=>{const on=document.documentElement.classList.toggle('big');try{localStorage.setItem('ln:big',on?'1':'0')}catch(e){}big();movePill(true);setTimeout(()=>movePill(true),350)};
window.addEventListener('resize',()=>movePill(true));window.addEventListener('load',()=>movePill(true));
$('walk').onclick=()=>walkGo(0);$('wNext').onclick=walkNext;$('wPrev').onclick=()=>walkGo(W-1);$('wX').onclick=()=>walkOff();
document.addEventListener('keydown',e=>{if(W===null||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();walkNext()}else if(e.key==='ArrowLeft'){e.preventDefault();if(W>0)walkGo(W-1)}else if(e.key==='Escape')walkOff()});
$('nearExit').onclick=()=>nearest('exit');$('nearStairs').onclick=()=>nearest('stairs');$('qrRoute').onclick=routeQR;
$('qrX').onclick=()=>closeDlg($('qrDlg'));$('qrDlg').addEventListener('click',e=>{if(e.target===e.currentTarget)closeDlg(e.currentTarget)});
/* ---------- Тема ---------- */
const root=document.documentElement,TH=$('theme'),sysDark=window.matchMedia('(prefers-color-scheme:dark)'),getTh=()=>{try{return localStorage.getItem('ln:theme')}catch(e){return null}};
function applyTheme(t,anim){if(anim&&!RM.matches){root.classList.add('tx');setTimeout(()=>root.classList.remove('tx'),750)}root.dataset.theme=t;TH.textContent=t==='dark'?'☀️ Світла тема':'🌙 Темна тема';TH.setAttribute('aria-pressed',t==='dark');const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#060f26':'#0a1a3d'}
applyTheme(getTh()||(sysDark.matches?'dark':'light'));
TH.onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('ln:theme',t)}catch(e){}applyTheme(t,true)};
if(sysDark.addEventListener)sysDark.addEventListener('change',e=>{if(!getTh())applyTheme(e.matches?'dark':'light',true)});
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});$('qGo').onclick=genQR;$('qPrint').onclick=()=>window.print();try{$('qBase').value=localStorage.getItem('ln:base')||(/^https?:/.test(location.protocol)?location.origin+location.pathname:'')}catch(e){}
['qFrom','qTo'].forEach(i=>$(i).addEventListener('keydown',e=>{if(e.key==='Enter')genQR()}));renderRec();rooms();setView('nav');fromHash();window.addEventListener('hashchange',fromHash);
LN.ui={select,setView,show,start,clear,fill:(x,y)=>{$('qa').value=x;$('qb').value=y},
 showPath(p){walkOff(true);S.pos=null;S.path=p;S.sel=null;$('rinfo').hidden=true;setView('nav');renderSteps();msg('Маршрут від Гоші — за демонстраційною схемою, не підтверджено ліцеєм.','ok');$('share').hidden=true;$('walk').hidden=false;$('qrRoute').hidden=true;show(M.nodes[p[0]].f,true)},
 share:shareLink,floor:()=>S.f,nextLesson,fromHash};
})();
