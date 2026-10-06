(()=>{
const stage2=window.ElektrykStage2,tasksApi=window.ElektrykTasks;
if(!stage2||!tasksApi)return;

const active=document.querySelector('.active-task');
if(!active)return;

const SPECIFIC={
1:['Zacznij od FR 63A 4P, potem ustaw RCD, B10 i B16 obok siebie.','Połącz WLZ z FR, następnie zasil RCD. B10 i B16 mogą dostać fazę przez grzebień.'],
2:['Po jednym RCD ustaw dwa B10 i dwa B16 w jednym ciągu.','Najczytelniej: FR → RCD → B10 → B10 → B16 → B16.'],
3:['RCBO traktuj jako osobno chroniony obwód; nie musi być za wspólnym RCD.','Najpierw zbuduj podstawową sekcję RCD, a RCBO zostaw jako wydzielony tor.'],
4:['Zgrupuj dwa B10 razem, a cztery B16 razem za RCD.','Grzebień najbardziej opłaca się zastosować na ciągu czterech B16.'],
5:['Dwa RCBO ustaw obok siebie jako wydzielone obwody, a B16 pozostaw w sekcji za RCD.','Nie próbuj zasilać RCBO z wyjścia innego RCBO — traktuj je jako równoległe odbiory z toru głównego.'],
6:['SPD ustaw blisko FR, zanim przejdziesz do sekcji RCD i MCB.','Po stronie odbiorczej zbuduj RCD → B10/B16; SPD pozostaje aparatem ochronnym poza szeregowym torem odbiornika.'],
7:['Podziel sześć MCB na dwie grupy i przypisz każdą grupę do osobnego RCD.','Zostaw niewielki odstęp logiczny pomiędzy dwiema sekcjami RCD, nawet jeśli aparaty stoją obok siebie.'],
8:['Najpierw rozplanuj 18 modułów na papierze/schemacie w oknie rozwiązania.','SPD i RCBO zajmują po 2M, dlatego montuj szerokie aparaty jako pierwsze.'],
9:['Pierwszy rząd przeznacz na wejście, SPD i RCD; drugi na większość MCB.','Przy dwóch rzędach nie musisz wciskać wszystkiego w pierwszy — korzystaj z obu listew równomiernie.'],
10:['RCBO możesz umieścić na drugim rzędzie razem z wydzielonymi obwodami garażu.','Rozdziel obwody domu i garażu na czytelne grupy zamiast mieszać MCB naprzemiennie.'],
11:['Trzy RCD oznaczają trzy logiczne sekcje; rozdziel B10/B16 pomiędzy nie możliwie równomiernie.','Dla warsztatu charakterystyki C są dostępne w katalogu do treningu, ale wymagania zadania liczą wskazane aparaty z listy.'],
12:['Najpierw rozstaw FR, SPD, trzy RCD i dwa RCBO — dopiero potem wypełnij wolne moduły MCB.','Przy dużej liczbie aparatów używaj grzebienia oddzielnie dla każdego ciągu zabezpieczeń.'],
13:['Cztery RCD najlepiej rozłożyć po dwa na każdy rząd.','Wydziel RCBO przy końcu sekcji, żeby nie rozdzielał ciągu MCB przeznaczonego pod grzebień.'],
14:['Podziel dwa rzędy na dwie strefy funkcjonalne i utrzymaj podobną liczbę MCB w każdej.','Zacznij od aparatów 4M/2M, bo później łatwiej wypełnić luki aparatami 1M.'],
15:['Trzy RCBO warto zebrać w jednej części drugiego rzędu.','Przed układaniem 9×B16 policz wolne moduły — to zadanie prawie wypełnia 36M.'],
16:['Na trzech rzędach zarezerwuj pierwszy na wejście i ochronę, drugi oraz trzeci głównie na obwody końcowe.','Nie prowadź jednego grzebienia między rzędami; każdy rząd ma własny ciąg zasilający.'],
17:['Pięć RCD rozdziel pomiędzy trzy listwy, aby przy każdym zostało miejsce na grupę MCB.','Najpierw zbuduj szkielet FR/SPD/RCD/RCBO, potem dopiero dodawaj 22 aparaty B10/B16.'],
18:['To zadanie ma 50M aparatury — zostaw tylko 4M rezerwy, więc kolejność montażu jest istotna.','Rozwiązanie w oknie pokazuje proponowany podział na trzy rzędy; trzymaj grupy RCD zwarte.'],
19:['Przy 52M masz tylko 2 wolne moduły. Montuj dokładnie według planu rzędów.','Grzebienie zakładaj dopiero po zakończeniu rozmieszczenia wszystkich aparatów.'],
20:['MASTER wykorzystuje pełne 54M — nie ma miejsca na pusty moduł.','Skorzystaj z pełnego rozwiązania przed montażem: każdy aparat musi trafić do zaplanowanego rzędu.']
};

const controls=document.createElement('div');
controls.className='task-help-controls';
controls.innerHTML='<button id="taskHintBtn">💡 PODPOWIEDŹ</button><button id="taskSolutionBtn">▦ PEŁNE ROZWIĄZANIE / SCHEMAT</button>';
const reward=active.querySelector('.reward');
if(reward)reward.insertAdjacentElement('afterend',controls);else active.appendChild(controls);

const hintBox=document.createElement('div');
hintBox.className='task-hint-box';hintBox.hidden=true;
controls.insertAdjacentElement('afterend',hintBox);

const modal=document.createElement('div');
modal.className='solution-modal';modal.hidden=true;
modal.innerHTML='<div class="solution-window"><div class="solution-head"><div><b id="solutionTitle">ROZWIĄZANIE</b><small id="solutionMeta"></small></div><button id="closeSolution">×</button></div><div class="solution-body"><div class="solution-warning">Schemat edukacyjny symulatora. Nie jest dokumentacją wykonawczą rzeczywistej instalacji elektrycznej.</div><div id="solutionLayout"></div><div id="solutionConnections"></div></div></div>';
document.body.appendChild(modal);

function currentTask(){return tasksApi.current?.()||stage2.getTask?.()||tasksApi.all?.[0]}
function mountedCounts(){
  const counts={};(stage2.getMounted?.()||[]).forEach(m=>counts[m.code]=(counts[m.code]||0)+1);return counts;
}
function partName(code){return stage2.parts?.[code]?.name||code}
function missingRequirement(task){
  const have=mountedCounts();
  for(const [code,need] of Object.entries(task.requirements||{})){
    if((have[code]||0)<need)return {code,need,have:have[code]||0};
  }
  return null;
}
function contextHint(task){
  const miss=missingRequirement(task);
  if(miss)return 'Następny krok: zamontuj '+partName(miss.code)+' — masz '+miss.have+' z '+miss.need+'.';
  const conns=window.ElektrykStage3?.getConnections?.()||[];
  const bridges=window.ElektrykBridges?.getBridges?.()||[];
  if(conns.length===0)return 'Aparatura jest już kompletna. Zacznij okablowanie od WLZ i rozłącznika głównego FR.';
  if(bridges.length===0 && [...document.querySelectorAll('.mounted-device')].some(m=>/^[BC]\d+$/.test(m.dataset.code)))return 'Masz już przewody. Teraz możesz użyć MOSTKA lub GRZEBIENIA do rozprowadzenia fazy po sąsiednich MCB.';
  const analysis=window.ElektrykPower?.getLast?.();
  const firstError=analysis?.issues?.find(i=>i.type==='error');
  if(firstError)return 'Analiza wykrywa: '+firstError.text;
  const complete=analysis?.states?.filter(s=>s.complete).length||0;
  if(complete>0)return 'Dobrze: '+complete+' obwód/obwody mają już kompletny tor. Kontynuuj pozostałe L, N i PE.';
  return 'Sprawdź kolejno: zasilanie FR, sekcje RCD/RCBO, grzebienie MCB, przewody N oraz PE.';
}

let hintIndex=0,lastTaskId=null;
function showHint(){
  const task=currentTask();if(!task)return;
  if(lastTaskId!==task.id){hintIndex=0;lastTaskId=task.id}
  const specific=SPECIFIC[task.id]||[];
  const hints=[contextHint(task),...specific];
  hintBox.hidden=false;
  hintBox.innerHTML='<b>PODPOWIEDŹ • ZADANIE '+String(task.id).padStart(2,'0')+'</b><span>'+(hints[hintIndex%hints.length]||contextHint(task))+'</span><small>Kliknij „Podpowiedź” ponownie, aby zobaczyć następną wskazówkę.</small>';
  hintIndex++;
}

const MODULES={FR:4,RCD:2,B10:1,B16:1,RCBO:2,SPD:2};
function deviceModules(code){return MODULES[code]||stage2.parts?.[code]?.modules||1}
function expandedDevices(task){
  const arr=[];
  const preferred=['FR','SPD','RCD','RCBO','B10','B16'];
  preferred.forEach(code=>{for(let i=0;i<(task.requirements?.[code]||0);i++)arr.push(code)});
  Object.entries(task.requirements||{}).forEach(([code,n])=>{if(preferred.includes(code))return;for(let i=0;i<n;i++)arr.push(code)});
  return arr;
}
function distribute(task){
  const rows=Array.from({length:task.rows},()=>({used:0,items:[]}));
  const devices=expandedDevices(task);
  let row=0;
  devices.forEach(code=>{
    const m=deviceModules(code);
    while(row<rows.length-1 && rows[row].used+m>18)row++;
    if(rows[row].used+m>18){
      for(let r=0;r<rows.length;r++){if(rows[r].used+m<=18){row=r;break}}
    }
    rows[row].items.push(code);rows[row].used+=m;
  });
  return rows;
}
function chip(code,index){
  const p=stage2.parts?.[code]||{};
  const cls=code==='FR'?'fr':code==='SPD'?'spd':code==='RCD'?'rcd':code==='RCBO'?'rcbo':'mcb';
  return '<div class="solution-device '+cls+'" title="'+(p.name||code)+'"><b>'+code+'</b><span>'+(p.rating||'')+'</span><small>'+deviceModules(code)+'M</small></div>';
}
function solutionSteps(task){
  const req=task.requirements||{},steps=[];
  steps.push('<b>1.</b> WLZ → wejście rozłącznika głównego FR.');
  if(req.SPD)steps.push('<b>2.</b> Od toru głównego wykonaj gałąź ochronną do SPD zgodnie z logiką symulatora.');
  if(req.RCD)steps.push('<b>'+ (steps.length+1)+'.</b> Z wyjścia FR zasil '+req.RCD+' sekcję/sekcje RCD.');
  if(req.RCBO)steps.push('<b>'+ (steps.length+1)+'.</b> '+req.RCBO+' RCBO potraktuj jako wydzielone zabezpieczenia końcowe.');
  if((req.B10||0)+(req.B16||0)>1)steps.push('<b>'+ (steps.length+1)+'.</b> MCB ustaw grupami za odpowiednimi RCD; sąsiedni ciąg możesz zasilić GRZEBIENIEM.');
  steps.push('<b>'+ (steps.length+1)+'.</b> N prowadź przez właściwy tor RCD/RCBO do listwy N i dalej do odbiorników.');
  steps.push('<b>'+ (steps.length+1)+'.</b> PE prowadź z WLZ do dolnej listwy PE, a z niej do wszystkich odbiorników.');
  steps.push('<b>'+ (steps.length+1)+'.</b> Wyjścia B10/B16/RCBO połącz z odpowiednimi zaciskami L odbiorników i uruchom „Sprawdź instalację”.');
  return steps;
}
function openSolution(){
  const task=currentTask();if(!task)return;
  document.getElementById('solutionTitle').textContent='ROZWIĄZANIE • '+String(task.id).padStart(2,'0')+' • '+task.title;
  document.getElementById('solutionMeta').textContent=task.rows+'×18M • '+task.level+' • '+task.xp+' XP';
  const rows=distribute(task);
  document.getElementById('solutionLayout').innerHTML=
    '<section class="solution-section"><h3>PROPONOWANE ROZMIESZCZENIE APARATÓW</h3>'+
    rows.map((row,i)=>'<div class="solution-row"><div class="solution-row-name">LISTWA DIN '+(i+1)+' <span>'+row.used+'/18M</span></div><div class="solution-rail">'+row.items.map(chip).join('')+'<div class="solution-free">'+Math.max(0,18-row.used)+'M wolne</div></div></div>').join('')+
    '</section>';
  const tips=SPECIFIC[task.id]||[];
  document.getElementById('solutionConnections').innerHTML=
    '<section class="solution-section"><h3>SCHEMAT LOGICZNY POŁĄCZEŃ</h3><div class="solution-flow"><span>WLZ</span><i>→</i><span>FR</span><i>→</i>'+(task.requirements.SPD?'<span>SPD</span><i>↘</i>':'')+(task.requirements.RCD?'<span>RCD ×'+task.requirements.RCD+'</span><i>→</i>':'')+'<span>MCB / RCBO</span><i>→</i><span>OBWODY</span></div><div class="solution-steps">'+solutionSteps(task).map(x=>'<div>'+x+'</div>').join('')+'</div></section>'+
    '<section class="solution-section compact"><h3>WSKAZÓWKI DO TEGO ZADANIA</h3>'+tips.map(x=>'<p>• '+x+'</p>').join('')+'</section>';
  modal.hidden=false;
}

document.getElementById('taskHintBtn').addEventListener('click',showHint);
document.getElementById('taskSolutionBtn').addEventListener('click',openSolution);
document.getElementById('closeSolution').addEventListener('click',()=>modal.hidden=true);
modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)modal.hidden=true});

const title=document.querySelector('.active-task h2');
if(title)new MutationObserver(()=>{hintBox.hidden=true;hintIndex=0;lastTaskId=currentTask()?.id||null}).observe(title,{childList:true,subtree:true});

window.ElektrykHelp={showHint,openSolution};
})();