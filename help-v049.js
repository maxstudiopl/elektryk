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
7:['Podziel sześć MCB na dwie grupy i przypisz każdą grupę do osobnego RCD.','Każda sekcja RCD ma na schemacie własny tor N.'],
8:['Najpierw rozplanuj 18 modułów w oknie rozwiązania.','SPD i RCBO zajmują po 2M, dlatego montuj szerokie aparaty jako pierwsze.'],
9:['Pierwszy rząd przeznacz na wejście i część sekcji; drugi na dalsze grupy MCB.','Przy dwóch rzędach nie musisz wciskać wszystkiego w pierwszy — korzystaj z obu listew równomiernie.'],
10:['RCBO możesz umieścić na drugim rzędzie razem z wydzielonymi obwodami garażu.','Rozdziel obwody domu i garażu na czytelne grupy zamiast mieszać MCB naprzemiennie.'],
11:['Trzy RCD oznaczają trzy logiczne sekcje.','Dla każdej sekcji trzymaj osobny tor neutralny w schemacie rozwiązania.'],
12:['Najpierw rozstaw FR, SPD, trzy RCD i dwa RCBO — dopiero potem MCB.','Przy dużej liczbie aparatów używaj grzebienia oddzielnie dla każdego ciągu zabezpieczeń.'],
13:['Cztery RCD najlepiej rozłożyć pomiędzy oba rzędy.','Wydziel RCBO tak, żeby nie rozdzielał ciągu MCB przeznaczonego pod grzebień.'],
14:['Podziel dwa rzędy na strefy funkcjonalne.','Zacznij od aparatów 4M/2M, bo później łatwiej wypełnić luki aparatami 1M.'],
15:['Trzy RCBO warto zebrać w jednej części rozdzielnicy.','Przed układaniem 9×B16 policz wolne moduły.'],
16:['Na trzech rzędach zarezerwuj pierwszy na wejście i część ochrony.','Nie prowadź jednego grzebienia między rzędami; każdy rząd ma własny ciąg.'],
17:['Pięć RCD rozdziel pomiędzy trzy listwy, aby przy każdym zostało miejsce na grupę MCB.','Najpierw zbuduj szkielet FR/SPD/RCD/RCBO, potem dodawaj B10/B16.'],
18:['To zadanie ma 50M aparatury, więc kolejność montażu jest istotna.','Schemat pokazuje podział sekcji tak, aby RCD i jego MCB pozostawały razem.'],
19:['Przy 52M masz tylko 2 wolne moduły.','Grzebienie zakładaj dopiero po zakończeniu rozmieszczenia wszystkich aparatów.'],
20:['MASTER wykorzystuje pełne 54M — nie ma miejsca na pusty moduł.','Skorzystaj z pełnego schematu przed montażem: każdy aparat ma wyznaczony rząd.']
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
modal.innerHTML='<div class="solution-window"><div class="solution-head"><div><b id="solutionTitle">ROZWIĄZANIE</b><small id="solutionMeta"></small></div><button id="closeSolution">×</button></div><div class="solution-body"><div class="solution-warning"><b>TRYB EDUKACYJNY SYMULATORA</b> — schemat pokazuje logikę połączeń w grze. Nie jest projektem wykonawczym ani instrukcją pracy przy rzeczywistej instalacji.</div><div id="solutionLayout"></div><div id="solutionConnections"></div></div></div>';
document.body.appendChild(modal);

function currentTask(){return tasksApi.current?.()||stage2.getTask?.()||tasksApi.all?.[0]}
function mountedCounts(){
  const counts={};(stage2.getMounted?.()||[]).forEach(function(m){counts[m.code]=(counts[m.code]||0)+1});return counts;
}
function partName(code){return stage2.parts?.[code]?.name||code}
function missingRequirement(task){
  const have=mountedCounts();
  for(const entry of Object.entries(task.requirements||{})){
    const code=entry[0],need=entry[1];
    if((have[code]||0)<need)return {code:code,need:need,have:have[code]||0};
  }
  return null;
}
function contextHint(task){
  const miss=missingRequirement(task);
  if(miss)return 'Następny krok: zamontuj '+partName(miss.code)+' — masz '+miss.have+' z '+miss.need+'.';
  const conns=window.ElektrykStage3?.getConnections?.()||[];
  const bridges=window.ElektrykBridges?.getBridges?.()||[];
  if(conns.length===0)return 'Aparatura jest kompletna. Zacznij od toru zasilania WLZ → FR.';
  if(bridges.length===0&&[...document.querySelectorAll('.mounted-device')].some(function(m){return /^[BC]\d+$/.test(m.dataset.code)}))return 'Masz już przewody. Teraz możesz użyć MOSTKA lub GRZEBIENIA do rozprowadzenia fazy po sąsiednich MCB.';
  const analysis=window.ElektrykPower?.getLast?.();
  const firstError=analysis?.issues?.find(function(i){return i.type==='error'});
  if(firstError)return 'Analiza wykrywa: '+firstError.text;
  const complete=analysis?.states?.filter(function(s){return s.complete}).length||0;
  if(complete>0)return 'Dobrze: '+complete+' obwód/obwody mają już kompletny tor. Kontynuuj pozostałe L, N i PE.';
  return 'Sprawdź kolejno: FR, RCD/RCBO, grzebienie MCB, przewody N oraz PE.';
}

let hintIndex=0,lastTaskId=null;
function showHint(){
  const task=currentTask();if(!task)return;
  if(lastTaskId!==task.id){hintIndex=0;lastTaskId=task.id}
  const specific=SPECIFIC[task.id]||[];
  const hints=[contextHint(task)].concat(specific);
  hintBox.hidden=false;
  hintBox.innerHTML='<b>PODPOWIEDŹ • ZADANIE '+String(task.id).padStart(2,'0')+'</b><span>'+(hints[hintIndex%hints.length]||contextHint(task))+'</span><small>Kliknij ponownie, aby zobaczyć następną wskazówkę.</small>';
  hintIndex++;
}

function deviceModules(code){return stage2.parts?.[code]?.modules||1}
function makeDeviceFactory(){
  const counters={};
  return function(code,meta){
    counters[code]=(counters[code]||0)+1;
    return Object.assign({code:code,uid:code+'-'+counters[code],modules:deviceModules(code)},meta||{});
  };
}
function buildPlan(task){
  const req=task.requirements||{},make=makeDeviceFactory(),groups=[];
  const main=[];
  if(req.FR)main.push(make('FR',{kind:'main'}));
  if(req.SPD)main.push(make('SPD',{kind:'spd'}));
  if(main.length)groups.push({kind:'main',items:main});

  const rcdCount=req.RCD||0;
  const sections=Array.from({length:rcdCount},function(_,i){return {index:i+1,phase:['L1','L2','L3'][i%3],breakers:[]};});
  const breakerCodes=[];
  ['B10','B16'].forEach(function(code){for(let i=0;i<(req[code]||0);i++)breakerCodes.push(code)});
  if(sections.length){
    breakerCodes.forEach(function(code,i){sections[i%sections.length].breakers.push(code)});
    sections.forEach(function(sec){
      const items=[make('RCD',{kind:'rcd',section:sec.index,phase:sec.phase})];
      sec.breakers.forEach(function(code){items.push(make(code,{kind:'mcb',section:sec.index,phase:sec.phase}))});
      groups.push({kind:'section',section:sec.index,phase:sec.phase,items:items});
    });
  }else if(breakerCodes.length){
    groups.push({kind:'direct',phase:'L1',items:breakerCodes.map(function(code){return make(code,{kind:'mcb',section:0,phase:'L1'})})});
  }

  for(let i=0;i<(req.RCBO||0);i++){
    const phase=['L1','L2','L3'][i%3];
    groups.push({kind:'rcbo',phase:phase,items:[make('RCBO',{kind:'rcbo',section:'R'+(i+1),phase:phase})]});
  }

  Object.entries(req).forEach(function(entry){
    const code=entry[0],count=entry[1];
    if(['FR','SPD','RCD','RCBO','B10','B16'].includes(code))return;
    for(let i=0;i<count;i++)groups.push({kind:'extra',items:[make(code,{kind:'extra'})]});
  });

  const rows=Array.from({length:task.rows},function(){return {used:0,groups:[],items:[]};});
  groups.forEach(function(group){
    const gm=group.items.reduce(function(sum,d){return sum+d.modules},0);
    let ri=rows.findIndex(function(r){return r.used+gm<=18});
    if(ri<0)ri=rows.length-1;
    group.row=ri;group.start=rows[ri].used;
    let pos=group.start;
    group.items.forEach(function(d){d.row=ri;d.start=pos;pos+=d.modules;rows[ri].items.push(d)});
    rows[ri].groups.push(group);rows[ri].used+=gm;
  });
  return {task:task,rows:rows,groups:groups,devices:rows.flatMap(function(r){return r.items})};
}

const COLORS={L1:'#8b4a17',L2:'#161819',L3:'#747c80',N:'#0788d6',PE:'#5b9f39',COMB:'#b56d27'};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function deviceClass(code){
  if(code==='FR'||code.startsWith('FR'))return 'fr';
  if(code==='SPD')return 'spd';
  if(code==='RCD')return 'rcd';
  if(code==='RCBO')return 'rcbo';
  return 'mcb';
}
function portSpec(code){
  if(code==='FR'||code==='FR100')return {top:['L1','L2','L3','N'],bottom:['L1','L2','L3','N']};
  if(code==='FR40'||code==='RCD'||code==='RCBO')return {top:['L','N'],bottom:['L','N']};
  if(code==='SPD')return {top:['L','N'],bottom:['PE']};
  return {top:['L'],bottom:['L']};
}
function renderDeviceSvg(d,x,y,w,h,nodeMap){
  const spec=portSpec(d.code),cls=deviceClass(d.code),p=stage2.parts?.[d.code]||{};
  let s='<g class="scheme-device '+cls+'" data-device="'+d.uid+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/><text class="scheme-code" x="'+(x+w/2)+'" y="'+(y+43)+'">'+esc(d.code)+'</text><text class="scheme-rating" x="'+(x+w/2)+'" y="'+(y+58)+'">'+esc(p.rating||'')+'</text>';
  function ports(side,roles){
    roles.forEach(function(role,i){
      const px=x+w*(i+1)/(roles.length+1),py=side==='top'?y:y+h;
      const key=d.uid+':'+side.toUpperCase()+':'+role;
      nodeMap[key]={x:px,y:py,label:d.code+' '+(side==='top'?'góra ':'dół ')+role};
      s+='<circle class="scheme-port" cx="'+px+'" cy="'+py+'" r="4"/><text class="scheme-port-label '+side+'" x="'+px+'" y="'+(side==='top'?py-7:py+12)+'">'+role+'</text>';
    });
  }
  ports('top',spec.top);ports('bottom',spec.bottom);
  s+='</g>';return s;
}
function node(nodeMap,id){return nodeMap[id]||null}
function routePath(a,b,lane){
  if(!a||!b)return '';
  if(Math.abs(a.x-b.x)<1)return 'M '+a.x+' '+a.y+' L '+b.x+' '+b.y;
  const ly=lane==null?(a.y+b.y)/2:lane;
  return 'M '+a.x+' '+a.y+' L '+a.x+' '+ly+' L '+b.x+' '+ly+' L '+b.x+' '+b.y;
}
function buildSchematic(plan){
  const width=1240,left=120,right=35,slot=(width-left-right)/18,rowTop=150,rowGap=235,devH=105;
  const height=rowTop+plan.rows.length*rowGap+90;
  const nodeMap={},loads=[],busShapes=[],deviceSvg=[];
  const sourceX=18,sourceY=22,sourceW=88,sourceH=104;
  const sourceRoles=['L1','L2','L3','N','PE'];
  sourceRoles.forEach(function(role,i){nodeMap['WLZ:'+role]={x:sourceX+sourceW,y:sourceY+20+i*17,label:'WLZ '+role}});
  let shapes='<rect class="scheme-source" x="'+sourceX+'" y="'+sourceY+'" width="'+sourceW+'" height="'+sourceH+'" rx="5"/><text class="scheme-source-title" x="'+(sourceX+sourceW/2)+'" y="'+(sourceY+15)+'">WLZ</text>';
  sourceRoles.forEach(function(role,i){
    const p=nodeMap['WLZ:'+role];shapes+='<circle class="scheme-port source '+role+'" cx="'+p.x+'" cy="'+p.y+'" r="4"/><text class="scheme-source-label" x="'+(p.x-13)+'" y="'+(p.y+3)+'">'+role+'</text>';
  });

  plan.rows.forEach(function(row,ri){
    const y=rowTop+ri*rowGap;
    shapes+='<text class="scheme-row-title" x="'+left+'" y="'+(y-17)+'">LISTWA DIN '+(ri+1)+' • '+row.used+'/18M</text><rect class="scheme-din" x="'+left+'" y="'+(y+45)+'" width="'+(18*slot)+'" height="26" rx="2"/>';
    row.items.forEach(function(d){
      const x=left+d.start*slot,w=Math.max(32,d.modules*slot-3);
      d._geom={x:x,y:y,w:w,h:devH};
      deviceSvg.push(renderDeviceSvg(d,x,y,w,devH,nodeMap));
      if(d.kind==='mcb'||d.kind==='rcbo'){
        const lx=x+w/2-24,ly=y+151;
        const lid='LOAD:'+d.uid;
        loads.push({uid:lid,device:d,x:lx,y:ly,w:48,h:34});
        nodeMap[lid+':L']={x:lx+12,y:ly,label:'Obwód '+d.uid+' L'};
        nodeMap[lid+':N']={x:lx+24,y:ly,label:'Obwód '+d.uid+' N'};
        nodeMap[lid+':PE']={x:lx+36,y:ly,label:'Obwód '+d.uid+' PE'};
      }
    });
    const pey=y+138;
    nodeMap['PE:ROW'+(ri+1)]={x:width-right,y:pey,label:'Listwa PE rząd '+(ri+1)};
    busShapes.push('<line class="scheme-bus pe" x1="'+left+'" y1="'+pey+'" x2="'+(width-right)+'" y2="'+pey+'"/><text class="scheme-bus-label pe" x="'+(left+4)+'" y="'+(pey-5)+'">PE</text>');
  });

  loads.forEach(function(l){
    shapes+='<g class="scheme-load"><rect x="'+l.x+'" y="'+l.y+'" width="'+l.w+'" height="'+l.h+'" rx="4"/><text x="'+(l.x+l.w/2)+'" y="'+(l.y+20)+'">'+esc(l.device.code)+' OUT</text>';
    ['L','N','PE'].forEach(function(r,i){const p=nodeMap[l.uid+':'+r];shapes+='<circle class="scheme-load-port '+r+'" cx="'+p.x+'" cy="'+p.y+'" r="3"/>'});
    shapes+='</g>';
  });

  const fr=plan.devices.find(function(d){return d.code==='FR'||d.code.startsWith('FR')});
  const busX1=fr?Math.max(left+250,fr._geom.x+fr._geom.w+30):left+250,busX2=width-right;
  const busY={L1:48,L2:62,L3:76,N:96};
  ['L1','L2','L3'].forEach(function(ph){
    busShapes.push('<line class="scheme-bus phase '+ph+'" x1="'+busX1+'" y1="'+busY[ph]+'" x2="'+busX2+'" y2="'+busY[ph]+'"/><text class="scheme-bus-label" x="'+(busX1+4)+'" y="'+(busY[ph]-4)+'">'+ph+' ROZDZIAŁ</text>');
  });
  busShapes.push('<line class="scheme-bus nmain" x1="'+busX1+'" y1="'+busY.N+'" x2="'+busX2+'" y2="'+busY.N+'"/><text class="scheme-bus-label n" x="'+(busX1+4)+'" y="'+(busY.N-4)+'">N PRZED RCD</text>');

  const connections=[];
  let step=1;
  function addConn(from,to,type,category,label,lane,extra){
    if(!from||!to)return;
    connections.push({id:'S'+step,step:step++,from:from,to:to,type:type,category:category,label:label||'',lane:lane,extra:extra||{}});
  }
  function p(id){return node(nodeMap,id)}

  if(fr){
    const top=portSpec(fr.code).top,bottom=portSpec(fr.code).bottom;
    top.forEach(function(role){
      const supplyRole=role==='L'?'L1':role;
      addConn(p('WLZ:'+supplyRole),p(fr.uid+':TOP:'+role),supplyRole==='N'?'N':supplyRole,'zasilanie','WLZ '+supplyRole+' → '+fr.code+' góra '+role,rowTop-32);
    });
    if(p('WLZ:PE'))addConn(p('WLZ:PE'),{x:width-right,y:plan.rows[0]?rowTop+138:height-45,label:'PE główna'},'PE','ochronny','WLZ PE → listwa PE',height-38);
    bottom.forEach(function(role){
      if(role==='N')addConn(p(fr.uid+':BOTTOM:N'),{x:busX1,y:busY.N,label:'N rozdział'},'N','zasilanie',fr.code+' dół N → rozdział N',busY.N);
      else if(['L1','L2','L3'].includes(role))addConn(p(fr.uid+':BOTTOM:'+role),{x:busX1,y:busY[role],label:role+' rozdział'},role,'zasilanie',fr.code+' dół '+role+' → szyna '+role,busY[role]);
    });
  }

  plan.rows.forEach(function(row,ri){
    if(ri>0){
      addConn({x:width-right,y:rowTop+138,label:'PE główna'},p('PE:ROW'+(ri+1)),'PE','ochronny','PE główna → listwa PE rząd '+(ri+1),rowTop+ri*rowGap+138);
    }
  });

  const spd=plan.devices.find(function(d){return d.code==='SPD'});
  if(spd){
    const topL=p(spd.uid+':TOP:L'),topN=p(spd.uid+':TOP:N'),botPE=p(spd.uid+':BOTTOM:PE');
    if(topL)addConn({x:topL.x,y:busY.L1,label:'szyna L1'},topL,'L1','ochrona','L1 rozdział → SPD L',busY.L1);
    if(topN)addConn({x:topN.x,y:busY.N,label:'N rozdział'},topN,'N','ochrona','N rozdział → SPD N',busY.N);
    if(botPE)addConn(botPE,{x:botPE.x,y:rowTop+spd.row*rowGap+138,label:'PE'},'PE','ochrona','SPD PE → listwa PE',rowTop+spd.row*rowGap+138);
  }

  const sectionGroups=plan.groups.filter(function(g){return g.kind==='section'});
  sectionGroups.forEach(function(g){
    const rcd=g.items[0],breakers=g.items.slice(1),phase=g.phase,rowY=rowTop+rcd.row*rowGap;
    const topL=p(rcd.uid+':TOP:L'),topN=p(rcd.uid+':TOP:N'),botL=p(rcd.uid+':BOTTOM:L'),botN=p(rcd.uid+':BOTTOM:N');
    if(topL)addConn({x:topL.x,y:busY[phase],label:'szyna '+phase},topL,phase,'zasilanie',phase+' rozdział → '+rcd.uid+' góra L',busY[phase]);
    if(topN)addConn({x:topN.x,y:busY.N,label:'N rozdział'},topN,'N','neutralny','N przed RCD → '+rcd.uid+' góra N',busY.N);

    if(breakers.length){
      const firstTop=p(breakers[0].uid+':TOP:L');
      if(botL&&firstTop)addConn(botL,firstTop,phase,'fazowy',rcd.uid+' dół L → '+breakers[0].uid+' góra L',rowY-12);
      for(let i=1;i<breakers.length;i++){
        const a=p(breakers[i-1].uid+':TOP:L'),b=p(breakers[i].uid+':TOP:L');
        if(a&&b)addConn(a,b,'COMB','fazowy','GRZEBIEŃ '+phase+': '+breakers[i-1].uid+' → '+breakers[i].uid,rowY-18,{comb:true});
      }
      const firstX=breakers[0]._geom.x, last=breakers[breakers.length-1], lastX=last._geom.x+last._geom.w;
      const nY=rowY+122;
      busShapes.push('<line class="scheme-bus nsection" x1="'+firstX+'" y1="'+nY+'" x2="'+lastX+'" y2="'+nY+'"/><text class="scheme-bus-label nsection" x="'+(firstX+3)+'" y="'+(nY-4)+'">N'+g.section+'</text>');
      if(botN)addConn(botN,{x:firstX,y:nY,label:'N'+g.section},'N','neutralny',rcd.uid+' dół N → listwa N'+g.section,nY);

      breakers.forEach(function(br){
        const load=loads.find(function(l){return l.device.uid===br.uid});if(!load)return;
        const out=p(br.uid+':BOTTOM:L'),lL=p(load.uid+':L'),lN=p(load.uid+':N'),lPE=p(load.uid+':PE');
        if(out&&lL)addConn(out,lL,phase,'obwod',br.uid+' dół L → '+load.uid+' L',rowY+118);
        if(lN)addConn({x:lN.x,y:nY,label:'N'+g.section},lN,'N','neutralny','Listwa N'+g.section+' → '+load.uid+' N',nY);
        if(lPE)addConn({x:lPE.x,y:rowY+138,label:'PE'},lPE,'PE','ochronny','Listwa PE → '+load.uid+' PE',rowY+138);
      });
    }
  });

  const rcboGroups=plan.groups.filter(function(g){return g.kind==='rcbo'});
  rcboGroups.forEach(function(g){
    const d=g.items[0],phase=g.phase,rowY=rowTop+d.row*rowGap,load=loads.find(function(l){return l.device.uid===d.uid});
    const tL=p(d.uid+':TOP:L'),tN=p(d.uid+':TOP:N'),bL=p(d.uid+':BOTTOM:L'),bN=p(d.uid+':BOTTOM:N');
    if(tL)addConn({x:tL.x,y:busY[phase],label:'szyna '+phase},tL,phase,'zasilanie',phase+' rozdział → '+d.uid+' góra L',busY[phase]);
    if(tN)addConn({x:tN.x,y:busY.N,label:'N rozdział'},tN,'N','neutralny','N przed RCD → '+d.uid+' góra N',busY.N);
    if(load){
      if(bL)addConn(bL,p(load.uid+':L'),phase,'obwod',d.uid+' dół L → '+load.uid+' L',rowY+118);
      if(bN)addConn(bN,p(load.uid+':N'),'N','neutralny',d.uid+' dół N → '+load.uid+' N',rowY+118);
      addConn({x:p(load.uid+':PE').x,y:rowY+138,label:'PE'},p(load.uid+':PE'),'PE','ochronny','Listwa PE → '+load.uid+' PE',rowY+138);
    }
  });

  const direct=plan.groups.find(function(g){return g.kind==='direct'});
  if(direct&&direct.items.length){
    const phase=direct.phase,rowY=rowTop+direct.items[0].row*rowGap,first=direct.items[0],ft=p(first.uid+':TOP:L');
    if(ft)addConn({x:ft.x,y:busY[phase],label:'szyna '+phase},ft,phase,'zasilanie',phase+' rozdział → '+first.uid+' góra L',busY[phase]);
    for(let i=1;i<direct.items.length;i++){
      const a=p(direct.items[i-1].uid+':TOP:L'),b=p(direct.items[i].uid+':TOP:L');
      addConn(a,b,'COMB','fazowy','GRZEBIEŃ '+phase+': '+direct.items[i-1].uid+' → '+direct.items[i].uid,rowY-18,{comb:true});
    }
  }

  const wireSvg=connections.map(function(c){
    const d=routePath(c.from,c.to,c.lane);
    const cls='solution-wire wire-'+c.type+(c.extra.comb?' comb':'');
    return '<path class="'+cls+'" data-step="'+c.step+'" d="'+d+'"/>';
  }).join('');

  const defs='<defs><filter id="wireGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const svg='<div class="solution-schematic-wrap"><svg class="solution-schematic" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Schemat połączeń zadania">'+defs+busShapes.join('')+wireSvg+shapes+deviceSvg.join('')+'</svg></div>';
  return {svg:svg,connections:connections};
}

function wireLegend(){
  return '<div class="wire-legend"><span><i class="L1"></i>L1</span><span><i class="L2"></i>L2</span><span><i class="L3"></i>L3</span><span><i class="N"></i>N</span><span><i class="PE"></i>PE</span><span><i class="COMB"></i>GRZEBIEŃ</span></div>';
}
function connectionRows(list){
  return list.map(function(c){
    return '<button class="wire-step" data-step="'+c.step+'" data-category="'+c.category+'"><b>'+String(c.step).padStart(2,'0')+'</b><span class="wire-chip '+c.type+'">'+c.type+'</span><strong>'+esc(c.from.label)+'</strong><i>→</i><strong>'+esc(c.to.label)+'</strong><small>'+esc(c.label)+'</small></button>';
  }).join('');
}
function filterBar(){
  return '<div class="solution-filters"><button data-filter="all" class="active">WSZYSTKIE</button><button data-filter="zasilanie">ZASILANIE</button><button data-filter="fazowy">GRZEBIENIE</button><button data-filter="neutralny">N</button><button data-filter="ochronny">PE</button><button data-filter="obwod">OBWODY</button></div>';
}
function layoutSummary(plan){
  return '<section class="solution-section"><h3>ROZMIESZCZENIE APARATÓW</h3>'+plan.rows.map(function(row,i){
    return '<div class="solution-row-summary"><b>LISTWA '+(i+1)+'</b><span>'+row.items.map(function(d){return d.code}).join(' → ')+'</span><em>'+row.used+'/18M</em></div>';
  }).join('')+'</section>';
}

function openSolution(){
  const task=currentTask();if(!task)return;
  const plan=buildPlan(task),schema=buildSchematic(plan),tips=SPECIFIC[task.id]||[];
  document.getElementById('solutionTitle').textContent='ROZWIĄZANIE • '+String(task.id).padStart(2,'0')+' • '+task.title;
  document.getElementById('solutionMeta').textContent=task.rows+'×18M • '+task.level+' • '+task.xp+' XP • kliknij krok, aby podświetlić przewód';
  document.getElementById('solutionLayout').innerHTML=
    layoutSummary(plan)+
    '<section class="solution-section schematic-section"><h3>SCHEMAT PRZEWODÓW — KONKRETNE ZACISKI</h3>'+wireLegend()+schema.svg+'<div class="solution-schema-note">RCD mają na schemacie oddzielne sekcje N. Przewody PE są prowadzone do wspólnej szyny ochronnej. Kolory przewodów służą do czytelności symulatora.</div></section>';
  document.getElementById('solutionConnections').innerHTML=
    '<section class="solution-section"><h3>POŁĄCZENIA KROK PO KROKU</h3>'+filterBar()+'<div class="wire-step-list">'+connectionRows(schema.connections)+'</div></section>'+
    '<section class="solution-section compact"><h3>WSKAZÓWKI DO TEGO ZADANIA</h3>'+tips.map(function(x){return '<p>• '+esc(x)+'</p>'}).join('')+'</section>';
  modal.hidden=false;
  highlightStep(1);
}
function highlightStep(step){
  modal.querySelectorAll('.solution-wire').forEach(function(p){p.classList.toggle('active',Number(p.dataset.step)===Number(step))});
  modal.querySelectorAll('.wire-step').forEach(function(b){b.classList.toggle('active',Number(b.dataset.step)===Number(step))});
}
function setFilter(filter){
  modal.querySelectorAll('.solution-filters button').forEach(function(b){b.classList.toggle('active',b.dataset.filter===filter)});
  modal.querySelectorAll('.wire-step').forEach(function(b){b.hidden=filter!=='all'&&b.dataset.category!==filter});
}

modal.addEventListener('click',function(e){
  const step=e.target.closest('.wire-step');
  if(step){highlightStep(step.dataset.step);return}
  const filter=e.target.closest('.solution-filters button');
  if(filter){setFilter(filter.dataset.filter);return}
  const path=e.target.closest('.solution-wire');
  if(path){highlightStep(path.dataset.step);return}
  if(e.target===modal)modal.hidden=true;
});
document.getElementById('taskHintBtn').addEventListener('click',showHint);
document.getElementById('taskSolutionBtn').addEventListener('click',openSolution);
document.getElementById('closeSolution').addEventListener('click',function(){modal.hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)modal.hidden=true});

const title=document.querySelector('.active-task h2');
if(title)new MutationObserver(function(){hintBox.hidden=true;hintIndex=0;lastTaskId=currentTask()?.id||null}).observe(title,{childList:true,subtree:true});

window.ElektrykHelp={showHint:showHint,openSolution:openSolution};
})();