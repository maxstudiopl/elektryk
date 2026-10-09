/* ELEKTRYK SIMULATOR • Assembly PRO v0.7.12.9
   Elementy montażowe i animacja zatrzaskiwania DIN są WYŁĄCZNIE wizualne.
   Nie przesuwamy .mounted-device, .device ani zacisków .wire-terminal. */
(()=>{
'use strict';
const host=document.querySelector('.din-rows-host');
if(!host)return;
function make(tag,cls,parent,label){
  const el=document.createElement(tag);
  el.className=cls;
  el.setAttribute('aria-hidden','true');
  if(label)el.textContent=label;
  parent.appendChild(el);
  return el;
}
function decorate(wrap){
  if(!wrap?.classList?.contains('mounted-device'))return false;
  if(wrap.dataset.assemblyPro==='1')return false;
  const face=wrap.querySelector(':scope > .device');
  if(!face)return false;
  make('span','assembly-hook assembly-hook-left',face);
  make('span','assembly-hook assembly-hook-right',face);
  make('span','assembly-rear-rail',face);
  make('span','assembly-lock-plate',face);
  make('span','assembly-snap-ghost',wrap);
  make('span','assembly-snap-indicator',wrap,'✓ ZATRZAŚNIĘTO DIN');
  wrap.dataset.assemblyPro='1';
  return true;
}
function scan(node){
  if(!node||node.nodeType!==1)return;
  if(node.matches?.('.mounted-device'))decorate(node);
  node.querySelectorAll?.('.mounted-device').forEach(decorate);
}
function motionDisabled(){
  if(document.body?.classList.contains('no-ui-animations'))return true;
  return !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
function snap(wrap){
  if(!wrap?.isConnected)return false;
  decorate(wrap);
  if(motionDisabled())return false;
  // Realny aparat nie jest transformowany: końcówki przewodów pozostają w miejscu.
  const ghost=wrap.querySelector(':scope > .assembly-snap-ghost');
  if(!ghost)return false;
  wrap.classList.remove('assembly-pro-snapping');
  // Restart animacji tylko dla właśnie wpiętego aparatu.
  void ghost.offsetWidth;
  wrap.classList.add('assembly-pro-snapping');
  const finish=()=>wrap.classList.remove('assembly-pro-snapping');
  ghost.addEventListener('animationend',finish,{once:true});
  window.setTimeout(finish,850);
  return true;
}
document.addEventListener('elektryk:apparatus-mounted',e=>snap(e.detail?.element));
const observer=new MutationObserver(records=>{
  for(const record of records){
    for(const node of record.addedNodes)scan(node);
  }
});
observer.observe(host,{childList:true,subtree:true});
scan(host);
window.ElektrykAssemblyPro={decorate,refresh:()=>scan(host),snap};
})();