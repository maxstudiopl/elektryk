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
const baseLabels=new Map(bases.map(node=>[node,{
 name:node.querySelector(':scope > b')?.textContent||'',
 cable:node.querySelector(':scope > small')?.textContent||''
}]));
let root=null,inspector=null,active=[],routing=[],baseHeight=null,expandedHeight=null;
const MAX_TOP=12,MAX_BOTTOM_ROWS=7;
const WIDTH_PER_TOP=67,MIN_WLZ_GUARD=380;
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
function topSpace(){
 const width=cabinet.clientWidth||cabinet.offsetWidth||960;
 const source=cabinet.querySelector('.supply-box');
 const outer=cabinet.getBoundingClientRect?.();
 const rect=source?.getBoundingClientRect?.();
 const guard=Math.ceil(Math.max(MIN_WLZ_GUARD,
   outer&&rect&&rect.width?rect.right-outer.left+24:MIN_WLZ_GUARD));
 const free=Math.max(0,width-guard-22);
 return {guard,limit:Math.min(MAX_TOP,Math.max(0,Math.floor(free/WIDTH_PER_TOP)))};
}
function topIdsFor(board,space){
 // Prioritize the upper DIN rows, with a strict single-row ceiling.
 return new Set([...board.loads]
   .sort((a,b)=>(Number(a.breakerRow)||0)-(Number(b.breakerRow)||0)||a.number-b.number)
   .slice(0,space.limit).map(x=>x.id));
}
function buildInspector(){
 const bar=elem('div','crp-cable-inspector');
 bar.id='crpCableDetails';
 bar.setAttribute('role','status');
 bar.setAttribute('aria-live','polite');
 bar.textContent='WYJŚCIA KABLOWE • Kliknij numer kabla, aby zobaczyć obwód, RCD, zabezpieczenie, fazę i przekrój.';
 return bar;
}
function inspect(load,el){
 root?.querySelectorAll('.large-cable-outlet.is-inspected')?.forEach(x=>x.classList.remove('is-inspected'));
 el?.classList.add('is-inspected');
 if(!inspector)return;
 if(!load){
   inspector.textContent='KABEL REZERWOWY • Brak przypisanego obwodu w tym scenariuszu.';
   return;
 }
 inspector.textContent='OBWÓD '+String(load.number).padStart(2,'0')
  +' • '+(load.label||load.code).toUpperCase()
  +' • '+load.code+' • '+(load.section||'BEZ RCD')
  +' • '+load.phase+' / N / PE'
  +' • '+cableCode(load)
  +' • WYJŚCIE '+(el?.dataset.cableExit==='top'?'GÓRĄ':'DOŁEM');
}
function enableInspection(el,load){
 el.addEventListener('click',ev=>{
   if(ev.target?.closest?.('.wire-terminal'))return;
   inspect(load,el);
 });
 el.tabIndex=0;
 el.setAttribute('aria-label',load?
   'Kabel obwodu '+load.number+', '+load.label+', '+load.code+', '+load.section+'. Kliknij, aby zobaczyć szczegóły':
   'Kabel rezerwowy, bez przypisanego obwodu.');
 el.addEventListener('keydown',ev=>{
   if(ev.target!==el||!(ev.key==='Enter'||ev.key===' '))return;
   ev.preventDefault();inspect(load,el);
 });
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
   const saved=baseLabels.get(node);
   const heading=node.querySelector(':scope > b'),subtitle=node.querySelector(':scope > small');
   if(heading&&saved)heading.textContent=saved.name;
   if(subtitle&&saved)subtitle.textContent=saved.cable;
   legacy.appendChild(node);
 }
 root.remove();inspector?.remove();inspector=null;root=null;active=[];routing=[];
 if(expandedHeight!==null&&Math.abs((parseFloat(cabinet.style.height)||0)-expandedHeight)<2&&baseHeight!==null){
   cabinet.style.height=baseHeight+'px';
 }
 baseHeight=null;expandedHeight=null;
 cabinet.classList.remove('cable-routing-shell','large-board-shell');
 for(const prop of ['--crp-top-shift','--crp-bottom-height','--crp-bus-top','--crp-wlz-clearance','--crp-bottom-columns']){
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
 const rows=Math.max(1,Number(cabinet.dataset.rows||board.rows||0)||
   (board.devices.reduce((m,d)=>Math.max(m,Number(d.row)||0),0)+1));
 const space=topSpace(),topIds=topIdsFor(board,space);
 const counts={top:0,bottom:0};
 const used=new Set();
 for(const load of list){
   const parent=topIds.has(load.id)?'top':'bottom';counts[parent]++;
   const el=saved.get(load.id)||createCable(load);used.add(load.id);
   el.classList.add('large-load-card','large-cable-outlet');
   if(saved.has(load.id)){
     el.classList.add('cable-base-outlet');
     const heading=el.querySelector(':scope > b'),subtitle=el.querySelector(':scope > small');
     if(heading)heading.textContent=String(load.number).padStart(2,'0')+' '+(load.label||load.code).toUpperCase().slice(0,6);
     if(subtitle)subtitle.textContent=load.section||'OBWÓD';
   }
   el.dataset.circuit=load.id;el.dataset.breakerId=load.breakerId||'';
   el.dataset.cableExit=parent;
   el.style.setProperty('--cable-l',PHASE_COLORS[load.phase]||PHASE_COLORS.L1);
   el.title='Obwód '+load.number+' • '+(load.label||load.code)+' • '+(load.section||'')+' • '+load.phase+' • '+cableCode(load);
   (parent==='top'?top:bottom).appendChild(el);
   enableInspection(el,load);
   routing.push({id:load.id,number:load.number,exit:parent,section:load.section||'',phase:load.phase,breakerId:load.breakerId||''});
 }
 // Four legacy outputs are kept interactive even in scenarios with 2–3 assigned loads.
 for(const node of bases){
   if(used.has(node.dataset.circuit))continue;
   const parent='bottom';counts[parent]++;
   node.classList.add('large-load-card','large-cable-outlet','cable-base-outlet');
   node.dataset.cableExit=parent;
   node.style.setProperty('--cable-l',PHASE_COLORS.L1);
   node.title='Wyjście rezerwowe • brak przypisanego zabezpieczenia w zadaniu';
   (parent==='top'?top:bottom).appendChild(node);
   enableInspection(node,null);
 }
 root.append(top,internals,bottom);
 cabinet.appendChild(root);
 inspector=buildInspector();
 cabinet.parentElement?.appendChild(inspector);
 cabinet.classList.add('cable-routing-shell');
 const bottomRows=Math.min(MAX_BOTTOM_ROWS,Math.max(1,Math.ceil(counts.bottom/10)));
 const bottomCols=Math.max(1,Math.ceil(counts.bottom/bottomRows));
 cabinet.style.setProperty('--crp-wlz-clearance',space.guard+'px');
 cabinet.style.setProperty('--crp-bottom-columns',String(bottomCols));
 const topHeight=Math.max(109,top.scrollHeight||top.offsetHeight||109);
 const bottomHeight=Math.max(116,bottom.scrollHeight||bottom.offsetHeight||116);
 const topShift=Math.max(0,topHeight-113);
 const dinBottom=214+topShift+rows*252+96;
 const busTop=dinBottom+24;
 const busHeight=Math.max(50,internals.scrollHeight||internals.offsetHeight||50);
 baseHeight=parseFloat(cabinet.style.height)||cabinet.offsetHeight||700;
 expandedHeight=Math.max(baseHeight+topShift,busTop+busHeight+bottomHeight+85);
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
 routing:()=>routing.map(x=>({...x})),limits:{maxTop:MAX_TOP,maxBottomRows:MAX_BOTTOM_ROWS,maxOutputs:70}
};
})();
