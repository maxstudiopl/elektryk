(()=>{
const STORE_KEY='elektryk_freebuild_saves_v0711';
const ACTIVE_KEY='elektryk_freebuild_active_slot_v0711';
function userKey(base){
  const user=window.ElektrykAuth?.currentAccountId?.()||'admin';
  return user==='admin'?base:(base+':'+user);
}
function appStateKey(){
  const user=window.ElektrykAuth?.currentAccountId?.()||'admin';
  const base='elektryk_app_state_v0710';
  return user==='admin'?base:(base+':'+user);
}
const panel=document.getElementById('freeSavePanel');
const nameInput=document.getElementById('freeProjectName');
const stateEl=document.getElementById('freeSaveState');
const metaEl=document.getElementById('freeSaveMeta');
const saveBtn=document.getElementById('saveFreeProject');
const loadBtn=document.getElementById('loadFreeProject');
const newBtn=document.getElementById('newFreeProject');
const slotButtons=[...document.querySelectorAll('[data-save-slot]')];
if(!panel||!nameInput||!stateEl||!metaEl)return;

const savedActiveSlot=Number(localStorage.getItem(userKey(ACTIVE_KEY))||0);
let activeSlot=Number.isInteger(savedActiveSlot)&&savedActiveSlot>=1&&savedActiveSlot<=3?savedActiveSlot:0;
let loadedSlot=0;
let lastSavedSignature='';
let lastObservedSignature='';
let initializing=true;
let restoreSavedOnBoot=(()=>{
  try{
    const app=JSON.parse(localStorage.getItem(appStateKey())||'{}');
    return app?.view==='game'&&app?.mode==='free'&&!!activeSlot;
  }catch{return false}
})();

function readStore(){
  try{
    const data=JSON.parse(localStorage.getItem(userKey(STORE_KEY))||'{}');
    return data&&typeof data==='object'?data:{};
  }catch{return {}}
}
function writeStore(data){
  localStorage.setItem(userKey(STORE_KEY),JSON.stringify(data));
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
    bridges:window.ElektrykBridges?.getBridges?.()||[],
    industrialZug:window.ElektrykIndustrialZug?.getState?.()||null
  };
}
function signature(data=compactState(),name=nameInput.value){
  try{
    return JSON.stringify({...data,name:String(name||'Mój projekt').trim().slice(0,32)});
  }catch{return ''}
}
function snapshot(){
  const board=window.ElektrykStage2?.getBoardConfig?.();
  if(!board)return null;
  const mounted=window.ElektrykStage2?.getMounted?.()||[];
  const connections=window.ElektrykStage3?.getConnections?.()||[];
  const bridges=window.ElektrykBridges?.getBridges?.()||[];
  return {
    schema:2,
    gameVersion:'0.7.20',
    name:(nameInput.value||'Mój projekt').trim().slice(0,32)||'Mój projekt',
    savedAt:Date.now(),
    templateId:board.boardId||null,
    board:{...board},
    mounted:mounted.map(x=>({...x})),
    connections:connections.map(x=>({...x})),
    bridges:bridges.map(x=>({...x})),
    industrialZug:window.ElektrykIndustrialZug?.getState?.()||null
  };
}
function summary(project){
  if(!project)return 'PUSTY';
  const a=project.mounted?.length||0;
  const w=(project.connections?.length||0)+(project.bridges?.length||0);
  const z=project.industrialZug?.slots?.filter(x=>x&&x!=='SEP').length||0;
  return (project.name||'Projekt')+' • '+a+' apar. • '+z+' ZUG • '+w+' poł.';
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
  const slot=Number(n);
  if(!Number.isInteger(slot)||slot<1||slot>3)return false;
  activeSlot=slot;
  localStorage.setItem(userKey(ACTIVE_KEY),String(activeSlot));
  // Selecting a slot must NEVER silently replace the active project's name.
  // Use WCZYTAJ to load a stored project or ZAPISZ to explicitly write it.
  renderSlots();
  updateDirtyState();
  return true;
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
  if(store[activeSlot]&&activeSlot!==loadedSlot){
    if(silent||!confirm('Slot '+activeSlot+' zawiera już projekt „'+
      (store[activeSlot].name||'Bez nazwy')+'”. Zastąpić istniejący zapis?'))return false;
  }
  store[activeSlot]=data;
  try{writeStore(store)}
  catch(err){
    console.error('Zapis Wolnej Budowy:',err);
    setState('BŁĄD ZAPISU','dirty');
    setMeta('Nie udało się zapisać projektu. Sprawdź dostępne miejsce w przeglądarce.','warn');
    return false;
  }
  loadedSlot=activeSlot;
  nameInput.value=data.name;
  lastSavedSignature=signature({
    board:data.board,
    mounted:data.mounted,
    connections:data.connections,
    bridges:data.bridges,
    industrialZug:data.industrialZug
  },data.name);
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
  if(!p){setMeta('Wybrany slot jest pusty.','warn');return false}
  if(!p.board||!Array.isArray(p.mounted)||!Array.isArray(p.connections)||!Array.isArray(p.bridges)){
    setMeta('Zapis w tym slocie jest niekompletny. Nie zmieniono bieżącego projektu.','warn');
    return false;
  }
  // Do not silently discard unsaved work when switching projects.
  const unsaved=signature()!==lastSavedSignature;
  const state=compactState();
  const occupied=state.mounted.length+state.connections.length+state.bridges.length+
    (state.industrialZug?.slots?.filter(x=>x&&x!=='SEP').length||0);
  if(unsaved&&occupied&&!confirm('Masz niezapisane zmiany. Wczytanie slotu '+activeSlot+
    ' zastąpi bieżącą rozdzielnicę. Kontynuować?'))return false;

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
  try{
  if(!window.ElektrykAuth?.enterGame)throw new Error('Nie można uruchomić Wolnej Budowy');
  await window.ElektrykAuth.enterGame('free',template);
  if(document.body.dataset.gameMode!=='free')throw new Error('Nie uruchomiono trybu Wolnej Budowy');
  const installedBoard=window.ElektrykStage2?.getBoardConfig?.();
  if(!installedBoard||Number(installedBoard.rows)!==Number(template.rows)||
     Number(installedBoard.modulesPerRow)!==Number(template.modulesPerRow))
    throw new Error('Nie udało się przygotować zapisanej obudowy');
  window.ElektrykIndustrialZug?.restore?.(p.industrialZug||null);
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
    bridges:window.ElektrykBridges?.getBridges?.()||p.bridges||[],
    industrialZug:window.ElektrykIndustrialZug?.getState?.()||null
  },p.name);
  loadedSlot=activeSlot;
  lastObservedSignature=lastSavedSignature;
  setState('ZAPISANO','saved');
  setMeta('Wczytano slot '+activeSlot+' • '+formatDate(p.savedAt),'ok');
  renderSlots();
  return true;
  }catch(err){
    console.error('Wczytanie Wolnej Budowy:',err);
    setState('BŁĄD WCZYTYWANIA','dirty');
    setMeta('Wczytanie nie powiodło się. Zapis w slocie pozostał bez zmian.','warn');
    return false;
  }
}
function newProject(){
  if(!isFree())return;
  const zugUsed=window.ElektrykIndustrialZug?.getState?.()?.slots?.filter(Boolean).length||0;
  const hasContent=(window.ElektrykStage2?.getMounted?.()?.length||0)+(window.ElektrykStage3?.getConnections?.()?.length||0)+(window.ElektrykBridges?.getBridges?.()?.length||0)+zugUsed;
  if(hasContent&&!confirm('Wyczyścić bieżący projekt Wolnej Budowy?'))return;
  window.ElektrykStage2?.reset?.();
  window.ElektrykIndustrialZug?.reset?.();
  nameInput.value='Nowy projekt';
  activeSlot=0;loadedSlot=0;
  localStorage.removeItem(userKey(ACTIVE_KEY));
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
      const savedSig=signature({board:p.board,mounted:p.mounted||[],connections:p.connections||[],bridges:p.bridges||[],industrialZug:p.industrialZug||null},p.name);
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
nameInput.addEventListener('input',()=>{if(isFree())updateDirtyState()});
document.addEventListener('elektryk:mode-selected',e=>onMode(e.detail?.mode||'learn'));
// Explicit saves only. Automatic beforeunload overwrote selected project slots.
// In browsers with quota limits saving should never occur without the user's action.

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