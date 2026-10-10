/* RozdzielnicaPRO.pl v0.7.19 — responsive workstation regressions.
   Run: node --test tests/responsive-workspace-v0719.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../responsive-workspace-v0719.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../responsive-workspace-v0719.js',import.meta.url),'utf8');
const original=readFileSync(new URL('../desktop-layout-v07124.css',import.meta.url),'utf8');
const scroll=readFileSync(new URL('../sidebar-scroll-fix-v071771.css',import.meta.url),'utf8');
const dock=readFileSync(new URL('../workspace-panels-v07173.css',import.meta.url),'utf8');
const layoutJS=readFileSync(new URL('../ui-pro-v07122.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const loader=readFileSync(new URL('../auth-v050.js',import.meta.url),'utf8');
const rulesOnly=css.replace(/\/\*[\s\S]*?\*\//g,'');

class Node{
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.parent=null;this.attrs={};this.handlers={};
    this.className='';this.textContent='';this.hidden=false;this.scrolls=0;
    const classes=new Set();
    this.classList={
      add:x=>{classes.add(x);this.className=[...classes].join(' ')},
      remove:x=>{classes.delete(x);this.className=[...classes].join(' ')},
      contains:x=>classes.has(x),
      toggle:(x,enabled)=>{
        const next=enabled===undefined?!classes.has(x):enabled;
        if(next)classes.add(x);else classes.delete(x);
        this.className=[...classes].join(' ');return next;
      }
    };
  }
  appendChild(node){node.parent=this;this.children.push(node)}
  append(...nodes){nodes.forEach(node=>this.appendChild(node))}
  setAttribute(key,value){this.attrs[key]=String(value)}
  addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
  click(){for(const fn of this.handlers.click||[])fn({target:this})}
  querySelector(selector){
    if(selector==='.pro-responsive-shortcuts')
      return this.children.find(x=>x.className.includes('pro-responsive-shortcuts'))||null;
    return null;
  }
  getClientRects(){return[{}]}
  scrollIntoView(){this.scrolls++}
}
function setup(){
  const toolbar=new Node(),left=new Node(),right=new Node(),dock=new Node();
  const togglerLeft=new Node('button'),togglerRight=new Node('button'),body=new Node();
  const ids={
    proWorkspaceToolbar:toolbar,proTaskSidebar:left,proToolSidebar:right,
    proFocusDock:dock,proToggleTasks:togglerLeft,proToggleTools:togglerRight
  };
  togglerLeft.addEventListener('click',()=>body.classList.toggle('pro-left-collapsed'));
  togglerRight.addEventListener('click',()=>body.classList.toggle('pro-right-collapsed'));
  const document={
    readyState:'complete',body,createElement:tag=>new Node(tag),
    getElementById:id=>ids[id]||null,addEventListener:()=>{}
  };
  const raf=callback=>callback();
  new Function('document','requestAnimationFrame',js)(document,raf);
  const buttons=toolbar.children[0]?.children||[];
  return {toolbar,left,right,dock,body,buttons,togglerLeft,togglerRight};
}
test('Desktop breakpoint retains independent scroll and full-size panel cards',()=>{
  assert.match(css,/@media\(min-width:1200px\)/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/flex:0 0 auto!important/);
  assert.match(scroll,/\.game-shell>\.leftbar>\.panel/);
  assert.match(original,/grid-template-rows:minmax\(0,1fr\)!important/);
});
test('900–1199 laptop layout overrides legacy fixed viewport and 3 columns',()=>{
  assert.match(css,/@media\(min-width:900px\) and \(max-width:1199px\)/);
  assert.match(css,/grid-template-areas:"center center" "left right"!important/);
  assert.match(css,/grid-template-rows:auto auto!important/);
  assert.match(css,/overflow-y:auto!important/);
  assert.match(css,/max-height:none!important/);
  assert.match(css,/body\.pro-left-collapsed \.game-shell/);
  assert.match(css,/body\.pro-right-collapsed \.game-shell/);
});
test('Phone shows cabinet first and restores browser vertical scrolling',()=>{
  assert.match(css,/@media\(max-width:899px\)/);
  assert.match(css,/@media\(max-width:719px\)/);
  assert.match(css,/grid-template-areas:"center" "right" "left"!important/);
  assert.match(css,/grid-template-areas:"center" "right"!important/);
  assert.match(css,/grid-template-areas:"center" "left"!important/);
  assert.match(css,/overflow-y:visible!important/);
  assert.match(css,/overflow-x:auto!important/);
});
test('Focus dock and device catalogue remain operable',()=>{
  assert.match(dock,/\.pro-focus-dock>\.rightbar>\.panel/);
  assert.match(css,/body\.pro-tools-docked \.pro-focus-dock>\.rightbar/);
  assert.match(css,/position:relative!important;\s*top:auto!important/);
  assert.match(css,/scroll-margin-top:128px!important/);
});
test('Accessible mobile shortcuts jump and reveal hidden sidebars',()=>{
  const f=setup();
  assert.equal(f.buttons.length,2);
  assert.equal(f.buttons[0].attrs['aria-controls'],'proToolSidebar');
  assert.equal(f.buttons[1].attrs['aria-controls'],'proTaskSidebar');
  f.body.classList.add('pro-right-collapsed');
  f.buttons[0].click();
  assert.equal(f.body.classList.contains('pro-right-collapsed'),false);
  assert.equal(f.right.scrolls,1);
  f.body.classList.add('pro-left-collapsed');
  f.buttons[1].click();
  assert.equal(f.body.classList.contains('pro-left-collapsed'),false);
  assert.equal(f.left.scrolls,1);
});
test('Mobile tool shortcut targets actual dock during expanded focus',()=>{
  const f=setup();f.body.classList.add('pro-tools-docked');
  f.body.classList.add('pro-right-collapsed');f.dock.hidden=false;
  f.buttons[0].click();
  assert.equal(f.dock.scrolls,1);
  assert.equal(f.right.scrolls,0);
  assert.equal(f.body.classList.contains('pro-right-collapsed'),true);
});
test('Resize redraws of SVG are batched without electrical engine changes',()=>{
  assert.match(layoutJS,/let wiringFramePending=false/);
  assert.match(layoutJS,/if\(wiringFramePending\)return/);
  assert.match(layoutJS,/window\.ElektrykStage3\?\.redraw\?\.\(\)/);
  assert.match(layoutJS,/window\.ElektrykBridges\?\.redraw\?\.\(\)/);
});
test('Short mobile viewport keeps modal controls and results reachable',()=>{
  assert.match(css,/@media\(max-height:700px\) and \(max-width:899px\)/);
  assert.match(css,/\.task-modal \.task-window/);
  assert.match(css,/\.board-selector-modal \.board-selector-window/);
  assert.match(css,/max-height:48dvh!important/);
});
test('Scope safeguards protect electrical geometry and Player Hub',()=>{
  assert.doesNotMatch(rulesOnly,/\.cabinet-inner|\.wire-terminal|\.mount-grid|\.din-row|\.supply-terminals/);
  assert.doesNotMatch(rulesOnly,/\.auth-card|\.player-hub|\.hub-/);
  assert.equal((rulesOnly.match(/\{/g)||[]).length,(rulesOnly.match(/\}/g)||[]).length);
});
test('Latest CSS and JS cache are correctly registered',()=>{
  assert.ok(html.indexOf('responsive-workspace-v0719.css?v=0719')>
    html.indexOf('apparatus-realism-v0718.css?v=0718'));
  assert.match(html,/ui-pro-v07122\.js\?v=0719/);
  assert.match(html,/auth-v050\.js\?v=0722a/);
  assert.match(loader,/responsive-workspace-v0719\.js\?v=0719/);
  assert.match(loader,/stage2\.js\?v=0722/);
  assert.match(loader,/tasks-v046\.js\?v=0722/);
});
