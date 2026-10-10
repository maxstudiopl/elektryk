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

function refreshAccountSummary(){
  ensureSummary();
  const a=current();
  if(!a)return;
  const display=[a.firstName,a.lastName].filter(Boolean).join(' ')||a.display||a.login||'Gracz';
  const ids={
    hubPlayerName:String(display).toUpperCase(),
    hubAccountUser:String(a.display||display).toUpperCase(),
    hubLicense:a.license||'BRAK LICENCJI',
    hubLicenseExpiry:a.licenseExpiry?new Date(a.licenseExpiry+'T23:59:59').toLocaleDateString('pl-PL'):'NIE USTAWIONO',
    hubPaymentStatus:a.paymentStatus||'NIE DOTYCZY',
    hubPaymentInfo:a.paymentInfo||'—'
  };
  Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value});
  const active=store()?.licenseActive?.(a);
  const warning=document.getElementById('hubLicenseWarning');
  [document.getElementById('modeFree'),document.getElementById('modeLearn'),document.getElementById('modeExam'),document.getElementById('modeIndustrial')]
    .forEach(el=>el?.classList.toggle('license-disabled',!active));
  if(warning){
    warning.hidden=!!active;
    if(!active){
      const pay=a.paymentInfo?(' '+a.paymentInfo):' Skontaktuj się z administratorem w sprawie odnowienia dostępu.';
      warning.textContent='BRAK AKTYWNEJ LICENCJI • '+(a.paymentStatus||'STATUS PŁATNOŚCI NIEUSTAWIONY')+'.'+pay;
    }
  }
  const notice=document.getElementById('hubAccessNotice');
  if(notice){
    notice.hidden=!!active;
    notice.textContent=active?'':warning?.textContent||'Brak aktywnej licencji. Otwórz Ustawienia → Moje konto.';
  }
}

function showLicenseWarning(){
  refreshAccountSummary();
  auth()?.openSettings?.();
  window.ElektrykUserPanel?.showSettingsTab?.('account');
  requestAnimationFrame(()=>document.getElementById('hubLicenseWarning')?.scrollIntoView?.({behavior:'smooth',block:'center'}));
}

function ensureToolbar(){
  const list=document.getElementById('playersList');
  if(!list)return;
  let bar=document.getElementById('playersToolbar');
  if(bar)return bar;
  bar=document.createElement('div');
  bar.id='playersToolbar';
  bar.className='players-toolbar';
  const count=document.createElement('span');
  count.id='playersCount';
  const add=document.createElement('button');
  add.id='addPlayerAccount';
  add.textContent='＋ DODAJ KONTO';
  add.addEventListener('click',openNewEditor);
  bar.append(count,add);
  list.insertAdjacentElement('beforebegin',bar);
  return bar;
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
    '<div class="player-editor-head"><b id="playerEditorTitle">EDYCJA KONTA</b><span id="editPlayerRole">GRACZ</span></div>'+
    '<input id="editPlayerId" type="hidden">'+
    '<input id="editPlayerMode" type="hidden" value="edit">'+
    '<div class="player-edit-section-title">DANE UŻYTKOWNIKA</div>'+
    '<div class="player-edit-grid">'+
      '<label><span>IMIĘ *</span><input id="editPlayerFirstName" maxlength="50" autocomplete="off"></label>'+
      '<label><span>NAZWISKO *</span><input id="editPlayerLastName" maxlength="70" autocomplete="off"></label>'+
      '<label class="wide"><span>NAZWA FIRMY <i>OPCJONALNIE</i></span><input id="editPlayerCompany" maxlength="90" autocomplete="organization"></label>'+
      '<label><span>E-MAIL *</span><input id="editPlayerEmail" type="email" maxlength="120" autocomplete="email"></label>'+
      '<label><span>TELEFON *</span><input id="editPlayerPhone" maxlength="40" autocomplete="tel"></label>'+
    '</div>'+
    '<div class="player-edit-section-title">DOSTĘP DO GRY</div>'+
    '<div class="player-edit-grid">'+
      '<label><span>NAZWA KONTA</span><input id="editPlayerDisplay" maxlength="32"></label>'+
      '<label><span>LOGIN *</span><input id="editPlayerLogin" maxlength="24" autocomplete="off"></label>'+
      '<label><span id="editPasswordLabel">NOWE HASŁO</span><input id="editPlayerSecret" type="password" maxlength="64" autocomplete="new-password" placeholder="Puste = bez zmiany"></label>'+
      '<label><span>LICENCJA</span><select id="editPlayerLicense"><option>BETA / TESTOWA</option><option>MIESIĘCZNA</option><option>ROCZNA</option><option>BRAK LICENCJI</option></select></label>'+
      '<label><span>LICENCJA WYGASA</span><input id="editPlayerExpiry" type="date"></label>'+
      '<label><span>STATUS PŁATNOŚCI</span><select id="editPlayerPayment"><option>NIE DOTYCZY</option><option>OPŁACONA</option><option>NIEOPŁACONA</option><option>OCZEKUJE</option></select></label>'+
      '<label class="wide"><span>INFORMACJA O PŁATNOŚCI / BRAKU LICENCJI</span><textarea id="editPlayerPaymentInfo" maxlength="180" rows="3"></textarea></label>'+
    '</div>'+
    '<div class="player-editor-actions"><button id="savePlayerAccount">ZAPISZ KONTO</button><button id="cancelPlayerEdit">ANULUJ</button></div>'+
    '<div class="player-editor-message" id="playerEditorMessage"></div>';

  const note=modal.querySelector('.players-note');
  if(note)note.insertAdjacentElement('beforebegin',editor);else list.insertAdjacentElement('afterend',editor);
  editor.querySelector('#savePlayerAccount')?.addEventListener('click',saveEditor);
  editor.querySelector('#cancelPlayerEdit')?.addEventListener('click',()=>{editor.hidden=true});
  return editor;
}

function setMessage(text,type=''){
  const msg=document.getElementById('playerEditorMessage');
  if(!msg)return;
  msg.textContent=text||'';
  msg.className='player-editor-message'+(type?' '+type:'');
}

function render(){
  if(!auth()?.isAdmin?.())return;
  const list=document.getElementById('playersList');
  if(!list)return;
  ensureToolbar();
  list.innerHTML='';
  const accounts=store()?.all?.()||[];
  const count=document.getElementById('playersCount');
  if(count)count.textContent=accounts.length+' KONTA';

  accounts.forEach(a=>{
    const active=store()?.licenseActive?.(a);
    const fullName=[a.firstName,a.lastName].filter(Boolean).join(' ')||a.display||a.login;
    const card=document.createElement('article');
    card.className='player-account'+(a.role==='admin'?' admin':'')+(active?'':' license-off');

    const main=document.createElement('div');
    const role=document.createElement('span');
    role.textContent=a.role==='admin'?'ADMINISTRATOR':'GRACZ';
    const title=document.createElement('b');
    title.textContent=fullName;
    const sub=document.createElement('small');
    const company=a.company?(' • '+a.company):'';
    sub.textContent='Login: '+a.login+company;
    const contact=document.createElement('small');
    contact.className='player-contact';
    contact.textContent=[a.email,a.phone].filter(Boolean).join(' • ')||'Brak danych kontaktowych';
    main.append(role,title,sub,contact);

    const lic=document.createElement('div');
    lic.className='player-license';
    const licName=document.createElement('b');
    licName.textContent=a.role==='admin'?'ADMIN':(active?(a.license||'BRAK'):'BRAK AKTYWNEJ');
    const licDate=document.createElement('small');
    licDate.textContent=a.licenseExpiry?('do '+new Date(a.licenseExpiry+'T23:59:59').toLocaleDateString('pl-PL')):(a.paymentStatus||'NIE DOTYCZY');
    lic.append(licName,licDate);

    const edit=document.createElement('button');
    edit.className='player-edit-btn';
    edit.textContent='EDYTUJ';
    edit.addEventListener('click',()=>openEditor(a.id));

    card.append(main,lic,edit);
    list.appendChild(card);
  });
  ensureEditor();
}

function fillEditor(a,mode){
  const e=ensureEditor();
  if(!e)return;
  e.hidden=false;
  document.getElementById('editPlayerMode').value=mode;
  document.getElementById('editPlayerId').value=a?.id||'';
  document.getElementById('playerEditorTitle').textContent=mode==='new'?'DODAJ NOWE KONTO':'EDYCJA KONTA';
  document.getElementById('editPlayerRole').textContent=a?.role==='admin'?'ADMINISTRATOR':'GRACZ';
  document.getElementById('editPlayerFirstName').value=a?.firstName||'';
  document.getElementById('editPlayerLastName').value=a?.lastName||'';
  document.getElementById('editPlayerCompany').value=a?.company||'';
  document.getElementById('editPlayerEmail').value=a?.email||'';
  document.getElementById('editPlayerPhone').value=a?.phone||'';
  document.getElementById('editPlayerDisplay').value=a?.display||'';
  document.getElementById('editPlayerLogin').value=a?.login||'';
  document.getElementById('editPlayerSecret').value='';
  document.getElementById('editPasswordLabel').textContent=mode==='new'?'HASŁO *':'NOWE HASŁO';
  document.getElementById('editPlayerSecret').placeholder=mode==='new'?'Ustaw hasło nowego konta':'Puste = bez zmiany';
  document.getElementById('editPlayerLicense').value=a?.license||'BETA / TESTOWA';
  document.getElementById('editPlayerExpiry').value=a?.licenseExpiry||'';
  document.getElementById('editPlayerPayment').value=a?.paymentStatus||'NIE DOTYCZY';
  document.getElementById('editPlayerPaymentInfo').value=a?.paymentInfo||'';
  setMessage('');
  e.scrollIntoView?.({behavior:'smooth',block:'nearest'});
}

function openEditor(id){
  const a=store()?.byId?.(id);
  if(a)fillEditor(a,'edit');
}
function openNewEditor(){
  fillEditor({role:'player',license:'BETA / TESTOWA',paymentStatus:'NIE DOTYCZY'},'new');
}

function validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||''));
}
async function passwordPatch(id,secret){
  if(!secret)return {};
  const bytes=new Uint8Array(10);crypto.getRandomValues(bytes);
  const salt='elektryk-v0711-'+id+'-'+[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
  return {salt,passHash:await auth()?.digest?.(salt+secret)};
}

async function saveEditor(){
  if(!auth()?.isAdmin?.())return;
  const mode=document.getElementById('editPlayerMode')?.value||'edit';
  const id=document.getElementById('editPlayerId')?.value||'';
  const firstName=(document.getElementById('editPlayerFirstName')?.value||'').trim();
  const lastName=(document.getElementById('editPlayerLastName')?.value||'').trim();
  const company=(document.getElementById('editPlayerCompany')?.value||'').trim();
  const email=(document.getElementById('editPlayerEmail')?.value||'').trim();
  const phone=(document.getElementById('editPlayerPhone')?.value||'').trim();
  const login=(document.getElementById('editPlayerLogin')?.value||'').trim().toLowerCase();
  const display=(document.getElementById('editPlayerDisplay')?.value||'').trim()||[firstName,lastName].filter(Boolean).join(' ');
  const secret=document.getElementById('editPlayerSecret')?.value||'';

  if(!firstName||!lastName||!email||!phone||!login){
    setMessage('Uzupełnij: imię, nazwisko, e-mail, telefon i login.','error');return;
  }
  if(!validEmail(email)){setMessage('Podaj poprawny adres e-mail.','error');return}
  if(mode==='new'&&!secret){setMessage('Nowe konto musi mieć ustawione hasło.','error');return}

  const duplicate=store()?.all?.().find(x=>x.id!==id&&String(x.login).toLowerCase()===login);
  if(duplicate){setMessage('Ten login jest już używany przez inne konto.','error');return}

  const base={
    firstName,lastName,company,email,phone,login,display,
    license:document.getElementById('editPlayerLicense')?.value||'BETA / TESTOWA',
    licenseExpiry:document.getElementById('editPlayerExpiry')?.value||'',
    paymentStatus:document.getElementById('editPlayerPayment')?.value||'NIE DOTYCZY',
    paymentInfo:document.getElementById('editPlayerPaymentInfo')?.value||''
  };

  if(mode==='new'){
    const tempId='new_'+Date.now().toString(36);
    const cred=await passwordPatch(tempId,secret);
    const result=store()?.create?.(Object.assign({},base,cred));
    if(!result?.ok){
      setMessage(result?.error==='LOGIN_EXISTS'?'Ten login już istnieje.':'Nie udało się utworzyć konta.','error');
      return;
    }
    setMessage('Nowe konto zostało utworzone.','ok');
  }else{
    const account=store()?.byId?.(id);
    if(!account){setMessage('Nie znaleziono konta.','error');return}
    const cred=await passwordPatch(id,secret);
    store()?.save?.(id,Object.assign({},base,cred));
    setMessage('Zmiany konta zostały zapisane.','ok');
  }

  document.getElementById('editPlayerSecret').value='';
  render();
  refreshAccountSummary();
  auth()?.refreshHub?.();
}

function ensureProjectTime(){
  const host=document.querySelector('.auth-brand-actions');
  if(!host||document.getElementById('hubProjectTime'))return;
  const box=document.createElement('div');
  box.id='hubProjectTime';
  box.className='hub-project-time';
  box.innerHTML='<span>CZAS ROZWOJU</span><b>~12 H</b><small>PRACY NAD PROJEKTEM</small>';
  host.appendChild(box);
}
function attach(){
  if(!document.querySelector('link[data-admin-players-style]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='admin-players-v0711.css?v=0711users7';
    link.dataset.adminPlayersStyle='1';
    document.head.appendChild(link);
  }
  ensureProjectTime();
  ensureSummary();
  document.getElementById('hubPlayers')?.addEventListener('click',()=>setTimeout(render,0));
  refreshAccountSummary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
window.ElektrykAdminPlayers={render,refreshAccountSummary,showLicenseWarning,openNewEditor};
})();