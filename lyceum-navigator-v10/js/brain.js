// Розумний шар Гоші: російська→українська, виправлення помилок, контекст, порівняння, відстані.
(function(){const LN=window.LN,M=LN.M;
const RU={выход:'вихід',выхода:'вихід',выходе:'вихід',лестница:'сходи',лестницу:'сходи',лестницы:'сходи',ближайший:'найближчий',ближайшая:'найближчий',ближайшую:'найближчий',ближайшие:'найближчі',как:'як',дойти:'дійти',добраться:'добратися',уборная:'туалет',туалеты:'туалет',кабинет:'кабінет',возле:'біля',рядом:'поруч',около:'біля',от:'від',из:'з',где:'де',что:'що',можешь:'можеш',умеешь:'вмієш',этаж:'поверх',пожар:'пожежа',следующий:'наступний',расписание:'розклад',помоги:'допоможи',привет:'привіт',спасибо:'дякую',шутку:'жарт',анекдот:'жарт',сколько:'скільки',идти:'йти',дальше:'далі',обратно:'назад',куда:'куди',сейчас:'зараз',ближе:'ближче',быстрее:'швидше',сравни:'порівняй',сканируй:'скануй',сканер:'сканер',тут:'тут',здесь:'тут'};
const VOC='туалет санвузол вбиральня вихід сходи спортзал найближчий найближчі маршрут розклад поверх корпус кабінет привіт дякую допоможи пожежа евакуація дійти пройти скільки далеко поруч порівняй ближче швидше назад наступний сканер'.split(' ');
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
const D=l=>'≈'+Math.round(l*.9)+' м, ~'+Math.max(1,Math.round(l*.9/80))+' хв пішки';
LN.brain={
fix(q){return String(q).replace(/[а-яіїєґё']+/gi,w=>{const l=w.toLowerCase();if(RU[l])return RU[l];if(l.length<5||VOC.includes(l))return w;const lim=l.length>7?2:1;let b=null,bd=9;
 for(const v of VOC){if(v[0]!==l[0]||Math.abs(v.length-l.length)>lim)continue;const d=lev(l,v);if(d<bd){bd=d;b=v}}return b&&bd<=lim?b:w})},
try(t,L,G){if(LN.staff&&LN.staff.ask(t,G))return true;const has=G.has,me=G.me(),E=id=>G.ent(id),len=(a,b)=>{const r=LN.route(a,b);return r?r.len:null},lr=G.last();
 if(has(t,'що вмієш','вмієш','функці',' help ')){G.say('Я вмію більше, ніж раніше:\n• маршрут: «від 1-01 до 2-05» (можна й російською)\n• «що ближче: 1-03 чи 2-05?»\n• «скільки йти до 3-04»\n• «що поруч», «де я»\n• «а тепер до 2-05», «назад»\n• найближчий туалет, вихід, сходи, спортзал\n• розумію помилки в словах\n• «скануй» — сканер QR-табличок\n• рахую: «2+2*3», «15% від 240», «x^2-5x+6=0», «5 км в м»\n• знаю шкільні теми, безпеку, пораду по навчанню\n• «запам’ятай: X = Y» — вчуся нового',null,'happy');return true}
 if(L.length>=2&&/ближче|швидше|порівняй/.test(t)){if(!me){G.say('Щоб порівняти, скажи, де ти: «я біля 1-03».',['Я біля Сходи 2']);return true}
  const A=L[0].ent,B=L[1].ent,a=len(me,A.id),b=len(me,B.id);if(a==null||b==null){G.say('Не можу порівняти — до одного з місць немає проходу.');return true}
  const f=a<=b?[A,a,B,b]:[B,b,A,a];G.say(G.nm(f[0])+' ближче: '+D(f[1])+'. '+G.nm(f[2])+' — '+D(f[3])+'.',[{t:'Веди до '+G.nm(f[0]),f:()=>G.route(E(me),f[0])}],'think');return true}
 if(L.length&&has(t,'скільки йти','скільки хвилин','скільки метрів','скільки часу','далеко','скільки до')){const b=L[L.length-1].ent,a=L.length>1?L[0].ent:(me&&E(me));
  if(!a){G.say('Скажи, звідки ти: «я біля 1-03» — і я порахую.',['Я біля Сходи 2']);return true}const r=LN.route(a.id,b.id);if(!r){G.say('Прохід між цими місцями не знайдено.');return true}
  const fl=new Set(r.path.map(i=>M.nodes[i].f)).size;G.say(G.nm(a)+' → '+G.nm(b)+': '+D(r.len)+(fl>1?', з переходом між поверхами':'')+'. Це оцінка за демо-схемою.',[{t:'Прокласти маршрут',f:()=>G.route(a,b)},'Що ти вмієш?']);return true}
 if(has(t,'що поруч','що біля','що навколо','що поряд')){if(!me){G.say('Спершу скажи, де ти: «я біля 1-03».',['Я біля Сходи 2']);return true}
  const f=M.nodes[me].f,l=M.rooms.filter(r=>r.f===f&&r.id!==me).map(r=>({r,d:len(me,r.id)})).filter(x=>x.d!=null).sort((a,b)=>a.d-b.d).slice(0,5);
  G.say('Найближче до тебе: '+l.map(x=>(x.r.kind==='hall'?x.r.label:x.r.num)+' ('+Math.round(x.d*.9)+' м)').join(', ')+'.');return true}
 if(has(t,' де я ')&&!L.length){if(!me){G.say('Я ще не знаю, де ти. Скажи «я біля 1-03» або скануй QR-табличку 📷',['Скануй']);return true}const e=E(me);G.say('Ти біля «'+G.nm(e)+'» ('+LN.floorName(e.f)+').');LN.ui.select(e.id,true);return true}
 if(lr&&!L.length&&has(t,' назад','зворотн','навпаки')){G.route(lr.b,lr.a);return true}
 if(lr&&L.length===1&&has(t,'а тепер','а звідти','звідти','а потім')){G.route(lr.b,L[0].ent);return true}
 if(me&&L.length===1&&has(t,'а звідси','звідси до','звідси в')){G.route(E(me),L[0].ent);return true}
 if(has(t,'сканер','скануй','відскануй','зчитай')){const b=document.getElementById('scanBtn');G.say('Відкриваю камеру 📷 Наведи на QR-табличку.');b&&b.click();return true}
 return false},
fallback(t,G){if(LN.kb&&LN.kb.ask(t,G))return true;for(const x of t.split(/\s+/).filter(x=>x.length>=3&&!/^\d+$/.test(x))){const f=LN.find(x);if(f.ent){G.say('Схоже, ти про «'+G.nm(f.ent)+'». Показати чи прокласти маршрут?',[{t:'Показати',f:()=>LN.ui.select(f.ent.id,true)},{t:'Прокласти маршрут',f:()=>G.ask('як дійти до '+f.ent.keys[0])}]);return true}}return false}};
})();
