/* RozdzielnicaPRO.pl v0.7.15.1 — pełne szkoleniowe okablowanie.
   Wszystkie wymagane MCB/RCBO otrzymują L/N/PE i osobny odbiornik.
   N sekcji RCD pozostają odizolowane; rozdział PE jest wspólny.
   Model dydaktyczny, nie projekt wykonawczy ani dobór aparatów/przekrojów. */
(()=>{
'use strict';
const BASE=['LIGHT','SOCKET','KITCHEN','WASH'];
const LABELS={LIGHT:'oświetlenie',SOCKET:'gniazda',KITCHEN:'kuchnia',WASH:'pralka'};
const POL={
 FR:{top:['L1','L2','L3','N'],bottom:['L1','L2','L3','N']},
 RCD:{top:['L','N'],bottom:['L','N']},RCD4:{top:['L1','L2','L3','N'],bottom:['L1','L2','L3','N']},
 SPD:{top:['L','N'],bottom:['PE']},SPD4:{top:['L1','L2','L3','N'],bottom:['PE']},
 RCBO:{top:['L','N'],bottom:['L','N']},
 RCBO10:{top:['L','N'],bottom:['L','N']},
 RCBO20:{top:['L','N'],bottom:['L','N']}
};
const phases=['L1','L2','L3'];
function ports(d,side){return POL[d.code]?.[side]||(/^[BC]\d+$/.test(d.code)?['L']:[])}
function t(d,side,role){
 const n=ports(d,side).indexOf(role);
 if(n<0)throw Error('Nieprawidłowy zacisk: '+d.code+' '+side+' '+role);
 return d.id+':'+side.toUpperCase()+':'+role+':'+n;
}
function diagram(task,plan){
 if(!task||!plan?.devices?.length)return null;
 const devices=plan.devices.map((d,i)=>({id:'AT'+(i+1),code:d.code,row:d.row,start:d.start,modules:d.modules,switchState:'on',section:d.section,kind:d.kind,phase:d.phase}));
 const byPos=new Map(devices.map(d=>[d.row+':'+d.start+':'+d.code,d]));
 const groups=(plan.groups||[]).map(g=>({kind:g.kind,items:g.items.map(d=>byPos.get(d.row+':'+d.start+':'+d.code)).filter(Boolean)}));
 const fr=devices.find(d=>d.code==='FR'),spd=devices.find(d=>d.code==='SPD');
 const sections=groups.filter(g=>g.kind==='section'&&g.items[0]?.code==='RCD');
 const standalone=groups.filter(g=>g.kind==='direct').flatMap(g=>g.items);
 const rcbos=devices.filter(d=>d.code==='RCBO');
 const wires=[],bridges=[],steps=[],loads=[],nSections=[];
 let wireId=1,bridgeId=1;
 const wire=(a,b,type,why)=>{
   const item={id:'W'+wireId++,a,b,type,cable:type==='L1'?'YDYp 3×1,5':'H07V-K 1×2,5'};
   wires.push(item);steps.push({kind:'wire',item,why});return item;
 };
 const bridge=(a,b,phase,why)=>{
   const item={id:'BR'+bridgeId++,a,b,phase,kind:'bridge'};
   bridges.push(item);steps.push({kind:'bridge',item,why});return item;
 };
 devices.forEach(d=>steps.push({kind:'mount',item:d,why:'Zamontuj '+d.code+' na szynie DIN '+(d.row+1)+', od modułu '+(d.start+1)+' do '+(d.start+d.modules)+'.'}));
 if(!fr)return {devices,wires,bridges,steps,loads,nSections,connectedLoads:0,unwiredNote:'Brak FR.'};
 for(const role of ['L1','L2','L3','N'])wire('SUPPLY:'+role,t(fr,'top',role),role,'Podłącz zasilanie WLZ '+role+' do wejścia FR.');
 wire('SUPPLY:PE','BAR:PE:1','PE','Doprowadź przewód PE do głównej szyny ochronnej.');
 wire('BAR:PE:3','AUTO:PE:0','PE','Połącz główną listwę PE z listwą zbiorczą obwodów wyjściowych.');
 const phaseFeeds=new Map(),neutralRoot=t(fr,'bottom','N');
 let upstreamN=null;
 function feed(d,phase){
   const l=t(d,'top','L'),n=t(d,'top','N');
   if(!phaseFeeds.has(phase))wire(t(fr,'bottom',phase),l,phase,'Doprowadź '+phase+' do wejścia '+d.code+'.');
   else bridge(phaseFeeds.get(phase),l,phase,'Rozdziel '+phase+' na wejście kolejnego aparatu ochronnego.');
   phaseFeeds.set(phase,l);
   if(upstreamN===null)wire(neutralRoot,n,'N','Doprowadź N od FR do pierwszego wejścia ochronnego.');
   else bridge(upstreamN,n,'N','Rozdziel N tylko po stronie zasilającej aparaty RCD/RCBO.');
   upstreamN=n;
 }
 // Each RCD group is fed independently, with a dedicated downstream N rail.
 const receivers=[];
 for(let i=0;i<sections.length;i++){
   const sec=sections[i],rcd=sec.items[0],breakers=sec.items.slice(1).filter(d=>/^[BC]\d+$/.test(d.code));
   const phase=phases[i%3];feed(rcd,phase);
   if(!breakers.length)continue;
   const prefix='AUTO:N:'+rcd.id+':';
   nSections.push({id:rcd.id,label:'N • RCD '+(i+1),ports:breakers.length+1});
   wire(t(rcd,'bottom','N'),prefix+'0','N','Wyprowadź oddzielny N za RCD '+(i+1)+' na listwę tej sekcji.');
   let before=null;
   for(const breaker of breakers){
     const top=t(breaker,'top','L');
     if(before===null)wire(t(rcd,'bottom','L'),top,phase,'Doprowadź '+phase+' z wyjścia RCD do pierwszego MCB sekcji.');
     else bridge(before,top,phase,'Rozprowadź '+phase+' między MCB w obrębie tej samej sekcji RCD.');
     before=top;
     receivers.push({kind:'mcb',breaker,phase,rcd,neutralId:prefix+(receivers.filter(x=>x.rcd?.id===rcd.id).length+1)});
   }
 }
 for(let i=0;i<rcbos.length;i++){
   const d=rcbos[i],phase=phases[(i+sections.length)%3];
   feed(d,phase);receivers.push({kind:'rcbo',breaker:d,phase});
 }
 // Optionally supply direct MCBs but do not claim RCD protection where none exists.
 if(standalone.length){
   const phase='L1',source=t(fr,'bottom',phase);
   let previous=phaseFeeds.get(phase)||null;
   for(const breaker of standalone){
     const top=t(breaker,'top','L');
     if(previous===null)wire(source,top,phase,'Zasil bezpośredni MCB (bez RCD w scenariuszu).');
     else bridge(previous,top,phase,'Rozdziel zasilanie na następny MCB.');
     previous=top;
     receivers.push({kind:'mcb',breaker,phase,direct:true});
   }
 }
 // Protected educational outputs: 4 established loads, then dynamically numbered outputs.
 const pePorts=receivers.length;
 for(let i=0;i<receivers.length;i++){
   const a=receivers[i],load=i<BASE.length?BASE[i]:'AUTO'+String(i-3).padStart(3,'0');
   const label=LABELS[load]||'obwód '+String(i+1).padStart(2,'0');
   loads.push({id:load,label,code:a.breaker.code,phase:a.phase,number:i+1,breakerId:a.breaker.id});
   wire(t(a.breaker,'bottom','L'),'LOAD:'+load+':L',a.phase,'Podłącz '+a.phase+' do '+label+' przez '+a.breaker.code+'.');
   if(a.kind==='rcbo')wire(t(a.breaker,'bottom','N'),'LOAD:'+load+':N','N','Podłącz własny N obwodu '+label+' przez RCBO.');
   else if(a.neutralId)wire(a.neutralId,'LOAD:'+load+':N','N','Podłącz N obwodu '+label+' do wyjściowej listwy tego RCD.');
   else wire('BAR:N:'+Math.min(12,i+1),'LOAD:'+load+':N','N','Uwaga: bez RCD — N ze wspólnej listwy.');
   wire('AUTO:PE:'+String(i+1),'LOAD:'+load+':PE','PE','Podłącz ochronny PE do '+label+'.');
 }
 if(spd){
   bridge(t(fr,'bottom','L2'),t(spd,'top','L'),'L2','Dołącz SPD po stronie zasilającej.');
   bridge(neutralRoot,t(spd,'top','N'),'N','Połącz tor N SPD przed aparatami RCD.');
   wire(t(spd,'bottom','PE'),'BAR:PE:2','PE','Połącz SPD do listwy PE.');
 }
 const message='Przygotowano '+loads.length+' osobnych obwodów L/N/PE, '+sections.length+' sekcji RCD i '+rcbos.length+' RCBO. Jest to szkoleniowy rozdział obwodów, bez doboru obciążalności i pomiarów.';
 return {devices,wires,bridges,steps,loads,nSections,pePorts,connectedLoads:loads.length,unwiredNote:message};
}
function validate(board){
 const occupied=new Set(),terminals=new Set(),seenWire=new Set();
 for(const d of board.devices)for(let k=d.start;k<d.start+d.modules;k++){
   const x=d.row+':'+k;if(occupied.has(x))return {ok:false,reason:'Nakładające się moduły '+x};occupied.add(x);
 }
 for(const wire of board.wires){
   if(seenWire.has(wire.a)||seenWire.has(wire.b))return {ok:false,reason:'Kilka przewodów na jednym zacisku: '+wire.id};
   seenWire.add(wire.a);seenWire.add(wire.b);
 }
 const ids=board.loads.map(l=>l.id);
 if(new Set(ids).size!==ids.length)return {ok:false,reason:'Powtórzony obwód wyjściowy'};
 if(board.loads.some(l=>!l.id||!l.breakerId))return {ok:false,reason:'Brak wyjścia aparatu'};
 return {ok:true,mounted:board.devices.length,wires:board.wires.length,bridges:board.bridges.length,loads:board.loads.length};
}
window.ElektrykAutoBoard={diagram,validate};
})();