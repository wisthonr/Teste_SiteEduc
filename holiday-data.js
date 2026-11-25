'use strict';
const Holiday = (() => {
  const items = ['cap','sandals','T-shirt','suncream','shorts','sunglasses','skirt','swimsuit'];
  const actions = ['sunbathing','eating ice cream','making sandcastles','swimming'];
  const feelings = ['hot','hungry','scared','thirsty'];
  const worn = [
    ['swimsuit','sunglasses','shorts','cap'],
    ['skirt','shorts','T-shirt','sandals'],
    ['sunglasses','cap','sandals','swimsuit'],
    ['T-shirt','swimsuit','cap','skirt']
  ];
  const sections = [
    ['closet','Na mala da praia','Ouça, encontre e escreva.','cap','Pp. 66–67','P. 66, ex. 2, e p. 67, ex. 2–3. A cena de férias vira fichas de escuta e escrita dos oito itens.'],
    ['shore','Um dia na praia','Ouça e organize as cenas.','making sandcastles','P. 69 · ex. 3','A ordem é ditada por uma gravação própria. A criança numera as cenas pelo toque.'],
    ['wear','O que está vestindo?','Complete a frase com uma peça.','sunglasses','P. 69 · ex. 4','A figura acompanha a frase pronta. A criança escreve apenas o nome da peça.'],
    ['listen','Como se sente?','Ouça a conversa e escolha a cena.','she-hot','P. 72 · ex. 1 e 3','O aquecimento oral adapta a prática da canção com quatro palavras faladas. Na escuta, a pergunta e a resposta indicam qual das duas cenas marcar.'],
    ['ask','Uma palavra que falta','Escreva e responda em inglês.','he-hungry','P. 74 · ex. 3','A figura indica o adjetivo da lacuna. O sinal ✓ ou ✕ orienta a resposta curta com he ou she.'],
    ['bags','Barraca das malas','Jogo · Separe os pedidos de dois banhistas.','sandals','Pp. 66–67','Jogo adaptado do vocabulário e da proposta de brincar da p. 67, ex. 4. Cada pedido combina duas das oito palavras.']
  ];
  const slug = word => word.toLowerCase().replaceAll(' ','-');
  function rotate(a,n){return a.slice(n%a.length).concat(a.slice(0,n%a.length))}
  function answer(p,yes){return yes ? 'Yes, '+p+' is.' : 'No, '+p+' isn’t.'}
  function wearing(p,word){return (p==='he'?'He':'She')+'’s wearing '+(['cap','swimsuit','skirt','T-shirt'].includes(word)?'a ':'')+'____.'}
  function sequence(round){return [[2,0,3,1],[1,3,0,2],[3,2,1,0],[0,1,2,3]][round].map(i=>actions[i])}
  function tasks(section,r){
    if(section==='closet')return rotate(items,r).map((word,i)=>{
      const pool=rotate(items,items.indexOf(word));
      return {kind:i%2?'write':'pick',word,options:rotate([word,pool[2],pool[5]],(i+r)%3)};
    });
    if(section==='shore')return [{kind:'order',order:sequence(r)}];
    if(section==='wear')return worn[r].map((word,i)=>({kind:'wear',word,p:(i+r)%2?'he':'she'}));
    if(section==='bags')return [{kind:'bags',orders:[[0,1,3,5],[2,5,6,0],[7,3,4,1],[6,4,2,7]][r].map(i=>items[i]),pool:rotate(items,(r+3)%8)}];
    return rotate(feelings,r).map((word,i)=>{
      const p=(i+Math.floor(r/2))%2?'he':'she', yes=(i+r)%4<2;
      const other=feelings[(feelings.indexOf(word)+1+(r%2))%4];
      return {kind:section==='listen'?'dialog':'question',word:section==='listen'&&!yes?other:word,p,yes,options:rotate([word,other],(i+r)%2),target:word};
    });
  }
  return {items,actions,feelings,sections,slug,tasks,answer,wearing};
})();
if(typeof module!=='undefined')module.exports=Holiday;
