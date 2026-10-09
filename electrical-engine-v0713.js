/* Elektryk v0.7.13 • Educational graph diagnostics for mounted breakers. */
(()=>{
'use strict';
const phases=['L1','L2','L3'],types=[...phases,'N','PE'];
const breaker=c=>/^(?:[BC]\d+(?:_(?:2P|3P))?|RCBO\w*)$/.test(c||'');
const residual=c=>/^(RCD|RCBO)/.test(c||'');
function evaluate({terminals=[],mounted=[],connections=[],bridges=[]}={}){
  const term=new Map(terminals.map(t=>[String(t.id),t]));
  const dev=new Map(mounted.map(m=>[String(m.id),m]));
  const graph=new Map([...term.keys()].map(id=>[id,[]]));
  const issues=[],seen=new Set();
  const addIssue=(code,text,ref)=>{const key=code+':'+ref;if(!seen.has(key)){seen.add(key);issues.push({type:'error',code,text,ref})}};
  const accepts=(role,p)=>p==='N'||p==='PE'?role===p:phases.includes(p)&&(role==='L'||role===p);
  function edge(a,b,p,kind,id=''){
    a=String(a);b=String(b);
    if(!graph.has(a)||!graph.has(b))return;
    graph.get(a).push({to:b,p,kind,id});
    if(a!==b)graph.get(b).push({to:a,p,kind,id});
  }
  [...connections.map(c=>({...c,p:c.type})),...bridges.map(b=>({...b,p:b.phase}))].forEach(e=>{
    if(!term.has(String(e.a))||!term.has(String(e.b))){
      addIssue('MISSING_TERMINAL','Połączenie z nieistniejącym zaciskiem.',e.id||e.a);return;
    }
    if(!types.includes(e.p)||!accepts(term.get(String(e.a)).role,e.p)||!accepts(term.get(String(e.b)).role,e.p)){
      addIssue('INVALID_ROLE','Nieprawidłowy tor '+e.p+' na '+e.a+' / '+e.b+'.',e.id||e.a);return;
    }
    edge(e.a,e.b,e.p,'external');
  });
  for(const m of mounted){
    const t=terminals.filter(x=>x.mountId===m.id),code=String(m.code||'');
    if(/^(NTB|PETB)/.test(code)){
      const p=code.startsWith('NTB')?'N':'PE',ts=t.filter(x=>x.role===p);
      for(let i=1;i<ts.length;i++)edge(ts[0].id,ts[i].id,p,'strip',m.id);
      continue;
    }
    if(code.startsWith('SPD')||m.switchState==='off')continue;
    const up=t.filter(x=>x.zone==='top'),down=t.filter(x=>x.zone==='bottom'),paired=new Set();
    up.forEach((x,i)=>{
      let j=down.findIndex((y,k)=>!paired.has(k)&&x.role===y.role);
      if(j<0&&down[i]&&!paired.has(i))j=i;
      if(j<0)return;
      paired.add(j);const y=down[j];
      if(x.role==='N'&&y.role==='N')edge(x.id,y.id,'N','device',m.id);
      else if(x.role==='L'&&y.role==='L')edge(x.id,y.id,'L','device',m.id);
      else if(phases.includes(x.role)&&x.role===y.role)edge(x.id,y.id,x.role,'device',m.id);
    });
  }
  ['N','PE'].forEach(p=>{
    const bar=terminals.filter(t=>String(t.id).startsWith('BAR:'+p+':'));
    for(let i=1;i<bar.length;i++)edge(bar[0].id,bar[i].id,p,'bar');
  });
  function walk(p){
    const source='SUPPLY:'+p,seen=new Set(),parent=new Map(),queue=[];
    if(graph.has(source)){seen.add(source);queue.push(source)}
    for(let i=0;i<queue.length;i++){
      for(const e of graph.get(queue[i])||[]){
        if(e.p!==p&&!(phases.includes(p)&&e.p==='L'))continue;
        if(!accepts(term.get(e.to)?.role,p)||seen.has(e.to))continue;
        seen.add(e.to);parent.set(e.to,{from:queue[i],edge:e});queue.push(e.to);
      }
    }
    return {seen,parent};
  }
  const reach=Object.fromEntries(types.map(p=>[p,walk(p)]));
  const live=id=>phases.filter(p=>reach[p].seen.has(id));
  function path(p,target){
    if(!reach[p].seen.has(target))return null;
    const ids=[];let cur=target;
    while(reach[p].parent.has(cur)){
      const e=reach[p].parent.get(cur);
      if(e.edge.kind==='device')ids.push(e.edge.id);
      cur=e.from;
    }
    return ids.reverse();
  }
  const collisions=[];
  for(const t of terminals){const ps=live(t.id);if(ps.length>1){
    collisions.push({id:t.id,phases:ps});
    addIssue('PHASE_COLLISION','Kolizja faz '+ps.join('/')+' na '+t.id+'.',t.id);
  }}
  const circuits=[];
  for(const m of mounted.filter(x=>breaker(x.code))){
    const t=terminals.filter(x=>x.mountId===m.id);
    const eligible=x=>x.role==='L'||phases.includes(x.role);
    const upper=t.filter(x=>x.zone==='top'&&eligible(x));
    const lower=t.filter(x=>x.zone==='bottom'&&eligible(x));
    const incoming=upper.filter(x=>live(x.id).length),outgoing=lower.filter(x=>live(x.id).length);
    const faults=[],notes=[];
    if(!incoming.length)notes.push('Brak zasilania na wejściu');
    if(m.switchState==='off')notes.push('Aparat wyłączony');
    if(m.switchState==='off'&&outgoing.length)faults.push('Zasilone wyjście wyłączonego aparatu');
    if(m.switchState!=='off'&&incoming.length&&!outgoing.length)faults.push('Brak fazy na wyjściu');
    for(const t of outgoing){for(const p of live(t.id)){
      const ids=path(p,t.id)||[],codes=ids.map(id=>dev.get(id)?.code||'');
      if(!ids.includes(m.id))faults.push('Tor omija zabezpieczenie');
      else{
        if(!codes.some(c=>/^FR/.test(c)))notes.push('Brak rozłącznika FR w trasie');
        if(!codes.some(residual))notes.push('Brak RCD/RCBO w trasie');
      }
    }}
    if(String(m.code).startsWith('RCBO')&&incoming.length){
      if(t.some(x=>x.role==='N'&&x.zone==='top')&&!t.some(x=>x.role==='N'&&x.zone==='top'&&reach.N.seen.has(x.id)))notes.push('Brak N na wejściu RCBO');
    }
    const errors=[...new Set(faults)],warnings=[...new Set(notes)];
    if(errors.length)addIssue('BREAKER_BYPASS',m.code+' ('+m.id+'): '+errors.join('; ')+'.',m.id);
    const status=errors.length?'error':m.switchState==='off'?'off':!incoming.length?'unfed':warnings.length?'warning':'ready';
    circuits.push({id:m.id,code:m.code,row:m.row,start:m.start,status,
      inputPhases:[...new Set(incoming.flatMap(x=>live(x.id)))],
      outputPhases:[...new Set(outgoing.flatMap(x=>live(x.id)))],errors,warnings});
  }
  const stats={total:circuits.length,ready:circuits.filter(c=>c.status==='ready').length,
    incomplete:circuits.filter(c=>c.status!=='ready').length,errors:issues.length,collisions:collisions.length};
  return {version:'2.0',circuits,issues,collisions,stats};
}
function snapshot(){
  const terminals=[...document.querySelectorAll('.wire-terminal')].map(el=>({
    id:el.dataset.terminal,role:el.dataset.role,zone:el.dataset.zone,
    mountId:el.closest('.mounted-device')?.dataset.mountId||null
  })).filter(t=>t.id);
  return {terminals,mounted:window.ElektrykStage2?.getMounted?.()||[],
    connections:window.ElektrykStage3?.getConnections?.()||[],
    bridges:window.ElektrykBridges?.getBridges?.()||[]};
}
window.ElektrykElectricalEngine={evaluate,snapshot,analyze:()=>evaluate(snapshot())};
})();