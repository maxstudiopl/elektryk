(()=>{
const STORE_KEY='elektryk_freebuild_saves_v0711';
const ACTIVE_KEY='elektryk_freebuild_active_slot_v0711';
const panel=document.getElementById('freeSavePanel');
const nameInput=document.getElementById('freeProjectName');
const stateEl=document.getElementById('freeSaveState');
const metaEl=document.getElementById('freeSaveMeta');
const saveBtn=document.getElementById('saveFreeProject');
const loadBtn=document.getElementById('loadFreeProject');
const newBtn=document.getElementById('newFreeProject');
const slotButtons=[...document.querySelectorAll('[data-save-slot]')];
if(!panel||!nameInput||!stateEl||!metaEl)return;

let activeSlot=Number(localStorage.getItem(ACTIVE_KEY)||0);
let lastSavedSignature='';
let lastObservedSignature='';
let initializing=true;
let restoreSavedOnBoot=(()=>{
  try{
    const app=JSON.parse(localStorage.getItem('elektryk_app_state_v0710')||'{}');
    return app?.view==='game'&&app?.mode==='free'&&!!activeSlot;
  }catch{return false}
})();

function readStore(){
  try{
    const data=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
    return data&&typeof data==='object'?data:{};
  }catch{return {}}
}
function writeStore(data){
  localStorage.setItem(STORE_KEY,JSON.stringify(data));
}
function isFree(){
  return document.body.dataset.gameMode==='free';
}
function formatDate(ts){
  if(!ts)return '—';
  try{return new Date(Number(ts)).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}
  catch{return '—'}
}
function setState(text,kind=''){
  stateEl.textContent=text;
  stateEl.className=kind;
}
function setMeta(text,kind=''){
  metaEl.textContent=text;
  metaEl.className='free-save-meta'+(kind?' '+kind:'');
}
function compactState(){
  return {
    board:window.ElektrykStage2?.getBoardConfig?.()||null,
    mounted:window.ElektrykStage2?.getMounted?.()||[],
    connections:window.ElektrykStage3?.getConnections?.()||[],
    bridges:window.ElektrykBridges?.getBridges?.()||[]
  };
}
function signature(data=compactState()){
  try{return JSON.stringify(data)}catch{return ''}
}
function snapshot(){
  const board=window.ElektrykStage2?.getBoardConfig?.();
  if(!board)return null;
  const mounted=window.ElektrykStage2?.getMounted?.()||[];
  const connections=window.ElektrykStage3?.getConnections?.()||[];
  const bridges=window.ElektrykBridges?.getBridges?.()||[];
  return {
    schema:1,
    gameVersion:'0.7.11',
    name:(nameInput.value||'Mój projekt').trim().slice(0,32)||'Mój projekt',
    savedAt:Date.now(),
    templateId:board.boardId||null,
    board:{...board},
    mounted:mounted.map(x=>({...x})),
    connections:connections.map(x=>({...x})),
    bridges:bridges.map(x=>({...x}))
  };
}
function summary(project){
  if(!project)return 'PUSTY';
  const a=project.mounted?.length||0;
  const w=(project.connections?.length||0)+(project.bridges?.length||0);
  return (project.name||'Projekt')+' • '+a+' apar. • '+w+' poł.';
}
function renderSlots(){
  const store=readStore();
  slotButtons.forEach(btn=>{
    const n=Number(btn.dataset.saveSlot);
    const p=store[n]||null;
    btn.classList.toggle('active',n===activeSlot);
    btn.classList.toggle('has-save',!!p);
    const small=btn.querySelector('small');
    if(small)small.textContent=summary(p);
  });

  if(activeSlot){
    const p=store[activeSlot];
    if(p){
      setMeta('Slot '+activeSlot+' • zapis: '+formatDate(p.savedAt)+' • '+(p.board?.rows||'?')+'×'+(p.board?.modulesPerRow||'?')+'M','ok');
    }else{
      setMeta('Slot '+activeSlot+' jest pusty. Kliknij ZAPISZ, aby utworzyć projekt.');
    }
  }else{
    setMeta('Wybierz slot zapisu.');
  }
}
function chooseSlot(n){
  activeSlot=Number(n)||0;
  if(activeSlot)localStorage.setItem(ACTIVE_KEY,String(activeSlot));
  else localStorage.removeItem(ACTIVE_KEY);
  const p=readStore()[activeSlot];
  if(p?.name)nameInput.value=p.name;
  renderSlots();
}
function firstAvailableSlot(){
  const store=readStore();
  for(let i=1;i<=3;i++)if(!store[i])return i;
  return 1;
}
function saveProject(silent=false){
  if(!isFree())return false;
  if(!activeSlot)chooseSlot(firstAvailableSlot());
  const data=snapshot();
  if(!data)return false;
  const store=readStore();
  store[activeSlot]=data;
  writeStore(store);
  nameInput.value=data.name;
  lastSavedSignature=signature({
    board:data.board,
    mounted:data.mounted,
    connections:data.connections,
    bridges:data.bridges
  });
  lastObservedSignature=lastSavedSignature;
  setState('ZAPISANO','saved');
  renderSlots();
  if(!silent)setMeta('Projekt zapisany w slocie '+activeSlot+' • '+formatDate(data.savedAt),'ok');
  return true;
}
function waitFrame(){
  return new Promise(resolve=>requestAnimationFrame(()=>resolve()));
}
async function loadProject(){
  if(!activeSlot){setMeta('Najpierw wybierz slot do wczytania.','warn');return}
  const p=readStore()[activeSlot];
  if(!p){setMeta('Wybrany slot jest pusty.','warn');return}

  let template=window.ElektrykSwitchboardDB?.get?.(p.templateId)||null;
  if(!template){
    template={
      id:p.templateId||p.board?.boardId||('SAVED-'+activeSlot),
      name:p.name||'Zapisany projekt',
      family:p.board?.family||'residential',
      mounting:p.board?.mounting||'unknown',
      rows:Number(p.board?.rows)||1,
      modulesPerRow:Number(p.board?.modulesPerRow)||18,
      totalModules:Number(p.board?.totalModules)||((Number(p.board?.rows)||1)*(Number(p.board?.modulesPerRow)||18)),
      enclosureProfile:p.board?.enclosureProfile||'training-18',
      engineStatus:'supported',
      level:'free'
    };
  }

  setState('WCZYTYWANIE','dirty');
  await window.ElektrykAuth?.enterGame?.('free',template);
  window.ElektrykStage2?.restoreMounted?.(p.mounted||[]);
  await waitFrame();
  await waitFrame();
  window.ElektrykStage3?.setConnections?.(p.connections||[]);
  window.ElektrykBridges?.setBridges?.(p.bridges||[]);
  await waitFrame();
  window.ElektrykStage3?.redraw?.();
  window.ElektrykBridges?.redraw?.();

  nameInput.value=p.name||'Mój projekt';
  const label=document.getElementById('currentFreeBoardLabel');
  if(label)label.textContent=template.name||p.name||'Zapisany projekt';

  lastSavedSignature=signature({
    board:window.ElektrykStage2?.getBoardConfig?.()||p.board,
    mounted:window.ElektrykStage2?.getMounted?.()||p.mounted||[],
    connections:window.ElektrykStage3?.getConnections?.()||p.connections||[],
    bridges:window.ElektrykBridges?.getBridges?.()||p.bridges||[]
  });
  lastObservedSignature=lastSavedSignature;
  setState('ZAPISANO','saved');
  setMeta('Wczytano slot '+activeSlot+' • '+formatDate(p.savedAt),'ok');
  renderSlots();
}
function newProject(){
  if(!isFree())return;
  const hasContent=(window.ElektrykStage2?.getMounted?.()?.length||0)+(window.ElektrykStage3?.getConnections?.()?.length||0)+(window.ElektrykBridges?.getBridges?.()?.length||0);
  if(hasContent&&!confirm('Wyczyścić bieżący projekt Wolnej Budowy?'))return;
  window.ElektrykStage2?.reset?.();
  nameInput.value='Nowy projekt';
  activeSlot=0;
  localStorage.removeItem(ACTIVE_KEY);
  lastSavedSignature='';
  lastObservedSignature=signature();
  setState('NIE ZAPISANO','dirty');
  setMeta('Nowy pusty projekt. Wybierz slot i kliknij ZAPISZ.');
  renderSlots();
}
function updateDirtyState(){
  if(!isFree()||initializing)return;
  const sig=signature();
  if(sig===lastObservedSignature)return;
  lastObservedSignature=sig;
  if(lastSavedSignature&&sig===lastSavedSignature)setState('ZAPISANO','saved');
  else setState('NIEZAPISANE ZMIANY','dirty');
}
function onMode(mode){
  panel.classList.toggle('mode-hidden',mode!=='free');
  if(mode==='free'){
    renderSlots();
    lastObservedSignature=signature();
    const p=activeSlot?readStore()[activeSlot]:null;
    if(p){
      const savedSig=signature({board:p.board,mounted:p.mounted||[],connections:p.connections||[],bridges:p.bridges||[]});
      lastSavedSignature=savedSig;
    }else lastSavedSignature='';
    setState(lastSavedSignature&&lastObservedSignature===lastSavedSignature?'ZAPISANO':'NIE ZAPISANO',lastSavedSignature&&lastObservedSignature===lastSavedSignature?'saved':'dirty');

    if(restoreSavedOnBoot&&p){
      restoreSavedOnBoot=false;
      setTimeout(()=>loadProject(),0);
    }
  }
}

slotButtons.forEach(btn=>btn.addEventListener('click',()=>chooseSlot(Number(btn.dataset.saveSlot))));
saveBtn?.addEventListener('click',()=>saveProject(false));
loadBtn?.addEventListener('click',loadProject);
newBtn?.addEventListener('click',newProject);
nameInput.addEventListener('input',()=>{if(isFree())setState('NIEZAPISANE ZMIANY','dirty')});
document.addEventListener('elektryk:mode-selected',e=>onMode(e.detail?.mode||'learn'));
window.addEventListener('beforeunload',()=>{if(isFree()&&activeSlot)saveProject(true)});

setInterval(updateDirtyState,500);
renderSlots();
setTimeout(()=>{
  initializing=false;
  if(isFree())onMode('free');
},0);

window.ElektrykFreeBuildSave={
  save:saveProject,
  load:loadProject,
  slots:()=>JSON.parse(JSON.stringify(readStore())),
  activeSlot:()=>activeSlot
};
})();