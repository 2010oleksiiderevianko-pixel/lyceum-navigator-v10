// Робочі QR (табличка «Ви тут», маршрути, QR сайту, PNG/SVG, сканер) + нові функції навігатора.
(function(){'use strict';const LN=window.LN,M=LN.M,$=id=>document.getElementById(id);
const tok=e=>{const r=M.rooms.find(x=>x.id===e.id);return r?r.num.replace(/В/g,'V').replace(/Г/g,'G').replace(/Е/g,'E'):e.id},nm=e=>e.value.split(' · ')[0];
function svgOf(t){const q=new window.QRCodeLib(-1,3);q.addData(t);q.make();const n=q.getModuleCount(),m=4;let d='';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+='M'+(c+m)+' '+(r+m)+'h1v1h-1z';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+2*m)+' '+(n+2*m)+'" shape-rendering="crispEdges" role="img" aria-label="QR-код"><rect width="100%" height="100%" fill="#fff"/><path d="'+d+'"/></svg>'}
const okUrl=u=>/^https?:\/\/([^\s/]+\.[^\s/]+|localhost|\d+\.\d+\.\d+\.\d+)/i.test(u);
function base(){let v=$('qBase').value.trim().replace(/#.*$/,'');if(v&&!/^https?:\/\//i.test(v)&&/^[\w-]+(\.[\w-]+)+/.test(v))v='https://'+v;return v}
const say=(t,ok)=>{const e=$('qMsg');e.textContent=t;e.className='rmsg '+(ok?'ok':'err')};
if(location.protocol==='file:')$('qHint').textContent='⚠️ Ви відкрили навігатор як файл — телефон такий QR не відкриє. Завантажте папку на хостинг (GitHub Pages, Netlify Drop, Cloudflare Pages), вставте адресу сайту нижче — і коди запрацюють. Локальна мережа (192.168…) працює лише в одному Wi-Fi.';
function dl(svg,name,k){const s=new XMLSerializer().serializeToString(svg).replace('<svg ','<svg width="1024" height="1024" '),fn='qr-'+name.replace(/[^\wа-яіїєґА-Я-]+/g,'_').slice(0,40);
 const save=(b,x)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn+'.'+x;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
 if(k==='svg')return save(new Blob([s],{type:'image/svg+xml'}),'svg');
 const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,1024,1024);x.imageSmoothingEnabled=false;x.drawImage(im,0,0,1024,1024);c.toBlob(b=>save(b,'png'))};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}
function deco(){document.querySelectorAll('#qOut .qrc').forEach(c=>{if(c.querySelector('.dlb'))return;const d=document.createElement('div');d.className='dlb';const nme=c.textContent.slice(0,40);
 [['svg','⬇ SVG'],['png','⬇ PNG']].forEach(([k,t])=>{const b=document.createElement('button');b.className='ghost';b.textContent=t;b.onclick=()=>dl(c.querySelector('svg'),nme,k);d.appendChild(b)});c.appendChild(d)})}
function card(url,a,b){const c=document.createElement('div');c.className='qrc';c.innerHTML=svgOf(url)+'<div class="cap"><div><b></b></div><small></small></div>';c.querySelector('b').textContent=a;c.querySelector('small').textContent=b;return c}
const vis=()=>{const m=$('qMode').value;$('qTo').parentElement.hidden=m!=='route';$('qFrom').parentElement.hidden=m==='site'};$('qMode').onchange=vis;vis();
const orig=$('qGo').onclick;
$('qGo').onclick=()=>{const m=$('qMode').value;if(m==='route'){orig();deco();return}
 const bs=base(),out=$('qOut');out.innerHTML='';$('qPrint').hidden=true;if(!okUrl(bs))return say('Вкажіть адресу сайту, де лежить навігатор (https://…). Без неї телефон нічого не відкриє.');
 try{localStorage.setItem('ln:base',bs)}catch(e){}
 if(m==='site')out.appendChild(card(bs,'🧭 Навігатор ліцею','Скануй камерою телефону'));
 else{const q=$('qFrom').value.trim();let l=M.ents;if(q){const f=LN.find(q);if(f.err)return say('«Де»: '+f.err);l=[f.ent]}
  l.forEach(e=>out.appendChild(card(bs+'#at='+encodeURIComponent(tok(e)),'📍 ВИ ТУТ: '+nm(e),LN.floorName(e.f)+' · скануй, щоб обрати, куди йти')))}
 deco();say('Створено QR-кодів: '+out.children.length+'. Скануйте стандартною камерою телефону.',1);$('qPrint').hidden=false};
/* сканер */
function handle(t){t=String(t).trim();const m=t.match(/#(?:at|a)=.*$/);if(m){try{history.replaceState(null,'',m[0]);LN.ui.fromHash()}catch(e){}return}
 const f=LN.find(t);if(f.ent){history.replaceState(null,'','#at='+encodeURIComponent(tok(f.ent)));LN.ui.fromHash();return}
 if(/^https?:\/\//i.test(t)&&confirm('Відкрити посилання?\n'+t))location.href=t}
async function scan(){const d=$('scanDlg'),v=$('scanVid'),m=$('scanMsg');m.textContent='';
 if(!('BarcodeDetector' in window)||!navigator.mediaDevices){alert('Цей браузер не вміє сканувати QR усередині сторінки. Наведіть на код звичайну камеру телефону — вона відкриє навігатор.');return}
 let st;try{st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){alert('Немає доступу до камери. Дозвольте її в налаштуваннях браузера.');return}
 let on=true;const stop=()=>{on=false;st.getTracks().forEach(t=>t.stop())};d.showModal();v.srcObject=st;await v.play().catch(()=>{});m.textContent='Наведіть камеру на QR-табличку…';
 d.addEventListener('close',stop,{once:true});const det=new BarcodeDetector({formats:['qr_code']});
 const tick=async()=>{if(!on)return;try{const r=await det.detect(v);if(r.length){stop();d.close();handle(r[0].rawValue);return}}catch(e){}requestAnimationFrame(tick)};tick()}
$('scanBtn').onclick=$('qScan').onclick=scan;$('scanX').onclick=()=>$('scanDlg').close();
/* санвузол, «наступний урок» */
$('nearWc').onclick=()=>{const a=LN.find($('qa').value),e=$('rmsg');if(a.err){e.textContent='«Звідки?»: '+a.err+'\nВкажіть, де ви, — і я знайду санвузол.';e.className='rmsg err';$('qa').focus();return}
 let b=null;LN.G.toilets().forEach(n=>{const r=LN.route(a.ent.id,n.id);if(r&&(!b||r.len<b.len))b=r});if(!b){e.textContent='Санвузол за схемою недосяжний.';e.className='rmsg err';return}
 LN.ui.showPath(b.path);e.textContent='🚻 Найближчий санвузол: ≈'+Math.round(b.len*.9)+' м. Демонстраційна схема.';e.className='rmsg ok'};
const bar=document.createElement('div');bar.className='nxt';bar.hidden=true;$('routeCard').insertBefore(bar,$('routeCard').children[1]);
function upd(){const n=LN.ui.nextLesson().next;bar.hidden=!n;if(!n)return;bar.innerHTML='<span>⏰ Далі: <b></b></span><button class="go">Іти →</button>';bar.querySelector('b').textContent=n.t+' · '+n.r.split(' · ')[0];bar.querySelector('button').onclick=()=>$('ttGo').click()}
setInterval(upd,30000);upd();document.addEventListener('visibilitychange',upd);$('ttAdd').addEventListener('click',()=>setTimeout(upd,50));
})();
/* розумніший навігатор: маршрут через зупинку + автопідстановка «Ви тут» */
(function(){const LN=window.LN,M=LN.M,$=id=>document.getElementById(id),st=$('go').onclick;
$('go').onclick=()=>{const v=$('qv').value.trim();if(!v)return st();const a=LN.find($('qa').value),b=LN.find($('qb').value),c=LN.find(v),e=$('rmsg');
 if(a.err||b.err||c.err){e.textContent=[a.err&&'«Звідки?»: '+a.err,c.err&&'«Через»: '+c.err,b.err&&'«Куди?»: '+b.err].filter(Boolean).join('\n');e.className='rmsg err';return}
 const r1=LN.route(a.ent.id,c.ent.id),r2=LN.route(c.ent.id,b.ent.id);if(!r1||!r2){e.textContent='Через цю зупинку маршрут побудувати неможливо.';e.className='rmsg err';return}
 LN.ui.showPath([...r1.path,...r2.path.slice(1)]);const L=r1.len+r2.len;e.textContent='Через «'+c.ent.value.split(' · ')[0]+'»: ≈'+Math.round(L*.9)+' м · ~'+Math.max(1,Math.round(L*.9/80))+' хв пішки.';e.className='rmsg ok'};
try{const me=localStorage.getItem('ln:me'),x=me&&M.ents.find(z=>z.id===me);if(x&&!$('qa').value)$('qa').value=x.value}catch(e){}
})();
