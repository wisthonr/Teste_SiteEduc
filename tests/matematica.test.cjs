const assert=require('node:assert/strict');
const M=require('../matematica-data.js');
let seed=53127;
const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const check=(f,v)=>M.checkField(f,v).status;
assert.equal(M.pages.length,12);
assert.equal(M.make('103').tasks[0].fields[0].expected,269);
assert.deepEqual(M.make('169').tasks.map(t=>t.a+t.b),[911,835,561,763]);
assert.deepEqual(M.make('160').chart.targets,[769,742,754]);
assert.equal(M.words(0),'zero');assert.equal(M.words(100),'cem');assert.equal(M.words(101),'cento e um');assert.equal(M.words(608),'seiscentos e oito');assert.equal(M.words(999),'novecentos e noventa e nove');
assert.equal(check({kind:'number',expected:269},'269'),'ok');
assert.equal(check({kind:'number',expected:269},'269x'),'retry');
assert.equal(check({kind:'number',expected:269},'26.9'),'retry');
assert.equal(check({kind:'number',expected:269},''),'empty');
assert.equal(check({kind:'text',model:'Aumenta de 2 em 2.'},'cresce dois'),'self');
assert.equal(check({kind:'sequence',expected:[627,624,621]},'627 – 624 – 621'),'ok');
assert.equal(check({kind:'sequence',expected:[627,624,621]},'627 624 620'),'retry');
assert.equal(check({kind:'words',expected:'quinhentos e três'},'QUINHENTOS E TRES'),'ok');
assert.equal(check({kind:'words',expected:'quatorze'},'catorze'),'ok');
for(const val of ['400+90+8','200+200+90+8','498 = 400 + 90 + 8','400+90+8=498'])assert.equal(check({kind:'expression',expected:498},val),'ok');
for(const val of ['498','400+90+8=499','400+90+8+','alert(498)','498+0=499','-1+499'])assert.equal(check({kind:'expression',expected:498},val),'retry');
assert.equal(M.parseExpression('400+90+8').key,M.parseExpression('8+400+90').key);
assert.notEqual(M.parseExpression('400+90+8').key,M.parseExpression('200+200+90+8').key);
assert.equal(check({kind:'expression',expected:367,positional:true},'300+60+7'),'ok');
assert.equal(check({kind:'expression',expected:367,positional:true},'200+100+60+7'),'retry');
function canMake(cells,target){let sums=new Set([0]);for(const n of cells){for(const s of [...sums])if(s+n<=target)sums.add(s+n);}return sums.has(target);}
let generated=0;
for(let variant=0;variant<300;variant++)for(const page of M.pages){
  const s=M.make(page.id,variant,rng);assert(s.tasks.length);assert.equal(s.id,page.id);
  for(const t of s.tasks){
    if(t.type==='operation'){
      const total=t.op==='−'?t.a-t.b:t.a+t.b;assert(total>=0&&total<=999);assert(t.a>=0&&t.a<=999);assert(t.b>=0&&t.b<=999);
      if(page.id==='169')assert(t.a%10+t.b%10>=10,'Adições para praticar troca');
    }
    if(t.type==='compose'){assert.equal(t.cells.length,20);assert(canMake(t.cells,t.target),'Cada quadro tem solução');}
    if(t.type==='choice'){assert.equal(t.choices[t.correct].length,6);assert(new Set(t.choices.map(c=>c.join(','))).size===t.choices.length);}
    for(const f of t.fields){
      if(f.kind==='sequence'){assert(f.expected.every(n=>n>=0&&n<=999));assert.equal(check(f,f.expected.join(' – ')),'ok');}
      if(f.kind==='number'&&f.expected!==null){assert(f.expected>=0&&f.expected<=999);assert.equal(check(f,String(f.expected)),'ok');}
      if(f.kind==='expression'){const terms=M.decomposed(f.expected);if(terms.length<2)terms.push(0);assert.equal(check(f,terms.join('+')),'ok',`${page.id}: ${f.expected}`);}
    }
  }
  if(s.chart){assert(s.chart.start+99<=999);assert(s.chart.targets.every(n=>!s.chart.holes.includes(n-s.chart.start)));}
  if(page.id==='103'){assert(!String(s.trains[1]).startsWith('4'));assert.equal(s.composition.reduce((a,b)=>a+b),s.tasks[0].fields[0].expected);}
  generated++;
}
console.log(`OK: ${generated} folhas verificadas; contas, sequências, composição, decomposição e correção.`);
