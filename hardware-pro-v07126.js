/* Elektryk Simulator • Hardware PRO v0.7.16
 * Detale modelu: warstwa wyłącznie dekoracyjna.
 * Nie modyfikujemy zacisków, współrzędnych, połączeń ani atrybutów elektrycznych.
 */
(()=>{
'use strict';
const host=document.querySelector('.din-rows-host');
if(!host)return;
const nodes=[
  ['span','pro-face-mold'],
  ['span','pro-rivet top-left'],
  ['span','pro-rivet top-right'],
  ['span','pro-rivet bottom-left'],
  ['span','pro-rivet bottom-right'],
  ['span','pro-din-latch']
];
function decorate(wrap){
  if(!(wrap instanceof HTMLElement)||!wrap.classList.contains('mounted-device'))return false;
  const face=wrap.querySelector(':scope > .device');
  if(!face||face.querySelector('.pro-din-latch'))return false;
  for(const [tag,classes] of nodes){
    const el=document.createElement(tag);
    el.className=classes;
    el.setAttribute('aria-hidden','true');
    face.appendChild(el);
  }
  wrap.dataset.hardwarePro='on';
  wrap.classList.add('hardware-pro-new');
  return true;
}
function scan(root){
  if(!root||root.nodeType!==1)return;
  if(root.matches?.('.mounted-device'))decorate(root);
  root.querySelectorAll?.('.mounted-device').forEach(decorate);
}
function refresh(){scan(host)}
// Subtree tylko dlatego, że aparaty są dynamicznie dodawane do .mount-grid.
// Zmiany w dziecięcych dekoracjach są ignorowane, więc obserwator się nie zapętla.
const observer=new MutationObserver(records=>{
  for(const record of records){
    for(const node of record.addedNodes){
      if(node.nodeType!==1)continue;
      if(node.matches?.('.mounted-device')||node.querySelector?.('.mounted-device')){
        scan(node);
      }
    }
  }
});
observer.observe(host,{subtree:true,childList:true});
document.addEventListener('elektryk:rails-changed',()=>requestAnimationFrame(refresh));
refresh();
window.ElektrykHardwarePro={decorate,refresh};
})();