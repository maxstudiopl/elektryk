/* RozdzielnicaPRO.pl • v0.7.22 — edukacyjne, dwuportowe zaciski X1/ZUG.
 * Stan slotów pozostaje zgodny ze starym schematem zapisu v1. */
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
 '<p>Wybierz typ zacisku i kliknij numer pola X1, aby go wstawić. Punkty T / B służą do podłączania przewodów; każdy przyjmuje jedną żyłę.</p>'+
 '<div class="iz-choices" id="izChoices"></div>'+
 '<div class="iz-actions"><button type="button" id="izUndo">↶ COFNIJ OSTATNI</button><button type="button" id="izClear">WYCZYŚĆ X1</button></div>'+
 '<div class="iz-count" id="izCount" role="status" aria-live="polite">ZUG X1 • 0/0 pozycji</div>'+
 '<small>X1: górny i dolny port stanowią jeden tor elektryczny w modelu edukacyjnym. Separator nie prowadzi prądu. Analiza nie zastępuje pomiarów.</small>'+
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
 '<div class="iz-rail-head"><strong>PRO • X1 / ZUG</strong><span id="izRailMeta">SZYNA TH35 • 2 PORTY / ZACISK</span></div>'+
 '<div class="iz-rail-track" id="izRailTrack"></div>'+
 '<div class="iz-rail-foot">X1 • ZACISK: T (GÓRA) / B (DÓŁ) • KLIKNIJ PORT, ABY PODŁĄCZYĆ PRZEWÓD</div>';
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
function terminalId(i,code,side){return 'X1:'+number(i)+':'+code+':'+side}
function port(label,code,id,side){
 const make=window.ElektrykStage3?.createTerminal;
 if(!make)return null;
 const el=make(label,code,id,side==='TOP'?'zug-top':'zug-bottom');
 el.classList.add('iz-wire-port','iz-wire-port-'+side.toLowerCase());
 el.setAttribute('aria-label','Listwa X1, zacisk '+id.split(':')[1]+', tor '+code+', '+(side==='TOP'?'górny':'dolny')+' port');
 return el;
}
function render(){
 if(!active)return;
 track.replaceChildren();
 track.style.setProperty('--iz-slots',String(capacity));
 let used=0;
 slots.forEach((code,i)=>{
   const wrapper=document.createElement('div');
   wrapper.className='iz-slot '+(code?'is-filled iz-'+TYPES[code].kind:'is-empty');
   wrapper.dataset.index=String(i);
   const b=document.createElement('button');b.type='button';
   b.className='iz-slot-select';
   b.setAttribute('aria-label','Zmień X1:'+number(i)+' • '+(code?TYPES[code].name:'puste miejsce'));
   b.title=b.getAttribute('aria-label');
   b.disabled=!isEditable();
   const mark=document.createElement('strong');mark.textContent=code?TYPES[code].label:'＋';
   const label=document.createElement('small');label.textContent=number(i);
   b.append(mark,label);
   b.addEventListener('click',()=>setSlot(i,selected));
   wrapper.appendChild(b);
   if(code&&code!=='SEP'){
     used++;
     for(const side of ['TOP','BOTTOM']){
       const wirePort=port(side==='TOP'?'T':'B',code,terminalId(i,code,side),side);
       if(wirePort){wirePort.disabled=!isEditable();wrapper.appendChild(wirePort)}
     }
   }else{
     const screwTop=document.createElement('span');screwTop.className='iz-screw iz-screw-top';
     const screwBottom=document.createElement('span');screwBottom.className='iz-screw iz-screw-bottom';
     wrapper.append(screwTop,screwBottom);
   }
   track.appendChild(wrapper);
 });
 count.textContent='X1 • '+used+' zacisków / '+capacity+' miejsc'+(isEditable()?' • wybrano '+(selected==='REMOVE'?'USUŃ':selected):' • PODGLĄD');
 rail.querySelector('#izRailMeta').textContent='TH35 • '+capacity+' POZYCJI • KABLE NA PORTACH T / B';
 tools.querySelectorAll('.iz-type,#izUndo,#izClear').forEach(b=>b.disabled=!isEditable());
}
function changed(){
 window.ElektrykStage3?.refreshMounted?.();
 window.ElektrykBridges?.redraw?.();
 window.ElektrykPower?.refresh?.();
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
 if(active){select('L1');render();}else track.replaceChildren();
 window.ElektrykStage3?.refreshMounted?.();
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
 version:'0.7.22',types:Object.keys(TYPES),
 getState:exportState,restore,reset,isActive:()=>active,terminalId,
 setSlot
};
})();