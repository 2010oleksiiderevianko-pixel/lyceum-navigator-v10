// Модель будівлі, пошук приміщень і маршрутизація (Dijkstra).
(function(){const LN=window.LN;
const LAT={a:'а',b:'в',e:'е',o:'о',p:'р',c:'с',x:'х',k:'к',m:'м',h:'н',t:'т',i:'і',v:'в',g:'г'};
LN.norm=s=>String(s||'').toLowerCase().replace(/[a-z]/g,c=>LAT[c]||c).replace(/кабінет|аудиторія|кімната|каб\.?|ауд\.?/g,'').replace(/[^0-9а-яіїєґ]/g,'');
const FL=id=>LN.FLOORS.find(F=>F.id===id);
LN.floorName=id=>{const F=FL(id);return LN.BUILDINGS.find(b=>b.id===F.b).name+' · '+F.level+' поверх'};
function build(){
 const nodes={},adj={},rooms=[],ents=[],geo={};
 const link=(u,v,w)=>{(adj[u]=adj[u]||[]).push([v,w]);(adj[v]=adj[v]||[]).push([u,w])};
 LN.FLOORS.forEach(F=>{
  const g=geo[F.id]={paths:[],links:[],zones:F.zones||[],rooms:[],ids:[]},id=s=>F.id+':'+s;
  const add=(k,x,y,type,name)=>{const n={id:id(k),f:F.id,x,y,type,name:name||''};nodes[n.id]=n;g.ids.push(n.id);return n};
  const edge=(a,b,thick)=>{link(a,b,Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y));if(!thick)g.links.push([a,b])};
  const chain=ids=>ids.forEach((v,i)=>i&&edge(ids[i-1],v,true));
  const main=F.corr.map((p,i)=>add('c'+i,p[0],p[1],'pt').id);chain(main);g.paths.push(main);
  (F.branches||[]).forEach((b,k)=>{const ids=b.pts.map((p,j)=>add('b'+k+':'+j,p[0],p[1],'pt').id),from=id(b.from);edge(from,ids[0],true);chain(ids);g.paths.push([from,...ids])});
  Object.entries(F.exits||{}).forEach(([k,nm])=>{const n=nodes[id(k)];n.type='exit';n.name=nm});
  (F.stairs||[]).forEach(s=>{const n=add('s:'+s.n,s.x,s.y,'stairs',s.n);n.to=id(s.to);if(s.lp)n.lp=s.lp;edge(n.id,id(s.to))});
  (F.rooms||[]).forEach(r=>{const p=nodes[id(r.at)],gp=r.gap??1.8,w=r.w,h=r.h;let rx,ry,dx=p.x,dy=p.y;
   if(r.side==='d'){rx=p.x+(r.ox||0)-w/2;ry=p.y+gp;dy=ry}else if(r.side==='u'){rx=p.x+(r.ox||0)-w/2;ry=p.y-gp-h;dy=p.y-gp}
   else if(r.side==='r'){rx=p.x+gp;ry=p.y+(r.oy||0)-h/2;dx=rx}else{rx=p.x-gp-w;ry=p.y+(r.oy||0)-h/2;dx=p.x-gp}
   const n=add(r.n,dx,dy,'room',r.title||'Кабінет '+r.n);edge(n.id,p.id);
   const room={id:n.id,f:F.id,num:r.n,name:n.name,label:r.kind==='hall'?r.title:r.n,kind:r.kind||'room',rect:{x:rx,y:ry,w,h},note:r.note||'',verified:false};
   rooms.push(room);g.rooms.push(room);ents.push({id:n.id,name:n.name,value:n.name,f:F.id,keys:[LN.norm(r.n),LN.norm(n.name),LN.norm(String(n.name).replace(/^(велика\s+)?зал[аи]?\s+/i,'')),...(r.alias||[]).map(LN.norm)]})});
  g.ids.forEach(i=>{const n=nodes[i];if(n.type==='exit'||n.type==='stairs')ents.push({id:i,name:n.name,value:n.name+' · '+LN.floorName(F.id),f:F.id,keys:[LN.norm(n.name)]})});
 });
 LN.LINKS.forEach(([a,b])=>link(a,b,10));
 return {nodes,adj,rooms,ents,geo}}
const M=LN.M=build();
LN.find=q=>{const k=LN.norm(q);if(!k)return{err:'Введіть назву або номер приміщення.'};
 let m=M.ents.filter(e=>e.keys.includes(k)||LN.norm(e.value)===k);
 if(!m.length)m=M.ents.filter(e=>e.keys.some(x=>x.includes(k))||LN.norm(e.value).includes(k));
 if(m.length===1)return{ent:m[0]};
 if(!m.length)return{err:'Приміщення «'+q.trim()+'» не знайдено.'};
 return{err:'Уточніть запит: '+m.slice(0,5).map(e=>e.value).join('; ')+(m.length>5?'…':'')}};
LN.route=(a,b)=>{const d={},pv={},Q=new Set(Object.keys(M.nodes));Q.forEach(i=>d[i]=Infinity);d[a]=0;
 while(Q.size){let u=null;for(const i of Q)if(u===null||d[i]<d[u])u=i;if(d[u]===Infinity||u===b)break;Q.delete(u);
  for(const[v,w]of M.adj[u]||[])if(d[u]+w<d[v]){d[v]=d[u]+w;pv[v]=u}}
 if(d[b]===Infinity)return null;const p=[];for(let c=b;c;c=pv[c])p.unshift(c);return{path:p,len:d[b]}};
LN.steps=path=>{const out=[];let i=0;while(i<path.length){const f=M.nodes[path[i]].f;let j=i;while(j+1<path.length&&M.nodes[path[j+1]].f===f)j++;out.push({f,from:M.nodes[path[i]],to:M.nodes[path[j]],i,j});i=j+1}return out};
LN.guide=(path,s)=>{const N=M.nodes,ids=path.slice(s.i,s.j+1),out=[],end=new Set([path[0],path[path.length-1]]);
 const turn=(a,b,c)=>{const ux=b.x-a.x,uy=b.y-a.y,vx=c.x-b.x,vy=c.y-b.y,ang=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy)*180/Math.PI;return Math.abs(ang)<30?0:ang>0?1:-1};
 const near=id=>M.rooms.filter(r=>!end.has(r.id)&&M.adj[r.id]&&M.adj[r.id][0][0]===id);
 let pass=[];const push=t=>{if(out[out.length-1]!==t)out.push(t)};
 const flush=()=>{if(pass.length){const sd=[...new Set(pass.map(p=>p.side))];
   if(pass.length>3&&sd.length===1)push('Пройдіть повз '+pass.length+' приміщень '+sd[0]+' ('+pass[0].l+' … '+pass[pass.length-1].l+')');
   else push('Пройдіть повз '+pass.map(p=>p.l+' ('+p.side+')').join(', '))}pass=[]};
 if(ids.length===1)return N[ids[0]].type==='stairs'?['Скористайтеся сходами']:[];
 for(let k=0;k<ids.length-1;k++){const cur=N[ids[k]],nx=N[ids[k+1]],pv=k?N[ids[k-1]]:null;
  if(pv){const t=turn(pv,cur,nx),hx=cur.x-pv.x,hy=cur.y-pv.y;
   near(ids[k]).forEach(r=>{const rc=r.rect,cx=rc.x+rc.w/2-cur.x,cy=rc.y+rc.h/2-cur.y,side=(hx*cy-hy*cx)>0?'праворуч':'ліворуч';pass.push({l:r.kind==='hall'?r.label:r.num,side})});
   if(t){flush();push('Поверніть '+(t>0?'праворуч':'ліворуч'))}}
  else if(nx&&cur.type==='room'){/* старт із кабінету */}}
 flush();const last=N[ids[ids.length-1]];
 if(last.type==='stairs')out.push('Підійдіть до сходів «'+last.name+'»');else if(last.type==='exit')out.push('Вихід: '+last.name);else if(last.type==='room')out.push('Ви біля: '+last.name);
 return out};
LN.level=f=>FL(f).level;LN.floor=FL;
})();
