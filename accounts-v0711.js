(()=>{
const STORE='elektryk_accounts_admin_v0711';
const DEFAULTS={
  admin:{id:'admin',login:'admin',display:'Admin',role:'admin',license:'BETA / TESTOWA',licenseExpiry:'',paymentStatus:'NIE DOTYCZY',paymentInfo:'',salt:'elektryk-v050-single-2026',passHash:'3dee654f9d15a95ed45332ec703f94258cb70f86cf2cdaaeb7d3240b399d354e'},
  demo:{id:'demo',login:'demo',display:'Demo',role:'player',license:'BETA / TESTOWA',licenseExpiry:'',paymentStatus:'NIE DOTYCZY',paymentInfo:'',salt:'elektryk-v0711-player-2026',passHash:'06e5c32716fe194884663e2b1ca32644591c7e87916fdb61d0cce7eb7ba5596b'},
  kamil:{id:'kamil',login:'kamil',display:'Kamil',role:'player',license:'BETA / TESTOWA',licenseExpiry:'',paymentStatus:'NIE DOTYCZY',paymentInfo:'',salt:'elektryk-v0711-player-2026',passHash:'06e5c32716fe194884663e2b1ca32644591c7e87916fdb61d0cce7eb7ba5596b'}
};
function readRaw(){
  try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return {}}
}
function all(){
  const saved=readRaw();
  return Object.values(DEFAULTS).map(base=>Object.assign({},base,saved[base.id]||{}, {id:base.id,role:base.role}));
}
function byId(id){return all().find(x=>x.id===String(id))||null}
function byLogin(login){
  const q=String(login||'').trim().toLowerCase();
  return all().find(x=>String(x.login||'').toLowerCase()===q)||null;
}
function save(id,patch={}){
  if(!DEFAULTS[id])return null;
  const saved=readRaw();
  const clean={
    login:String(patch.login??byId(id)?.login??id).trim().slice(0,24),
    display:String(patch.display??byId(id)?.display??id).trim().slice(0,32),
    license:String(patch.license??byId(id)?.license??'BETA / TESTOWA'),
    licenseExpiry:String(patch.licenseExpiry??byId(id)?.licenseExpiry??''),
    paymentStatus:String(patch.paymentStatus??byId(id)?.paymentStatus??'NIE DOTYCZY'),
    paymentInfo:String(patch.paymentInfo??byId(id)?.paymentInfo??'').trim().slice(0,180)
  };
  if(patch.salt)clean.salt=String(patch.salt);
  if(patch.passHash)clean.passHash=String(patch.passHash);
  saved[id]=Object.assign({},saved[id]||{},clean);
  localStorage.setItem(STORE,JSON.stringify(saved));
  return byId(id);
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
window.ElektrykAccounts={all,byId,byLogin,save,licenseActive};
})();