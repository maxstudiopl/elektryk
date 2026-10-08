(()=>{
'use strict';
const stage=window.ElektrykStage2;
const help=window.ElektrykHelp;
const tasks=window.ElektrykTasks;
const workspace=document.querySelector('.workspace');
const head=workspace?.querySelector('.cabinet-head');
const rowsHost=document.querySelector('.din-rows-host');
if(!stage||!help?.getReferencePlan||!tasks||!head||!rowsHost)return;

const board=document.createElement('section');
board.className='learning-board-v0712';
board.setAttribute('aria-label','Zadanie odwzorowania rozdzielnicy');
board.innerHTML=
  '<div class="learning-board-top">'+
    '<div><span class="learning-board-eyebrow">NAUKA 2.0 • ZADANIE MONTAŻOWE</span>'+
    '<h2>UZUPEŁNIJ ROZDZIELNICĘ WEDŁUG SCHEMATU</h2>'+
    '<p>Odtwórz pokazane poniżej aparaty na tych samych listwach i modułach DIN. Potem wykonaj połączenia według pełnego schematu.</p></div>'+
    '<div class="learning-board-actions"><button type="button" id="learningShowSchematic">▦ ZOBACZ SCHEMAT POŁĄCZEŃ</button><button type="button" id="learningCheckBoard">✓ SPRAWDŹ MONTAŻ</button></div>'+
  '</div>'+
  '<div class="learning-board-legend"><span><i class="lb-legend-sample"></i> Oczekiwane aparaty</span><span><i class="lb-legend-sample matched"></i> Prawidłowo zamontowany</span><span><i class="lb-legend-sample missing"></i> Brak / zły moduł</span></div>'+
  '<div class="learning-board-scroll" tabindex="0" aria-label="Przewijany wzorzec rozdzielnicy"><div id="learningReferenceRows"></div></div>'+
  '<div class="learning-board-result" id="learningBoardResult" role="status" aria-live="polite"></div>'+
  '<small class="learning-board-disclaimer">Wzorzec służy do nauki rozmieszczenia aparatów w symulatorze. Nie jest projektem wykonawczym rzeczywistej instalacji.</small>';
head.insertAdjacentElement('afterend',board);

const rows=board.querySelector('#learningReferenceRows');
const result=board.querySelector('#learningBoardResult');
let renderedTask=null;
let scheduled=false;
function key(d){return [d.row,d.start,d.code,d.modules].join(':')}
function getTask(){const t=tasks.current?.();return t&&t.id!=='FREE'?t:null}
function getPlan(){const t=getTask();return t?help.getReferencePlan(t):null}
function evaluate(){
  const plan=getPlan();
  if(!plan)return {total:0,matched:0,missing:[],extra:[],complete:false};
  const actual=stage.getMounted?.()||[];
  const actualKeys=new Map();
  actual.forEach(m=>{const k=key(m);actualKeys.set(k,(actualKeys.get(k)||0)+1)});
  const referenceKeys=new Map();
  plan.devices.forEach(d=>{const k=key(d);referenceKeys.set(k,(referenceKeys.get(k)||0)+1)});
  const missing=[],extra=[];
  plan.devices.forEach(d=>{
    const k=key(d),left=actualKeys.get(k)||0;
    if(left)actualKeys.set(k,left-1);else missing.push(d);
  });
  actual.forEach(d=>{
    const k=key(d),left=referenceKeys.get(k)||0;
    if(left)referenceKeys.set(k,left-1);else extra.push(d);
  });
  return {total:plan.devices.length,matched:plan.devices.length-missing.length,missing,extra,complete:!missing.length&&!extra.length,plan};
}
function moduleLabel(d){return 'Listwa '+(d.row+1)+', moduł '+(d.start+1)+' • '+d.code+' ('+d.modules+'M)'}
function renderReference(){
  const plan=getPlan();
  rows.replaceChildren();
  if(!plan){renderedTask=null;return}
  renderedTask=plan.task.id;
  plan.rows.forEach((row,rowIndex)=>{
    const wrap=document.createElement('div');
    wrap.className='learning-reference-row';
    const title=document.createElement('div');
    title.className='learning-reference-row-title';
    title.textContent='LISTWA DIN '+(rowIndex+1)+' • '+row.used+'/18 MODUŁÓW';
    const rail=document.createElement('div');
    rail.className='learning-reference-rail';
    rail.setAttribute('role','group');
    rail.setAttribute('aria-label','Wzorcowa listwa DIN '+(rowIndex+1));
    const occupied=Array(18).fill(false);
    row.items.forEach(d=>{
      for(let n=d.start;n<d.start+d.modules&&n<18;n++)occupied[n]=true;
      const part=document.createElement('div');
      part.className='learning-reference-device learning-ref-'+d.code.toLowerCase();
      part.style.gridColumn=(d.start+1)+' / span '+d.modules;
      part.dataset.referenceKey=key(d);
      part.title=moduleLabel(d);
      part.setAttribute('aria-label',moduleLabel(d));
      part.textContent=d.code;
      rail.appendChild(part);
    });
    occupied.forEach((isUsed,i)=>{
      if(isUsed)return;
      const empty=document.createElement('div');
      empty.className='learning-reference-empty';
      empty.style.gridColumn=String(i+1);
      empty.title='Wolny moduł '+(i+1);
      rail.appendChild(empty);
    });
    wrap.append(title,rail);rows.appendChild(wrap);
  });
  update();
}
function update(){
  const task=getTask();
  if(!task)return;
  if(renderedTask!==task.id){renderReference();return}
  const check=evaluate();
  const missingSet=new Set(check.missing.map(key));
  rows.querySelectorAll('[data-reference-key]').forEach(el=>{
    const missed=missingSet.has(el.dataset.referenceKey);
    el.classList.toggle('is-matched',!missed);
    el.classList.toggle('is-missing',missed);
  });
  if(check.complete){
    result.className='learning-board-result is-complete';
    result.textContent='✓ Rozdzielnica jest uzupełniona zgodnie ze wzorcem montażowym. Teraz wykonaj i sprawdź połączenia L, N oraz PE.';
  }else{
    const first=check.missing[0];
    const instruction=first?'Następny aparat: '+moduleLabel(first)+'.':'Wszystkie aparaty ze wzorca są na miejscu.';
    const incorrect=check.extra.length?' Usuń lub przestaw aparaty poza wzorcem: '+check.extra.length+'.':'';
    result.className='learning-board-result';
    result.textContent='Poprawnie rozmieszczone: '+check.matched+'/'+check.total+'. '+instruction+incorrect;
  }
  help.refreshLearning?.();
}
function scheduleUpdate(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;update()});
}
const observeMounts=new MutationObserver(records=>{
  const changed=records.some(r=>[...r.addedNodes,...r.removedNodes].some(node=>
    node.nodeType===1&&(node.matches?.('.mounted-device,.din-row,.mount-grid')||node.querySelector?.('.mounted-device,.din-row,.mount-grid'))
  ));
  if(changed)scheduleUpdate();
});
observeMounts.observe(rowsHost,{childList:true,subtree:true});
document.addEventListener('elektryk:task-started',()=>renderReference());
document.addEventListener('elektryk:rails-changed',()=>renderReference());
board.querySelector('#learningShowSchematic').addEventListener('click',()=>help.openSolution?.());
board.querySelector('#learningCheckBoard').addEventListener('click',update);
window.ElektrykLearningBoard={evaluate,refresh:update};
renderReference();
})();