/* RozdzielnicaPRO.pl v0.7.15 — Automatic Board + Guided Assembly.
   Uses actual deterministic reference placement, native mount/connection APIs.
   FOUR model test loads only. Not a real-world electrical installation plan. */
(()=>{
'use strict';
const LOADS=['LIGHT','SOCKET','KITCHEN','WASH'];
const LABELS={LIGHT:'oświetlenie',SOCKET:'gniazda',KITCHEN:'kuchnia',WASH:'pralka'};
const POLES={
 FR:{top:['L1','L2','L3','N'],bottom:['L1','L2','L3','N']},
 RCD:{top:['L','N'],bottom:['L','N']},
 RCD4:{top:['L1','L2','L3','N'],bottom:['L1','L2','L3','N']},
 SPD:{top:['L','N'],bottom:['PE']},
 RCBO:{top:['L','N'],bottom:['L','N']}
};
const getPoles=(d,side)=>POLES[d.code]?.[side]||
 (/^[BC]\d+$/.test(d.code)?['L']:[]);
function terminal(d,side,role){
 const ports=getPoles(d,side),idx=ports.indexOf(role);
 if(idx<0)throw new Error('Brak zacisku '+d.code+'/'+side+'/'+role);
 return d.id+':'+side.toUpperCase()+':'+role+':'+idx;
}
function diagram(task,plan){
 if(!task||!plan?.devices?.length)return null;
 const devices=plan.devices.map((d,i)=>({
   id:'AT'+(i+1),code:d.code,row:d.row,start:d.start,modules:d.modules,switchState:'on',
   section:d.section,kind:d.kind,phase:d.phase
 }));
 const groups=(plan.groups||[]).map(g=>({
   kind:g.kind,items:g.items.map(d=>devices.find(m=>m.code===d.code&&m.row===d.row&&m.start===d.start)).filter(Boolean)
 }));
 const fr=devices.find(d=>d.code==='FR');
 const rcdSections=groups.filter(g=>g.kind==='section'&&g.items[0]?.code==='RCD'&&g.items.length>1)
   .sort((a,b)=>(b.items.length-a.items.length));
 const rcbos=devices.filter(d=>d.code==='RCBO');
 const spd=devices.find(d=>d.code==='SPD');
 const wires=[],bridges=[],steps=[];
 let wireId=1,bridgeId=1;
 const addWire=(a,b,type,why)=>{
   const item={id:'W'+wireId++,a,b,type,cable:type==='PE'?'H07V-K 1×2,5':type==='N'?'H07V-K 1×2,5':'H07V-K 1×2,5'};
   wires.push(item);steps.push({kind:'wire',item,why});return item;
 };
 const addBridge=(a,b,phase,why)=>{
   const item={id:'BR'+bridgeId++,a,b,phase,kind:'bridge'};
   bridges.push(item);steps.push({kind:'bridge',item,why});return item;
 };
 devices.forEach(d=>steps.push({kind:'mount',item:d,why:'Zamontuj '+d.code+' na szynie DIN '+(d.row+1)+', od modułu '+(d.start+1)+' do '+(d.start+d.modules)+'.'}));
 if(!fr)return {devices,wires,bridges,steps,connectedLoads:0,unwiredNote:'Brak rozłącznika FR.'};
 for(const p of ['L1','L2','L3','N']){
   addWire('SUPPLY:'+p,terminal(fr,'top',p),p,'Doprowadź tor '+p+' ze źródła do rozłącznika FR.');
 }
 addWire('SUPPLY:PE','BAR:PE:1','PE','Doprowadź przewód ochronny PE do głównej listwy PE.');
 const rootPhase=terminal(fr,'bottom','L1'),rootN=terminal(fr,'bottom','N');
 const firstRcd=rcdSections[0]?.items[0];
 // One outgoing wire per terminal; shared supply branches use educational bridges.
 let upstreamL=null,upstreamN=null;
 function feed(d){
   const topL=terminal(d,'top','L'),topN=terminal(d,'top','N');
   if(upstreamL===null){
     addWire(rootPhase,topL,'L1','Zasil wejście L '+d.code+' z FR, przed ochroną różnicowoprądową.');
   }else addBridge(upstreamL,topL,'L1','Rozdziel upstream L1 na wejście kolejnego RCD/RCBO.');
   if(upstreamN===null){
     addWire(rootN,topN,'N','Doprowadź N z FR na wejście pierwszego aparatu RCD/RCBO.');
   }else addBridge(upstreamN,topN,'N','Przekaż N po stronie wejściowej, nie mieszając wyjść RCD.');
   upstreamL=topL;upstreamN=topN;
 }
 // Each independent RCD supports its own output N. The primary RCD uses the
 // educational N bar, supplementary RCDs support one load each (no shared N).
 const candidateSections=rcdSections.filter(g=>g.items[0]&&g.items.slice(1).length>0);
 const chosen=rcdSections[0];
 const assignments=[];
 if(chosen)for(const breaker of chosen.items.slice(1).slice(0,4))assignments.push({kind:'mcb',breaker,rcd:chosen.items[0],main:true});
 for(const sec of rcdSections.slice(1)){
   if(assignments.length>=4)break;
   const breaker=sec.items[1];if(breaker)assignments.push({kind:'mcb',breaker,rcd:sec.items[0],main:false});
 }
 for(const rcbo of rcbos){if(assignments.length>=4)break;assignments.push({kind:'rcbo',breaker:rcbo})}
 const usedRcds=[];
 for(const a of assignments){
   if(a.kind==='mcb'&&!usedRcds.includes(a.rcd))usedRcds.push(a.rcd);
 }
 const feeds=[...usedRcds,...assignments.filter(a=>a.kind==='rcbo').map(a=>a.breaker)];
 feeds.forEach(feed);
 let peIndex=2,nIndex=2;
 const rcdToBreakers=new Map();
 for(const [i,a] of assignments.entries()){
   const load=LOADS[i],label=LABELS[load];
   if(a.kind==='mcb'){
     const breakers=rcdToBreakers.get(a.rcd.id)||[];
     const top=terminal(a.breaker,'top','L');
     if(!breakers.length){
       addWire(terminal(a.rcd,'bottom','L'),top,'L1','Połącz wyjście L RCD z wejściem pierwszego wyłącznika MCB.');
       if(a.main)addWire(terminal(a.rcd,'bottom','N'),'BAR:N:1','N','Wyprowadź neutralny N sekcji RCD na listwę N odbiorników.');
     }else{
       const prior=terminal(breakers[breakers.length-1],'top','L');
       addBridge(prior,top,'L1','Połącz wejścia MCB mostkiem z tej samej sekcji RCD.');
     }
     breakers.push(a.breaker);rcdToBreakers.set(a.rcd.id,breakers);
     addWire(terminal(a.breaker,'bottom','L'),'LOAD:'+load+':L','L1','Zasil tor L obwodu '+label+' z MCB '+a.breaker.code+'.');
     if(a.main)addWire('BAR:N:'+(nIndex++),'LOAD:'+load+':N','N','Przypisz neutralny N obwodu '+label+' do sekcji tego RCD.');
     else addWire(terminal(a.rcd,'bottom','N'),'LOAD:'+load+':N','N','Połącz neutralne wyjście osobnego RCD z N obwodu '+label+'.');
   }else{
     addWire(terminal(a.breaker,'bottom','L'),'LOAD:'+load+':L','L1','Poprowadź fazę L z własnego RCBO do obwodu '+label+'.');
     addWire(terminal(a.breaker,'bottom','N'),'LOAD:'+load+':N','N','Przypisz wyjście N RCBO tylko do obwodu '+label+'.');
   }
   addWire('BAR:PE:'+(peIndex++),'LOAD:'+load+':PE','PE','Poprowadź PE z głównej listwy ochronnej do '+label+'.');
 }
 if(spd){
   addBridge(terminal(fr,'bottom','L2'),terminal(spd,'top','L'),'L2','Dołącz SPD jako odgałęzienie toru fazowego, nie szeregowo.');
   addBridge(rootN,terminal(spd,'top','N'),'N','Dołącz wejście N SPD przed RCD.');
   addWire(terminal(spd,'bottom','PE'),'BAR:PE:'+peIndex,'PE','Połącz SPD z listwą ochronną PE.');
 }
 const unmapped=Math.max(0,LOADS.length-assignments.length);
 return {devices,wires,bridges,steps,connectedLoads:assignments.length,
   unwiredNote:unmapped?'Dostępne zabezpieczenia umożliwiają tu podłączenie '+assignments.length+' z 4 odbiorników testowych. Pozostałe pozostają niezasilone; urządzenia spoza demonstracji są rezerwowe.':'Wszystkie cztery odbiorniki testowe zostały podłączone. Pozostałe urządzenia są rezerwowe.'};
}
function validate(board){
 const occupied=new Set();for(const d of board.devices)for(let n=d.start;n<d.start+d.modules;n++){
   const key=d.row+':'+n;if(occupied.has(key))return {ok:false,reason:'Powtórzony moduł '+key};
   occupied.add(key);
 }
 const wireTerm=new Set();
 for(const w of board.wires){if(wireTerm.has(w.a)||wireTerm.has(w.b))return {ok:false,reason:'Wielokrotnie użyty zacisk przewodu '+w.id};wireTerm.add(w.a);wireTerm.add(w.b)}
 return {ok:true,mounted:board.devices.length,wires:board.wires.length,bridges:board.bridges.length};
}
window.ElektrykAutoBoard={diagram,validate};
})();