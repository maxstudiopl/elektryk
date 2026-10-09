/* Elektryk Symulator v0.7.12.2 — Panel Gracza i ergonomia rozdzielnicy (Dark) */
(()=>{
'use strict';
function init(){
  const hub=document.getElementById('playerHub');
  const modes=hub?.querySelector('.player-modes');
  const workspace=document.querySelector('.workspace');
  const game=document.querySelector('.game-shell');
  if(!hub||!modes||!workspace||!game)return;

  // Panel Gracza — kompletne karty postępów; nie zmieniają istniejącego systemu XP.
  if(!hub.querySelector('#proHubStats')){
    const stats=document.createElement('section');
    stats.id='proHubStats';
    stats.className='pro-hub-stats';
    stats.setAttribute('aria-label','Statystyki gracza');
    const cards=[
      ['UKOŃCZONE ZADANIA','proTasksDone','0 / 40','Postęp nauki'],
      ['ZDOBYTE DOŚWIADCZENIE','proHubXp','0 XP','Suma punktów'],
      ['AKTUALNY POZIOM','proHubLevel','1','Twoje doświadczenie']
    ];
    for(const [label,id,initial,description] of cards){
      const item=document.createElement('article');
      item.className='pro-hub-stat';
      const heading=document.createElement('span');heading.textContent=label;
      const value=document.createElement('strong');value.id=id;value.textContent=initial;
      const info=document.createElement('small');info.textContent=description;
      item.append(heading,value,info);
      stats.appendChild(item);
    }
    modes.insertAdjacentElement('beforebegin',stats);
  }
  if(!hub.querySelector('.pro-modes-title')){
    const section=document.createElement('div');section.className='pro-modes-title';
    const title=document.createElement('span');title.textContent='WYBIERZ TRYB PRACY';
    const info=document.createElement('small');info.textContent='Kontynuuj naukę lub rozpocznij własny projekt';
    section.append(title,info);
    modes.insertAdjacentElement('beforebegin',section);
  }
  function updateHubStats(){
    const data=window.ElektrykProgress?.get?.()||null;
    if(!data)return;
    const total=window.ElektrykTasks?.all?.length||40;
    const completed=Object.values(data.completed||{}).filter(Boolean).length;
    const xp=Math.max(0,Number(data.xp)||0);
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value)};
    set('proTasksDone',Math.min(total,completed)+' / '+total);
    set('proHubXp',xp.toLocaleString('pl-PL')+' XP');
    set('proHubLevel',Math.floor(xp/500)+1);
  }
  updateHubStats();
  const obs=new MutationObserver(records=>{
    if(records.some(r=>r.attributeName==='hidden'&&!hub.hidden)){
      updateHubStats();
      setTimeout(updateHubStats,250);
      setTimeout(updateHubStats,1600);
    }
  });
  obs.observe(hub,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('elektryk:power-check',()=>requestAnimationFrame(updateHubStats));
  document.addEventListener('elektryk:mode-selected',()=>requestAnimationFrame(updateHubStats));

  // Pasek narzędzi i przyciski układu. Panele nie są usuwane z DOM,
  // więc okablowanie, katalog aparatów i stan gry pozostają nietknięte.
  const toolbar=document.createElement('div');
  toolbar.className='pro-workspace-toolbar';
  toolbar.id='proWorkspaceToolbar';
  const heading=document.createElement('div');heading.className='pro-workspace-title';
  const logo=document.createElement('div');logo.className='pro-workspace-logo';logo.textContent='⚡';logo.setAttribute('aria-hidden','true');
  const copy=document.createElement('div');
  const title=document.createElement('b');title.textContent='STANOWISKO MONTAŻOWE';
  const subtitle=document.createElement('small');subtitle.textContent='Rozdzielnica • montaż • okablowanie • diagnostyka';
  copy.append(title,subtitle);heading.append(logo,copy);
  const controls=document.createElement('div');controls.className='pro-workspace-actions';
  const left=document.querySelector('.leftbar');
  const right=document.querySelector('.rightbar');
  if(left)left.id='proTaskSidebar';
  if(right)right.id='proToolSidebar';
  function makeButton(id,controlsId){
    const b=document.createElement('button');
    b.type='button';b.className='pro-layout-toggle';b.id=id;
    b.setAttribute('aria-controls',controlsId);
    b.setAttribute('aria-pressed','false');
    return b;
  }
  const taskBtn=makeButton('proToggleTasks','proTaskSidebar');
  const toolBtn=makeButton('proToggleTools','proToolSidebar');
  const fullBtn=makeButton('proFocusMode','proTaskSidebar proToolSidebar');
  controls.append(taskBtn,toolBtn,fullBtn);
  toolbar.append(heading,controls);
  const cabinetHead=workspace.querySelector('.cabinet-head');
  if(cabinetHead)workspace.insertBefore(toolbar,cabinetHead);
  else workspace.prepend(toolbar);
  const clsLeft='pro-left-collapsed',clsRight='pro-right-collapsed';
  function updateButtons(){
    const l=document.body.classList.contains(clsLeft);
    const r=document.body.classList.contains(clsRight);
    taskBtn.textContent=l?'▸ POKAŻ ZADANIA':'◂ UKRYJ ZADANIA';
    toolBtn.textContent=r?'◂ POKAŻ NARZĘDZIA':'NARZĘDZIA ▸';
    fullBtn.textContent=l&&r?'▣ PRZYWRÓĆ PANELE':'⛶ WIĘKSZA ROZDZIELNICA';
    taskBtn.setAttribute('aria-pressed',String(l));
    toolBtn.setAttribute('aria-pressed',String(r));
    fullBtn.setAttribute('aria-pressed',String(l&&r));
    if(left)left.setAttribute('aria-hidden',String(l));
    if(right)right.setAttribute('aria-hidden',String(r));
    // focusable elements in display:none sidebar are removed from tab order
  }
  function redrawWiring(){
    requestAnimationFrame(()=>{
      window.ElektrykStage3?.redraw?.();
      window.ElektrykBridges?.redraw?.();
    });
  }
  function change(){
    updateButtons();redrawWiring();
  }
  taskBtn.addEventListener('click',()=>{document.body.classList.toggle(clsLeft);change()});
  toolBtn.addEventListener('click',()=>{document.body.classList.toggle(clsRight);change()});
  fullBtn.addEventListener('click',()=>{
    const shouldCollapse=!(document.body.classList.contains(clsLeft)&&document.body.classList.contains(clsRight));
    document.body.classList.toggle(clsLeft,shouldCollapse);
    document.body.classList.toggle(clsRight,shouldCollapse);
    change();
  });
  window.addEventListener('resize',redrawWiring,{passive:true});
  updateButtons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();