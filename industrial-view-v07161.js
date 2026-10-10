/* RozdzielnicaPRO.pl • v0.7.16.1
 * Warstwa wizualna tylko dla rozdzielnic przemysłowych PRO.
 * Nie przesuwa zacisków, aparatów, kabli ani grafu elektrycznego. */
(()=>{
'use strict';
const inner=document.querySelector('.cabinet-inner');
const cabinetHead=document.querySelector('.cabinet-head');
if(!inner||!cabinetHead)return;

const decorative=document.createElement('div');
decorative.className='industrial-duct-overlay';
decorative.setAttribute('aria-hidden','true');
decorative.innerHTML='<span class="iduct iduct-left"></span><span class="iduct iduct-right"></span>';
decorative.hidden=true;
inner.prepend(decorative);

const info=document.createElement('section');
info.className='industrial-board-info';
info.id='industrialBoardInfo';
info.hidden=true;
info.setAttribute('aria-label','Informacje o rozdzielnicy przemysłowej');
info.innerHTML=
 '<div class="ibi-left"><strong id="industrialBoardType">PRO • SZAFOWA</strong><span id="industrialBoardDimension"></span></div>'+
 '<div class="ibi-right"><b id="industrialBoardTerminalCount">X1 • ZUG</b><small>MONTAŻ ZACISKÓW • OKABLOWANIE X1 W PRZYGOTOWANIU</small></div>';
// v0.7.16.2: N is located above the DIN zone (top:-42px).
// The previous position:absolute;top:170px covered that real terminal bar.
// Keep the information OUTSIDE the cabinet to preserve all N/PE click targets.
cabinetHead.insertAdjacentElement('afterend',info);

const actions=document.createElement('div');
actions.className='industrial-zug-quick-actions';
actions.hidden=true;
actions.innerHTML=
 '<button type="button" id="izNextEmpty">+ WSTAW W PIERWSZE WOLNE MIEJSCE</button>'+
 '<button type="button" id="izExample">PRZYKŁADOWY UKŁAD X1</button>'+
 '<span id="izQuickStatus" role="status" aria-live="polite"></span>';
const controlPanel=document.getElementById('industrialZugTools');
const details=controlPanel?.querySelector('.iz-tools-inner');
details?.appendChild(actions);
const hint=actions.querySelector('#izQuickStatus');
let active=false;
let board=null;
function selectFromPalette(){
 const selected=controlPanel?.querySelector('.iz-choices .is-selected');
 const code=selected?.dataset?.zugTool||'L1';
 return code==='REMOVE'?null:code;
}
function flash(message){
 if(hint)hint.textContent=message;
}
function availableAPI(){
 const zug=window.ElektrykIndustrialZug;
 if(!active||!zug?.isActive?.())return null;
 if(!window.ElektrykAuth?.isAuthenticated?.()||window.ElektrykAuth?.isDemo?.()||!window.ElektrykAuth?.licenseActive?.())return null;
 return zug;
}
function insertNext(){
 const zug=availableAPI(),code=selectFromPalette();
 if(!zug){flash('Tryb edycji niedostępny.');return}
 if(!code){flash('Wybierz rodzaj zacisku zamiast narzędzia USUŃ.');return}
 const state=zug.getState?.();
 if(!state){flash('Brak dostępnej listwy X1.');return}
 const next=state.slots.findIndex(x=>!x);
 if(next<0){flash('Wszystkie miejsca na X1 są zajęte.');return}
 zug.setSlot(next,code);
 flash('Dodano '+code+' w pozycji X1:'+String(next+1).padStart(2,'0')+'.');
}
function example(){
 const zug=availableAPI();
 if(!zug){flash('Tryb edycji niedostępny.');return}
 const state=zug.getState?.();
 if(!state)return;
 const firstSix=['L1','L2','L3','N','PE','SEP'];
 if(state.slots.some(Boolean)&&!window.confirm('Wstawić przykładowe zaciski w sześć pierwszych wolnych miejsc? Aktualne zaciski pozostaną bez zmian.'))return;
 const empty=state.slots.map((x,i)=>x?null:i).filter(x=>x!==null).slice(0,firstSix.length);
 if(!empty.length){flash('Brak wolnych miejsc na listwie X1.');return}
 empty.forEach((i,j)=>zug.setSlot(i,firstSix[j]));
 flash('Dodano przykład: L1, L2, L3, N, PE i separator. To wyłącznie rozmieszczenie, nie połączenia elektryczne.');
}
function annotateRows(){
 const industrial=inner.dataset.family==='industrial';
 inner.querySelectorAll('.din-row').forEach((row,index)=>{
   let label=row.querySelector('.industrial-row-caption');
   if(!industrial){label?.remove();return}
   if(!label){
     label=document.createElement('span');
     label.className='industrial-row-caption';
     row.appendChild(label);
   }
   label.textContent='PRO • R'+String(index+1).padStart(2,'0');
 });
}
function update(template){
 const isIndustrial=template?.family==='industrial'&&String(template.id||'').startsWith('IND-PRO-');
 active=!!isIndustrial;
 board=isIndustrial?{id:template.id,rows:Number(template.rows)||4,modules:Number(template.modulesPerRow)||24,slots:Number(template.zugSlots)||24}:null;
 inner.classList.toggle('industrial-service-view',active);
 decorative.hidden=!active;
 info.hidden=!active;
 actions.hidden=!active;
 if(!active){flash('');annotateRows();return}
 const title=info.querySelector('#industrialBoardType');
 const size=info.querySelector('#industrialBoardDimension');
 const terminal=info.querySelector('#industrialBoardTerminalCount');
 if(title)title.textContent=board.rows>=5?'PRO • SZAFA PRODUKCYJNA XL':'PRO • SZAFA PRODUKCYJNA';
 if(size)size.textContent=board.rows+' RZĘDY DIN • '+board.modules+'M / RZĄD • '+board.rows*board.modules+' MODUŁÓW';
 if(terminal)terminal.textContent='X1 • '+board.slots+' MIEJSC ZUG';
 flash('Wybierz zacisk z lewej strony lub użyj przykładowego układu X1.');
 annotateRows();
}
actions.querySelector('#izNextEmpty')?.addEventListener('click',insertNext);
actions.querySelector('#izExample')?.addEventListener('click',example);
document.addEventListener('elektryk:board-changed',e=>update(e.detail?.template));
document.addEventListener('elektryk:task-started',()=>update(null));
document.addEventListener('elektryk:rails-changed',annotateRows);
document.addEventListener('elektryk:industrial-zug-changed',()=>{
 if(active){
  const occupied=window.ElektrykIndustrialZug?.getState?.()?.slots?.filter(x=>x&&x!=='SEP').length||0;
  const count=info.querySelector('#industrialBoardTerminalCount');
  if(count&&board)count.textContent='X1 • '+occupied+' / '+board.slots+' ZACISKÓW';
 }
});
document.addEventListener('elektryk:mode-selected',e=>{
 if(e.detail?.mode!=='free')update(null);
});
window.ElektrykIndustrialView={
 version:'0.7.16.2',isActive:()=>active,
 board:()=>board?{...board}:null,
 insertNext,example
};
})();