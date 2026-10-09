(()=>{
const cabinet=document.querySelector('.cabinet');
const inner=document.querySelector('.cabinet-inner');
if(!cabinet||!inner)return;

const PROFILES={
  'TRAINING-18':{profile:'training-18',mounting:'training',family:'training'},
  'TRAINING-TASK':{profile:'training-18',mounting:'training',family:'training'},
  'REF-3X12-FLUSH-SURFACE':{profile:'residential-3x12-flush',mounting:'flush_or_surface',family:'residential'},
  'REF-3X12-SURFACE':{profile:'residential-3x12-surface',mounting:'surface',family:'residential'},
  'REF-5X12':{profile:'residential-5x12',mounting:'unknown',family:'large_residential'},
  'REF-5X24':{profile:'residential-5x24-xl',mounting:'unknown',family:'large_residential'}
};

function ensureHardware(){
  let decor=inner.querySelector(':scope > .enclosure-realism');
  if(decor)return decor;
  decor=document.createElement('div');
  decor.className='enclosure-realism';
  decor.innerHTML='<i class="case-screw tl"></i><i class="case-screw tr"></i><i class="case-screw bl"></i><i class="case-screw br"></i><span class="case-marking">XYZ • MODULAR ENCLOSURE</span>';
  inner.prepend(decor);
  return decor;
}
function normalize(template={}){
  const id=template.id||'TRAINING-TASK';
  const base=PROFILES[id]||{};
  const rows=Math.max(1,Number(template.rows||inner.dataset.rows||1));
  const modules=Math.max(6,Number(template.modulesPerRow||inner.dataset.modulesPerRow||18));
  let profile=template.enclosureProfile||base.profile;
  if(!profile&&id==='TRAINING-TASK')profile=rows>=3?'training-18-tall':'training-18';
  return{
    id,
    rows,
    modules,
    profile:profile||(rows>=5&&modules>=24?'residential-5x24-xl':rows>=5?'residential-5x12':modules===12?'residential-3x12-flush':'training-18'),
    mounting:template.mounting||base.mounting||'training',
    family:template.family||base.family||'training'
  };
}
function apply(template={}){
  const p=normalize(template);
  [cabinet,inner].forEach(el=>{
    el.dataset.enclosureProfile=p.profile;
    el.dataset.mounting=p.mounting;
    el.dataset.family=p.family;
    el.dataset.boardId=p.id;
    el.dataset.rows=String(p.rows);
    el.dataset.modulesPerRow=String(p.modules);
  });
  const mark=ensureHardware().querySelector('.case-marking');
  if(mark)mark.textContent='XYZ • '+p.rows+'×'+p.modules+'M • '+String(p.mounting).replaceAll('_',' ').toUpperCase();
}
document.addEventListener('elektryk:board-changed',e=>{
  const template=e.detail?.template||{};
  apply(template);
  const v=document.querySelector('.cabinet-head .version');
  const rows=Number(template.rows||inner.dataset.rows||1);
  const modules=Number(template.modulesPerRow||inner.dataset.modulesPerRow||18);
  if(v)v.textContent='v0.7.15.1 • ROZDZIELNICAPRO.PL • WOLNA BUDOWA • '+rows+'×'+modules+'M';
});
document.addEventListener('elektryk:task-started',e=>{
  const task=e.detail?.task||{};
  const template=task.boardId&&task.boardId!=='TRAINING-TASK'?window.ElektrykSwitchboardDB?.get?.(task.boardId):null;
  apply(template||{id:'TRAINING-TASK',rows:task.rows||1,modulesPerRow:task.modulesPerRow||18,mounting:'training',family:'training'});
  const v=document.querySelector('.cabinet-head .version');
  if(v)v.textContent='v0.7.15.1 • ROZDZIELNICAPRO.PL • ZADANIE '+String(task.id||1).padStart(2,'0')+' • '+Number(task.rows||1)+'×'+Number(task.modulesPerRow||18)+'M';
});
document.addEventListener('elektryk:rails-changed',e=>{
  if(!inner.dataset.enclosureProfile){
    apply({id:'TRAINING-TASK',rows:e.detail?.rows||1,modulesPerRow:e.detail?.modulesPerRow||18});
  }else{
    inner.dataset.rows=String(e.detail?.rows||inner.dataset.rows||1);
    inner.dataset.modulesPerRow=String(e.detail?.modulesPerRow||inner.dataset.modulesPerRow||18);
    cabinet.dataset.rows=inner.dataset.rows;
    cabinet.dataset.modulesPerRow=inner.dataset.modulesPerRow;
  }
});
apply({id:'TRAINING-18',rows:1,modulesPerRow:18});
window.ElektrykEnclosures={apply,profiles:()=>JSON.parse(JSON.stringify(PROFILES))};
})();