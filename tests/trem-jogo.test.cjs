const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const game = require('../trem-jogo-modelo.js');

for(let round=0;round<24;round++) {
  for(let phase=0;phase<6;phase++) {
    const level=game.makeLevel(phase,round), state=game.empty(level);
    assert(!game.check(level,state).ok);
    assert.equal(new Set(level.order).size,level.pieces.length);
    assert(level.pieces.every(p=>p.value>0&&p.value<1000));
    assert(level.zones.every(z=>z.target<1000));
    for(const [id,destination] of level.solution.entries()) {
      if(destination>=0)assert(game.move(level,state,id,destination));
    }
    assert(game.check(level,state).ok,`${phase}/${round}`);
    const restored=game.restore(level,JSON.parse(JSON.stringify(state)));
    assert.deepEqual(restored.places,state.places);
    assert(game.undo(restored));
    assert(!game.check(level,restored).ok);
    state.done=true;
    assert(!game.move(level,state,0,-1));
    if(round>0)assert.notDeepEqual(level.zones.map(z=>z.target),game.makeLevel(phase,round-1).zones.map(z=>z.target));
  }
}
const level=game.makeLevel(0), state=game.empty(level);
for(let id=0;id<3;id++)assert(game.move(level,state,id,0));
const before=JSON.stringify(state);
assert(!game.move(level,state,3,0));assert.equal(JSON.stringify(state),before);
assert(!game.move(level,state,99,1));assert(!game.move(level,state,1,NaN));
assert(game.move(level,state,0,-1));assert(game.undo(state));assert.equal(state.places[0],0);
assert(!game.restore(level,{places:[99],done:true}).done);
assert.equal(game.restore(level,{places:level.solution,history:'invalid',done:true}).history.length,0);

// Drive real pointer handlers against a DOM adapter. No browser or physical-device claim.
function mount(saved) {
  let storage=saved||'{}', time=1000, hit=null, approved=false;
  const elements=new Map(), handlers={}, raf=new Map();let rafId=0;
  function element(id, dataset={}) {
    if(elements.has(id))return elements.get(id);
    const node={id,dataset,style:{},classList:{add(){},remove(){}},disabled:false,innerHTML:'',textContent:'',
      matches(selector){return selector==='[data-piece]'&&this.dataset.piece!==undefined;},
      closest(selector){return selector==='[data-piece]'&&this.dataset.piece!==undefined?this:selector==='[data-action]'&&this.dataset.action?this:selector==='[data-zone]'&&this.dataset.zone!==undefined?this:null;},
      addEventListener(name,fn){handlers[name]=fn;},
      querySelector(){return element('queried');},querySelectorAll(){return [];},
      getBoundingClientRect(){return {left:0,top:0,width:85,height:88};},
      setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;},
      setAttribute(){},removeAttribute(){},remove(){},focus(){},scrollIntoView(){},showModal(){},close(){},
      cloneNode(){return element('ghost');}};
    elements.set(id,node);return node;
  }
  const context={CargoGame:game,document:{getElementById:element,elementFromPoint:()=>hit,body:{appendChild(){}}},
    localStorage:{getItem:()=>storage,setItem:(_,value)=>storage=value},
    window:{innerHeight:1080,scrollTo(){},scrollBy(){},addEventListener(name,fn){handlers[name]=fn;}},
    performance:{now:()=>time},requestAnimationFrame:fn=>{raf.set(++rafId,fn);return rafId;},cancelAnimationFrame:id=>raf.delete(id),
    confirm:()=>approved};
  vm.runInNewContext(fs.readFileSync('trem-jogo.js','utf8'),context);
  function click(action,index,zone) {time+=1000;handlers.click({target:element(`button-${action}-${index}-${zone}`,{action,index,zone})});}
  function cardClick(id){time+=1000;handlers.click({target:element(`card${id}`,{piece:String(id)})});}
  function drag(id, destination, pointerType='pen', cancel=false) {
    const card=element(`card${id}`,{piece:String(id)});
    const event={target:card,pointerId:1,button:0,isPrimary:true,pointerType,clientX:20,clientY:20,preventDefault(){}};
    handlers.pointerdown(event);
    handlers.pointermove({...event,clientX:200,clientY:400});
    hit=destination===null?null:element(`zone${destination}`,{zone:String(destination)});
    if(cancel)handlers.pointercancel(event);else handlers.pointerup({...event,clientX:200,clientY:400});
  }
  return {click,cardClick,drag,handlers,element,get data(){return JSON.parse(storage);},approve(){approved=true;},get stored(){return storage;}};
}
const ui=mount();
ui.drag(0,0);assert.equal(ui.data.states[0].places[0],0);
ui.drag(0,-1,'touch');assert.equal(ui.data.states[0].places[0],-1);
ui.drag(1,1,'pen',true);assert.equal(ui.data.states[0].places[1],-1);
ui.drag(1,null);assert.equal(ui.data.states[0].places[1],-1);
ui.cardClick(1);ui.click('drop',undefined,'0');assert.equal(ui.data.states[0].places[1],0);
ui.click('undo');assert.equal(ui.data.states[0].places[1],-1);
const reload=mount(ui.stored);assert.deepEqual(reload.data.states[0].places,ui.data.states[0].places);
for(let phase=0;phase<6;phase++) {
  ui.click('level',String(phase));
  const level=game.makeLevel(phase);
  level.solution.forEach((destination,id)=>{if(destination>=0)ui.drag(id,destination);});
  ui.click('check');assert(ui.data.states[phase].done,`Conclusão da fase ${phase}`);
}
const old=ui.stored;ui.click('new-round');assert.equal(ui.stored,old);
ui.approve();ui.click('new-round');assert.equal(ui.data.round,1);assert(!ui.data.states[0].done);
console.log('OK: 72 desafios válidos, dois ciclos, limites de caixas, desfazer, retomada, arraste com caneta/toque, cancelamento, toque alternativo, seis conclusões e nova partida.');
