'use strict';
// Vocabulário conferido nas páginas 54, 55 e 60. Grafia britânica do livro.
const ENG_WORDS = [
  {id:'card', word:'birthday card', pt:'cartão de aniversário', page:54},
  {id:'water', word:'water', pt:'água', page:54},
  {id:'crisps', word:'crisps', pt:'batatas chips', page:54},
  {id:'pizza', word:'pizza', pt:'pizza', page:55},
  {id:'popcorn', word:'popcorn', pt:'pipoca', page:55},
  {id:'yoghurt', word:'yoghurt', pt:'iogurte', page:54},
  {id:'sausages', word:'sausages', pt:'salsichas', page:54},
  {id:'cherries', word:'cherries', pt:'cerejas', page:55},
  {id:'potatoes', word:'potatoes', pt:'batatas', page:60},
  {id:'onions', word:'onions', pt:'cebolas', page:60},
  {id:'mushrooms', word:'mushrooms', pt:'cogumelos', page:60},
  {id:'pot', word:'pot', pt:'panela', page:60}
];
const ENG_SCENES = [
  {id:'water', sentence:'She likes water.', pt:'Ela gosta de água.', alt:'Menina sorrindo e segurando água', blank:'She ___ water.', answer:'likes'},
  {id:'yoghurt', sentence:"He doesn't like yoghurt.", pt:'Ele não gosta de iogurte.', alt:'Menino recusando iogurte', blank:'He ___ yoghurt.', answer:"doesn't like"},
  {id:'pizza', sentence:"She doesn't like pizza.", pt:'Ela não gosta de pizza.', alt:'Menina recusando pizza', blank:'She ___ pizza.', answer:"doesn't like"},
  {id:'crisps', sentence:'He likes crisps.', pt:'Ele gosta de batatas chips.', alt:'Menino sorrindo e segurando batatas chips', blank:'He ___ crisps.', answer:'likes'}
];
const ENG_TOPICS = {
  birthday:{title:'Palavras da festa', pages:'54–55', intro:'Leia as palavras e suas traduções. Depois, pratique a escrita nos dois sentidos. Toque em uma palavra se quiser ouvir.', words:ENG_WORDS.slice(0,8)},
  likes:{title:'Likes / doesn’t like', pages:'56', intro:'Likes significa “gosta”. Doesn’t like significa “não gosta”. She se refere a ela; he, a ele. Observe as expressões e pratique a escrita das frases. O áudio é opcional.'},
  got:{title:'Have you got…?', pages:'60 · atividade 4', intro:'Have you got…? pergunta se você tem alguma coisa. Yes, I have. significa “Sim, tenho”. No, I haven’t. significa “Não, não tenho”. Use a pot para uma panela e potatoes, onions e mushrooms para os itens no plural.', words:ENG_WORDS.slice(8)}
};
const ENG_QUESTIONS = {birthday:[],likes:[],got:[]};
function engWordQuestion(word, alternatives){
  return {kind:'food', audio:word.word, target:word.id, page:word.page, options:alternatives, instruction:'Ouça a palavra e toque na imagem correspondente.', why:`Você ouviu “${word.word}”: ${word.pt}.`};
}
// Distratores fixos e distintos; cada rodada muda apenas a ordem na tela.
const ENG_FOOD_OPTIONS = {
  card:['card','water','cherries','pizza'],
  water:['water','yoghurt','popcorn','crisps'],
  crisps:['crisps','sausages','pizza','yoghurt'],
  pizza:['pizza','popcorn','cherries','card'],
  popcorn:['popcorn','crisps','yoghurt','water'],
  yoghurt:['yoghurt','water','cherries','sausages'],
  sausages:['sausages','pizza','popcorn','crisps'],
  cherries:['cherries','card','water','yoghurt'],
  potatoes:['potatoes','onions','mushrooms','pot'],
  onions:['onions','potatoes','mushrooms','pot'],
  mushrooms:['mushrooms','potatoes','onions','pot'],
  pot:['pot','potatoes','onions','mushrooms']
};
ENG_WORDS.slice(0,8).forEach(w=>ENG_QUESTIONS.birthday.push(engWordQuestion(w,ENG_FOOD_OPTIONS[w.id])));
ENG_SCENES.forEach(s=>ENG_QUESTIONS.likes.push({kind:'scene',audio:s.sentence,target:s.id,page:56,options:ENG_SCENES.map(x=>x.id),instruction:'Ouça a frase e toque na cena correspondente.',why:`${s.sentence} ${s.pt}`}));
ENG_SCENES.forEach(s=>ENG_QUESTIONS.likes.push({kind:'grammar',audio:s.sentence,target:s.answer,page:56,scene:s.id,blank:s.blank,options:['likes',"doesn't like",'like',"don't like"],instruction:'Ouça a frase. Observe a cena e complete a lacuna.',why:`${s.sentence} Com he ou she, usamos likes ou doesn’t like.`}));
ENG_WORDS.slice(8).forEach(w=>ENG_QUESTIONS.got.push(engWordQuestion(w,ENG_FOOD_OPTIONS[w.id])));
// Diálogos adaptados: a resposta é pronunciada; não inferimos áudio das marcas na foto.
const ENG_DIALOGUES = [
  {question:'Have you got potatoes?',response:'Yes, I have.',word:'potatoes'},
  {question:'Have you got onions?',response:"No, I haven't.",word:'onions'},
  {question:'Have you got mushrooms?',response:"No, I haven't.",word:'mushrooms'},
  {question:'Have you got a pot?',response:'Yes, I have.',word:'pot'},
  {question:'Have you got potatoes?',response:"No, I haven't.",word:'potatoes'},
  {question:'Have you got onions?',response:'Yes, I have.',word:'onions'},
  {question:'Have you got mushrooms?',response:'Yes, I have.',word:'mushrooms'},
  {question:'Have you got a pot?',response:"No, I haven't.",word:'pot'}
];
ENG_DIALOGUES.forEach(d=>ENG_QUESTIONS.got.push({kind:'dialogue',audio:d.question+' '+d.response,target:d.response,page:60,options:['Yes, I have.',"No, I haven't.",'Yes, I like it.',"No, I don't like it."],instruction:'Ouça a pergunta e a resposta. Toque na resposta que escutou.',context:'Neste diálogo de treino, alguém pergunta e a outra pessoa responde. Escute até o fim.',why:`${d.question} → ${d.response} ${d.response==='Yes, I have.'?'A pessoa tem o item.':'A pessoa não tem o item.'}`}));

// Escrita: tradução nos dois sentidos, frases e lacunas. Áudio opcional.
const ENG_WRITING = [];
ENG_WORDS.forEach(w=>{
  const topic=w.page===60?'got':'birthday';
  ENG_WRITING.push({topic,page:w.page,prompt:'Traduza para inglês:',source:w.pt,target:w.word,answers:[w.word],audio:w.word,image:w.id});
  const variants={crisps:['batatas chips','batata chips','batatas fritas','salgadinhos de batata'],pot:['panela','uma panela'],card:['cartão de aniversário','um cartão de aniversário']};
  ENG_WRITING.push({topic,page:w.page,prompt:'Traduza para português:',source:w.word,target:w.pt,answers:variants[w.id]||[w.pt],audio:w.word,image:w.id});
});
ENG_SCENES.forEach(s=>{
  ENG_WRITING.push({topic:'likes',page:56,prompt:'Traduza a frase para inglês:',source:s.pt,target:s.sentence,answers:[s.sentence],audio:s.sentence});
  ENG_WRITING.push({topic:'likes',page:56,prompt:'Traduza a frase para português:',source:s.sentence,target:s.pt,answers:[s.pt],audio:s.sentence});
  ENG_WRITING.push({topic:'likes',page:56,prompt:'Complete em inglês com likes ou doesn’t like:',source:s.blank+' — '+s.pt,target:s.answer,answers:[s.answer],audio:s.sentence});
});
const ENG_TRANSLATIONS=[
 ['Have you got potatoes?','Você tem batatas?'],
 ['Have you got onions?','Você tem cebolas?'],
 ['Have you got mushrooms?','Você tem cogumelos?'],
 ['Have you got a pot?','Você tem uma panela?'],
 ['Yes, I have.','Sim, tenho.'],
 ["No, I haven't.",'Não, não tenho.']
];
ENG_TRANSLATIONS.forEach(([en,pt])=>{
 const aliases=pt==='Sim, tenho.'?['Sim, tenho.','Sim, eu tenho.']:pt==='Não, não tenho.'?['Não, não tenho.','Não, eu não tenho.']: [pt,pt.replace('Você tem','Tu tens'),pt.replace('uma panela','panela')];
 ENG_WRITING.push({topic:'got',page:60,prompt:'Traduza a frase para inglês:',source:pt,target:en,answers:[en],audio:en});
 ENG_WRITING.push({topic:'got',page:60,prompt:'Traduza a frase para português:',source:en,target:pt,answers:aliases,audio:en});
});

const ENG_COMPLETION=[];
ENG_WORDS.forEach(w=>{
 const topic=w.page===60?'got':'birthday';
 const before=topic==='got'?(w.id==='pot'?'Have you got a ':'Have you got '):'';
 const after=topic==='got'?'?':'.';
 ENG_COMPLETION.push({topic,page:w.page,prompt:'Complete a palavra: escreva as letras que faltam.',source:w.pt,prefix:before+w.word[0],suffix:after,target:w.word.slice(1),answers:[w.word.slice(1)],model:before+w.word+after,audio:w.word,image:w.id});
 ENG_COMPLETION.push({topic,page:w.page,prompt:'Agora escreva a palavra inteira em inglês.',source:w.pt,prefix:topic==='got'?before:'',suffix:topic==='got'?after:'',target:w.word,answers:[w.word],model:topic==='got'?before+w.word+after:w.word,audio:w.word,image:w.id});
});
ENG_SCENES.forEach(s=>{const [prefix,suffix]=s.blank.split('___');ENG_COMPLETION.push({topic:'likes',page:56,prompt:'Complete a frase: escreva likes ou doesn’t like.',source:s.pt,prefix,suffix,target:s.answer,answers:[s.answer],model:s.sentence,audio:s.sentence,scene:s.id});});
ENG_WORDS.slice(8).forEach((w,i)=>{const yes=i%2===0;ENG_COMPLETION.push({topic:'got',page:60,prompt:'Complete a resposta em inglês.',source:(w.id==='pot'?'Have you got a pot?':'Have you got '+w.word+'?')+' '+(yes?'✓ Sim, tenho.':'✕ Não, não tenho.'),prefix:yes?'Yes, I ':'No, I ',suffix:'.',target:yes?'have':"haven't",answers:yes?['have']:["haven't",'have not'],model:yes?'Yes, I have.':"No, I haven't.",audio:yes?'Yes, I have.':"No, I haven't.",image:w.id});});
