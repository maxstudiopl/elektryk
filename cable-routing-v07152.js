/* RozdzielnicaPRO.pl v0.7.15.2 — Cable Routing PRO
 * Real terminal IDs; integrated top/bottom sheathed cables. N rails remain
 * isolated per RCD section; PE has its own internal common terminal strip.
 * No wiring is generated here: auto/step/manual use the same circuit graph.
 */
(()=>{
'use strict';
const cabinet=document.querySelector('.cabinet-inner'),legacy=document.querySelector('.circuits');
if(!cabinet||!legacy)return;
const bases=[...legacy.querySelectorAll(':scope > .circuit-node')];
let root=null,active=[],routing=[],baseHeight=null,expandedHeight=null;
const PHASE_COLORS={L1:'#8b4a17',L2:'#161819',L3:'#777f83'};
const cableCode=load=>load?.cable||(load?.code==='B10'?'YDYp 3×1,5':'YDYp 3×2,5');
function terminal(role,id,label,zone='bar'){
 const maker=window.ElektrykStage3?.createTerminal;
 if(maker)return maker(label||role,role,id,zone);
 const el=document.createElement('button');
 el.type='button';el.className='wire-terminal';
 el.textContent=label||role;el.dataset.terminal=id;el.dataset.role=role;el.dataset.zone=zone;
 return el;
}
function elem(tag,klass,text){
 const el=document.createElement(tag);if(klass)el.className=klass;
 if(text!==undefined)el.textContent=text;
 return el;
}
function strip(host,label,role,ids,klass){
 const el=elem('section','large-strip '+klass);
 el.appendChild(elem('b','large-strip-heading',label));
 const ports=elem('div','large-strip-ports');
 ids.forEach((id,i)=>ports.appendChild(terminal(role,id,i===0?'IN':String(i))));
 el.appendChild(ports);host.appendChild(el);
}
function createCable(load){
 const el=elem('article','large-load-card large-cable-outlet circuit-node');
 el.dataset.circuit=load.id;
 el.dataset.breakerId=load.breakerId||'';
 el.appendChild(elem('b','cable-outlet-name','OB. '+String(load.number).padStart(2,'0')));
 el.appendChild(elem('small','cable-outlet-meta',load.section||'REZERWA'));
 const visual=elem('div','circuit-cable-visual');
 visual.appendChild(elem('span','circuit-sheath'));
 visual.appendChild(elem('span','circuit-core core-l'));
 visual.appendChild(elem('span','circuit-core core-n'));
 visual.appendChild(elem('span','circuit-core core-pe'));
 el.appendChild(visual);
 const terminals=elem('div','circuit-terminals');
 for(const role of ['L','N','PE']){
   const t=terminal(role,'LOAD:'+load.id+':'+role,role,'load');
   t.classList.add('terminal-'+role.toLowerCase());
   terminals.appendChild(t);
 }
 el.appendChild(terminals);
 return el;
}
function buildBusbars(board){
 const rails=elem('div','large-board-busbars');
 rails.id='largeBoardInternalBars';
 rails.setAttribute('aria-label','Wewnętrzne listwy N i PE rozdzielnicy');
 rails.appendChild(elem('div','large-busbar-title','WEWNĘTRZNE LISTWY ZACISKOWE • NIEZALEŻNE SEKCJE N / WSPÓLNE PE'));
 const grid=elem('div','large-rack-strips');
 for(const section of board.nSections||[]){
   strip(grid,section.label,'N',
     Array.from({length:section.ports},(_,i)=>'AUTO:N:'+section.id+':'+i),'large-n-section');
 }
 strip(grid,'PE • GŁÓWNY TOR OCHRONNY','PE',
   Array.from({length:(board.pePorts||0)+1},(_,i)=>'AUTO:PE:'+i),'large-pe-section');
 rails.appendChild(grid);
 return rails;
}
function decideOutlet(load,rows,counts){
 const row=Number(load.breakerRow);
 if(rows===1||!Number.isFinite(row))return counts.top<=counts.bottom?'top':'bottom';
 if(row<(rows-1)/2)return 'top';
 if(row>(rows-1)/2)return 'bottom';
 return counts.top<=counts.bottom?'top':'bottom';
}
function sectionsFor(board){
 // Sort by real protective section while preserving the numbered circuit IDs.
 const list=board.loads||[];
 return [...list].sort((a,b)=>String(a.section||'').localeCompare(String(b.section||''),'pl')||a.number-b.number);
}
function teardown(){
 if(!root)return;
 for(const node of bases){
   node.classList.remove('large-load-card','large-cable-outlet','cable-base-outlet');
   node.style.removeProperty('--cable-l');
   node.removeAttribute('data-cable-exit');
   legacy.appendChild(node);
 }
 root.remove();root=null;active=[];routing=[];
 if(expandedHeight!==null&&Math.abs((parseFloat(cabinet.style.height)||0)-expandedHeight)<2&&baseHeight!==null){
   cabinet.style.height=baseHeight+'px';
 }
 baseHeight=null;expandedHeight=null;
 cabinet.classList.remove('cable-routing-shell','large-board-shell');
 for(const prop of ['--crp-top-shift','--crp-bottom-height','--crp-bus-top']){
   cabinet.style.removeProperty(prop);
 }
 requestAnimationFrame(()=>window.ElektrykStage3?.redraw?.());
}
function prepare(board){
 if(!board?.loads||!board?.devices)return false;
 teardown();
 const list=sectionsFor(board);
 root=elem('div','cable-routing-root');root.id='largeBoardCableRouting';
 const top=elem('section','cable-bank cable-bank-top');
 top.setAttribute('aria-label','Kable wychodzące górą rozdzielnicy');
 const bottom=elem('section','cable-bank cable-bank-bottom');
 bottom.setAttribute('aria-label','Kable wychodzące dołem rozdzielnicy');
 const internals=buildBusbars(board);
 const saved=new Map(bases.map(e=>[e.dataset.circuit,e]));
 const rows=Math.max(1,Number(board.devices.reduce((m,d)=>Math.max(m,Number(d.row)||0),0))+1);
 const counts={top:0,bottom:0};
 const used=new Set();
 for(const load of list){
   const parent=decideOutlet(load,rows,counts);counts[parent]++;
   const el=saved.get(load.id)||createCable(load);used.add(load.id);
   el.classList.add('large-load-card','large-cable-outlet');
   if(saved.has(load.id))el.classList.add('cable-base-outlet');
   el.dataset.circuit=load.id;el.dataset.breakerId=load.breakerId||'';
   el.dataset.cableExit=parent;
   el.style.setProperty('--cable-l',PHASE_COLORS[load.phase]||PHASE_COLORS.L1);
   el.title='Obwód '+load.number+' • '+(load.label||load.code)+' • '+(load.section||'')+' • '+load.phase+' • '+cableCode(load);
   (parent==='top'?top:bottom).appendChild(el);
   routing.push({id:load.id,number:load.number,exit:parent,section:load.section||'',phase:load.phase,breakerId:load.breakerId||''});
 }
 // Four legacy outputs are kept interactive even in scenarios with 2–3 assigned loads.
 for(const node of bases){
   if(used.has(node.dataset.circuit))continue;
   const parent=counts.top<=counts.bottom?'top':'bottom';counts[parent]++;
   node.classList.add('large-load-card','large-cable-outlet','cable-base-outlet');
   node.dataset.cableExit=parent;
   node.style.setProperty('--cable-l',PHASE_COLORS.L1);
   node.title='Wyjście rezerwowe • brak przypisanego zabezpieczenia w zadaniu';
   (parent==='top'?top:bottom).appendChild(node);
 }
 root.append(top,internals,bottom);
 cabinet.appendChild(root);
 cabinet.classList.add('cable-routing-shell');
 const topHeight=Math.max(72,top.scrollHeight||top.offsetHeight||72);
 const bottomHeight=Math.max(72,bottom.scrollHeight||bottom.offsetHeight||72);
 const topShift=Math.max(0,topHeight-105);
 const dinBottom=214+topShift+rows*252+96;
 const busTop=dinBottom+18;
 const busHeight=Math.max(50,internals.scrollHeight||internals.offsetHeight||50);
 baseHeight=parseFloat(cabinet.style.height)||cabinet.offsetHeight||700;
 expandedHeight=Math.max(baseHeight+topShift,busTop+busHeight+bottomHeight+125);
 cabinet.style.setProperty('--crp-top-shift',topShift+'px');
 cabinet.style.setProperty('--crp-bottom-height',bottomHeight+'px');
 cabinet.style.setProperty('--crp-bus-top',busTop+'px');
 cabinet.style.height=expandedHeight+'px';
 active=(board.loads||[]).slice(4).map(x=>({id:x.id,label:x.label}));
 requestAnimationFrame(()=>{
   window.ElektrykStage3?.refreshTerminals?.();
   window.ElektrykStage3?.redraw?.();
   window.ElektrykBridges?.redraw?.();
   window.ElektrykPower?.refresh?.();
 });
 return true;
}
window.ElektrykLargeBoard={
 prepare,clear:teardown,loads:()=>active.map(x=>({...x})),count:()=>active.length,existing:()=>!!root,
 routing:()=>routing.map(x=>({...x}))
};
})();
