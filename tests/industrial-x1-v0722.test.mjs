/* v0.7.22 — X1/ZUG shared graph regression. Pure engine, no browser mocks. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../electrical-engine-v0713.js',import.meta.url),'utf8');
const context={window:{},document:{querySelectorAll:()=>[]}};
vm.runInNewContext(source,context);
const evaluate=context.window.ElektrykElectricalEngine.evaluate;
const terminal=(id,role,zone)=>({id,role,zone,mountId:null});
const phaseInput=[
 terminal('SUPPLY:L1','L1','supply'),
 terminal('X1:01:L1:TOP','L1','zug-top'),
 terminal('X1:01:L1:BOTTOM','L1','zug-bottom')
];
const zug={schema:1,capacity:24,slots:['L1',...Array(23).fill(null)]};
const wire={id:'W1',a:'SUPPLY:L1',b:'X1:01:L1:TOP',type:'L1',cable:'1x1.5'};

test('X1 feedthrough joins its two ports inside existing single graph',()=>{
 const r=evaluate({terminals:phaseInput,zug,connections:[wire]});
 assert.equal(r.zug.total,1);
 assert.equal(r.zug.connected,1);
 assert.equal(r.zug.ready,1);
 assert.equal(r.zug.complete,true);
 assert.equal(r.issues.length,0);
});
test('Empty or unwired X1 cannot pass a simulated electrical check',()=>{
 const noSlots=evaluate({terminals:[],zug:{schema:1,capacity:24,slots:Array(24).fill(null)}});
 assert.equal(noSlots.zug.complete,false);
 assert.ok(noSlots.issues.some(x=>x.code==='X1_EMPTY'));
 const empty=evaluate({terminals:phaseInput,zug,connections:[]});
 assert.equal(empty.zug.complete,false);
 assert.ok(empty.issues.some(x=>x.code==='X1_UNWIRED'));
});
test('A connected X1 without supply is warned, not silently accepted',()=>{
 const result=evaluate({terminals:phaseInput,zug,
   connections:[{id:'W1',a:'X1:01:L1:TOP',b:'X1:01:L1:BOTTOM',type:'L1'}]});
 assert.equal(result.zug.complete,false);
 assert.ok(result.issues.some(x=>x.code==='X1_UNFED'));
});
test('Mismatched, missing and mixed-pole terminals fail diagnostics',()=>{
 const malformed=evaluate({terminals:[phaseInput[0],phaseInput[1],
    terminal('X1:01:L1:BOTTOM','N','zug-bottom')],zug,connections:[wire]});
 assert.equal(malformed.zug.complete,false);
 assert.ok(malformed.issues.some(x=>x.code==='X1_TERMINAL'));
 const invalid=evaluate({terminals:phaseInput,zug,
   connections:[{...wire,type:'PE'}]});
 assert.ok(invalid.issues.some(x=>x.code==='INVALID_ROLE'));
});
test('Separator does not link adjacent phase and neutral tracks',()=>{
 const z={schema:1,capacity:24,slots:['L1','SEP','N',...Array(21).fill(null)]};
 const terms=[...phaseInput,
   terminal('SUPPLY:N','N','supply'),
   terminal('X1:03:N:TOP','N','zug-top'),
   terminal('X1:03:N:BOTTOM','N','zug-bottom')];
 const result=evaluate({terminals:terms,zug:z,connections:[wire,
   {id:'W2',a:'SUPPLY:N',b:'X1:03:N:TOP',type:'N'}]});
 assert.equal(result.zug.total,2);
 assert.equal(result.zug.ready,2);
 assert.equal(result.zug.complete,true);
 assert.equal(result.collisions.length,0);
});
