(()=>{
function auth(){return window.ElektrykAuth}
function store(){return window.ElektrykAccounts}
function current(){return auth()?.currentAccount?.()||null}
function ensureSummary(){
  const grid=document.querySelector('.account-grid');
  if(!grid)return;
  grid.classList.add('payment-expanded');
  if(!document.getElementById('hubPaymentStatus')){
    const a=document.createElement('div');
    a.innerHTML='<span>PŁATNOŚĆ</span><b id="hubPaymentStatus">—</b>';
    grid.appendChild(a);
  }
  if(!document.getElementById('hubPaymentInfo')){
    const b=document.createElement('div');
    b.innerHTML='<span>INFORMACJA PŁATNICZA</span><b id="hubPaymentInfo">—</b>';
    grid.appendChild(b);
  }
  if(!document.getElementById('hubLicenseWarning')){
    const warning=document.createElement('div');
    warning.id='hubLicenseWarning';
    warning.className='license-warning';
    warning.hidden=true;
    grid.insertAdjacentElement('afterend',warning);
  }
}
function licenseText(a){
  if(!a)return 'BRAK';
  if(a.role==='admin')return 'ADMIN';
  if(!store()?.licenseActive?.(a))return 'BRAK AKTYWNEJ';
  return a.license||'BRAK';
}
function refreshAccountSummary(){
  ensureSummary();
  const a=current();
  if(!a)return;
  const ids={
    hubPlayerName:String(a.display||a.login||'Gracz').toUpperCase(),
    hubAccountUser:String(a.display||a.login||'Gracz').toUpperCase(),
    hubLicense:a.license||'BRAK LICENCJI',
    hubLicenseExpiry:a.licenseExpiry?new Date(a.licenseExpiry+'T23:59:59').toLocaleDateString('pl-PL'):'NIE USTAWIONO',
    hubPaymentStatus:a.paymentStatus||'NIE DOTYCZY',
    hubPaymentInfo:a.paymentInfo||'—'
  };
  Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
  const active=store()?.licenseActive?.(a);
  const warning=document.getElementById('hubLicenseWarning');
  const modes=[document.getElementById('modeFree'),document.getElementById('modeLearn'),document.getElementById('modeExam')];
  modes.forEach(el=>el?.classList.toggle('license-disabled',!active));
  if(warning){
    warning.hidden=!!active;
    if(!active){
      const pay=a.paymentInfo?(' '+a.paymentInfo):' Skontaktuj się z administratorem w sprawie odnowienia dostępu.';
      warning.textContent='BRAK AKTYWNEJ LICENCJI • '+(a.paymentStatus||'STATUS PŁATNOŚCI NIEUSTAWIONY')+'.'+pay;
    }
  }
}
function showLicenseWarning(){
  refreshAccountSummary();
  const warning=document.getElementById('hubLicenseWarning');
  warning?.scrollIntoView?.({behavior:'smooth',block:'center'});
}
function ensureEditor(){
  const modal=document.getElementById('playersModal');
  const list=document.getElementById('playersList');
  if(!modal||!list)return null;
  let editor=document.getElementById('playerEditor');
  if(editor)return editor;
  editor=document.createElement('section');
  editor.id='playerEditor';
  editor.className='player-editor';
  editor.hidden=true;
  editor.innerHTML=
    '<div class="player-editor-head"><b>EDYCJA KONTA</b><span id="editPlayerRole">GRACZ</span></div>'+
    '<input id="editPlayerId" type="hidden">'+
    '<div class="player-edit-grid">'+
      '<label><span>NAZWA KONTA</span><input id="editPlayerDisplay" maxlength="32"></label>'+
      '<label><span>LOGIN</span><input id="editPlayerLogin" maxlength="24" autocomplete="off"></label>'+
      '<label><span>NOWE HASŁO</span><input id="editPlayerSecret" type="password" maxlength="64" autocomplete="new-password" placeholder="Puste = bez zmiany"></label>'+
      '<label><span>LICENCJA</span><select id="editPlayerLicense"><option>BETA / TESTOWA</option><option>MIESIĘCZNA</option><option>ROCZNA</option><option>BRAK LICENCJI</option></select></label>'+
      '<label><span>LICENCJA WYGASA</span><input id="editPlayerExpiry" type="date"></label>'+
      '<label><span>STATUS PŁATNOŚCI</span><select id="editPlayerPayment"><option>NIE DOTYCZY</option><option>OPŁACONA</option><option>NIEOPŁACONA</option><option>OCZEKUJE</option></select></label>'+
      '<label class="wide"><span>INFORMACJA O PŁATNOŚCI / BRAKU LICENCJI</span><textarea id="editPlayerPaymentInfo" maxlength="180" rows="3"></textarea></label>'+
    '</div>'+
    '<div class="player-editor-actions"><button id="savePlayerAccount">ZAPISZ ZMIANY</button><button id="cancelPlayerEdit">ANULUJ</button></div>'+
    '<div class="player-editor-message" id="playerEditorMessage"></div>';
  const note=modal.querySelector('.players-note');
  if(note)note.insertAdjacentElement('beforebegin',editor);else list.insertAdjacentElement('afterend',editor);
  editor.querySelector('#savePlayerAccount')?.addEventListener('click',saveEditor);
  editor.querySelector('#cancelPlayerEdit')?.addEventListener('click',()=>{editor.hidden=true});
  return editor;
}
function render(){
  if(!auth()?.isAdmin?.())return;
  const list=document.getElementById('playersList');
  if(!list)return;
  list.innerHTML='';
  store()?.all?.().forEach(a=>{
    const active=store()?.licenseActive?.(a);
    const card=document.createElement('article');
    card.className='player-account'+(a.role==='admin'?' admin':'')+(active?'':' license-off');
    card.innerHTML=
      '<div><span>'+(a.role==='admin'?'ADMINISTRATOR':'GRACZ')+'</span><b></b><small></small></div>'+
      '<div class="player-license"><b></b><small></small></div>'+
      '<button class="player-edit-btn">EDYTUJ</button>';
    card.querySelector('div>b').textContent=a.display||a.login;
    card.querySelector('div>small').textContent='Login: '+a.login+' • '+a.role;
    const lic=card.querySelector('.player-license');
    lic.querySelector('b').textContent=licenseText(a);
    lic.querySelector('small').textContent=a.licenseExpiry?('do '+new Date(a.licenseExpiry+'T23:59:59').toLocaleDateString('pl-PL')):(a.paymentStatus||'NIE DOTYCZY');
    card.querySelector('.player-edit-btn').addEventListener('click',()=>openEditor(a.id));
    list.appendChild(card);
  });
  ensureEditor();
}
function openEditor(id){
  const a=store()?.byId?.(id);
  const e=ensureEditor();
  if(!a||!e)return;
  e.hidden=false;
  document.getElementById('editPlayerId').value=a.id;
  document.getElementById('editPlayerDisplay').value=a.display||'';
  document.getElementById('editPlayerLogin').value=a.login||'';
  document.getElementById('editPlayerSecret').value='';
  document.getElementById('editPlayerLicense').value=a.license||'BETA / TESTOWA';
  document.getElementById('editPlayerExpiry').value=a.licenseExpiry||'';
  document.getElementById('editPlayerPayment').value=a.paymentStatus||'NIE DOTYCZY';
  document.getElementById('editPlayerPaymentInfo').value=a.paymentInfo||'';
  document.getElementById('editPlayerRole').textContent=a.role==='admin'?'ADMINISTRATOR':'GRACZ';
  const msg=document.getElementById('playerEditorMessage');if(msg){msg.textContent='';msg.className='player-editor-message'}
  e.scrollIntoView?.({behavior:'smooth',block:'nearest'});
}
async function saveEditor(){
  if(!auth()?.isAdmin?.())return;
  const id=document.getElementById('editPlayerId')?.value;
  const account=store()?.byId?.(id);
  if(!account)return;
  const login=(document.getElementById('editPlayerLogin')?.value||'').trim().toLowerCase();
  const display=(document.getElementById('editPlayerDisplay')?.value||'').trim();
  const msg=document.getElementById('playerEditorMessage');
  if(!login||!display){
    if(msg){msg.textContent='Nazwa konta i login są wymagane.';msg.className='player-editor-message error'}return;
  }
  const duplicate=store()?.all?.().find(x=>x.id!==id&&String(x.login).toLowerCase()===login);
  if(duplicate){
    if(msg){msg.textContent='Ten login jest już używany przez inne konto.';msg.className='player-editor-message error'}return;
  }
  const patch={
    login,display,
    license:document.getElementById('editPlayerLicense')?.value||'BRAK LICENCJI',
    licenseExpiry:document.getElementById('editPlayerExpiry')?.value||'',
    paymentStatus:document.getElementById('editPlayerPayment')?.value||'NIE DOTYCZY',
    paymentInfo:document.getElementById('editPlayerPaymentInfo')?.value||''
  };
  const secret=document.getElementById('editPlayerSecret')?.value||'';
  if(secret){
    const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);
    patch.salt='elektryk-v0711-'+id+'-'+[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
    patch.passHash=await auth()?.digest?.(patch.salt+secret);
  }
  store()?.save?.(id,patch);
  document.getElementById('editPlayerSecret').value='';
  if(msg){msg.textContent='Zmiany konta zostały zapisane.';msg.className='player-editor-message ok'}
  render();
  refreshAccountSummary();
  auth()?.refreshHub?.();
}
function attach(){
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='admin-players-v0711.css?v=0711';
  document.head.appendChild(link);
  ensureSummary();
  document.getElementById('hubPlayers')?.addEventListener('click',()=>setTimeout(render,0));
  refreshAccountSummary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
window.ElektrykAdminPlayers={render,refreshAccountSummary,showLicenseWarning};
})();