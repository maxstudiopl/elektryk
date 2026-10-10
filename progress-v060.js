(()=> {
// Nowy katalog zadań: nie przypisuj zaliczeń poprzednich 20 zadań do nowych ID.
const KEY='elektryk_progress_v072';
function storageKey(){
  const user=window.ElektrykAuth?.currentAccountId?.()||'admin';
  return user==='admin'?KEY:(KEY+':'+user);
}
const TOTAL_TASKS=window.ElektrykTasks?.all?.length||40;
let taskStartedAt=Date.now();
let currentTaskId=window.ElektrykStage2?.getTask?.()?.id||1;
let failedChecks=0;

function fresh(){return {xp:0,completed:{},bestStars:{},bestTime:{},attempts:{},updatedAt:Date.now()}}
function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(storageKey())||'null');
    return raw&&typeof raw==='object'?Object.assign(fresh(),raw):fresh();
  }catch{return fresh()}
}
let data=load();
function save(){data.updatedAt=Date.now();localStorage.setItem(storageKey(),JSON.stringify(data))}
function levelForXp(xp){return Math.max(1,Math.floor(Number(xp||0)/500)+1)}
function fmt(sec){
  sec=Math.max(0,Math.floor(sec||0));
  const m=Math.floor(sec/60),s=sec%60;
  return m+':'+String(s).padStart(2,'0');
}
function starsFor(seconds,failures){
  if(failures===0&&seconds<=180)return 3;
  if(failures<=1&&seconds<=360)return 2;
  return 1;
}
function requirementsDone(){
  const task=window.ElektrykStage2?.getTask?.();
  const mounted=window.ElektrykStage2?.getMounted?.()||[];
  if(!task)return false;
  const counts={};
  mounted.forEach(m=>counts[m.code]=(counts[m.code]||0)+1);
  const countsDone=Object.entries(task.requirements||{}).every(([code,n])=>(counts[code]||0)>=Number(n));
  const reference=window.ElektrykLearningBoard?.evaluate?.();
  return countsDone&&!!reference?.complete;
}
function currentMode(){return document.body.dataset.gameMode||'learn'}
function profile(){
  const top=document.getElementById('topPlayerLevel');
  const mode=currentMode();
  if(top){
    top.textContent=mode==='learn'?'TWÓJ POZIOM: '+levelForXp(data.xp):'BEZ PUNKTACJI';
  }
}
function ensureStats(){
  const host=document.querySelector('.active-task');
  if(!host||document.getElementById('playerProgress'))return;
  const box=document.createElement('div');
  box.id='playerProgress';
  box.className='player-progress';
  box.innerHTML='<div class="player-progress-head"><b>POSTĘP GRACZA</b><span id="progressTimer">0:00</span></div><div class="player-progress-grid"><div><span>UKOŃCZONE</span><b id="progressCompleted">0/'+TOTAL_TASKS+'</b></div><div><span>GWIAZDKI</span><b id="progressStars">0/'+(TOTAL_TASKS*3)+'</b></div><div><span>XP</span><b id="progressXp">0</b></div><div><span>POZIOM</span><b id="progressLevel">1</b></div></div><div class="player-progress-current" id="progressCurrent">Zadanie 01 • jeszcze nieukończone</div>';
  const reward=host.querySelector('.reward');
  if(reward)reward.insertAdjacentElement('afterend',box); else host.appendChild(box);
}
function renderStats(){
  ensureStats();profile();
  const progressBox=document.getElementById('playerProgress');
  if(progressBox)progressBox.classList.toggle('mode-hidden',currentMode()!=='learn');
  if(currentMode()!=='learn')return;
  const completed=Object.keys(data.completed||{}).filter(k=>data.completed[k]).length;
  const stars=Object.values(data.bestStars||{}).reduce((a,b)=>a+Number(b||0),0);
  const c=document.getElementById('progressCompleted'),s=document.getElementById('progressStars'),x=document.getElementById('progressXp'),l=document.getElementById('progressLevel');
  if(c)c.textContent=completed+'/'+TOTAL_TASKS;
  if(s)s.textContent=stars+'/'+(TOTAL_TASKS*3);
  if(x)x.textContent=data.xp;
  if(l)l.textContent=levelForXp(data.xp);
  const cur=document.getElementById('progressCurrent');
  if(cur){
    const st=data.bestStars?.[currentTaskId]||0,best=data.bestTime?.[currentTaskId];
    cur.textContent=data.completed?.[currentTaskId]
      ?'Zadanie '+String(currentTaskId).padStart(2,'0')+' • '+('★'.repeat(st)+'☆'.repeat(3-st))+(best?' • rekord '+fmt(best):'')
      :'Zadanie '+String(currentTaskId).padStart(2,'0')+' • jeszcze nieukończone';
  }
  decorateCards();
}
function decorateCards(){
  document.querySelectorAll('.task-card').forEach(card=>{
    const id=Number(card.dataset.taskId);
    card.classList.toggle('task-completed',!!data.completed?.[id]);
    let badge=card.querySelector('.task-save-state');
    if(!badge){badge=document.createElement('div');badge.className='task-save-state';card.appendChild(badge)}
    const st=Number(data.bestStars?.[id]||0),best=data.bestTime?.[id];
    badge.textContent=data.completed?.[id]?('✓ '+('★'.repeat(st)+'☆'.repeat(3-st))+(best?' • '+fmt(best):'')):'NIEUKOŃCZONE';
  });
}
function ensureResult(){
  let el=document.getElementById('taskResultModal');
  if(el)return el;
  el=document.createElement('div');el.id='taskResultModal';el.className='task-result-modal';el.hidden=true;
  el.innerHTML='<div class="task-result-card"><button class="task-result-close" type="button">×</button><div class="task-result-kicker">ZADANIE UKOŃCZONE</div><h2 id="taskResultTitle">Brawo!</h2><div class="task-result-stars" id="taskResultStars">★★★</div><div class="task-result-grid"><div><span>CZAS</span><b id="taskResultTime">0:00</b></div><div><span>XP</span><b id="taskResultXp">+0</b></div><div><span>PRÓBY</span><b id="taskResultAttempts">1</b></div></div><div class="task-result-note" id="taskResultNote"></div><button class="task-result-ok" type="button">DALEJ</button></div>';
  document.body.appendChild(el);
  const close=()=>el.hidden=true;
  el.querySelector('.task-result-close').onclick=close;
  el.querySelector('.task-result-ok').onclick=close;
  return el;
}
function showResult(task,seconds,stars,xpAward,attempts,newBest){
  const el=ensureResult();
  el.querySelector('#taskResultTitle').textContent=task.title;
  el.querySelector('#taskResultStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  el.querySelector('#taskResultTime').textContent=fmt(seconds);
  el.querySelector('#taskResultXp').textContent=xpAward?('+'+xpAward):'+0';
  el.querySelector('#taskResultAttempts').textContent=attempts;
  el.querySelector('#taskResultNote').textContent=xpAward
    ?'XP przyznano za pierwsze ukończenie zadania.'
    :(newBest?'Poprawiłeś swój najlepszy wynik.':'Zadanie było już ukończone — XP nie jest naliczane ponownie.');
  el.hidden=false;
}
function completeTask(detail){
  if(document.body.dataset.learningAssist||window.ElektrykAuth?.isDemo?.())return false;
  const task=window.ElektrykStage2?.getTask?.();
  if(!task||!detail?.complete||!requirementsDone())return false;
  const id=Number(task.id);
  const seconds=Math.max(1,Math.round((Date.now()-taskStartedAt)/1000));
  const attempts=Math.max(1,Number(data.attempts[id]||1));
  const stars=starsFor(seconds,failedChecks);
  const first=!data.completed[id];
  const previousStars=Number(data.bestStars[id]||0);
  const previousTime=Number(data.bestTime[id]||0);
  const newBest=stars>previousStars||!previousTime||seconds<previousTime;
  if(first){
    data.completed[id]=true;
    data.xp+=Number(task.xp||0);
  }
  data.bestStars[id]=Math.max(previousStars,stars);
  if(!previousTime||seconds<previousTime)data.bestTime[id]=seconds;
  save();renderStats();document.dispatchEvent(new CustomEvent('elektryk:progress-updated'));showResult(task,seconds,stars,first?Number(task.xp||0):0,attempts,newBest);
  return true;
}
document.addEventListener('elektryk:task-started',e=>{
  currentTaskId=Number(e.detail?.task?.id||window.ElektrykStage2?.getTask?.()?.id||1);
  taskStartedAt=Date.now();failedChecks=0;renderStats();
});
document.addEventListener('elektryk:mode-selected',e=>{
  const mode=e.detail?.mode||'learn';
  document.body.dataset.gameMode=mode;
  taskStartedAt=Date.now();
  failedChecks=0;
  renderStats();
});
document.addEventListener('elektryk:power-check',e=>{
  if(currentMode()!=='learn'||document.body.dataset.learningAssist||window.ElektrykAuth?.isDemo?.())return;
  const id=Number(window.ElektrykStage2?.getTask?.()?.id||currentTaskId||1);
  if(!Number.isFinite(id))return;
  data.attempts[id]=(data.attempts[id]||0)+1;
  save();
  if(e.detail?.complete&&requirementsDone())completeTask(e.detail);
  else failedChecks++;
  renderStats();
});
setInterval(()=>{
  if(currentMode()!=='learn')return;
  const t=document.getElementById('progressTimer');
  if(t)t.textContent=fmt((Date.now()-taskStartedAt)/1000);
},1000);
setTimeout(renderStats,0);
setTimeout(renderStats,500);
window.ElektrykProgress={
  get:()=>JSON.parse(JSON.stringify(data)),
  level:()=>levelForXp(data.xp),
  refreshProfile:profile,
  refreshCards:decorateCards,
  reset:()=>{localStorage.removeItem(storageKey());data=fresh();taskStartedAt=Date.now();failedChecks=0;renderStats();document.dispatchEvent(new CustomEvent('elektryk:progress-updated'))}
};
})();