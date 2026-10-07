(()=>{
const cabinet=document.querySelector('.cabinet-inner');
const mountRoot=document.querySelector('.din-zone');
if(!cabinet||!mountRoot)return;
const COLORS={L1:'#8b4a17',L2:'#161819',L3:'#777f83',N:'#0989d8',PE:'#76a52d'};
let selectedWire='L1',startTerminal=null,connections=[],wireSeq=1,wiringErrors=0;

const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('wire-layer');cabinet.appendChild(svg);
const cablePanel=document.querySelector('.cable-panel');
const consoleBox=document.createElement('div');consoleBox.className='wiring-console';consoleBox.innerHTML='<div class="wiring-console-head"><b>OKABLOWANIE</b><span id="wireModeLabel">Wybrano L1</span></div><div class="wiring-status" id="wiringStatus"><b>ETAP 3:</b> wybierz żyłę, kliknij pierwszy zacisk, a potem drugi.</div><div class="wiring-actions"><button id="undoWire">↩ COFNIJ PRZEWÓD</button><button id="clearWires" class="danger">× USUŃ PRZEWODY</button></div>';if(cablePanel)cablePanel.appendChild(consoleBox);
const activeTask=document.querySelector('.active-task');if(activeTask){const p=document.createElement('div');p.className='wiring-progress';p.id='wiringProgress';p.innerHTML='<b>ETAP 3 • OKABLOWANIE</b><span>0 połączeń</span>';activeTask.appendChild(p)}
const statusEl=document.getElementById('wiringStatus'),modeLabel=document.getElementById('wireModeLabel');
const footerStats=document.querySelectorAll('.workspace-footer b'),connectionStat=footerStats[1]||null;
function status(text,state=''){if(!statusEl)return;statusEl.className='wiring-status'+(state?' '+state:'');statusEl.innerHTML=text}
function updateCounters(){if(connectionStat)connectionStat.textContent=connections.length;const p=document.querySelector('#wiringProgress span');if(p)p.textContent=`${connections.length} połączeń • ${wiringErrors} bł.`}
function setWire(type){
  selectedWire=type;
  document.querySelectorAll('.wire').forEach(w=>w.classList.toggle('active',w.textContent.trim().toUpperCase()===type));
  if(modeLabel)modeLabel.textContent='Wybrano '+type;
  cancelStart(false);
  refreshGuidance();
  status(`<b>${type}:</b> podświetlone są wolne zaciski pasujące do tej żyły.`);
}
document.querySelectorAll('.wire').forEach(w=>w.addEventListener('click',()=>setWire(w.textContent.trim().toUpperCase())));setWire('L1');

function roleAccepts(role,type){if(role==='L')return ['L1','L2','L3'].includes(type);if(role==='L1'||role==='L2'||role==='L3')return role===type;if(role==='N')return type==='N';if(role==='PE')return type==='PE';return true}
function wireAtEndpoint(id){return connections.find(c=>c.a===id||c.b===id)||null}
function bridgeAtEndpoint(id){return window.ElektrykBridges?.getBridges?.().find(b=>b.a===id||b.b===id)||null}
function endpointUsed(id){return !!wireAtEndpoint(id)}
function markBad(el,msg){wiringErrors++;el.classList.add('bad-terminal');setTimeout(()=>el.classList.remove('bad-terminal'),650);status('<b>BŁĄD:</b> '+msg,'error');updateCounters()}
function clearGuidance(){
  document.querySelectorAll('.wire-terminal').forEach(t=>{
    t.classList.remove('guide-compatible','guide-target','guide-dim','guide-source');
  });
}
function isWireFree(el){return !endpointUsed(el.dataset.terminal)}
function refreshGuidance(){
  clearGuidance();
  document.querySelectorAll('.wire-terminal').forEach(t=>{
    const compatible=roleAccepts(t.dataset.role,selectedWire);
    const free=isWireFree(t);
    if(startTerminal){
      if(t===startTerminal.el){t.classList.add('guide-source');return}
      if(compatible&&free)t.classList.add('guide-target');
      else t.classList.add('guide-dim');
    }else{
      if(compatible&&free)t.classList.add('guide-compatible');
      else if(!t.classList.contains('used-terminal'))t.classList.add('guide-dim');
    }
  });
}
function cancelStart(refresh=true){
  if(startTerminal?.el)startTerminal.el.classList.remove('start-terminal');
  startTerminal=null;
  if(refresh)refreshGuidance();
}
function bindTerminal(el){if(el.dataset.wireBound)return;el.dataset.wireBound='1';el.addEventListener('click',e=>{e.stopPropagation();connectClick(el)})}
function wireTerminal(label,role,id,zone){
  const b=document.createElement('button');
  b.type='button';b.className='wire-terminal';b.textContent=label;
  b.dataset.role=role;b.dataset.terminal=id;b.dataset.zone=zone;
  bindTerminal(b);
  return b
}
function decorateSupply(){
  document.querySelectorAll('.supply-terminals span').forEach((s,i)=>{
    const role=['L1','L2','L3','N','PE'][i];
    s.classList.add('wire-terminal');
    s.dataset.role=role;
    s.dataset.terminal='SUPPLY:'+role;
    s.dataset.zone='supply';
    s.dataset.supplyIndex=String(i+1);
    s.title='WLZ '+role+' • WOLNY';
    bindTerminal(s);
  });
}
function decorateBars(){[['.nbar','N'],['.pebar','PE']].forEach(([sel,role])=>{const bar=document.querySelector(sel),box=bar?.querySelector('.bar-screws');if(!box)return;const count=Math.max(1,parseInt(box.dataset.count||'12',10)||12),stamp=role+':'+count;if(box.dataset.wired===stamp&&box.querySelectorAll('.wire-terminal').length===count)return;box.dataset.wired=stamp;box.innerHTML='';for(let i=1;i<=count;i++)box.appendChild(wireTerminal(String(i),role,`BAR:${role}:${i}`,'bar'))})}
function decorateCircuits(){
  const defs=[
    {id:'LIGHT',cable:'YDYp 3×1,5'},
    {id:'SOCKET',cable:'YDYp 3×2,5'},
    {id:'KITCHEN',cable:'YDYp 3×2,5'},
    {id:'WASH',cable:'YDYp 3×2,5'}
  ];
  document.querySelectorAll('.circuits>div').forEach((c,i)=>{
    const def=defs[i];if(!def)return;
    c.classList.add('circuit-node');
    c.dataset.circuit=def.id;
    if(!c.dataset.exit)c.dataset.exit='bottom';
    const small=c.querySelector('small');if(small)small.textContent=def.cable;
    if(!c.querySelector('.circuit-cable-visual')){
      const visual=document.createElement('div');
      visual.className='circuit-cable-visual';
      visual.innerHTML='<span class="circuit-sheath"></span><span class="circuit-core core-l"></span><span class="circuit-core core-n"></span><span class="circuit-core core-pe"></span>';
      c.appendChild(visual);
    }
    if(!c.querySelector('.circuit-terminals')){
      const row=document.createElement('div');row.className='circuit-terminals';
      row.appendChild(wireTerminal('L','L',`LOAD:${def.id}:L`,'load'));row.lastChild.classList.add('terminal-l');
      row.appendChild(wireTerminal('N','N',`LOAD:${def.id}:N`,'load'));row.lastChild.classList.add('terminal-n');
      row.appendChild(wireTerminal('PE','PE',`LOAD:${def.id}:PE`,'load'));row.lastChild.classList.add('terminal-pe');
      c.appendChild(row);
    }
  })
}
const terminalMap={
FR:{top:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']],bottom:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']]},
FR40:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
FR100:{top:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']],bottom:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']]},
RCD:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
MCB:{top:[['L','L']],bottom:[['L','L']]},
RCBO:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
SPD:{top:[['L','L'],['N','N']],bottom:[['PE','PE']]},
NTB:{top:[['N1','N'],['N2','N'],['N3','N'],['N4','N']],bottom:[['N5','N'],['N6','N'],['N7','N'],['N8','N']]},
PETB:{top:[['PE1','PE'],['PE2','PE'],['PE3','PE'],['PE4','PE']],bottom:[['PE5','PE'],['PE6','PE'],['PE7','PE'],['PE8','PE']]},
NTB12:{top:[['N1','N'],['N2','N'],['N3','N'],['N4','N'],['N5','N'],['N6','N']],bottom:[['N7','N'],['N8','N'],['N9','N'],['N10','N'],['N11','N'],['N12','N']]},
PETB12:{top:[['PE1','PE'],['PE2','PE'],['PE3','PE'],['PE4','PE'],['PE5','PE'],['PE6','PE']],bottom:[['PE7','PE'],['PE8','PE'],['PE9','PE'],['PE10','PE'],['PE11','PE'],['PE12','PE']]}
};
function mcbMapFor(code){
  const m=String(code||'').match(/^([BC]\d+)(?:_(2P|3P))?$/);
  if(!m)return null;
  const poles=m[2]==='3P'?3:m[2]==='2P'?2:1;
  if(poles===1)return terminalMap.MCB;
  const roles=poles===3?['L1','L2','L3']:['L1','L2'];
  return{
    top:roles.map((role,i)=>[String(i*2+1),role]),
    bottom:roles.map((role,i)=>[String(i*2+2),role])
  };
}
function decorateMounted(){
  document.querySelectorAll('.mounted-device').forEach(m=>{
    if(m.dataset.terminalsReady)return;
    const code=m.dataset.code,map=terminalMap[code]||mcbMapFor(code);
    if(!map)return;
    m.dataset.terminalsReady='1';
    const top=m.querySelector('.device-topterm'),bottom=m.querySelector('.device-bottomterm');
    if(top){top.innerHTML='';map.top.forEach(([label,role],i)=>top.appendChild(wireTerminal(label,role,`${m.dataset.mountId}:TOP:${role}:${i}`,'top')))}
    if(bottom){bottom.innerHTML='';map.bottom.forEach(([label,role],i)=>bottom.appendChild(wireTerminal(label,role,`${m.dataset.mountId}:BOTTOM:${role}:${i}`,'bottom')))}
  });
  pruneConnections();refreshUsed();refreshGuidance();draw()
}
function terminalCenter(el){
  const r=el.getBoundingClientRect(),c=cabinet.getBoundingClientRect();
  return{
    x:r.left+r.width/2-c.left-cabinet.clientLeft,
    y:r.top+r.height/2-c.top-cabinet.clientTop
  };
}
function laneOffset(connection,index){
  const n=parseInt(String(connection?.id||'W0').replace(/\D/g,''),10)||index||0;
  const lanes=[-12,-8,-4,0,4,8,12];
  return lanes[n%lanes.length];
}
function rowBounds(el){
  const row=el.closest?.('.din-row');
  if(!row)return null;
  const r=row.getBoundingClientRect(),c=cabinet.getBoundingClientRect();
  return{
    top:r.top-c.top-cabinet.clientTop,
    bottom:r.bottom-c.top-cabinet.clientTop,
    center:(r.top+r.bottom)/2-c.top-cabinet.clientTop
  };
}
function dedupePoints(points){
  const out=[];
  points.forEach(p=>{
    const last=out[out.length-1];
    if(!last||Math.abs(last.x-p.x)>.5||Math.abs(last.y-p.y)>.5)out.push(p);
  });
  let changed=true;
  while(changed&&out.length>2){
    changed=false;
    for(let i=1;i<out.length-1;i++){
      const a=out[i-1],b=out[i],c=out[i+1];
      if((Math.abs(a.x-b.x)<.5&&Math.abs(b.x-c.x)<.5)||(Math.abs(a.y-b.y)<.5&&Math.abs(b.y-c.y)<.5)){
        out.splice(i,1);changed=true;break;
      }
    }
  }
  return out;
}
function roundedPath(points,radius=7){
  const pts=dedupePoints(points);
  if(pts.length<2)return '';
  let d=`M ${pts[0].x} ${pts[0].y}`;
  for(let i=1;i<pts.length-1;i++){
    const p0=pts[i-1],p=pts[i],p1=pts[i+1];
    const d0=Math.hypot(p.x-p0.x,p.y-p0.y);
    const d1=Math.hypot(p1.x-p.x,p1.y-p.y);
    const r=Math.min(radius,d0/2,d1/2);
    const a={x:p.x+(p0.x-p.x)*(r/d0),y:p.y+(p0.y-p.y)*(r/d0)};
    const b={x:p.x+(p1.x-p.x)*(r/d1),y:p.y+(p1.y-p.y)*(r/d1)};
    d+=` L ${a.x} ${a.y} Q ${p.x} ${p.y} ${b.x} ${b.y}`;
  }
  const last=pts[pts.length-1];
  return d+` L ${last.x} ${last.y}`;
}
function smartRoute(A,B,a,b,type,connection,index){
  const az=a.dataset.zone||'',bz=b.dataset.zone||'';
  const aExit=a.closest?.('.circuit-node')?.dataset.exit||'';
  const bExit=b.closest?.('.circuit-node')?.dataset.exit||'';
  const routeAz=az==='load'&&aExit==='top-right'?'load-top':az;
  const routeBz=bz==='load'&&bExit==='top-right'?'load-top':bz;
  const lane=laneOffset(connection,index);
  const aRow=rowBounds(a),bRow=rowBounds(b);
  const aTop=az==='top',aBottom=az==='bottom',bTop=bz==='top',bBottom=bz==='bottom';
  const points=[A];

  // Bezpośrednie pionowe wyjście z zacisku — przewód nie skręca przy samej śrubie.
  const escape=(P,zone,row,side)=>{
    if(zone==='top')return {x:P.x,y:P.y-18};
    if(zone==='bottom')return {x:P.x,y:P.y+18};
    if(zone==='supply')return {x:P.x,y:P.y+22};
    if(zone==='load')return {x:P.x,y:P.y-22};
    if(zone==='load-top')return {x:P.x,y:P.y+22};
    if(zone==='bar')return {x:P.x,y:P.y+(side==='a'?-12:12)};
    return {x:P.x,y:P.y};
  };
  const EA=escape(A,routeAz,aRow,'a'),EB=escape(B,routeBz,bRow,'b');
  points.push(EA);

  // WLZ -> aparat/listwa: wspólny górny korytarz.
  if(az==='supply'||bz==='supply'){
    const supplyFirst=az==='supply';
    const S=supplyFirst?EA:EB,T=supplyFirst?EB:EA;
    const targetRow=supplyFirst?bRow:aRow;
    const corridor=Math.max(150,(targetRow?.top??190)-28+lane);
    const route=[S,{x:S.x,y:corridor},{x:T.x,y:corridor},T];
    if(supplyFirst){points.splice(1,points.length-1,...route.slice(0,-1));points.push(B)}
    else{
      const rev=[...route].reverse();
      points.splice(1,points.length-1,...rev.slice(0,-1));points.push(B);
    }
    return roundedPath(points,8);
  }

  // Wyjścia do odbiorników: korytarz pod ostatnim rzędem DIN.
  if(az==='load'||bz==='load'){
    const loadFirst=az==='load';
    const L=loadFirst?EA:EB,T=loadFirst?EB:EA;
    const row=loadFirst?bRow:aRow;
    const exit=loadFirst?aExit:bExit;
    const corridor=exit==='top-right'
      ?(row?.top??190)-30+lane
      :(row?.bottom??(Math.min(A.y,B.y)-35))+30+lane;
    const route=[L,{x:L.x,y:corridor},{x:T.x,y:corridor},T];
    if(loadFirst){points.splice(1,points.length-1,...route.slice(0,-1));points.push(B)}
    else{
      const rev=[...route].reverse();
      points.splice(1,points.length-1,...rev.slice(0,-1));points.push(B);
    }
    return roundedPath(points,8);
  }

  // Ten sam rząd: zaciski górne idą nad aparaturą, dolne pod aparaturą.
  if(aRow&&bRow&&Math.abs(aRow.center-bRow.center)<5){
    const useTop=(aTop&&bTop)||(!aBottom&&!bBottom&&A.y<=aRow.center&&B.y<=bRow.center);
    const corridor=useTop?aRow.top-22+lane:aRow.bottom-22+lane;
    points.push({x:EA.x,y:corridor},{x:EB.x,y:corridor},EB,B);
    return roundedPath(points,8);
  }

  // Różne rzędy DIN: przewód wykorzystuje wolną strefę pomiędzy rzędami.
  if(aRow&&bRow){
    const upper=aRow.center<bRow.center?aRow:bRow;
    const lower=aRow.center<bRow.center?bRow:aRow;
    const corridor=(upper.bottom+lower.top)/2+lane;
    points.push({x:EA.x,y:corridor},{x:EB.x,y:corridor},EB,B);
    return roundedPath(points,8);
  }

  // Listwy N/PE i pozostałe punkty: ortogonalnie, ale z odsunięciem torów.
  const dx=Math.abs(B.x-A.x),dy=Math.abs(B.y-A.y);
  if(dx<2||dy<2)return roundedPath([A,B],8);
  const midY=(A.y+B.y)/2+lane;
  points.push({x:EA.x,y:midY},{x:EB.x,y:midY},EB,B);
  return roundedPath(points,8);
}
function addPath(d,type,cls){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',cls);p.dataset.wire=type;if(cls==='wire-path')p.setAttribute('stroke',COLORS[type]||'#d06a25');svg.appendChild(p)}
function addFerrule(P,Q,type){
  const dx=Q.x-P.x,dy=Q.y-P.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const sx=P.x+ux*2,sy=P.y+uy*2;
  const ex=P.x+ux*10,ey=P.y+uy*10;
  const metal=document.createElementNS('http://www.w3.org/2000/svg','line');
  metal.setAttribute('x1',sx);metal.setAttribute('y1',sy);metal.setAttribute('x2',ex);metal.setAttribute('y2',ey);
  metal.setAttribute('class','wire-ferrule-metal');metal.dataset.wire=type;svg.appendChild(metal);
  const collar=document.createElementNS('http://www.w3.org/2000/svg','circle');
  collar.setAttribute('cx',P.x+ux*11.5);collar.setAttribute('cy',P.y+uy*11.5);collar.setAttribute('r','3.8');
  collar.setAttribute('class','wire-ferrule-collar');collar.dataset.wire=type;svg.appendChild(collar);
}
function draw(){
  svg.innerHTML='';
  connections.forEach(c=>{
    const a=document.querySelector(`[data-terminal="${CSS.escape(c.a)}"]`),b=document.querySelector(`[data-terminal="${CSS.escape(c.b)}"]`);
    if(!a||!b)return;
    const A=terminalCenter(a),B=terminalCenter(b),d=smartRoute(A,B,a,b,c.type,c,connections.indexOf(c));
    addPath(d,c.type,'wire-shadow');addPath(d,c.type,'wire-path');
    addFerrule(A,B,c.type);addFerrule(B,A,c.type);
  })
}
function refreshUsed(){
  document.querySelectorAll('.wire-terminal').forEach(t=>{
    const id=t.dataset.terminal;
    const wire=wireAtEndpoint(id);
    const bridge=bridgeAtEndpoint(id);
    const used=!!(wire||bridge);
    t.classList.toggle('used-terminal',used);
    t.classList.toggle('used-by-wire',!!wire);
    t.classList.toggle('used-by-bridge',!!bridge&&!wire);
    if(wire)t.dataset.usedWire=wire.type;
    else if(bridge)t.dataset.usedWire=bridge.phase||'BRIDGE';
    else delete t.dataset.usedWire;
    t.dataset.connectionState=used?'used':'free';
    t.title=used
      ?('ZAJĘTY • '+(wire?('PRZEWÓD '+wire.type):('MOSTEK '+(bridge?.phase||''))))
      :('WOLNY • '+(t.dataset.role||'zacisk'));
  });
  refreshGuidance();
}
function pruneConnections(){const before=connections.length;connections=connections.filter(c=>document.querySelector(`[data-terminal="${CSS.escape(c.a)}"]`)&&document.querySelector(`[data-terminal="${CSS.escape(c.b)}"]`));if(before!==connections.length){cancelStart();refreshUsed();updateCounters()}}
function connectClick(el){const role=el.dataset.role,id=el.dataset.terminal;if(!roleAccepts(role,selectedWire)){markBad(el,`żyła ${selectedWire} nie pasuje do zacisku ${role}.`);return}if(endpointUsed(id)){markBad(el,'ten zacisk jest już zajęty. Usuń przewód lub wybierz inny zacisk.');return}if(!startTerminal){
  startTerminal={id,el,role};
  el.classList.add('start-terminal');
  refreshGuidance();
  status(`<b>PUNKT 1:</b> ${id}. Podświetlone mocniej zaciski są możliwym drugim końcem dla ${selectedWire}.`);
  return
}if(startTerminal.id===id){cancelStart();status('<b>ANULOWANO:</b> wybór pierwszego zacisku.');return}if(connections.some(c=>(c.a===startTerminal.id&&c.b===id)||(c.a===id&&c.b===startTerminal.id))){markBad(el,'takie połączenie już istnieje.');cancelStart();return}const cable=document.querySelector('.cable-buttons button.active')?.textContent.trim()||'';connections.push({id:'W'+wireSeq++,a:startTerminal.id,b:id,type:selectedWire,cable});startTerminal.el.classList.remove('start-terminal');startTerminal=null;refreshUsed();refreshGuidance();draw();updateCounters();status(`<b>POŁĄCZONO:</b> ${selectedWire} • ${cable||'przewód'} • ${connections[connections.length-1].a} → ${id}`,'success')}
function undoWire(){const c=connections.pop();if(!c)return;cancelStart();refreshUsed();draw();updateCounters();status(`<b>COFNIĘTO:</b> usunięto ${c.type} ${c.a} → ${c.b}.`)}
function clearWires(){connections=[];cancelStart();refreshUsed();draw();updateCounters();status('<b>OKABLOWANIE:</b> wszystkie przewody usunięte.')}
document.getElementById('undoWire')?.addEventListener('click',undoWire);document.getElementById('clearWires')?.addEventListener('click',clearWires);
const observer=new MutationObserver(()=>requestAnimationFrame(decorateMounted));observer.observe(mountRoot,{childList:true,subtree:true});
decorateSupply();decorateBars();decorateCircuits();decorateMounted();refreshUsed();refreshGuidance();updateCounters();
window.addEventListener('resize',()=>requestAnimationFrame(draw));
window.ElektrykStage3={getConnections:()=>connections.slice(),redraw:draw,clear:clearWires,refreshTerminals:()=>{refreshUsed();refreshGuidance()},refreshGuidance,refreshBars:()=>{decorateBars();refreshUsed();refreshGuidance();draw()}};
})();