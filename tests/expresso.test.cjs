const assert = require('node:assert/strict');
global.MathBook = require('../matematica-data.js');
const {stops} = require('../expresso-missoes.js');
const game = require('../expresso-oficina.js');

for (const job of stops.flatMap(s => s.jobs)) {
  const state = {};
  assert.ok(game.judge(job,state).error, job.id + ' deve começar em aberto');
  if (job.kind === 'exchange') {
    const signed = job.op === '+' ? job.b : -job.b;
    const total = job.a + signed;
    let trades = 0;
    while (game.exchangeAt(job,state) !== undefined) {
      const before = game.material(job,state);
      game.adjust(job,state,'trade');
      const after = game.material(job,state);
      const value = m => 100*m[0] + 10*m[1] + m[2];
      assert.equal(value(before),value(after));
      assert.ok(after.every(n => n>=0));
      assert.ok(++trades<5);
    }
    state.result = game.digits(total).map(String);
    assert.ok(!game.judge(job,state).error, job.id);
  }
  if (job.kind === 'load' || job.kind === 'share') {
    for (let i=0; i<job.each; i++) game.adjust(job,state,'round');
    state.answer = String(job.kind === 'load' ? job.groups*job.each : job.each);
    assert.ok(!game.judge(job,state).error, job.id);
    game.adjust(job,state,'undo-load');
    assert.ok(game.judge(job,state).error);
  }
}

const job = stops.flatMap(s => s.jobs).find(j => j.kind === 'sum');
const state = {selection:[0,3,6]};
assert.equal(game.storeSum(job,state),'');
state.selection = [6,0,3];
assert.ok(game.storeSum(job,state));
state.selection = [1,2,3,6];
assert.equal(game.storeSum(job,state),'');
assert.ok(!game.judge(job,state).error);

const tale = stops.flatMap(s => s.jobs).find(j => j.kind === 'story');
assert.ok(game.judge(tale,{reviewed:true}).error);
assert.ok(!game.judge(tale,{reviewed:true,ink:[[[0.1,0.5]]]}).error);
console.log('Trocas, grupos, decomposições e criação de problemas verificados nas seis estações.');
