/* Elektryk v0.7.13.1 — RCD / RCBO neutral segregation analysis.
   Model szkoleniowy: NIE jest odbiorem instalacji. */
(()=>{
'use strict';
const PHASES=['L1','L2','L3'];
function inspectRecords(input={}){
 const terminals=Array.isArray(input.terminals)?input.terminals:[],
   mounted=Array.isArray(input.mounted)?input.mounted:[],
   wires=Array.isArray(input.connections)?input.connections:[],
   bridges=Array.isArray(input.bridges)?input.bridges:[];
 const tMap=new Map(terminals.filter(t=>t?.id).map(t=>[String(t.id),t]));
 const mMap=new Map(mounted.filter(m=>m?.id).map(m=>[String(m.id),m]));
 const neutral=terminals.filter(t=>t.role==='N');
 const graph=new Map(neutral.map(t=>[String(t.id),[]]));
 const errors=[],seen=new Set();
 function add(code,text,edges=[],termIds=[],devices=[],severity='error'){
   const key=code+'|'+[...new Set(devices)].sort().join('|')+'|'+[...new Set(termIds)].sort().join('|');
   if(seen.has(key))return;
   seen.add(key);
   errors.push({code,text,type:severity,
     edges:[...new Set(edges.map(e=>e.kind+':'+e.id))].map(s=>{const i=s.indexOf(':');return {kind:s.slice(0,i),id:s.slice(i+1)}}),
     terminals:[...new Set(termIds)],devices:[...new Set(devices)]});
 }
 function edge(a,b,kind,id=''){
   a=String(a);b=String(b);
   if(!graph.has(a)||!graph.has(b))return;
   const data={kind,id:String(id),a,b};
   graph.get(a).push({to:b,data});
   if(a!==b)graph.get(b).push({to:a,data});
 }
 const invalidLinks=[
  ...wires.map(x=>({a:x.a,b:x.b,phase:x.type,kind:'wire',id:x.id})),
  ...bridges.map(x=>({a:x.a,b:x.b,phase:x.phase,kind:'bridge',id:x.id}))
 ];
 for(const l of invalidLinks){
   const a=tMap.get(String(l.a)),b=tMap.get(String(l.b));
   if(!a||!b)continue;
   // N / PE must remain isolated. The invalid wire/bridge itself is the offender.
   if((l.phase==='N'||l.phase==='PE')&&(a.role!==l.phase||b.role!==l.phase)){
     add('N_PE_ROLE','Przewód lub mostek '+l.id+' łączy tor '+l.phase+' z niezgodnym zaciskiem.',
       [{kind:l.kind,id:l.id}],[l.a,l.b]);
   }
   if(l.phase==='N'&&a.role==='N'&&b.role==='N')edge(l.a,l.b,l.kind,l.id);
 }
 // Physical N bus: all terminals share a node; similarly an NTB strip.
 const bus=neutral.filter(t=>String(t.id).startsWith('BAR:N:'));
 for(let i=1;i<bus.length;i++)edge(bus[0].id,bus[i].id,'internal','BUS:N');
 for(const m of mounted.filter(m=>/^NTB/.test(String(m.code)))){
   const list=neutral.filter(t=>t.mountId===m.id);
   for(let i=1;i<list.length;i++)edge(list[0].id,list[i].id,'internal',m.id);
 }
 // RCD neutral poles intentionally DO NOT internally join top and bottom.
 // Only FR neutral poles and other explicitly modelled pass-through elements
 // are allowed to forward N from supply to its output.
 for(const m of mounted){
   const code=String(m.code||'');
   if(m.switchState==='off'||!/^FR/.test(code))continue;
   const top=neutral.filter(t=>t.mountId===m.id&&t.zone==='top');
   const bottom=neutral.filter(t=>t.mountId===m.id&&t.zone==='bottom');
   top.forEach((t,i)=>{if(bottom[i])edge(t.id,bottom[i].id,'internal',m.id)});
 }
 function shortest(a,b){
   a=String(a);b=String(b);
   if(!graph.has(a)||!graph.has(b))return null;
   const q=[a],seen=new Set([a]),parents=new Map();
   for(let i=0;i<q.length;i++){
     const at=q[i];if(at===b)break;
     for(const e of graph.get(at)||[]){
       if(seen.has(e.to))continue;
       seen.add(e.to);parents.set(e.to,{from:at,edge:e.data});q.push(e.to);
     }
   }
   if(!seen.has(b))return null;
   const edges=[],ids=[b];let cur=b;
   while(parents.has(cur)){const p=parents.get(cur);edges.push(p.edge);cur=p.from;ids.push(cur)}
   edges.reverse();ids.reverse();
   return {edges,ids,explicit:edges.filter(e=>e.kind==='wire'||e.kind==='bridge')};
 }
 const rcds=mounted.filter(m=>/^(RCD|RCBO)/.test(String(m.code||''))).map(m=>{
   const ts=neutral.filter(t=>t.mountId===m.id);
   return {id:String(m.id),code:String(m.code),input:ts.filter(t=>t.zone==='top').map(t=>t.id),
     output:ts.filter(t=>t.zone==='bottom').map(t=>t.id)};
 });
 const incoming=rcds.flatMap(r=>r.input.map(id=>({id,device:r.id})));
 const outputs=rcds.flatMap(r=>r.output.map(id=>({id,device:r.id})));
 function bestPath(from,to){
   let best=null;
   for(const a of from)for(const b of to){
     const p=shortest(a,b);if(p&&(!best||p.edges.length<best.edges.length))best=p;
   }
   return best;
 }
 // A downstream RCD N section must not touch the supply-neutral
 // or the input N of any RCD, even another one.
 const upstream=['SUPPLY:N',...incoming.map(x=>x.id)].filter(id=>graph.has(id));
 for(const r of rcds){
   const p=bestPath(r.output,upstream);
   if(p){
     add('RCD_N_UPSTREAM','Wyjście N '+r.code+' ('+r.id+') jest połączone ze stroną zasilającą N.',
       p.explicit,p.ids,[r.id]);
   }
 }
 // Output sections of different residual-current devices are distinct.
 for(let i=0;i<rcds.length;i++)for(let j=i+1;j<rcds.length;j++){
   const a=rcds[i],b=rcds[j],p=bestPath(a.output,b.output);
   if(!p)continue;
   add('RCD_N_CROSS','Wyjścia N '+a.code+' ('+a.id+') i '+b.code+' ('+b.id+') zostały połączone.',
     p.explicit,p.ids,[a.id,b.id]);
 }
 // Detect a downstream terminal strip connected to more than one RCD section.
 // Highlight the actual chain rather than changing the stored graph.
 for(const strip of mounted.filter(m=>/^NTB/.test(String(m.code||'')))){
   const ports=neutral.filter(t=>t.mountId===strip.id).map(t=>t.id);
   const owners=rcds.filter(r=>bestPath(ports,r.output));
   if(owners.length>1){
     const p=bestPath(owners[0].output,owners[1].output);
     if(p)add('N_STRIP_SHARED','Listwa '+strip.code+' ('+strip.id+') łączy niezależne sekcje N.',
       p.explicit,p.ids,[strip.id,...owners.map(r=>r.id)]);
   }
 }
 // A connected downstream N with no detectable incoming N is incomplete.
 // Only warn about RCD devices actually connected on the output.
 const feedNodes=['SUPPLY:N'].filter(id=>graph.has(id));
 for(const r of rcds){
   const hasDownstream=r.output.some(id=>(graph.get(id)||[]).some(e=>e.data.kind==='wire'||e.data.kind==='bridge'));
   if(!hasDownstream||!r.input.length)continue;
   if(!bestPath(r.input,feedNodes)){
     const candidates=r.output.flatMap(id=>(graph.get(id)||[]).map(e=>e.data)).filter(e=>e.kind==='wire'||e.kind==='bridge');
     add('RCD_N_INPUT_MISSING','Sprawdź doprowadzenie N do wejścia '+r.code+' ('+r.id+').',
       candidates,r.input.concat(r.output),[r.id],'warning');
   }
 }
 return {issues:errors,sections:rcds.map(r=>({id:r.id,code:r.code,input:r.input,output:r.output})),
   stats:{rcds:rcds.length,errors:errors.filter(e=>e.type==='error').length,warnings:errors.filter(e=>e.type==='warning').length}};
}
window.ElektrykRcdCore={inspectRecords};
})();