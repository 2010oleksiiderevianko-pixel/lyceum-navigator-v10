// Відображення SVG-схеми поверху та маршруту.
(function(){const LN=window.LN,NS='http://www.w3.org/2000/svg';
const h=(p,t,a,x)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;p.appendChild(e);return e};
LN.renderFloor=(svg,fid,st)=>{const M=LN.M,g=M.geo[fid],N=M.nodes;svg.innerHTML='';svg.classList.toggle('enter',!!st.enter);svg.style.setProperty('--dy',(st.dir||0)*4+'px');let ei=0;
 const xs=[],ys=[];g.ids.forEach(i=>{xs.push(N[i].x);ys.push(N[i].y)});
 g.rooms.forEach(r=>{xs.push(r.rect.x,r.rect.x+r.rect.w);ys.push(r.rect.y,r.rect.y+r.rect.h)});
 g.zones.forEach(z=>{xs.push(z[0],z[0]+z[2]);ys.push(z[1],z[1]+z[3])});
 const P=9,x0=Math.min(...xs)-P,y0=Math.min(...ys)-P,w=Math.max(...xs)-Math.min(...xs)+2*P,hh=Math.max(...ys)-Math.min(...ys)+2*P;
 const base=[x0,y0,w,hh];svg._base=base;svg.setAttribute('viewBox',(st.vb||base).join(' '));svg.style.aspectRatio=w+'/'+hh;
 g.zones.forEach(z=>{h(svg,'rect',{x:z[0],y:z[1],width:z[2],height:z[3],rx:.8,class:'zn'});h(svg,'text',{x:z[0]+z[2]/2,y:z[1]+z[3]/2+.7,class:'zl'},z[4])});
 g.links.forEach(([a,b])=>h(svg,'line',{x1:N[a].x,y1:N[a].y,x2:N[b].x,y2:N[b].y,class:'co2'}));
 g.paths.forEach(p=>h(svg,'polyline',{points:p.map(i=>N[i].x+','+N[i].y).join(' '),class:'co'}));
 g.rooms.forEach((r,ri)=>{const sel=st.sel===r.id;h(svg,'rect',{x:r.rect.x,y:r.rect.y,width:r.rect.w,height:r.rect.h,rx:.9,style:'--i:'+Math.min(ri,40),'data-id':r.id,class:'rb'+(r.kind==='hall'?' hall':'')+(r.verified?'':' dm')+(sel?' sel':'')});
  const fs=Math.min(2.2,r.rect.h*.55,r.rect.w*.92/(r.label.length*.7));h(svg,'text',{x:r.rect.x+r.rect.w/2,y:r.rect.y+r.rect.h/2+fs*.35,class:'rl',style:'font-size:'+fs+'px;--i:'+Math.min(ri,40)},r.label)});
 g.ids.map(i=>N[i]).forEach(n=>{
  if(n.type==='exit'){let ly=n.y+3.6;const pa=g.paths.find(a=>a.includes(n.id));
   if(pa){const k=pa.indexOf(n.id),nb=N[k===0?pa[1]:pa[k-1]];if(nb&&Math.abs(n.y-nb.y)>Math.abs(n.x-nb.x)&&n.y<nb.y)ly=n.y-2.2}
   h(svg,'rect',{x:n.x-2.2,y:n.y-1,width:4.4,height:2,rx:.6,class:'ex',style:'--i:'+Math.min(ei++,40),'data-id':n.id});h(svg,'text',{x:n.x,y:ly,class:'tl'},n.name)}
  if(n.type==='stairs'){const ref=n.to&&N[n.to],up=n.lp?n.lp==='u':ref&&n.y<ref.y-1.5;
   h(svg,'rect',{x:n.x-2,y:n.y-2,width:4,height:4,rx:.8,class:'sr',style:'--i:'+Math.min(ei++,40),'data-id':n.id});h(svg,'text',{x:n.x,y:n.y+.9,class:'ic'},'↕');h(svg,'text',{x:n.x,y:up?n.y-3.2:n.y+4.6,class:'tl'},n.name)}});
 if(st.path){const p=st.path;let seg=[];const flush=()=>{if(seg.length>1){const pts=seg.map(i=>N[i].x+','+N[i].y).join(' ');
   h(svg,'polyline',{points:pts,class:'rt'+(st.animate?' an':''),pathLength:1});h(svg,'polyline',{points:pts,class:'rf'+(st.animate?' an':'')})}seg=[]};
  p.forEach(i=>{if(N[i].f===fid)seg.push(i);else flush()});flush();
  p.forEach(i=>{if(N[i].f===fid&&N[i].type==='stairs'&&i!==p[0]&&i!==p[p.length-1])h(svg,'circle',{cx:N[i].x,cy:N[i].y,r:3.1,class:'tr'})});
  [[p[0],'a'],[p[p.length-1],'b']].forEach(([i,c])=>{const n=N[i];if(n.f!==fid)return;h(svg,'circle',{cx:n.x,cy:n.y,r:2.6,class:'ring '+c+(st.animate?' an':'')});h(svg,'circle',{cx:n.x,cy:n.y,r:1.3,class:'mk '+c+(st.animate?' an':'')})})}
 if(st.pos&&N[st.pos]&&N[st.pos].f===fid){const n=N[st.pos];h(svg,'circle',{cx:n.x,cy:n.y,r:3,class:'ring me'});h(svg,'circle',{cx:n.x,cy:n.y,r:1.5,class:'mk me'})}
};})();
