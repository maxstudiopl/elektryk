(()=>{
const USER='admin';
const SALT='elektryk-v050-single-2026';
const PASS_HASH='3dee654f9d15a95ed45332ec703f94258cb70f86cf2cdaaeb7d3240b399d354e';
const SESSION_KEY='elektryk_auth_v050';
const SESSION_MS=8*60*60*1000;
const scripts=[
  'ui.js?v=0500',
  'stage2.js?v=0500',
  'stage3.js?v=0500',
  'bridges-v031.js?v=0500',
  'stage4.js?v=0500',
  'tasks-v046.js?v=0500',
  'busbars-v047.js?v=0500',
  'help-v049.js?v=0500'
];
let gameLoaded=false;

function hex(buffer){return [...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function digest(text){
  const data=new TextEncoder().encode(text);
  return hex(await crypto.subtle.digest('SHA-256',data));
}
function sessionValid(){
  try{
    const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return !!(s&&s.user===USER&&Number(s.expires)>Date.now());
  }catch{return false}
}
function saveSession(){localStorage.setItem(SESSION_KEY,JSON.stringify({user:USER,expires:Date.now()+SESSION_MS}))}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function loadScripts(){
  if(gameLoaded)return;
  gameLoaded=true;
  let chain=Promise.resolve();
  scripts.forEach(src=>{
    chain=chain.then(()=>new Promise((resolve,reject)=>{
      const el=document.createElement('script');
      el.src=src;el.defer=false;el.onload=resolve;el.onerror=reject;
      document.body.appendChild(el);
    }));
  });
  chain.catch(()=>showMessage('Nie udało się uruchomić plików gry. Odśwież stronę.','error'));
}
function unlock(){
  document.body.classList.remove('auth-locked');
  document.body.classList.add('auth-ready');
  const overlay=document.getElementById('authGate');
  if(overlay)overlay.hidden=true;
  const userLabel=document.getElementById('authUserLabel');
  if(userLabel)userLabel.textContent=USER.toUpperCase();
  loadScripts();
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
  btn.disabled=true;showMessage('Sprawdzanie danych…');
  const hash=await digest(SALT+pass);
  if(user===USER&&hash===PASS_HASH){
    saveSession();showMessage('Dostęp przyznany.','ok');setTimeout(unlock,180);
  }else{
    showMessage('Nieprawidłowy login lub hasło.','error');
    passEl.value='';passEl.focus();
  }
  btn.disabled=false;
}
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('authSubmit')?.addEventListener('click',login);
  document.getElementById('authPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  document.getElementById('authLogin')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('authPassword')?.focus()});
  document.getElementById('authLogout')?.addEventListener('click',lock);
  if(sessionValid())unlock();
  else document.getElementById('authLogin')?.focus();
});
window.ElektrykAuth={logout:lock,isAuthenticated:sessionValid};
})();