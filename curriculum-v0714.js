/* RozdzielnicaPRO.pl — katalog 300 zadań / v0.7.14
   260 deterministycznych, unikatowych zadań montażowych uzupełniających 40 istniejących.
   Każdy układ jest kontrolowany pod kątem modułów i algorytmu wzorca.
   Są to scenariusze DYDAKTYCZNE; nie są projektami wykonawczymi instalacji. */
(()=>{
'use strict';
const WIDTH={FR:4,SPD:2,RCD:2,RCBO:2,B10:1,B16:1};
const CONTEXTS=[
  'Mieszkanie jednopokojowe','Dom parterowy','Dom piętrowy','Kuchnia i jadalnia',
  'Garaż i warsztat','Pomieszczenie techniczne','Biuro z zapleczem',
  'Pracownia komputerowa','Dom z ogrodem','Lokal usługowy',
  'Instalacja oświetlenia','Gniazda ogólne','Wydzielona łazienka',
  'Pralnia i kotłownia','Instalacja garażowa','Budynek gospodarczy',
  'Oświetlenie piętra','Strefa rekreacyjna','Warsztat hobby',
  'Dom dwurodzinny','Budynek biurowy','Rozdział na kondygnacje',
  'Instalacja wielostrefowa','Duża rozdzielnica mieszkalna',
  'Obwody z osobnym RCBO','Ochrona obwodów gniazd',
  'Instalacja z rozbudową','Nowa sekcja odbiorcza',
  'Remont i modernizacja','Rozdzielnica rezerwowa'
];
const GOALS=[
 'Rozmieść zabezpieczenia na szynach DIN zgodnie ze wzorcem i zweryfikuj tory L/N/PE.',
 'Rozdziel obwody odbiorcze na sekcje ochronne i sprawdź niezależność ich torów N.',
 'Zaplanuj miejsce na zabezpieczenia i wykonaj kontrolę zasilania czterech obwodów testowych.',
 'Zwróć uwagę na rozdzielenie funkcji FR, RCD, RCBO i zabezpieczeń nadprądowych.',
 'Wykonaj montaż zgodnie ze schematem, a następnie sprawdź diagnostykę połączeń.',
 'Przeprowadź trasowanie faz i neutralnych torów za poszczególnymi urządzeniami ochronnymi.',
 'Sprawdź kompletność wyposażenia, układ modułów i sposób podłączenia SPD.',
 'Przypisz aparaty do właściwych grup i sprawdź wszystkie błędy zgłoszone przez analizator.'
];
const CONFIGS=[
 {from:41,to:110,group:'one',rows:1,cols:18,boardId:'TRAINING-TASK',section:'PODSTAWY'},
 {from:111,to:180,group:'two',rows:2,cols:18,boardId:'TRAINING-TASK',section:'PRAKTYKA'},
 {from:181,to:230,group:'three',rows:3,cols:18,boardId:'TRAINING-TASK',section:'INSTALACJE'},
 {from:231,to:260,group:'xl',rows:3,cols:12,boardId:'REF-3X12-FLUSH-SURFACE',section:'PROJEKTY'},
 {from:261,to:280,group:'xl',rows:5,cols:12,boardId:'REF-5X12',section:'ZAAWANSOWANE'},
 {from:281,to:300,group:'xl',rows:5,cols:24,boardId:'REF-5X24',section:'EKSPERT'}
];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const used=r=>Object.entries(r).reduce((n,[k,v])=>n+(WIDTH[k]||0)*v,0);
function feasible(req,rows,cols){
 if(used(req)>rows*cols)return false;
 const groups=[],main=4+(req.SPD||0)*2;groups.push(main);
 const sec=Array.from({length:req.RCD||0},()=>2);
 const breakers=[...Array(req.B10||0).fill(1),...Array(req.B16||0).fill(1)];
 if(sec.length)breakers.forEach((value,i)=>sec[i%sec.length]+=value);
 else if(breakers.length)groups.push(breakers.length);
 groups.push(...sec,...Array(req.RCBO||0).fill(2));
 const usage=Array(rows).fill(0);
 for(const g of groups){
   let i=usage.findIndex(v=>v+g<=cols);
   if(i===-1)return false;
   usage[i]+=g;
 }
 return usage.every(x=>x<=cols);
}
function makeRng(seed){
 let state=seed>>>0;
 return ()=>{state=(state+0x6D2B79F5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296};
}
const key=(r,config)=>[config.rows,config.cols,...Object.keys(WIDTH).map(k=>r[k]||0)].join('-');
const catalogue=[],seen=new Set();
for(const conf of CONFIGS){
 for(let id=conf.from;id<=conf.to;id++){
   let candidate=null;
   for(let attempt=0;attempt<12000;attempt++){
     const r=makeRng(id*11939+attempt*773+42);
     const capacity=conf.rows*conf.cols;
     const maxRcd=conf.rows===1?2:conf.cols===12?clamp(conf.rows+1,2,7):clamp(conf.rows*2+2,3,12);
     const maxRCBO=conf.rows===1?3:Math.min(12,conf.rows*3+2);
     const req={FR:1};
     if(r()<.58)req.SPD=1;
     req.RCD=1+Math.floor(r()*maxRcd);
     if(r()<.72)req.RCBO=1+Math.floor(r()*maxRCBO);
     const room=capacity-used(req);
     if(room<2)continue;
     const target=clamp(Math.floor(capacity*(.46+r()*.46)),used(req)+2,capacity);
     const free=Math.max(2,target-used(req));
     req.B10=1+Math.floor(r()*(free-1));
     req.B16=free-req.B10;
     if(req.B16<1||req.B10<1)continue;
     if(!feasible(req,conf.rows,conf.cols))continue;
     const signature=key(req,conf);
     if(seen.has(signature))continue;
     seen.add(signature);candidate=req;break;
   }
   if(!candidate)throw new Error('Brak możliwego zadania dla ID '+id);
   const count=used(candidate),context=CONTEXTS[(id*7+Math.floor(id/17))%CONTEXTS.length],
     goal=GOALS[(id*3+Math.floor(id/31))%GOALS.length];
   const tips=[
     'Zaplanuj '+conf.rows+' szyn DIN po '+conf.cols+' modułów; układ wymaga '+count+' modułów.',
     candidate.RCD>1?'Rozdziel sekcje RCD; nie łącz neutralnych wyjść różnych urządzeń.':'Sprawdź rozdział L/N/PE i neutralny biegun RCD.',
     candidate.RCBO?'RCBO ma własny tor L i N — nie łącz jego wyjścia N z inną sekcją.':'Wykorzystaj MCB do indywidualnego zabezpieczenia obwodów.',
     candidate.SPD?'SPD jest ochroną równoległą; nie może pełnić funkcji wyłącznika nadprądowego.':'Zwróć uwagę na zasilenie rozłącznika FR przed sekcją RCD.',
     'Po wykonaniu montażu uruchom analizator i odczytaj wyniki czterech obwodów testowych.'
   ];
   catalogue.push({
     id,title:context+' • układ '+String(id).padStart(3,'0'),
     description:goal+' Wyposażenie: '+Object.entries(candidate).map(([name,value])=>name+'×'+value).join(', ')+'.',
     requirements:candidate,rows:conf.rows,modulesPerRow:conf.cols,
     boardId:conf.boardId,group:conf.group,section:conf.section,
     level:conf.rows===1?'PODSTAWY':conf.rows===2?'ŚREDNIE':conf.rows===3?'TRUDNE':conf.cols===24?'MASTER':'EKSPERT',
     xp:clamp(110+Math.floor(count*12)+conf.rows*35,150,1100),
     topics:[...(candidate.RCD>1?['RCD','N']:['RCD']),...(candidate.RCBO?['RCBO']:[]),...(candidate.SPD?['SPD']:[]),'MCB','DIN','L/N/PE'],
     tips
   });
 }
}
const API={extraTasks:()=>catalogue.map(t=>({...t,requirements:{...t.requirements},tips:[...t.tips],topics:[...t.topics]})),
  validate:()=>({count:catalogue.length,unique:new Set(catalogue.map(x=>key(x.requirements,{rows:x.rows,cols:x.modulesPerRow}))).size,
    fits:catalogue.every(x=>feasible(x.requirements,x.rows,x.modulesPerRow)),
    ids:catalogue.map(x=>x.id),min:41,max:300}),
  feasible};
window.ElektrykCurriculum=API;
})();
