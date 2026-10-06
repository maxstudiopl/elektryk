(()=>{
const cabinet=document.querySelector('.cabinet-inner');
if(!cabinet)return;
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('bridge-layer');cabinet.appendChild(svg);
const labelLayer=document.createElement('div');labelLayer.className='bridge-label-layer';cabinet.appendChild(labelLayer);
let bridgeMode=false,start=null,bridges=[],seq=1;
const consoleBox=document.querySelector('.wiring-console');
let bridgeCount=null;
if(consoleBox){
  const box=document.createElement('div');box.className='bridge-console';box.innerHTML=`
    <div class="bridge-console-head"><b>MOSTKI ZASILAJĄCE</b><span id="bridgePhase">L1</span></div>
    <button id="bridgeModeBtn" class="bridge-mode-btn">⛓ TRYB MOSTKÓW — WYŁĄCZONY</button>
    <div class="bridge-help">Wybierz fazę L1/L2/L3 po prawej. Włącz tryb i kliknij górny zacisk pierwszego zabezpieczenia, następnie górny zacisk sąsiedniego. Mostek łączy zasilanie kolejnych B10/B16/RCBO.</div>
    <div class="bridge-actions"><button id="undoBridge">↩ COFNIJ MOSTEK</button><button id="clearBridges" class="danger">× USUŃ MOSTKI</button></div>
    <div class="bridge-counter"><span>Zamontowane mostki</span><b id="bridgeCount">0</b></div>`;
  consoleBox.appendChild(box);
  bridgeCount=box.querySelector('#bridgeCount');
  box.querySelector('#bridgeModeBtn').onclick=()=>toggleMode(!bridgeMode);
  box.querySelector('#undoBridge').onclick=undoBridge;
  box.querySelector('#clearBridges').onclick=clearBridges;
}
function selectedPhase(){const txt=document.querySelector('.wire.active')?.textContent.trim().toUpperCase();return ['L1','L2','L3'].includes(txt)?txt:'L1'}
function refreshPhase(){const el=document.getElementById('bridgePhase');if(el)el.textContent=selectedPhase()}
document.querySelectorAll('.wire').forEach(w=>w.addEventListener('click',()=>{refreshPhase();if(bridgeMode){clearStart();highlightEligible();setStatus(`Wybrano ${selectedPhase()}. Kliknij pierwszy górny zacisk L.`)}}));
function mountedOf(t){return t.closest('.mounted-device')}
function codeOf(t){return mountedOf(t)?.dataset.code||''}
function eligible(t){if(!t?.classList.contains('wire-terminal'))return false;if(t.dataset.zone!=='top')return false;const code=codeOf(t);if(!['B10','B16','RCBO'].includes(code))return false;return ['L','L1','L2','L3'].includes(t.dataset.role)}
function roleMatchesPhase(role,phase){return role==='L'||role===phase}
function toggleMode(on){bridgeMode=on;const btn=document.getElementById('bridgeModeBtn');if(btn){btn.classList.toggle('active',on);btn.textContent=on?'⛓ TRYB MOSTKÓW — WŁĄCZONY':'⛓ TRYB MOSTKÓW — WYŁĄCZONY'}clearStart();highlightEligible();refreshPhase();setStatus(on?`Aktywny ${selectedPhase()}. Kliknij górny zacisk pierwszego zabezpieczenia, potem sąsiedniego.`:'Tryb mostków wyłączony. Zwykłe przewody działają normalnie.')}
function highlightEligible(){document.querySelectorAll('.wire-terminal').forEach(t=>t.classList.toggle('bridge-eligible',bridgeMode&&eligible(t)&&roleMatchesPhase(t.dataset.role,selectedPhase())))}
function clearStart(){if(start?.el)start.el.classList.remove('bridge-start');start=null}
function center(el){const r=el.getBoundingClientRect(),c=cabinet.getBoundingClientRect();return{x:r.left+r.width/2-c.left,y:r.top+r.height/2-c.top}}
function addPath(d,phase,cls,id){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class',cls);p.dataset.phase=phase;p.dataset.bridgeId=id;svg.appendChild(p)}
function addEnd(x,y,phase,id){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','4.6');c.setAttribute('class','bridge-end');c.dataset.phase=phase;c.dataset.bridgeId=id;svg.appendChild(c)}
function bridgePath(A,B,lift){const dir=B.x>=A.x?1:-1;const r=Math.min(7,Math.abs(B.x-A.x)/4);return `M ${A.x} ${A.y} L ${A.x} ${lift+r} Q ${A.x} ${lift} ${A.x+dir*r} ${lift} L ${B.x-dir*r} ${lift} Q ${B.x} ${lift} ${B.x} ${lift+r} L ${B.x} ${B.y}`}
function redraw(){
  svg.innerHTML='';labelLayer.innerHTML='';
  bridges=bridges.filter(b=>document.querySelector(`[data-terminal="${CSS.escape(b.a)}"]`)&&document.querySelector(`[data-terminal="${CSS.escape(b.b)}"]`));
  bridges.forEach((b,i)=>{
    const a=document.querySelector(`[data-terminal="${CSS.escape(b.a)}"]`),z=document.querySelector(`[data-terminal="${CSS.escape(b.b)}"]`);if(!a||!z)return;
    const A=center(a),B=center(z),lift=Math.min(A.y,B.y)-15-(i%2)*4,d=bridgePath(A,B,lift);
    addPath(d,b.phase,'bridge-shadow',b.id);addPath(d,b.phase,'bridge-path',b.id);addPath(d,b.phase,'bridge-highlight',b.id);addEnd(A.x,A.y,b.phase,b.id);addEnd(B.x,B.y,b.phase,b.id);
    const badge=document.createElement('button');badge.className='bridge-badge';badge.dataset.bridgeId=b.id;badge.style.left=((A.x+B.x)/2)+'px';badge.style.top=(lift-15)+'px';badge.innerHTML=`<span>${b.phase}</span><b>MOSTEK</b><i>×</i>`;badge.title='Kliknij, aby usunąć ten mostek';badge.onclick=e=>{e.stopPropagation();removeBridge(b.id)};labelLayer.appendChild(badge);
  });updateStat();highlightEligible()
}
function updateStat(){if(bridgeCount)bridgeCount.textContent=bridges.length;let p=document.querySelector('#wiringProgress span');if(p){let base=p.textContent.replace(/ • mostki: \d+/,'');p.textContent=base+` • mostki: ${bridges.length}`}}
function isAdjacent(a,b){const ma=mountedOf(a),mb=mountedOf(b);if(!ma||!mb||ma===mb)return false;const ra=ma.getBoundingClientRect(),rb=mb.getBoundingClientRect();const gap=Math.min(Math.abs(ra.right-rb.left),Math.abs(rb.right-ra.left));return gap<12}
function bridgeExists(a,b){return bridges.some(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a))}
function click(t){
  if(!bridgeMode||!eligible(t))return;
  const phase=selectedPhase();
  if(!roleMatchesPhase(t.dataset.role,phase)){flash(t);setStatus(`Zacisk ${t.dataset.role} nie pasuje do wybranej fazy ${phase}.`);return}
  if(!start){start={id:t.dataset.terminal,el:t,role:t.dataset.role,phase};t.classList.add('bridge-start');setStatus(`${phase}: wybrano pierwszy zacisk. Kliknij górny zacisk sąsiedniego zabezpieczenia.`);return}
  if(start.id===t.dataset.terminal){clearStart();setStatus('Anulowano wybór pierwszego zacisku.');return}
  if(start.phase!==phase){flash(t);clearStart();setStatus('Zmieniono fazę w trakcie tworzenia mostka. Zacznij ponownie.');return}
  if(!isAdjacent(start.el,t)){flash(t);clearStart();setStatus('Mostek może łączyć tylko bezpośrednio sąsiednie zabezpieczenia.');return}
  if(!roleMatchesPhase(start.role,phase)||!roleMatchesPhase(t.dataset.role,phase)){flash(t);clearStart();setStatus(`Oba zaciski muszą należeć do tej samej fazy ${phase}.`);return}
  if(bridgeExists(start.id,t.dataset.terminal)){flash(t);clearStart();setStatus('Taki mostek już istnieje.');return}
  bridges.push({id:'BR'+seq++,a:start.id,b:t.dataset.terminal,phase});start.el.classList.remove('bridge-start');start=null;redraw();setStatus(`Dodano mostek ${phase} pomiędzy sąsiednimi zabezpieczeniami.`)
}
function removeBridge(id){const b=bridges.find(x=>x.id===id);bridges=bridges.filter(x=>x.id!==id);redraw();if(b)setStatus(`Usunięto mostek ${b.phase}.`)}
function undoBridge(){const b=bridges.pop();clearStart();redraw();if(b)setStatus(`Cofnięto ostatni mostek ${b.phase}.`)}
function clearBridges(){bridges=[];clearStart();redraw();setStatus('Usunięto wszystkie mostki zasilające.')}
function flash(t){t.classList.add('bad-terminal');setTimeout(()=>t.classList.remove('bad-terminal'),500)}
function setStatus(txt){const s=document.getElementById('wiringStatus');if(s)s.innerHTML='<b>MOSTKI:</b> '+txt}
cabinet.addEventListener('click',e=>{if(!bridgeMode)return;const t=e.target.closest('.wire-terminal');if(t&&eligible(t)){e.stopPropagation();e.preventDefault();click(t)}} ,true);
const obs=new MutationObserver(()=>requestAnimationFrame(()=>{redraw()}));obs.observe(document.querySelector('.mount-grid')||cabinet,{childList:true,subtree:true});window.addEventListener('resize',()=>requestAnimationFrame(redraw));
refreshPhase();redraw();
window.ElektrykBridges={getBridges:()=>bridges.slice(),clear:clearBridges,redraw,remove:removeBridge};
})();