/* RozdzielnicaPRO.pl v0.7.19 — szybka nawigacja responsywna.
 * Wyłącznie skok do istniejącego DOM; nie klonuje, nie przebudowuje
 * aparatów, nie zmienia kabli ani stanu elektrycznego. */
(()=>{
'use strict';
function init(){
  const toolbar=document.getElementById('proWorkspaceToolbar');
  const left=document.getElementById('proTaskSidebar');
  const right=document.getElementById('proToolSidebar');
  const dock=document.getElementById('proFocusDock');
  if(!toolbar||!left||!right||toolbar.querySelector('.pro-responsive-shortcuts'))return;

  const nav=document.createElement('div');
  nav.className='pro-responsive-shortcuts';
  nav.setAttribute('role','group');
  nav.setAttribute('aria-label','Szybka nawigacja po stanowisku');

  function make(label,controls,handler){
    const button=document.createElement('button');
    button.type='button';
    button.className='pro-mobile-jump';
    button.textContent=label;
    button.setAttribute('aria-controls',controls);
    button.addEventListener('click',handler);
    return button;
  }
  function jump(section){
    const isRight=section==='right';
    const collapsed='pro-'+(isRight?'right':'left')+'-collapsed';
    const docked=isRight&&document.body.classList.contains('pro-tools-docked')&&!dock?.hidden;
    if(!docked&&document.body.classList.contains(collapsed)){
      const toggle=document.getElementById(isRight?'proToggleTools':'proToggleTasks');
      toggle?.click(); // existing control keeps aria state and dock synchronized
    }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const target=isRight&&document.body.classList.contains('pro-tools-docked')&&!dock?.hidden
        ?dock:(isRight?right:left);
      if(!target||target.getClientRects().length===0)return;
      target.scrollIntoView({block:'start',behavior:'auto'});
    }));
  }

  nav.append(
    make('↓ PRZEWODY I APARATURA','proToolSidebar',()=>jump('right')),
    make('↓ ZADANIA I POSTĘP','proTaskSidebar',()=>jump('left'))
  );
  toolbar.appendChild(nav);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();