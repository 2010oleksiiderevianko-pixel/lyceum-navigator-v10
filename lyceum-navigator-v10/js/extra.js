// 10 нових функцій навігатора (не Гоша): пошук, клавіші, дзвінки, евакуація, популярне, резервна копія, контраст, авто-тема, PWA/офлайн, повний екран.
(function(){'use strict';const LN=window.LN,M=LN.M,$=id=>document.getElementById(id),Q=s=>document.querySelector(s);
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const nm=e=>e.value.split(' · ')[0],html=document.documentElement,top=Q('.top');

/* 3. Дзвінки й перерви: [початок, кінець]; у понеділок — 6 уроків (до 14:10) */
const BELLS=[['08:30','09:15'],['09:25','10:10'],['10:25','11:10'],['11:25','12:10'],['12:25','13:10'],['13:25','14:10'],['14:20','15:05']];
const mm=x=>+x.slice(0,2)*60+ +x.slice(3),lessons=d=>d===1?BELLS.slice(0,6):BELLS;
const clk=document.createElement('span');clk.id='clk';clk.className='wx';top.insertBefore(clk,top.firstChild);
function tick(){const n=new Date(),m=n.getHours()*60+n.getMinutes(),d=n.getDay();let s='🕒 '+n.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
 if(d>0&&d<6){const L=lessons(d);let done=true;for(let i=0;i<L.length;i++){const a=mm(L[i][0]),e=mm(L[i][1]);
  if(m>=a&&m<e){s+=' · урок '+(i+1)+': ще '+(e-m)+' хв (до '+L[i][1]+')';done=false;break}
  if(m<a){s+=(i?' · перерва: ще '+(a-m)+' хв до уроку '+(i+1):' · до першого уроку: '+(a-m)+' хв');done=false;break}}
  if(done&&m>=mm(L[L.length-1][1]))s+=' · уроки закінчились'}clk.textContent=s}
tick();setInterval(tick,20000);
LN.bellsText=()=>{const row=(L)=>L.map((x,i)=>(i+1)+' урок  '+x[0]+'–'+x[1]+(L[i+1]?'   (перерва '+(mm(L[i+1][0])-mm(x[1]))+' хв)':'')).join('\n');return 'Пн (6 уроків):\n'+row(lessons(1))+'\n\nВт–Пт (7 уроків):\n'+row(BELLS)};

/* 9. Офлайн-індикатор */
const net=document.createElement('span');net.className='wx off';net.textContent='📴 Офлайн — схема працює з кешу';top.insertBefore(net,top.firstChild);
const upNet=()=>{net.hidden=navigator.onLine};addEventListener('online',upNet);addEventListener('offline',upNet);upNet();

/* 4. Евакуація */
const ev=document.createElement('button');ev.id='evac';ev.className='ghost evac';ev.textContent='🚨 Евакуація — найближчий вихід';Q('.quick').appendChild(ev);
ev.onclick=()=>{const e=$('rmsg');let a=LN.find($('qa').value);if(a.err){const me=LS.get('ln:me'),x=me&&M.ents.find(z=>z.id===me);if(x)a={ent:x};else{e.textContent='Вкажіть «Звідки?» — де ви зараз.';e.className='rmsg err';$('qa').focus();return}}
 let b=null;Object.keys(M.nodes).filter(i=>M.nodes[i].type==='exit').forEach(i=>{const r=LN.route(a.ent.id,i);if(r&&(!b||r.len<b.len))b=r});
 if(!b){e.textContent='Вихід недосяжний за схемою. Дійте за офіційним планом евакуації, дзвоніть 101/112.';e.className='rmsg err';return}
 LN.ui.setView('nav');LN.ui.showPath(b.path);e.textContent='🚨 Найближчий вихід ≈'+Math.round(b.len*.9)+' м. Спокійно, без ліфтів. Пожежна — 101, єдиний — 112.';e.className='rmsg ok'};

/* 5. Популярні місця */
const pop=document.createElement('div');pop.id='pop';pop.className='recent';pop.hidden=true;$('recent').after(pop);
const cnt=()=>{try{return JSON.parse(LS.get('ln:pop'))||{}}catch(e){return{}}};
function bump(id){const c=cnt();c[id]=(c[id]||0)+1;LS.set('ln:pop',JSON.stringify(c));drawPop()}
function drawPop(){const c=cnt(),l=Object.keys(c).sort((a,b)=>c[b]-c[a]).slice(0,5).map(id=>M.ents.find(e=>e.id===id)).filter(Boolean);pop.hidden=!l.length;pop.innerHTML='<small>🔥 Часто шукаєте:</small> ';
 l.forEach(e=>{const b=document.createElement('button');b.textContent=nm(e);b.onclick=()=>{$('qb').value=e.value;$('qb').dispatchEvent(new Event('input'))};pop.appendChild(b)})}
const os=LN.ui.select;LN.ui.select=(id,x)=>{bump(id);return os(id,x)};
$('go').addEventListener('click',()=>{const f=LN.find($('qb').value);if(f.ent)bump(f.ent.id)});drawPop();

/* 1. Швидкий пошук (Ctrl+K або «/») */
const dlg=document.createElement('dialog');dlg.id='qs';dlg.innerHTML='<input id="qsIn" placeholder="Знайти кабінет або приміщення…" autocomplete="off"><div id="qsL"></div>';document.body.appendChild(dlg);
function qsDraw(){const v=$('qsIn').value.toLowerCase().trim(),l=M.ents.filter(e=>!v||e.value.toLowerCase().includes(v)).slice(0,8);$('qsL').innerHTML='';
 l.forEach(e=>{const b=document.createElement('button');b.className='ghost';b.textContent=nm(e)+' · '+LN.floorName(e.f);b.onclick=()=>{dlg.close();LN.ui.setView('map');LN.ui.select(e.id,true)};$('qsL').appendChild(b)})}
$('qsIn').oninput=qsDraw;dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
const openQs=()=>{$('qsIn').value='';qsDraw();dlg.showModal();$('qsIn').focus()};

/* 2. Гарячі клавіші */
const help=document.createElement('dialog');help.id='kh';help.innerHTML='<b>⌨ Гарячі клавіші</b><p>Ctrl+K або / — пошук<br>↑ / ↓ — поверх вище / нижче<br>T — тема · A — великий текст · C — контраст<br>F — повний екран схеми<br>? — ця довідка</p><button class="ghost" onclick="this.parentNode.close()">Закрити</button>';document.body.appendChild(help);
addEventListener('keydown',e=>{const t=e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(t)||e.altKey)return;const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();openQs();return}if(e.ctrlKey||e.metaKey)return;
 if(k==='/'){e.preventDefault();openQs()}else if(k==='?')help.showModal();else if(k==='arrowup'){e.preventDefault();$('fUp').click()}else if(k==='arrowdown'){e.preventDefault();$('fDown').click()}
 else if(k==='t')$('theme').click();else if(k==='a')$('aa').click();else if(k==='c')$('hcT').click();else if(k==='f')$('fsB').click()});

/* 10. Повний екран схеми */
const fs=document.createElement('button');fs.id='fsB';fs.className='ghost';fs.textContent='⛶ На весь екран';fs.title='F';$('bchips').parentNode.appendChild(fs);
fs.onclick=()=>{const m=$('mapCard');document.fullscreenElement?document.exitFullscreen():m.requestFullscreen&&m.requestFullscreen().catch(()=>{})};

/* Налаштування в «Інформація»: 7 контраст · 8 авто-тема · 6 резервна копія · PWA */
const st=document.createElement('div');st.innerHTML='<h2>Налаштування</h2><div class="stg"><button id="hcT" class="ghost" aria-pressed="false">◐ Високий контраст</button><button id="calm" class="ghost" aria-pressed="false">🐢 Менше анімацій</button><button id="autoT" class="ghost" aria-pressed="false">🌗 Авто-темна тема (20:00–07:00)</button><button id="pwa" class="ghost" hidden>📲 Встановити застосунок</button><button id="exp" class="ghost">💾 Зберегти налаштування у файл</button><label class="ghost imp">📂 Відновити з файлу<input id="imp" type="file" accept=".json" hidden></label><button id="kb" class="ghost">⌨ Гарячі клавіші</button></div>';$('infoView').appendChild(st);const bl=document.createElement('div');bl.innerHTML='<h2>🔔 Дзвінки та перерви</h2><pre class="bells"></pre>';bl.querySelector('pre').textContent=LN.bellsText();$('infoView').insertBefore(bl,st);
function tog(id,cls,key,on){const b=$(id),set=v=>{b.setAttribute('aria-pressed',v);if(cls)html.classList.toggle(cls,v);if(on)on(v)};set(LS.get(key)==='1');b.onclick=()=>{const v=b.getAttribute('aria-pressed')!=='true';LS.set(key,v?'1':'0');set(v)}}
tog('hcT','hc','ln:hc');tog('calm','calm','ln:calm');
const auto=()=>{if(LS.get('ln:auto')!=='1')return;const h=new Date().getHours(),d=h>=20||h<7;html.dataset.theme=d?'dark':'light';$('theme').setAttribute('aria-pressed',d)};
tog('autoT',null,'ln:auto',auto);setInterval(auto,60000);
$('exp').onclick=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('ln:'))o[k]=localStorage.getItem(k)}}catch(e){}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='navigator-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
$('imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const o=JSON.parse(t);Object.keys(o).forEach(k=>{if(k.startsWith('ln:'))LS.set(k,String(o[k]))});location.reload()}).catch(()=>alert('Файл не схожий на резервну копію навігатора.'))};
$('kb').onclick=()=>help.showModal();
let dp=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('pwa').hidden=false});$('pwa').onclick=()=>{if(dp){dp.prompt();dp=null;$('pwa').hidden=true}};

/* Розклад уроків */
const DAYS=['','Понеділок','Вівторок','Середа','Четвер','П’ятниця'];
const TT=[null,['Англійська мова','Математика','Штучний інтелект','Українська мова','Література','Інтегрований курс'],
['Історія','Українська мова','Математика','Природничі науки','Штучний інтелект','Природничі науки','Фізкультура'],
['Історія','Математика','STEM-математика','Математика','Інформатика','Природничі науки','Англійська мова'],
['Хореографія','Математика','Історія','Навички життя','Мистецтво: історія','Фізкультура','Природничі науки'],
['Англійська мова','Технології','Розумні плати','Інформатика','Інформатика','Література','Мій бізнес-план']];
LN.TT=TT;LN.DAYS=DAYS;
const dayText=d=>d<1||d>5?'У вихідні уроків немає 🎉':DAYS[d]+':\n'+TT[d].map((x,i)=>(i+1)+'. '+BELLS[i][0]+' — '+x).join('\n');
LN.ttDayText=dayText;
LN.ttNowText=()=>{const n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes();if(d<1||d>5)return 'Сьогодні вихідний — уроків немає.';
 for(let i=0;i<TT[d].length;i++){if(m>=mm(BELLS[i][0])&&m<mm(BELLS[i][1]))return 'Зараз урок '+(i+1)+': '+TT[d][i]+' (до '+BELLS[i][1]+').'+(TT[d][i+1]?' Далі: '+TT[d][i+1]+'.':' Це останній урок.');
  if(m<mm(BELLS[i][0]))return 'Зараз перерва. Наступний урок '+(i+1)+' о '+BELLS[i][0]+': '+TT[d][i]+'.'}return 'Уроки на сьогодні закінчились.'};
const tv=document.createElement('div');tv.id='ttw';tv.innerHTML='<h3>📚 Розклад уроків</h3><div class="dtabs"></div><div class="dl"></div>';
$('planView').insertBefore(tv,$('planView').children[1]);
let sd=new Date().getDay();if(sd<1||sd>5)sd=1;
function drawTT(){const tabs=tv.querySelector('.dtabs'),dl=tv.querySelector('.dl'),now=new Date(),td=now.getDay(),m=now.getHours()*60+now.getMinutes();tabs.innerHTML='';dl.innerHTML='';
 for(let d=1;d<=5;d++){const b=document.createElement('button');b.className='ghost'+(d===sd?' on':'')+(d===td?' today':'');b.textContent=DAYS[d].slice(0,2);b.title=DAYS[d];b.onclick=()=>{sd=d;drawTT()};tabs.appendChild(b)}
 TT[sd].forEach((x,i)=>{const r=document.createElement('div'),cur=sd===td&&m>=mm(BELLS[i][0])&&m<mm(BELLS[i][1]);r.className='lr'+(cur?' cur':'');r.innerHTML='<i></i><b></b><span></span>';r.children[0].textContent=i+1;r.children[1].textContent=x;r.children[2].textContent=BELLS[i][0]+'–'+BELLS[i][1];dl.appendChild(r)})}
drawTT();setInterval(drawTT,60000);
})();
