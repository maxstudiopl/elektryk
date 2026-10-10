/* RozdzielnicaPRO.pl v0.7.20 — release-wide integrity checks.
   Run: node --test tests/release-integrity-v0720.test.mjs
   The suite checks source integrity; it does not certify real installations. */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=filename=>readFileSync(path.join(root,filename),'utf8');
const html=read('index.html');
const auth=read('auth-v050.js');
const fileNames=new Set(readdirSync(root));

test('HTML stylesheet and script assets exist, in their original order',()=>{
  const links=[...html.matchAll(/<link\b[^>]*href="([^"]+\.css(?:\?[^"]*)?)"/g)].map(x=>x[1]);
  const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+\.js(?:\?[^"]*)?)"/g)].map(x=>x[1]);
  assert.ok(links.length>=30,'Unexpected number of stylesheet links');
  assert.ok(scripts.length>=7,'Unexpected number of initial scripts');
  const all=[...links,...scripts];
  for(const url of all)assert.ok(fileNames.has(url.split('?')[0]),'Missing HTML asset '+url);
  assert.equal(new Set(all.map(x=>x.split('?')[0])).size,all.length,'Duplicate initial assets');
  assert.ok(html.indexOf('responsive-workspace-v0719.css')>html.indexOf('desktop-layout-v07124.css'));
});
test('Dynamic game modules exist and appear only once in the game loader',()=>{
  const beginning=auth.indexOf('const scripts=');
  assert.ok(beginning>=0,'gameScripts array missing');
  const closing=auth.indexOf('];',beginning);
  assert.ok(closing>beginning);
  const declaration=auth.slice(beginning,closing);
  const modules=[...declaration.matchAll(/'([^']+\.js\?v=[^']+)'/g)].map(x=>x[1]);
  assert.ok(modules.length>=25,'Unexpected dynamic module count');
  for(const entry of modules)assert.ok(fileNames.has(entry.split('?')[0]),'Missing lazy asset '+entry);
  assert.equal(new Set(modules.map(x=>x.split('?')[0])).size,modules.length,'Duplicate modules');
  assert.ok(modules.indexOf('verification-pro-v07177.js?v=07177')>modules.indexOf('stage4.js?v=0720'));
  assert.ok(modules.indexOf('responsive-workspace-v0719.js?v=0719')>modules.indexOf('workspace-panels-v07173.js?v=07173'));
});
test('Every root-level JavaScript file parses under current Node',()=>{
  const scripts=[...fileNames].filter(x=>x.endsWith('.js'));
  assert.ok(scripts.length>=30);
  for(const name of scripts){
    const file=read(name);
    assert.doesNotThrow(()=>new vm.Script(file,{filename:name}),name+' failed syntax check');
  }
});
test('CSS files have balanced blocks (comments excluded)',()=>{
  const sheets=[...fileNames].filter(x=>x.endsWith('.css'));
  assert.ok(sheets.length>=30);
  for(const name of sheets){
    const text=read(name).replace(/\/\*[\s\S]*?\*\//g,'');
    const opens=(text.match(/\{/g)||[]).length,closes=(text.match(/\}/g)||[]).length;
    assert.equal(opens,closes,'Unbalanced stylesheet '+name);
  }
});
test('Training supplement catalog is deterministic, unique and physically fits module limits',()=>{
  const win={};
  const context={window:win,structuredClone:globalThis.structuredClone};
  vm.runInNewContext(read('curriculum-v0714.js'),context,{filename:'curriculum-v0714.js'});
  const stats=win.ElektrykCurriculum.validate();
  assert.equal(stats.count,260);
  assert.equal(stats.unique,260);
  assert.equal(stats.fits,true);
  assert.equal(stats.min,41);
  assert.equal(stats.max,300);
  assert.equal(new Set(stats.ids).size,260);
});
test('Board database preserves 7 supported models and industrial choices',()=>{
  const win={};
  vm.runInNewContext(read('switchboard-db.js'),{window:win,structuredClone:globalThis.structuredClone},
    {filename:'switchboard-db.js'});
  const boards=win.ElektrykSwitchboardDB.supported();
  assert.equal(boards.length,7);
  assert.equal(boards.filter(x=>x.family==='industrial').length,2);
  for(const b of boards){
    assert.ok(b.rows>0&&b.modulesPerRow>0);
    assert.equal(Number(b.totalModules),b.rows*b.modulesPerRow);
  }
});
test('Power-check awards no success while errors or warnings remain',()=>{
  const script=read('stage4.js');
  const predicate=script.split('\n').find(line=>line.trim().startsWith('complete:states.length>0&&'));
  assert.ok(predicate,'Manual completion condition missing');
  assert.match(predicate,/collisions\.length===0/);
  assert.match(predicate,/issues\.some\(i=>\['error','warning','warn'\]\.includes\(i\.type\)\)/);
  assert.match(script,/document\.dispatchEvent\(new CustomEvent\('elektryk:power-check'/);
});
test('Saved-project slots are never auto-overwritten during unload',()=>{
  const script=read('freebuild-save-v0711.js');
  assert.doesNotMatch(script,/addEventListener\('beforeunload'/);
  assert.match(script,/activeSlot!==loadedSlot/);
  assert.match(script,/saveProject\(silent=false\)/);
  assert.match(script,/catch\(err\)\{\s*console\.error\('Zapis Wolnej Budowy:'/);
  assert.match(script,/p\.board\|\|!Array\.isArray\(p\.mounted\)/);
});
test('Electrical APIs needed by integration are present',()=>{
  const stage2=read('stage2.js'),stage3=read('stage3.js');
  const bridges=read('bridges-v031.js'),power=read('stage4.js');
  for(const fn of ['restoreMounted','getBoardConfig','getMounted','getTask','configureBoard'])
    assert.match(stage2,new RegExp('(?:function\\s+'+fn+'|\\b'+fn+'\\s*:)'));
  for(const fn of ['setConnections','getConnections','redraw','clear'])
    assert.match(stage3,new RegExp('\\b'+fn+'\\b'));
  for(const fn of ['setBridges','getBridges','redraw','clear'])
    assert.match(bridges,new RegExp('\\b'+fn+'\\b'));
  for(const fn of ['analyze','getLast','refresh'])
    assert.match(power,new RegExp('\\b'+fn+'\\b'));
});
