/* RozdzielnicaPRO.pl v0.7.17.7 — szczegółowy raport edukacyjnej kontroli.
 * Dane pochodzą z funkcjonujących silników Stage4, Engine, Audit i RCD.
 * Nie modyfikuje silnika, połączeń ani naliczania XP. */
(()=>{
'use strict';
const host=document.querySelector('.power-analyzer');
if(!host||!window.ElektrykPower)return;
function evaluate(a,detail,ctx={}){
 const states=Array.isArray(a?.states)?a.states:[],
       issues=Array.isArray(a?.issues)?a.issues:[],
       circuits=Array.isArray(a?.engine?.circuits)?a.engine.circuits:[];
 const errors=issues.filter(x=>x.type==='error');
 const warnings=issues.filter(x=>x.type==='warning'||x.type==='warn');
 const monitored=circuits.filter(x=>x.hasOutgoingConnection);
 const problemDevices=monitored.filter(x=>x.status!=='ready');
 const counts={};(ctx.mounted||[]).forEach(x=>counts[x.code]=(counts[x.code]||0)+1);
 const missingRequirements=Object.entries(ctx.requirements||{})
   .filter(([code,count])=>(counts[code]||0)<count)
   .map(([code,count])=>({code,have:counts[code]||0,need:count}));
 const layoutFailed=!!ctx.task&&(ctx.layout?.complete!==true);
 const complete=states.filter(s=>s.complete).length;
 const collisions=a?.collisions?.length||0;
 const measured=!!detail&&states.length>0;
 const verified=measured&&detail.complete===true&&complete===states.length&&
   !errors.length&&!warnings.length&&!collisions&&!problemDevices.length&&
   !missingRequirements.length&&!layoutFailed;
 const status=!measured?'pending':verified?'ok':errors.length||collisions||problemDevices.length?'error':'warn';
 return {status,verified,states,issues,circuits,errors,warnings,monitored,problemDevices,
   missingRequirements,layoutFailed,complete,total:states.length,collisions};
}
function context(){
 const mode=document.body.dataset.gameMode||'learn';
 const task=/^(learn|exam)$/.test(mode)?window.ElektrykStage2?.getTask?.():null;
 return {task,requirements:task?.requirements||{},
   layout:task?window.ElektrykLearningBoard?.evaluate?.()||null:null,
   mounted:window.ElektrykStage2?.getMounted?.()||[]};
}
function stamp(){
 return JSON.stringify({
   m:window.ElektrykStage2?.getMounted?.()||[],
   c:window.ElektrykStage3?.getConnections?.()||[],
   b:window.ElektrykBridges?.getBridges?.()||[],
   s:[...document.querySelectorAll('.mounted-device')].map(x=>[x.dataset.mountId,x.dataset.switchState]),
   t:window.ElektrykStage2?.getTask?.()?.id||null
 });
}
const openBtn=document.createElement('button');
openBtn.type='button';openBtn.className='verification-open';
openBtn.textContent='▤ SZCZEGÓŁOWY RAPORT SPRAWDZENIA';
const issuesHost=host.querySelector('.power-issues');
if(issuesHost)host.insertBefore(openBtn,issuesHost);else host.appendChild(openBtn);
const note=document.createElement('p');
note.className='verification-inline-disclaimer';
note.textContent='Wynik dotyczy tylko modelu szkoleniowego. Nie zastępuje pomiarów i odbioru instalacji.';
openBtn.insertAdjacentElement('afterend',note);
const modal=document.createElement('div');
modal.className='verification-pro-modal';modal.id='verificationProModal';modal.hidden=true;
modal.innerHTML=[
 '<div class="verification-pro-window" role="dialog" aria-modal="true" aria-labelledby="verificationProTitle" tabindex="-1">',
 '<header class="verification-pro-head"><div><small>ROZDZIELNICAPRO.PL • DIAGNOSTYKA PRO</small>',
 '<h2 id="verificationProTitle">RAPORT SPRAWDZENIA INSTALACJI</h2>',
 '<p>Wynik analizy wykonanej przez silniki symulatora. Sprawdź wszystkie uwagi i popraw połączenia.</p>',
 '</div><button id="verificationProClose" type="button" aria-label="Zamknij raport">×</button></header>',
 '<div class="verification-pro-body"><section id="verificationProVerdict" class="verification-pro-verdict" aria-live="polite"></section>',
 '<div id="verificationProStats" class="verification-pro-stats"></div>',
 '<section class="verification-pro-group"><h3>ODBIORNIKI • L / N / PE</h3><div id="verificationProLoads" class="verification-pro-list"></div></section>',
 '<section class="verification-pro-group"><h3>APARATURA I ZABEZPIECZENIA</h3><div id="verificationProDevices" class="verification-pro-list"></div></section>',
 '<section class="verification-pro-group"><h3>WYKRYTE PROBLEMY I ZALECANE POPRAWKI</h3><div id="verificationProIssues" class="verification-pro-list"></div></section>',
 '<p class="verification-pro-disclaimer">UWAGA: Symulator nie sprawdza fizycznego bezpieczeństwa instalacji, parametrów ochrony, selektywności, czasu wyłączenia ani wyników pomiarów wymaganych przepisami i normami.</p></div>',
 '<footer class="verification-pro-foot"><button type="button" id="verificationProRun">⚡ SPRAWDŹ PONOWNIE</button>',
 '<button type="button" id="verificationProBack">WRÓĆ DO ROZDZIELNICY</button></footer></div>'
].join('');
document.body.appendChild(modal);
const find=id=>modal.querySelector('#'+id);
const ui={verdict:find('verificationProVerdict'),stats:find('verificationProStats'),
 loads:find('verificationProLoads'),devices:find('verificationProDevices'),issues:find('verificationProIssues')};
const el=(tag,cls,txt)=>{
 const x=document.createElement(tag);
 if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);
 return x;
};
let last=null,focusBefore=null;
function findTarget(id){
 if(!id)return null;
 const key=window.CSS?.escape?.(String(id))||String(id).replace(/["\\]/g,'\\$&');
 return document.querySelector('.wire-terminal[data-terminal="'+key+'"]')||
  document.querySelector('.mounted-device[data-mount-id="'+key+'"]')||
  document.querySelector('[data-circuit="'+key+'"]');
}
function locate(id){
 const target=findTarget(id);if(!target)return;
 close();document.querySelectorAll('.verification-pro-target').forEach(x=>x.classList.remove('verification-pro-target'));
 target.classList.add('verification-pro-target');
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 target.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'center',inline:'nearest'});
}
function row(to,title,text,status='warn',ref){
 const r=el('div','verification-pro-row state-'+status),copy=el('div','verification-pro-copy');
 copy.append(el('b','',title),el('small','',text));r.appendChild(copy);
 const target=findTarget(ref);
 if(target){
  const b=el('button','','◎ WSKAŻ');b.type='button';b.addEventListener('click',()=>locate(ref));
  r.appendChild(b);
 }else r.appendChild(el('span','verification-pro-label',status==='ok'?'OK':status==='error'?'BŁĄD':'SPRAWDŹ'));
 to.appendChild(r);
}
function refresh(){
 Object.values(ui).forEach(x=>x.replaceChildren());
 const stale=!last||last.stamp!==stamp(),r=last?.report;
 const status=!r?'pending':stale?'warn':r.status;
 ui.verdict.className='verification-pro-verdict state-'+status;
 ui.verdict.append(el('strong','',
   !r?'NIE WYKONANO JESZCZE KONTROLI':
   stale?'ZMIENIONO PROJEKT — SPRAWDŹ INSTALACJĘ PONOWNIE':
   r.verified?'✓ MODEL PRZESZEDŁ DOSTĘPNE TESTY SYMULATORA':
   r.status==='error'?'WYKRYTO BŁĘDY POŁĄCZEŃ':'INSTALACJA WYMAGA DOKOŃCZENIA LUB WERYFIKACJI'));
 ui.verdict.append(el('p','',
   !r?'Kliknij „Sprawdź ponownie”, aby wykonać analizę.':
   stale?'Poprzedni raport jest nieaktualny po zmianach w rozdzielnicy.':
   r.verified?'Wszystkie analizowane tory spełniły warunki modelu edukacyjnego.':
   'Sprawdź wymagania i błędy w poniższych sekcjach.'));
 if(!r)return;
 [['ODBIORNIKI',r.complete+'/'+r.total],['BŁĘDY',r.errors.length],
  ['KOLIZJE FAZ',r.collisions],['OSTRZEŻENIA',r.warnings.length]].forEach(([a,b])=>{
   const tile=el('div','verification-pro-metric');
   tile.append(el('span','',a),el('b','',b));ui.stats.appendChild(tile);
 });
 r.states.forEach(s=>{
   const missing=[!s.hasPhase?'L':null,!s.hasN?'N':null,!s.hasPE?'PE':null].filter(Boolean);
   const msg=s.complete?'L/N/PE obecne • ochrona wykryta przez symulator':
      [missing.length?'Brak: '+missing.join(', '):'',
       s.hasPhase&&!s.hasFR?'L omija FR':'',
       s.hasPhase&&!s.protectedPath?'Brak MCB/RCBO':'',
       s.hasPhase&&!s.residual?'Brak RCD/RCBO':'',
       s.hasN&&!s.residualNok?'N poza właściwym RCD/RCBO':'',
       !s.any?'Odbiornik niepodłączony':''].filter(Boolean).join(' • ');
   row(ui.loads,s.load?.label||s.load?.id||'Odbiornik',msg||'Do poprawy',
     s.complete?'ok':s.any?'error':'warn',s.load?.id);
 });
 if(!r.circuits.length)row(ui.devices,'Brak aparatów do oceny','Zamontuj MCB/RCBO i ponów test.');
 r.circuits.forEach(c=>{
   const msg='WE: '+(c.inputPhases.join(', ')||'—')+' • WY: '+(c.outputPhases.join(', ')||'—')+
    ([...c.errors,...c.warnings].length?' • '+[...c.errors,...c.warnings].join(' • '):'');
   row(ui.devices,c.code+' • DIN '+(Number(c.row)+1),msg,
     c.status==='ready'?'ok':c.status==='error'?'error':'warn',c.id);
 });
 const unique=new Set();
 const add=(kind,title,msg,ref)=>{
  const key=kind+'|'+msg;if(unique.has(key))return;unique.add(key);
  row(ui.issues,title,msg,kind,ref);
 };
 r.states.filter(s=>!s.complete).forEach(s=>add(s.any?'error':'warn',
   s.any?'Odbiornik ma niepełny tor':'Odbiornik niepodłączony',
   (s.load?.label||s.load?.id||'Odbiornik')+': dokończ i sprawdź L/N/PE.',s.load?.id));
 r.missingRequirements.forEach(m=>add('warn','Brak aparatu wymagany przez zadanie',
   m.code+': '+m.have+' z '+m.need+' szt.',null));
 if(r.layoutFailed)add('warn','Układ aparatów DIN','Sprawdź rozmieszczenie względem wzorca zadania.');
 r.issues.filter(i=>i.type==='error'||i.type==='warning'||i.type==='warn')
   .forEach(i=>add(i.type==='error'?'error':'warn',i.code||'DIAGNOSTYKA',i.text,i.ref));
 r.problemDevices.forEach(c=>add('warn','Aparat wymaga sprawdzenia',
   c.code+': '+([...c.errors,...c.warnings].join(' • ')||c.status),c.id));
 if(!unique.size)row(ui.issues,'Brak wykrytych problemów',
   'W zakresie testów obsługiwanych przez silnik symulatora.','ok');
}
function open(){focusBefore=document.activeElement;modal.hidden=false;refresh();find('verificationProClose')?.focus()}
function close(){modal.hidden=true;if(focusBefore?.isConnected)focusBefore.focus()}
function run(){window.ElektrykPower?.analyze?.()}
document.addEventListener('elektryk:power-check',e=>{
 const report=evaluate(window.ElektrykPower?.getLast?.(),e.detail,context());
 last={report,stamp:stamp(),time:Date.now()};
 if(modal.hidden)open();else refresh();
});
openBtn.addEventListener('click',open);
find('verificationProClose').addEventListener('click',close);
find('verificationProBack').addEventListener('click',close);
find('verificationProRun').addEventListener('click',run);
modal.addEventListener('click',e=>{if(e.target===modal)close()});
modal.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key!=='Tab')return;
 const all=[...modal.querySelectorAll('button:not(:disabled)')].filter(x=>x.getClientRects().length);
 if(!all.length)return;
 if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all[all.length-1].focus()}
 else if(!e.shiftKey&&document.activeElement===all[all.length-1]){e.preventDefault();all[0].focus()}
});
document.addEventListener('elektryk:task-started',()=>{last=null});
document.addEventListener('elektryk:mode-selected',()=>{last=null});
window.ElektrykVerificationPRO={
 version:'0.7.17.7',evaluate,open,run,getLast:()=>last?.report||null,
 isCurrent:()=>!!last&&last.stamp===stamp(),
 isPassed:()=>!!last&&last.stamp===stamp()&&last.report?.verified===true
};
})();