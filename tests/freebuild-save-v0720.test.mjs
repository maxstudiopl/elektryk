/* RozdzielnicaPRO.pl v0.7.20 — Free Build persistence integration.
 * Executes the actual save module in a simulated browser environment.
 * Run: node --test tests/freebuild-save-v0720.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../freebuild-save-v0711.js',import.meta.url),'utf8');

class Element{
  constructor(value=''){
    this.value=value;this.textContent='';this.className='';this.handlers={};
    this.dataset={};this.children={};
    const classes=new Set();
    this.classList={
      toggle:(name,isOn)=>{if(isOn)classes.add(name);else classes.delete(name)}
    };
  }
  querySelector(selector){return this.children[selector]||null}
  addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
  click(){for(const fn of this.handlers.click||[])fn()}
  input(){for(const fn of this.handlers.input||[])fn()}
}
function setup(){
  const map=new Map(),browserEvents={};
  let confirmValue=true,saveFailures=false,entered=0;
  const delayed=[];
  const storage={
    getItem:key=>map.get(key)||null,
    setItem:(key,value)=>{
      if(saveFailures&&key.includes('elektryk_freebuild_saves'))throw Error('QUOTA_EXCEEDED');
      map.set(key,String(value));
    },
    removeItem:key=>map.delete(key)
  };
  const elems={freeSavePanel:new Element(),freeProjectName:new Element('Projekt A'),
    freeSaveState:new Element(),freeSaveMeta:new Element(),saveFreeProject:new Element(),
    loadFreeProject:new Element(),newFreeProject:new Element(),currentFreeBoardLabel:new Element()};
  const slots=[1,2,3].map(n=>{
    const item=new Element();item.dataset.saveSlot=String(n);
    item.children.small=new Element();return item;
  });
  const docEvents={},document={
    body:{dataset:{gameMode:'free'}},
    getElementById:id=>elems[id]||null,
    querySelectorAll:selector=>selector==='[data-save-slot]'?slots:[],
    addEventListener:(name,fn)=>(docEvents[name]??=[]).push(fn)
  };
  const state={board:{boardId:'REF-3X12-SURFACE',rows:3,modulesPerRow:12,totalModules:36},
    mounted:[{id:'M1',code:'B10',row:0,start:0,modules:1}],
    connections:[{id:'W1',a:'SUPPLY:L1',b:'M1:TOP:L1:0',type:'L1'}],
    bridges:[],zug:null};
  const stage2={
    getBoardConfig:()=>({...state.board}),
    getMounted:()=>state.mounted.map(x=>({...x})),
    restoreMounted:items=>{state.mounted=[...items];return items.length},
    reset:()=>{state.mounted=[];state.connections=[];state.bridges=[]}
  };
  const window={
    ElektrykAuth:{currentAccountId:()=> 'test-user',enterGame:async(mode,t)=>{
      entered++;
      document.body.dataset.gameMode=mode;
      state.board={boardId:t.id,rows:t.rows,modulesPerRow:t.modulesPerRow,
        totalModules:t.rows*t.modulesPerRow};
    }},
    ElektrykStage2:stage2,
    ElektrykStage3:{
      getConnections:()=>[...state.connections],
      setConnections:rows=>{state.connections=[...rows];return rows.length}
    },
    ElektrykBridges:{
      getBridges:()=>[...state.bridges],
      setBridges:rows=>{state.bridges=[...rows];return rows.length}
    },
    ElektrykIndustrialZug:{
      getState:()=>state.zug,restore:v=>{state.zug=v},reset:()=>{state.zug=null}
    },
    ElektrykSwitchboardDB:{get:()=>null},
    addEventListener:(name,fn)=>(browserEvents[name]??=[]).push(fn)
  };
  const context={
    window,document,localStorage:storage,
    setTimeout:fn=>{delayed.push(fn);return delayed.length},setInterval:()=>0,clearTimeout:()=>{},

    requestAnimationFrame:fn=>fn(),
    confirm:()=>confirmValue,console:{error:()=>{}},
    Date,Number,Math,String,JSON
  };
  vm.runInNewContext(source,context,{filename:'freebuild-save-v0711.js'});
  while(delayed.length)delayed.shift()(); // browser startup: finish initializing/restore check
  return {
    window,elems,slots,map,state,browserEvents,
    saved:()=>JSON.parse(map.get('elektryk_freebuild_saves_v0711:test-user')||'{}'),
    select:n=>slots[n-1].click(),
    confirm:value=>{confirmValue=value},
    failSaves:value=>{saveFailures=value},
    countEntries:()=>entered
  };
}
test('First explicit SAVE persists full project in the first slot',()=>{
  const f=setup();
  assert.equal(f.window.ElektrykFreeBuildSave.save(),true);
  assert.equal(f.saved()['1'].name,'Projekt A');
  assert.equal(f.saved()['1'].mounted.length,1);
  assert.equal(f.saved()['1'].connections.length,1);
  assert.equal(f.window.ElektrykFreeBuildSave.activeSlot(),1);
});
test('Editing title marks unsaved, replacing currently loaded slot is intentional',()=>{
  const f=setup();const save=f.window.ElektrykFreeBuildSave.save;
  assert.equal(save(),true);
  f.elems.freeProjectName.value='Nowy tytuł';
  f.elems.freeProjectName.input();
  assert.equal(f.elems.freeSaveState.textContent,'NIEZAPISANE ZMIANY');
  assert.equal(save(),true);
  assert.equal(f.saved()['1'].name,'Nowy tytuł');
  assert.equal(f.elems.freeSaveState.textContent,'ZAPISANO');
});
test('Slot click neither alters active title nor overwrites a saved project',()=>{
  const f=setup();const save=f.window.ElektrykFreeBuildSave.save;
  save();f.select(2);
  assert.equal(f.elems.freeProjectName.value,'Projekt A');
  f.elems.freeProjectName.value='Projekt B';f.elems.freeProjectName.input();
  assert.equal(save(),true);
  assert.equal(f.saved()['2'].name,'Projekt B');
  f.select(1);f.confirm(false);
  assert.equal(save(),false,'Must ask before overwriting slot 1');
  assert.equal(f.saved()['1'].name,'Projekt A');
  assert.equal(f.saved()['2'].name,'Projekt B');
  assert.equal(f.elems.freeSaveState.textContent,'WYBRANO SLOT • NIE ZAPISANO');
});
test('Tab close does not autosave into a selected slot',()=>{
  const f=setup();f.window.ElektrykFreeBuildSave.save();
  f.elems.freeProjectName.value='Nigdy nie zapisuj automatycznie';
  f.elems.freeProjectName.input();
  assert.equal(f.browserEvents.beforeunload,undefined);
  assert.equal(f.saved()['1'].name,'Projekt A');
});
test('A corrupt saved board is rejected without touching current installation',async()=>{
  const f=setup();
  const bad={schema:2,name:'Błąd',board:{rows:999,modulesPerRow:10000},
    mounted:[],connections:[],bridges:[]};
  const storageKey='elektryk_freebuild_saves_v0711:test-user';
  f.map.set(storageKey,JSON.stringify({1:bad}));
  f.select(1);
  const before=JSON.stringify(f.state);
  assert.equal(await f.window.ElektrykFreeBuildSave.load(),false);
  assert.equal(f.countEntries(),0);
  assert.equal(JSON.stringify(f.state),before);
});
test('Quota error reports failure and leaves last project intact',()=>{
  const f=setup();f.window.ElektrykFreeBuildSave.save();
  const before=f.saved()['1'].name;
  f.elems.freeProjectName.value='Nie zapisuj po błędzie';
  f.failSaves(true);
  assert.equal(f.window.ElektrykFreeBuildSave.save(),false);
  assert.equal(f.saved()['1'].name,before);
  assert.equal(f.elems.freeSaveState.textContent,'BŁĄD ZAPISU');
});
test('Unsaved mounted project cannot be replaced by LOAD without confirmation',async()=>{
  const f=setup();f.window.ElektrykFreeBuildSave.save();
  f.elems.freeProjectName.value='Wersja robocza';f.elems.freeProjectName.input();
  f.confirm(false);
  assert.equal(await f.window.ElektrykFreeBuildSave.load(),false);
  assert.equal(f.countEntries(),0);
  f.confirm(true);
  assert.equal(await f.window.ElektrykFreeBuildSave.load(),true);
  assert.equal(f.countEntries(),1);
  assert.equal(f.elems.freeProjectName.value,'Projekt A');
});

test('Malformed switchboard saves are rejected before touching the current DIN layout',async()=>{
  const f=setup(),save=f.window.ElektrykFreeBuildSave.save;
  assert.equal(save(),true);
  const correct=f.saved()['1'],key='elektryk_freebuild_saves_v0711:test-user';
  const baseline=JSON.stringify(f.state);
  const clone=x=>JSON.parse(JSON.stringify(x));
  const cases=[
    ['duplicate apparatus ID',p=>p.mounted.push({...p.mounted[0],row:1})],
    ['overlapping modules',p=>p.mounted.push({...p.mounted[0],id:'M2'})],
    ['negative row',p=>p.mounted[0].row=-1],
    ['fractional slot',p=>p.mounted[0].start=1.5],
    ['outside DIN area',p=>p.mounted[0].start=12],
    ['wrong module count',p=>p.board.totalModules=99],
    ['invalid wire source',p=>p.connections[0].a='M999:TOP:L1:0'],
    ['wrong conductor',p=>p.connections[0].type='WRONG'],
    ['nonexistent apparatus',p=>p.mounted[0].code='FAKE']
  ];
  // Production has a catalogue. Keep the fixture strict about the known B10.
  f.window.ElektrykStage2.parts={B10:{modules:1}};
  for(const [description,change] of cases){
    const p=clone(correct);change(p);
    f.map.set(key,JSON.stringify({1:p}));
    assert.equal(await f.window.ElektrykFreeBuildSave.load(),false,description);
    assert.equal(f.countEntries(),0,'No destructive enterGame for '+description);
    assert.equal(JSON.stringify(f.state),baseline,'Unchanged board for '+description);
  }
});

test('Known model geometry mismatch cannot silently truncate a restored project',async()=>{
  const f=setup();
  assert.equal(f.window.ElektrykFreeBuildSave.save(),true);
  f.window.ElektrykSwitchboardDB.get=id=>id==='REF-3X12-SURFACE'
    ?{id,rows:3,modulesPerRow:12,family:'residential'}:null;
  const key='elektryk_freebuild_saves_v0711:test-user',p=f.saved()['1'];
  p.board.rows=5;p.board.totalModules=60;
  f.map.set(key,JSON.stringify({1:p}));
  const prior=JSON.stringify(f.state);
  assert.equal(await f.window.ElektrykFreeBuildSave.load(),false);
  assert.equal(f.countEntries(),0);
  assert.equal(JSON.stringify(f.state),prior);
});
test('Industrial X1 payload must match both valid slot codes and capacity',async()=>{
  const f=setup();
  assert.equal(f.window.ElektrykFreeBuildSave.save(),true);
  const key='elektryk_freebuild_saves_v0711:test-user',p=f.saved()['1'];
  f.window.ElektrykSwitchboardDB.get=id=>id==='IND-PRO-5X24'
    ?{id,rows:5,modulesPerRow:24,family:'industrial',zugSlots:30}:null;
  const industrial={...p,templateId:'IND-PRO-5X24',
    board:{...p.board,boardId:'IND-PRO-5X24',rows:5,modulesPerRow:24,totalModules:120,family:'industrial'},
    industrialZug:{schema:1,capacity:30,slots:Array(30).fill(null)}};
  for(const invalid of [
    {...industrial,industrialZug:{...industrial.industrialZug,capacity:24}},
    {...industrial,industrialZug:{...industrial.industrialZug,slots:Array(24).fill(null)}},
    {...industrial,industrialZug:{...industrial.industrialZug,slots:['INVALID',...Array(29).fill(null)]}}
  ]){
    f.map.set(key,JSON.stringify({1:invalid}));
    assert.equal(await f.window.ElektrykFreeBuildSave.load(),false);
    assert.equal(f.countEntries(),0);
  }
});
