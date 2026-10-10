/* RozdzielnicaPRO.pl v0.7.17.1 — czytelne panele nauki.
 * Wyłącznie prezentacja istniejących bloków (wzorzec, instrukcje, przewijanie).
 * Brak zmian w rozdzielnicy, obwodach, aparatach i stanie oceniania. */
(()=>{
'use strict';
const board=document.querySelector('.learning-board-v0712');
const assembly=document.querySelector('.learning-assembly-v0715');
const workspace=document.querySelector('.workspace');
const actions=board?.querySelector('.learning-board-actions');
if(!board||!assembly||!workspace||!actions)return;

const legend=board.querySelector('.learning-board-legend');
const rail=board.querySelector('.learning-board-scroll');
const disclaimer=board.querySelector('.learning-board-disclaimer');
const result=board.querySelector('.learning-board-result');
if(!legend||!rail||!disclaimer||!result)return;

const region=document.createElement('div');
region.id='learningReferenceDetails';
region.className='ll-reference-details';
region.setAttribute('aria-label','Wzorcowe rozmieszczenie aparatów DIN');
board.insertBefore(region,result);
region.append(legend,rail,disclaimer);

const toggle=document.createElement('button');
toggle.type='button';
toggle.id='learningReferenceToggle';
toggle.className='ll-reference-toggle';
toggle.setAttribute('aria-controls',region.id);
toggle.setAttribute('aria-expanded','true');
actions.appendChild(toggle);

const go=document.createElement('button');
go.type='button';
go.id='learningJumpBoard';
go.className='ll-jump-board';
go.textContent='↓ PRZEJDŹ DO ROZDZIELNICY';
go.setAttribute('aria-label','Przewiń do właściwej rozdzielnicy');
const toolbar=assembly.querySelector('.la-toolbar');
toolbar?.appendChild(go);

let expanded=true;
function setExpanded(value){
  expanded=!!value;
  region.hidden=!expanded;
  board.classList.toggle('ll-reference-condensed',!expanded);
  toggle.textContent=expanded?'▴ ZWIŃ WZORZEC':'▾ POKAŻ WZORZEC';
  toggle.setAttribute('aria-expanded',String(expanded));
}
function jumpToCabinet(){
  const cabinet=workspace.querySelector(':scope > .cabinet');
  if(!cabinet)return;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  cabinet.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start',inline:'nearest'});
}
toggle.addEventListener('click',()=>setExpanded(!expanded));
go.addEventListener('click',jumpToCabinet);

// Po automatycznym uzbrojeniu lub rozpoczęciu pokazu główną treścią
// stanowiska jest model rozdzielnicy, nie już odtworzony wzorzec.
function assistStarted(expectedMode){
  if(window.ElektrykAssemblyLearning?.get?.()?.mode!==expectedMode)return;
  setExpanded(false);
  requestAnimationFrame(()=>requestAnimationFrame(jumpToCabinet));
}
assembly.querySelector('#laAuto')?.addEventListener('click',()=>assistStarted('auto'));
assembly.querySelector('#laGuided')?.addEventListener('click',()=>assistStarted('guided'));
assembly.querySelector('#laReset')?.addEventListener('click',()=>setExpanded(true));
document.addEventListener('elektryk:task-started',()=>setExpanded(true));
document.addEventListener('elektryk:mode-selected',e=>{
  if(e.detail?.mode==='learn')setExpanded(true);
});
setExpanded(true);
window.ElektrykLearningLayout={
  version:'0.7.17.1',
  expand:()=>setExpanded(true),
  collapse:()=>setExpanded(false),
  isExpanded:()=>expanded,
  jumpToCabinet
};
})();