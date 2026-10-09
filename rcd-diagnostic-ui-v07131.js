/* Elektryk 0.7.13.1 — RCD diagnostic panel and targeted wiring highlights. */
(()=>{
'use strict';
const anchor=document.querySelector('.power-analyzer');
if(!anchor||!window.ElektrykRcdCore)return;
const box=document.createElement('section');
box.className='rcd-diagnostic-panel';
box.innerHTML='<div class="rcd-panel-heading"><b>DIAGNOSTYKA RCD / N</b><span id="rcdDiagnosticCount">Sprawdzanie…</span></div><div class="rcd-panel-results" id="rcdDiagnosticResults"></div><p class="rcd-panel-disclaimer">Model szkoleniowy. Wskazana trasa może zawierać więcej niż jedno połączenie — sprawdź wszystkie oznaczone przewody.</p>';
const above=anchor.querySelector('.power-issues');
if(above)anchor.insertBefore(box,above);else anchor.appendChild(box);
const count=box.querySelector('#rcdDiagnosticCount');
const results=box.querySelector('#rcdDiagnosticResults');
let lastKey='',selectedKey='',lastIssues=[];
function snapshot(){return window.ElektrykElectricalEngine?.snapshot?.()||{}}
function esc(v){return window.CSS?.escape?.(String(v))||String(v).replace(/["\\]/g,'\\$&')}
function clearHighlight(){
 document.querySelectorAll('.rcd-diagnostic-target').forEach(el=>el.classList.remove('rcd-diagnostic-target'));
 document.querySelectorAll('.rcd-diagnostic-terminal').forEach(el=>el.classList.remove('rcd-diagnostic-terminal'));
 document.querySelectorAll('.rcd-diagnostic-device').forEach(el=>el.classList.remove('rcd-diagnostic-device'));
}
function markVisible(issue){
 for(const e of issue.edges||[]){
   if(!e.id)continue;
   const selector=e.kind==='wire'?'.wire-layer [data-connection-id="'+esc(e.id)+'"]':
     e.kind==='bridge'?'.bridge-layer [data-bridge-id="'+esc(e.id)+'"]':null;
   if(selector)document.querySelectorAll(selector).forEach(el=>el.classList.add('rcd-diagnostic-target'));
 }
 for(const id of issue.terminals||[]){
   document.querySelectorAll('.wire-terminal[data-terminal="'+esc(id)+'"]').forEach(el=>el.classList.add('rcd-diagnostic-terminal'));
 }
 for(const id of issue.devices||[]){
   document.querySelectorAll('.mounted-device[data-mount-id="'+esc(id)+'"]').forEach(el=>el.classList.add('rcd-diagnostic-device'));
 }
}
function refreshHighlights(){
 clearHighlight();
 const issue=lastIssues.find(x=>x.key===selectedKey);
 if(issue)markVisible(issue);
}
function pointTo(issue){
 selectedKey=issue.key;
 refreshHighlights();
 const first=issue.terminals?.find(id=>document.querySelector('.wire-terminal[data-terminal="'+esc(id)+'"]'));
 const el=first?document.querySelector('.wire-terminal[data-terminal="'+esc(first)+'"]'):
   issue.devices?.length?document.querySelector('.mounted-device[data-mount-id="'+esc(issue.devices[0])+'"]'):null;
 el?.scrollIntoView?.({behavior:'smooth',block:'nearest',inline:'center'});
 results.querySelectorAll('.rcd-issue-card').forEach(card=>{
   card.classList.toggle('is-selected',card.dataset.issueKey===selectedKey);
   const btn=card.querySelector('button');
   if(btn)btn.textContent=card.dataset.issueKey===selectedKey?'✓ WSKAZANO':'◎ WSKAŻ POŁĄCZENIE';
 });
}
function keyFor(x){return x.code+'|'+(x.devices||[]).join(',')+'|'+(x.terminals||[]).join(',')}
function diagnosticLoadIssues(states){
 const rows=[];
 for(const s of states||[]){
   if(!s?.hasN||!s?.residual||s?.residualNok)continue;
   const edges=(s.nRoute?.edges||[]).filter(e=>e?.meta&&(e.meta.wireId||e.meta.bridgeId)).map(e=>
     e.meta.wireId?{kind:'wire',id:e.meta.wireId}:{kind:'bridge',id:e.meta.bridgeId});
   const terminals=s.nRoute?.nodes||[];
   rows.push({type:'error',code:'LOAD_N_WRONG_SECTION',
     text:'Odbiornik '+(s.load?.label||s.load?.id||'')+' ma N poza sekcją RCD/RCBO z toru fazowego.',
     edges,terminals,devices:(s.phaseRoute?.edges||[]).filter(e=>e?.meta?.kind==='device'&&/^(RCD|RCBO)/.test(e.meta.code)).map(e=>e.meta.mountId)});
 }
 return rows;
}
function analyze(states=[]){
 const report=window.ElektrykRcdCore.inspectRecords(snapshot());
 const issues=[...report.issues,...diagnosticLoadIssues(states)].map(x=>({...x,key:keyFor(x)}));
 const signature=JSON.stringify(issues);
 lastIssues=issues;
 if(signature===lastKey){refreshHighlights();return {issues,stats:report.stats}}
 lastKey=signature;
 if(selectedKey&&!issues.some(x=>x.key===selectedKey))selectedKey='';
 count.textContent=issues.filter(x=>x.type==='error').length+' błędów • '+issues.filter(x=>x.type==='warning').length+' ostrzeżeń';
 results.replaceChildren();
 if(!issues.length){
   const empty=document.createElement('div');empty.className='rcd-result-ok';
   empty.textContent=report.stats.rcds?'✓ Nie wykryto nieprawidłowego połączenia sekcji N.':'Zamontuj RCD lub RCBO, aby analizować sekcje N.';
   results.appendChild(empty);
 }
 issues.slice(0,12).forEach(issue=>{
   const card=document.createElement('article');
   card.className='rcd-issue-card '+(issue.type==='warning'?'rcd-warning':'rcd-error');
   card.dataset.issueKey=issue.key;
   const msg=document.createElement('p');msg.textContent=issue.text;card.appendChild(msg);
   const ids=issue.edges.filter(e=>e.kind!=='internal').map(e=>(e.kind==='wire'?'Przewód ':'Mostek ')+e.id);
   if(ids.length){
     const hint=document.createElement('small');hint.textContent='Sprawdź trasę: '+ids.slice(0,7).join(', ')+(ids.length>7?' …':'');
     card.appendChild(hint);
   }
   const btn=document.createElement('button');btn.type='button';btn.textContent='◎ WSKAŻ POŁĄCZENIE';
   btn.addEventListener('click',()=>pointTo(issue));card.appendChild(btn);results.appendChild(card);
 });
 refreshHighlights();
 return {issues,stats:report.stats};
}
window.ElektrykRcdDiagnostic={analyze,refreshHighlights,clearHighlight,getLast:()=>lastIssues.map(x=>({...x}))};
window.ElektrykPower?.refresh?.();
})();