(()=>{
const cabinet=document.querySelector('.cabinet-inner');
const mountRoot=document.querySelector('.din-zone');
if(!cabinet||!mountRoot)return;

const LOADS=[
  {id:'LIGHT',label:'Oświetlenie'},
  {id:'SOCKET',label:'Gniazda'},
  {id:'KITCHEN',label:'Kuchnia'},
  {id:'WASH',label:'Pralka'}
];
const PHASES=['L1','L2','L3'];
let lastSignature='';
let lastAnalysis=null;

const activeTask=document.querySelector('.active-task');
let analyzer=null;
if(activeTask){
  analyzer=document.createElement('div');
  analyzer.className='power-analyzer';
  analyzer.innerHTML=`
    <div class="power-analyzer-head"><b>ANALIZA ZASILANIA</b><span>WLZ → aparaty → odbiorniki</span></div>
    <div class="power-main-status warn" id="powerMainStatus">Zbuduj tor zasilania i kliknij „Sprawdź instalację”.</div>
    <div class="power-summary">
      <div class="partial"><span>ZASILONE</span><b id="powerLoadsOk">0/4</b></div>
      <div class="partial"><span>NIEPEŁNE</span><b id="powerLoadsPartial">0</b></div>
      <div class="good"><span>KOLIZJE FAZ</span><b id="powerConflicts">0</b></div>
    </div>
    <button class="power-check-btn" id="checkPower">⚡ SPRAWDŹ INSTALACJĘ</button>
    <div class="power-issues" id="powerIssues"></div>`;
  activeTask.appendChild(analyzer);
}

document.getElementById('checkPower')?.addEventListener('click',()=>analyze(true));

function terminal(id){return document.querySelector(`[data-terminal="${CSS.escape(id)}"]`)}
function ensureGraphNode(graph,id){if(!graph.has(id))graph.set(id,[])}
function addEdge(graph,a,b,type,meta={}){
  if(!a||!b)return;
  ensureGraphNode(graph,a);ensureGraphNode(graph,b);
  graph.get(a).push({to:b,type,meta});
  graph.get(b).push({to:a,type,meta});
}
function edgeAllows(type,conductor){
  if(conductor==='N'||conductor==='PE')return type===conductor;
  return type===conductor||type==='L';
}
function roleType(role){
  if(PHASES.includes(role))return role;
  if(role==='L')return 'L';
  if(role==='N'||role==='PE')return role;
  return null;
}
function mountedCodeFromTerminalId(id){
  const m=id?.match(/^(M\d+):/);if(!m)return null;
  return document.querySelector(`.mounted-device[data-mount-id="${CSS.escape(m[1])}"]`)?.dataset.code||null;
}
function internalDeviceEdges(graph){
  document.querySelectorAll('.mounted-device').forEach(m=>{
    const code=m.dataset.code,id=m.dataset.mountId;

    if(['NTB','NTB12','PETB','PETB12'].includes(code)){
      const role=code.startsWith('NTB')?'N':'PE';
      const terminals=[...m.querySelectorAll('.wire-terminal')].filter(t=>t.dataset.role===role);
      for(let i=1;i<terminals.length;i++){
        addEdge(graph,terminals[i-1].dataset.terminal,terminals[i].dataset.terminal,role,{kind:'terminal-strip',code,mountId:id});
      }
      return;
    }

    if(!m.dataset.switchState)m.dataset.switchState='on';
    const on=m.dataset.switchState!=='off';
    if(code==='SPD'||!on)return;
    const tops=[...m.querySelectorAll('.device-topterm .wire-terminal')];
    const bottoms=[...m.querySelectorAll('.device-bottomterm .wire-terminal')];
    tops.forEach((t,ti)=>{
      const tr=t.dataset.role;
      let b=bottoms.find((x,bi)=>x.dataset.role===tr && !x.dataset.pairedInternal);
      if(!b && bottoms[ti])b=bottoms[ti];
      if(!b)return;
      const type=roleType(tr)||roleType(b.dataset.role);if(!type)return;
      addEdge(graph,t.dataset.terminal,b.dataset.terminal,type,{kind:'device',code,mountId:id});
    });
  });
}
function busEdges(graph,role){
  const ts=[...document.querySelectorAll(`[data-terminal^="BAR:${role}:"]`)];
  for(let i=1;i<ts.length;i++)addEdge(graph,ts[i-1].dataset.terminal,ts[i].dataset.terminal,role,{kind:'bus',code:role});
}
function buildGraph(){
  const graph=new Map();
  document.querySelectorAll('.wire-terminal').forEach(t=>ensureGraphNode(graph,t.dataset.terminal));
  const conns=window.ElektrykStage3?.getConnections?.()||[];
  conns.forEach(c=>addEdge(graph,c.a,c.b,c.type,{kind:'wire',wireId:c.id,cable:c.cable}));
  const bridges=window.ElektrykBridges?.getBridges?.()||[];
  bridges.forEach(b=>addEdge(graph,b.a,b.b,b.phase,{kind:'bridge',bridgeId:b.id}));
  internalDeviceEdges(graph);
  busEdges(graph,'N');busEdges(graph,'PE');
  return {graph,conns,bridges};
}
function bfs(graph,source,conductor){
  const visited=new Set(),parent=new Map(),q=[];
  if(!graph.has(source))return {visited,parent};
  visited.add(source);q.push(source);
  while(q.length){
    const cur=q.shift();
    for(const e of graph.get(cur)||[]){
      if(!edgeAllows(e.type,conductor)||visited.has(e.to))continue;
      visited.add(e.to);parent.set(e.to,{from:cur,edge:e});q.push(e.to);
    }
  }
  return {visited,parent};
}
function routeTo(result,target){
  if(!result.visited.has(target))return null;
  const nodes=[target],edges=[];let cur=target;
  while(result.parent.has(cur)){
    const p=result.parent.get(cur);edges.push(p.edge);cur=p.from;nodes.push(cur);
  }
  nodes.reverse();edges.reverse();return {nodes,edges};
}
function routeDeviceCodes(route){return route?route.edges.filter(e=>e.meta?.kind==='device').map(e=>e.meta.code):[]}
function mountedById(id){return document.querySelector(`.mounted-device[data-mount-id="${CSS.escape(id)}"]`)}
function setSwitchVisual(m){
  const on=m.dataset.switchState!=='off';
  m.classList.toggle('switch-off',!on);
  let badge=m.querySelector('.switch-state-badge');
  if(!badge){badge=document.createElement('span');badge.className='switch-state-badge';m.appendChild(badge)}
  badge.textContent='';
  badge.classList.toggle('state-on',on);
  badge.classList.toggle('state-off',!on);
  badge.title=on?'Stan aparatu: ZAŁĄCZONY':'Stan aparatu: WYŁĄCZONY';
  badge.setAttribute('aria-label',badge.title);
}
function decorateSwitches(){
  document.querySelectorAll('.mounted-device').forEach(m=>{
    const code=m.dataset.code;
    if(!(code==='RCD'||code==='RCBO'||code.startsWith('FR')||/^[BC]\d+$/.test(code)))return;
    if(!m.dataset.switchState)m.dataset.switchState='on';
    setSwitchVisual(m);
    const lever=m.querySelector('.lever');
    if(lever&&!lever.dataset.powerToggle){
      lever.dataset.powerToggle='1';
      lever.title='Kliknij, aby przełączyć ON / OFF';
      lever.addEventListener('click',e=>{
        e.stopPropagation();e.preventDefault();
        m.dataset.switchState=m.dataset.switchState==='off'?'on':'off';
        setSwitchVisual(m);analyze(false);
      });
    }
  });
}
function clearVisualStates(){
  document.querySelectorAll('.mounted-device').forEach(m=>m.classList.remove('input-live','output-live','phase-conflict'));
  document.querySelectorAll('.wire-terminal').forEach(t=>t.classList.remove('electrically-live','phase-collision'));
  document.querySelectorAll('.circuits>div').forEach(c=>c.classList.remove('load-powered','load-partial','load-error'));
}
function pathHasProtection(codes){return codes.some(c=>c==='RCBO'||/^[BC]\d+$/.test(c))}
function pathHasResidual(codes){return codes.some(c=>['RCD','RCBO'].includes(c))}
function loadState(load,reaches){
  const lId=`LOAD:${load.id}:L`,nId=`LOAD:${load.id}:N`,peId=`LOAD:${load.id}:PE`;
  let phase=null,phaseRoute=null;
  for(const p of PHASES){if(reaches[p].visited.has(lId)){phase=p;phaseRoute=routeTo(reaches[p],lId);break}}
  const nRoute=routeTo(reaches.N,nId),peRoute=routeTo(reaches.PE,peId);
  const codes=routeDeviceCodes(phaseRoute),nCodes=routeDeviceCodes(nRoute);
  const hasPhase=!!phase,hasN=!!nRoute,hasPE=!!peRoute;
  const hasFR=codes.some(c=>c.startsWith('FR'));
  const protectedPath=pathHasProtection(codes);
  const residual=pathHasResidual(codes);
  const residualNok=!residual || (codes.includes('RCBO')?nCodes.includes('RCBO'):nCodes.includes('RCD'));
  const complete=hasPhase&&hasN&&hasPE&&hasFR&&protectedPath&&residual&&residualNok;
  const any=hasPhase||hasN||hasPE;
  return {load,phase,phaseRoute,nRoute,peRoute,codes,nCodes,hasPhase,hasN,hasPE,hasFR,protectedPath,residual,residualNok,complete,any};
}
function detectPhaseCollisions(reaches){
  const collisions=[];
  document.querySelectorAll('.wire-terminal').forEach(t=>{
    const id=t.dataset.terminal;
    const live=PHASES.filter(p=>reaches[p].visited.has(id));
    if(live.length>1)collisions.push({id,phases:live,el:t});
  });
  return collisions;
}
function applyLiveVisuals(reaches,collisions){
  document.querySelector('.supply-box')?.classList.add('power-source-live');
  document.querySelectorAll('.wire-terminal').forEach(t=>{
    const id=t.dataset.terminal;
    const live=PHASES.some(p=>reaches[p].visited.has(id))||reaches.N.visited.has(id)||reaches.PE.visited.has(id);
    t.classList.toggle('electrically-live',live);
  });
  collisions.forEach(c=>c.el.classList.add('phase-collision'));
  document.querySelectorAll('.mounted-device').forEach(m=>{
    const tops=[...m.querySelectorAll('.device-topterm .wire-terminal')].map(x=>x.dataset.terminal);
    const bottoms=[...m.querySelectorAll('.device-bottomterm .wire-terminal')].map(x=>x.dataset.terminal);
    const input=tops.some(id=>PHASES.some(p=>reaches[p].visited.has(id))||reaches.N.visited.has(id));
    const output=bottoms.some(id=>PHASES.some(p=>reaches[p].visited.has(id))||reaches.N.visited.has(id));
    m.classList.toggle('input-live',input&&!output);
    m.classList.toggle('output-live',output);
    const conflict=[...tops,...bottoms].some(id=>collisions.some(c=>c.id===id));
    m.classList.toggle('phase-conflict',conflict);
  });
}
function applyLoadVisuals(states){
  const cards=[...document.querySelectorAll('.circuits>div')];
  states.forEach((s,i)=>{
    const card=cards[i];if(!card)return;
    card.querySelector('.circuit-power-state')?.remove();card.querySelector('.circuit-status-label')?.remove();
    const box=document.createElement('div');box.className='circuit-power-state';
    box.innerHTML=`<span class="${s.hasPhase?'on':'off'}">L${s.phase?' '+s.phase:''}</span><span class="${s.hasN?'on':'off'}">N</span><span class="${s.hasPE?'on':'off'}">PE</span>`;
    const label=document.createElement('div');label.className='circuit-status-label';
    if(s.complete){card.classList.add('load-powered');label.textContent='✓ OBWÓD ZASILONY I CHRONIONY'}
    else if(s.any){card.classList.add('load-error');label.textContent='⚠ NIEPEŁNY / BŁĘDNY TOR'}
    else{card.classList.add('load-partial');label.textContent='BRAK ZASILANIA'}
    card.append(box,label);
  });
}
function buildIssues(states,collisions){
  const issues=[];
  collisions.forEach(c=>issues.push({type:'error',text:`Kolizja faz ${c.phases.join('/')} na zacisku ${c.id}.`}));
  states.forEach(s=>{
    if(!s.any)return;
    const missing=[];
    if(!s.hasPhase)missing.push('L');if(!s.hasN)missing.push('N');if(!s.hasPE)missing.push('PE');
    if(missing.length)issues.push({type:'error',text:`${s.load.label}: brak ${missing.join(', ')}.`});
    if(s.hasPhase&&!s.hasFR)issues.push({type:'error',text:`${s.load.label}: faza omija rozłącznik FR.`});
    if(s.hasPhase&&!s.protectedPath)issues.push({type:'error',text:`${s.load.label}: brak zabezpieczenia nadprądowego MCB/RCBO w torze fazowym.`});
    if(s.hasPhase&&!s.residual)issues.push({type:'error',text:`${s.load.label}: tor nie przechodzi przez RCD/RCBO.`});
    if(s.hasN&&s.residual&&!s.residualNok)issues.push({type:'error',text:`${s.load.label}: przewód N omija właściwy RCD/RCBO.`});
  });
  if(!issues.length&&states.some(s=>s.complete))issues.push({type:'ok',text:'Nie wykryto błędów w aktywnych, kompletnych obwodach.'});
  return issues;
}
function renderAnalyzer(states,collisions,issues,manual){
  const ok=states.filter(s=>s.complete).length,partial=states.filter(s=>s.any&&!s.complete).length;
  const okEl=document.getElementById('powerLoadsOk'),partEl=document.getElementById('powerLoadsPartial'),confEl=document.getElementById('powerConflicts');
  if(okEl)okEl.textContent=`${ok}/${states.length}`;if(partEl)partEl.textContent=partial;if(confEl)confEl.textContent=collisions.length;
  const main=document.getElementById('powerMainStatus');
  if(main){
    main.className='power-main-status '+(collisions.length||issues.some(i=>i.type==='error')?'error':ok===states.length?'ok':'warn');
    if(collisions.length)main.textContent='Wykryto kolizję faz — instalacja wymaga poprawy.';
    else if(ok===states.length)main.textContent='✓ Wszystkie odbiorniki mają pełny, chroniony tor zasilania.';
    else if(ok>0)main.textContent=`${ok} z ${states.length} odbiorników ma poprawne zasilanie. Pozostałe wymagają dokończenia.`;
    else main.textContent=manual?'Brak kompletnego toru zasilania. Sprawdź L, N, PE i kolejność aparatów.':'Analiza aktualizuje się automatycznie podczas budowy.';
  }
  const list=document.getElementById('powerIssues');if(list){list.innerHTML='';issues.slice(0,5).forEach(i=>{const d=document.createElement('div');d.className='power-issue '+i.type;d.textContent=i.text;list.appendChild(d)})}
  const footerError=document.querySelectorAll('.workspace-footer b')[2];if(footerError)footerError.textContent=issues.filter(i=>i.type==='error').length;
  const footerMode=document.querySelectorAll('.workspace-footer b')[3];if(footerMode)footerMode.textContent='SYMULACJA ZASILANIA';
}
function signature(){
  const mounts=[...document.querySelectorAll('.mounted-device')].map(m=>`${m.dataset.mountId}:${m.dataset.code}:${m.dataset.switchState||'on'}`);
  const c=window.ElektrykStage3?.getConnections?.()||[];const b=window.ElektrykBridges?.getBridges?.()||[];
  return JSON.stringify([mounts,c,b,document.querySelectorAll('.wire-terminal').length]);
}
function analyze(manual=false){
  decorateSwitches();clearVisualStates();
  const {graph}=buildGraph();
  const reaches={};PHASES.forEach(p=>reaches[p]=bfs(graph,`SUPPLY:${p}`,p));reaches.N=bfs(graph,'SUPPLY:N','N');reaches.PE=bfs(graph,'SUPPLY:PE','PE');
  const collisions=detectPhaseCollisions(reaches);
  const states=LOADS.map(l=>loadState(l,reaches));
  applyLiveVisuals(reaches,collisions);applyLoadVisuals(states);
  const issues=buildIssues(states,collisions);renderAnalyzer(states,collisions,issues,manual);
  lastAnalysis={states,collisions,issues};lastSignature=signature();
  if(manual){
    document.dispatchEvent(new CustomEvent('elektryk:power-check',{
      detail:{
        complete:states.length>0&&states.every(x=>x.complete)&&collisions.length===0&&!issues.some(i=>i.type==='error'),
        completeLoads:states.filter(x=>x.complete).length,
        totalLoads:states.length,
        collisions:collisions.length,
        errors:issues.filter(i=>i.type==='error').length
      }
    }));
  }
  return lastAnalysis;
}

const observer=new MutationObserver(()=>requestAnimationFrame(()=>{decorateSwitches();analyze(false)}));observer.observe(mountRoot,{childList:true,subtree:true});
setInterval(()=>{const s=signature();if(s!==lastSignature)analyze(false)},350);
decorateSwitches();analyze(false);
window.ElektrykPower={analyze:()=>analyze(true),getLast:()=>lastAnalysis};
})();