(()=>{
'use strict';
// Model edukacyjny v0.7.12: podstawowe reguły poprawności elektrycznej.
function inspectRecords(input={}){
  const terminals=input.terminals||[],mounted=input.mounted||[];
  const connections=input.connections||[],bridges=input.bridges||[];
  const term=new Map(terminals.map(t=>[t.id,t])),devices=new Map(mounted.map(m=>[m.id,m]));
  const issues=[],seen=new Set();
  const add=(type,text)=>{const key=type+':'+text;if(!seen.has(key)){issues.push({type,text});seen.add(key)}};
  const isPhase=v=>['L1','L2','L3'].includes(v);
  const accepts=(role,phase)=>phase==='N'?role==='N':phase==='PE'?role==='PE':isPhase(phase)&&(role==='L'||role===phase);
  const links=[
    ...connections.map(x=>({...x,kind:'wire',phase:x.type})),
    ...bridges.map(x=>({...x,kind:x.kind||'bridge',phase:x.phase}))
  ];
  const wireTermCount=new Map();
  connections.forEach(c=>{
    for(const id of [c.a,c.b])wireTermCount.set(id,(wireTermCount.get(id)||0)+1);
  });
  wireTermCount.forEach((count,id)=>{if(count>1)add('error','Na zacisku '+id+' znajduje się '+count+' przewodów. Sprawdź dopuszczenie producenta; w modelu gry dostępne jest jedno przyłącze przewodu.')});
  links.forEach(c=>{
    const a=term.get(c.a),b=term.get(c.b);
    if(!a||!b){add('error','Połączenie '+(c.id||'')+' ma nieistniejący zacisk — usuń je lub odtwórz aparat.');return}
    if(!accepts(a.role,c.phase)||!accepts(b.role,c.phase)){
      add('error','Nieprawidłowy tor '+c.phase+' na zaciskach '+c.a+' / '+c.b+'. Sprawdź zgodność L, N i PE.');
    }
  });
  const groups=new Map();
  bridges.filter(b=>b.kind==='comb').forEach(b=>{
    const id=b.groupId||'bez-grupy-'+b.id;
    if(!groups.has(id))groups.set(id,[]);
    groups.get(id).push(b);
  });
  groups.forEach((items,groupId)=>{
    if(items.some(b=>b.endCaps!==true))add('error','Grzebień '+groupId+': brak osłon końcowych. Załóż osłony w panelu MOSTKI / GRZEBIEŃ.');
    const phases=new Set(items.map(b=>b.phase));
    if(phases.size!==1||![...phases].every(isPhase))add('error','Grzebień '+groupId+': niespójny tor fazowy.');
    for(const b of items){
      const a=term.get(b.a),z=term.get(b.b);
      const da=devices.get(a?.mountId),db=devices.get(z?.mountId);
      if(!da||!db){add('error','Grzebień '+groupId+': brak jednego z aparatów.');continue}
      const allowed=d=>/^[BC]\d+$/.test(d.code)&&Number(d.modules)===1;
      if(!allowed(da)||!allowed(db)||Number(da.row)!==Number(db.row)||
          Math.abs(Number(da.start)-Number(db.start))!==1||a.zone!=='top'||z.zone!=='top'){
        add('error','Grzebień '+groupId+': niezgodne aparaty lub pozycje DIN. Grzebień 1P łączy tylko sąsiednie MCB 1P.');
      }
    }
  });
  // Izolacja torów N RCD/RCBO: sprawdzamy połączenia zewnętrzne i listwy N,
  // bez łączenia wejścia i wyjścia wewnątrz RCD.
  const neutral=terminals.filter(t=>t.role==='N'),parent=new Map(neutral.map(t=>[t.id,t.id]));
  const find=x=>{let cur=x;while(parent.get(cur)!==cur){cur=parent.get(cur)}return cur};
  const union=(a,b)=>{if(parent.has(a)&&parent.has(b))parent.set(find(a),find(b))};
  links.filter(l=>l.phase==='N').forEach(l=>union(l.a,l.b));
  const bar=neutral.filter(t=>String(t.id).startsWith('BAR:N:'));
  for(let i=1;i<bar.length;i++)union(bar[0].id,bar[i].id);
  const strips=new Map();
  neutral.forEach(t=>{
    const m=devices.get(t.mountId);
    if(!m||!/^NTB/.test(m.code))return;
    if(!strips.has(m.id))strips.set(m.id,[]);
    strips.get(m.id).push(t.id);
  });
  strips.forEach(ids=>{for(let i=1;i<ids.length;i++)union(ids[0],ids[i])});
  const outputs=new Map(),inputs=new Map();
  neutral.forEach(t=>{
    const m=devices.get(t.mountId);
    if(!m||!(/^(RCD|RCBO)/.test(m.code)))return;
    const key=find(t.id);
    const target=t.zone==='bottom'?outputs:t.zone==='top'?inputs:null;
    if(target){if(!target.has(key))target.set(key,new Set());target.get(key).add(m.id)}
  });
  outputs.forEach((deviceIds,k)=>{
    const upstream=neutral.some(t=>t.id==='SUPPLY:N'&&find(t.id)===k);
    const inputDevices=inputs.get(k)||new Set();
    if(upstream||inputDevices.size)add('error','Tory neutralne: N po stronie odbiorczej RCD/RCBO jest połączony z N zasilającym. Rozdziel N przed i za zabezpieczeniem.');
    if(deviceIds.size>1)add('error','Tory neutralne: wyjścia N różnych RCD/RCBO są połączone. Każda sekcja wymaga własnego toru N.');
  });
  return issues;
}
function inspect(){
  const mounted=window.ElektrykStage2?.getMounted?.()||[];
  const terminals=[...document.querySelectorAll('.wire-terminal')].map(el=>{
    const m=el.closest('.mounted-device');
    return {id:el.dataset.terminal,role:el.dataset.role,zone:el.dataset.zone,mountId:m?.dataset.mountId||null};
  }).filter(t=>t.id);
  return inspectRecords({
    terminals,mounted,
    connections:window.ElektrykStage3?.getConnections?.()||[],
    bridges:window.ElektrykBridges?.getBridges?.()||[]
  });
}
window.ElektrykElectricalAudit={inspect,inspectRecords};
})();