/* RozdzielnicaPRO.pl v0.7.13.3 • read-only demo showroom.
 * Client-side educational access control, NOT server-side authorization.
 * Does not alter user projects, scores or persistent progress.
 */
(()=>{
'use strict';
const DEMO_ID='demo',IDS=['LIGHT','SOCKET','KITCHEN','WASH'];
const MOUNTS=[
  {id:'M101',code:'FR',row:0,start:0,modules:4,switchState:'on'},
  {id:'M102',code:'RCD4',row:0,start:4,modules:4,switchState:'on'},
  {id:'M103',code:'B10',row:0,start:8,modules:1,switchState:'on'},
  {id:'M104',code:'B16',row:0,start:9,modules:1,switchState:'on'},
  {id:'M105',code:'B16',row:0,start:10,modules:1,switchState:'on'},
  {id:'M106',code:'B16',row:0,start:11,modules:1,switchState:'on'},
  {id:'M107',code:'RCBO10',row:0,start:12,modules:2,switchState:'on'},
  {id:'M108',code:'SPD4',row:0,start:14,modules:4,switchState:'on'}
];
const DEVICE_POLES={
  M101:['L1','L2','L3','N'],M102:['L1','L2','L3','N'],
  M107:['L','N'],M108:['L1','L2','L3','N']
};
const term=(m,side,role)=>{
  const poles=DEVICE_POLES[m]||[role];
  const idx=poles.indexOf(role);
  if(idx<0)throw new Error('DEMO: zacisk '+role+' nie należy do '+m);
  return m+':'+side+':'+role+':'+(side==='BOTTOM'&&m==='M108'?0:idx);
};
function builtWiring(){
  const w=[];let seq=1;
  const add=(a,b,type,cable='H07V-K 1×2,5')=>w.push({id:'W'+seq++,a,b,type,cable});
  // FR 4P and downstream RCD 4P (4 pole paths, no shared neutral outputs).
  for(const p of ['L1','L2','L3','N']){
    const source='SUPPLY:'+p;
    add(source,term('M101','TOP',p),p);
    add(term('M101','BOTTOM',p),term('M102','TOP',p),p);
  }
  // RCD -> four MCB inputs; downstream switched phase -> final circuits.
  const loads=[
    ['M103','LIGHT','L1','YDYp 3×1,5'],
    ['M104','SOCKET','L2','YDYp 3×2,5'],
    ['M105','KITCHEN','L3','YDYp 3×2,5'],
    ['M106','WASH','L1','YDYp 3×2,5']
  ];
  for(const [m,load,p,cable] of loads){
    add(term('M102','BOTTOM',p),term(m,'TOP','L'),p);
    add(term(m,'BOTTOM','L'),'LOAD:'+load+':L',p,cable);
  }
  // Separate neutral after RCD and common protective bar (never bridge N and PE).
  add(term('M102','BOTTOM','N'),'BAR:N:1','N');
  add('SUPPLY:PE','BAR:PE:1','PE');
  for(let i=0;i<loads.length;i++){
    const [,load,,cable]=loads[i];
    add('BAR:N:'+(i+2),'LOAD:'+load+':N','N',cable);
    add('BAR:PE:'+(i+2),'LOAD:'+load+':PE','PE',cable);
  }
  // SPD4 is modeled as parallel protection, RCBO as a spare equipped module.
  for(const p of ['L1','L2','L3','N'])add(term('M101','BOTTOM',p),term('M108','TOP',p),p);
  add('BAR:PE:6',term('M108','BOTTOM','PE'),'PE');
  add(term('M101','BOTTOM','L1'),term('M107','TOP','L'),'L1');
  add(term('M101','BOTTOM','N'),term('M107','TOP','N'),'N');
  return w;
}
const WIRES=builtWiring();
function isDemo(){return window.ElektrykAuth?.currentAccountId?.()===DEMO_ID}
function setText(sel,value){const e=document.querySelector(sel);if(e)e.textContent=value}
function getControls(){
  let el=document.getElementById('demoControls');
  if(el)return el;
  const area=document.querySelector('.workspace');
  if(!area)return null;
  el=document.createElement('section');
  el.id='demoControls';el.className='demo-controls';
  el.setAttribute('aria-label','Tryb demonstracyjny, tylko podgląd');
  el.innerHTML='<div class="demo-controls-copy"><strong>DEMO • TYLKO PODGLĄD</strong><span id="demoBoardStatus">Rozdzielnica treningowa • 18M • kompletnie uzbrojona</span></div><div class="demo-controls-actions"><button type="button" data-demo-action="gallery">ZOBACZ INNE ROZDZIELNICE</button><button type="button" data-demo-action="reset">↻ RESET DO TRENINGOWEJ</button></div>';
  area.insertBefore(el,area.firstChild);
  el.querySelector('[data-demo-action="gallery"]').addEventListener('click',()=>window.ElektrykAuth?.openBoardSelector?.());
  el.querySelector('[data-demo-action="reset"]').addEventListener('click',reset);
  return el;
}
function markReady(mode,template){
  document.body.classList.add('demo-viewer');
  document.body.dataset.demoView=mode;
  getControls();
  setText('#demoBoardStatus',mode==='training'?
    'Rozdzielnica treningowa 1×18 • 8 aparatów • gotowe przewody • tylko reset':
    'PODGLĄD: '+(template?.name||'rozdzielnica')+' • brak możliwości montażu');
  setText('.cabinet-head .version','v0.7.13.3 • DEMO / TYLKO ODCZYT');
  setText('.active-task .panel-title',mode==='training'?'PREZENTACJA • ROZDZIELNICA 01':'PODGLĄD INNEJ ROZDZIELNICY');
  setText('#topPlayerLevel','KONTO DEMO');
  const banner=document.getElementById('demoControls');
  if(banner)banner.hidden=false;
}
function hideModals(){
  for(const id of ['taskModal','gameSettingsModal','playersModal','helpModal']){
    const e=document.getElementById(id);if(e)e.hidden=true;
  }
}
function validateWiring(wires){
  const missing=[...new Set(wires.flatMap(c=>[c.a,c.b]))].filter(id=>!document.querySelector('[data-terminal="'+id+'"]'));
  if(missing.length)throw new Error('DEMO: brak zacisków: '+missing.join(', '));
}
function training(){
  if(!isDemo())return false;
  const tasks=window.ElektrykTasks,stage=window.ElektrykStage2,wiring=window.ElektrykStage3;
  if(!tasks||!stage||!wiring)return false;
  hideModals();
  const task=tasks.all?.find(x=>x.id===1);
  if(!task)return false;
  tasks.start?.(1);
  const installed=stage.restoreMounted?.(MOUNTS);
  if(installed!==MOUNTS.length)throw new Error('DEMO: oczekiwano 8 aparatów, zamontowano '+installed);
  wiring.refreshMounted?.();
  validateWiring(WIRES);
  window.ElektrykBridges?.setBridges?.([]);
  const connected=wiring.setConnections?.(WIRES);
  if(connected!==WIRES.length)throw new Error('DEMO: błąd wczytania połączeń');
  setText('.active-task h2','01 • Gotowa rozdzielnica treningowa');
  setText('.active-task p','W pełni uzbrojona rozdzielnica pokazowa. Oglądaj aparaturę i przewody. Nie można jej edytować; przycisk RESET przywraca stan wzorcowy.');
  markReady('training',null);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    wiring.redraw?.();window.ElektrykBridges?.redraw?.();
  }));
  return true;
}
function preview(template){
  if(!isDemo()||!template?.id)return false;
  const db=window.ElektrykSwitchboardDB;
  if(!db?.supported?.().some(b=>b.id===template.id))return false;
  hideModals();
  if(!window.ElektrykStage2?.configureBoard?.(template))return false;
  setText('.active-task p','Model referencyjny dostępny tylko do obejrzenia. Montaż, okablowanie, zapisy i diagnostyka są zablokowane dla konta demo. Wróć przyciskiem RESET.');
  markReady('preview',template);
  requestAnimationFrame(()=>window.ElektrykStage3?.redraw?.());
  return true;
}
function reset(){
  if(!isDemo())return false;
  document.getElementById('boardSelectorModal')?.setAttribute('hidden','');
  return training();
}
function gate(event){
  if(!isDemo()||!document.body.classList.contains('demo-viewer'))return;
  const target=event.target;
  if(!(target instanceof Element))return;
  if(target.closest('#demoControls [data-demo-action],#authLogout,.board-selector-modal'))return;
  if(!target.closest('.game-shell,.topbar,.task-modal,.settings-modal,.players-modal'))return;
  if(event.type==='keydown'){
    if(!['Enter',' ','Backspace','Delete'].includes(event.key))return;
    if(!target.closest('button,input,select,[role="button"],.wire-terminal'))return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}
document.addEventListener('click',gate,true);
document.addEventListener('keydown',gate,true);
window.ElektrykDemo={isDemo,training,preview,reset,wireCount:WIRES.length,layout:()=>MOUNTS.map(m=>({...m})),wires:()=>WIRES.map(w=>({...w}))};
})();