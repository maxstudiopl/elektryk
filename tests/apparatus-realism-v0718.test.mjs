/* RozdzielnicaPRO.pl v0.7.18 — regressions for PRO device realism.
 * Run: node --test tests/apparatus-realism-v0718.test.mjs */
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const css=readFileSync(new URL('../apparatus-realism-v0718.css',import.meta.url),'utf8');
const legacy=readFileSync(new URL('../apparatus-pro-v07153.css',import.meta.url),'utf8');
const stage2=readFileSync(new URL('../stage2.js',import.meta.url),'utf8');
const stage3=readFileSync(new URL('../stage3.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const withoutComments=css.replace(/\/\*[\s\S]*?\*\//g,'');

function rulesContaining(text){
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(m=>m[1].includes(text)).map(m=>({selector:m[1].trim(),body:m[2]}));
}
test('New visual CSS loads after earlier apparel and scrolling styles',()=>{
  const last=html.indexOf('apparatus-realism-v0718.css?v=0718');
  assert.ok(last>html.indexOf('apparatus-pro-v07153.css'));
  assert.ok(last>html.indexOf('sidebar-scroll-fix-v071771.css'));
});
test('Device housing changes materials, not mounted dimensions or transforms',()=>{
  const body=rulesContaining('.mounted-device>.device')
    .find(r=>!r.selector.includes('[data-modules')&&!r.selector.includes('::'))?.body;
  assert.ok(body);
  assert.match(body,/background:/);
  assert.doesNotMatch(body,/(?:^|;)\s*(?:width|height|top|left|right|bottom|transform|position)\s*:/);
  for(const rule of rulesContaining('.device-topterm')){
    if(!rule.selector.includes('device-bottomterm'))continue;
    assert.doesNotMatch(rule.body,/(?:^|;)\s*(?:width|height|top|left|right|bottom|transform|position)\s*:/);
  }
  assert.doesNotMatch(withoutComments,/\.cabinet-inner\s*\{|\.din-row\s*\{|\.mount-grid\s*\{/);
});
test('Terminal cosmetics only apply to idle unselected unconnected terminals',()=>{
  assert.match(css,/\.wire-terminal:not\(/);
  for(const marker of [
    '.used-terminal','.start-terminal','.bad-terminal','.guide-compatible',
    '.guide-target','.guide-source','.bridge-eligible','.bridge-start'
  ])assert.ok(css.includes(marker),'Missing state exclusion '+marker);
  assert.doesNotMatch(withoutComments,/\.wire-terminal\s*\{\s*[^}]*\b(?:width|height|top|left)\s*:/s);
  assert.match(stage3,/used-terminal/);
});
test('Product families and distinct controls remain visible',()=>{
  for(const family of ['FR','RCD','RCBO','SPD','NTB','PETB'])
    assert.ok(css.includes('[data-code^="'+family+'"]')||
      css.includes('[data-part^="'+family+'"]'),'No '+family);
  for(const block of ['.brand-strip','.device-type','.device-rating','.lever','.test-btn','.spd-window','.terminal-strip-visual'])
    assert.ok(css.includes(block),block);
  assert.match(legacy,/--pro-family-accent/);
  assert.match(css,/var\(--pro-family-accent/);
});
test('Original switch-off geometry is retained',()=>{
  assert.match(css,/data-switch-state="off"/);
  assert.doesNotMatch(rulesContaining('[data-switch-state="off"]')[0].body,/transform\s*:/);
  assert.match(stage2,/data-switch-state|switchState/);
});
test('Catalogue and details keep semantic product codes and selectable cards',()=>{
  assert.match(css,/\.catalog-card\[data-part/);
  assert.match(css,/\.catalog-card:is\(\.selected,\.install-selected\)/);
  assert.match(css,/\.detail-device/);
  assert.match(stage2,/card\.dataset\.part=code/);
  assert.match(stage2,/card\.addEventListener\('click',\(\)=>selectPart\(code,card\)\)/);
});
test('Physical apparatus markup still includes original terminals and controls',()=>{
  const start=stage2.indexOf('function apparatusHtml(p){');
  const end=stage2.indexOf('function setHint(',start);
  assert.ok(start>=0&&end>start);
  const fn=new Function(stage2.slice(start,end)+'\nreturn apparatusHtml')();
  const base={className:'device-mcb',top:'L1',bottom:'L1',brandClass:'blue',
    brand:'PRO',type:'B10',rating:'10A',meta:'1P',fn:'MCB',kind:'mcb'};
  const breaker=fn(base);
  assert.match(breaker,/class="device-topterm"/);
  assert.match(breaker,/class="device-bottomterm"/);
  assert.match(breaker,/class="lever/);
  assert.match(fn({...base,kind:'rcd',test:'T'}),/class="test-btn/);
  assert.match(fn({...base,kind:'spd',spd:true}),/class="spd-window"/);
  assert.match(fn({...base,kind:'terminal-n',passive:true}),/class="terminal-strip-visual"/);
});
test('Free-build enclosure header no longer shows stale version',()=>{
  assert.match(stage2,/version\.textContent=\x60v0\.7\.18 /);
  assert.match(html,/v0\.7\.18/);
});
test('CSS is syntactically balanced',()=>{
  assert.equal((withoutComments.match(/\{/g)||[]).length,(withoutComments.match(/\}/g)||[]).length);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
