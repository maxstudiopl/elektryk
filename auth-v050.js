(()=>{
const USER='admin';
const SALT='elektryk-v050-single-2026';
const PASS_HASH='3dee654f9d15a95ed45332ec703f94258cb70f86cf2cdaaeb7d3240b399d354e';
const SESSION_KEY='elektryk_auth_v050';
const SETTINGS_KEY='elektryk_settings_v076';
const SESSION_MS=8*60*60*1000;
const LICENSE_TYPE='BETA / TESTOWA';
const LICENSE_EXPIRY=null;

const scripts=[
  'ui.js?v=0706',
  'switchboard-db.js?v=0706',
  'stage2.js?v=0706',
  'stage3.js?v=0706',
  'bridges-v031.js?v=0706',
  'stage4.js?v=0706',
  'tasks-v046.js?v=0706',
  'busbars-v047.js?v=0706',
  'help-v049.js?v=0706',
  'progress-v060.js?v=0706'
];

let gameLoaded=false;
let gameReadyPromise=null;

function hex(buffer){return [...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function digest(text){
  const data=new TextEncoder().encode(text);
  return hex(await crypto.subtle.digest('SHA-256',data));
}
function sessionData(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}
}
function sessionValid(){
  const s=sessionData();
  return !!(s&&s.user===USER&&Number(s.expires)>Date.now());
}
function saveSession(){
  localStorage.setItem(SESSION_KEY,JSON.stringify({user:USER,expires:Date.now()+SESSION_MS}));
}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function formatDate(ts){
  if(!ts)return 'NIE USTAWIONO';
  try{return new Date(Number(ts)).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'})}
  catch{return '—'}
}
function readSettings(){
  try{
    return Object.assign({animations:true,guidance:true},JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'));
  }catch{return {animations:true,guidance:true}}
}
function applySettings(settings=readSettings()){
  document.body.classList.toggle('no-ui-animations',!settings.animations);
  document.body.classList.toggle('no-terminal-guidance',!settings.guidance);
  const a=document.getElementById('settingAnimations');
  const g=document.getElementById('settingGuidance');
  if(a)a.checked=!!settings.animations;
  if(g)g.checked=!!settings.guidance;
}
function saveSettings(){
  const settings={
    animations:!!document.getElementById('settingAnimations')?.checked,
    guidance:!!document.getElementById('settingGuidance')?.checked
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
  const name=String(s?.user||USER).toUpperCase();
  const map={
    hubPlayerName:name,
    hubAccountUser:name,
    hubLicense:LICENSE_TYPE,
    hubLicenseExpiry:LICENSE_EXPIRY?formatDate(LICENSE_EXPIRY):'NIE USTAWIONO',
    hubSessionExpiry:formatDate(s?.expires)
  };
  Object.entries(map).forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  });
}
function showHub(){
  if(!sessionValid())return;
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
  document.querySelector('.reward')?.classList.toggle('mode-hidden',mode!=='learn');
}
async function enterGame(mode='learn'){
  if(!sessionValid()){location.reload();return}
  try{await loadScripts()}catch{return}
  document.body.classList.remove('auth-locked');
  document.body.classList.add('auth-ready');
  const overlay=document.getElementById('authGate');
  if(overlay)overlay.hidden=true;
  const userLabel=document.getElementById('authUserLabel');
  if(userLabel)userLabel.textContent=USER.toUpperCase();

  updateModeHeader(mode);

  if(mode==='free'){
    const db=window.ElektrykSwitchboardDB;
    const template=db?.get?.('REF-3X12-FLUSH-SURFACE')||db?.supported?.()?.[0]||null;
    if(template)window.ElektrykStage2?.configureBoard?.(template);
    const panelTitle=document.querySelector('.active-task .panel-title');
    if(panelTitle)panelTitle.textContent='WOLNA BUDOWA';
  }

  document.dispatchEvent(new CustomEvent('elektryk:mode-selected',{detail:{mode}}));
  window.ElektrykProgress?.refreshProfile?.();
}
function lock(){
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
  const user=(loginEl?.value||'').trim();
  const pass=passEl?.value||'';
  if(!user||!pass){showMessage('Wpisz login i hasło.','error');return}
  btn.disabled=true;
  showMessage('Sprawdzanie danych…');
  const hash=await digest(SALT+pass);
  if(user===USER&&hash===PASS_HASH){
    saveSession();
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

  document.getElementById('modeLearn')?.addEventListener('click',()=>enterGame('learn'));
  document.getElementById('modeFree')?.addEventListener('click',()=>enterGame('free'));

  document.getElementById('openPlayerHub')?.addEventListener('click',showHub);
  document.getElementById('openGameSettings')?.addEventListener('click',openSettings);
  document.getElementById('hubSettings')?.addEventListener('click',openSettings);
  document.getElementById('closeGameSettings')?.addEventListener('click',closeSettings);
  document.getElementById('gameSettingsModal')?.addEventListener('click',e=>{if(e.target.id==='gameSettingsModal')closeSettings()});
  document.getElementById('settingAnimations')?.addEventListener('change',saveSettings);
  document.getElementById('settingGuidance')?.addEventListener('change',saveSettings);

  applySettings();

  if(sessionValid())showHub();
  else document.getElementById('authLogin')?.focus();
});

window.ElektrykAuth={
  logout:lock,
  isAuthenticated:sessionValid,
  openHub:showHub,
  openSettings,
  enterGame
};
})();