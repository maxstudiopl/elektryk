(()=>{

const PARTS={
  FR:{code:'FR',name:'FR 63A 4P',modules:4,category:'OCHRONA',className:'device-fr wide',top:'L1 • L2 • L3 • N',brand:'XYZ',brandClass:'red',type:'FR',rating:'63A',meta:'4P • 400V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L1 • L2 • L3 • N',kind:'fr'},
  FR40:{code:'FR40',name:'FR 40A 2P',modules:2,category:'OCHRONA',className:'device-fr medium',top:'L • N',brand:'XYZ',brandClass:'red',type:'FR',rating:'40A',meta:'2P • 230V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L • N',kind:'fr'},
  FR100:{code:'FR100',name:'FR 100A 4P',modules:4,category:'OCHRONA',className:'device-fr wide',top:'L1 • L2 • L3 • N',brand:'XYZ',brandClass:'red',type:'FR',rating:'100A',meta:'4P • 400V',fn:'ROZŁĄCZNIK GŁÓWNY',bottom:'L1 • L2 • L3 • N',kind:'fr'},
  RCD:{code:'RCD',name:'RCD 40A / 30mA',modules:2,category:'RCD',className:'device-rcd medium',top:'L • N',brand:'XYZ',brandClass:'blue',type:'RCD',rating:'40A',meta:'30mA • Typ A • 2P',fn:'OCHRONA RÓŻNICOWA',bottom:'L • N',kind:'rcd',test:'T'},
  RCD4:{code:'RCD4',name:'RCD 40A / 30mA 4P',modules:4,category:'RCD',className:'device-rcd device-rcd-4p wide',top:'L1 • L2 • L3 • N',brand:'XYZ',brandClass:'blue',type:'RCD',rating:'40A',meta:'30mA • Typ A • 4P',fn:'OCHRONA RÓŻNICOWA',bottom:'L1 • L2 • L3 • N',kind:'rcd',test:'T'},
  B6:{code:'B6',name:'B6 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B6',rating:'6A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B10:{code:'B10',name:'B10 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B10',rating:'10A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B13:{code:'B13',name:'B13 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B13',rating:'13A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B16:{code:'B16',name:'B16 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B16',rating:'16A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B20:{code:'B20',name:'B20 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B20',rating:'20A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  B25:{code:'B25',name:'B25 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'B25',rating:'25A',meta:'1P • 230V',fn:'MCB • CHAR. B',bottom:'2',kind:'mcb'},
  C10:{code:'C10',name:'C10 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'C10',rating:'10A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C16:{code:'C16',name:'C16 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'C16',rating:'16A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C20:{code:'C20',name:'C20 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'C20',rating:'20A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  C25:{code:'C25',name:'C25 1P',modules:1,category:'MCB',className:'',top:'1',brand:'XYZ',brandClass:'dark',type:'C25',rating:'25A',meta:'1P • 230V',fn:'MCB • CHAR. C',bottom:'2',kind:'mcb'},
  B6_2P:{code:'B6_2P',name:'B6 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B6',rating:'6A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B6_3P:{code:'B6_3P',name:'B6 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B6',rating:'6A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  B10_2P:{code:'B10_2P',name:'B10 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B10',rating:'10A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B10_3P:{code:'B10_3P',name:'B10 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B10',rating:'10A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  B13_2P:{code:'B13_2P',name:'B13 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B13',rating:'13A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B13_3P:{code:'B13_3P',name:'B13 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B13',rating:'13A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  B16_2P:{code:'B16_2P',name:'B16 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B16',rating:'16A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B16_3P:{code:'B16_3P',name:'B16 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B16',rating:'16A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  B20_2P:{code:'B20_2P',name:'B20 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B20',rating:'20A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B20_3P:{code:'B20_3P',name:'B20 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B20',rating:'20A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  B25_2P:{code:'B25_2P',name:'B25 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'B25',rating:'25A',meta:'2P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4',kind:'mcb'},
  B25_3P:{code:'B25_3P',name:'B25 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'B25',rating:'25A',meta:'3P • 400V',fn:'MCB • CHAR. B',bottom:'2 • 4 • 6',kind:'mcb'},
  C10_2P:{code:'C10_2P',name:'C10 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'C10',rating:'10A',meta:'2P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4',kind:'mcb'},
  C10_3P:{code:'C10_3P',name:'C10 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'C10',rating:'10A',meta:'3P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4 • 6',kind:'mcb'},
  C16_2P:{code:'C16_2P',name:'C16 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'C16',rating:'16A',meta:'2P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4',kind:'mcb'},
  C16_3P:{code:'C16_3P',name:'C16 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'C16',rating:'16A',meta:'3P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4 • 6',kind:'mcb'},
  C20_2P:{code:'C20_2P',name:'C20 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'C20',rating:'20A',meta:'2P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4',kind:'mcb'},
  C20_3P:{code:'C20_3P',name:'C20 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'C20',rating:'20A',meta:'3P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4 • 6',kind:'mcb'},
  C25_2P:{code:'C25_2P',name:'C25 2P',modules:2,category:'MCB',className:'device-mcb-2p',top:'1 • 3',brand:'XYZ',brandClass:'dark',type:'C25',rating:'25A',meta:'2P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4',kind:'mcb'},
  C25_3P:{code:'C25_3P',name:'C25 3P',modules:3,category:'MCB',className:'device-mcb-3p',top:'1 • 3 • 5',brand:'XYZ',brandClass:'dark',type:'C25',rating:'25A',meta:'3P • 400V',fn:'MCB • CHAR. C',bottom:'2 • 4 • 6',kind:'mcb'},
  RCBO:{code:'RCBO',name:'RCBO B16 / 30mA',modules:2,category:'RCD',className:'device-rcbo medium',top:'L • N',brand:'XYZ',brandClass:'cyan',type:'RCBO',rating:'B16',meta:'30mA • 1P+N',fn:'MCB + RCD',bottom:'L • N',kind:'rcbo',test:'T',testClass:'yellow'},
  RCBO10:{code:'RCBO10',name:'RCBO B10 / 30mA',modules:2,category:'RCD',className:'device-rcbo medium',top:'L • N',brand:'XYZ',brandClass:'cyan',type:'RCBO',rating:'B10',meta:'30mA • 1P+N',fn:'MCB + RCD',bottom:'L • N',kind:'rcbo',test:'T',testClass:'yellow'},
  RCBO20:{code:'RCBO20',name:'RCBO B20 / 30mA',modules:2,category:'RCD',className:'device-rcbo medium',top:'L • N',brand:'XYZ',brandClass:'cyan',type:'RCBO',rating:'B20',meta:'30mA • 1P+N',fn:'MCB + RCD',bottom:'L • N',kind:'rcbo',test:'T',testClass:'yellow'},
  SPD:{code:'SPD',name:'SPD Typ 2',modules:2,category:'OCHRONA',className:'device-spd medium',top:'L • N',brand:'XYZ',brandClass:'orange',type:'SPD',rating:'T2',meta:'275V • 1P+N',fn:'PRZEPIĘCIA',bottom:'PE',kind:'spd',spd:true},
  SPD4:{code:'SPD4',name:'SPD Typ 2 3P+N',modules:4,category:'OCHRONA',className:'device-spd device-spd-4p wide',top:'L1 • L2 • L3 • N',brand:'XYZ',brandClass:'orange',type:'SPD',rating:'T2',meta:'275V • 3P+N',fn:'OCHRONA PRZEPIĘCIOWA',bottom:'PE',kind:'spd',spd:true},
  NTB:{code:'NTB',name:'Listwa zaciskowa N',modules:2,category:'ZACISKI',className:'device-terminal device-terminal-n medium',top:'N1 • N2 • N3 • N4',brand:'XYZ',brandClass:'blue',type:'N',rating:'8×N',meta:'LISTWA ZACISKOWA • 2M',fn:'ROZDZIAŁ NEUTRALNY N',bottom:'N5 • N6 • N7 • N8',kind:'terminal-n',passive:true},
  PETB:{code:'PETB',name:'Listwa zaciskowa PE',modules:2,category:'ZACISKI',className:'device-terminal device-terminal-pe medium',top:'PE1 • PE2 • PE3 • PE4',brand:'XYZ',brandClass:'green',type:'PE',rating:'8×PE',meta:'LISTWA ZACISKOWA • 2M',fn:'ROZDZIAŁ OCHRONNY PE',bottom:'PE5 • PE6 • PE7 • PE8',kind:'terminal-pe',passive:true},
  NTB12:{code:'NTB12',name:'Listwa N kompakt 12',modules:1,category:'ZACISKI',className:'device-terminal device-terminal-n device-terminal-compact',top:'N1 • N2 • N3 • N4 • N5 • N6',brand:'XYZ',brandClass:'blue',type:'N',rating:'12×N',meta:'KOMPAKT • 1M',fn:'12 ZACISKÓW NEUTRALNYCH',bottom:'N7 • N8 • N9 • N10 • N11 • N12',kind:'terminal-n',passive:true,compact:true},
  PETB12:{code:'PETB12',name:'Listwa PE kompakt 12',modules:1,category:'ZACISKI',className:'device-terminal device-terminal-pe device-terminal-compact',top:'PE1 • PE2 • PE3 • PE4 • PE5 • PE6',brand:'XYZ',brandClass:'green',type:'PE',rating:'12×PE',meta:'KOMPAKT • 1M',fn:'12 ZACISKÓW OCHRONNYCH',bottom:'PE7 • PE8 • PE9 • PE10 • PE11 • PE12',kind:'terminal-pe',passive:true,compact:true}
}

let modulesPerRow=18;
const ROW_PITCH=252;
const DIN_ZONE_EXTRA=96;
let selected=null,rowCount=1,occupied=[],mounted=[],seq=1,errors=0;
let currentTask={id:1,rows:1,requirements:{FR:1,RCD:1,B10:1,B16:1}};

const dinZone=document.querySelector('.din-zone');
const oldRow=document.querySelector('.devices-row');
const oldRail=dinZone?.querySelector(':scope > .din-rail');
const cabinetInner=document.querySelector('.cabinet-inner');
const cabinet=document.querySelector('.cabinet');
if(!dinZone||!oldRow||!cabinetInner||!cabinet)return;
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
  complete.textContent='✓ Wymagane aparaty zamontowane. Porównaj ich rozmieszczenie ze schematem, a następnie wykonaj i sprawdź połączenia.';
  activeTask.appendChild(complete);
}

const footerStats=document.querySelectorAll('.workspace-footer b');
const moduleStat=footerStats[0]||null,errorStat=footerStats[2]||null;

let enclosureRealism=cabinetInner.querySelector(':scope > .enclosure-realism');
if(!enclosureRealism){
  enclosureRealism=document.createElement('div');
  enclosureRealism.className='enclosure-realism';
  enclosureRealism.innerHTML='<i class="case-screw tl"></i><i class="case-screw tr"></i><i class="case-screw bl"></i><i class="case-screw br"></i><span class="case-marking">XYZ • MODULAR ENCLOSURE</span>';
  cabinetInner.prepend(enclosureRealism);
}

function totalModules(){return rowCount*modulesPerRow}
function usedModules(){return occupied.reduce((n,row)=>n+row.filter(Boolean).length,0)}
function taskEnclosureProfile(rows){
  return Number(rows)>=3?'training-18-tall':'training-18';
}
function applyEnclosureProfile(template={}){
  const profile=template.enclosureProfile||taskEnclosureProfile(template.rows||rowCount);
  const mounting=template.mounting||'training';
  const family=template.family||'training';
  const boardId=template.id||'TRAINING-TASK';
  [cabinet,cabinetInner].forEach(el=>{
    el.dataset.enclosureProfile=profile;
    el.dataset.mounting=mounting;
    el.dataset.family=family;
    el.dataset.boardId=boardId;
  });
  const look=template.enclosureLook||{};
  cabinetInner.dataset.shell=look.shell||family;
  cabinetInner.dataset.door=look.door||'none';
  cabinetInner.dataset.depth=look.depth||'standard';
  cabinetInner.dataset.rowSpacing=look.rowSpacing||'training';
  const mark=enclosureRealism.querySelector('.case-marking');
  if(mark){
    const rows=Number(template.rows||rowCount)||1;
    const perRow=Number(template.modulesPerRow||modulesPerRow)||18;
    mark.textContent='XYZ • '+rows+'×'+perRow+'M • '+String(mounting).replaceAll('_',' ').toUpperCase();
  }
}
function apparatusHtml(p){
  return `<article class="device ${p.className}" data-kind="${p.kind}">
    <div class="device-topterm">${p.top}</div><div class="brand-strip ${p.brandClass}">${p.brand}</div>
    <div class="device-type">${p.type}</div><div class="device-rating">${p.rating}</div><div class="device-meta">${p.meta}</div><div class="device-function">${p.fn}</div>
    ${p.test?`<div class="test-btn ${p.testClass||''}">${p.test}</div>`:''}
    ${p.spd?'<div class="spd-window"><span>OK</span></div>':p.compact?'<div class="terminal-strip-visual compact"><span></span><span></span><span></span><span></span><span></span><span></span></div>':p.passive?'<div class="terminal-strip-visual"><span></span><span></span><span></span><span></span></div>':'<div class="lever '+(p.kind==='fr'?'redlever':'')+'"><span>1</span><span>0</span></div>'}
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
function renderRows(count,perRow=modulesPerRow){
  rowCount=Math.max(1,Math.min(5,Number(count)||1));
  modulesPerRow=Math.max(6,Math.min(24,Number(perRow)||18));
  rowsHost.innerHTML='';
  occupied=Array.from({length:rowCount},()=>Array(modulesPerRow).fill(null));
  mounted=[];seq=1;
  rowsHost.style.setProperty('--modules-per-row',String(modulesPerRow));
  cabinetInner.dataset.modulesPerRow=String(modulesPerRow);

  for(let r=0;r<rowCount;r++){
    const row=document.createElement('div');
    row.className='din-row';row.dataset.row=r;
    row.innerHTML=`<div class="din-row-label"><span>LISTWA DIN ${r+1}</span><b>${r*modulesPerRow+1}–${r*modulesPerRow+modulesPerRow}</b></div><div class="din-rail"></div>`;
    const grid=document.createElement('div');grid.className='mount-grid';grid.dataset.row=r;
    for(let i=0;i<modulesPerRow;i++){
      const s=document.createElement('div');s.className='din-slot';s.dataset.row=r;s.dataset.slot=i;s.dataset.label=i+1;grid.appendChild(s);
    }
    row.appendChild(grid);rowsHost.appendChild(row);
  }

  const innerHeight=700+(rowCount-1)*270;
  cabinetInner.style.height=innerHeight+'px';
  cabinetInner.dataset.rows=String(rowCount);
  cabinet.dataset.rows=String(rowCount);
  cabinet.dataset.modulesPerRow=String(modulesPerRow);
  dinZone.style.height=(rowCount*ROW_PITCH+DIN_ZONE_EXTRA)+'px';
  hint.style.top=(rowCount*ROW_PITCH+48)+'px';

  const subtitle=document.querySelector('.cabinet-head small');
  if(subtitle)subtitle.textContent=`230/400 V • 3F + N + PE • ${totalModules()} modułów`;

  window.ElektrykStage3?.clear?.();
  window.ElektrykBridges?.clear?.();
  document.dispatchEvent(new CustomEvent('elektryk:rails-changed',{detail:{rows:rowCount,modulesPerRow,totalModules:totalModules()}}));
  updateStats();
}
function canPlace(row,start,p){
  if(row<0||row>=rowCount||start<0||start+p.modules>modulesPerRow)return false;
  for(let i=start;i<start+p.modules;i++)if(occupied[row][i])return false;
  return true;
}
function clearPreview(){rowsHost.querySelectorAll('.din-slot').forEach(s=>s.classList.remove('preview-ok','preview-bad'))}
function preview(row,start){
  clearPreview();if(!selected)return;
  const p=PARTS[selected],ok=canPlace(row,start,p);
  const grid=rowsHost.querySelector(`.mount-grid[data-row="${row}"]`);
  if(!grid)return;
  for(let i=start;i<Math.min(modulesPerRow,start+p.modules);i++)grid.children[i]?.classList.add(ok?'preview-ok':'preview-bad');
}
function placePart(code,row,start,idOverride=null,quiet=false){
  const p=PARTS[code];
  if(!p)return false;
  if(!canPlace(row,start,p)){
    if(!quiet){
      errors++;updateStats();
      setHint(`<b>BŁĄD:</b> ${p.name} potrzebuje ${p.modules} wolnych modułów obok siebie na tej samej listwie.`,'error');
    }
    return false;
  }
  const grid=rowsHost.querySelector(`.mount-grid[data-row="${row}"]`);
  if(!grid)return false;
  const id=idOverride||('M'+seq++);
  if(idOverride){
    const n=Number(String(idOverride).replace(/\D/g,''))||0;
    seq=Math.max(seq,n+1);
  }
  for(let i=start;i<start+p.modules;i++){occupied[row][i]=id;grid.children[i].classList.add('occupied')}
  const wrap=document.createElement('div');
  wrap.className='mounted-device';wrap.dataset.mountId=id;wrap.dataset.code=p.code;wrap.dataset.row=row;wrap.dataset.modules=String(p.modules);wrap.dataset.deviceLabel=p.name;
  wrap.style.left=`${start/modulesPerRow*100}%`;wrap.style.width=`${p.modules/modulesPerRow*100}%`;
  wrap.innerHTML=`<button class="remove-device" title="Usuń aparat">×</button>${apparatusHtml(p)}`;
  grid.appendChild(wrap);
  mounted.push({id,code:p.code,row,start,modules:p.modules,el:wrap});
  wrap.querySelector('.remove-device').onclick=e=>{e.stopPropagation();removeMount(id)};
  wrap.onclick=e=>{e.stopPropagation();rowsHost.querySelectorAll('.mounted-device').forEach(x=>x.classList.remove('selected-mounted'));wrap.classList.add('selected-mounted')};
  if(!quiet){
    updateStats();
    setHint(`<b>ZAMONTOWANO:</b> ${p.name} • listwa ${row+1}, moduły ${start+1}–${start+p.modules}`,'success');
    // Assembly PRO: wyłącznie sygnał do animacji wizualnej.
    // Odtwarzanie zapisów (quiet=true) nie wywołuje animacji.
    document.dispatchEvent(new CustomEvent('elektryk:apparatus-mounted',{
      detail:{element:wrap,id,code:p.code,row,start,modules:p.modules}
    }));
  }
  return wrap;
}
function mount(row,start){
  if(!selected){setHint('<b>MONTAŻ DIN:</b> najpierw wybierz aparat w katalogu.','error');return}
  placePart(selected,row,start);
}
function restoreMounted(records=[]){
  mounted.slice().forEach(m=>m.el.remove());
  mounted=[];seq=1;
  occupied=Array.from({length:rowCount},()=>Array(modulesPerRow).fill(null));
  rowsHost.querySelectorAll('.din-slot').forEach(s=>s.classList.remove('occupied','preview-ok','preview-bad'));
  const restored=[];
  [...records].sort((a,b)=>(Number(a.row)-Number(b.row))||(Number(a.start)-Number(b.start))).forEach(rec=>{
    const wrap=placePart(String(rec.code||''),Number(rec.row)||0,Number(rec.start)||0,String(rec.id||'' )||null,true);
    if(wrap){
      if(rec.switchState)wrap.dataset.switchState=rec.switchState;
      restored.push(rec.id);
    }
  });
  updateStats();
  requestAnimationFrame(()=>{
    window.ElektrykStage3?.refreshMounted?.();
  });
  return restored.length;
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
  occupied=Array.from({length:rowCount},()=>Array(modulesPerRow).fill(null));
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
  const isFree=String(currentTask?.id||'')==='FREE';
  const done=!isFree&&Object.entries(req).every(([code,n])=>(counts[code]||0)>=n);
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
  const rewardBox=document.querySelector('.reward'),reward=rewardBox?.querySelector('b');
  if(title)title.textContent=task.title;
  if(desc)desc.textContent=task.description;
  const cabinetTitle=document.querySelector('.cabinet-head b');
  if(cabinetTitle)cabinetTitle.textContent='ROZDZIELNICA TRENINGOWA';
  if(rewardBox)rewardBox.style.display='';
  if(reward)reward.textContent=`${task.xp} XP`;
  const model=task.boardId&&task.boardId!=='TRAINING-TASK'?window.ElektrykSwitchboardDB?.get?.(task.boardId):null;
  const cols=Number(task.modulesPerRow||model?.modulesPerRow||18);
  applyEnclosureProfile(model||{
    id:'TRAINING-TASK',family:'training',mounting:'training',rows:task.rows,modulesPerRow:cols,
    enclosureProfile:taskEnclosureProfile(task.rows),enclosureLook:{shell:'training',door:'none',depth:'standard',rowSpacing:'training'}
  });
  renderTaskGoals(task);
  renderRows(task.rows,cols);
  hint.querySelector('.selected-part').textContent='Brak wybranego aparatu';
  setHint(`<b>ZADANIE ${String(task.id).padStart(2,'0')}:</b> ${task.title} • ${task.rows}×${cols}M DIN.`,'success');
  updateGoals();
}


function ensureMcbVariantCards(){
  const grid=document.querySelector('.catalog-grid');if(!grid)return;
  Object.values(PARTS).filter(p=>p.kind==='mcb'&&p.modules>1).forEach(p=>{
    if(grid.querySelector(`[data-part="${p.code}"]`))return;
    const card=document.createElement('button');
    card.className='catalog-card xyz-variant-card';
    card.dataset.part=p.code;
    card.dataset.name=`Wyłącznik nadprądowy ${p.name}`;
    card.dataset.spec=`${p.type} • ${p.rating} • ${p.meta}`;
    card.dataset.desc=`Wyłącznik nadprądowy marki XYZ, ${p.modules}-polowy.`;
    card.innerHTML=`<span class="mini-device mini-mcb-${p.modules}p"><strong>${p.type}</strong><em>${p.rating} • ${p.modules}P</em><i></i></span><b>${p.name}</b><small>XYZ • MCB • ${p.modules}P</small>`;
    grid.appendChild(card);
  });
}
function ensureXyzProtectionCards(){
  const grid=document.querySelector('.catalog-grid');if(!grid)return;
  ['RCD4','RCBO10','RCBO20','SPD4'].forEach(code=>{
    const p=PARTS[code];
    if(!p||grid.querySelector(`[data-part="${code}"]`))return;
    const card=document.createElement('button');
    card.className='catalog-card xyz-variant-card xyz-protection-card';
    card.dataset.part=code;
    card.dataset.name=p.name;
    card.dataset.spec=`${p.type} • ${p.rating} • ${p.meta}`;
    card.dataset.desc=`Aparat modułowy serii XYZ do symulatora rozdzielnic.`;
    const miniClass=p.kind==='spd'?'mini-spd':p.kind==='rcd'?'mini-rcd':'mini-rcbo';
    card.innerHTML=`<span class="mini-device ${miniClass} mini-${p.modules}p"><strong>${p.type}</strong><em>${p.rating}</em><i></i></span><b>${p.name}</b><small>XYZ • ${p.meta}</small>`;
    grid.appendChild(card);
  });
}
ensureMcbVariantCards();
ensureXyzProtectionCards();

function configureBoard(template){
  if(!template||!template.rows||!template.modulesPerRow)return false;
  selected=null;errors=0;
  currentTask={
    id:'FREE',
    title:template.name||'Wolna budowa',
    rows:Number(template.rows),
    modulesPerRow:Number(template.modulesPerRow),
    requirements:{}
  };
  document.querySelectorAll('.catalog-card').forEach(x=>x.classList.remove('install-selected'));
  const title=document.querySelector('.active-task h2');
  const desc=document.querySelector('.active-task p');
  const reward=document.querySelector('.reward');
  const goals=document.querySelector('.task-goals');
  if(title)title.textContent=template.name||'Wolna budowa';
  if(desc)desc.textContent='Tryb nauki bez narzuconego zadania. Samodzielnie dobierz aparaturę, rozmieść ją i wykonaj połączenia.';
  const cabinetTitle=document.querySelector('.cabinet-head b');
  if(cabinetTitle)cabinetTitle.textContent=String(template.name||'ROZDZIELNICA').toUpperCase();
  if(reward)reward.style.display='none';
  if(goals){goals.innerHTML='<span>WOLNA BUDOWA • brak wymaganej listy aparatów</span>'}
  document.getElementById('taskComplete')?.classList.remove('show');
  applyEnclosureProfile(template);
  renderRows(template.rows,template.modulesPerRow);
  hint.querySelector('.selected-part').textContent='Brak wybranego aparatu';
  setHint(`<b>WOLNA BUDOWA:</b> ${template.name} • ${template.rows}×${template.modulesPerRow}M.`,'success');
  const version=document.querySelector('.cabinet-head .version');
  if(version)version.textContent=`v0.7.12 • ${template.rows}×${template.modulesPerRow}M • ${String(template.mounting||'modułowa').toUpperCase()}`;
  document.dispatchEvent(new CustomEvent('elektryk:board-changed',{detail:{template:{...template}}}));
  return true;
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
  getMounted:()=>mounted.map(({id,code,row,start,modules,el})=>({id,code,row,start,modules,switchState:el?.dataset.switchState||'on'})),
  restoreMounted,
  getTask:()=>currentTask,
  getRows:()=>rowCount,
  getModulesPerRow:()=>modulesPerRow,
  getTotalModules:totalModules,
  getBoardConfig:()=>({
    boardId:cabinetInner.dataset.boardId||'',
    rows:rowCount,
    modulesPerRow,
    totalModules:totalModules(),
    enclosureProfile:cabinetInner.dataset.enclosureProfile||'',
    mounting:cabinetInner.dataset.mounting||'',
    family:cabinetInner.dataset.family||''
  }),
  configureBoard,
  parts:PARTS
};
})();