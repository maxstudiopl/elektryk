/* RozdzielnicaPRO.pl v0.7.15 — learning assembly controls for 300 scenarios.
   Two options: assemble instantly or replay each mount/wire/bridge with explanation. */
(()=>{
'use strict';
const stage=window.ElektrykStage2,learning=window.ElektrykLearningBoard,help=window.ElektrykHelp,core=window.ElektrykAutoBoard;
const host=document.querySelector('.workspace'),header=host?.querySelector('.cabinet-head');
if(!stage||!learning||!help?.getReferencePlan||!core||!host||!header)return;
const panel=document.createElement('section');
panel.className='learning-assembly-v0715';
panel.id='learningAssembly';
panel.innerHTML=
 '<div class="la-heading"><div><span class="la-eyebrow">NAUKA • UZBRAJANIE ROZDZIELNICY</span><h2>DWA SPOSOBY POZNANIA MONTAŻU</h2><p>Automatycznie zobacz gotowy układ lub przejdź przez każdy aparat i przewód krok po kroku.</p></div><span class="la-mode" id="laMode">GOTOWY DO NAUKI</span></div>'+
 '<div class="la-toolbar">'+
 '<button type="button" class="la-auto" id="laAuto">⚡ UZBRÓJ AUTOMATYCZNIE</button>'+
 '<button type="button" class="la-guided" id="laGuided">▤ KROK PO KROKU</button>'+
 '<button type="button" class="la-reset" id="laReset">↺ WYCZYŚĆ / OD NOWA</button>'+
 '</div>'+
 '<div class="la-status" id="laStatus" role="status" aria-live="polite">Wybierz metodę nauki dla obecnego scenariusza. Uzbrojenie automatyczne oraz pokaz krokowy nie dają XP.</div>'+
 '<div class="la-stepper" id="laStepper" hidden>'+
 '<div class="la-step-head"><b id="laStepCount">KROK 0/0</b><span id="laStepType">MONTAŻ</span></div>'+
 '<div class="la-step-track" aria-hidden="true"><span id="laProgress"></span></div>'+
 '<p id="laInstruction">Kliknij DALEJ, aby rozpocząć.</p>'+
 '<div class="la-nav"><button type="button" id="laPrev">← POPRZEDNI</button><button type="button" id="laNext">WYKONAJ NASTĘPNY KROK →</button></div>'+
 '</div>'+
 '<small class="la-disclaimer">Demonstracja edukacyjna oparta na modelu gry: cztery podstawowe odbiorniki oraz dodatkowe wyjścia L/N/PE dla każdego MCB i RCBO. Nie jest to rzeczywisty projekt wykonawczy.</small>';
const learningBoard=document.querySelector('.learning-board-v0712');
if(learningBoard)learningBoard.insertAdjacentElement('afterend',panel);
else header.insertAdjacentElement('afterend',panel);
const $=id=>panel.querySelector('#'+id);
const auto=$('laAuto'),guided=$('laGuided'),reset=$('laReset'),previous=$('laPrev'),next=$('laNext');
let current=null,index=0,mode='idle',activeTaskId=null,generation=0;
const blocked=()=>window.ElektrykAuth?.isDemo?.()||document.body.dataset.gameMode!=='learn'||document.body.classList.contains('exam-active');
const currentTask=()=>window.ElektrykTasks?.current?.()||stage.getTask?.();
function clearTarget(){document.querySelectorAll('.la-target').forEach(el=>el.classList.remove('la-target'))}
function markTarget(step){
 clearTarget();if(!step)return;
 let query='';
 if(step.kind==='mount')query='.mounted-device[data-mount-id="'+step.item.id+'"]';
 if(step.kind==='wire')query='.wire-layer [data-connection-id="'+step.item.id+'"]';
 if(step.kind==='bridge')query='.bridge-layer [data-bridge-id="'+step.item.id+'"]';
 if(!query)return;
 const nodes=document.querySelectorAll(query);
 nodes.forEach(x=>x.classList.add('la-target'));
 if(step.kind==='mount')nodes[0]?.scrollIntoView?.({behavior:'smooth',block:'nearest',inline:'nearest'});
}
function status(str){$('laStatus').textContent=str}
function stateLabel(str){$('laMode').textContent=str}
function updatePreview(){
 if(!current)return;
 $('laStepper').hidden=mode!=='guided';
 $('laStepCount').textContent='KROK '+index+' / '+current.steps.length;
 const step=current.steps[index-1];
 $('laStepType').textContent=step?step.kind==='mount'?'APARAT DIN':step.kind==='bridge'?'MOSTEK':'PRZEWÓD':'PRZYGOTOWANIE';
 $('laProgress').style.width=(index/current.steps.length*100)+'%';
 $('laInstruction').textContent=step?.why||(index===0?'Rozpoczniemy od pierwszego aparatu. Każde kliknięcie wykona jeden etap i wyjaśni jego cel.':'');
 if(index===current.steps.length)$('laInstruction').textContent='✓ Wszystkie kroki zakończone. '+current.unwiredNote;
 previous.disabled=index===0;next.disabled=index===current.steps.length;
 next.textContent=index===current.steps.length?'POKAZ ZAKOŃCZONY':'WYKONAJ NASTĘPNY KROK →';
}
function apply(prefix,serial){
 const devs=[],wires=[],bridges=[];
 for(const step of current.steps.slice(0,prefix)){
   if(step.kind==='mount')devs.push(step.item);
   if(step.kind==='wire')wires.push(step.item);
   if(step.kind==='bridge')bridges.push(step.item);
 }
 stage.restoreMounted?.(devs);
 window.ElektrykStage3?.refreshMounted?.();
 window.ElektrykStage3?.setConnections?.(wires);
 window.ElektrykBridges?.setBridges?.(bridges);
 const target=current.steps[prefix-1];
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(serial!==generation)return;
   window.ElektrykStage3?.redraw?.();window.ElektrykBridges?.redraw?.();
   markTarget(target);
   if(prefix===current.steps.length)window.ElektrykPower?.refresh?.();
 }));
}
function blueprint(){
 const t=currentTask();
 if(!t||t.id==='FREE'||blocked())return null;
 const plan=help.getReferencePlan(t);
 const board=core.diagram(t,plan);
 if(!board)return null;
 const verdict=core.validate(board);
 if(!verdict.ok)throw new Error('Wzorzec uzbrojenia: '+verdict.reason);
 activeTaskId=t.id;
 return board;
}
function setAssisted(kind){document.body.dataset.learningAssist=kind}
function doAuto(){
 if(blocked())return false;
 try{
   current=blueprint();if(!current)return false;
   generation++;mode='auto';setAssisted('auto');
   stage.reset?.();
   window.ElektrykLargeBoard?.prepare?.(current);
   apply(current.steps.length,generation);
   $('laStepper').hidden=true;
   stateLabel('UZBROJONO AUTOMATYCZNIE');
   status('Zamontowano '+current.devices.length+' aparatów, wykonano '+current.wires.length+' przewodów i '+current.bridges.length+' mostków. Obwody L/N/PE: '+current.connectedLoads+'. '+current.unwiredNote+' Bez XP.');
   clearTarget();return true;
 }catch(e){console.error('AUTO BOARD',e);status('Nie udało się uzbroić rozdzielnicy: '+e.message);return false}
}
function doGuided(){
 if(blocked())return false;
 try{
   current=blueprint();if(!current)return false;
   generation++;mode='guided';index=0;setAssisted('guided');
   stage.reset?.();
   window.ElektrykLargeBoard?.prepare?.(current);
   stateLabel('POKAZ KROK PO KROKU');status('Pokaz zawiera '+current.devices.length+' montowań, '+current.wires.length+' przewodów i '+current.bridges.length+' mostków. Przechodź przez etapy przyciskiem DALEJ. Bez XP.');
   updatePreview();clearTarget();return true;
 }catch(e){console.error('GUIDED BOARD',e);status('Nie udało się rozpocząć nauki krokowej: '+e.message);return false}
}
function move(diff){
 if(blocked()||mode!=='guided'||!current)return false;
 const nextIndex=Math.max(0,Math.min(current.steps.length,index+diff));
 if(nextIndex===index)return false;index=nextIndex;generation++;
 apply(index,generation);updatePreview();return true;
}
function doReset(){
 if(blocked())return false;
 generation++;stage.reset?.();window.ElektrykLargeBoard?.clear?.();clearTarget();
 current=null;mode='idle';index=0;
 stateLabel('GOTOWY DO NAUKI');
 status('Rozdzielnica wyczyszczona. Możesz samodzielnie montować aparaty lub wybrać jeden z dwóch pokazów. Po użyciu pomocy XP w tym zadaniu pozostaje wyłączone.');
 $('laStepper').hidden=true;return true;
}
function newTask(){
 generation++;window.ElektrykLargeBoard?.clear?.();current=null;index=0;mode='idle';activeTaskId=null;
 delete document.body.dataset.learningAssist;clearTarget();
 $('laStepper').hidden=true;stateLabel('GOTOWY DO NAUKI');
 status('Scenariusz '+(currentTask()?.id||'')+' — wybierz automatyczne uzbrojenie, pokaz krokowy albo montuj samodzielnie.');
}
function visible(){panel.hidden=blocked()||!document.body.classList.contains('auth-ready')}
auto.addEventListener('click',doAuto);guided.addEventListener('click',doGuided);
reset.addEventListener('click',doReset);previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
document.addEventListener('elektryk:task-started',()=>{newTask();visible()});
document.addEventListener('elektryk:mode-selected',()=>{if(blocked())delete document.body.dataset.learningAssist;visible()});
visible();
window.ElektrykAssemblyLearning={auto:doAuto,guide:doGuided,next:()=>move(1),previous:()=>move(-1),reset:doReset,
 get:()=>({mode,index,total:current?.steps.length||0,mounted:current?.devices.length||0,wires:current?.wires.length||0,bridges:current?.bridges.length||0,loads:current?.connectedLoads||0,taskId:activeTaskId})};
})();