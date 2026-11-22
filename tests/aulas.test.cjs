const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const lessons=require('../aulas-dados.js');
global.MathBook=require('../matematica-data.js');
global.Expresso=require('../expresso-missoes.js');
const rounds=require('../expresso-rodadas.js');
const workshop=require('../expresso-oficina.js');
const cargo=require('../trem-jogo-modelo.js');

// Uma conta resolvida pela criança é aceita sem exigir que o site faça as trocas.
for(let r=0;r<9;r++)for(const station of rounds.create(r))for(const job of station.jobs) {
  if(job.kind!=='exchange')continue;
  const answer=job.op==='+'?job.a+job.b:job.a-job.b;
  assert(!workshop.judge(job,{result:workshop.digits(answer).map(String)}).error);
  assert(workshop.judge(job,{result:['9','9','9']}).error);
}
// Uma tentativa errada do jogo oferece orientação, sem fazer a conta pela criança.
for(let r=0;r<12;r++)for(let phase=0;phase<6;phase++) {
  const level=cargo.makeLevel(phase,r),state=cargo.empty(level);
  state.places=level.solution.map(z=>z);
  const first=state.places.findIndex(z=>z===0),other=state.places.findIndex((z,i)=>z!==0&&level.pieces[i].value!==level.pieces[first].value);
  if(other<0)continue;
  [state.places[first],state.places[other]]=[state.places[other],state.places[first]];
  const report=cargo.check(level,state).reports[0];
  assert(!report.ok);
  assert(!/sua carga tem|Faltam \d|Passaram \d|pedido completo/.test(report.text));
}
assert.notEqual(lessons.create('soma',{a:46,b:27}).example,'46 + 27');
assert.notEqual(lessons.create('subtracao',{a:52,b:28}).example,'52 − 28');
assert.notEqual(lessons.create('divisao',{groups:4,each:5}).example,'20 bolinhas para 4 caixas');
for(const topic of ['soma','subtracao','multiplicacao','divisao','dobro','sequencia']) {
  const lesson=lessons.create(topic);
  assert(lesson.steps.length>=5);
  assert(lesson.steps.some(s=>s.pause));
  assert(lesson.steps.every(s=>s.narration&&s.scene&&s.equation));
}
const sum=lessons.create('soma').steps;
assert.equal(sum[2].scene.tens*10+sum[2].scene.units,73);
assert.equal(sum[4].scene.tens*10+sum[4].scene.units,73);
const sub=lessons.create('subtracao').steps;
assert.equal(sub[2].scene.tens*10+sub[2].scene.units,52);
assert.equal(sub[5].scene.result,24);

// Controle real das aulas, com relógio determinístico: pausa, próxima etapa, voz e fechamento.
function mount() {
  let id=0,now=0,dialog,utterance,cancelled=0,returned=0;
  const timers=new Map(),docEvents={},nodes=new Map();
  const synth={getVoices:()=>[{lang:'pt-BR'}],speak:u=>utterance=u,cancel:()=>cancelled++};
  function node(selector){if(!nodes.has(selector))nodes.set(selector,{textContent:'',setAttribute(){},focus(){}});return nodes.get(selector);}
  const document={activeElement:{focus:()=>returned++},hidden:false,body:{appendChild(){}},
    addEventListener:(name,fn)=>docEvents[name]=fn,
    createElement:()=>dialog={open:false,innerHTML:'',events:{},setAttribute(){},
      addEventListener(name,fn){this.events[name]=fn;},querySelector:node,
      showModal(){this.open=true;},close(){this.open=false;this.events.close();}}
  };
  const context={LessonData:lessons,document,window:{speechSynthesis:synth,SpeechSynthesisUtterance:class{}},SpeechSynthesisUtterance:class{},
    setTimeout:(fn,delay)=>{timers.set(++id,{fn,time:now+delay});return id;},clearTimeout:n=>timers.delete(n)};
  vm.runInNewContext(fs.readFileSync('aulas.js','utf8')+'\nthis.app=Aulas;',context);
  return {open:topic=>context.app.open(topic),get html(){return dialog.innerHTML;},get dialog(){return dialog;},
    get utterance(){return utterance;},get returned(){return returned;},get cancelled(){return cancelled;},
    get pending(){return timers.size;},get play(){return node('[data-lesson="play"]').textContent;},
    click:action=>dialog.events.click({target:{closest:()=>({dataset:{lesson:action}})}}),
    tick(){const [key,timer]=[...timers].sort((a,b)=>a[1].time-b[1].time)[0]||[];assert(timer,'há uma etapa agendada');timers.delete(key);now=timer.time;timer.fn();for(const [nextId,next] of [...timers])if(next.time===now){timers.delete(nextId);next.fn();}},
    hide(){document.hidden=true;docEvents.visibilitychange();}
  };
}
const ui=mount();ui.open('soma');assert(ui.html.includes('46 + 27 = ?'));
assert.equal(ui.pending,0);
ui.click('play');ui.tick();assert(ui.html.includes('Organize dezenas e unidades'));
ui.tick();assert(ui.html.includes('Junte as duas quantidades'));
ui.tick();assert.equal(ui.pending,0);assert.equal(ui.play,'Continuar a aula →');
ui.click('play');assert(ui.html.includes('Separe um grupo de dez'));
ui.click('play');assert.equal(ui.pending,0); // pause
ui.click('next');assert(ui.html.includes('Faça a troca'));
ui.click('previous');assert(ui.html.includes('Separe um grupo de dez'));
ui.click('restart');assert(ui.html.includes('Leia a história'));
ui.click('sound');assert.equal(ui.utterance.lang,'pt-BR');assert.equal(ui.utterance.voice.lang,'pt-BR');
const stale=ui.utterance.onend;
ui.click('close');assert.equal(ui.pending,0);assert.equal(ui.returned,1);assert(ui.cancelled>0);
stale();assert.equal(ui.pending,0); // encerramento antigo da voz não reabre a aula
ui.open('divisao');ui.click('play');ui.hide();assert.equal(ui.pending,0);
for(const topic of ['soma','subtracao','multiplicacao','divisao','dobro','sequencia']) {
  ui.open(topic);const lesson=lessons.create(topic);
  for(const [i,step] of lesson.steps.entries()) {
    assert(ui.html.includes(step.title));assert(!ui.html.includes('undefined'));if(i<lesson.steps.length-1)ui.click('next');
  }
  ui.click('close');
}
console.log('OK: cálculo independente, pistas sem respostas, exemplos, conservação das trocas, seis aulas, pausas para pensar, navegação, voz e cancelamento.');
