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

function roleAccepts(role,type){if(role==='L')return ['L1','L2','L3'].includes(type);if(role==='L1'||role==='L2'||role==='L3')return role===type;if(role==='N')return type==='N';if(role==='PE')return type==='PE';return false}
function wireAtEndpoint(id){return connections.find(c=>c.a===id||c.b===id)||null}
function bridgeAtEndpoint(id){return (window.ElektrykBridges?.getBridges?.()||[]).find(b=>b.a===id||b.b===id)||null}
function bridgePhaseConflict(id,phase){return (window.ElektrykBridges?.getBridges?.()||[]).some(b=>(b.a===id||b.b===id)&&b.phase!==phase)}
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
    const compatible=roleAccepts(t.dataset.role,selectedWire)&&!bridgePhaseConflict(t.dataset.terminal,selectedWire);
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
RCD4:{top:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']],bottom:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']]},
MCB:{top:[['L','L']],bottom:[['L','L']]},
RCBO:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
RCBO10:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
RCBO20:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},
SPD:{top:[['L','L'],['N','N']],bottom:[['PE','PE']]},
SPD4:{top:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']],bottom:[['PE','PE']]},
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
    center:(r.top+r.bottom)/2-c.top-cabinet.clientTop,
    index:Number(row.dataset.row||0)
  };
}
function ductCenter(which,lane=0){
  const duct=document.querySelector(which==='top'?'.top-duct':'.bottom-duct');
  if(!duct)return null;
  const r=duct.getBoundingClientRect(),c=cabinet.getBoundingClientRect();
  const center=r.top+r.height/2-c.top-cabinet.clientTop;
  return center+Math.max(-9,Math.min(9,lane));
}
function barKind(el){
  if(el.closest?.('.nbar'))return 'N';
  if(el.closest?.('.pebar'))return 'PE';
  return el.dataset.role==='N'?'N':el.dataset.role==='PE'?'PE':'';
}
function routeThroughChannel(A,B,EA,EB,which,lane){
  const y=ductCenter(which,lane);
  if(y==null)return null;
  return roundedPath([A,EA,{x:EA.x,y},{x:EB.x,y},EB,B],8);
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
function rectInCabinet(el){
  if(!el)return null;
  const r=el.getBoundingClientRect(),c=cabinet.getBoundingClientRect();
  return{
    left:r.left-c.left-cabinet.clientLeft,
    right:r.right-c.left-cabinet.clientLeft,
    top:r.top-c.top-cabinet.clientTop,
    bottom:r.bottom-c.top-cabinet.clientTop,
    width:r.width,
    height:r.height
  };
}
function endpointSide(el,zone,exit){
  if(zone==='top'||zone==='supply'||zone==='load-top')return 'top';
  if(zone==='bottom'||zone==='load')return 'bottom';
  if(zone==='bar')return barKind(el)==='PE'?'bottom':'top';
  return 'top';
}
function endpointEscape(P,el,zone,exit){
  const mounted=el.closest?.('.mounted-device');
  if(mounted){
    const r=rectInCabinet(mounted);
    if(zone==='top')return {x:P.x,y:r.top-9};
    if(zone==='bottom')return {x:P.x,y:r.bottom+9};
  }

  if(zone==='supply'){
    const r=rectInCabinet(el.closest?.('.supply-box'));
    return {x:P.x,y:(r?.bottom??P.y)+9};
  }
  if(zone==='load-top'){
    const r=rectInCabinet(el.closest?.('.circuit-node'));
    return {x:P.x,y:(r?.bottom??P.y)+8};
  }
  if(zone==='load'){
    const r=rectInCabinet(el.closest?.('.circuit-node'));
    return {x:P.x,y:(r?.top??P.y)-8};
  }
  if(zone==='bar'){
    const r=rectInCabinet(el.closest?.('.bar'));
    return barKind(el)==='PE'
      ?{x:P.x,y:(r?.bottom??P.y)+8}
      :{x:P.x,y:(r?.top??P.y)-8};
  }
  return {x:P.x,y:P.y};
}
function serviceSideX(EA,EB,connection,index){
  const c=cabinet.getBoundingClientRect();
  const z=document.querySelector('.din-zone')?.getBoundingClientRect();
  const n=parseInt(String(connection?.id||'W0').replace(/\D/g,''),10)||index||0;
  const spread=(n%6)*4;

  let left=14+spread;
  let right=cabinet.clientWidth-14-spread;
  if(z){
    const zoneLeft=z.left-c.left-cabinet.clientLeft;
    const zoneRight=z.right-c.left-cabinet.clientLeft;
    left=Math.max(8,zoneLeft-8-spread);
    right=Math.min(cabinet.clientWidth-8,zoneRight+8+spread);
  }

  const leftCost=Math.abs(EA.x-left)+Math.abs(EB.x-left);
  const rightCost=Math.abs(EA.x-right)+Math.abs(EB.x-right);
  return leftCost<=rightCost?left:right;
}
function sameRowServiceY(row,side,lane){
  if(!row)return null;
  const small=Math.max(-5,Math.min(5,lane*.35));
  return side==='top'
    ?row.top+4+small
    :row.bottom-12+small;
}
function smartRoute(A,B,a,b,type,connection,index){
  const az=a.dataset.zone||'',bz=b.dataset.zone||'';
  const aExit=a.closest?.('.circuit-node')?.dataset.exit||'';
  const bExit=b.closest?.('.circuit-node')?.dataset.exit||'';
  const routeAz=az==='load'&&aExit==='top-right'?'load-top':az;
  const routeBz=bz==='load'&&bExit==='top-right'?'load-top':bz;
  const lane=laneOffset(connection,index);
  const aRow=rowBounds(a),bRow=rowBounds(b);
  const sideA=endpointSide(a,routeAz,aExit);
  const sideB=endpointSide(b,routeBz,bExit);
  const EA=endpointEscape(A,a,routeAz,aExit);
  const EB=endpointEscape(B,b,routeBz,bExit);
  const aMounted=!!a.closest?.('.mounted-device');
  const bMounted=!!b.closest?.('.mounted-device');
  const sameRow=!!(aRow&&bRow&&aRow.index===bRow.index);

  // Dwa zaciski po tej samej stronie tego samego rzędu:
  // trasa biegnie w wolnym pasie nad / pod aparaturą, nigdy po froncie aparatów.
  if(aMounted&&bMounted&&sameRow&&sideA===sideB){
    const y=sameRowServiceY(aRow,sideA,lane);
    return roundedPath([
      A,EA,
      {x:EA.x,y},
      {x:EB.x,y},
      EB,B
    ],7);
  }

  // Wszystkie połączenia zmieniające stronę aparatu, rząd DIN albo strefę
  // zewnętrzną (WLZ, N/PE, odbiorniki) korzystają z pionowego korytarza
  // serwisowego POZA aparaturą. Dzięki temu przewód nie przecina wyłączników.
  const sideX=serviceSideX(EA,EB,connection,index);

  let yA=EA.y,yB=EB.y;
  if(aMounted&&aRow)yA=sameRowServiceY(aRow,sideA,lane);
  if(bMounted&&bRow)yB=sameRowServiceY(bRow,sideB,lane);

  const pts=[A,EA];

  if(Math.abs(EA.y-yA)>.5)pts.push({x:EA.x,y:yA});
  pts.push({x:sideX,y:yA});
  if(Math.abs(yA-yB)>.5)pts.push({x:sideX,y:yB});
  pts.push({x:EB.x,y:yB});
  if(Math.abs(EB.y-yB)>.5)pts.push(EB);
  pts.push(B);

  return roundedPath(pts,9);
}
function addPath(d,type,cls,cable=''){
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d',d);
  p.setAttribute('class',cls);
  p.dataset.wire=type;
  p.dataset.gauge=/2(?:[,.])5/.test(String(cable))?'2.5':'1.5';
  if(cls==='wire-path')p.setAttribute('stroke',COLORS[type]||'#d06a25');
  svg.appendChild(p);
}
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
    addPath(d,c.type,'wire-shadow',c.cable);addPath(d,c.type,'wire-path',c.cable);
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
function connectClick(el){const role=el.dataset.role,id=el.dataset.terminal;if(!roleAccepts(role,selectedWire)){markBad(el,`żyła ${selectedWire} nie pasuje do zacisku ${role}.`);return}if(bridgePhaseConflict(id,selectedWire)){markBad(el,'zacisk jest używany przez mostek lub grzebień innego toru.');return}if(endpointUsed(id)){markBad(el,'ten zacisk jest już zajęty. Usuń przewód lub wybierz inny zacisk.');return}if(!startTerminal){
  startTerminal={id,el,role};
  el.classList.add('start-terminal');
  refreshGuidance();
  status(`<b>PUNKT 1:</b> ${id}. Podświetlone mocniej zaciski są możliwym drugim końcem dla ${selectedWire}.`);
  return
}if(startTerminal.id===id){cancelStart();status('<b>ANULOWANO:</b> wybór pierwszego zacisku.');return}if(connections.some(c=>(c.a===startTerminal.id&&c.b===id)||(c.a===id&&c.b===startTerminal.id))){markBad(el,'takie połączenie już istnieje.');cancelStart();return}const cable=document.querySelector('.cable-buttons button.active')?.textContent.trim()||'';connections.push({id:'W'+wireSeq++,a:startTerminal.id,b:id,type:selectedWire,cable});startTerminal.el.classList.remove('start-terminal');startTerminal=null;refreshUsed();refreshGuidance();draw();updateCounters();status(`<b>POŁĄCZONO:</b> ${selectedWire} • ${cable||'przewód'} • ${connections[connections.length-1].a} → ${id}`,'success')}
function undoWire(){const c=connections.pop();if(!c)return;cancelStart();refreshUsed();draw();updateCounters();status(`<b>COFNIĘTO:</b> usunięto ${c.type} ${c.a} → ${c.b}.`)}
function clearWires(){connections=[];wireSeq=1;cancelStart();refreshUsed();draw();updateCounters();status('<b>OKABLOWANIE:</b> wszystkie przewody usunięte.')}
function setConnections(records=[]){
  cancelStart(false);
  connections=[...records].map((c,i)=>({
    id:String(c.id||('W'+(i+1))),
    a:String(c.a||''),
    b:String(c.b||''),
    type:String(c.type||'L1'),
    cable:String(c.cable||'')
  })).filter(c=>c.a&&c.b&&['L1','L2','L3','N','PE'].includes(c.type));
  const maxId=connections.reduce((m,c)=>Math.max(m,Number(String(c.id).replace(/\D/g,''))||0),0);
  wireSeq=maxId+1;
  requestAnimationFrame(()=>{
    decorateMounted();
    pruneConnections();
    refreshUsed();
    refreshGuidance();
    draw();
    updateCounters();
  });
  return connections.length;
}
document.getElementById('undoWire')?.addEventListener('click',undoWire);document.getElementById('clearWires')?.addEventListener('click',clearWires);
const observer=new MutationObserver(()=>requestAnimationFrame(decorateMounted));observer.observe(mountRoot,{childList:true,subtree:true});
decorateSupply();decorateBars();decorateCircuits();decorateMounted();refreshUsed();refreshGuidance();updateCounters();
window.addEventListener('resize',()=>requestAnimationFrame(draw));
window.ElektrykStage3={
  getConnections:()=>connections.map(c=>({...c})),
  setConnections,
  redraw:draw,
  clear:clearWires,
  refreshMounted:()=>{decorateMounted();refreshUsed();refreshGuidance();draw()},
  refreshTerminals:()=>{refreshUsed();refreshGuidance()},
  refreshGuidance,
  refreshBars:()=>{decorateBars();refreshUsed();refreshGuidance();draw()}
};
})();