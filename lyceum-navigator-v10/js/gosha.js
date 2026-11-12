// Гоша — помічник-навігатор. Працює на правилах і схемі будівлі (без LLM та без мережі).
(function(){'use strict';const LN=window.LN,M=LN.M,U=LN.ui,$=id=>document.getElementById(id);
/* ---------- персонаж (SVG) ---------- */
const avatar=c=>'<svg class="g-svg '+(c||'')+'" viewBox="0 0 120 150" aria-hidden="true"><g class="g-body"><rect x="34" y="84" width="52" height="46" rx="16" fill="#13295c"/><rect x="46" y="96" width="28" height="18" rx="6" fill="#2563eb"/><circle cx="60" cy="105" r="4" fill="#60a5fa" class="g-led"/><rect x="42" y="128" width="12" height="16" rx="5" fill="#0a1a3d"/><rect x="66" y="128" width="12" height="16" rx="5" fill="#0a1a3d"/></g>'
+'<g class="g-armL"><rect x="14" y="86" width="22" height="11" rx="5.5" fill="#13295c"/><circle cx="14" cy="91" r="7" fill="#fcd9b8"/></g><g class="g-armR"><rect x="84" y="86" width="22" height="11" rx="5.5" fill="#13295c"/><circle cx="106" cy="91" r="7" fill="#fcd9b8"/></g>'
+'<g class="g-head"><line x1="60" y1="12" x2="60" y2="24" stroke="#13295c" stroke-width="3"/><circle cx="60" cy="10" r="5" fill="#f59e0b" class="g-ant"/><rect x="26" y="22" width="68" height="58" rx="22" fill="#eef4ff" stroke="#13295c" stroke-width="3"/><rect x="20" y="42" width="8" height="18" rx="4" fill="#2563eb"/><rect x="92" y="42" width="8" height="18" rx="4" fill="#2563eb"/>'
+'<g class="g-eye"><circle cx="46" cy="50" r="10" fill="#fff" stroke="#13295c" stroke-width="2"/><circle class="pup" cx="46" cy="50" r="5" fill="#0a1a3d"/><rect class="g-lid" x="35" y="39" width="22" height="22" fill="#eef4ff"/></g>'
+'<g class="g-eye"><circle cx="74" cy="50" r="10" fill="#fff" stroke="#13295c" stroke-width="2"/><circle class="pup" cx="74" cy="50" r="5" fill="#0a1a3d"/><rect class="g-lid" x="63" y="39" width="22" height="22" fill="#eef4ff"/></g>'
+'<circle cx="38" cy="66" r="4" fill="#fca5a5" opacity=".6"/><circle cx="82" cy="66" r="4" fill="#fca5a5" opacity=".6"/><path class="g-mouth" d="M50 67 Q60 76 70 67" fill="none" stroke="#13295c" stroke-width="3" stroke-linecap="round"/></g></svg>';
/* ---------- інтерфейс ---------- */
const root=document.createElement('div');root.innerHTML='<button id="gFab" class="g-fab" aria-label="Відкрити помічника Гошу">'+avatar('wave')+'<span class="g-tip" id="gTip">Привіт! Я Гоша 👋</span></button>'
+'<section id="gPanel" class="g-panel" hidden role="dialog" aria-label="Гоша — помічник"><header>'+avatar('mini')+'<div class="g-t"><b>Гоша</b><small id="gMe">без ШІ-моделей · працює офлайн</small></div><button id="gVoice" class="g-ib" title="Озвучення" aria-label="Озвучення">🔇</button><button id="gX" class="g-ib" aria-label="Закрити">✕</button></header><div id="gLog" aria-live="polite"></div><div id="gChips"></div>'
+'<form id="gForm" autocomplete="off"><button id="gMic" type="button" class="g-ib" title="Голосовий ввід" aria-label="Голосовий ввід">🎤</button><input id="gIn" placeholder="Напр.: як дійти до 2-05" aria-label="Запитай Гошу"><button class="g-send" aria-label="Надіслати">➤</button></form></section>';
document.body.appendChild(root);
const fab=$('gFab'),panel=$('gPanel'),log=$('gLog'),svgs=()=>document.querySelectorAll('.g-svg');
const sv=(k,on)=>svgs().forEach(s=>s.classList.toggle(k,on)),pulse=(k,ms)=>{sv(k,true);setTimeout(()=>sv(k,false),ms)};
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
let voice=LS.get('ln:voice')==='1',me=LS.get('ln:me'),pend=null,G=null,last=null;
const ent=id=>M.ents.find(e=>e.id===id),nm=e=>e.value.split(' · ')[0];
function updMe(){const e=me&&ent(me);$('gMe').textContent=e?'📍 Ти тут: '+nm(e)+' · '+LN.floorName(e.f):'без ШІ-моделей · працює офлайн';$('gVoice').textContent=voice?'🔊':'🔇'}
function speak(t){const ms=Math.min(6000,300+t.length*45);sv('talk',true);clearTimeout(speak.t);speak.t=setTimeout(()=>sv('talk',false),ms);
 if(!voice||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/[→↓📍🎉✅]/g,' '));u.lang='uk-UA';u.rate=1.05;speechSynthesis.speak(u)}catch(e){}}
function add(text,who,chips){const d=document.createElement('div');d.className='g-m '+who;d.textContent=text;log.appendChild(d);log.scrollTop=log.scrollHeight;
 const c=$('gChips');c.innerHTML='';(chips||[]).forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=x.t||x;b.onclick=()=>x.f?x.f():ask(x.t||x);c.appendChild(b)})}
function say(t,chips,mood){add(t,'bot',chips===undefined||chips===null?DEF:chips);speak(t);if(mood)pulse(mood,1800)}
const DEF=['Який наступний урок?','Де найближчий туалет?','Найближчий вихід','Що ти вмієш?','Пожежа — що робити?','Розкажи жарт'];
/* ---------- розбір запиту ---------- */
const T=s=>' '+String(s).toLowerCase().replace(/[’`ʼ]/g,"'").replace(/[^0-9а-яіїєґa-z'\-]+/g,' ')+' ';
const has=(t,...w)=>w.some(x=>t.includes(x));
function mentions(t){const out=[],re=/(?<![0-9a-zа-яіїєґ])([1-3]-?\d{2}|[вгеvge]-?\d{1,2})(?![0-9])/gi;let m;
 while((m=re.exec(t))){let x=m[1];if(/^[вгеvge]/i.test(x)){x=x[0]+'-'+x.replace(/\D/g,'').padStart(2,'0')}else if(!x.includes('-'))x=x[0]+'-'+x.slice(1);
  const f=LN.find(x);if(f.ent)out.push({ent:f.ent,pre:t.slice(Math.max(0,m.index-14),m.index)})}return out}
function named(t){if(t.includes('спортзал')){const r=LN.find('спортзал');if(r.ent)return r.ent}
 const m=t.match(/сход[иів]*\s*(\d)/);if(m){const l=M.ents.filter(e=>e.name==='Сходи '+m[1]);return l.find(e=>e.f===U.floor())||l[0]||null}return null}
const wheres=t=>{const L=mentions(t),n=named(t);if(n&&!L.length)L.push({ent:n,pre:''});return L};
/* ---------- дії ---------- */
function toiletTargets(){const r=[];LN.FLOORS.forEach(F=>M.geo[F.id].zones.filter(z=>z[4]==='Санвузол').forEach(z=>{const cx=z[0]+z[2]/2,cy=z[1]+z[3]/2;let b=null,bd=1e9;M.geo[F.id].ids.forEach(i=>{const n=M.nodes[i];if(n.type!=='pt')return;const d=Math.hypot(n.x-cx,n.y-cy);if(d<bd){bd=d;b=n}});if(b)r.push(b)}));return r}
function nearest(ids,label){if(!me){pend={nearest:ids,label};return say('Щоб знайти '+label+', мені треба знати, де ти. Напиши кабінет чи сходи, біля яких стоїш (напр. «я біля 1-03»).',['Я біля Сходи 2','Я біля 1-01'])}
 let best=null;ids.forEach(id=>{const r=LN.route(me,id);if(r&&(!best||r.len<best.len))best=r});
 if(!best)return say('Не бачу проходу до '+label+' з твого місця — схема не з’єднує корпуси.');
 const t=M.nodes[best.path[best.path.length-1]];if(!t.name)t.name='Біля санвузла';U.showPath(best.path);startGuide(best.path,'Знайшов '+label+': '+LN.floorName(t.f)+'.')}
function route(a,b){last={a,b};const r=LN.route(a.id,b.id);if(!r){return say(M.nodes[a.id].f.replace(/\d/g,'')!==M.nodes[b.id].f.replace(/\d/g,'')?'Між цими корпусами ще немає підтверджених переходів, тому маршрут не побудую.':'Не бачу проходу між цими приміщеннями.')}
 U.fill(a.value,b.value);U.start();startGuide(r.path,'Маршрут: '+nm(a)+' → '+nm(b)+'.')}
function startGuide(path,intro){const seg=LN.steps(path);G={i:-1,steps:seg.map((s,k)=>{const nx=seg[k+1],g=LN.guide(path,s),head=(s.i===s.j?'Сходи «'+M.nodes[path[s.i]].name+'»':'Йдемо: '+(M.nodes[path[s.i]].name||'коридор')+' → '+(M.nodes[path[s.j]].name||'коридор'))+' ('+LN.floorName(s.f)+')';
  return{f:s.f,t:[head,...g,nx?(LN.level(nx.f)>LN.level(s.f)?'Піднімайся':'Спускайся')+' на '+LN.level(nx.f)+' поверх.':'Ти на місці! 🎉'].join('\n')}})};
 say(intro+' Веду покроково — тисни «Далі».',[{t:'Далі ▶',f:next},{t:'Озвучити все',f:()=>speak(G.steps.map(s=>s.t).join('. '))},{t:'Поділитися',f:U.share}],'point')}
function next(){if(!G)return say('Спочатку попроси маршрут: «від 1-01 до 2-05».');G.i++;if(G.i>=G.steps.length){G=null;return say('Це був останній крок. Гарного дня! 😊',DEF,'happy')}
 const s=G.steps[G.i];U.show(s.f,false);U.setView('nav');const last=G.i===G.steps.length-1;add(s.t,'bot',last?['Дякую!',{t:'Новий маршрут',f:()=>say('Куди йдемо?')}]:[{t:'Далі ▶',f:next},{t:'Повтори',f:()=>{G.i--;next()}}]);speak(s.t.replace(/\n/g,'. '));pulse('point',2500);if(last)G.i=G.steps.length}
const JOKES=['— Чому калькулятор не ходить у кабінет історії? — Бо він боїться дат.','Учитель: «Хто спізнився — той вихід». Учень: «Вихід — на першому поверсі, дякую!»','Чому змінне взуття сумує? Бо його завжди залишають біля порога.','— Ти заблукав у ліцеї? — Ні, я просто ще шукаю найкоротший шлях на урок.'];
const SMALL=[[['привіт','вітаю','добрий день','доброго','hello',' hi ','здоров'],()=>say('Привіт! Я Гоша 🤖 Допоможу швидко знайти кабінет. Куди тобі треба?',DEF,'wave')],
[['дякую','спасибі','дяки','thanks'],()=>say('Завжди радий допомогти! 😊',DEF,'happy')],
[['бувай','до побачення','па-па','па па'],()=>say('Бувай! Заходь ще 👋',[],'wave')],
[['як справи','як ти','як життя'],()=>say('Працюю на повну! Антена блимає, схема в пам’яті. А ти куди прямуєш?',DEF,'happy')],
[['хто ти','як тебе звати','хто тебе','ти шi',' ти ші','ти ai','ти робот','нейромереж','chatgpt'],()=>say('Я Гоша — помічник-навігатор ліцею. Я не ШІ-модель: працюю за простими правилами та схемою будівлі, тому відповідаю лише на теми навігації та безпеки. Зате швидко і без інтернету!')],
[['вмієш','можеш','допомога','допоможи','help','функці','команди'],()=>say('Я вмію:\n• будувати маршрут: «від 1-01 до 2-05»\n• вести покроково («Далі»)\n• знаходити найближчий туалет, вихід, сходи\n• показувати кабінет: «де 3-04»\n• запам’ятати, де ти: «я біля 1-03»\n• розповісти про поверх чи корпус\n• що робити при пожежі\n• ділитися маршрутом, озвучувати, слухати голос 🎤')],
[['жарт','анекдот','смішне','розсміши'],()=>say(JOKES[Math.floor(Math.random()*JOKES.length)],['Ще жарт','Куди йти?'],'happy')],
[['котра','час'],t=>{if(!has(t,'котра година','скільки часу','який час'))return false;const d=new Date();say('Зараз '+d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'})+'.');return true}],
[['яке число','який день','яка дата','яке сьогодні'],()=>say('Сьогодні '+new Date().toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'.')],
[['розклад дзвінків','розклад уроків','розклад'],()=>say('Розкладу в мене немає — він не входить у схему. Запитай класного керівника або подивись на сайті ліцею. А от де кабінет — підкажу миттєво!')],
[['директор','вчитель','учитель','завуч','хто веде'],()=>say('Про людей я не знаю — у мене тільки схема приміщень. Номери кабінетів підкажу!')],
[['скільки кабінет','скільки приміщ'],()=>say('У демонстраційній схемі '+M.rooms.length+' приміщень у '+LN.BUILDINGS.length+' корпусах. Справжні номери ліцей ще має підтвердити.')],
[['корпус','корпуси'],t=>{const q=has(t,'які','скільки','перелік');if(!q)return false;say('Корпуси: '+LN.BUILDINGS.map(b=>b.name).join(', ')+'. Між корпусами переходи ще не підтверджені.');return true}],
[['пожеж','евакуац','вогонь','горить','тривога','небезпек'],()=>{say('Спокійно! За планом евакуації:\n1) Негайно повідом пожежну охорону — 101.\n2) Повідом чергового та адміністрацію.\n3) Залишай приміщення за планом евакуації — виходами, без ліфтів і без паніки.\nПоказати найближчий вихід?',[{t:'Найближчий вихід',f:()=>exitNear()},'Дякую'],'point')}],
[['поверх','поверс','корпус'],t=>{const m=t.match(/([1-3])\s*повер[а-яіїє]*/),b=t.match(/корпус[а-яіїє]*\s+(а\s?б|а|б|в|г|е)(?![а-яіїєґ])/);if(!m&&!b)return false;let B=b?({'а':'AB','б':'AB','а б':'AB',в:'V',г:'G',е:'E'})[b[1].replace(/\s+/g,' ')]:LN.floor(U.floor()).b;const F=LN.FLOORS.find(F=>F.b===B&&F.level===(m?+m[1]:1))||LN.FLOORS.find(F=>F.b===B);U.setView('map');U.show(F.id);const rs=M.rooms.filter(r=>r.f===F.id).map(r=>r.kind==='hall'?r.label:r.num);say(LN.floorName(F.id)+': '+rs.length+' приміщень ('+rs.slice(0,6).join(', ')+(rs.length>6?'…':'')+'). Показав на схемі.');return true}]];
function exitNear(){nearest(Object.keys(M.nodes).filter(i=>M.nodes[i].type==='exit'),'найближчий вихід')}
function setMe(e){me=e.id;LS.set('ln:me',me);updMe();say('Запам’ятав: ти біля «'+nm(e)+'» ('+LN.floorName(e.f)+'). Куди йдемо?',DEF,'happy');U.select(e.id)}
function ask(q){q=String(q).trim();if(!q)return;add(q,'me',[]);pulse('think',700);setTimeout(()=>reply(q),350)}
function reply(q){if(LN.kb&&(LN.kb.learn(q,LN.G)||LN.kb.math(q,LN.G)))return;if(LN.brain)q=LN.brain.fix(q);const t=T(q),L=wheres(t);
 if(pend&&L.length&&!has(t,' до ',' в ',' на ')){const p=pend;pend=null;me=L[0].ent.id;LS.set('ln:me',me);updMe();if(p.to)return route(L[0].ent,p.to);if(p.nearest)return nearest(p.nearest,p.label)}
 if(LN.brain&&LN.brain.try(t,L,LN.G))return;
 if(has(t,'наступний урок','наступна пара','мій розклад','куди мені далі','який урок','який наступний')){const n=U.nextLesson(),byV=v=>M.ents.find(e=>e.value===v);
  if(!n.next)return say(n.all.length?'Сьогодні уроків більше немає ✅':'Розкладу ще немає — додай уроки в розділі «Мій розклад» 📅',[{t:'Відкрити розклад',f:()=>U.setView('plan')}]);
  const to=byV(n.next.r),from=n.prev?byV(n.prev.r):(me&&ent(me));say('Наступний урок о '+n.next.t+' — '+nm(to)+'.',null,'point');
  if(from&&to&&from.id!==to.id)return route(from,to);if(to)pend={to};return say('Звідки ти йдеш? Напиши «я біля 1-03».',['Я біля Сходи 2'])}
 if(has(t,'далі','наступн','продовж')&&G)return next();
 if(has(t,'повтори')&&G){G.i=Math.max(-1,G.i-1);return next()}
 if(has(t,'я тут','я біля','я зараз','я стою','я знаходж','я у ',' я в ')&&L.length)return setMe(L[0].ent);
 if(has(t,'очист','скинь','скасуй','прибери маршрут')){U.clear();G=null;return say('Маршрут очищено.')}
 if(has(t,'поділ','посилання','лінк'))return U.share();
 if(has(t,'qr','кюар','кр-код'))return(U.setView('qr'),say('Відкрив розділ QR-кодів: введи адресу сайту, «Звідки» і «Куди» — і друкуй наклейки.'));
 if(has(t,'озвуч','голос')&&has(t,'увімк','включ','вкл')){voice=true;LS.set('ln:voice','1');updMe();return say('Озвучення увімкнено 🔊')}
 if(has(t,'мовчи','вимкни звук','вимкн'))  {voice=false;LS.set('ln:voice','0');updMe();try{speechSynthesis.cancel()}catch(e){}return say('Гаразд, мовчу 🤐')}
 if(has(t,'туалет','санвуз','вбиральн','wc',' вц ')){const ts=toiletTargets();return nearest(ts.map(n=>n.id),'найближчий санвузол')}
 if(has(t,'найближч','швидк')&&has(t,'вихід','вихід','вийти','вихода','вхід'))return exitNear();
 if(has(t,'найближч')&&has(t,'сходи','сходів'))return nearest(Object.keys(M.nodes).filter(i=>M.nodes[i].type==='stairs'),'найближчі сходи');
 if(L.length>=2){let a=L.find(x=>/(від|з|із|зі)\s*$/.test(x.pre)),b=L.find(x=>/(до|в|у|на)\s*$/.test(x.pre));a=a||L[0];b=b&&b!==a?b:L.find(x=>x!==a);return route(a.ent,b.ent)}
 if(L.length===1){const e=L[0].ent;if(has(t,'дійти','пройти','маршрут','як ','веди','проведи','добратис','потрапити','швидко')){if(me&&me!==e.id)return route(ent(me),e);pend={to:e};return say('Звідки ти йдеш? Напиши, біля чого стоїш (напр. «я біля 1-03»), або вибери:',[{t:'Вихід (захід)',f:()=>{const x=M.ents.find(z=>z.value.startsWith('Вихід (захід)'));me=x.id;LS.set('ln:me',me);updMe();const p=pend;pend=null;route(x,p.to)}},'Я біля Сходи 2'])}
  U.select(e.id);const r=M.rooms.find(x=>x.id===e.id);return say(nm(e)+' — '+LN.floorName(e.f)+(r&&r.note?'. '+r.note.replace(/\.+$/,''):'')+'. Показав на схемі. Прокласти маршрут?',[{t:'Прокласти маршрут',f:()=>ask('як дійти до '+e.keys[0])},'Що ти вмієш?'],'point')}
 for(const[k,f]of SMALL)if(has(t,...k)){const r=f(t);if(r!==false)return}
 if(LN.brain&&LN.brain.fallback(t,LN.G))return;say('Хм, не зовсім зрозумів 🤔 Я знаю тільки про навігацію ліцею. Спробуй: «від 1-01 до 2-05», «де 3-04», «2+2*3», або навчи мене: «запам’ятай: питання = відповідь».',DEF)}
/* ---------- події ---------- */
const open=()=>{panel.hidden=false;fab.classList.add('hide');$('gTip').hidden=true;if(!log.children.length){say('Привіт! Я Гоша 🤖 Допоможу швидко дістатися до потрібного кабінету. Куди тобі треба?',DEF,'wave')}$('gIn').focus()};
fab.onclick=open;$('gX').onclick=()=>{panel.hidden=true;fab.classList.remove('hide');try{speechSynthesis.cancel()}catch(e){}};
$('gForm').onsubmit=e=>{e.preventDefault();const v=$('gIn').value;$('gIn').value='';ask(v)};
$('gVoice').onclick=()=>{voice=!voice;LS.set('ln:voice',voice?'1':'0');updMe();if(!voice)try{speechSynthesis.cancel()}catch(e){}};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)$('gMic').hidden=true;else $('gMic').onclick=()=>{const r=new SR();r.lang='uk-UA';r.onstart=()=>$('gMic').classList.add('rec');r.onend=()=>$('gMic').classList.remove('rec');r.onresult=e=>ask(e.results[0][0].transcript);r.onerror=()=>say('Не вдалося почути. Спробуй ще або напиши текстом.');try{r.start()}catch(e){}};
document.addEventListener('mousemove',e=>{const R=fab.getBoundingClientRect(),dx=e.clientX-(R.left+R.width/2),dy=e.clientY-(R.top+R.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);document.querySelectorAll('.pup').forEach(p=>p.style.transform='translate('+dx/d*k+'px,'+dy/d*k+'px)')});
setInterval(()=>{if(document.hidden)return;const r=Math.random();pulse(r<.5?'wave':'fidget',2400)},9000);setTimeout(()=>{if(panel.hidden)pulse('wave',2600)},1200);setTimeout(()=>{if(panel.hidden)$('gTip').classList.add('show')},2500);setTimeout(()=>$('gTip').classList.remove('show'),9000);updMe();
LN.gosha={ask};LN.G={say,route,ask,has,ent,nm,wheres,me:()=>me,last:()=>last,toilets:toiletTargets,here:e=>{me=e.id;LS.set('ln:me',me);updMe()}};
})();
