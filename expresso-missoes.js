/* As entregas têm identidade estável para guardar o progresso no aparelho. */
const Expresso = (() => {
  const stops = [
    {id:'correio', title:'Somar e subtrair', short:'Contas', icon:'📦', color:'cobre', subject:'Adição e subtração', pages:'164–169, 173–178', jobs:[
      {id:'pacotes', kind:'exchange', title:'Uma caixa para dez', prompt:'Chegaram 28 pacotinhos de manhã e 15 à tarde. Guarde os pacotinhos soltos em caixas de dez. Quantos chegaram?', a:28, b:15, op:'+', unit:'pacotinhos', hint:'Junte as unidades das duas entregas. Cada grupo de dez pode virar uma caixa.'},
      {id:'camisetas', kind:'exchange', title:'Dois tipos de troca', prompt:'A escola arrecadou 285 camisetas de adultos e 169 de crianças para doação. Quantas camisetas foram arrecadadas?', a:285, b:169, op:'+', unit:'camisetas', hint:'Comece pelas unidades. Depois confira se as dezenas também encheram uma centena.'},
      {id:'casinha', kind:'exchange', title:'A compra do petshop', prompt:'Uma compra custou 782 reais. A ração e os brinquedos custaram 365 reais. O restante foi o preço da casinha. Quanto custou a casinha?', a:782, b:365, op:'−', unit:'reais', hint:'Há só 2 unidades para tirar 5. Abra uma dezena e observe o que muda nas duas colunas.'},
      {id:'tampinhas', kind:'exchange', title:'Quantas a mais?', prompt:'Uma coleção tem 635 tampinhas grandes e 419 pequenas. Quantas grandes há a mais que pequenas?', a:635, b:419, op:'−', unit:'tampinhas', hint:'Se você fizer pares com uma grande e uma pequena, quantas grandes ficarão sem par?'}
    ]},
    {id:'sinais', title:'Sequências e ordem', short:'Sequências', icon:'🔢', color:'verde', subject:'Padrões e comparação', pages:'160–162, 174, 176', jobs:[
      {id:'descer', kind:'track', title:'Números que diminuem', prompt:'Os primeiros números são 627, 624 e 621. Escolha os três seguintes, na ordem.', line:[627,624,621], picks:[615,609,618,612], solution:[618,615,612], hint:'Compare dois vizinhos. De 627 para 624, você voltou três casas.', why:'O número diminui de 3 em 3.'},
      {id:'subir', kind:'track', title:'Números que aumentam', prompt:'A sequência aumenta de cinco em cinco. Complete os próximos três números.', line:[635,640,645], picks:[665,660,650,655], solution:[650,655,660], hint:'Some 5 ao último número que já está na sequência.', why:'Cada número tem cinco a mais que o anterior.'},
      {id:'bandeira', kind:'track', title:'O segredo das bandeiras', prompt:'As bandeiras se repetem em blocos. Escolha as próximas três, na ordem.', line:['☀️','🍃','🍃','☀️','🍃'], picks:['🍃','☀️','🌙'], solution:['🍃','☀️','🍃'], repeat:true, hint:'Leia o bloco em voz alta: sol, folha, folha. Em que ponto do bloco a sequência parou?', why:'O bloco que se repete é sol, folha, folha.'},
      {id:'fila', kind:'track', title:'Fichas em ordem', prompt:'Ponha todas as fichas em ordem, do menor número para o maior.', line:[], picks:[990,909,999,919], solution:[909,919,990,999], hint:'Todos começam com nove centenas. Compare as dezenas e, se empatarem, as unidades.', why:'909 vem antes de 919. Entre 990 e 999, as unidades decidem.'},
      {id:'regra', kind:'quiz', title:'Qual é o segredo?', prompt:'O painel mostra 703, 713, 723, 733. Como você explicaria a regra para quem vem depois?', choices:['Aumenta de 1 em 1.','Aumenta de 10 em 10.','Diminui de 10 em 10.'], key:1, hint:'Observe qual algarismo muda a cada salto.', why:'Somamos uma dezena a cada passo. Depois de 733 vem 743.'}
    ]},
    {id:'colecoes', title:'Números e coleções', short:'Coleções', icon:'🪙', color:'azul', subject:'Números até 999', pages:'160, 163, 165, 173–180', jobs:[
      {id:'escrever', kind:'word', title:'O número por extenso', prompt:'Chegaram 347 tampinhas vermelhas. Escreva 347 por extenso na etiqueta.', n:347, hint:'Leia em partes: 300, depois 40, depois 7.', why:'347 tem três centenas, quatro dezenas e sete unidades.'},
      {id:'posicao', kind:'quiz', title:'O valor do sete', prompt:'Na etiqueta “setecentos e oitenta e dois”, quantas unidades vale o algarismo 7?', choices:['7 unidades','70 unidades','700 unidades'], key:2, hint:'Monte o número 782 e procure a casa do 7.', why:'O 7 ocupa a casa das centenas. Sete centenas valem 700 unidades.'},
      {id:'etiqueta', kind:'sum', title:'Uma etiqueta, dois jeitos', prompt:'Separe 493 em parcelas de duas maneiras diferentes. Toque nas fichas e guarde cada soma.', target:493, pieces:[400,200,200,90,50,40,3,10,1], hint:'Tente centenas, dezenas e unidades. Depois troque uma parcela por duas menores de mesmo valor.'},
      {id:'cores', kind:'table', title:'Leia a lista da feira', prompt:'Vamos juntar todas as tampinhas azuis e verdes. Quantas tampinhas teremos?', rows:[['Amarelas',185],['Vermelhas',347],['Azuis',416],['Verdes',229]], wanted:[2,3], op:'+', unit:'tampinhas', hint:'Marque as duas cores que vamos juntar. Junte as quantidades dessas linhas.'},
      {id:'metal', kind:'table', title:'O que falta para empatar?', prompt:'Quantas tampinhas de metal a menos há em relação às de plástico?', rows:[['Metal',328],['Plástico',493]], wanted:[0,1], op:'−', unit:'tampinhas', hint:'Marque as duas linhas. Descubra quanto falta para 328 chegar a 493.'}
    ]},
    {id:'botoes', title:'Oficina dos Botões', short:'Botões', icon:'🧵', color:'rosa', subject:'Grupos e multiplicação', pages:'181–187', jobs:[
      {id:'tres', kind:'load', title:'O pedido da costureira', prompt:'Prepare 3 grupos com 4 botões em cada um. Depois registre quantos botões há ao todo.', groups:3, each:4, item:'botões', token:'🔵', hint:'Cada grupo completo coloca um 4 na sua soma. Conte quantos grupos você preparou.'},
      {id:'cinco', kind:'load', title:'Cinco grupos de botões', prompt:'Monte 5 grupos de 3 botões. Quantos botões foram encomendados?', groups:5, each:3, item:'botões', token:'🟡', hint:'Diga um número por grupo completo: 3, 6… Pare quando contar os cinco grupos.'},
      {id:'bombons', kind:'batch', title:'Encomenda da bomboniere', prompt:'Uma caixa tem 25 bombons. Já temos uma caixa e o cliente pediu mais três iguais. Quantos bombons ele receberá?', groups:4, each:25, initial:1, thing:'caixa', plural:'caixas', token:'🍫', item:'bombons', hint:'Conte também a primeira caixa. Duas caixas de 25 formam 50.'},
    ]},
    {id:'cozinha', title:'Receitas e partes', short:'Cozinha', icon:'🧁', color:'mel', subject:'Dobro, triplo e partes', pages:'186–189, 196–201', jobs:[
      {id:'dobro', kind:'batch', title:'Bolinhos em dobro', prompt:'Uma receita rende 7 bolinhos. Prepare o dobro e descubra quantos bolinhos sairão do forno.', groups:2, each:7, initial:1, thing:'receita', plural:'receitas', token:'🧁', item:'bolinhos', hint:'O dobro são duas receitas do mesmo tamanho.'},
      {id:'triplo', kind:'batch', title:'Suco em triplo', prompt:'Uma jarra leva 140 mL de suco. Prepare o triplo e descubra quantos mililitros serão usados.', groups:3, each:140, initial:1, thing:'jarra', plural:'jarras', token:'🧃', item:'mL', hint:'Triplo significa três vezes a mesma quantidade. Junte as duas primeiras jarras e depois a terceira.'},
      {id:'metade', kind:'fraction', title:'Metade do chocolate', prompt:'A barra tem 18 quadradinhos iguais. Marque a metade para repartir.', total:18, parts:2, cols:6, hint:'Imagine dois grupos de mesmo tamanho. Marque os quadradinhos de um deles.'},
      {id:'terco', kind:'fraction', title:'Uma terça parte de chocolate', prompt:'Marque um terço desta barra de 21 quadradinhos. As três partes precisam ter o mesmo tamanho.', total:21, parts:3, cols:7, hint:'A barra tem três fileiras iguais. Quantos quadradinhos há em uma fileira?'},
      {id:'bilhete', kind:'quiz', title:'A sessão de cinema', prompt:'O ingresso inteiro custa 34 reais. Como mostrar que 17 reais é mesmo a metade?', choices:['17 + 2 = 19','34 + 17 = 51','17 + 17 = 34'], key:2, hint:'Duas meias-entradas juntas precisam ter o mesmo preço de uma inteira.', why:'Duas partes iguais de 17 reais formam os 34 reais da entrada inteira.'}
    ]},
    {id:'parque', title:'Repartir e descobrir', short:'Divisão', icon:'🧺', color:'lilas', subject:'Divisão e desafios', pages:'192–195, 200–202', jobs:[
      {id:'laranjas', kind:'share', title:'Uma laranja para cada um', prompt:'Reparta 15 laranjas igualmente entre 3 crianças. Quantas laranjas cada uma receberá?', groups:3, each:5, item:'laranjas', token:'🍊', hint:'Você pode repartir uma por vez ou dar uma para cada criança em uma rodada.'},
      {id:'flores', kind:'bundles', title:'Buquês para as mesas', prompt:'Há 36 flores no cesto. Faça buquês de 4 flores. Quantos buquês você consegue montar?', total:36, each:4, hint:'A cada buquê pronto, saem quatro flores do cesto.'},
      {id:'malas', kind:'share', title:'Bagagem bem dividida', prompt:'Distribua 18 malas igualmente entre 9 bagageiros. Quantas malas cabem em cada bagageiro?', groups:9, each:2, item:'malas', token:'🧳', container:'Bagageiro', hint:'Distribua uma mala por bagageiro. Repita enquanto houver malas.'},
      {id:'avioes', kind:'seats', title:'Embarque no avião', prompt:'O avião tem 6 fileiras de 4 poltronas. Embarque os 22 passageiros. Quantas poltronas vão viajar vazias?', rows:6, per:4, people:22, object:'poltronas', hint:'Conte todos os lugares. Depois veja quantos ficaram livres quando o último passageiro sentou.'},
      {id:'pioes', kind:'seats', title:'Um pião para cada criança', prompt:'Há 13 crianças e 4 caixas com 3 piões em cada uma. Entregue um pião por criança e descubra se faltam ou sobram piões.', rows:4, per:3, people:13, object:'piões', hint:'Depois de entregar todos os piões, alguma criança ainda espera?'}
    ]}
  ];
  // Referências conferidas nas fotos da apostila; critérios complementares são identificados.
  const references = {
  "pacotes": {
    "label": "p. 164 · exercícios 1 e 2",
    "note": "Adição com quadro de trocas. O cenário e os números foram adaptados para a atividade digital."
  },
  "camisetas": {
    "label": "p. 168 · exercício 4",
    "note": "Adaptação da arrecadação de camisetas para adultos e crianças."
  },
  "casinha": {
    "label": "p. 177 · exercício 2",
    "note": "Adaptação do problema do petshop: descobrir o preço da casinha a partir do total da compra."
  },
  "tampinhas": {
    "label": "p. 175 · exercício 6",
    "note": "Comparar tampinhas grandes e pequenas para descobrir quantas há a mais."
  },
  "descer": {
    "label": "p. 161 · exercício 1c",
    "note": "Adaptação da sequência em ordem decrescente, completando os números que faltam."
  },
  "subir": {
    "label": "p. 176 · exercício 8a",
    "note": "Adaptação da sequência crescente que começa em 635, 640 e 645."
  },
  "bandeira": {
    "label": "Critério da prova · sequências de figuras",
    "note": "Atividade complementar de padrões repetitivos, prevista nos critérios da escola. Sem exercício equivalente identificado nas fotos da apostila enviadas."
  },
  "fila": {
    "label": "p. 160 · apoio para ordenação",
    "note": "Atividade complementar baseada no critério da prova de ordenar números até 999. A página 160 oferece o quadro numérico como apoio; as quatro fichas foram criadas para o site."
  },
  "regra": {
    "label": "p. 160 · exercício 2",
    "note": "Identificar a regularidade da sequência destacada no quadro numérico. Aqui a regra é escolhida entre alternativas."
  },
  "escrever": {
    "label": "p. 174 · exercício 4a",
    "note": "Escrever o número por extenso."
  },
  "posicao": {
    "label": "p. 178 · exercício 5b",
    "note": "Indicar quantas unidades vale o algarismo destacado no número 782."
  },
  "etiqueta": {
    "label": "p. 167 · exercício 3",
    "note": "Decompor o resultado de duas maneiras diferentes. Aqui a criança escolhe fichas para formar as parcelas."
  },
  "cores": {
    "label": "p. 173 · exercícios 1 e 2",
    "note": "Ler a tabela e juntar as quantidades de tampinhas azuis e verdes."
  },
  "metal": {
    "label": "p. 176 · exercício 7",
    "note": "Comparar tampinhas de metal e de plástico. A tabela original com as quantidades está na página 175, exercício 5."
  },
  "cinco": {
    "label": "p. 182 · exercício 1c",
    "note": "Montar cinco grupos de três botões e registrar a quantidade total. Os grupos são montados com botões na tela."
  },
  "bombons": {
    "label": "p. 187 · exercício 2",
    "note": "Uma caixa de bombons e mais três caixas iguais: contar todas as quatro caixas."
  },
  "dobro": {
    "label": "p. 189 · exercício 4",
    "note": "Calcular o dobro de uma receita de sete cupcakes, representados aqui como bolinhos."
  },
  "triplo": {
    "label": "p. 188 · exercício 2 · adaptação para triplo",
    "note": "O exercício do livro pede duas receitas de 140 mL. Aqui são três receitas, para treinar o triplo previsto nos critérios da prova."
  },
  "metade": {
    "label": "p. 197 · exercício 1",
    "note": "Marcar a metade de 18 bombons. No site, os bombons foram substituídos por quadradinhos de chocolate."
  },
  "terco": {
    "label": "p. 199 · exercício 1",
    "note": "Marcar a terça parte da barra de chocolate."
  },
  "bilhete": {
    "label": "pp. 197–198 · exercício 2a",
    "note": "Comparar entrada inteira e meia-entrada. A tabela está na página 197; a pergunta de justificativa continua na página 198. Aqui a justificativa é escolhida entre contas."
  },
  "laranjas": {
    "label": "p. 192 · exercício 1a",
    "note": "Repartir as laranjas igualmente entre três crianças."
  },
  "flores": {
    "label": "p. 193 · exercício 1b",
    "note": "Formar buquês de quatro flores e descobrir quantos buquês ficam prontos."
  },
  "malas": {
    "label": "p. 194 · exercício 2",
    "note": "Distribuir malas igualmente entre bagageiros."
  },
  "avioes": {
    "label": "p. 194 · exercício 1",
    "note": "Calcular os lugares de seis fileiras de quatro poltronas e descobrir quantos ficam vazios."
  },
  "pioes": {
    "label": "p. 202 · exercício 3, itens a e b",
    "note": "Comparar o total de piões das caixas com a quantidade de crianças e descobrir se faltam ou sobram piões."
  },
  "tres": {
    "label": "p. 181 · exercício 1b",
    "note": "Montar três grupos de quatro botões e registrar a quantidade total. Os grupos são montados com botões na tela."
  }
};
  for (const stop of stops) for (const job of stop.jobs) job.reference=references[job.id];
  return {stops};
})();
if (typeof module !== 'undefined') module.exports = Expresso;
