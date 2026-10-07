(()=>{
const zone=document.querySelector('.din-zone');
const bars=zone?.querySelector(':scope > .bars');
if(!zone||!bars)return;
const nbar=bars.querySelector('.nbar'),pebar=bars.querySelector('.pebar');
if(!nbar||!pebar)return;

function prepareBar(bar,role,label){
  let title=bar.querySelector(':scope > b');
  if(!title){title=document.createElement('b');bar.prepend(title)}
  title.innerHTML='<strong>'+role+'</strong><small>'+label+'</small>';
}
prepareBar(nbar,'N','LISTWA NEUTRALNA');
prepareBar(pebar,'PE','LISTWA OCHRONNA');

function sync(){
  const rows=window.ElektrykStage2?.getRows?.()||Number(document.querySelector('.cabinet-inner')?.dataset.rows)||1;
  const count=rows===1?12:rows===2?18:24;
  const peTop=rows*252+26;
  zone.style.setProperty('--pe-bar-top',peTop+'px');
  zone.style.setProperty('--bar-count',String(count));
  [nbar,pebar].forEach(bar=>{
    const box=bar.querySelector('.bar-screws');
    if(box){box.dataset.count=String(count);delete box.dataset.wired}
  });
  window.ElektrykStage3?.refreshBars?.();
  window.ElektrykStage3?.redraw?.();
  window.ElektrykBridges?.redraw?.();
}
document.addEventListener('elektryk:rails-changed',()=>requestAnimationFrame(sync));
window.addEventListener('resize',()=>requestAnimationFrame(sync));
sync();
window.ElektrykBusbars={sync};
})();