/* Run: node --test tests/task-catalog-v07176.test.mjs
   Exercises production curriculum + task catalog using a minimal DOM harness. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tasks=readFileSync(new URL('../tasks-v046.js',import.meta.url),'utf8');
const curriculum=readFileSync(new URL('../curriculum-v0714.js',import.meta.url),'utf8');
const progress=readFileSync(new URL('../progress-v060.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../task-catalog-pro-v07176.css',import.meta.url),'utf8');

class El{
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.parent=null;this.dataset={};this.style={};
    this.attrs={};this.handlers={};this.className='';this.value='';
    this.textContent='';this.hidden=false;this.disabled=false;
    this.classList={
      add:name=>{if(!this.className.split(' ').includes(name))this.className+=' '+name},
      remove:name=>{this.className=this.className.split(' ').filter(x=>x!==name).join(' ')},
      toggle:(name,value)=>{
        if(value===undefined)value=!this.className.split(' ').includes(name);
        if(value)this.classList.add(name);else this.classList.remove(name);
      }
    };
  }
  appendChild(node){
    if(node.parent)node.parent.children=node.parent.children.filter(x=>x!==node);
    this.children.push(node);node.parent=this;return node;
  }
  append(...nodes){nodes.forEach(x=>this.appendChild(x))}
  insertAdjacentElement(position,node){
    if(!this.parent)throw Error('Missing host');
    if(node.parent)node.parent.children=node.parent.children.filter(x=>x!==node);
    this.parent.children.splice(this.parent.children.indexOf(this)+(position==='afterend'?1:0),0,node);
    node.parent=this.parent;
  }
  replaceChildren(...nodes){this.children=[];this.append(...nodes)}
  querySelector(selector){
    if(selector.startsWith('[data-task-id="'))
      return this.children.find(x=>x.dataset.taskId===selector.split('"')[1])||null;
    return this.alias?.[selector]||null;
  }
  querySelectorAll(tag){
    const result=[];
    const visit=el=>el.children.forEach(ch=>{if(ch.tag===tag)result.push(ch);visit(ch)});
    visit(this);return result;
  }
  setAttribute(name,value){this.attrs[name]=String(value)}
  addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
  click(){(this.handlers.click||[]).forEach(fn=>fn({target:this}))}
  focus(){}
}

function setup(){
  const cards=new El(),host=new El(),modal=new El(),headSmall=new El(),shortcut=new El();
  const taskButton=new El('button'),title=new El(),version=new El();
  host.appendChild(cards);modal.alias={'.task-window-head small':headSmall};
  const events={};
  const document={
    createElement:type=>new El(type),
    querySelector:selector=>({
      '.task-cards':cards,'.task-button small':shortcut,'.task-button':taskButton,
      '.active-task .panel-title':title,'.cabinet-head .version':version
    })[selector]||null,
    getElementById:id=>id==='taskModal'?modal:null,
    addEventListener:(key,fn)=>(events[key]??=[]).push(fn),
    dispatchEvent:e=>(events[e.type]||[]).forEach(fn=>fn(e))
  };
  const window={};
  new Function('window','structuredClone',curriculum)(window,x=>JSON.parse(JSON.stringify(x)));
  let selected=null;
  window.ElektrykStage2={
    configureTask:t=>{selected=t},getTask:()=>selected||{id:1}
  };
  const data={completed:{1:true,12:true,201:true},bestStars:{1:3,12:2,201:1},xp:550};
  window.ElektrykProgress={get:()=>data,refreshProfile:()=>{},refreshCards:()=>{}};
  const CustomEvent=function(type,params){this.type=type;this.detail=params?.detail};
  new Function('window','document','CustomEvent','requestAnimationFrame',tasks)(
    window,document,CustomEvent,()=>{}
  );
  const filterHost=host.children.find(x=>x.className.includes('task-filter-toolbar'));
  const overview=host.children.find(x=>x.className==='task-overview');
  const find=id=>{
    let match=null;
    const scan=el=>{if(el.id===id)match=el;el.children.forEach(scan)};
    scan(host);return match;
  };
  const change=(id,value)=>{
    const control=find(id);
    assert.ok(control,'Missing '+id);
    control.value=value;
    (control.handlers.change||control.handlers.input||[]).forEach(fn=>fn());
  };
  return {
    cards,host,overview,filterHost,data,window,document,CustomEvent,change,
    getSelected:()=>selected,
    completedText:()=>overview.children[1].children[0].children[1].textContent
  };
}
test('300-task catalog features and progress',()=>{
  const f=setup();
  assert.equal(f.window.ElektrykTasks.all.length,300);
  assert.equal(new Set(f.window.ElektrykTasks.all.map(x=>x.id)).size,300);
  assert.equal(f.cards.children.length,12);
  assert.equal(f.completedText(),'3 / 300');
  f.change('taskCatalogStatus','done');
  assert.deepEqual(f.cards.children.map(c=>Number(c.dataset.taskId)),[1,12,201]);
  f.change('taskCatalogSearch','201');
  assert.equal(f.cards.children.length,1);
  assert.equal(f.cards.children[0].dataset.taskId,'201');
  f.change('taskCatalogStatus','open');
  assert.equal(f.cards.children[0].className,'task-catalog-empty');
  f.change('taskCatalogStatus','all');
  f.change('taskCatalogSearch','');
  f.change('taskCatalogLevel','PODSTAWY');
  assert.ok(f.cards.children.every(c=>c.children[0].children[1].textContent==='PODSTAWY'));
  f.filterHost.children.find(c=>c.className==='task-clear-filters').click();
  assert.equal(f.cards.children.length,12);
  f.cards.children[2].click();
  assert.equal(f.getSelected().id,3);
  f.data.completed[3]=true;
  f.document.dispatchEvent(new f.CustomEvent('elektryk:progress-updated'));
  assert.equal(f.completedText(),'4 / 300');
  assert.ok(f.cards.children.some(c=>c.children[3].children[1].textContent.includes('/18M')));
});
test('task completion/reset emits catalog updates without duplicating XP',()=>{
  assert.match(progress,/document\.dispatchEvent\(new CustomEvent\('elektryk:progress-updated'\)\)/);
  assert.match(progress,/const first=!data\.completed\[id\]/);
});
test('UI wiring and scope are correct',()=>{
  assert.match(html,/task-catalog-pro-v07176\.css\?v=07176/);
  assert.match(html,/id="taskCatalogTitle"/);
  assert.match(html,/aria-modal="true"/);
  assert.match(css,/\.task-overview/);
  assert.match(css,/\.task-catalog-empty/);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
  assert.doesNotMatch(css,/\.cabinet-inner[^{]*\{|\.din-row[^{]*\{/);
});
