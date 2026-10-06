(()=>{

const PARTS={
  FR:{code:'FR',name:'FR 63A 4P',modules:4,category:'OCHRONA',className:'device-fr wide',top:'L1 • L2 • L3 • N',brand:'ELX MAIN',brandClass:'red',type:'FR',rating:'63A',meta:'4P • 400V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L1 • L2 • L3 • N',kind:'fr'},
  FR40:{code:'FR40',name:'FR 40A 2P',modules:2,category:'OCHRONA',className:'device-fr medium',top:'L • N',brand:'ELX MAIN',brandClass:'red',type:'FR',rating:'40A',meta:'2P • 230V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L • N',kind:'fr'},
  FR100:{code:'FR100',name:'FR 100A 4P',modules:4,category:'OCHRONA',className:'device-fr wide',top:'L1 • L2 • L3 • N',brand:'ELX MAIN',brandClass:'red',type:'FR',rating:'100A',meta:'4P • 400V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L1 • L2 • L3 • N',kind:'fr'},
  RCD:{code:'RCD',name:'RCD 40A / 30mA',modules:2,category:'RCD',className:'device-rcd medium',top:'L • N',brand:'ELX RCD',brandClass:'blue',type:'RCD',rating:'40A',meta:'30mA • Typ A • 2P',fn:'OCHRONA RÓŻNICOWA',bottom:'L • N',kind:'rcd',test:'T'},
  B6:{code:'B6',name:'B6 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B6',rating:'6A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B10:{code:'B10',name:'B10 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B10',rating:'10A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B13:{code:'B13',name:'B13 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B13',rating:'13A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B16:{code:'B16',name:'B16 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B16',rating:'16A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B20:{code:'B20',name:'B20 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B20',rating:'20A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B25:{code:'B25',name:'B25 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'B25',rating:'25A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  C10:{code:'C10',name:'C10 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'C10',rating:'10A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C16:{code:'C16',name:'C16 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'C16',rating:'16A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C20:{code:'C20',name:'C20 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'C20',rating:'20A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C25:{code:'C25',name:'C25 1P',modules:1,category:'MCB',className:'',top:'1',brand:'ELX MCB',brandClass:'dark',type:'C25',rating:'25A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  RCBO:{code:'RCBO',name:'RCBO B16 / 30mA',modules:2,category:'RCD',className:'device-rcbo medium',top:'L • N',brand:'ELX RCBO',brandClass:'cyan',type:'RCBO',rating:'B16',meta:'30mA • 1P+N',fn:'MCB + RCD',bottom:'L • N',kind:'rcbo',test:'T',testClass:'yellow'},
  SPD:{code:'SPD',name:'SPD Typ 2',modules:2,category:'OCHRONA',className:'device-spd medium',top:'L • N',brand:'ELX SPD',brandClass:'orange',type:'SPD',rating:'T2',meta:'275V • 1P+N',fn:'PRZEPIĘCIA',bottom:'PE',kind:'spd',spd:true},
  NTB:{code:'NTB',name:'Listwa zaciskowa N',modules:2,category:'ZACISKI',className:'device-terminal device-terminal-n medium',top:'N1 • N2 • N3 • N4',brand:'ELX TERMINAL',brandClass:'blue',type:'N',rating:'8×N',meta:'LISTWA ZACISKOWA • 2M',fn:'ROZDZIAŁ NEUTRALNY N',bottom:'N5 • N6 • N7 • N8',kind:'terminal-n',passive:true},
  PETB:{code:'PETB',name:'Listwa zaciskowa PE',modules:2,category:'ZACISKI',className:'device-terminal device-terminal-pe medium',top:'PE1 • PE2 • PE3 • PE4',brand:'ELX TERMINAL',brandClass:'green',type:'PE',rating:'8×PE',meta:'LISTWA ZACISKOWA • 2M',fn:'ROZDZIAŁ OCHRONNY PE',bottom:'PE5 • PE6 • PE7 • PE8',kind:'terminal-pe',passive:true},
  NTB12:{code:'NTB12',name:'Listwa N kompakt 12',modules:1,category:'ZACISKI',className:'device-terminal device-terminal-n device-terminal-compact',top:'N1 • N2 • N3 • N4 • N5 • N6',brand:'ELX COMPACT',brandClass:'blue',type:'N',rating:'12×N',meta:'KOMPAKT • 1M',fn:'12 ZACISKÓW NEUTRALNYCH',bottom:'N7 • N8 • N9 • N10 • N11 • N12',kind:'terminal-n',passive:true,compact:true},
  PETB12:{code:'PETB12',name:'Listwa PE kompakt 12',modules:1,category:'ZACISKI',className:'device-terminal device-terminal-pe device-terminal-compact',top:'PE1 • PE2 • PE3 • PE4 • PE5 • PE6',brand:'ELX COMPACT',brandClass:'green',type:'PE',rating:'12×PE',meta:'KOMPAKT • 1M',fn:'12 ZACISKÓW OCHRONNYCH',bottom:'PE7 • PE8 • PE9 • PE10 • PE11 • PE12',kind:'terminal-pe',passive:true,compact:true}
}

const MODULES_PER_ROW=18;
let selected=null,rowCount=1,occupied=[],mounted=[],seq=1,errors=0;
let currentTask={id:1,rows:1,requirements:{FR:1,RCD:1,B10:1,B16:1}};

const dinZone=document.querySelector('.din-zone');
const oldRow=document.querySelector('.devices-row');
const oldRail=dinZone?.querySelector(':scope > .din-rail');
const cabinetInner=document.querySelector('.cabinet-inner');
if(!dinZone||!oldRow||!cabinetInner)return;
oldRow.innerHTML='';oldRow.style.display='none';
if(oldRail)oldRail.style.display='none';

const rowsHost=document.createElement('div');
rowsHost.className='din-rows-host';
dinZone.insertBefore(rowsHost,dinZone.querySelector('.bars'));

const hint=document.createElement('div');
hint.className='mount-hint';
hint.innerHTML='<span><b>MONTAŻ DIN:</b> wybierz aparat w katalogu, potem kliknij wolny moduł.</span><span class="selected-part">Brak wybranego aparatu</span>';
dinZone.appendChild(hint);

const activeTask=document.querySelector('.active-task');
if(activeTask){
  const toolbar=document.createElement('div');
  toolbar.className='stage2-toolbar';
  toolbar.innerHTML='<button id="undoMount">↩ COFNIJ APARAT</button><button id="resetMount" class="danger">⟳ WYCZYŚĆ ROZDZIELNICĘ</button>';
  activeTask.appendChild(toolbar);
  const complete=document.createElement('div');
  complete.className='task-complete';complete.id='taskComplete';
  complete.textContent='✓ Wymagane aparaty zostały zamontowane. Możesz przejść do okablowania i sprawdzenia instalacji.';
  activeTask.appendChild(complete);
}

const footerStats=document.querySelectorAll('.workspace-footer b');
const moduleStat=footerStats[0]||null,errorStat=footerStats[2]||null;

function totalModules(){return rowCount*MODULES_PER_ROW}
function usedModules(){return occupied.reduce((n,row)=>n+row.filter(Boolean).length,0)}
function apparatusHtml(p){
  return `<article class="device ${p.className}" data-kind="${p.kind}">
    <div class="device-topterm">${p.top}</div><div class="brand-strip ${p.brandClass}">${p.brand}</div>
    <div class="device-type">${p.type}</div><div class="device-rating">${p.rating}</div><div class="device-meta">${p.meta}</div><div class="device-function">${p.fn}</div>
    ${p.test?`<div class="test-btn ${p.testClass||''}">${p.test}</div>`:''}
    ${p.spd?'<div class="spd-window"><span>OK</span></div>':p.compact?'<div class="terminal-strip-visual compact"><span></span><span></span><span></span><span></span><span></span><span></span></div>':p.passive?'<div class="terminal-strip-visual"><span></span><span></span><span></span><span></span></div>':'<div class="lever '+(p.kind==='fr'?'redlever':'')+'"><span>I</span><span>O</span></div>'}
    <div class="device-bottomterm">${p.bottom}</div>
  </article>`;
}
function setHint(text,state=''){
  hint.className='mount-hint'+(state?' '+state:'');
  hint.querySelector('span:first-child').innerHTML=text;
  if(state)setTimeout(()=>hint.className='mount-hint',900);
}
function updateStats(){
  if(moduleStat){
    moduleStat.textContent=`${usedModules()} / ${totalModules()}`;
    moduleStat.className='module-progress '+(usedModules()===totalModules()?'full':usedModules()>totalModules()*.78?'warn':'ok');
  }
  if(errorStat)errorStat.textContent=errors;
  updateGoals();
}
function renderRows(count){
  rowCount=Math.max(1,Math.min(3,Number(count)||1));
  rowsHost.innerHTML='';
  occupied=Array.from({length:rowCount},()=>Array(MODULES_PER_ROW).fill(null));
  mounted=[];seq=1;

  for(let r=0;r<rowCount;r++){
    const row=document.createElement('div');
    row.className='din-row';row.dataset.row=r;
    row.innerHTML=`<div class="din-row-label"><span>LISTWA DIN ${r+1}</span><b>${r*18+1}–${r*18+18}</b></div><div class="din-rail"></div>`;
    const grid=document.createElement('div');grid.className='mount-grid';grid.dataset.row=r;
    for(let i=0;i<MODULES_PER_ROW;i++){
      const s=document.createElement('div');s.className='din-slot';s.dataset.row=r;s.dataset.slot=i;s.dataset.label=i+1;grid.appendChild(s);
    }
    row.appendChild(grid);rowsHost.appendChild(row);
  }

  const innerHeight=620+(rowCount-1)*230;
  cabinetInner.style.height=innerHeight+'px';
  cabinetInner.dataset.rows=String(rowCount);
  dinZone.style.height=(rowCount*215+52)+'px';
  hint.style.top=(rowCount*215+8)+'px';

  const subtitle=document.querySelector('.cabinet-head small');
  if(subtitle)subtitle.textContent=`230/400 V • 3F + N + PE • ${totalModules()} modułów`;

  window.ElektrykStage3?.clear?.();
  window.ElektrykBridges?.clear?.();
  document.dispatchEvent(new CustomEvent('elektryk:rails-changed',{detail:{rows:rowCount,totalModules:totalModules()}}));
  updateStats();
}
function canPlace(row,start,p){
  if(row<0||row>=rowCount||start<0||start+p.modules>MODULES_PER_ROW)return false;
  for(let i=start;i<start+p.modules;i++)if(occupied[row][i])return false;
  return true;
}
function clearPreview(){rowsHost.querySelectorAll('.din-slot').forEach(s=>s.classList.remove('preview-ok','preview-bad'))}
function preview(row,start){
  clearPreview();if(!selected)return;
  const p=PARTS[selected],ok=canPlace(row,start,p);
  const grid=rowsHost.querySelector(`.mount-grid[data-row="${row}"]`);
  if(!grid)return;
  for(let i=start;i<Math.min(MODULES_PER_ROW,start+p.modules);i++)grid.children[i]?.classList.add(ok?'preview-ok':'preview-bad');
}
function mount(row,start){
  if(!selected){setHint('<b>MONTAŻ DIN:</b> najpierw wybierz aparat w katalogu.','error');return}
  const p=PARTS[selected];
  if(!canPlace(row,start,p)){
    errors++;updateStats();
    setHint(`<b>BŁĄD:</b> ${p.name} potrzebuje ${p.modules} wolnych modułów obok siebie na tej samej listwie.`,'error');
    return;
  }
  const grid=rowsHost.querySelector(`.mount-grid[data-row="${row}"]`);
  const id='M'+seq++;
  for(let i=start;i<start+p.modules;i++){occupied[row][i]=id;grid.children[i].classList.add('occupied')}
  const wrap=document.createElement('div');
  wrap.className='mounted-device';wrap.dataset.mountId=id;wrap.dataset.code=p.code;wrap.dataset.row=row;
  wrap.style.left=`${start/MODULES_PER_ROW*100}%`;wrap.style.width=`${p.modules/MODULES_PER_ROW*100}%`;
  wrap.innerHTML=`<button class="remove-device" title="Usuń aparat">×</button>${apparatusHtml(p)}`;
  grid.appendChild(wrap);
  mounted.push({id,code:p.code,row,start,modules:p.modules,el:wrap});
  wrap.querySelector('.remove-device').onclick=e=>{e.stopPropagation();removeMount(id)};
  wrap.onclick=e=>{e.stopPropagation();rowsHost.querySelectorAll('.mounted-device').forEach(x=>x.classList.remove('selected-mounted'));wrap.classList.add('selected-mounted')};
  updateStats();
  setHint(`<b>ZAMONTOWANO:</b> ${p.name} • listwa ${row+1}, moduły ${start+1}–${start+p.modules}`,'success');
}
function removeMount(id){
  const m=mounted.find(x=>x.id===id);if(!m)return;
  const grid=rowsHost.querySelector(`.mount-grid[data-row="${m.row}"]`);
  for(let i=m.start;i<m.start+m.modules;i++){occupied[m.row][i]=null;grid?.children[i]?.classList.remove('occupied')}
  m.el.remove();mounted=mounted.filter(x=>x.id!==id);updateStats();
  setHint(`<b>USUNIĘTO:</b> ${m.code} z listwy ${m.row+1}.`);
}
function resetAll(){
  mounted.slice().forEach(m=>m.el.remove());mounted=[];seq=1;
  occupied=Array.from({length:rowCount},()=>Array(MODULES_PER_ROW).fill(null));
  rowsHost.querySelectorAll('.din-slot').forEach(s=>s.classList.remove('occupied','preview-ok','preview-bad'));
  errors=0;window.ElektrykStage3?.clear?.();window.ElektrykBridges?.clear?.();updateStats();
  setHint('<b>MONTAŻ DIN:</b> rozdzielnica została wyczyszczona.');
}
function selectPart(code,card){
  selected=code;document.querySelectorAll('.catalog-card').forEach(x=>x.classList.remove('install-selected'));card.classList.add('install-selected');
  hint.querySelector('.selected-part').textContent=`Wybrano: ${PARTS[code].name} • ${PARTS[code].modules}M`;
  setHint(`<b>GOTOWY DO MONTAŻU:</b> kliknij pierwszy wolny moduł dla ${PARTS[code].name}.`);
}
function inferCode(card){
  const explicit=(card.dataset.part||'').trim().toUpperCase();
  if(explicit&&PARTS[explicit])return explicit;
  const t=(card.querySelector('.mini-device strong')?.textContent||'').trim().toUpperCase();
  return PARTS[t]?t:null;
}
function countMounted(){
  const counts={};Object.keys(PARTS).forEach(k=>counts[k]=0);
  mounted.forEach(m=>counts[m.code]=(counts[m.code]||0)+1);return counts;
}
function requirementLabel(code){return PARTS[code]?.name||code}
function updateGoals(){
  const counts=countMounted(),req=currentTask?.requirements||{};
  const goals=document.querySelector('.task-goals');if(!goals)return;
  goals.querySelectorAll('[data-req]').forEach(el=>{
    const code=el.dataset.req,need=Number(req[code]||0),have=counts[code]||0,done=have>=need;
    el.classList.toggle('done',done);el.classList.toggle('pending',!done);
    el.innerHTML=`${done?'✓':'○'} ${requirementLabel(code)} <b>${Math.min(have,need)}/${need}</b>`;
  });
  const done=Object.entries(req).every(([code,n])=>(counts[code]||0)>=n);
  document.getElementById('taskComplete')?.classList.toggle('show',done);
  const stars=document.querySelector('.reward em');if(stars)stars.textContent=done?'★★★':'☆☆☆';
}
function renderTaskGoals(task){
  const goals=document.querySelector('.task-goals');if(!goals)return;
  goals.innerHTML='';
  Object.entries(task.requirements||{}).forEach(([code,n])=>{
    const s=document.createElement('span');s.dataset.req=code;s.className='pending';
    s.innerHTML=`○ ${requirementLabel(code)} <b>0/${n}</b>`;goals.appendChild(s);
  });
}
function configureTask(task){
  if(!task)return;
  currentTask=task;selected=null;errors=0;
  document.querySelectorAll('.catalog-card').forEach(x=>x.classList.remove('install-selected'));
  const title=document.querySelector('.active-task h2'),desc=document.querySelector('.active-task p');
  const reward=document.querySelector('.reward b');
  if(title)title.textContent=task.title;
  if(desc)desc.textContent=task.description;
  if(reward)reward.textContent=`${task.xp} XP`;
  renderTaskGoals(task);
  renderRows(task.rows);
  hint.querySelector('.selected-part').textContent='Brak wybranego aparatu';
  setHint(`<b>ZADANIE ${String(task.id).padStart(2,'0')}:</b> ${task.title} • ${task.rows} ${task.rows===1?'listwa':'listwy'} DIN.`,'success');
  updateGoals();
}

document.querySelectorAll('.catalog-card').forEach(card=>{
  const code=inferCode(card);if(!code)return;
  card.dataset.part=code;card.dataset.category=PARTS[code].category;
  card.addEventListener('click',()=>selectPart(code,card));
});
rowsHost.addEventListener('mousemove',e=>{const slot=e.target.closest('.din-slot');if(slot)preview(+slot.dataset.row,+slot.dataset.slot)});
rowsHost.addEventListener('mouseleave',clearPreview);
rowsHost.addEventListener('click',e=>{const slot=e.target.closest('.din-slot');if(slot)mount(+slot.dataset.row,+slot.dataset.slot)});

document.getElementById('undoMount')?.addEventListener('click',()=>{const m=mounted[mounted.length-1];if(m)removeMount(m.id)});
document.getElementById('resetMount')?.addEventListener('click',resetAll);

[...document.querySelectorAll('.category-tabs button')].forEach(btn=>btn.addEventListener('click',()=>{
  const txt=btn.textContent.trim().toUpperCase();
  document.querySelectorAll('.catalog-card').forEach(card=>{
    let show=true;
    if(txt==='MCB')show=card.dataset.category==='MCB';
    else if(txt.includes('RCD'))show=card.dataset.category==='RCD';
    else if(txt==='OCHRONA')show=card.dataset.category==='OCHRONA';
    else if(txt==='ZACISKI')show=card.dataset.category==='ZACISKI';
    card.classList.toggle('hidden-by-filter',!show);
  });
}));

renderRows(1);
renderTaskGoals(currentTask);updateStats();

window.ElektrykStage2={
  configureTask,
  reset:resetAll,
  getMounted:()=>mounted.map(({id,code,row,start,modules})=>({id,code,row,start,modules})),
  getTask:()=>currentTask,
  getRows:()=>rowCount,
  getTotalModules:totalModules,
  parts:PARTS
};
})();