(()=>{
const cabinet=document.querySelector('.cabinet-inner');
const mountGrid=document.querySelector('.mount-grid');
if(!cabinet||!mountGrid)return;
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
function setWire(type){selectedWire=type;document.querySelectorAll('.wire').forEach(w=>w.classList.toggle('active',w.textContent.trim().toUpperCase()===type));if(modeLabel)modeLabel.textContent='Wybrano '+type;cancelStart();status(`<b>${type}:</b> kliknij pierwszy zacisk.`)}
document.querySelectorAll('.wire').forEach(w=>w.addEventListener('click',()=>setWire(w.textContent.trim().toUpperCase())));setWire('L1');

function roleAccepts(role,type){if(role==='L')return ['L1','L2','L3'].includes(type);if(role==='L1'||role==='L2'||role==='L3')return role===type;if(role==='N')return type==='N';if(role==='PE')return type==='PE';return true}
function endpointUsed(id){return connections.some(c=>c.a===id||c.b===id)}
function markBad(el,msg){wiringErrors++;el.classList.add('bad-terminal');setTimeout(()=>el.classList.remove('bad-terminal'),650);status('<b>BŁĄD:</b> '+msg,'error');updateCounters()}
function cancelStart(){if(startTerminal?.el)startTerminal.el.classList.remove('start-terminal');startTerminal=null}
function bindTerminal(el){if(el.dataset.wireBound)return;el.dataset.wireBound='1';el.addEventListener('click',e=>{e.stopPropagation();connectClick(el)})}
function wireTerminal(label,role,id,zone){const b=document.createElement('button');b.type='button';b.className='wire-terminal';b.textContent=label;b.dataset.role=role;b.dataset.terminal=id;b.dataset.zone=zone;bindTerminal(b);return b}
function decorateSupply(){document.querySelectorAll('.supply-terminals span').forEach((s,i)=>{const role=['L1','L2','L3','N','PE'][i];s.classList.add('wire-terminal');s.dataset.role=role;s.dataset.terminal='SUPPLY:'+role;s.dataset.zone='supply';bindTerminal(s)})}
function decorateBars(){[['.nbar','N'],['.pebar','PE']].forEach(([sel,role])=>{const bar=document.querySelector(sel),box=bar?.querySelector('.bar-screws');if(!box||box.dataset.wired)return;box.dataset.wired='1';box.innerHTML='';for(let i=1;i<=6;i++)box.appendChild(wireTerminal(String(i),role,`BAR:${role}:${i}`,'bar'))})}
function decorateCircuits(){const names=['LIGHT','SOCKET','KITCHEN','WASH'];document.querySelectorAll('.circuits>div').forEach((c,i)=>{if(c.querySelector('.circuit-terminals'))return;const row=document.createElement('div');row.className='circuit-terminals';row.appendChild(wireTerminal('L','L',`LOAD:${names[i]}:L`,'load'));row.lastChild.classList.add('terminal-l');row.appendChild(wireTerminal('N','N',`LOAD:${names[i]}:N`,'load'));row.lastChild.classList.add('terminal-n');row.appendChild(wireTerminal('PE','PE',`LOAD:${names[i]}:PE`,'load'));row.lastChild.classList.add('terminal-pe');c.appendChild(row)})}
const terminalMap={FR:{top:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']],bottom:[['L1','L1'],['L2','L2'],['L3','L3'],['N','N']]},RCD:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},B16:{top:[['L','L']],bottom:[['L','L']]},B10:{top:[['L','L']],bottom:[['L','L']]},RCBO:{top:[['L','L'],['N','N']],bottom:[['L','L'],['N','N']]},SPD:{top:[['L','L'],['N','N']],bottom:[['PE','PE']]}};
function decorateMounted(){document.querySelectorAll('.mounted-device').forEach(m=>{if(m.dataset.terminalsReady)return;const code=m.dataset.code,map=terminalMap[code];if(!map)return;m.dataset.terminalsReady='1';const top=m.querySelector('.device-topterm'),bottom=m.querySelector('.device-bottomterm');if(top){top.innerHTML='';map.top.forEach(([label,role],i)=>top.appendChild(wireTerminal(label,role,`${m.dataset.mountId}:TOP:${role}:${i}`,'top')))}if(bottom){bottom.innerHTML='';map.bottom.forEach(([label,role],i)=>bottom.appendChild(wireTerminal(label,role,`${m.dataset.mountId}:BOTTOM:${role}:${i}`,'bottom')))}});pruneConnections();draw()}
function terminalCenter(el){const r=el.getBoundingClientRect(),c=cabinet.getBoundingClientRect();return{x:r.left+r.width/2-c.left,y:r.top+r.height/2-c.top}}
function shortestRoute(A,B,a,b){
  const dx=Math.abs(B.x-A.x),dy=Math.abs(B.y-A.y);
  if(dx<2)return `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
  if(dy<2)return `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
  const az=a.dataset.zone||'',bz=b.dataset.zone||'';
  const aVertical=az==='top'||az==='bottom'||az==='supply';
  const bVertical=bz==='top'||bz==='bottom'||bz==='load';
  if(aVertical&&!bVertical)return `M ${A.x} ${A.y} L ${A.x} ${B.y} L ${B.x} ${B.y}`;
  if(!aVertical&&bVertical)return `M ${A.x} ${A.y} L ${B.x} ${A.y} L ${B.x} ${B.y}`;
  if(dx>=dy)return `M ${A.x} ${A.y} L ${B.x} ${A.y} L ${B.x} ${B.y}`;
  return `M ${A.x} ${A.y} L ${A.x} ${B.y} L ${B.x} ${B.y}`;
}
function addPath(d,type,cls){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',cls);p.dataset.wire=type;if(cls==='wire-path')p.setAttribute('stroke',COLORS[type]||'#d06a25');svg.appendChild(p)}
function draw(){svg.innerHTML='';connections.forEach(c=>{const a=document.querySelector(`[data-terminal="${CSS.escape(c.a)}"]`),b=document.querySelector(`[data-terminal="${CSS.escape(c.b)}"]`);if(!a||!b)return;const A=terminalCenter(a),B=terminalCenter(b),d=shortestRoute(A,B,a,b);addPath(d,c.type,'wire-shadow');addPath(d,c.type,'wire-path')})}
function refreshUsed(){document.querySelectorAll('.wire-terminal').forEach(t=>t.classList.toggle('used-terminal',endpointUsed(t.dataset.terminal)))}
function pruneConnections(){const before=connections.length;connections=connections.filter(c=>document.querySelector(`[data-terminal="${CSS.escape(c.a)}"]`)&&document.querySelector(`[data-terminal="${CSS.escape(c.b)}"]`));if(before!==connections.length){cancelStart();refreshUsed();updateCounters()}}
function connectClick(el){const role=el.dataset.role,id=el.dataset.terminal;if(!roleAccepts(role,selectedWire)){markBad(el,`żyła ${selectedWire} nie pasuje do zacisku ${role}.`);return}if(endpointUsed(id)){markBad(el,'ten zacisk jest już zajęty. Usuń przewód lub wybierz inny zacisk.');return}if(!startTerminal){startTerminal={id,el,role};el.classList.add('start-terminal');status(`<b>PUNKT 1:</b> ${id}. Teraz kliknij drugi zacisk dla ${selectedWire}.`);return}if(startTerminal.id===id){cancelStart();status('<b>ANULOWANO:</b> wybór pierwszego zacisku.');return}if(connections.some(c=>(c.a===startTerminal.id&&c.b===id)||(c.a===id&&c.b===startTerminal.id))){markBad(el,'takie połączenie już istnieje.');cancelStart();return}const cable=document.querySelector('.cable-buttons button.active')?.textContent.trim()||'';connections.push({id:'W'+wireSeq++,a:startTerminal.id,b:id,type:selectedWire,cable});startTerminal.el.classList.remove('start-terminal');startTerminal=null;refreshUsed();draw();updateCounters();status(`<b>POŁĄCZONO:</b> ${selectedWire} • ${cable||'przewód'} • ${connections[connections.length-1].a} → ${id}`,'success')}
function undoWire(){const c=connections.pop();if(!c)return;cancelStart();refreshUsed();draw();updateCounters();status(`<b>COFNIĘTO:</b> usunięto ${c.type} ${c.a} → ${c.b}.`)}
function clearWires(){connections=[];cancelStart();refreshUsed();draw();updateCounters();status('<b>OKABLOWANIE:</b> wszystkie przewody usunięte.')}
document.getElementById('undoWire')?.addEventListener('click',undoWire);document.getElementById('clearWires')?.addEventListener('click',clearWires);
const observer=new MutationObserver(()=>requestAnimationFrame(decorateMounted));observer.observe(mountGrid,{childList:true,subtree:true});
decorateSupply();decorateBars();decorateCircuits();decorateMounted();updateCounters();
window.addEventListener('resize',()=>requestAnimationFrame(draw));
window.ElektrykStage3={getConnections:()=>connections.slice(),redraw:draw,clear:clearWires};
})();