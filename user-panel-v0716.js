/* RozdzielnicaPRO.pl v0.7.16 — Panel Użytkownika, wariant B.
   Widok i modale; istniejące logowanie, postęp i mechanika trybów bez zmian. */
(()=>{
'use strict';
function init(){
  const hub=document.getElementById('playerHub');
  const statsModal=document.getElementById('hubStatsModal');
  const aboutModal=document.getElementById('hubAboutModal');
  const settingsModal=document.getElementById('gameSettingsModal');
  if(!hub||!statsModal||!aboutModal||!settingsModal)return;
  const stats=document.getElementById('proHubStats');
  const statsTarget=document.getElementById('hubStatsBody');
  if(stats&&statsTarget)statsTarget.appendChild(stats);
  let activeDialog=null;
  let returnFocus=null;
  const focusables=(dialog)=>[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')]
    .filter(x=>!x.hidden&&!x.closest('[hidden]'));
  function open(dialog,trigger){
    if(!dialog)return;
    if(activeDialog&&activeDialog!==dialog)close(activeDialog,false);
    returnFocus=trigger||document.activeElement;
    dialog.hidden=false;
    activeDialog=dialog;
    const target=dialog.querySelector('[data-modal-close]')||focusables(dialog)[0];
    requestAnimationFrame(()=>target?.focus());
  }
  function close(dialog,restore=true){
    if(!dialog||dialog.hidden)return;
    dialog.hidden=true;
    if(activeDialog===dialog)activeDialog=null;
    const previous=returnFocus;
    returnFocus=null;
    if(restore&&previous?.isConnected)requestAnimationFrame(()=>previous.focus());
  }
  function tabController(root,groupSelector,attr,paneAttribute,defaultTab){
    const tabs=[...root.querySelectorAll(groupSelector)];
    const panes=[...root.querySelectorAll('['+paneAttribute+']')];
    if(!tabs.length||!panes.length)return ()=>{};
    function choose(id,focus=false){
      if(!tabs.some(tab=>tab.getAttribute(attr)===id))return;
      tabs.forEach(tab=>{
        const selected=tab.getAttribute(attr)===id;
        tab.setAttribute('aria-selected',String(selected));
        tab.tabIndex=selected?0:-1;
        tab.classList.toggle('is-active',selected);
        if(selected&&focus)tab.focus();
      });
      panes.forEach(pane=>pane.hidden=pane.getAttribute(paneAttribute)!==id);
    }
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>choose(tab.getAttribute(attr)));
      tab.addEventListener('keydown',e=>{
        if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
        e.preventDefault();
        let n=index;
        if(e.key==='ArrowRight')n=(index+1)%tabs.length;
        if(e.key==='ArrowLeft')n=(index-1+tabs.length)%tabs.length;
        if(e.key==='Home')n=0;
        if(e.key==='End')n=tabs.length-1;
        choose(tabs[n].getAttribute(attr),true);
      });
    });
    choose(defaultTab);
    return choose;
  }
  const showSettingTab=tabController(settingsModal,'[data-user-settings-tab]','data-user-settings-tab','data-settings-pane','account');
  const showAboutTab=tabController(aboutModal,'[data-about-tab]','data-about-tab','data-about-pane','overview');

  document.getElementById('hubStats')?.addEventListener('click',e=>open(statsModal,e.currentTarget));
  document.getElementById('hubAbout')?.addEventListener('click',e=>{
    showAboutTab('overview');
    open(aboutModal,e.currentTarget);
  });
  document.getElementById('hubUpdates')?.addEventListener('click',e=>{
    showAboutTab('updates');
    open(aboutModal,e.currentTarget);
  });
  document.getElementById('hubSettings')?.addEventListener('click',()=>showSettingTab('account'));
  document.getElementById('openGameSettings')?.addEventListener('click',()=>showSettingTab('game'));

  for(const dialog of [statsModal,aboutModal]){
    dialog.querySelectorAll('[data-modal-close]').forEach(b=>b.addEventListener('click',()=>close(dialog)));
    dialog.addEventListener('click',e=>{if(e.target===dialog)close(dialog)});
  }
  settingsModal.querySelector('#closeGameSettings')?.addEventListener('click',()=>returnFocus?.focus?.());
  document.addEventListener('keydown',e=>{
    const dialog=activeDialog||(!settingsModal.hidden?settingsModal:null);
    if(!dialog)return;
    if(e.key==='Escape'){
      e.preventDefault();
      if(dialog===settingsModal)document.getElementById('closeGameSettings')?.click();
      else close(dialog);
    }
    if(e.key!=='Tab')return;
    const items=focusables(dialog);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  window.ElektrykUserPanel={
    version:'0.7.16',
    openStats:()=>open(statsModal,document.getElementById('hubStats')),
    openAbout:(tab='overview')=>{
      showAboutTab(tab==='updates'?'updates':'overview');
      open(aboutModal,document.getElementById('hubAbout'));
    },
    showSettingsTab:showSettingTab
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();