/* Regression for v0.7.17.7.1 — independent side columns.
 * Run: node --test tests/sidebar-scroll-v071771.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
const fix=readFileSync(new URL('../sidebar-scroll-fix-v071771.css',import.meta.url),'utf8');
const base=readFileSync(new URL('../desktop-layout-v07124.css',import.meta.url),'utf8');
const dock=readFileSync(new URL('../workspace-panels-v07173.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function block(marker){
 const p=fix.indexOf(marker);assert.ok(p>=0,'Missing '+marker);
 const a=fix.indexOf('{',p),b=fix.indexOf('}',a);assert.ok(a>=0&&b>a);
 return fix.slice(a+1,b);
}
test('Sidebar cards do not shrink when content exceeds column height',()=>{
 const rules=block('.game-shell>.leftbar>.panel,');
 assert.match(rules,/flex:0 0 auto!important/);
 assert.match(rules,/flex-shrink:0!important/);
 assert.match(html,/<aside class="leftbar panel-stack">/);
 assert.match(html,/<aside class="rightbar panel-stack">/);
});
test('Desktop side columns have independent vertical scroll areas',()=>{
 assert.match(fix,/@media\(min-width:900px\)/);
 assert.match(fix,/\.game-shell>\.leftbar,\s*html\[data-theme="dark"\] body \.game-shell>\.rightbar\{\s*display:flex!important;/);
 assert.match(fix,/overflow-y:auto!important/);
 assert.match(fix,/min-height:0!important/);
 assert.match(base,/grid-template-rows:minmax\(0,1fr\)!important/);
 assert.match(base,/height:calc\(100dvh - 70px\)!important/);
});
test('Small screen retains native full page scrolling',()=>{
 assert.match(fix,/@media\(max-width:899px\)/);
 assert.match(fix,/height:auto!important;\s*max-height:none!important;\s*overflow-y:visible!important/);
});
test('Enlarged-board dock keeps each tool card scrollable',()=>{
 assert.match(dock,/\.pro-focus-dock>\.rightbar>\.panel\{/);
 assert.match(dock,/height:242px!important/);
 assert.match(fix,/\.pro-focus-dock>\.rightbar>\.panel\{\s*overflow-y:auto!important/);
});
test('Newest CSS loaded after earlier desktop and dock styles',()=>{
 const latest=html.indexOf('sidebar-scroll-fix-v071771.css?v=071771');
 assert.ok(latest>html.indexOf('desktop-layout-v07124.css'));
 assert.ok(latest>html.indexOf('workspace-panels-v07173.css'));
 assert.ok(latest>html.indexOf('diagnostics-pro-v07177.css'));
});
test('No cabinet geometry or electrical logic are modified',()=>{
 const cssRulesOnly=fix.replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(cssRulesOnly,/\.cabinet-inner|\.din-row|\.wire-terminal|\.supply-box|\.nbar|\.pebar/);
 assert.equal((fix.match(/\{/g)||[]).length,(fix.match(/\}/g)||[]).length);
});
