'use strict';
const {items, actions, feelings, sections, slug, tasks, answer, wearing} = Holiday;
const app = document.getElementById('app'), voice = document.getElementById('voice');
const storageKey = 'beach-club-english-v1';
const fresh = round => ({round, sheets:{}, positions:{}, pace:1});
let book = fresh(0), active, question, page, section, sheet, total, message='', reviewing=false, selected='', observer, guideIndex=0, guideGroup=0;
try {
  const stored=JSON.parse(localStorage.getItem(storageKey));
  if(stored && [0,1,2,3].includes(stored.round) && stored.sheets && stored.positions)book=stored;
} catch {}
function save(){
  try {localStorage.setItem(storageKey,JSON.stringify(book))}
  catch {document.getElementById('notice').textContent='O navegador não conseguiu guardar esta alteração.'}
}
const descriptions={'cap':'boné','sandals':'sandálias','T-shirt':'camiseta','suncream':'protetor solar','shorts':'bermuda','sunglasses':'óculos de sol','skirt':'saia','swimsuit':'maiô','sunbathing':'tomando sol','eating ice cream':'comendo sorvete','making sandcastles':'fazendo castelos de areia','swimming':'nadando','hot':'sob o sol, com calor','hungry':'pensando em comida','scared':'com expressão de medo','thirsty':'pensando em água'};
function description(word){
  const [person,feeling]=word.split('-');
  return descriptions[word] || ((person==='he'?'Menino ':'Menina ')+(descriptions[feeling]||''));
}
function art(word,cl=''){return '<img draggable="false" class="'+cl+'" src="assets/holiday-art/'+slug(word)+'.svg" alt="'+description(word)+'">'}
function btn(label,cmd,cl='',extra=''){return '<button type="button" class="'+cl+'" data-do="'+cmd+'" '+extra+'>'+label+'</button>'}
function go(hash){location.hash=hash}
const nDone=id=>tasks(id,book.round).filter((_,i)=>book.sheets[id+'/'+i]?.done).length;
function home(){
  const card=([id,title,sub,pic,ref])=>'<a class="card" href="#'+id+'"><span class="thumb">'+art(pic)+'</span><span><strong>'+title+'</strong><small>'+sub+'</small><span class="meta">'+ref+' · '+nDone(id)+'/'+tasks(id,book.round).length+'</span></span></a>';
  return '<section class="hero"><img src="assets/holiday-art/cover.svg" alt="Praia ilustrada"><div class="hero-copy"><p class="eyebrow">Unit 6 · Beach holiday</p><h1 lang="en">I’m on holiday!</h1><p>Vamos passar um dia na praia? Escolha por onde começar.</p></div></section>'+
  '<div class="headline"><h2>Meu caderno</h2><a class="btn accent" href="#guide">♫ Ouvir e praticar</a></div><div class="grid">'+sections.map(card).join('')+'</div>'+
  '<details class="adult"><summary>Para o adulto · rodada '+(book.round+1)+' de 4</summary><p>Há quatro rodadas. Trocar começa toda a revisão de novo e apaga as respostas e os traços desta rodada.</p>'+btn('Nova rodada','round')+'</details>';
}
function ref(){return '<details class="reference"><summary>'+section[4]+' · para o adulto</summary><p>'+section[5]+'</p></details>'}
function choices(words,images=true,p=''){
  return '<div class="choices">'+words.map((word,i)=>btn(images?art(p?p+'-'+word:word):word,'pick','tile','data-index="'+i+'" aria-pressed="'+(sheet.pick===word)+'"')).join('')+'</div>';
}
function playTools(label){return '<div class="toolrow">'+btn('♫ '+label,'play','accent')+btn('Ritmo '+(book.pace===.85?'0,85':'1')+'×','pace','pace')+'</div>'}
function transcript(words){return '<details class="transcript"><summary>Ler a legenda</summary><p lang="en">'+words+'</p></details>'}
function questionText(q){return 'Is '+q.p+' '+q.word+'?'}
function writeBox(){
  return '<canvas class="ink" id="ink" aria-label="Folha pautada para escrever com a caneta"></canvas><div class="toolrow">'+btn('Desfazer traço','undoInk')+btn('Apagar folha','clearInk')+'</div>';
}
function exercise(){
  const q=question;
  if(q.kind==='pick')return '<p class="prompt">Ouça a palavra. Qual é a figura?</p>'+playTools('Ouvir palavra')+choices(q.options)+transcript(q.word);
  if(q.kind==='dialog')return '<p class="prompt">Ouça a pergunta e a resposta. Qual cena combina?</p>'+playTools('Ouvir conversa')+choices(q.options,true,q.p)+transcript(questionText(q)+' '+answer(q.p,q.yes))+'<a class="btn quiet" href="#guide/2">Praticar as quatro palavras</a>';
  if(q.kind==='order')return '<p class="prompt">Ouça as quatro ações. Toque nas cenas na ordem que ouvir.</p>'+playTools('Ouvir sequência')+'<div class="board">'+actions.map((word,i)=>{
    const pos=(sheet.order||[]).indexOf(word);
    return btn(art(word)+(pos<0?'':'<span class="number">'+(pos+1)+'</span>'),'order','tile','data-index="'+i+'" aria-pressed="'+(pos>=0)+'"')
  }).join('')+'</div><div class="toolrow">'+btn('Desfazer último','pop')+'</div>'+transcript(q.order.join(' · '));
  if(q.kind==='bags')return bags();
  let prompt='Olhe a figura. Escreva o nome em inglês.', clue='';
  if(q.kind==='wear'){prompt='Qual peça completa a frase? Escreva só a palavra.';clue=wearing(q.p,q.word)}
  if(q.kind==='question'){prompt='Olhe a pista. Escreva a palavra que falta.';clue='Is '+q.p+' ____?'}
  return '<p class="prompt">'+prompt+'</p><div class="clue">'+art(q.kind==='question'?q.p+'-'+q.word:q.word)+'<span class="english" lang="en">'+clue+'</span></div>'+
    (q.kind==='question'?'<p class="words" lang="en">hungry · hot · scared · thirsty</p>':'')+writeBox()+
    (q.kind==='question'?'<p class="prompt"><span class="flag">'+(q.yes?'✓ Sim':'✕ Não')+'</span> · Agora escolha a resposta e diga em voz alta.</p>'+choices(replyOptions(),false):'');
}
function replyOptions(){
  return [answer('he',true),answer('she',false),answer('she',true),answer('he',false)];
}
function bags(){
  const q=question,places=sheet.places||{};
  return '<p class="prompt">Cada mala tem um pedido. Encontre as peças na barraca.</p><p class="game-note">Arraste a peça até a mala, ou toque na peça e depois na mala. Para devolver, selecione a peça e toque em “Devolver”.</p>'+
  '<div class="baggrid">'+['Coral','Mar'].map((name,i)=>btn('Mala '+name+'<small lang="en">'+q.orders.slice(i*2,i*2+2).join(' + ')+'</small><span>'+q.pool.filter(word=>places[word]===i).map(word=>art(word,'mini')).join('')+'</span>','place','bag','data-dest="'+i+'"')).join('')+'</div><div class="stock">'+q.pool.map((word,i)=>btn(art(word)+(places[word]!==undefined?'<small>Mala '+(places[word]?'Mar':'Coral')+'</small>':''),'stock','tile','data-index="'+i+'" aria-pressed="'+(selected===word)+'"')).join('')+'</div><div class="toolrow">'+btn('Devolver à barraca','return')+btn('Desfazer movimento','undoMove')+'</div>';
}
const writing=()=>['wear','write','question'].includes(question?.kind);
function foot(){
  return '<div class="controls">'+btn(writing()?'Conferir minha escrita':'Conferir resposta','check','primary')+'</div><div class="feedback" role="status">'+message+'</div>'+
  (writing() && reviewing?'<div class="review"><p>Compare letra por letra com a sua escrita.</p><strong class="english" lang="en">'+question.word+'</strong>'+playTools('Ouvir modelo')+btn('Quero corrigir','edit')+' '+btn('Revisei minha escrita','reviewed','primary')+'</div>':'')+
  (sheet.done?'<p class="success">'+(writing()?'Escrita revisada por você.':'Você acertou!')+'</p>':'')+
  '<div class="nav row">'+(page>0?btn('Anterior','prev'):'')+(page+1<total?btn('Próxima ficha','next','accent'):'<a class="btn accent" href="#home">Voltar ao caderno</a>')+'</div>';
}
const guideGroups=[['Itens da praia',items],['Ações da praia',actions],['Como se sente?',feelings]];
function guide(){
  const [title,words]=guideGroups[guideGroup], word=words[guideIndex], feeling=guideGroup===2;
  return '<div class="topline"><a class="btn" href="#home">Meu caderno</a></div><article class="sheet"><p class="eyebrow">Prática oral</p><h1>Ouvir e praticar</h1><p class="intro">Veja a figura, ouça em inglês e repita no seu tempo.</p><div class="toolrow">'+guideGroups.map(([name],i)=>btn(name,'group',i===guideGroup?'accent':'','data-index="'+i+'"')).join('')+'</div><div class="headline"><h2>'+title+'</h2><span>'+ (guideIndex+1)+' / '+words.length+'</span></div>'+art(feeling?'she-'+word:word,'guide-art')+'<p class="english" lang="en">'+word+'</p>'+playTools('Ouvir e repetir')+(feeling?'<p>Pratique também a conversa.</p>'+btn('♫ Is she '+word+'? Yes, she is.','example','accent'):'')+'<div class="row nav">'+btn('Voltar','guidePrev','',guideIndex===0?'disabled':'')+btn('Avançar','guideNext','',guideIndex===words.length-1?'disabled':'')+'</div><details class="reference"><summary>'+['Pp. 66–67','P. 69 · ex. 3','P. 72 · ex. 1'][guideGroup]+' · para o adulto</summary><p>Cartões ilustrados para ouvir e repetir. A narração em inglês foi preparada para esta revisão.</p></details></article>';
}
let lessonStep=-1;
function lessonExample(){
  const p=question.p==='he'?'she':'he';
  const feeling=feelings.find(f=>f!==question.word && !question.options.includes(f));
  return {p,feeling};
}
function lesson(){
  if(!['dialog','question'].includes(question.kind))return '';
  if(lessonStep<0)return '<div class="toolrow">'+btn('Ver um exemplo','lessonOpen','quiet')+'</div>';
  const {p,feeling}=lessonExample();
  const caption=['Observe a cena. Como essa criança está se sentindo?', 'A pergunta usa '+p+' e a palavra que você viu na figura.', 'Aqui a resposta é sim. Ouça, repita e volte à sua ficha.'][lessonStep];
  const english=lessonStep===1?'Is '+p+' '+feeling+'?':lessonStep===2?answer(p,true):'';
  return '<aside class="review"><p class="eyebrow">Outro exemplo</p>'+art(p+'-'+feeling,'guide-art')+'<p>'+caption+'</p><p class="english" lang="en">'+english+'</p><div class="toolrow">'+(lessonStep?btn('Ouvir exemplo','lessonPlay','accent')+btn('Voltar','lessonBack'):'')+(lessonStep<2?btn('Avançar','lessonNext'):btn('Repetir','lessonOpen'))+btn('Sair do exemplo','lessonExit')+'</div></aside>';
}
let audioPause;
function stop(){clearTimeout(audioPause);voice.onended=null;voice.onerror=null;voice.pause()}
function play(words){
  stop();
  let i=0;
  function clip(){
    voice.src='assets/holiday-audio/'+slug(words[i])+'.mp3';voice.playbackRate=book.pace;
    voice.onended=()=>{if(++i<words.length)audioPause=setTimeout(clip,question?.kind==='order'?650:350)};
    const failure=()=>{document.getElementById('notice').textContent='O áudio não abriu. Toque para ouvir novamente.'};
    voice.onerror=failure;document.getElementById('notice').textContent='';
    voice.play().catch(e=>{if(e.name!=='AbortError')failure()});
  }
  clip();
}
function render(){
  observer?.disconnect();
  if(active==='home')app.innerHTML=home();
  else if(active==='guide')app.innerHTML=guide();
  else{
    app.innerHTML='<div class="topline"><a class="btn" href="#home">Meu caderno</a><span class="meta">Ficha '+(page+1)+' de '+total+'</span></div><article class="sheet"><p class="eyebrow">'+section[4]+'</p><h1>'+section[1]+'</h1><div class="progress" aria-hidden="true"><i style="width:'+100*nDone(active)/total+'%"></i></div>'+exercise()+foot()+lesson()+ref()+'</article>';
    if(writing())setupInk();
  }
}
function route(){
  stop();selected='';message='';reviewing=false;lessonStep=-1;
  const [id,index]=location.hash.slice(1).split('/');
  active=id==='guide'?'guide':sections.some(s=>s[0]===id)?id:'home';
  if(active==='guide'){guideGroup=[0,1,2].includes(Number(index))?Number(index):0;guideIndex=0}
  else if(active!=='home'){
    section=sections.find(s=>s[0]===active);
    const deck=tasks(active,book.round);total=deck.length;
    const desired=index===undefined?book.positions[active]:Number(index);
    page=Number.isInteger(desired)&&desired>=0&&desired<total?desired:0;
    book.positions[active]=page;question=deck[page];sheet=book.sheets[active+'/'+page]||={};save();
  }
  render();window.scrollTo(0,0);
}
function dirty(){sheet.done=false;message='';reviewing=false}
function move(dest){
  if(!selected){message='Escolha primeiro uma peça.';render();return}
  const places=sheet.places||={};
  if(places[selected]!==dest){
    (sheet.moves||=[]).push({...places});
    if(dest===undefined)delete places[selected];else places[selected]=dest;
    dirty();
  }
  selected='';save();render();
}
function check(){
  const q=question;
  reviewing=false;
  if(writing()){
    if(!sheet.ink?.length){message='Escreva a palavra na folha primeiro.';return}
    if(q.kind==='question' && sheet.pick!==answer(q.p,q.yes)){message='Veja o sinal. A resposta fala de he ou she?';return}
    reviewing=true;message='';return;
  }
  let ok=false;
  if(q.kind==='order'){ok=q.order.every((word,i)=>sheet.order?.[i]===word);message='Ouça outra vez. Confira a posição de cada cena.'}
  else if(q.kind==='bags'){ok=q.pool.every(word=>{
    const i=q.orders.indexOf(word);return sheet.places?.[word]===(i<0?undefined:Math.floor(i/2))
  });message='Leia os dois pedidos. Confira se cada mala tem as peças pedidas.'}
  else{ok=sheet.pick===(q.kind==='dialog'?q.target:q.word);message=q.kind==='dialog'?'Ouça até o fim. A resposta diz yes ou no?':'Ouça outra vez e observe as figuras.'}
  sheet.done=ok;if(ok)message='';
}
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-do]');if(!b)return;
  const cmd=b.dataset.do, i=Number(b.dataset.index), q=question;
  if(cmd==='play'){
    if(active==='guide')play([guideGroups[guideGroup][1][guideIndex]]);
    else if(q.kind==='dialog')play([q.p+'-'+q.word,q.p+'-'+(q.yes?'yes':'no')]);
    else play(q.kind==='order'?q.order:[q.word]);
    return;
  }
  if(cmd==='example'){play(['she-'+feelings[guideIndex],'she-yes']);return}
  if(cmd==='pace'){book.pace=book.pace===.85?1:.85;voice.playbackRate=book.pace;b.textContent='Ritmo '+(book.pace===1?'1':'0,85')+'×';save();return}
  if(cmd==='lessonPlay'){const {p,feeling}=lessonExample();play([lessonStep===1?p+'-'+feeling:p+'-yes']);return}
  stop();
  if(cmd==='lessonOpen')lessonStep=0;
  if(cmd==='lessonBack')lessonStep--;
  if(cmd==='lessonNext')lessonStep++;
  if(cmd==='lessonExit')lessonStep=-1;
  if(cmd==='group'){guideGroup=i;guideIndex=0}
  if(cmd==='guideNext')guideIndex++;
  if(cmd==='guidePrev')guideIndex--;
  if(cmd==='round'){
    if(!confirm('Começar outra rodada e apagar as respostas desta rodada?'))return;
    const pace=book.pace;book=fresh((book.round+1)%4);book.pace=pace;
  }
  if(cmd==='next'||cmd==='prev'){go(active+'/'+(page+(cmd==='next'?1:-1)));return}
  if(cmd==='stock'){selected=selected===q.pool[i]?'':q.pool[i];message=''}
  if(cmd==='place'||cmd==='return'){move(cmd==='place'?Number(b.dataset.dest):undefined);return}
  if(cmd==='undoMove' && sheet.moves?.length){dirty();sheet.places=sheet.moves.pop();selected=''}
  if(cmd==='undoInk'||cmd==='clearInk'){dirty();if(cmd==='undoInk')sheet.ink?.pop();else sheet.ink=[]}
  if(cmd==='pick'){dirty();sheet.pick=(q.kind==='question'?replyOptions():q.options)[i]}
  if(cmd==='order'){dirty();const seq=sheet.order||=[];const word=actions[i];if(seq.includes(word))seq.splice(seq.indexOf(word),1);else seq.push(word)}
  if(cmd==='pop'){dirty();sheet.order?.pop()}
  if(cmd==='check')check();
  if(cmd==='edit')dirty();
  if(cmd==='reviewed'){sheet.done=true;reviewing=false;message=''}
  save();render();
  if(cmd.startsWith('lesson')&&lessonStep>=0)app.querySelector('aside').scrollIntoView({block:'nearest'});
});
function setupInk(){
  const c=document.getElementById('ink'),ctx=c.getContext('2d'),strokes=sheet.ink||=[];
  let pointer=null,line;
  function paint(){
    const r=c.getBoundingClientRect(),d=window.devicePixelRatio||1;
    c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);ctx.scale(d,d);
    ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#244969';
    strokes.forEach(l=>{if(!l.length)return;ctx.beginPath();ctx.moveTo(l[0][0]*r.width,l[0][1]*r.height);
      l.forEach(([x,y])=>ctx.lineTo(x*r.width,y*r.height));if(l.length===1)ctx.lineTo(l[0][0]*r.width+.1,l[0][1]*r.height+.1);ctx.stroke()});
  }
  function point(e){const r=c.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
  c.onpointerdown=e=>{
    if(e.pointerType==='touch'||pointer!==null||e.button>0)return;
    e.preventDefault();dirty();app.querySelector('.review')?.remove();app.querySelector('.success')?.remove();app.querySelector('.feedback').textContent='';
    pointer=e.pointerId;c.setPointerCapture(pointer);line=[point(e)];strokes.push(line);paint();
  };
  c.onpointermove=e=>{
    if(pointer!==e.pointerId)return;
    const r=c.getBoundingClientRect(),last=line[line.length-1];ctx.beginPath();ctx.moveTo(last[0]*r.width,last[1]*r.height);
    const samples=e.getCoalescedEvents?.();
    for(const s of samples?.length?samples:[e]){const xy=point(s);line.push(xy);ctx.lineTo(xy[0]*r.width,xy[1]*r.height)}ctx.stroke();
  };
  c.onpointerup=c.onpointercancel=c.onlostpointercapture=e=>{if(pointer===e.pointerId){pointer=null;save()}};
  observer=new ResizeObserver(paint);observer.observe(c);paint();
}
let drag=null,skipClick=false;
app.addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-do="stock"]');if(!b||drag||e.button>0)return;
  drag={word:question.pool[Number(b.dataset.index)],id:e.pointerId,x:e.clientX,y:e.clientY,b};
  b.setPointerCapture(e.pointerId);
});
app.addEventListener('pointermove',e=>{
  if(e.pointerId!==drag?.id)return;
  if(!drag.ghost && Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
  if(!drag.ghost){drag.ghost=drag.b.querySelector('img').cloneNode();drag.ghost.className='dragging';document.body.append(drag.ghost)}
  drag.ghost.style.left=(e.clientX-39)+'px';drag.ghost.style.top=(e.clientY-31)+'px';
});
function endDrag(e){
  if(drag?.id!==e.pointerId)return;
  const d=drag;drag=null;if(!d.ghost)return;d.ghost.remove();
  skipClick=true;setTimeout(()=>skipClick=false,0);
  const bag=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dest]');
  if(e.type==='pointerup'&&bag){selected=d.word;move(Number(bag.dataset.dest))}
}
app.addEventListener('pointerup',endDrag);app.addEventListener('pointercancel',endDrag);
app.addEventListener('click',e=>{if(skipClick){e.preventDefault();e.stopImmediatePropagation()}},true);
window.addEventListener('hashchange',route);
window.addEventListener('pagehide',()=>{stop();save()});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();save()}});
route();
