(()=>{
const cabinet=document.querySelector('.cabinet-inner');
if(!cabinet)return;
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('bridge-layer');cabinet.appendChild(svg);
const labelLayer=document.createElement('div');labelLayer.className='bridge-label-layer';cabinet.appendChild(labelLayer);

let bridgeMode=false,combMode=false,start=null,bridges=[],seq=1,groupSeq=1;
const consoleBox=document.querySelector('.wiring-console');
let bridgeCount=null;

if(consoleBox){
  const box=document.createElement('div');box.className='bridge-console';box.innerHTML=
    '<div class="bridge-console-head"><b>MOSTKI / GRZEBIEŃ ZASILAJĄCY</b><span id="bridgePhase">L1</span></div>'+
    '<div class="bridge-mode-grid"><button id="bridgeModeBtn" class="bridge-mode-btn">⛓ MOSTEK — WYŁĄCZONY</button><button id="combModeBtn" class="bridge-mode-btn comb-mode-btn">▰ GRZEBIEŃ — WYŁĄCZONY</button></div>'+
    '<div class="bridge-help">MOSTEK: połącz dwa sąsiednie zabezpieczenia. GRZEBIEŃ: kliknij pierwszy i ostatni MCB/RCBO w jednym rzędzie, a zasilanie zostanie rozprowadzone po całym ciągu.</div>'+
    '<div class="bridge-actions"><button id="undoBridge">↩ COFNIJ OSTATNI</button><button id="clearBridges" class="danger">× USUŃ ZASILANIE</button></div>'+
    '<div class="bridge-counter"><span>Mostki / grzebienie</span><b id="bridgeCount">0</b></div>';
  consoleBox.appendChild(box);
  bridgeCount=box.querySelector('#bridgeCount');
  box.querySelector('#bridgeModeBtn').onclick=()=>toggleBridgeMode(!bridgeMode);
  box.querySelector('#combModeBtn').onclick=()=>toggleCombMode(!combMode);
  box.querySelector('#undoBridge').onclick=undoLast;
  box.querySelector('#clearBridges').onclick=clearBridges;
}

function selectedWireType(){
  const txt=document.querySelector('.wire.active')?.textContent.trim().toUpperCase();
  return ['L1','L2','L3','N'].includes(txt)?txt:'L1';
}
function selectedPhase(){
  const type=selectedWireType();
  return ['L1','L2','L3'].includes(type)?type:'L1';
}
function activeBridgeType(){return bridgeMode?selectedWireType():selectedPhase()}
function refreshPhase(){const el=document.getElementById('bridgePhase');if(el)el.textContent=activeBridgeType()}
document.querySelectorAll('.wire').forEach(w=>w.addEventListener('click',()=>{
  refreshPhase();
  if(bridgeMode||combMode){clearStart();highlightEligible();setStatus('Wybrano '+activeBridgeType()+'. Wybierz zaciski zasilania.')}
}));

function mountedOf(t){return t.closest('.mounted-device')}
function codeOf(t){return mountedOf(t)?.dataset.code||''}
function isBreakerCode(code){return code==='RCBO'||/^[BC]\d+$/.test(code)}
function isFrCode(code){return code==='FR'||code==='FR40'||code==='FR100'||code.startsWith('FR')}
function isFeedTargetCode(code){return code==='SPD'||code==='RCD'||code==='RCBO'||isBreakerCode(code)}
function roleMatchesConductor(role,type){
  if(type==='N')return role==='N';
  return role==='L'||role===type;
}
function eligibleBridge(t){
  if(!t?.classList.contains('wire-terminal'))return false;
  const code=codeOf(t),zone=t.dataset.zone,role=t.dataset.role;
  if(!['L','L1','L2','L3','N'].includes(role))return false;
  if(isFrCode(code))return zone==='bottom';
  if(isFeedTargetCode(code))return zone==='top';
  return false;
}
function eligibleComb(t){
  if(!t?.classList.contains('wire-terminal')||t.dataset.zone!=='top')return false;
  return isBreakerCode(codeOf(t))&&['L','L1','L2','L3'].includes(t.dataset.role);
}
function eligible(t){return bridgeMode?eligibleBridge(t):combMode?eligibleComb(t):false}
function terminalForDevice(m,phase){
  return [...m.querySelectorAll('.device-topterm .wire-terminal')].find(t=>eligibleComb(t)&&roleMatchesConductor(t.dataset.role,phase))||null;
}
function toggleBridgeMode(on){
  bridgeMode=on;combMode=false;clearStart();refreshButtons();highlightEligible();refreshPhase();
  setStatus(on?'Tryb MOSTEK: możesz łączyć MCB/RCBO oraz wykonać zasilanie FR dół → SPD/RCD/RCBO/MCB góra. Dostępny także tor N.':'Tryb mostków wyłączony.');
}
function toggleCombMode(on){
  combMode=on;bridgeMode=false;clearStart();refreshButtons();highlightEligible();refreshPhase();
  setStatus(on?'Tryb GRZEBIEŃ: kliknij pierwszy i ostatni wyłącznik w jednym rzędzie DIN.':'Tryb grzebienia wyłączony.');
}
function refreshButtons(){
  const b=document.getElementById('bridgeModeBtn'),c=document.getElementById('combModeBtn');
  if(b){b.classList.toggle('active',bridgeMode);b.textContent=bridgeMode?'⛓ MOSTEK — WŁĄCZONY':'⛓ MOSTEK — WYŁĄCZONY'}
  if(c){c.classList.toggle('active',combMode);c.textContent=combMode?'▰ GRZEBIEŃ — WŁĄCZONY':'▰ GRZEBIEŃ — WYŁĄCZONY'}
}
function highlightEligible(){
  const type=activeBridgeType();
  document.querySelectorAll('.wire-terminal').forEach(t=>t.classList.toggle('bridge-eligible',(bridgeMode||combMode)&&eligible(t)&&roleMatchesConductor(t.dataset.role,type)));
}
function clearStart(){if(start?.el)start.el.classList.remove('bridge-start');start=null}
function center(el){const r=el.getBoundingClientRect(),c=cabinet.getBoundingClientRect();return{x:r.left+r.width/2-c.left,y:r.top+r.height/2-c.top}}
function addPath(d,phase,cls,id,groupId){
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d',d);p.setAttribute('class',cls);p.dataset.phase=phase;p.dataset.bridgeId=id;
  if(groupId)p.dataset.groupId=groupId;svg.appendChild(p);
}
function addEnd(x,y,phase,id,groupId){
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','4.6');c.setAttribute('class','bridge-end');
  c.dataset.phase=phase;c.dataset.bridgeId=id;if(groupId)c.dataset.groupId=groupId;svg.appendChild(c);
}
function bridgePath(A,B,lift){
  const dir=B.x>=A.x?1:-1,r=Math.min(7,Math.abs(B.x-A.x)/4);
  return 'M '+A.x+' '+A.y+' L '+A.x+' '+(lift+r)+' Q '+A.x+' '+lift+' '+(A.x+dir*r)+' '+lift+' L '+(B.x-dir*r)+' '+lift+' Q '+B.x+' '+lift+' '+B.x+' '+(lift+r)+' L '+B.x+' '+B.y;
}
function bridgeExists(a,b){return bridges.some(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a))}
function redraw(){
  svg.innerHTML='';labelLayer.innerHTML='';
  bridges=bridges.filter(b=>document.querySelector('[data-terminal="'+CSS.escape(b.a)+'"]')&&document.querySelector('[data-terminal="'+CSS.escape(b.b)+'"]'));

  const combGroups=new Map();
  bridges.filter(b=>b.kind==='comb').forEach(b=>{if(!combGroups.has(b.groupId))combGroups.set(b.groupId,[]);combGroups.get(b.groupId).push(b)});

  bridges.filter(b=>b.kind!=='comb').forEach((b,i)=>{
    const a=document.querySelector('[data-terminal="'+CSS.escape(b.a)+'"]'),z=document.querySelector('[data-terminal="'+CSS.escape(b.b)+'"]');if(!a||!z)return;
    const A=center(a),B=center(z),lift=Math.min(A.y,B.y)-15-(i%2)*4,d=bridgePath(A,B,lift);
    addPath(d,b.phase,'bridge-shadow',b.id);addPath(d,b.phase,'bridge-path'+(b.kind==='feed'?' feed-path':''),b.id);addPath(d,b.phase,'bridge-highlight',b.id);addEnd(A.x,A.y,b.phase,b.id);addEnd(B.x,B.y,b.phase,b.id);
    addBadge((A.x+B.x)/2,lift-15,b.phase,b.kind==='feed'?'ZASILANIE':'MOSTEK',()=>removeBridge(b.id),false,b.kind==='feed');
  });

  let gi=0;
  combGroups.forEach((items,groupId)=>{
    const coords=[];
    items.forEach(b=>{
      const a=document.querySelector('[data-terminal="'+CSS.escape(b.a)+'"]'),z=document.querySelector('[data-terminal="'+CSS.escape(b.b)+'"]');if(!a||!z)return;
      const A=center(a),B=center(z),lift=Math.min(A.y,B.y)-21-(gi%2)*4,d=bridgePath(A,B,lift);
      coords.push(A,B);
      addPath(d,b.phase,'bridge-shadow comb-shadow',b.id,groupId);
      addPath(d,b.phase,'bridge-path comb-path',b.id,groupId);
      addPath(d,b.phase,'bridge-highlight comb-highlight',b.id,groupId);
      addEnd(A.x,A.y,b.phase,b.id,groupId);addEnd(B.x,B.y,b.phase,b.id,groupId);
    });
    if(coords.length){
      const minX=Math.min(...coords.map(p=>p.x)),maxX=Math.max(...coords.map(p=>p.x)),top=Math.min(...coords.map(p=>p.y))-38-(gi%2)*4;
      addBadge((minX+maxX)/2,top,items[0].phase,'GRZEBIEŃ',()=>removeGroup(groupId),true);
    }
    gi++;
  });
  updateStat();highlightEligible();
}
function addBadge(x,y,phase,label,onRemove,isComb=false,isFeed=false){
  const badge=document.createElement('button');badge.className='bridge-badge'+(isComb?' comb-badge':'')+(isFeed?' feed-badge':'');
  badge.dataset.phase=phase;
  badge.style.left=x+'px';badge.style.top=y+'px';badge.innerHTML='<span>'+phase+'</span><b>'+label+'</b><i>×</i>';
  badge.title='Kliknij, aby usunąć '+label.toLowerCase();badge.onclick=e=>{e.stopPropagation();onRemove()};labelLayer.appendChild(badge);
}
function updateStat(){
  const singles=bridges.filter(b=>b.kind!=='comb').length;
  const combs=new Set(bridges.filter(b=>b.kind==='comb').map(b=>b.groupId)).size;
  if(bridgeCount)bridgeCount.textContent=singles+' / '+combs;
  const p=document.querySelector('#wiringProgress span');
  if(p){let base=p.textContent.replace(/ • zasilanie: .*$/,'');p.textContent=base+' • zasilanie: '+singles+'M + '+combs+'G'}
}
function isAdjacent(a,b){
  const ma=mountedOf(a),mb=mountedOf(b);if(!ma||!mb||ma===mb||ma.dataset.row!==mb.dataset.row)return false;
  const ra=ma.getBoundingClientRect(),rb=mb.getBoundingClientRect();
  return Math.min(Math.abs(ra.right-rb.left),Math.abs(rb.right-ra.left))<12;
}
function sameRowRange(a,b){
  const ma=mountedOf(a),mb=mountedOf(b);if(!ma||!mb||ma.dataset.row!==mb.dataset.row)return null;
  const row=ma.dataset.row;
  const all=[...document.querySelectorAll('.mounted-device[data-row="'+row+'"]')].sort((x,y)=>x.getBoundingClientRect().left-y.getBoundingClientRect().left);
  const ia=all.indexOf(ma),ib=all.indexOf(mb);if(ia<0||ib<0)return null;
  return all.slice(Math.min(ia,ib),Math.max(ia,ib)+1);
}
function validBridgePair(a,b){
  if(!isAdjacent(a,b))return {ok:false,msg:'Mostek może łączyć tylko bezpośrednio sąsiednie aparaty w tym samym rzędzie.'};
  const ca=codeOf(a),cb=codeOf(b),za=a.dataset.zone,zb=b.dataset.zone;
  const aFr=isFrCode(ca),bFr=isFrCode(cb);
  if(aFr||bFr){
    const fr=aFr?a:b,target=aFr?b:a;
    if(fr.dataset.zone!=='bottom'||target.dataset.zone!=='top'||!isFeedTargetCode(codeOf(target))){
      return {ok:false,msg:'Z FR mostek wychodzi z dolnego zacisku do górnego zacisku SPD, RCD, RCBO lub MCB.'};
    }
    return {ok:true,kind:'feed'};
  }
  if(isBreakerCode(ca)&&isBreakerCode(cb)&&za==='top'&&zb==='top')return {ok:true,kind:'bridge'};
  return {ok:false,msg:'Ten typ aparatów nie może być połączony tym mostkiem.'};
}
function createBridge(t){
  const type=selectedWireType();
  if(!roleMatchesConductor(t.dataset.role,type)){flash(t);setStatus('Zacisk '+t.dataset.role+' nie pasuje do wybranego toru '+type+'.');return}
  if(!start){start={id:t.dataset.terminal,el:t,phase:type};t.classList.add('bridge-start');setStatus(type+': wybierz sąsiedni aparat.');return}
  if(start.id===t.dataset.terminal){clearStart();setStatus('Anulowano wybór.');return}
  if(start.phase!==type){clearStart();flash(t);setStatus('Zmieniono tor podczas tworzenia mostka. Zacznij ponownie.');return}
  if(!roleMatchesConductor(start.el.dataset.role,type)){clearStart();flash(t);setStatus('Pierwszy zacisk nie pasuje do toru '+type+'.');return}
  const pair=validBridgePair(start.el,t);
  if(!pair.ok){flash(t);clearStart();setStatus(pair.msg);return}
  if(bridgeExists(start.id,t.dataset.terminal)){flash(t);clearStart();setStatus('Takie połączenie już istnieje.');return}
  bridges.push({id:'BR'+seq++,a:start.id,b:t.dataset.terminal,phase:type,kind:pair.kind});
  clearStart();redraw();setStatus(pair.kind==='feed'?'Dodano mostek zasilający '+type+' z FR.':'Dodano mostek '+type+'.');
}
function createComb(t){
  const phase=selectedPhase();
  if(selectedWireType()==='N'){flash(t);setStatus('Grzebień działa dla faz L1/L2/L3. Wybierz fazę.');return}
  if(!roleMatchesConductor(t.dataset.role,phase)){flash(t);setStatus('Zacisk nie pasuje do fazy '+phase+'.');return}
  if(!start){start={id:t.dataset.terminal,el:t,phase};t.classList.add('bridge-start');setStatus(phase+': początek grzebienia wybrany. Kliknij ostatni wyłącznik.');return}
  if(start.id===t.dataset.terminal){clearStart();setStatus('Anulowano wybór grzebienia.');return}
  const devices=sameRowRange(start.el,t);
  if(!devices||devices.length<2){flash(t);clearStart();setStatus('Grzebień musi obejmować co najmniej dwa aparaty w tym samym rzędzie.');return}
  if(devices.some(m=>!isBreakerCode(m.dataset.code))){flash(t);clearStart();setStatus('Grzebień nie może przechodzić przez FR, RCD, SPD ani pustą sekcję.');return}
  for(let i=1;i<devices.length;i++){
    const ra=devices[i-1].getBoundingClientRect(),rb=devices[i].getBoundingClientRect();
    if(Math.abs(ra.right-rb.left)>=12){flash(t);clearStart();setStatus('Aparaty pod grzebieniem muszą stać bezpośrednio obok siebie.');return}
  }
  const terms=devices.map(m=>terminalForDevice(m,phase));
  if(terms.some(x=>!x)){flash(t);clearStart();setStatus('Nie wszystkie aparaty mają zgodny zacisk fazowy.');return}
  for(let i=1;i<terms.length;i++){
    if(bridgeExists(terms[i-1].dataset.terminal,terms[i].dataset.terminal)){flash(t);clearStart();setStatus('W tym zakresie istnieje już mostek lub grzebień.');return}
  }
  const groupId='G'+groupSeq++;
  for(let i=1;i<terms.length;i++){
    bridges.push({id:'BR'+seq++,a:terms[i-1].dataset.terminal,b:terms[i].dataset.terminal,phase,kind:'comb',groupId});
  }
  clearStart();redraw();setStatus('Założono grzebień '+phase+' na '+devices.length+' aparatach.');
}
function removeBridge(id){const b=bridges.find(x=>x.id===id);bridges=bridges.filter(x=>x.id!==id);redraw();if(b)setStatus('Usunięto mostek '+b.phase+'.')}
function removeGroup(groupId){const n=bridges.filter(x=>x.groupId===groupId).length;bridges=bridges.filter(x=>x.groupId!==groupId);redraw();if(n)setStatus('Usunięto grzebień zasilający.')}
function undoLast(){
  const last=bridges[bridges.length-1];if(!last)return;
  if(last.kind==='comb'&&last.groupId)removeGroup(last.groupId);else removeBridge(last.id);
}
function clearBridges(){bridges=[];clearStart();redraw();setStatus('Usunięto wszystkie mostki i grzebienie.')}
function flash(t){t.classList.add('bad-terminal');setTimeout(()=>t.classList.remove('bad-terminal'),500)}
function setStatus(txt){const s=document.getElementById('wiringStatus');if(s)s.innerHTML='<b>ZASILANIE:</b> '+txt}

cabinet.addEventListener('click',e=>{
  if(!(bridgeMode||combMode))return;
  const t=e.target.closest('.wire-terminal');
  if(t&&eligible(t)){e.stopPropagation();e.preventDefault();bridgeMode?createBridge(t):createComb(t)}
},true);

const obs=new MutationObserver(()=>requestAnimationFrame(redraw));
obs.observe(document.querySelector('.din-zone')||cabinet,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(redraw));
refreshPhase();refreshButtons();redraw();

window.ElektrykBridges={getBridges:()=>bridges.slice(),clear:clearBridges,redraw,remove:removeBridge,removeGroup};
})();