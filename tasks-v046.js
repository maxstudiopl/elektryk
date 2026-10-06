(()=>{
const TASKS=[
{id:1,title:'Podstawowa rozdzielnica mieszkania',level:'ŁATWE',rows:1,xp:150,description:'Zbuduj pierwszą treningową rozdzielnicę: rozłącznik główny, RCD oraz podstawowe zabezpieczenia oświetlenia i gniazd.',requirements:{FR:1,RCD:1,B10:1,B16:1}},
{id:2,title:'Oświetlenie + gniazda',level:'ŁATWE',rows:1,xp:170,description:'Rozdziel dwa obwody oświetleniowe i dwa obwody gniazdowe za jednym RCD.',requirements:{FR:1,RCD:1,B10:2,B16:2}},
{id:3,title:'Łazienka z osobnym RCBO',level:'ŁATWE',rows:1,xp:190,description:'Dodaj osobne zabezpieczenie RCBO dla wydzielonego obwodu oraz podstawowe obwody mieszkania.',requirements:{FR:1,RCD:1,RCBO:1,B10:1,B16:2}},
{id:4,title:'Kuchnia – kilka obwodów',level:'ŁATWE',rows:1,xp:210,description:'Przygotuj treningowy podział kuchni na kilka obwodów gniazdowych oraz dwa obwody oświetlenia.',requirements:{FR:1,RCD:1,B10:2,B16:4}},
{id:5,title:'Pralka i zmywarka na RCBO',level:'ŚREDNIE',rows:1,xp:230,description:'Wydziel dwa odbiorniki na osobnych RCBO i dodaj dwa standardowe obwody gniazdowe.',requirements:{FR:1,RCD:1,RCBO:2,B16:2}},
{id:6,title:'Mieszkanie z ochroną SPD',level:'ŚREDNIE',rows:1,xp:250,description:'Dodaj ogranicznik przepięć SPD do kompaktowej rozdzielnicy mieszkania.',requirements:{FR:1,SPD:1,RCD:1,B10:2,B16:3}},
{id:7,title:'Dwie sekcje RCD',level:'ŚREDNIE',rows:1,xp:270,description:'Podziel obwody na dwie sekcje RCD i rozmieść zabezpieczenia oświetlenia oraz gniazd.',requirements:{FR:1,RCD:2,B10:2,B16:4}},
{id:8,title:'Rozbudowane mieszkanie 18M',level:'ŚREDNIE',rows:1,xp:300,description:'Wykorzystaj niemal całą listwę 18M: SPD, dwie sekcje RCD, RCBO i kilka MCB.',requirements:{FR:1,SPD:1,RCD:2,RCBO:1,B10:2,B16:3}},
{id:9,title:'Rozdzielnica piętra',level:'ŚREDNIE',rows:2,xp:340,description:'Pierwsze zadanie dwulistwowe. Rozdziel aparaturę pomiędzy dwa rzędy DIN i zachowaj czytelny układ.',requirements:{FR:1,SPD:1,RCD:2,B10:4,B16:6}},
{id:10,title:'Dom + garaż',level:'ŚREDNIE',rows:2,xp:370,description:'Zbuduj większą rozdzielnicę z dwoma RCBO dla wydzielonych odbiorników i kilkoma obwodami domu oraz garażu.',requirements:{FR:1,SPD:1,RCD:2,RCBO:2,B10:4,B16:6}},
{id:11,title:'Mały warsztat',level:'ŚREDNIE',rows:2,xp:400,description:'Rozdziel obwody warsztatowe na trzy sekcje RCD i większą liczbę zabezpieczeń końcowych.',requirements:{FR:1,SPD:1,RCD:3,B10:5,B16:7}},
{id:12,title:'Lokal usługowy',level:'TRUDNE',rows:2,xp:440,description:'Rozbudowany układ dwulistwowy z trzema sekcjami RCD, dwoma RCBO i wieloma obwodami końcowymi.',requirements:{FR:1,SPD:1,RCD:3,RCBO:2,B10:5,B16:8}},
{id:13,title:'Biuro – podział sekcji',level:'TRUDNE',rows:2,xp:470,description:'Zbuduj dwulistwową rozdzielnicę biurową z czterema sekcjami RCD i wydzielonym RCBO.',requirements:{FR:1,SPD:1,RCD:4,RCBO:1,B10:6,B16:8}},
{id:14,title:'Dom – dwie strefy',level:'TRUDNE',rows:2,xp:500,description:'Duża dwulistwowa rozdzielnica: cztery RCD, dwa RCBO i kilkanaście obwodów końcowych.',requirements:{FR:1,SPD:1,RCD:4,RCBO:2,B10:6,B16:9}},
{id:15,title:'Dom + obwody zewnętrzne',level:'TRUDNE',rows:2,xp:550,description:'Wypełnij prawie całe 36M rozbudowaną aparaturą dla domu i wydzielonych obwodów zewnętrznych.',requirements:{FR:1,SPD:1,RCD:4,RCBO:3,B10:6,B16:9}},
{id:16,title:'Duży dom – 3 listwy',level:'TRUDNE',rows:3,xp:620,description:'Pierwsze zadanie trzylistwowe. Rozplanuj 42 moduły aparatury na trzech rzędach DIN.',requirements:{FR:1,SPD:1,RCD:4,RCBO:4,B10:8,B16:12}},
{id:17,title:'Dom + garaż + ogród',level:'TRUDNE',rows:3,xp:680,description:'Rozbudowana rozdzielnica trójrzędowa dla wielu stref i wydzielonych obwodów.',requirements:{FR:1,SPD:1,RCD:5,RCBO:4,B10:8,B16:14}},
{id:18,title:'Biuro + pracownia',level:'EKSPERT',rows:3,xp:750,description:'Zaawansowane zadanie 50M z pięcioma RCD, pięcioma RCBO i dużą liczbą zabezpieczeń końcowych.',requirements:{FR:1,SPD:1,RCD:5,RCBO:5,B10:10,B16:14}},
{id:19,title:'Warsztat + zaplecze',level:'EKSPERT',rows:3,xp:820,description:'Trzy listwy DIN i 52 moduły. Zaplanuj rozmieszczenie sześciu sekcji RCD oraz wydzielonych RCBO.',requirements:{FR:1,SPD:1,RCD:6,RCBO:5,B10:10,B16:14}},
{id:20,title:'Rozdzielnica treningowa MASTER',level:'EKSPERT',rows:3,xp:1000,description:'Finał v0.4.6: wykorzystaj pełne 54 moduły i zbuduj największą treningową rozdzielnicę w tej wersji.',requirements:{FR:1,SPD:1,RCD:6,RCBO:6,B10:10,B16:14}}
];
const MODULES={FR:4,RCD:2,B10:1,B16:1,RCBO:2,SPD:2};
const modal=document.getElementById('taskModal');
const cards=document.querySelector('.task-cards');
if(!cards||!window.ElektrykStage2)return;
const headerSmall=modal&&modal.querySelector('.task-window-head small');
if(headerSmall)headerSmall.textContent='20 zadań • 1–3 listwy DIN • kliknij zadanie, aby rozpocząć';
const shortcut=document.querySelector('.task-button small');
if(shortcut)shortcut.textContent='20 zadań treningowych';

function modules(task){return Object.entries(task.requirements).reduce(function(sum,entry){return sum+(MODULES[entry[0]]||0)*entry[1]},0)}
function reqSummary(task){return Object.entries(task.requirements).map(function(entry){return entry[0]+'×'+entry[1]}).join(' • ')}
function rowWord(n){return n===1?'1 LISTWA':n+' LISTWY'}

function render(){
  cards.innerHTML='';
  TASKS.forEach(function(task){
    const btn=document.createElement('button');
    btn.className='task-card rows-'+task.rows;
    btn.dataset.taskId=task.id;
    btn.innerHTML=
      '<div class="task-card-top"><b>'+String(task.id).padStart(2,'0')+'</b><span>'+task.level+'</span></div>'+
      '<strong>'+task.title+'</strong>'+
      '<div class="task-card-meta"><span>'+rowWord(task.rows)+'</span><span>'+modules(task)+'/'+(task.rows*18)+'M</span><span>'+task.xp+' XP</span></div>'+
      '<small>'+reqSummary(task)+'</small>'+
      '<em>URUCHOM ZADANIE ›</em>';
    btn.addEventListener('click',function(){startTask(task,btn)});
    cards.appendChild(btn);
  });
}
function startTask(task,btn){
  window.ElektrykStage2.configureTask(task);
  cards.querySelectorAll('.task-card').forEach(function(x){x.classList.toggle('selected-task',x===btn)});
  if(modal)modal.hidden=true;
  const panelTitle=document.querySelector('.active-task .panel-title');
  if(panelTitle)panelTitle.textContent='AKTYWNE ZADANIE • '+String(task.id).padStart(2,'0')+'/20';
  const version=document.querySelector('.cabinet-head .version');
  if(version)version.textContent='v0.4.14 • ZADANIE '+String(task.id).padStart(2,'0')+' • '+task.rows+'×18M';
}
render();
const first=cards.querySelector('[data-task-id="1"]');
startTask(TASKS[0],first);
window.ElektrykTasks={
  all:TASKS,
  start:function(id){const t=TASKS.find(function(x){return x.id===Number(id)});const b=cards.querySelector('[data-task-id="'+id+'"]');if(t&&b)startTask(t,b)},
  current:function(){return window.ElektrykStage2.getTask()}
};
})();