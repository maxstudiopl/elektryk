/* RozdzielnicaPRO.pl — rebranding 1.0; UI only, no game state mutation. */
(()=>{
'use strict';
function init(){
  const glyph=document.querySelector('.pro-workspace-logo');
  if(glyph&&!glyph.querySelector('.brand-icon')){
    glyph.replaceChildren();
    const logo=document.createElement('img');
    logo.className='brand-icon';logo.src='brand-icon.svg?v=07132';
    logo.alt='';logo.setAttribute('aria-hidden','true');
    glyph.appendChild(logo);
  }
  const splash=document.getElementById('brandSplash');
  if(!splash)return;
  let finished=false;
  function done(){
    if(finished)return;finished=true;
    splash.classList.add('is-hidden');
    window.setTimeout(()=>{splash.hidden=true},400);
  }
  const ready=()=>window.setTimeout(done,450);
  if(document.readyState==='complete')ready();
  else window.addEventListener('load',ready,{once:true});
  // If a remote resource fails to load, never block the login screen indefinitely.
  window.setTimeout(done,2400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();