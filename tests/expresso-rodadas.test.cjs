const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
global.MathBook = require('../matematica-data.js');
global.Expresso = require('../expresso-missoes.js');
const rounds = require('../expresso-rodadas.js');
const workshop = require('../expresso-oficina.js');

function solve(job) {
  const state = {};
  switch (job.kind) {
    case 'exchange': {
      let trades = 0;
      while (workshop.exchangeAt(job,state) !== undefined) {
        const value = () => workshop.material(job,state).reduce((sum,n,i)=>sum+n*[100,10,1][i],0);
        const before = value();
        workshop.adjust(job,state,'trade');
        assert.equal(value(),before);
        assert(workshop.material(job,state).every(n=>n>=0));
        assert(++trades < 5);
      }
      state.result=workshop.digits(job.op==='+'?job.a+job.b:job.a-job.b).map(String);
      break;
    }
    case 'track': state.selection=job.solution.map(n=>job.picks.indexOf(n));break;
    case 'quiz': state.choice=job.key;break;
    case 'word': state.answer=MathBook.words(job.n).toUpperCase();break;
    case 'sum': {
      for(let mask=1;mask<2**job.pieces.length && (state.ways||[]).length<2;mask++) {
        state.selection=job.pieces.map((_,i)=>i).filter(i=>mask&(1<<i));
        workshop.storeSum(job,state);
      }
      assert.equal(state.ways?.length,2);break;
    }
    case 'table':
      state.selection=job.wanted;
      state.answer=String(job.op==='+'?job.wanted.reduce((s,i)=>s+job.rows[i][1],0):Math.abs(job.rows[job.wanted[0]][1]-job.rows[job.wanted[1]][1]));break;
    case 'load':case 'share':
      for(let i=0;i<job.each;i++)workshop.adjust(job,state,'round');
      state.answer=String(job.kind==='load'?job.groups*job.each:job.each);break;
    case 'batch':state.count=job.groups;state.answer=String(job.groups*job.each);break;
    case 'fraction':state.selection=Array.from({length:job.total/job.parts},(_,i)=>i);break;
    case 'bundles':state.count=job.total/job.each;state.answer=String(state.count);break;
    case 'seats':
      state.selection=Array.from({length:Math.min(job.rows*job.per,job.people)},(_,i)=>i);
      state.choice=0;state.answer=String(Math.abs(job.rows*job.per-job.people));break;
    case 'story':state.note=job.prompt;state.reviewed=true;break;
  }
  assert(!workshop.judge(job,state).error,`${job.id}: ${workshop.judge(job,state).error}`);
  return state;
}
function answerSignature(job, state) {
  if(job.kind==='track') return job.solution.join(',');
  if(job.kind==='quiz') return job.choices[job.key];
  if(job.kind==='sum') return String(job.target);
  if(job.kind==='fraction') return String(job.total/job.parts);
  if(job.kind==='story') return job.prompt;
  return state.answer || state.result.join('');
}
let previous;
for(let round=0;round<=17;round++) {
  const jobs=rounds.create(round).flatMap(s=>s.jobs);
  assert.equal(jobs.length,28);
  const answers=jobs.map(job=>answerSignature(job,solve(job)));
  if(previous) answers.forEach((answer,i)=>assert.notEqual(answer,previous[i],`Resposta repetida em ${round}/${jobs[i].id}`));
  previous=answers;
}
const word=Expresso.stops.flatMap(s=>s.jobs).find(j=>j.kind==='word');
assert(workshop.judge(word,{handReviewed:true}).error);
assert(!workshop.judge(word,{handReviewed:true,ink:[[[.1,.2]]]}).error);

// Mount the real controller with a minimal DOM adapter to exercise events and persistence.
function mount(saved={}, hash='#mapa') {
  const elements=new Map(), listeners={}, windowListeners={};
  let storage=JSON.stringify(saved), approved=false;
  function element(id) {
    if(elements.has(id))return elements.get(id);
    const node={id,innerHTML:'',textContent:'',dataset:{},hidden:true,isConnected:true,
      classList:{toggle(){}},
      setAttribute(){},focus(){},remove(){},getAttribute(){return null;},
      querySelector(){return null;},querySelectorAll(){return [];},
      addEventListener(name,fn){listeners[name]=fn;},
      getBoundingClientRect(){return {width:700,height:390,left:0,top:0};},
      getContext(){return {scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};},setPointerCapture(){}};
    elements.set(id,node);return node;
  }
  const location={hash};
  const context={Expresso,ExpressoRounds:rounds,Oficina:workshop,MathBook,
    document:{getElementById:element,activeElement:null},location,
    localStorage:{getItem:()=>storage,setItem:(_,value)=>{storage=value;}},
    window:{scrollTo(){},devicePixelRatio:2,addEventListener:(name,fn)=>windowListeners[name]=fn},
    ResizeObserver:class {observe(){} disconnect(){}},
    confirm:()=>approved,Event:class {constructor(type){this.type=type;}}
  };
  vm.runInNewContext(fs.readFileSync('expresso.js','utf8'),context);
  function click(action,n) {listeners.click({target:{closest:()=>({dataset:{act:action,n:String(n)}})}});}
  return {element,click,listeners,get data(){return JSON.parse(storage);},approve(){approved=true;},navigate(hash){location.hash=hash;windowListeners.hashchange();}};
}
const original={correio:{pacotes:{result:['','4','3'],done:true,ink:[[[.1,.2]]]}}};
const ui=mount(original);
ui.click('new-trip');assert.deepEqual(ui.data,original);
ui.approve();ui.click('new-trip');assert.deepEqual(ui.data,{round:1});
ui.navigate('#correio/pacotes');
assert(ui.element('game').innerHTML.includes('Minha folha'));
assert(ui.element('game').innerHTML.includes('38 pacotinhos'));
const ink=ui.element('ink');
const pointer={pointerId:1,button:0,isPrimary:true,clientX:30,clientY:40,preventDefault(){}};
ink.onpointerdown({...pointer,pointerType:'touch'});ink.onpointerup(pointer);
assert.equal((ui.data.correio.pacotes.ink||[]).length,0);
ink.onpointerdown({...pointer,pointerType:'pen'});ink.onpointerup(pointer);
assert.equal(ui.data.correio.pacotes.ink.length,1);
ui.navigate('#mapa');ui.navigate('#correio/pacotes');
assert.equal(ui.data.correio.pacotes.ink.length,1);
const input={dataset:{result:'2'},readOnly:true,isConnected:true,value:'',maxLength:1,matches:()=>true,getAttribute:()=> 'Unidades do resultado',dispatchEvent:()=>ui.listeners.input({target:input})};
ui.listeners.focusin({target:input});ui.click('digit',7);assert.equal(ui.data.correio.pacotes.result[2],'7');
ui.click('digit',9);assert.equal(ui.data.correio.pacotes.result[2],'9');
ui.click('erase-digit');assert.equal(ui.data.correio.pacotes.result[2],'');
ui.navigate('#colecoes/escrever');
const wordInk=ui.element('ink');wordInk.onpointerdown({...pointer,pointerType:'pen'});wordInk.onpointerup(pointer);
ui.click('check');assert(ui.element('feedback').innerHTML.includes('Compare sua escrita'));
ui.click('review-word');assert(ui.data.colecoes.escrever.done);
ui.click('undo-ink');assert(!ui.data.colecoes.escrever.done);
for(const station of rounds.create(1))for(const job of station.jobs)ui.navigate(`#${station.id}/${job.id}`);

// Caso relatado no iPad: 822 - 370. Anotar 7 centenas e 12 dezenas, sem preencher unidades.
const reported=rounds.create(4).flatMap(s=>s.jobs).find(j=>j.id==='casinha');
assert.equal(reported.a,822);assert.equal(reported.b,370);
const trading={};workshop.adjust(reported,trading,'trade');assert.deepEqual(workshop.material(reported,trading),[7,12,2]);
assert(workshop.judge(reported,{result:['4','4','2']}).error.includes('dezenas'));
assert(!workshop.judge(reported,{result:['4','5','2']}).error);
const noteUI=mount({round:4,correio:{casinha:{notes:['1','',''],ink:[[[.2,.3]]]}}},'#correio/casinha');
function noteInput(index,value){const n={dataset:{carry:String(index)},readOnly:true,isConnected:true,value,maxLength:2,matches:()=>true,getAttribute:()=> 'Quantidade após a troca'};n.dispatchEvent=()=>noteUI.listeners.input({target:n});return n;}
const hundreds=noteInput(0,'1');noteUI.listeners.focusin({target:hundreds});noteUI.click('digit',7);
assert.equal(noteUI.data.correio.casinha.notes[0],'7'); // novo toque substitui a anotação antiga
const tens=noteInput(1,'');noteUI.listeners.focusin({target:tens});noteUI.click('digit',1);noteUI.click('digit',2);
assert.deepEqual(noteUI.data.correio.casinha.notes,['7','12','']);
noteUI.navigate('#mapa');noteUI.navigate('#correio/casinha');
assert(noteUI.element('game').innerHTML.includes('Depois da troca'));
assert(noteUI.element('game').innerHTML.includes('id="original-digit-0" class="replaced-digit"'));
assert(noteUI.element('game').innerHTML.includes('id="original-digit-1" class="replaced-digit"'));
assert(noteUI.element('game').innerHTML.includes('id="original-digit-2" class=""'));
assert.equal(noteUI.data.correio.casinha.ink.length,1);
console.log('OK: 28 missões × 18 viagens, respostas diferentes entre viagens, correção, migração, caneta, rejeição de toque, teclado numérico, revisão manual e montagem das 28 telas.');
console.log('OK: caso 822 - 370, anotação de dois dígitos, edição, retomada e indicação das colunas trocadas.');

