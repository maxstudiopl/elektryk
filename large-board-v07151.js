/* RozdzielnicaPRO.pl v0.7.15.1 — rozbudowane tory N/PE i wyjścia kablowe.
   Creates actual terminal buttons and visible circuit cards inside the cabinet.
   Used only by assisted training, not by demo, free-build or exams. */
(()=>{
'use strict';
const cabinet=document.querySelector('.cabinet-inner');
if(!cabinet)return;
let rack=null,active=[],baseHeight=null,expandedHeight=null;
function createTerm(role,id,label){
 const maker=window.ElektrykStage3?.createTerminal;
 if(maker)return maker(label||role,role,id,'bar');
 const btn=document.createElement('button');btn.type='button';
 btn.className='wire-terminal';btn.textContent=label||role;
 btn.dataset.role=role;btn.dataset.terminal=id;btn.dataset.zone='bar';return btn;
}
function addStrip(host,label,role,ids,klass){
 const strip=document.createElement('section');strip.className='large-strip '+klass;
 const title=document.createElement('b');title.textContent=label;strip.appendChild(title);
 const row=document.createElement('div');row.className='large-strip-ports';
 for(let i=0;i<ids.length;i++)row.appendChild(createTerm(role,ids[i],i===0?'IN':String(i)));
 strip.appendChild(row);host.appendChild(strip);return strip;
}
function teardown(){
 if(!rack)return;
 rack.remove();rack=null;active=[];
 // Task selection may have already applied a NEW board height; preserve it.
 if(expandedHeight!==null&&Math.abs(parseFloat(cabinet.style.height||0)-expandedHeight)<2){
   if(baseHeight!==null)cabinet.style.height=baseHeight+'px';
 }
 baseHeight=null;expandedHeight=null;
 cabinet.classList.remove('large-board-shell');
 cabinet.style.removeProperty('--extra-rack-height');
 cabinet.style.removeProperty('padding-bottom');
 window.ElektrykStage3?.redraw?.();
}
function prepare(board){
 if(!board)return false;
 teardown();
 const extras=(board.loads||[]).slice(4);
 const frame=document.createElement('section');
 frame.id='largeBoardRack';frame.className='large-board-rack';
 frame.setAttribute('aria-label','Tory wyjściowe dużej rozdzielnicy');
 const heading=document.createElement('div');heading.className='large-rack-head';
 heading.textContent='ROZDZIAŁ N / PE • '+board.loads.length+' OBWODÓW KOŃCOWYCH';
 frame.appendChild(heading);
 const strips=document.createElement('div');strips.className='large-rack-strips';frame.appendChild(strips);
 for(const group of board.nSections||[]){
   const ports=Array.from({length:group.ports},(_,i)=>'AUTO:N:'+group.id+':'+i);
   addStrip(strips,group.label,'N',ports,'large-n-section');
 }
 addStrip(strips,'PE • WSPÓLNA SZYNA OCHRONNA','PE',
   Array.from({length:(board.pePorts||0)+1},(_,i)=>'AUTO:PE:'+i),'large-pe-section');
 if(extras.length){
   const h=document.createElement('div');h.className='large-rack-head large-rack-subtitle';
   h.textContent='DODATKOWE WYJŚCIA • '+extras.length+' OBWODÓW (L / N / PE)';
   frame.appendChild(h);
   const grid=document.createElement('div');grid.className='large-load-grid';
   for(const load of extras){
     const card=document.createElement('div');card.className='large-load-card';
     card.dataset.circuit=load.id;card.dataset.breakerId=load.breakerId;
     const title=document.createElement('b');title.textContent=load.number+'. '+load.code;
     const subtitle=document.createElement('small');subtitle.textContent='OBWÓD '+load.number+' • '+load.phase;
     const pins=document.createElement('div');pins.className='large-load-ports';
     for(const p of ['L','N','PE'])pins.appendChild(createTerm(p,'LOAD:'+load.id+':'+p,p));
     card.append(title,subtitle,pins);grid.appendChild(card);
   }
   frame.appendChild(grid);
 }
 cabinet.appendChild(frame);rack=frame;
 active=extras.map(e=>({...e}));
 cabinet.classList.add('large-board-shell');
 // Keep all terminals physically inside the cabinet's SVG drawing area.
 const height=Math.max(125,frame.scrollHeight||frame.offsetHeight||0);
 baseHeight=parseFloat(cabinet.style.height)||cabinet.offsetHeight||700;
 expandedHeight=baseHeight+height+155;
 cabinet.style.setProperty('--extra-rack-height',height+'px');
 cabinet.style.height=expandedHeight+'px';
 requestAnimationFrame(()=>window.ElektrykStage3?.redraw?.());
 return true;
}
window.ElektrykLargeBoard={prepare,clear:teardown,loads:()=>active.map(l=>({id:l.id,label:l.label})),
 count:()=>active.length,existing:()=>!!rack};
})();
