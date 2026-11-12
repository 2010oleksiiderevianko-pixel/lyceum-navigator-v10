// База вчителів і персоналу. Редагуйте масив STAFF: [ПІБ, посада, [що веде]].
(function(){const LN=window.LN,$=id=>document.getElementById(id);
const S=LN.STAFF=[
['Роман Сергій Іванович','Директор',['ІК Географія і суспільство','Курс за вибором «Географія ресурсів»']],
['Цьома Надія Іванівна','Заступник директора з навчальної роботи',[]],
['Федак-Поштак Наталія Володимирівна','Заступник директора з навчально-виховної роботи',[]],
['Чобаня Вікторія Валеріївна','Заступник директора з навчально-виховної роботи',[]],
['Чоповдя Ельвіра Павлівна','Заступник директора з навчально-виховної роботи',[]],
['Дутко Світлана Іванівна','Заступник директора з виховної роботи',[]],
['Гончарова Оксана Михайлівна','Класний керівник',['ІК Природничі науки']],
['Гецко Марина Іванівна','Практичний психолог',['Інтегрований курс соціальної і здоров’язбережувальної освітньої галузі','Навички життя і кар’єри']],
['Деметер Володимир Мирославович','Керівник гуртка, секції, студії',['Інформатика','Розумні плати: крок у світ електроніки та програмування']],
['Дрік Алла Леонідівна','Вчитель',['ІК «Історія та громадянська освіта»','ІК Мистецтво: історія світової художньої культури']],
['Козичко Костянтин Олександрович','Вчитель',['Мій бізнес-план']],
['Кравченко Олексій Олегович','Вчитель',['Штучний інтелект і суспільство','Технології']],
['Мокшайт Тетяна Михайлівна','Вчитель',['ІК «Література» (українська та зарубіжна літератури)']],
['Пузяк Світлана Степанівна','Вчитель',['Англійська мова','З іноземними мовами у світ подорожей']],
['Роля Тарас Петрович','Вчитель',['Фізична культура']],
['Семенюк Маріанна Василівна','Вчитель',['SMART-математика','Математика']],
['Сіденко Олександр Григорович','Вчитель',['Захист України']],
['Фаринич Кароліна Миколаївна','Керівник гуртка, секції, студії',['Хореографія']]];
const grp=s=>/Директор|Заступник/.test(s[1])?'Адміністрація':/гуртка/.test(s[1])?'Гуртки':/психолог/.test(s[1])?'Психолог':'Вчителі';
const RK='ln:troom',rooms=()=>{try{return JSON.parse(localStorage.getItem(RK))||{}}catch(e){return{}}},setRoom=(n,v)=>{const r=rooms();v?r[n]=v:delete r[n];try{localStorage.setItem(RK,JSON.stringify(r))}catch(e){}};
const hue=n=>[...n].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7)%360,ini=n=>n.split(' ').slice(0,2).map(x=>x[0]).join('');
const V=$('staffView');let q='',g='Усі';
function toRoom(v){$('qb').value=v;LN.ui.setView('nav');if($('qa').value)LN.ui.start();else $('qa').focus()}
function draw(){const l=S.filter(s=>(g==='Усі'||grp(s)===g)&&(!q||LN.norm(s[0]+' '+s[1]+' '+s[2].join(' ')).includes(LN.norm(q)))),box=$('sl'),R=rooms();box.innerHTML='';
 [...$('sg').children].forEach(b=>b.classList.toggle('on',b.textContent===g));$('sc').textContent='Показано: '+l.length+' з '+S.length;
 l.forEach((s,i)=>{const c=document.createElement('div'),h=hue(s[0]);c.className='sf';c.style.animationDelay=Math.min(i,12)*40+'ms';c.innerHTML='<i class="av"></i><div class="sb"><b></b><small></small><div class="tg"></div><div class="rm"></div></div>';
  const av=c.querySelector('.av');av.textContent=ini(s[0]);av.style.background='linear-gradient(135deg,hsl('+h+',75%,50%),hsl('+(h+50)+',75%,45%))';
  c.querySelector('b').textContent=s[0];c.querySelector('small').textContent=s[1];
  s[2].forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{q=t;$('sq').value=t;draw()};c.querySelector('.tg').appendChild(b)});
  const rm=c.querySelector('.rm'),btn=(t,f)=>{const b=document.createElement('button');b.className='ghost';b.textContent=t;b.onclick=f;rm.appendChild(b)},ed=()=>{const v=prompt('Кабінет для: '+s[0]+'\n(напр. 2-05; порожньо — прибрати)',R[s[0]]?R[s[0]].split(' · ')[0]:'');if(v===null)return;if(!v.trim()){setRoom(s[0],'');draw();return}const f=LN.find(v);if(f.err){alert(f.err);return}setRoom(s[0],f.ent.value);draw()};
  if(R[s[0]]){rm.append('📍 '+R[s[0]].split(' · ')[0]+' ');btn('🧭 Маршрут',()=>toRoom(R[s[0]]));btn('✎',ed)}else btn('📍 Вказати кабінет',ed);
  box.appendChild(c)});if(!l.length)box.textContent='Нікого не знайдено.'}
if(V){V.innerHTML='<h2>Вчителі та персонал</h2><p class="mu">Хто є хто в ліцеї і що веде. Кабінет можна вказати самостійно — тоді з’явиться кнопка маршруту (зберігається на цьому пристрої).</p><input id="sq" placeholder="Пошук: прізвище, посада, предмет" autocomplete="off"><div class="chips" id="sg"></div><div id="sl" class="stf"></div><p class="mu" id="sc"></p>';
 ['Усі','Адміністрація','Вчителі','Гуртки','Психолог'].forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>{g=x;draw()};$('sg').appendChild(b)});
 $('sq').oninput=e=>{q=e.target.value;draw()};draw()}
/* Гоша: «хто веде англійську», «хто такий Козичко», «хто директор» */
const STOP=new Set('хто|кто|вчитель|учитель|викладає|веде|який|яка|такий|така|мене|мені|нашого|нашої|ліцею|вчителі|вчителька'.split('|'));
const line=s=>{const r=rooms()[s[0]];return s[0]+' — '+s[1].toLowerCase()+(s[2].length?'. Веде: '+s[2].join('; '):'')+(r?'. Кабінет: '+r.split(' · ')[0]:'')};
LN.staff={ask(t,G){if(!/ хто | кто |вчител|учител|викладає|преподає|веде|директор|психолог|завуч|заступник|керівник|гурток|класний/.test(t))return false;
 const w=t.split(/\s+/).filter(x=>x.length>=4);let r=S.filter(s=>{const n=s[0].toLowerCase().split(' ')[0];return w.some(x=>x.startsWith(n.slice(0,Math.max(4,n.length-2))))});
 if(!r.length){if(/заступник|завуч/.test(t))r=S.filter(s=>/Заступник/.test(s[1]));else if(/директор/.test(t))r=S.filter(s=>s[1]==='Директор');else if(/психолог/.test(t))r=S.filter(s=>/психолог/.test(s[1]));else if(/класний/.test(t))r=S.filter(s=>/Класний/.test(s[1]));else if(/гурток|гуртка/.test(t))r=S.filter(s=>/гуртка/.test(s[1]));
  else{const k=w.filter(x=>!STOP.has(x)).map(x=>x.slice(0,5));if(!k.length)return false;const sc=S.map(s=>{const h=(s[1]+' '+s[2].join(' ')).toLowerCase();return[s,k.filter(x=>h.includes(x)).length]}).filter(x=>x[1]);const m=Math.max(0,...sc.map(x=>x[1]));r=sc.filter(x=>x[1]===m).map(x=>x[0])}}
 if(!r.length)return false;G.say(r.slice(0,5).map(line).join('\n\n'),[{t:'Відкрити «Вчителі»',f:()=>LN.ui.setView('staff')}],'point');return true}};
})();
