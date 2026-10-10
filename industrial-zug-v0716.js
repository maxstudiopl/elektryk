/* RozdzielnicaPRO.pl • v0.7.16 — przemysłowa listwa X1 (ZUG)
 * Etap montażowy: zaciski są modelami edukacyjnymi, nie są zaciskami
 * silnika elektrycznego. Nie deklarujemy ich połączenia ani walidacji. */
(()=>{
'use strict';
const cabinet=document.querySelector('.cabinet-inner');
const sidebar=document.querySelector('.leftbar');
if(!cabinet||!sidebar)return;
const TYPES={
  L1:{label:'L1',name:'zacisk fazowy L1',kind:'phase-l1'},
  L2:{label:'L2',name:'zacisk fazowy L2',kind:'phase-l2'},
  L3:{label:'L3',name:'zacisk fazowy L3',kind:'phase-l3'},
  N:{label:'N',name:'zacisk neutralny N',kind:'neutral'},
  PE:{label:'PE',name:'zacisk ochronny PE',kind:'protective'},
  SEP:{label:'│',name:'separator sekcji',kind:'separator'}
};
const MAX_SLOTS=30;
let active=false,selected='L1',slots=[],capacity=0;
const tools=document.createElement('section');
tools.className='panel industrial-zug-tools mode-hidden';
tools.id='industrialZugTools';
tools.setAttribute('aria-label','Montaż listwy zaciskowej ZUG');
tools.innerHTML=
 '<div class="panel-title">PRZEMYSŁ • LISTWA ZUG X1</div>'+
 '<div class="iz-tools-inner">'+
 '<p>Wybierz rodzaj zacisku, a potem kliknij wolną pozycję na górnej szynie X1.</p>'+
 '<div class="iz-choices" id="izChoices"></div>'+
 '<div class="iz-actions"><button type="button" id="izUndo">↶ COFNIJ OSTATNI</button><button type="button" id="izClear">WYCZYŚĆ X1</button></div>'+
 '<div class="iz-count" id="izCount" role="status" aria-live="polite">ZUG X1 • 0/0 pozycji</div>'+
 '<small>Zaciski X1 są na tym etapie wyłącznie montażowe. Nie łączą jeszcze przewodów silnika symulacji.</small>'+
 '</div>';
sidebar.insertBefore(tools,document.getElementById('freeSavePanel')||sidebar.querySelector('.active-task')||null);
const buttons=tools.querySelector('#izChoices');
Object.keys(TYPES).forEach(code=>{
 const b=document.createElement('button');
 b.type='button';b.dataset.zugTool=code;
 b.className='iz-type iz-'+TYPES[code].kind;
 b.textContent=code==='SEP'?'SEPARATOR':code;
 b.setAttribute('aria-label',TYPES[code].name);
 b.addEventListener('click',()=>select(code));
 buttons.appendChild(b);
});
const removeBtn=document.createElement('button');
removeBtn.type='button';removeBtn.dataset.zugTool='REMOVE';
removeBtn.className='iz-type iz-remove';removeBtn.textContent='USUŃ';
removeBtn.addEventListener('click',()=>select('REMOVE'));
buttons.appendChild(removeBtn);
const rail=document.createElement('section');
rail.className='industrial-zug-rail';
rail.id='industrialZugRail';
rail.hidden=true;
rail.setAttribute('aria-label','Górna szyna zaciskowa X1');
rail.innerHTML=
 '<div class="iz-rail-head"><strong>PRO • X1 / ZUG</strong><span id="izRailMeta">SZYNA TH35 • ZACISKI MONTAŻOWE</span></div>'+
 '<div class="iz-rail-track" id="izRailTrack"></div>'+
 '<div class="iz-rail-foot">X1 • GÓRNA LISTWA ZACISKOWA • PRZEWODY ZEWNĘTRZNE W KOLEJNYM ETAPIE</div>';
cabinet.appendChild(rail);
const track=rail.querySelector('#izRailTrack');
const count=tools.querySelector('#izCount');
const history=[];
function select(code){
 if(code!=='REMOVE'&&!TYPES[code])return;
 selected=code;
 buttons.querySelectorAll('button').forEach(b=>{
   const isSelected=b.dataset.zugTool===code;
   b.classList.toggle('is-selected',isSelected);
   b.setAttribute('aria-pressed',String(isSelected));
 });
}
function isEditable(){
 return active&&window.ElektrykAuth?.isAuthenticated?.()&&!window.ElektrykAuth?.isDemo?.();
}
function number(i){return String(i+1).padStart(2,'0')}
function render(){
 if(!active)return;
 track.replaceChildren();
 track.style.setProperty('--iz-slots',String(capacity));
 let used=0;
 slots.forEach((code,i)=>{
   const b=document.createElement('button');b.type='button';
   b.className='iz-slot '+(code?'is-filled iz-'+TYPES[code].kind:'is-empty');
   b.dataset.index=String(i);
   b.setAttribute('aria-label','X1:'+number(i)+' • '+(code?TYPES[code].name:'puste miejsce'));
   b.title=b.getAttribute('aria-label');
   b.disabled=!isEditable();
   const screwTop=document.createElement('span');screwTop.className='iz-screw';
   const mark=document.createElement('strong');mark.textContent=code?TYPES[code].label:'＋';
   const screwBottom=document.createElement('span');screwBottom.className='iz-screw';
   const label=document.createElement('small');label.textContent=number(i);
   b.append(screwTop,mark,screwBottom,label);
   b.addEventListener('click',()=>setSlot(i,selected));
   track.appendChild(b);
   if(code&&code!=='SEP')used++;
 });
 count.textContent='X1 • '+used+' zacisków / '+capacity+' miejsc'+(isEditable()?' • wybrano '+(selected==='REMOVE'?'USUŃ':selected):' • PODGLĄD');
 rail.querySelector('#izRailMeta').textContent='TH35 • '+capacity+' POZYCJI • ZASILANIE WLZ PO LEWEJ';
 tools.querySelectorAll('.iz-type,#izUndo,#izClear').forEach(b=>b.disabled=!isEditable());
}
function changed(){
 document.dispatchEvent(new CustomEvent('elektryk:industrial-zug-changed',{detail:{state:exportState()}}));
}
function setSlot(i,code){
 if(!isEditable()||!Number.isInteger(i)||i<0||i>=capacity)return;
 const next=code==='REMOVE'?null:code;
 if(next!==null&&!TYPES[next])return;
 if(slots[i]===next)return;
 history.push({i,previous:slots[i]});
 slots[i]=next;
 render();changed();
}
function undo(){
 if(!isEditable()||!history.length)return;
 const last=history.pop();
 slots[last.i]=last.previous;
 render();changed();
}
function clear(){
 if(!isEditable()||!slots.some(Boolean))return;
 if(!window.confirm('Wyczyścić całą górną listwę X1?'))return;
 slots=Array(capacity).fill(null);history.length=0;
 render();changed();
}
function exportState(){
 return active?{schema:1,capacity,slots:slots.slice()}:null;
}
function restore(state){
 if(!active)return false;
 const input=state&&Array.isArray(state.slots)?state.slots:[];
 slots=Array.from({length:capacity},(_,i)=>TYPES[input[i]]?input[i]:null);
 history.length=0;
 render();changed();
 return true;
}
function reset(){
 if(!active)return;
 slots=Array(capacity).fill(null);history.length=0;render();changed();
}
function apply(template){
 const isIndustrial=template?.family==='industrial'&&String(template.id||'').startsWith('IND-PRO-');
 active=isIndustrial;
 capacity=isIndustrial?Math.min(MAX_SLOTS,Math.max(1,Number(template.zugSlots)||24)):0;
 slots=Array(capacity).fill(null);
 history.length=0;
 rail.hidden=!active;
 tools.classList.toggle('mode-hidden',!active);
 cabinet.classList.toggle('industrial-zug-active',active);
 document.body.classList.toggle('industrial-board-active',active);
 if(active){select('L1');render();}
}
tools.querySelector('#izUndo').addEventListener('click',undo);
tools.querySelector('#izClear').addEventListener('click',clear);
document.addEventListener('elektryk:board-changed',e=>apply(e.detail?.template));
document.addEventListener('elektryk:task-started',()=>apply(null));
document.addEventListener('elektryk:mode-selected',e=>{
 if(e.detail?.mode!=='free')apply(null);
 else if(active)render();
});
select('L1');
window.ElektrykIndustrialZug={
 version:'0.7.16',types:Object.keys(TYPES),
 getState:exportState,restore,reset,isActive:()=>active,
 setSlot
};
})();