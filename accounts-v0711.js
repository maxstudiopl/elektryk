(()=>{
const STORE='elektryk_accounts_admin_v0711_2';
const LEGACY_STORE='elektryk_accounts_admin_v0711';

const DEFAULTS={
  admin:{
    id:'admin',login:'admin',display:'Admin',role:'admin',
    firstName:'',lastName:'',company:'',email:'',phone:'',
    license:'BETA / TESTOWA',licenseExpiry:'',
    paymentStatus:'NIE DOTYCZY',paymentInfo:'',
    salt:'elektryk-v050-single-2026',
    passHash:'3dee654f9d15a95ed45332ec703f94258cb70f86cf2cdaaeb7d3240b399d354e',
    credentialVersion:2,createdAt:0
  },
  demo:{
    id:'demo',login:'demo',display:'Demo',role:'player',
    firstName:'Demo',lastName:'',company:'',email:'',phone:'',
    license:'DEMO / PODGLĄD',licenseExpiry:'',
    paymentStatus:'NIE DOTYCZY',paymentInfo:'',
    salt:'rozdzielnicapro-demo-v07133',
    passHash:'cb567bcb2f7a98def5f55bac777fc1de44aa6cd6374ffb2973f547fe111da74e',
    credentialVersion:3,createdAt:0
  },
  kamil:{
    id:'kamil',login:'kamil',display:'Kamil',role:'player',
    firstName:'Kamil',lastName:'',company:'',email:'',phone:'',
    license:'BETA / TESTOWA',licenseExpiry:'',
    paymentStatus:'NIE DOTYCZY',paymentInfo:'',
    salt:'elektryk-v0711-player-2026',
    passHash:'06e5c32716fe194884663e2b1ca32644591c7e87916fdb61d0cce7eb7ba5596b',
    credentialVersion:2,createdAt:0
  }
};

function cleanText(v,max=120){return String(v??'').trim().slice(0,max)}
function readStore(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORE)||'null');
    if(raw&&typeof raw==='object')return raw;
  }catch{}
  return {};
}
function writeStore(data){
  localStorage.setItem(STORE,JSON.stringify(data||{}));
}
function migrateLegacy(){
  if(localStorage.getItem(STORE))return;
  let legacy={};
  try{legacy=JSON.parse(localStorage.getItem(LEGACY_STORE)||'{}')||{}}catch{}
  const out={};
  Object.keys(DEFAULTS).forEach(id=>{
    const old=legacy[id];
    if(!old||typeof old!=='object')return;
    out[id]=Object.assign({},old);
  });
  writeStore(out);
}
migrateLegacy();

function normalize(base,patch={}){
  const a=Object.assign({},base||{},patch||{});
  return {
    id:cleanText(a.id,48),
    login:cleanText(a.login,24).toLowerCase(),
    display:cleanText(a.display,32),
    role:a.role==='admin'?'admin':'player',
    firstName:cleanText(a.firstName,50),
    lastName:cleanText(a.lastName,70),
    company:cleanText(a.company,90),
    email:cleanText(a.email,120),
    phone:cleanText(a.phone,40),
    license:cleanText(a.license||'BETA / TESTOWA',40),
    licenseExpiry:cleanText(a.licenseExpiry,16),
    paymentStatus:cleanText(a.paymentStatus||'NIE DOTYCZY',30),
    paymentInfo:cleanText(a.paymentInfo,180),
    salt:String(a.salt||''),
    passHash:String(a.passHash||''),
    credentialVersion:Number(a.credentialVersion||0),
    createdAt:Number(a.createdAt||Date.now())
  };
}
function all(){
  const saved=readStore();
  const ids=new Set([...Object.keys(DEFAULTS),...Object.keys(saved)]);
  return [...ids].map(id=>{
    const base=DEFAULTS[id]||{id,role:'player'};
    const patch=Object.assign({},saved[id]||{});
    if(DEFAULTS[id]&&Number(patch.credentialVersion||0)<2){
      delete patch.salt;
      delete patch.passHash;
    }
    // Demo is a built-in, always read-only showcase account. A stale browser
    // account record may not replace its canonical login/password/license.
    if(id==='demo'){
      for(const key of ['login','role','license','licenseExpiry','salt','passHash','credentialVersion']){
        patch[key]=base[key];
      }
    }
    const merged=normalize(base,patch);
    merged.id=id;
    if(DEFAULTS[id]?.role==='admin')merged.role='admin';
    return merged;
  }).sort((a,b)=>{
    if(a.role!==b.role)return a.role==='admin'?-1:1;
    return String(a.display||a.login).localeCompare(String(b.display||b.login),'pl');
  });
}
function byId(id){return all().find(x=>x.id===String(id))||null}
function byLogin(login){
  const q=cleanText(login,24).toLowerCase();
  return all().find(x=>String(x.login||'').toLowerCase()===q)||null;
}
function save(id,patch={}){
  const current=byId(id);
  if(!current)return null;
  const data=readStore();
  const next=normalize(current,Object.assign({},patch,{id:current.id,role:current.role}));
  data[id]=next;
  writeStore(data);
  return byId(id);
}
function create(input={}){
  const login=cleanText(input.login,24).toLowerCase();
  if(!login)return {ok:false,error:'LOGIN_REQUIRED'};
  if(byLogin(login))return {ok:false,error:'LOGIN_EXISTS'};
  const id='usr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
  const account=normalize({
    id,login,
    display:cleanText(input.display,32)||login,
    role:'player',
    firstName:cleanText(input.firstName,50),
    lastName:cleanText(input.lastName,70),
    company:cleanText(input.company,90),
    email:cleanText(input.email,120),
    phone:cleanText(input.phone,40),
    license:cleanText(input.license||'BETA / TESTOWA',40),
    licenseExpiry:cleanText(input.licenseExpiry,16),
    paymentStatus:cleanText(input.paymentStatus||'NIE DOTYCZY',30),
    paymentInfo:cleanText(input.paymentInfo,180),
    salt:String(input.salt||''),
    passHash:String(input.passHash||''),
    credentialVersion:2,
    createdAt:Date.now()
  });
  const data=readStore();
  data[id]=account;
  writeStore(data);
  return {ok:true,account:byId(id)};
}
function remove(id){
  if(DEFAULTS[id])return false;
  const data=readStore();
  if(!data[id])return false;
  delete data[id];
  writeStore(data);
  return true;
}
function licenseActive(account){
  if(!account)return false;
  if(account.role==='admin')return true;
  if(account.license==='BRAK LICENCJI')return false;
  if(account.licenseExpiry){
    const end=new Date(account.licenseExpiry+'T23:59:59');
    if(Number.isFinite(end.getTime())&&end.getTime()<Date.now())return false;
  }
  return true;
}
window.ElektrykAccounts={all,byId,byLogin,save,create,remove,licenseActive};
})();