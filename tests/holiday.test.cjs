const assert = require('node:assert/strict');
const fs = require('node:fs');
const {sections,tasks,actions,items,feelings,slug,wearing}=require('../holiday-data');
const signature=q=>q.order||q.orders||(q.kind==='dialog'?q.target:q.word);
for(let r=0;r<4;r++){
  for(const [id] of sections){
    const deck=tasks(id,r), next=tasks(id,(r+1)%4);
    deck.forEach((q,i)=>{
      assert.notDeepEqual(signature(q),signature(next[i]),id+' changes the answer on card '+i);
      if(q.kind==='dialog'){
        assert(q.options.includes(q.target)&&q.options.includes(q.word));
        assert.equal(q.word===q.target,q.yes);
        assert.equal(new Set(q.options).size,2);
      }
      if(q.kind==='bags')assert.equal(new Set(q.orders).size,4);
      if(q.kind==='order')assert.deepEqual([...q.order].sort(),[...actions].sort());
    });
  }
  assert.deepEqual(tasks('closet',r).map(q=>q.word).sort(),[...items].sort());
  assert.deepEqual(tasks('listen',r).map(q=>q.target).sort(),[...feelings].sort());
}
assert.match(wearing('she','skirt'),/wearing a /);
assert.match(wearing('he','shorts'),/wearing ____/);
const pairs=['he','she'].flatMap(p=>feelings.map(w=>p+'-'+w));
for(const word of [...items,...actions,...pairs,'cover'])
  assert(fs.existsSync('assets/holiday-art/'+slug(word)+'.svg'));
for(const word of [...items,...actions,...feelings,...pairs,'he-no','she-no','he-yes','she-yes'])
  assert(fs.statSync('assets/holiday-audio/'+slug(word)+'.mp3').size>1000);
console.log('Four round transitions, grammar, answer keys, artwork and audio passed.');
