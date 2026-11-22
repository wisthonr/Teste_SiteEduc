/* Exemplos didáticos independentes das respostas das atividades. */
const LessonData = (() => {
  const step = (title, narration, scene, equation, pause = false) => ({title,narration,scene,equation,pause});
  function create(topic, context = {}) {
    if(topic==='soma') {
      const [a,b] = context.a===46 && context.b===27 ? [37,25] : [46,27];
      const at=Math.floor(a/10), au=a%10, bt=Math.floor(b/10), bu=b%10, units=au+bu;
      return {title:'Somar e trocar dez unidades',example:`${a} + ${b}`,steps:[
        step('Leia a história',`Uma caixa tem ${a} lápis. Outra tem ${b}. Vamos descobrir quantos lápis há ao todo.`,{type:'packages',values:[a,b]},`${a} + ${b} = ?`),
        step('Organize dezenas e unidades',`${a} tem ${at} dezenas e ${au} unidades. Cada barrinha vale dez. Cada quadradinho vale um.`,{type:'blocks',tens:at,units:au},`${a} = ${at*10} + ${au}`),
        step('Junte as duas quantidades',`Juntamos ${bt} dezenas e ${bu} unidades da outra caixa. Comece contando apenas os quadradinhos.`,{type:'blocks',tens:at+bt,units,highlight:'units'},`${au} + ${bu} = ?`,true),
        step('Separe um grupo de dez',`${au} mais ${bu} dá ${units}. Dez dessas unidades formam uma nova dezena. As outras ${units-10} ficam soltas.`,{type:'blocks',tens:at+bt,units,bundle:true},`${units} unidades = 1 dezena + ${units-10} unidades`),
        step('Faça a troca',`As dez unidades viraram uma barrinha. A quantidade de lápis continua a mesma. Ficaram ${at+bt+1} dezenas e ${units-10} unidades.`,{type:'blocks',tens:at+bt+1,units:units-10,highlight:'tens'},`${at+bt+1} dezenas e ${units-10} unidades`),
        step('Registre na conta',`Escrevemos ${units-10} nas unidades. A dezena nova vai para a coluna das dezenas. Somamos ${at}, ${bt} e mais um.`,{type:'column',a,b,op:'+',carry:1,result:a+b},`${a} + ${b} = ${a+b}`),
        step('Agora é a sua vez',`Neste exemplo, juntamos e trocamos dez unidades. Volte à sua atividade, comece pelas unidades e registre o seu resultado.`,{type:'packages',values:[a+b]},'Unidades primeiro. Depois, dezenas.')
      ]};
    }
    if(topic==='subtracao') {
      const [a,b]=context.a===52 && context.b===28 ? [63,37] : [52,28];
      const at=Math.floor(a/10),au=a%10,bt=Math.floor(b/10),bu=b%10;
      return {title:'Subtrair abrindo uma dezena',example:`${a} − ${b}`,steps:[
        step('Descubra o que ficou',`Havia ${a} lápis. Foram entregues ${b}. Vamos descobrir quantos ficaram.`,{type:'packages',values:[a],out:b},`${a} − ${b} = ?`),
        step('Olhe as unidades',`Temos ${au} unidades soltas, mas precisamos tirar ${bu}. O que podemos fazer com uma das dezenas?`,{type:'blocks',tens:at,units:au,highlight:'units'},`Precisamos tirar ${bu} unidades.`,true),
        step('Abra uma dezena',`Abrimos uma barrinha em dez quadradinhos. Agora são ${at-1} dezenas e ${10+au} unidades. O total ainda é ${a}.`,{type:'blocks',tens:at-1,units:10+au,highlight:'units'},`${a} = ${(at-1)*10} + ${10+au}`),
        step('Retire as unidades',`De ${10+au} unidades, retiramos ${bu}. Conte os quadradinhos que continuam.`,{type:'blocks',tens:at-1,units:10+au,removeUnits:bu},`${10+au} − ${bu} = ?`,true),
        step('Retire as dezenas',`Sobraram ${10+au-bu} unidades. Agora retiramos ${bt} das ${at-1} dezenas.`,{type:'blocks',tens:at-1,units:10+au-bu,removeTens:bt},`${at-1} − ${bt} = ${at-1-bt}`),
        step('Registre o que sobrou',`Ficaram ${at-1-bt} dezenas e ${10+au-bu} unidades. Observe a dezena que foi aberta na conta.`,{type:'column',a,b,op:'−',borrow:true,result:a-b},`${a} − ${b} = ${a-b}`),
        step('Confira pelo caminho de volta',`Se juntarmos os ${a-b} lápis que ficaram com os ${b} entregues, voltamos aos ${a} do começo. Use essa ideia para conferir sua conta.`,{type:'packages',values:[a-b,b]},`${a-b} + ${b} = ${a}`)
      ]};
    }
    if(topic==='multiplicacao') {
      const [groups,each]=context.groups===3 && context.each===7 ? [4,6] : [3,7];
      return {title:'Multiplicar com grupos iguais',example:`${groups} grupos de ${each}`,steps:[
        step('Entenda o pedido',`São ${groups} caixas. Cada caixa recebe ${each} bolinhas. A pergunta é quantas bolinhas haverá ao todo.`,{type:'groups',groups,each:0},`${groups} × ${each} = ?`),
        step('Monte a primeira caixa',`Esta caixa tem ${each} bolinhas. As outras precisam ter exatamente a mesma quantidade.`,{type:'groups',groups,each,filled:1},`${each}`),
        step('Complete os grupos',`Agora todas as ${groups} caixas têm ${each} bolinhas. Conte por grupos, somando sempre ${each}.`,{type:'groups',groups,each},Array(groups).fill(each).join(' + ')+' = ?',true),
        step('Some uma caixa por vez',`Duas caixas têm ${2*each}. ${groups===3?`Mais ${each} dá ${groups*each}.`:`Mais ${each} dá ${3*each}. Mais ${each} dá ${4*each}.`}`,{type:'groups',groups,each,labels:true},Array(groups).fill(each).join(' + ')+` = ${groups*each}`),
        step('Escreva a multiplicação',`${groups} vezes ${each} significa ${groups} grupos com ${each} em cada grupo. O total é ${groups*each}.`,{type:'groups',groups,each,labels:true},`${groups} × ${each} = ${groups*each}`),
        step('Volte ao seu pedido',`Na sua atividade, procure quantos grupos são e quantos objetos vão em cada um. Faça a soma ou a multiplicação antes de conferir.`,{type:'groups',groups,each,labels:true},'Quantidade de grupos × objetos em cada grupo')
      ]};
    }
    if(topic==='divisao') {
      const [groups,each]=context.groups===4&&context.each===5?[3,6]:[4,5],total=groups*each;
      return {title:'Dividir em partes iguais',example:`${total} bolinhas para ${groups} caixas`,steps:[
        step('Leia a pergunta',`Temos ${total} bolinhas para repartir igualmente entre ${groups} caixas. Queremos saber quantas ficam em cada caixa.`,{type:'groups',groups,each:0,remaining:total},`${total} ÷ ${groups} = ?`),
        step('Dê uma para cada caixa','Distribua uma bolinha para cada caixa. Assim, todas começam com a mesma quantidade.',{type:'groups',groups,each:1,remaining:total-groups},'Uma em cada caixa.'),
        step('Continue a distribuição','Mais uma para cada caixa. Agora cada caixa tem duas. Continuamos enquanto houver bolinhas.',{type:'groups',groups,each:2,remaining:total-groups*2},'Mantenha os grupos iguais.'),
        step('Mais uma rodada','Damos mais uma bolinha para cada caixa. Repetimos esse movimento até esvaziar a cesta.',{type:'groups',groups,each:3,remaining:total-groups*3},'Uma de cada vez, sem deixar ninguém de fora.'),
        step('Observe os grupos','Distribuímos todas as bolinhas. Quantas ficaram em cada caixa? Conte uma caixa e confira as outras.',{type:'groups',groups,each},'Quantas em cada caixa?',true),
        step('Registre a divisão',`Cada caixa ficou com ${each} bolinhas. ${total} dividido por ${groups} é igual a ${each}.`,{type:'groups',groups,each,labels:true},`${total} ÷ ${groups} = ${each}`),
        step('Confira multiplicando',`${groups} caixas com ${each} bolinhas formam ${total}. Para achar a metade, faça dois grupos iguais. Para a terça parte, faça três.`,{type:'groups',groups,each,labels:true},`${groups} × ${each} = ${total}`)
      ]};
    }
    if(topic==='dobro') {
      const base=context.each===11?12:11;
      return {title:'Dobro, triplo e metade',example:`Uma porção de ${base}`,steps:[
        step('Comece com uma porção',`Uma porção tem ${base} bolinhas. Vamos repetir essa mesma porção.`,{type:'groups',groups:1,each:base},`Uma porção = ${base}`),
        step('Prepare o dobro',`O dobro tem duas porções iguais. Some ${base} com ${base}. Quanto dá?`,{type:'groups',groups:2,each:base},`${base} + ${base} = ?`,true),
        step('Confira o dobro',`Duas porções de ${base} formam ${base*2}. O dobro é duas vezes a quantidade.`,{type:'groups',groups:2,each:base,labels:true},`2 × ${base} = ${base*2}`),
        step('Prepare o triplo',`Para o triplo, usamos três porções iguais. Some mais uma porção de ${base}.`,{type:'groups',groups:3,each:base},`${base} + ${base} + ${base} = ?`,true),
        step('Confira o triplo',`Três porções de ${base} formam ${base*3}.`,{type:'groups',groups:3,each:base,labels:true},`3 × ${base} = ${base*3}`),
        step('Pense na metade',`Se repartirmos ${base*2} em duas porções iguais, cada uma terá ${base}. Metade e dobro ajudam a conferir um ao outro.`,{type:'groups',groups:2,each:base,labels:true},`${base*2} ÷ 2 = ${base}`)
      ]};
    }
    return {title:'Descobrir a regra da sequência',example:'18, 22, 26…',steps:[
      step('Olhe os vizinhos','Observe os números de vagões vizinhos. O que mudou de dezoito para vinte e dois?',{type:'sequence',values:[18,22,26]},'18, 22, 26, …',true),
      step('Descubra o salto','De dezoito até vinte e dois, avançamos quatro casas.',{type:'sequence',values:[18,22,26],jump:4},'22 − 18 = 4'),
      step('Teste mais um par','De vinte e dois até vinte e seis também avançamos quatro. A regra se repete.',{type:'sequence',values:[18,22,26],jump:4},'26 − 22 = 4'),
      step('Continue a regra','Some quatro ao último número. Qual deve ser o próximo vagão?',{type:'sequence',values:[18,22,26,'?'],jump:4},'26 + 4 = ?',true),
      step('Confira o próximo','O próximo vagão é trinta. Em uma sequência que diminui, fazemos o salto voltando.',{type:'sequence',values:[18,22,26,30],jump:4},'26 + 4 = 30')
    ]};
  }
  const references = {
  "soma": {
    "label": "pp. 164 e 169",
    "note": "Quadro de trocas e registro da adição. Exemplo didático com números próprios."
  },
  "subtracao": {
    "label": "pp. 175 e 177",
    "note": "Subtração com trocas e descoberta de uma parte do total. Exemplo didático com números próprios."
  },
  "multiplicacao": {
    "label": "pp. 181–183",
    "note": "Grupos de mesma quantidade e adição de parcelas iguais. Exemplo didático com números próprios."
  },
  "divisao": {
    "label": "pp. 192 e 194",
    "note": "Distribuição em partes iguais. Exemplo didático com números próprios."
  },
  "dobro": {
    "label": "pp. 188–189 e 197",
    "note": "Dobro e metade; o triplo também faz parte dos critérios da prova. Exemplo didático com números próprios."
  },
  "sequencia": {
    "label": "pp. 161–162",
    "note": "Completar sequências e explicar sua regularidade. Exemplo didático com números próprios."
  }
};
  return {create:(topic,context)=>({...create(topic,context),reference:references[topic]||references.sequencia})};
})();
if(typeof module!=='undefined')module.exports=LessonData;
