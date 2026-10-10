/* v0.7.17.7 • Regression tests for PRO educational verification.
 * Run: node --test tests/verification-pro-v07177.test.mjs */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source=readFileSync(new URL('../verification-pro-v07177.js',import.meta.url),'utf8');
const stage4=readFileSync(new URL('../stage4.js',import.meta.url),'utf8');
const help=readFileSync(new URL('../help-v049.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../diagnostics-pro-v07177.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const from=source.indexOf('function evaluate(');
const to=source.indexOf('function context()',from);
assert.ok(from>=0&&to>from,'Expected pure evaluator');
const evaluate=new Function(source.slice(from,to)+'\nreturn evaluate')();

function load(complete=true){
 return {load:{id:'LIGHT',label:'Oświetlenie'},complete,any:complete,
   hasPhase:complete,hasN:complete,hasPE:complete,hasFR:complete,
   protectedPath:complete,residual:complete,residualNok:complete};
}
function model({complete=true,issues=[],collision=false,deviceStatus='ready'}={}){
 return {states:[load(complete)],issues,
   collisions:collision?[{id:'A',phases:['L1','L2']}]:[],
   engine:{circuits:[{id:'M1',code:'B10',row:0,status:deviceStatus,
      hasOutgoingConnection:true,errors:[],warnings:[],inputPhases:['L1'],outputPhases:['L1']}]}};
}
test('No manual check never displays a positive certificate',()=>{
 const r=evaluate(model(),null,{});
 assert.equal(r.status,'pending');assert.equal(r.verified,false);
});
test('A fully supplied educational model may pass when no warnings exist',()=>{
 const r=evaluate(model(),{complete:true},{});
 assert.equal(r.status,'ok');assert.equal(r.verified,true);
});
test('Incomplete receiver, collision, and diagnostic engine errors fail',()=>{
 assert.equal(evaluate(model({complete:false}),{complete:false},{}).verified,false);
 assert.equal(evaluate(model({collision:true}),{complete:false},{}).status,'error');
 assert.equal(evaluate(model({deviceStatus:'error'}),{complete:false},{}).status,'error');
 assert.equal(evaluate(model({issues:[{type:'error',code:'SHORT',text:'Kolizja'}]}),
   {complete:false},{}).status,'error');
});
test('Caution when RCD warning or required breaker is missing',()=>{
 assert.equal(evaluate(model({issues:[{type:'warning',text:'RCD'}]}),
   {complete:true},{}).status,'warn');
 assert.equal(evaluate(model(),{complete:true},{task:{},requirements:{B10:2},
   mounted:[{code:'B10'}],layout:{complete:true}}).verified,false);
});
test('Learning arrangement must have an explicit successful reference evaluation',()=>{
 assert.equal(evaluate(model(),{complete:true},{task:{},layout:null}).status,'warn');
 assert.equal(evaluate(model(),{complete:true},{task:{},layout:{complete:false}}).verified,false);
});
test('Report is driven by existing power-check event and cannot mint XP itself',()=>{
 assert.match(source,/addEventListener\('elektryk:power-check'/);
 assert.doesNotMatch(source,/dispatchEvent\(new CustomEvent\('elektryk:power-check'/);
 assert.match(stage4,/lastAnalysis=\{states,collisions,issues,engine,rcd\}/);
 assert.match(help,/verified\?\.isPassed\?\.\(\)===true/);
 assert.match(source,/last\.stamp===stamp\(\)/);
});
test('New style is loaded after old sheet and avoids physical DIN geometry',()=>{
 assert.match(html,/diagnostics-pro-v07177\.css\?v=07177/);
 assert.match(css,/\.verification-pro-modal/);
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
 assert.doesNotMatch(css,/\.cabinet-inner[^{]*\{|\.din-row[^{]*\{/);
});

test('Industrial X1 cannot receive a complete electrical verdict before the ZUG engine exists',()=>{
 const data=model();
 const industrial=evaluate(data,{complete:true},{board:{family:'industrial'}});
 assert.equal(industrial.industrialUnverified,true);
 assert.equal(industrial.verified,false);
 assert.equal(industrial.status,'warn');
 const residential=evaluate(data,{complete:true},{board:{family:'residential'}});
 assert.equal(residential.verified,true);
 assert.equal(residential.industrialUnverified,false);
});
test('Diagnostics fingerprint expires when cabinet or industrial X1 terminals change',()=>{
 const start=source.indexOf('function stamp()');
 const stop=source.indexOf('const openBtn=',start);
 assert.ok(start>=0&&stop>start);
 const board={boardId:'IND-PRO-4X24',family:'industrial',rows:4,modulesPerRow:24};
 const zug={schema:1,capacity:24,slots:Array(24).fill(null)};
 const mockWindow={
  ElektrykStage2:{getBoardConfig:()=>board,getMounted:()=>[],getTask:()=>null},
  ElektrykStage3:{getConnections:()=>[]},ElektrykBridges:{getBridges:()=>[]},
  ElektrykIndustrialZug:{getState:()=>zug}
 };
 const mockDocument={querySelectorAll:()=>[]};
 const stamp=new Function('window','document',source.slice(start,stop)+'\nreturn stamp;')(mockWindow,mockDocument);
 const initial=stamp();
 zug.slots[0]='L1';
 assert.notEqual(stamp(),initial,'Changing X1 must invalidate the old test');
 const afterZug=stamp();
 board.boardId='IND-PRO-5X24';board.rows=5;
 assert.notEqual(stamp(),afterZug,'Changing the cabinet must invalidate the old test');
});
