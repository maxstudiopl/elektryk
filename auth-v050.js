(()=>{
const accountStore=()=>window.ElektrykAccounts;
const SESSION_KEY='elektryk_auth_v050';
const SETTINGS_KEY='elektryk_settings_v076';
const APP_STATE_KEY='elektryk_app_state_v0710';
const SESSION_MS=8*60*60*1000;
const LICENSE_TYPE='BETA / TESTOWA';
const LICENSE_EXPIRY=null;

const scripts=[
  'ui.js?v=0711',
  'switchboard-db.js?v=0711',
  'stage2.js?v=07129assemblypro',
  'hardware-pro-v07126.js?v=07126',
  'assembly-pro-v07129.js?v=07129',
  'stage3.js?v=07131rcd',
  'bridges-v031.js?v=07131rcd',
  'electrical-audit-v0712.js?v=0712wire4',
  'electrical-engine-v0713.js?v=07130',
  'rcd-diagnostic-v07131.js?v=07131',
  'stage4.js?v=07131rcd',
  'rcd-diagnostic-ui-v07131.js?v=07131',
  'tasks-v046.js?v=07131',
  'busbars-v047.js?v=0711',
  'wiring-rules-v0712.js?v=0712wire3',
  'help-v049.js?v=0712tasks40',
  'learning-board-v0712.js?v=0712tasks40',
  'progress-v060.js?v=0712tasks40',
  'freebuild-save-v0711.js?v=0711admin2'
];

let gameLoaded=false;
let gameReadyPromise=null;
let activeFreeTemplate=null;
let restoringState=false;

function hex(buffer){return [...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function digest(text){
  const data=new TextEncoder().encode(text);
  return hex(await crypto.subtle.digest('SHA-256',data));
}
function sessionData(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}
}
function currentAccount(){
  const sess=sessionData();
  if(!sess)return null;
  if(sess.accountId)return accountStore()?.byId?.(sess.accountId)||null;
  const account=accountStore()?.byLogin?.(sess.user)||null;
  if(account){
    localStorage.setItem(SESSION_KEY,JSON.stringify({accountId:account.id,user:account.login,expires:sess.expires}));
  }
  return account;
}
function currentAccountId(){
  return currentAccount()?.id||null;
}
function currentUser(){
  return currentAccount()?.login||null;
}
function isAdmin(){
  return currentAccount()?.role==='admin';
}
function sessionValid(){
  const sess=sessionData();
  return !!(sess&&currentAccount()&&Number(sess.expires)>Date.now());
}
function licenseActive(){
  return !!accountStore()?.licenseActive?.(currentAccount());
}
function saveSession(account){
  localStorage.setItem(SESSION_KEY,JSON.stringify({
    accountId:account.id,
    user:account.login,
    expires:Date.now()+SESSION_MS
  }));
}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function appStateStorageKey(){
  const id=currentAccountId()||'guest';
  return id==='admin'?APP_STATE_KEY:(APP_STATE_KEY+':'+id);
}
function readAppState(){
  try{
    return Object.assign({view:'hub',mode:'learn',taskId:1,freeTemplateId:null},JSON.parse(localStorage.getItem(appStateStorageKey())||'{}'));
  }catch{
    return {view:'hub',mode:'learn',taskId:1,freeTemplateId:null};
  }
}
function saveAppState(patch={}){
  const next=Object.assign(readAppState(),patch);
  localStorage.setItem(appStateStorageKey(),JSON.stringify(next));
  return next;
}
function clearAppState(){localStorage.removeItem(appStateStorageKey())}
function formatDate(ts){
  if(!ts)return 'NIE USTAWIONO';
  try{return new Date(Number(ts)).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}
  catch{return '—'}
}
function readSettings(){
  try{
    return Object.assign({animations:true,guidance:true,panelText:'large'},JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'));
  }catch{return {animations:true,guidance:true,panelText:'large'}}
}
function applySettings(settings=readSettings()){
  document.body.classList.toggle('no-ui-animations',!settings.animations);
  document.body.classList.toggle('no-terminal-guidance',!settings.guidance);
  document.body.classList.remove('panel-text-normal','panel-text-large','panel-text-xlarge');
  const size=['normal','large','xlarge'].includes(settings.panelText)?settings.panelText:'large';
  document.body.classList.add('panel-text-'+size);
  const a=document.getElementById('settingAnimations');
  const g=document.getElementById('settingGuidance');
  const p=document.getElementById('settingPanelText');
  if(a)a.checked=!!settings.animations;
  if(g)g.checked=!!settings.guidance;
  if(p)p.value=size;
}
function saveSettings(){
  const settings={
    animations:!!document.getElementById('settingAnimations')?.checked,
    guidance:!!document.getElementById('settingGuidance')?.checked,
    panelText:document.getElementById('settingPanelText')?.value||'large'
  };
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
  applySettings(settings);
}
function openSettings(){
  applySettings();
  const modal=document.getElementById('gameSettingsModal');
  if(modal)modal.hidden=false;
}
function closeSettings(){
  const modal=document.getElementById('gameSettingsModal');
  if(modal)modal.hidden=true;
}
function openPlayersPanel(){
  if(!sessionValid()||!isAdmin())return;
  const modal=document.getElementById('playersModal');
  if(modal)modal.hidden=false;
}
function closePlayersPanel(){
  const modal=document.getElementById('playersModal');
  if(modal)modal.hidden=true;
}
function loadScripts(){
  if(gameReadyPromise)return gameReadyPromise;
  gameLoaded=true;
  let chain=Promise.resolve();
  scripts.forEach(src=>{
    chain=chain.then(()=>new Promise((resolve,reject)=>{
      const el=document.createElement('script');
      el.src=src;
      el.defer=false;
      el.onload=resolve;
      el.onerror=reject;
      document.body.appendChild(el);
    }));
  });
  gameReadyPromise=chain.catch(err=>{
    gameLoaded=false;
    gameReadyPromise=null;
    showMessage('Nie udało się uruchomić plików gry. Odśwież stronę.','error');
    throw err;
  });
  return gameReadyPromise;
}
function populateHub(){
  const s=sessionData();
  const account=currentAccount();
  const name=String(account?.display||s?.user||'GRACZ').toUpperCase();
  const map={
    hubPlayerName:name,
    hubAccountUser:name,
    hubLicense:account?.license||'BRAK LICENCJI',
    hubLicenseExpiry:account?.licenseExpiry?new Date(account.licenseExpiry+'T23:59:59').toLocaleDateString('pl-PL'):'NIE USTAWIONO',
    hubSessionExpiry:formatDate(s?.expires)
  };
  Object.entries(map).forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  });
  const playersBtn=document.getElementById('hubPlayers');
  if(playersBtn)playersBtn.hidden=!isAdmin();
  window.ElektrykAdminPlayers?.refreshAccountSummary?.();
}
function showHub(){
  if(!sessionValid())return;
  saveAppState({view:'hub'});
  const overlay=document.getElementById('authGate');
  const card=document.querySelector('.auth-card');
  const loginView=document.getElementById('authLoginView');
  const hub=document.getElementById('playerHub');
  document.body.classList.add('auth-locked');
  document.body.classList.remove('auth-ready');
  if(overlay)overlay.hidden=false;
  if(card)card.classList.add('hub-open');
  if(loginView)loginView.hidden=true;
  if(hub)hub.hidden=false;
  populateHub();
  applySettings();
  loadScripts().catch(()=>{});
}
function updateModeHeader(mode){
  document.body.dataset.gameMode=mode;
  const level=document.getElementById('topPlayerLevel');
  if(level){
    if(mode==='free')level.textContent='BEZ PUNKTACJI';
    else{
      const xp=Number(window.ElektrykProgress?.get?.()?.xp||0);
      const lvl=Math.max(1,Math.floor(xp/500)+1);
      level.textContent='TWÓJ POZIOM: '+lvl;
    }
  }
  document.querySelector('.task-shortcut')?.classList.toggle('mode-hidden',mode!=='learn');
  document.querySelector('.free-board-shortcut')?.classList.toggle('mode-hidden',mode!=='free');
  document.querySelector('.free-save-panel')?.classList.toggle('mode-hidden',mode!=='free');
  document.querySelector('.reward')?.classList.toggle('mode-hidden',mode!=='learn');
}
function mountingLabel(value){
  const map={
    training:'TRENINGOWA',
    surface:'NATYNKOWA',
    flush:'PODTYNKOWA',
    flush_or_surface:'POD / NADTYNKOWA',
    unknown:'MODUŁOWA'
  };
  return map[value]||String(value||'MODUŁOWA').toUpperCase();
}
function levelLabel(value){
  const map={basic:'PODSTAWOWA',intermediate:'ŚREDNIA',advanced:'DUŻA',special:'SPECJALNA'};
  return map[value]||'MODUŁOWA';
}
function boardPreview(template){
  const rows=Math.max(1,Number(template.rows)||1);
  const cols=Math.max(1,Number(template.modulesPerRow)||12);
  const host=document.createElement('div');
  host.className='board-preview';
  host.style.setProperty('--preview-rows',String(rows));
  host.style.setProperty('--preview-cols',String(cols));
  for(let r=0;r<rows;r++){
    const row=document.createElement('div');
    row.className='board-preview-row';
    row.style.setProperty('--preview-cols',String(cols));
    for(let i=0;i<cols;i++){
      const slot=document.createElement('span');
      slot.className='board-preview-slot';
      row.appendChild(slot);
    }
    host.appendChild(row);
  }
  return host;
}
function renderBoardSelector(){
  const grid=document.getElementById('boardSelectorGrid');
  const count=document.getElementById('boardSelectorCount');
  if(!grid)return;
  grid.innerHTML='';
  const templates=(window.ElektrykSwitchboardDB?.supported?.()||[])
    .filter(t=>t.rows&&t.modulesPerRow&&t.family!=='construction');
  if(count)count.textContent=templates.length+' dostępnych';

  templates.forEach((template,index)=>{
    const card=document.createElement('button');
    card.type='button';
    card.className='board-choice-card'+(template.id==='REF-3X12-FLUSH-SURFACE'?' recommended':'');
    card.dataset.boardId=template.id;

    const top=document.createElement('div');
    top.className='board-card-top';
    top.innerHTML='<span>'+mountingLabel(template.mounting)+'</span><em>'+(template.id==='REF-3X12-FLUSH-SURFACE'?'POLECANA':'DOSTĘPNA')+'</em>';

    const title=document.createElement('strong');
    title.textContent=template.name;
    const sub=document.createElement('small');
    sub.textContent=levelLabel(template.level)+' • baza '+(template.sourceRef||'symulator');

    const preview=boardPreview(template);

    const meta=document.createElement('div');
    meta.className='board-card-meta';
    meta.innerHTML=
      '<div><span>RZĘDY</span><b>'+template.rows+'</b></div>'+
      '<div><span>MODUŁY / RZĄD</span><b>'+template.modulesPerRow+'</b></div>'+
      '<div><span>RAZEM</span><b>'+template.totalModules+'M</b></div>';

    const action=document.createElement('span');
    action.className='board-card-action';
    action.textContent='WYBIERZ I ROZPOCZNIJ ›';

    card.append(top,title,sub,preview,meta,action);
    card.addEventListener('click',()=>enterGame('free',template));
    grid.appendChild(card);
  });
}
async function openBoardSelector(){
  if(!sessionValid()){location.reload();return}
  if(!licenseActive()){showHub();window.ElektrykAdminPlayers?.showLicenseWarning?.();return}
  try{await loadScripts()}catch{return}
  renderBoardSelector();
  const modal=document.getElementById('boardSelectorModal');
  if(modal)modal.hidden=false;
}
function closeBoardSelector(){
  const modal=document.getElementById('boardSelectorModal');
  if(modal)modal.hidden=true;
}
async function enterGame(mode='learn',freeTemplate=null,taskId=null){
  if(!sessionValid()){location.reload();return}
  if(!licenseActive()){showHub();window.ElektrykAdminPlayers?.showLicenseWarning?.();return}
  try{await loadScripts()}catch{return}

  closeBoardSelector();

  document.body.classList.remove('auth-locked');
  document.body.classList.add('auth-ready');
  const overlay=document.getElementById('authGate');
  if(overlay)overlay.hidden=true;
  const userLabel=document.getElementById('authUserLabel');
  if(userLabel)userLabel.textContent=String(currentAccount()?.display||currentUser()||'GRACZ').toUpperCase();

  updateModeHeader(mode);

  if(mode==='learn'){
    activeFreeTemplate=null;
    const targetTask=Math.max(1,Number(taskId||readAppState().taskId||1));
    window.ElektrykTasks?.start?.(targetTask);
    saveAppState({view:'game',mode:'learn',taskId:targetTask,freeTemplateId:null});
  }

  if(mode==='free'){
    const db=window.ElektrykSwitchboardDB;
    const template=freeTemplate||activeFreeTemplate||db?.get?.('REF-3X12-FLUSH-SURFACE')||db?.supported?.()?.[0]||null;
    if(template){
      activeFreeTemplate=template;
      window.ElektrykStage2?.configureBoard?.(template);
      const label=document.getElementById('currentFreeBoardLabel');
      if(label)label.textContent=template.name;
      saveAppState({view:'game',mode:'free',freeTemplateId:template.id||null});
    }
    const panelTitle=document.querySelector('.active-task .panel-title');
    if(panelTitle)panelTitle.textContent='WOLNA BUDOWA';
  }

  document.dispatchEvent(new CustomEvent('elektryk:mode-selected',{detail:{mode,template:activeFreeTemplate}}));
  window.ElektrykProgress?.refreshProfile?.();
}
function lock(){
  clearAppState();
  clearSession();
  location.reload();
}
function showMessage(txt,type=''){
  const el=document.getElementById('authMessage');
  if(!el)return;
  el.textContent=txt;
  el.className='auth-message'+(type?' '+type:'');
}
async function login(){
  const loginEl=document.getElementById('authLogin');
  const passEl=document.getElementById('authPassword');
  const btn=document.getElementById('authSubmit');
  const user=(loginEl?.value||'').trim().toLowerCase();
  const pass=passEl?.value||'';
  if(!user||!pass){showMessage('Wpisz login i hasło.','error');return}
  btn.disabled=true;
  showMessage('Sprawdzanie danych…');
  const account=accountStore()?.byLogin?.(user)||null;
  const hash=account?await digest(account.salt+pass):'';
  if(account&&hash===account.passHash){
    saveSession(account);
    saveAppState({view:'hub',mode:'learn',taskId:1,freeTemplateId:null});
    showMessage('Dostęp przyznany.','ok');
    setTimeout(showHub,150);
  }else{
    showMessage('Nieprawidłowy login lub hasło.','error');
    passEl.value='';
    passEl.focus();
  }
  btn.disabled=false;
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('authSubmit')?.addEventListener('click',login);
  document.getElementById('authPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  document.getElementById('authLogin')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('authPassword')?.focus()});
  document.getElementById('authLogout')?.addEventListener('click',lock);
  document.getElementById('hubLogout')?.addEventListener('click',lock);

  document.getElementById('modeLearn')?.addEventListener('click',()=>enterGame('learn'));
  document.getElementById('modeFree')?.addEventListener('click',openBoardSelector);
  document.getElementById('changeFreeBoard')?.addEventListener('click',openBoardSelector);
  document.getElementById('closeBoardSelector')?.addEventListener('click',closeBoardSelector);
  document.getElementById('boardSelectorModal')?.addEventListener('click',e=>{if(e.target.id==='boardSelectorModal')closeBoardSelector()});

  document.getElementById('openPlayerHub')?.addEventListener('click',showHub);
  document.getElementById('openGameSettings')?.addEventListener('click',openSettings);
  document.getElementById('hubSettings')?.addEventListener('click',openSettings);
  document.getElementById('hubPlayers')?.addEventListener('click',openPlayersPanel);
  document.getElementById('closePlayersPanel')?.addEventListener('click',closePlayersPanel);
  document.getElementById('playersModal')?.addEventListener('click',e=>{if(e.target.id==='playersModal')closePlayersPanel()});
  document.getElementById('closeGameSettings')?.addEventListener('click',closeSettings);
  document.getElementById('gameSettingsModal')?.addEventListener('click',e=>{if(e.target.id==='gameSettingsModal')closeSettings()});
  document.getElementById('settingAnimations')?.addEventListener('change',saveSettings);
  document.getElementById('settingGuidance')?.addEventListener('change',saveSettings);
  document.getElementById('settingPanelText')?.addEventListener('change',saveSettings);

  document.addEventListener('elektryk:task-started',e=>{
    if(restoringState)return;
    const id=Number(e.detail?.task?.id||0);
    if(id>0&&readAppState().mode==='learn')saveAppState({view:'game',mode:'learn',taskId:id});
  });

  applySettings();

  if(sessionValid()){
    const state=readAppState();
    if(state.view==='game'){
      restoringState=true;
      const snapshot={...state};
      loadScripts()
        .then(()=>{
          restoringState=false;
          if(snapshot.mode==='free'){
            const template=window.ElektrykSwitchboardDB?.get?.(snapshot.freeTemplateId)||null;
            return enterGame('free',template);
          }
          return enterGame('learn',null,snapshot.taskId||1);
        })
        .catch(()=>{restoringState=false;showHub()});
    }else{
      showHub();
    }
  }else document.getElementById('authLogin')?.focus();
});

window.ElektrykAuth={
  logout:lock,
  isAuthenticated:sessionValid,
  openHub:showHub,
  refreshHub:populateHub,
  openSettings,
  openPlayersPanel,
  currentUser,
  currentAccountId,
  currentAccount,
  isAdmin,
  licenseActive,
  digest,
  openBoardSelector,
  enterGame
};
})();