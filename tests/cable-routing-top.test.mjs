/* Regression checks for top cable exits, v0.7.17.4.
   Run: node --test tests/cable-routing-top.test.mjs
   Static checks are not a substitute for browser inspection. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const top = readFileSync(new URL('../cable-routing-top-v07174.css',import.meta.url),'utf8');
const bottom = readFileSync(new URL('../cable-routing-fix-v071521.css',import.meta.url),'utf8');
const router = readFileSync(new URL('../cable-routing-v07152.js',import.meta.url),'utf8');
const entry = readFileSync(new URL('../index.html',import.meta.url),'utf8');

function rule(part){
  const candidates=top.split('}');
  const source=candidates.find(s=>s.includes('.cable-bank.cable-bank-top') && s.includes(part+'{'));
  assert.ok(source, 'Missing upper-only selector for '+part);
  return source.slice(source.indexOf('{')+1);
}
function prop(css,name){
  const match=css.match(new RegExp('(?:^|;)\\s*'+name+'\\s*:\\s*([^;!]+)'));
  assert.ok(match,'Missing '+name);
  return match[1].trim();
}
test('New CSS is loaded after earlier cable styles',()=>{
  const old=entry.indexOf('cable-routing-fix-v071521.css');
  const newer=entry.indexOf('cable-routing-top-v07174.css?v=07174');
  assert.ok(old>=0 && newer>old);
});
test('Only upper outlet selectors are modified',()=>{
  assert.doesNotMatch(top,/\.cable-bank-bottom/);
  assert.doesNotMatch(top,/\.din-row\s*\{|\.nbar\s*\{|\.pebar\s*\{/);
  assert.match(rule('.circuit-cable-visual'),/transform:translateX\(-50%\)!important/);
  assert.doesNotMatch(rule('.circuit-cable-visual'),/rotate\(180deg\)/);
});
test('Upper sheathing and conductor origins join continuously',()=>{
  const sheath=rule('.circuit-sheath');
  const core=rule('.circuit-core');
  const anchors=rule('.circuit-terminals');
  assert.ok(['0','0px'].includes(prop(sheath,'top')));
  assert.equal(prop(sheath,'height'),'27px');
  assert.equal(prop(core,'top'),'22px');
  assert.equal(prop(core,'height'),'36px');
  assert.equal(prop(core,'transform-origin'),'50% 0%');
  assert.equal(prop(anchors,'top'),'56px');
  assert.ok(22<27 && 22+36>=56);
});
test('L N PE lines meet the existing terminal centers',()=>{
  const selectors=['.circuit-core.core-l','.circuit-core.core-n','.circuit-core.core-pe'];
  const values=selectors.map(rule);
  const coords=values.map(r=>parseFloat(prop(r,'left')));
  assert.deepEqual(coords,[15,25,35]);
  assert.equal(prop(values[0],'transform'),'rotate(12deg)');
  assert.equal(prop(values[1],'transform'),'none');
  assert.equal(prop(values[2],'transform'),'rotate(-12deg)');
  const delta=36*Math.sin(12*Math.PI/180);
  const ends=[4+coords[0]-delta,4+coords[1],4+coords[2]+delta];
  const terminalCenters=[12.5,29.5,46.5];
  ends.forEach((x,i)=>assert.ok(Math.abs(x-terminalCenters[i])<2,'Conductor '+i+' shifted'));
  assert.match(router,/for\(const role of \['L','N','PE'\]\)/);
  assert.match(router,/el\.dataset\.exit=parent==='top'\?'top-right':'bottom'/);
});
test('Lower cable geometry remains unchanged',()=>{
  assert.match(bottom,/\.cable-bank-bottom \.large-cable-outlet \.circuit-sheath/);
  assert.match(bottom,/\.cable-bank-bottom \.large-cable-outlet \.circuit-core/);
});
