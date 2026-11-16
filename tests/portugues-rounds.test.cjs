const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('portugues-data.js', 'utf8') + fs.readFileSync('portugues-rounds.js', 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
for (let unit = 0; unit < 8; unit++) {
  let previous = null;
  for (let round = 0; round < 12; round++) {
    const lesson = context.portuguesePractice(unit, round);
    assert(lesson.text && lesson.intro);
    const questions = lesson.tasks.map(task => task[0]);
    const answers = lesson.tasks.map(task => task[1] ? task[1][task[2]] : task[2]);
    assert(answers.every(answer => typeof answer === 'string' && answer.length > 0));
    for (const task of lesson.tasks) {
      if (task[1]) {
        assert(new Set(task[1]).size === task[1].length);
        assert(task[3]);
      }
    }
    if (previous) {
      assert(questions.every(question => !previous.questions.includes(question)), `Pergunta repetida: ${unit}/${round}`);
      assert(answers.every(answer => !previous.answers.includes(answer)), `Resposta repetida: ${unit}/${round}`);
    }
    previous = {questions, answers};
  }
}
// Exercise the global control, preserving legacy responses until confirmation.
const elements = {};
let stored = JSON.stringify({0:{round:3,answers:[{text:'resposta antiga'}]}});
let approve = false;
const app = {querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){}};
Object.assign(context, {
 document:{querySelector:selector=>selector==='#app'?app:(elements[selector]??={})},
 localStorage:{getItem:()=>stored,setItem:(_,value)=>stored=value},
 window:{scrollTo(){}},confirm:()=>approve
});
vm.runInContext(fs.readFileSync('portugues.js','utf8'),context);
const old=stored;
elements['#new-round-all'].onclick();assert.equal(stored,old);
approve=true;
elements['#new-round-all'].onclick();
assert(Object.values(JSON.parse(stored)).every(s=>s.practiceRound===0 && s.answers.length===0));
elements['#new-round-all'].onclick();
assert(Object.values(JSON.parse(stored)).every(s=>s.practiceRound===1));
console.log('OK: 8 caminhos, 6 rodadas, 192 propostas; ciclos consecutivos sem perguntas ou respostas-modelo iguais; cancelamento e migração preservados.');
