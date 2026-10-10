/* RozdzielnicaPRO.pl v0.7.23 — karta zamontowanego aparatu PRO.
 * Tylko obudowy rodzin residential / large_residential.
 * Bez modyfikacji geometrii szyn DIN, zacisków i warstwy przewodów.
 */
(()=>{
'use strict';
const host=document.querySelector('.din-rows-host');
const sidebar=document.querySelector('.rightbar');
const anchor=sidebar?.querySelector('.catalog-panel');
if(!host||!sidebar||!anchor)return;

const residential=family=>family==='residential'||family==='large_residential';
let chosenId=null,pending=false;
const panel=document.createElement('section');
panel.className='panel residential-pro-panel';
panel.id='residentialProPanel';
panel.hidden=true;
panel.setAttribute('aria-label','Stan rozdzielnicy domowej i wybranego aparatu PRO');
panel.innerHTML=
 '<div class="panel-title"><span>PRO • KARTA ROZDZIELNICY</span><small id="rproModel">DOMOWA</small></div>'+
 '<div class="rpro-inner">'+
 '<div class="rpro-usage"><b>ZAJĘTOŚĆ SZYN DIN</b><span id="rproUsage" aria-live="polite">—</span></div>'+
 '<div class="rpro-rows" id="rproRows"></div>'+
 '<div class="rpro-device" id="rproDevice" aria-live="polite">'+
   '<p>Wybierz zamontowany aparat na szynie DIN, aby zobaczyć jego parametry i stan.</p>'+
 '</div></div>';
sidebar.insertBefore(panel,anchor);
const find=id=>panel.querySelector('#'+id);
const chosen=()=>window.ElektrykStage2?.getMounted?.().find(m=>m.id===chosenId)||null;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function update(){
 const board=window.ElektrykStage2?.getBoardConfig?.();
 panel.hidden=!residential(board?.family);
 if(panel.hidden){chosenId=null;return}
 const devices=window.ElektrykStage2?.getMounted?.()||[];
 const rows=Number(board?.rows)||0;
 const cols=Number(board?.modulesPerRow)||0;
 const occupied=devices.reduce((sum,m)=>sum+(Number(m.modules)||0),0);
 const capacity=rows*cols;
 find('rproModel').textContent=rows+'×'+cols+'M • PRO';
 find('rproUsage').textContent=occupied+' / '+capacity+' M';
 const tracks=find('rproRows');
 tracks.replaceChildren();
 for(let r=0;r<rows;r++){
   const count=devices.filter(m=>m.row===r).reduce((sum,m)=>sum+m.modules,0);
   const line=document.createElement('div');line.className='rpro-track';
   const label=document.createElement('span');label.textContent='DIN '+(r+1);
   const meter=document.createElement('div');meter.className='rpro-meter';
   meter.setAttribute('role','progressbar');
   meter.setAttribute('aria-label','Zajętość szyny DIN '+(r+1));
   meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax',String(cols));
   meter.setAttribute('aria-valuenow',String(count));
   const fill=document.createElement('i');fill.style.width=clamp(cols?count/cols*100:0,0,100)+'%';
   meter.appendChild(fill);
   const stat=document.createElement('small');stat.textContent=count+'/'+cols;
   line.append(label,meter,stat);tracks.appendChild(line);
 }
 const el=find('rproDevice');
 el.replaceChildren();
 const m=devices.find(rec=>rec.id===chosenId);
 if(!m){
   chosenId=null;
   const p=document.createElement('p');
   p.textContent='Kliknij aparat zamontowany na szynie DIN, aby otworzyć jego kartę serwisową.';
   el.appendChild(p);
   return;
 }
 const part=window.ElektrykStage2?.parts?.[m.code];
 const wrapper=[...host.querySelectorAll('.mounted-device')].find(x=>x.dataset.mountId===m.id);
 if(!part||!wrapper){chosenId=null;return}
 const heading=document.createElement('strong');heading.textContent=part.name;
 const ref=document.createElement('small');ref.textContent='DIN '+(m.row+1)+' • moduły '+(m.start+1)+'–'+(m.start+m.modules)+' • '+m.modules+'M';
 const description=document.createElement('p');description.textContent=part.fn+' • '+part.meta;
 const termini=wrapper.querySelectorAll('.device-topterm .wire-terminal').length;
 const terminiBottom=wrapper.querySelectorAll('.device-bottomterm .wire-terminal').length;
 const connections=window.ElektrykStage3?.getConnections?.()||[];
 const wires=connections.filter(c=>c.a.startsWith(m.id+':')||c.b.startsWith(m.id+':')).length;
 const stats=document.createElement('div');stats.className='rpro-device-stats';
 stats.textContent='Zaciski: '+termini+' WE / '+terminiBottom+' WY • przewody: '+wires;
 el.append(heading,ref,description,stats);
 const lever=wrapper.querySelector('.lever[data-power-toggle]');
 if(lever){
   const status=document.createElement('div');status.className='rpro-state';
   const state=document.createElement('b');state.id='rproSwitchState';
   state.textContent=m.switchState==='off'?'WYŁĄCZONY (0)':'ZAŁĄCZONY (I)';
   state.className=m.switchState==='off'?'is-off':'is-on';
   const action=document.createElement('button');action.id='rproSwitchButton';action.type='button';
   action.textContent=m.switchState==='off'?'ZAŁĄCZ APARAT':'WYŁĄCZ APARAT';
   action.setAttribute('aria-label',(m.switchState==='off'?'Załącz':'Wyłącz')+' '+part.name+' w symulatorze');
   action.addEventListener('click',()=>{
     const current=[...host.querySelectorAll('.mounted-device')].find(x=>x.dataset.mountId===chosenId);
     current?.querySelector('.lever[data-power-toggle]')?.click();
     requestAnimationFrame(update);
   });
   status.append(state,action);el.appendChild(status);
 }else{
   const p=document.createElement('small');p.textContent='Element pasywny: brak przełącznika ON/OFF.';
   el.appendChild(p);
 }
 const note=document.createElement('small');note.className='rpro-note';
 note.textContent='Parametry i stany dotyczą wyłącznie modelu edukacyjnego.';
 el.appendChild(note);
}

function refresh(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(()=>{pending=false;update()});
}
function select(id){
 const board=window.ElektrykStage2?.getBoardConfig?.();
 if(!residential(board?.family))return false;
 if(!window.ElektrykStage2?.getMounted?.().some(m=>m.id===id))return false;
 chosenId=id;refresh();return true;
}
document.addEventListener('elektryk:apparatus-selected',e=>select(e.detail?.id));
document.addEventListener('elektryk:apparatus-removed',e=>{if(e.detail?.id===chosenId)chosenId=null;refresh()});
document.addEventListener('elektryk:apparatus-state-changed',refresh);
document.addEventListener('elektryk:board-changed',()=>{chosenId=null;refresh()});
document.addEventListener('elektryk:task-started',()=>{chosenId=null;refresh()});
document.addEventListener('elektryk:mode-selected',refresh);
document.addEventListener('elektryk:rails-changed',()=>{chosenId=null;refresh()});
const observer=new MutationObserver(refresh);
observer.observe(host,{childList:true,subtree:true});
refresh();
window.ElektrykResidentialPRO={
 version:'0.7.23',refresh,select,
 getState:()=>({board:window.ElektrykStage2?.getBoardConfig?.()?.boardId||'',selectedId:chosenId,visible:!panel.hidden})
};
})();
