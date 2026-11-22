/* Variações das mesmas 27 atividades. A viagem original permanece na rodada zero. */
const ExpressoRounds = (() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  function create(round) {
    const stops = clone(Expresso.stops);
    if (!round) return stops;
    const r = (round - 1) % 8 + 1;
    const jobs = Object.fromEntries(stops.flatMap(s => s.jobs).map(j => [j.id, j]));
    function update(id, values) { Object.assign(jobs[id], values); }
    function quiz(id, prompt, choices, key, why) {
      update(id, {prompt, choices, key, why, hint:'Leia o pedido de novo. Use a folha para testar cada opção.'});
    }
    const additions = [[28 + 10*r, 16 + r], [285 + 10*r, 168 + r]];
    for (const [i,id] of ['pacotes','camisetas'].entries()) {
      const [a,b] = additions[i], unit = jobs[id].unit;
      update(id,{a,b,prompt:`Chegaram ${a} ${unit} de manhã e ${b} à tarde. Quantos chegaram ao todo?`,hint:'Junte as unidades. Troque cada grupo de dez e depois confira as dezenas.'});
    }
    update('casinha',{a:782+r*10,b:366+r,prompt:`A compra custou ${782+r*10} reais. A ração e os brinquedos custaram ${366+r} reais. Quanto custou a casinha?`,hint:'Comece pelas unidades. Se precisar, abra uma dezena para fazer a retirada.'});
    update('tampinhas',{a:635+r*20,b:418+r,prompt:`Há ${635+r*20} tampinhas grandes e ${418+r} pequenas. Quantas grandes há a mais?`});
    for (const [id,start,step] of [['descer',620+r*9,-(r+1)],['subir',530+r*12,r+2]]) {
      const line=[start,start+step,start+2*step], solution=[start+3*step,start+4*step,start+5*step];
      update(id,{line,solution,picks:[solution[1],start+6*step,solution[0],solution[2]],prompt:`Observe ${line.join(', ')}. Engate os próximos três números.`,hint:`Compare dois vizinhos. O salto é de ${Math.abs(step)}.`,why:`A sequência ${step>0?'aumenta':'diminui'} de ${Math.abs(step)} em ${Math.abs(step)}.`});
    }
    const patterns=[['🍎','🍐','🍐'],['⭐','🌙','⭐'],['🔵','🔴','🔵','🔴'],['🌸','🍀','🌸'],['🐸','🐰','🐰'],['🟡','🟣','🟡'],['🍓','🍋','🍋'],['🦋','🌼','🦋']];
    const pattern=patterns[r-1], repeated=Array.from({length:8},(_,i)=>pattern[i%pattern.length]);
    update('bandeira',{line:repeated.slice(0,5),solution:repeated.slice(5),picks:[...new Set(pattern)],hint:`O bloco que se repete é ${pattern.join(' ')}.`,why:`Repetimos ${pattern.join(' ')} na mesma ordem.`});
    const ordered=[300+60*r,311+60*r,320+60*r,329+60*r];
    update('fila',{picks:[ordered[2],ordered[0],ordered[3],ordered[1]],solution:ordered,hint:'Compare as centenas, depois as dezenas e por último as unidades.',why:`A ordem é ${ordered.join(', ')}.`});
    const step=r+2, start=400+r*13;
    quiz('regra',`Qual é a regra de ${[0,1,2,3].map(i=>start+i*step).join(', ')}?`,[`Aumenta de ${step} em ${step}.`,`Diminui de ${step} em ${step}.`,`Aumenta de ${step+1} em ${step+1}.`],0,`Somamos ${step} a cada número.`);
    const n=347+r*11;
    update('escrever',{n,prompt:`Escreva ${n} por extenso na folha.`,hint:'Leia as centenas, as dezenas e as unidades.',why:`${n} se escreve ${MathBook.words(n)}.`});
    const digit=r+1;
    quiz('posicao',`No número ${digit}82, quanto vale o algarismo ${digit}?`,[`${digit} unidades`,`${digit*10} unidades`,`${digit*100} unidades`],2,`Na casa das centenas, ${digit} vale ${digit*100} unidades.`);
    const hundreds=200+r*50, tens=30, units=7;
    update('etiqueta',{target:hundreds+tens+units,prompt:`Monte ${hundreds+tens+units} de duas maneiras diferentes. Guarde cada soma.`,pieces:[hundreds,hundreds-100,100,tens,20,10,units,2,5]});
    const rows=[['Amarelas',185+r*3],['Vermelhas',347+r*4],['Azuis',416+r*5],['Verdes',229+r*6]];
    update('cores',{rows});
    update('metal',{rows:[['Metal',328+r*4],['Plástico',493+r*9]],hint:'Compare as duas quantidades. Descubra quanto falta para a menor chegar à maior.'});
    for (const [id,groups,each] of [['tres',3,4+r],['cinco',5,3+r],['laranjas',3,5+r],['malas',4,2+r]]) {
      const j=jobs[id], total=groups*each;
      update(id,{groups,each,prompt:j.kind==='load'?`Prepare ${groups} grupos com ${each} ${j.item} em cada um. Quantas peças vão ao todo?`:`Reparta ${total} ${j.item} igualmente entre ${groups} grupos. Quantas ficam em cada grupo?`,hint:j.kind==='load'?`Coloque ${each} peças em cada grupo. Depois some os grupos.`:'Distribua uma peça para cada grupo até acabar. Os grupos devem ficar iguais.'});
    }
    for (const [id,each] of [['bombons',25+r*5],['dobro',7+r],['triplo',140+r*10]]) {
      const j=jobs[id];
      update(id,{each,prompt:`Cada ${j.thing} tem ${each} ${j.item}. Prepare ${j.groups} ${j.plural}. Quantos ${j.item} haverá ao todo?`,hint:`Monte ${j.groups} porções iguais e some as quantidades.`});
    }
    for (const [id,parts,size] of [['metade',2,4+r],['terco',3,3+r]]) {
      update(id,{total:parts*size,cols:Math.min(size,6),prompt:`A barra tem ${parts*size} quadradinhos. Marque ${parts===2?'a metade':'a terça parte'}.`,hint:`Separe mentalmente em ${parts} grupos iguais e marque um grupo.`});
    }
    const half=17+r;
    quiz('bilhete',`A entrada inteira custa ${half*2} reais. Qual conta mostra que ${half} é a metade?`,[`${half} + 2 = ${half+2}`,`${half} + ${half} = ${half*2}`,`${half*2} + ${half} = ${half*3}`],1,`Duas partes de ${half} formam ${half*2} reais.`);
    update('flores',{total:4*(9+r),prompt:`Há ${4*(9+r)} flores. Monte buquês de 4 flores. Quantos buquês ficam prontos?`});
    update('avioes',{rows:6,per:4,people:22-r,prompt:`O avião tem 6 fileiras de 4 poltronas. Embarque ${22-r} passageiros. Quantas poltronas ficam vazias?`});
    update('pioes',{people:13+r,prompt:`Há ${13+r} crianças e 4 caixas com 3 piões cada. Entregue um pião por criança. Quantos faltam?`});
    return stops;
  }
  return {create};
})();
if (typeof module !== 'undefined') module.exports = ExpressoRounds;
