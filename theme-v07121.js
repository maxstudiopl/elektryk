/* Elektryk Simulator PRO v0.7.12.1 — preferencje wyglądu */
(()=>{
'use strict';
const KEY='elektryk_theme_v07121';
const ALLOWED=['dark','light','auto'];
const root=document.documentElement;
const media=typeof window.matchMedia==='function'?window.matchMedia('(prefers-color-scheme: light)'):null;
function stored(){
  try{const v=localStorage.getItem(KEY);return ALLOWED.includes(v)?v:'dark'}
  catch(e){return 'dark'}
}
let mode=stored();
function resolved(){return mode==='auto'?(media?.matches?'light':'dark'):mode}
function synchronize(){
  root.dataset.theme=resolved();
  root.dataset.themePreference=mode;
  root.style.colorScheme=resolved();
  document.querySelectorAll('[data-theme-choice]').forEach(btn=>{
    const active=btn.dataset.themeChoice===mode;
    btn.setAttribute('aria-pressed',String(active));
    btn.title=active?'Wybrany motyw: '+mode:'Zmień motyw na '+btn.dataset.themeChoice;
  });
  const select=document.getElementById('settingTheme');
  if(select&&select.value!==mode)select.value=mode;
}
function setMode(value){
  if(!ALLOWED.includes(value))return;
  mode=value;
  try{localStorage.setItem(KEY,mode)}catch(e){}
  synchronize();
  document.dispatchEvent(new CustomEvent('elektryk:theme-changed',{detail:{preference:mode,resolved:resolved()}}));
}
function quickControl(label){
  const wrapper=document.createElement('div');
  wrapper.className='theme-quick-control';
  const title=document.createElement('span');
  title.className='theme-quick-label';
  title.textContent=label;
  wrapper.appendChild(title);
  for(const [value,icon,text] of [['dark','☾','DARK'],['light','☀','LIGHT']]){
    const b=document.createElement('button');
    b.type='button';
    b.className='theme-option';
    b.dataset.themeChoice=value;
    b.textContent=icon+' '+text;
    b.setAttribute('aria-label','Włącz motyw '+(value==='dark'?'ciemny':'jasny'));
    b.addEventListener('click',()=>setMode(value));
    wrapper.appendChild(b);
  }
  return wrapper;
}
function mount(){
  const gate=document.querySelector('.auth-card');
  if(gate&&!gate.querySelector('.theme-auth-holder')){
    const row=document.createElement('div');
    row.className='theme-auth-holder';
    row.appendChild(quickControl('WYGLĄD'));
    const footer=gate.querySelector('.auth-footer');
    if(footer)footer.insertAdjacentElement('beforebegin',row);else gate.appendChild(row);
  }
  const nav=document.querySelector('.player-mainnav');
  if(nav&&!nav.querySelector('.theme-nav-holder')){
    const row=document.createElement('div');
    row.className='theme-nav-holder';
    row.appendChild(quickControl('MOTYW'));
    const level=nav.querySelector('#topPlayerLevel');
    if(level)level.insertAdjacentElement('beforebegin',row);else nav.appendChild(row);
  }
  const settings=document.querySelector('.game-settings-body');
  if(settings&&!document.getElementById('settingTheme')){
    const row=document.createElement('label');
    row.className='setting-row setting-row-select theme-setting-row';
    const content=document.createElement('div');
    const heading=document.createElement('b');
    heading.textContent='MOTYW KOLORYSTYCZNY';
    const desc=document.createElement('small');
    desc.textContent='Dark domyślnie • Light • Auto zgodnie z ustawieniem systemu.';
    content.append(heading,desc);
    const select=document.createElement('select');
    select.id='settingTheme';
    for(const [value,label] of [['dark','Ciemny (Dark)'],['light','Jasny (Light)'],['auto','Auto (system)']]){
      const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option);
    }
    select.addEventListener('change',()=>setMode(select.value));
    row.append(content,select);
    settings.insertBefore(row,settings.firstChild);
  }
  synchronize();
}
synchronize(); // start przed wczytaniem pozostałych modułów gry
if(media){
  if(typeof media.addEventListener==='function')media.addEventListener('change',()=>{if(mode==='auto')synchronize()});
  else if(typeof media.addListener==='function')media.addListener(()=>{if(mode==='auto')synchronize()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
window.ElektrykTheme={
  getMode:()=>mode,
  getResolved:resolved,
  setMode
};
})();