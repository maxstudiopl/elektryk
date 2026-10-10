/* RozdzielnicaPRO.pl • v0.7.17.3
 * Sześć niezależnych sekcji +/- z zachowaniem aktualnego stanu JS.
 * Nie zmieniamy DOM aparatury, listw, kabli ani katalogu.
 */
(()=>{
'use strict';
function init(){
  const defs=[
    {selector:'.leftbar .active-task',key:'active-task',label:'Aktywne zadanie',type:'panel'},
    {selector:'#playerProgress',key:'player-progress',label:'Postęp gracza',type:'inline'},
    {selector:'.learning-v0712',key:'learning-progress',label:'Nauka — postęp',type:'inline'},
    {selector:'.rightbar .cable-panel',key:'cables',label:'Przewody i kable',type:'panel'},
    {selector:'.rightbar .catalog-panel',key:'catalog',label:'Aparatura PRO DIN',type:'panel'},
    {selector:'.rightbar .details-panel',key:'details',label:'Szczegóły elementu',type:'panel'}
  ];
  const savedKey='rozdzielnicapro.fold.v07173';
  let saved={};
  try{
    const v=JSON.parse(localStorage.getItem(savedKey)||'{}');
    if(v&&typeof v==='object'&&!Array.isArray(v))saved=v;
  }catch{}
  const registered=new Map();
  function apply(el,button,key,label,expanded){
    el.classList.toggle('pro-folded',!expanded);
    button.textContent=expanded?'−':'+';
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',(expanded?'Zwiń: ':'Rozwiń: ')+label);
    button.title=(expanded?'Zwiń sekcję ':'Rozwiń sekcję ')+label;
    saved[key]=expanded;
  }
  function setup(def){
    const el=document.querySelector(def.selector);
    if(!el||registered.get(def.key)===el)return;
    const header=def.type==='panel'?el.querySelector(':scope > .panel-title'):
       def.key==='player-progress'?el.querySelector(':scope > .player-progress-head'):el.firstElementChild;
    if(!header)return;
    const button=document.createElement('button');
    button.type='button';
    button.className='pro-fold-toggle '+(def.type==='panel'?'pro-fold-toggle-panel':'pro-fold-toggle-inline');
    button.dataset.fold=def.key;
    if(def.type==='panel')header.insertAdjacentElement('afterend',button);
    else header.appendChild(button);
    const initial=typeof saved[def.key]==='boolean'?saved[def.key]:true;
    apply(el,button,def.key,def.label,initial);
    button.addEventListener('click',()=>{
      const expanded=el.classList.contains('pro-folded');
      apply(el,button,def.key,def.label,expanded);
      try{localStorage.setItem(savedKey,JSON.stringify(saved))}catch{}
    });
    el.classList.add('pro-fold-section');
    registered.set(def.key,el);
  }
  function scan(){defs.forEach(setup)}
  scan();
  // Progress i przewodnik są tworzone dopiero po załadowaniu silnika gry.
  const active=document.querySelector('.leftbar .active-task');
  if(active){
    const observer=new MutationObserver(scan);
    observer.observe(active,{childList:true});
  }
  document.addEventListener('elektryk:mode-selected',scan);
  document.addEventListener('elektryk:task-started',scan);
  window.ElektrykFolding={
    version:'0.7.17.3',
    refresh:scan,
    getExpanded:key=>registered.get(key)?!registered.get(key).classList.contains('pro-folded'):null
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();