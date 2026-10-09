/* RozdzielnicaPRO.pl v0.7.14 — egzamin szkoleniowy: teoria + praktyka.
   Wynik nie potwierdza kwalifikacji ani bezpieczeństwa instalacji. */
(()=>{
'use strict';
const BANK=[
 ['Zadaniem FR w modelu jest:', ['Rozłączenie zasilania','Pomiar energii','Ochrona przepięciowa','Połączenie N z PE'],0],
 ['Czy RCD sam zabezpiecza obwód przed przeciążeniem?',['Tak','Nie','Tylko 3-fazowy','Wyłącznie bez FR'],1],
 ['Symbol PE oznacza:', ['Neutralny','Fazę trzecią','Przewód ochronny','SPD'],2],
 ['Przewód neutralny oznacza się:', ['L1','N','PE','F'],1],
 ['Czy wolno łączyć neutralne wyjścia niezależnych RCD?',['Nie','Tak','Tylko przy B10','Tylko przy 3 fazach'],0],
 ['RCBO łączy funkcje:', ['SPD i FR','RCD i MCB','PE i N','FR i licznik'],1],
 ['Podstawowa funkcja SPD to:', ['Ograniczanie przepięć','Ochrona nadprądowa','Rozdział PE','Rozłączenie N'],0],
 ['Czy PE może zastąpić roboczy przewód N?', ['Nie','Zawsze','Przy B16','Przy 1 fazie'],0],
 ['Oznaczenie B16 opisuje:', ['Prąd 16 A i charakterystykę B','RCD 16 mA','Napięcie 16 V','16 modułów'],0],
 ['Przed pracami przy instalacji należy:', ['Sprawdzić brak napięcia po właściwym odłączeniu i zabezpieczeniu zasilania','Dotknąć L','Włączyć FR','Pominąć pomiary'],0],
 ['Która para wyraża dwa różne tory fazowe?', ['L1 i L2','N i N','PE i PE','N i PE'],0],
 ['Listwa DIN służy do:', ['Montażu aparatów modułowych','Pomiaru prądu','Zwarcia faz','Łączenia PE z N'],0],
 ['Czy neutralne wyjście RCBO powinno należeć do innej sekcji RCD?', ['Tak','Nie','Zawsze przy 3F','Tylko przy SPD'],1],
 ['Kolizja L1 i L2 na jednym torze:', ['To błąd','Jest poprawna','Zastępuje grzebień','Wyłącza PE'],0],
 ['Czy kolor żyły wystarcza do potwierdzenia poprawności?', ['Tak','Nie, konieczny jest prawidłowy tor','Tylko przy N','Tylko przy PE'],1],
 ['Oznaczenie 3×18M znaczy:', ['Trzy szyny po 18 modułów','18 faz','Trzy RCD po 18 A','18 przewodów'],0],
 ['Czy wynik gry zastępuje pomiary odbiorcze?', ['Tak','Nie','Tylko z RCBO','Tylko przy 3F'],1],
 ['MCB przede wszystkim chroni przed:', ['Przetężeniem','Przepięciem atmosferycznym','Dotykiem pośrednim bez innych warunków','Błędem neutralnym RCD'],0],
 ['Kiedy obwody za oddzielnymi RCD wymagają rozdziału N?', ['Po stronie odbiorczej','Nigdy','Tylko przed FR','Tylko przy SPD'],0],
 ['Przy pracy w symulatorze tor N należy sprawdzić:', ['Od źródła przez właściwą sekcję do odbiornika','Wyłącznie po kolorze','Tylko wizualnie','Nie trzeba'],0],
 ['Kiedy aparat jest rezerwowy?', ['Gdy jest zamontowany, ale nie zasila odbiornika','Gdy jest zepsuty','Gdy nie ma PE','Gdy zwiera dwie fazy'],0],
 ['Czym jest grzebień zasilający?', ['Elementem rozdziału zasilania na kompatybilne aparaty','Szyną PE','SPD','Gniazdem'],0]
];
const LIMIT=75*60,KEY='rozdzielnicapro_exam_v0714';
const state={active:false,step:'intro',question:0,questions:[],answers:[],tasks:[],round:0,practice:[],started:0,interval:null};
const user=()=>window.ElektrykAuth?.currentAccountId?.()||'anon';
function load(){try{return JSON.parse(localStorage.getItem(KEY+':'+user())||'[]')}catch{return []}}
function store(result){try{localStorage.setItem(KEY+':'+user(),JSON.stringify([result,...load()].slice(0,20)))}catch{}}
function sample(items,n){const pool=items.slice(),out=[];while(pool.length&&out.length<n){const i=Math.floor(Math.random()*pool.length);out.push(pool.splice(i,1)[0])}return out}
function choices(){
 const catalog=window.ElektrykTasks?.all||[];
 function eligible(group){return catalog.filter(t=>t.group===group&&t.id>40&&t.requirements.RCD<=3&&(t.requirements.RCBO||0)<=2&&(t.requirements.B10||0)+(t.requirements.B16||0)<=7)}
 return ['one','two','three'].map(g=>sample(eligible(g),1)[0]).filter(Boolean);
}
const panel=document.createElement('section');
panel.id='examPanel';panel.className='exam-panel';panel.hidden=true;
panel.innerHTML='<div class="exam-head"><div><small>ROZDZIELNICAPRO.PL • SPRAWDZIAN WIEDZY</small><h2>EGZAMIN SZKOLENIOWY</h2></div><b id="examClock">75:00</b></div><div class="exam-status"><span id="examProgress">10 pytań + 3 rozdzielnice</span><span id="examPoints">100 pkt</span></div><div id="examBody"></div><div class="exam-buttons"><button id="examPrimary" type="button">ROZPOCZNIJ</button><button id="examExit" type="button">ZAKOŃCZ</button></div><p class="exam-disclaimer">To egzamin dydaktyczny, nie uprawnienia zawodowe ani protokół odbiorczy.</p>';
document.querySelector('.workspace')?.prepend(panel);
const el=id=>panel.querySelector('#'+id),content=el('examBody'),primary=el('examPrimary');
const clock=el('examClock'),progress=el('examProgress'),points=el('examPoints');
const minutes=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
function stop(){if(state.interval)clearInterval(state.interval);state.interval=null}
function mode(step){state.step=step;document.body.classList.toggle('exam-active',state.active);document.body.classList.toggle('exam-theory',step==='theory')}
function intro(){
 stop();state.active=false;mode('intro');panel.hidden=false;clock.textContent='75:00';
 progress.textContent='10 pytań + 3 rozdzielnice';points.textContent='Maksimum 100 pkt';
 content.replaceChildren();
 const wrap=document.createElement('div');wrap.className='exam-intro';
 wrap.innerHTML='<h3>Teoria i zadania praktyczne</h3><p>10 losowanych pytań × 4 pkt oraz 3 losowane rozdzielnice × 20 pkt. Na wszystko masz 75 minut. Do zdania potrzeba co najmniej 70/100 pkt, w tym 40 pkt z praktyki. Schematy i podpowiedzi zostają ukryte podczas egzaminu.</p>';
 const history=load()[0];if(history){const p=document.createElement('p');p.textContent='Ostatnia próba: '+history.total+'/100 • '+(history.passed?'ZDANA':'NIEZDANA');wrap.appendChild(p)}
 content.append(wrap);primary.hidden=false;primary.textContent='ROZPOCZNIJ EGZAMIN';
}
function start(){
 if(window.ElektrykAuth?.isDemo?.())return false;
 state.tasks=choices();
 if(state.tasks.length<3){content.textContent='Brak wymaganych zadań do egzaminu — odśwież stronę.';return false}
 state.questions=sample(BANK,10);state.answers=[];state.practice=[];state.question=0;state.round=0;
 state.started=Date.now();state.active=true;mode('theory');renderQuestion();
 stop();state.interval=setInterval(()=>{
  if(!state.active)return;
  const left=Math.max(0,LIMIT-Math.floor((Date.now()-state.started)/1000));
  clock.textContent=minutes(left);
  if(!left)finish('timeout');
 },1000);
 return true;
}
function renderQuestion(){
 const q=state.questions[state.question];
 progress.textContent='TEORIA • '+(state.question+1)+'/10';points.textContent='40 pkt za teorię';
 content.replaceChildren();
 const h=document.createElement('h3');h.textContent=q[0];content.appendChild(h);
 q[1].forEach((value,i)=>{
  const b=document.createElement('button');b.className='exam-answer';b.type='button';
  b.textContent=String.fromCharCode(65+i)+'. '+value;
  b.addEventListener('click',()=>{
   if(!state.active||state.step!=='theory')return;
   state.answers.push(i);state.question++;
   if(state.question===10){state.round=0;showPractical()}else renderQuestion();
  });
  content.appendChild(b);
 });
 primary.hidden=true;
}
function showPractical(){
 mode('practice');
 const t=state.tasks[state.round];window.ElektrykTasks?.start?.(t.id);
 progress.textContent='PRAKTYKA • '+(state.round+1)+'/3';points.textContent='60 pkt za montaż i połączenia';
 content.replaceChildren();
 const wrap=document.createElement('div');wrap.className='exam-intro';
 const title=document.createElement('h3');title.textContent=t.title;
 const details=document.createElement('p');details.textContent=t.rows+'×'+t.modulesPerRow+'M • '+Object.entries(t.requirements).map(([k,v])=>k+'×'+v).join(' • ')+'. Zamontuj aparaturę i wykonaj wszystkie połączenia bez korzystania z podpowiedzi.';
 wrap.append(title,details);content.append(wrap);
 primary.hidden=false;primary.textContent=state.round===2?'OCEŃ I ZAKOŃCZ':'OCEŃ I NASTĘPNA ROZDZIELNICA';
}
function evaluatePractical(){
 if(!state.active||state.step!=='practice')return;
 const mounted=!!window.ElektrykLearningBoard?.evaluate?.()?.complete;
 window.ElektrykPower?.analyze?.();
 const a=window.ElektrykPower?.getLast?.();
 const powered=(a?.states||[]).length>0&&(a.states||[]).every(s=>s.complete)&&
  !(a.issues||[]).some(x=>x.type==='error')&&!(a.collisions||[]).length;
 state.practice.push({task:state.tasks[state.round].id,title:state.tasks[state.round].title,mounted,powered,points:(mounted?10:0)+(powered?10:0)});
 state.round++;
 if(state.round===3)finish('done');else showPractical();
}
function finish(reason){
 if(!state.active)return;
 stop();state.active=false;mode('result');
 const theory=state.answers.filter((a,i)=>a===state.questions[i][2]).length*4;
 const practice=state.practice.reduce((sum,x)=>sum+x.points,0),total=theory+practice;
 const passed=reason==='done'&&total>=70&&practice>=40;
 const result={at:Date.now(),reason,theory,practice,total,passed,tasks:state.practice,
  wrong:state.questions.filter((q,i)=>state.answers[i]!==q[2]).map(q=>({question:q[0],correct:q[1][q[2]]}))};
 store(result);
 progress.textContent=reason==='done'?'WYNIK KOŃCOWY':'KONIEC CZASU';
 points.textContent=total+'/100 pkt';
 content.replaceChildren();
 const h=document.createElement('h3');h.textContent=passed?'✓ EGZAMIN ZDANY':'EGZAMIN NIEZDANY';
 const p=document.createElement('p');p.textContent='Razem: '+total+'/100 • teoria: '+theory+'/40 • praktyka: '+practice+'/60';
 const wrap=document.createElement('div');wrap.className='exam-report '+(passed?'passed':'failed');wrap.append(h,p);
 state.practice.forEach(x=>{const row=document.createElement('p');row.textContent=x.title+' — '+x.points+'/20 pkt';wrap.append(row)});
 if(result.wrong.length){const title=document.createElement('h4');title.textContent='Pytania do powtórzenia';wrap.append(title);result.wrong.forEach(w=>{const row=document.createElement('p');row.textContent=w.question+' Poprawna odpowiedź: '+w.correct;wrap.append(row)})}
 content.append(wrap);primary.hidden=false;primary.textContent='NOWA PRÓBA';
}
function open(){if(window.ElektrykAuth?.isDemo?.())return false;intro();return true}
function close(){
 stop();state.active=false;mode('intro');panel.hidden=true;
 document.body.classList.remove('exam-active','exam-theory');
 window.ElektrykAuth?.openHub?.();
}
primary.addEventListener('click',()=>{if(state.step==='intro'||state.step==='result')start();else if(state.step==='practice')evaluatePractical()});
el('examExit').addEventListener('click',close);
window.ElektrykExam={open,start,close,assess:evaluatePractical,history:load,getState:()=>({active:state.active,step:state.step,round:state.round,question:state.question}),questionBankSize:BANK.length};
})();