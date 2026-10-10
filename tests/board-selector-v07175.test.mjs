/* RozdzielnicaPRO.pl v0.7.17.5 — regresja okna wyboru obudowy.
 * Run: node --test tests/board-selector-v07175.test.mjs
 * Exercises the production selector/filter functions with a light DOM mock. */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const auth=readFileSync(new URL('../auth-v050.js',import.meta.url),'utf8');
const db=readFileSync(new URL('../switchboard-db.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../board-selector-pro-v07175.css',import.meta.url),'utf8');

class MockElement{
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.className='';this.dataset={};
    this.attrs={};this.value='';this.textContent='';this.handlers={};
    this.classList={
      add:key=>{if(!this.className.split(/\s+/).includes(key))this.className+=' '+key},
      toggle:(key,on)=>{
        if(on)this.classList.add(key);
        else this.className=this.className.split(/\s+/).filter(x=>x!==key).join(' ');
      }
    };
  }
  setAttribute(key,value){this.attrs[key]=value}
  append(...nodes){nodes.forEach(node=>this.appendChild(node))}
  appendChild(node){
    if(node.tag==='fragment')this.children.push(...node.children);
    else this.children.push(node);
    return node;
  }
  replaceChildren(){this.children=[]}
  addEventListener(event,fn){this.handlers[event]=fn}
}
function fixture(){
  const grid=new MockElement('grid'),counter=new MockElement('counter');
  const search=new MockElement('input'),size=new MockElement('select');
  const tabs=['all','residential','large_residential','industrial'].map(name=>{
    const tab=new MockElement('button');tab.dataset.boardFamily=name;return tab;
  });
  const elements={boardSelectorGrid:grid,boardSelectorCount:counter,boardSelectorSearch:search,boardSelectorSize:size};
  const document={
    getElementById:id=>elements[id]||null,
    querySelectorAll:selector=>selector==='[data-board-family]'?tabs:[],
    createElement:tag=>new MockElement(tag),
    createDocumentFragment:()=>new MockElement('fragment')
  };
  const window={};
  new Function('window','structuredClone',db)(window,value=>JSON.parse(JSON.stringify(value)));
  const from=auth.indexOf("let selectedBoardFamily='all'");
  const to=auth.indexOf('async function openBoardSelector(',from);
  assert.ok(from>=0&&to>from);
  let picked=null;
  const source=auth.slice(from,to);
  const factory=new Function(
    'window','document','isDemo','mountingLabel','levelLabel','boardPreview',
    'activeFreeTemplate','enterGame','closeBoardSelector',
    source+';return {renderBoardSelector,setBoardFamily,normalizeBoardSearch};'
  );
  const selector=factory(
    window,document,()=>false,x=>x||'',x=>x||'',
    ()=>new MockElement('preview'),null,
    (mode,template)=>{picked={mode,id:template.id}},
    ()=>{}
  );
  return {grid,counter,search,size,tabs,selector,getPicked:()=>picked};
}
test('all seven supported models are selectable',()=>{
  const f=fixture();f.selector.renderBoardSelector();
  assert.equal(f.grid.children.length,7);
  assert.equal(f.counter.textContent,'7 z 7 modeli');
});
test('family tabs separate residential, large residential and industrial',()=>{
  const f=fixture();
  f.selector.setBoardFamily('residential');
  assert.equal(f.grid.children.length,2);
  f.selector.setBoardFamily('large_residential');
  assert.equal(f.grid.children.length,2);
  f.selector.setBoardFamily('industrial');
  assert.equal(f.grid.children.length,2);
  assert.ok(f.grid.children.every(card=>card.dataset.boardFamily==='industrial'));
  assert.equal(f.tabs.filter(tab=>tab.attrs['aria-pressed']==='true').length,1);
});
test('search recognizes Polish labels and × dimensions',()=>{
  const f=fixture();f.selector.setBoardFamily('industrial');
  f.search.value='5×24';f.selector.renderBoardSelector();
  assert.equal(f.grid.children.length,1);
  assert.equal(f.grid.children[0].dataset.boardId,'IND-PRO-5X24');
  f.search.value='ZUG';f.selector.renderBoardSelector();
  assert.equal(f.grid.children.length,2);
});
test('capacity filter handles empty state and XL models',()=>{
  const f=fixture();f.selector.setBoardFamily('industrial');
  f.size.value='small';f.selector.renderBoardSelector();
  assert.equal(f.grid.children[0].className,'board-selector-empty');
  assert.equal(f.counter.textContent,'0 z 7 modeli');
  f.size.value='large';f.selector.renderBoardSelector();
  assert.equal(f.grid.children.length,1);
  assert.equal(f.grid.children[0].dataset.boardId,'IND-PRO-5X24');
});
test('choosing a card reuses the existing free-build entry',()=>{
  const f=fixture();f.selector.renderBoardSelector();
  const card=f.grid.children.find(x=>x.dataset.boardId==='IND-PRO-4X24');
  card.handlers.click();
  assert.deepEqual(f.getPicked(),{mode:'free',id:'IND-PRO-4X24'});
});
test('industrial mode opens the picker, not a hardcoded board',()=>{
  assert.match(auth,/modeIndustrial'\)\?\.addEventListener\('click',\(\)=>openBoardSelector\('industrial'\)\)/);
  assert.match(auth,/closeBoardSelector\(false\)/);
  assert.match(auth,/event\.key==='Escape'/);
});
test('modal style and browser entry are wired',()=>{
  assert.match(index,/board-selector-pro-v07175\.css\?v=07175/);
  assert.match(index,/boardSelectorSearch/);
  assert.match(index,/boardSelectorSize/);
  assert.match(index,/aria-modal="true"/);
  assert.match(css,/\.board-selector-empty/);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
});
