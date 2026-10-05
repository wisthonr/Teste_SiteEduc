'use strict';
let engTopic='birthday', engRun=null, engWrite=null, engRecords={};
try{engRecords=JSON.parse(localStorage.getItem('julia-ingles-unit5-v1')||'{}')||{};}catch{}
const englishSynth=('speechSynthesis' in window)?window.speechSynthesis:null;
let voiceList=[], audioGeneration=0, liveUtterance=null;
const engPlayer=document.createElement('audio');
engPlayer.id='eng-player';engPlayer.preload='none';engPlayer.hidden=true;
document.body.appendChild(engPlayer);
function stopEnglishAudio(){
  audioGeneration++;
  engPlayer.pause();engPlayer.onended=null;engPlayer.onerror=null;
  if(englishSynth)englishSynth.cancel();
  liveUtterance=null;
}
function populateVoices(){
  const previous=$('eng-voice').value;
  voiceList=englishSynth?englishSynth.getVoices().filter(v=>/^en([-_]|$)/i.test(v.lang)):[];
  // Prioriza a grafia e a pronúncia britânicas usadas no livro.
  voiceList.sort((a,b)=>Number(/^en-GB/i.test(b.lang))-Number(/^en-GB/i.test(a.lang)));
  $('eng-voice').innerHTML='<option value="recorded">Áudios do treino · inglês</option>'+voiceList.map((v,i)=>`<option value="${i}">${escapeHTML(v.name)} (${escapeHTML(v.lang)})</option>`).join('');
  if(previous==='recorded'||(previous!==''&&voiceList[Number(previous)]))$('eng-voice').value=previous;
  $('eng-audio-status').textContent='Toque em Ouvir para iniciar o áudio. Você pode repetir quantas vezes quiser.';
}
function speakEnglish(text,status,{onDone=()=>{},onError=()=>{}}={}){
  stopEnglishAudio();
  const generation=audioGeneration;
  const recording=ENG_AUDIO[text];
  if($('eng-voice').value==='recorded'&&recording){
    engPlayer.src=recording;engPlayer.playbackRate=Number($('eng-rate').value)||0.8;
    status.textContent='Preparando o áudio…';
    engPlayer.onended=()=>{if(generation!==audioGeneration)return;status.textContent='Áudio concluído. Você pode ouvir novamente.';onDone();};
    const fail=()=>{if(generation!==audioGeneration)return;status.textContent='O áudio não conseguiu tocar. Verifique o som ou use o apoio escrito.';onError();};
    engPlayer.onerror=fail;
    engPlayer.play().then(()=>{if(generation===audioGeneration)status.textContent='🔊 Escute até o fim…';}).catch(fail);
    return;
  }
  if(!englishSynth||typeof SpeechSynthesisUtterance==='undefined'){
    status.textContent='A voz não está disponível. Use “Mostrar o que ouvi” como apoio escrito.';
    onError();return;
  }
  const utterance=new SpeechSynthesisUtterance(text);
  liveUtterance=utterance;
  utterance.lang='en-GB';
  utterance.rate=Number($('eng-rate').value)||0.8;
  const voice=voiceList[Number($('eng-voice').value)];
  if(voice){utterance.voice=voice;utterance.lang=voice.lang;}
  status.textContent='Preparando o áudio…';
  utterance.onstart=()=>{if(generation===audioGeneration)status.textContent='🔊 Escute até o fim…';};
  utterance.onend=()=>{if(generation!==audioGeneration)return;status.textContent='Áudio concluído. Você pode ouvir novamente.';liveUtterance=null;onDone();};
  utterance.onerror=()=>{if(generation!==audioGeneration)return;status.textContent='O áudio não conseguiu tocar. Use o apoio escrito ou tente novamente.';liveUtterance=null;onError();};
  englishSynth.speak(utterance);
}
function foodHTML(id,accessible=true){const word=ENG_WORDS.find(w=>w.id===id);return `<span class="eng-food food-${id}" ${accessible?`role="img" aria-label="Ilustração de ${escapeHTML(word.pt)}"`:'aria-hidden="true"'}></span>`;}
function sceneHTML(id,accessible=true){const scene=ENG_SCENES.find(s=>s.id===id);return `<span class="eng-scene scene-${id}" ${accessible?`role="img" aria-label="${escapeHTML(scene.alt)}"`:'aria-hidden="true"'}></span>`;}
function englishHome(){renderEnglishRecords();screen('english');populateVoices();}
function renderEnglishRecords(){
  $('eng-records').textContent='Registros de escuta neste navegador: '+Object.entries(engRecords).map(([id,r])=>`${ENG_TOPICS[id].title}: ${r.correct}/${r.total} sem apoio`).join(' · ');
}
function openEnglishTopic(id){
  engTopic=id;const topic=ENG_TOPICS[id];
  $('eng-learn-title').textContent=topic.title;
  $('eng-learn-pages').textContent='Base: páginas '+topic.pages;
  let html=`<div class="listen-rules"><p>${escapeHTML(topic.intro)}</p></div>`;
  if(topic.words){
    html+='<div class="vocab-grid">'+topic.words.map(w=>`<button class="vocab-card" data-say="${escapeHTML(w.word)}">${foodHTML(w.id,false)}<span class="label" lang="en">🔊 ${w.word}<small lang="pt-BR">${w.pt}</small></span></button>`).join('')+'</div>';
  }
  if(id==='likes'){
    html+=ENG_SCENES.map(s=>`<article class="eng-example">${sceneHTML(s.id)}<div><p lang="en"><strong>${escapeHTML(s.sentence)}</strong></p><p>${s.pt}</p><button class="audio-button" data-say="${escapeHTML(s.sentence)}">🔊 Ouvir</button></div></article>`).join('');
    html+='<p class="small">Os exemplos seguem as cenas da atividade 2. Na atividade 1, as cores dependem do áudio original do livro.</p>';
  }
  if(id==='got'){
    html+='<div class="paper"><h2>Leia e traduza</h2><p lang="en">Have you got a pot?</p><button class="audio-button" data-say="Have you got a pot?">🔊 Ouvir pergunta</button><p>✓ <span lang="en">Yes, I have.</span> — Sim, tenho.</p><button class="audio-button" data-say="Yes, I have.">🔊 Ouvir resposta positiva</button><p>✕ <span lang="en">No, I haven’t.</span> — Não, não tenho.</p><button class="audio-button" data-say="No, I haven\'t.">🔊 Ouvir resposta negativa</button></div>';
    html+='<p class="small">As respostas indicam se a pessoa tem o item. Pratique a escrita da pergunta e das respostas; o áudio está disponível como apoio.</p>';
  }
  html+='<p id="eng-learn-speaking" class="small" role="status" aria-live="polite"></p>';
  $('eng-learn-content').innerHTML=html;
  $('eng-learn-content').querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speakEnglish(b.dataset.say,$('eng-learn-speaking')));
  screen('eng-learn');
}
function startEnglishQuiz(){
  engRun={topic:engTopic,items:shuffle(ENG_QUESTIONS[engTopic]).map(p=>({...p,choices:shuffle(p.options)})),i:0,correct:0,assistedCorrect:0,answered:false,assisted:false,heard:false};
  screen('eng-quiz');loadEnglishQuestion();
}
function loadEnglishQuestion(){
  stopEnglishAudio();const p=engRun.items[engRun.i];
  Object.assign(engRun,{answered:false,assisted:false,heard:false});
  $('eng-quiz-title').textContent='🎧 '+ENG_TOPICS[engRun.topic].title;
  $('eng-quiz-count').textContent=`${engRun.i+1} de ${engRun.items.length}`;
  $('eng-bar').max=engRun.items.length;$('eng-bar').value=engRun.i;
  $('eng-question-page').textContent='Base: página '+p.page+' · áudio de treino';
  $('eng-instruction').textContent=p.instruction;
  $('eng-context').textContent=p.context||'Toque em Ouvir. As respostas serão liberadas depois do áudio; se precisar, use o apoio escrito.';
  $('eng-playing').textContent='';$('eng-transcript').hidden=true;
  $('eng-transcript').textContent=p.audio;
  $('eng-transcript-button').hidden=false;
  $('eng-feedback').hidden=true;$('eng-next').hidden=true;
  let clue='';
  if(p.kind==='grammar')clue=`<div class="grammar-clue">${sceneHTML(p.scene)}</div><p class="grammar-blank" lang="en">${escapeHTML(p.blank)}</p>`;
  $('eng-options').className='options eng-options'+(['grammar','dialogue'].includes(p.kind)?' text-options':'');
  $('eng-options').innerHTML=clue+p.choices.map((option,i)=>{
    const picture=p.kind==='food'?foodHTML(option,false):p.kind==='scene'?sceneHTML(option,false):null;
    const description=p.kind==='food'?ENG_WORDS.find(w=>w.id===option).pt:p.kind==='scene'?ENG_SCENES.find(s=>s.id===option).alt:option;
    return `<button class="option" data-choice="${i}" disabled ${picture?`aria-label="Imagem ${i+1}: ${escapeHTML(description)}"`:'lang="en"'}>${picture?`<span class="picture-number">Imagem ${i+1}</span>${picture}`:escapeHTML(option)}</button>`;
  }).join('');
  $('eng-options').querySelectorAll('button').forEach(b=>b.onclick=()=>answerEnglish(Number(b.dataset.choice)));
  $('eng-next').textContent=engRun.i===engRun.items.length-1?'Ver minha rodada →':'Próxima →';
}
function unlockEnglish(){if(!engRun.answered)$('eng-options').querySelectorAll('button').forEach(b=>b.disabled=false);}
function playEnglishQuestion(){
  const current=engRun,i=current.i;
  speakEnglish(current.items[i].audio,$('eng-playing'),{onDone:()=>{if(engRun===current&&current.i===i){current.heard=true;unlockEnglish();}}});
}
function showEnglishTranscript(){
  stopEnglishAudio();engRun.assisted=true;
  $('eng-transcript').hidden=false;
  $('eng-playing').textContent='Apoio escrito aberto. Esta questão será registrada como treino com apoio.';
  unlockEnglish();
}
function answerEnglish(index){
  if(engRun.answered||(!engRun.heard&&!engRun.assisted))return;
  stopEnglishAudio();engRun.answered=true;
  const p=engRun.items[engRun.i],picked=p.choices[index],ok=picked===p.target;
  if(ok){if(engRun.assisted)engRun.assistedCorrect++;else engRun.correct++;}
  $('eng-options').querySelectorAll('button').forEach((b,i)=>{
    b.disabled=true;const choice=p.choices[i];
    if(choice===p.target)b.classList.add('correct');else if(i===index)b.classList.add('wrong');
    if(p.kind==='food'||p.kind==='scene'){
      const word=p.kind==='food'?ENG_WORDS.find(w=>w.id===choice).word:ENG_SCENES.find(s=>s.id===choice).sentence;
      b.insertAdjacentHTML('beforeend',`<span class="answer-label" lang="en">${choice===p.target?'✓ ':i===index?'↻ ':''}${escapeHTML(word)}</span>`);
    }else if(choice===p.target)b.textContent='✓ '+choice;else if(i===index)b.textContent='↻ '+choice;
  });
  $('eng-feedback').className='feedback'+(ok?'':' miss');
  $('eng-feedback').textContent=(ok?'Muito bem! ':'Vamos conferir: ')+p.why+(engRun.assisted?' Questão feita com apoio escrito.':'');
  $('eng-feedback').hidden=false;$('eng-next').hidden=false;$('eng-bar').value=engRun.i+1;
}
function nextEnglish(){
  if(!engRun.answered)return;
  if(++engRun.i<engRun.items.length){loadEnglishQuestion();window.scrollTo(0,0);return;}
  const total=engRun.items.length,old=engRecords[engRun.topic];
  if(!old||engRun.correct>old.correct)engRecords[engRun.topic]={correct:engRun.correct,total};
  try{localStorage.setItem('julia-ingles-unit5-v1',JSON.stringify(engRecords));}catch{}
  $('eng-result-title').textContent='Treino de escuta concluído, Julia!';
  $('eng-result-score').textContent=`${engRun.correct} de ${total} acertos sem apoio escrito`;
  $('eng-result-note').textContent=`${engRun.assistedCorrect} acertos com apoio escrito. Ouça e repita as frases para continuar praticando.`;
  $('eng-again').onclick=startEnglishQuiz;screen('eng-result');
}
function startEnglishWriting(topic=null,completion=false){
  engWrite={topic,completion,items:(completion?ENG_COMPLETION:shuffle(ENG_WRITING)).filter(w=>!topic||w.topic===topic),i:0,first:0,done:false,assisted:false,tries:0};
  screen('eng-write');loadEnglishWriting();
}
function loadEnglishWriting(){
  stopEnglishAudio();const item=engWrite.items[engWrite.i];
  Object.assign(engWrite,{done:false,assisted:false,tries:0});
  $('eng-write-count').textContent=`Atividade ${engWrite.i+1} de ${engWrite.items.length} · página ${item.page}`;
  $('eng-write-prompt').textContent=item.prompt;
  $('eng-write-source').textContent=item.source;
  $('eng-write-clue').innerHTML=engWrite.completion?(item.scene?sceneHTML(item.scene):item.image?foodHTML(item.image):''):'';
  $('eng-write-prefix').textContent=item.prefix||'';$('eng-write-suffix').textContent=item.suffix||'';
  $('eng-write-line').classList.toggle('completion',!!engWrite.completion);
  $('eng-write-bank').textContent=engWrite.completion?'Palavras de apoio: '+(item.topic==='likes'?"likes · doesn’t like":item.topic==='got'?"potatoes · onions · mushrooms · pot · have · haven’t":ENG_WORDS.slice(0,8).map(w=>w.word).join(' · ')):'';
  $('eng-answer').placeholder=engWrite.completion?'…':'Escreva aqui…';
  $('eng-answer').value='';$('eng-answer').disabled=false;$('eng-check').disabled=false;$('eng-check').hidden=false;
  $('eng-answer').lang=item.prompt.includes('português')?'pt-BR':'en-GB';
  $('eng-write-feedback').hidden=true;$('eng-write-next').hidden=true;$('eng-copy').hidden=true;
  $('eng-write-picture').hidden=true;$('eng-write-playing').textContent='O áudio é opcional. Você já pode escrever sua resposta.';
  $('eng-write-picture').innerHTML=(item.image?foodHTML(item.image):'')+`<p>Modelo: <strong>${escapeHTML(item.model||item.target)}</strong></p>`;
  engStrokes=[];engPointer=null;
}
function playEnglishWriting(){speakEnglish(engWrite.items[engWrite.i].audio,$('eng-write-playing'));}
function hintEnglishWriting(){
  engWrite.assisted=true;$('eng-write-picture').hidden=false;
  $('eng-write-playing').textContent='Modelo aberto para comparar. Atividade com apoio.';
}
function normalizeEnglishAnswer(text){
 return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[.,!?;:]/g,'').trim().replace(/\s+/g,' ');
}
function checkEnglishWriting(){
  if(engWrite.done)return;
  const item=engWrite.items[engWrite.i],input=normalizeEnglishAnswer($('eng-answer').value);
  $('eng-write-feedback').hidden=false;
  if(!input){$('eng-write-feedback').textContent='Escreva sua resposta antes de conferir.';$('eng-write-feedback').className='feedback miss';return;}
  engWrite.tries++;
  const correct=item.answers.some(a=>normalizeEnglishAnswer(a)===input);
  $('eng-write-feedback').className='feedback'+(correct?'':' miss');
  if(!correct){
    engWrite.assisted=true;
    $('eng-write-feedback').textContent=`Compare com o modelo: ${item.model||item.target} Escreva no espaço: ${item.target}. Tente novamente. Outras traduções podem ser válidas; a conferência usa os modelos deste treino.`;
    return;
  }
  if(engWrite.tries===1&&!engWrite.assisted)engWrite.first++;
  engWrite.done=true;
  $('eng-write-feedback').textContent=`✓ Muito bem! ${item.model||item.target}`;
  $('eng-answer').disabled=true;$('eng-check').hidden=true;
  $('eng-copy-word').textContent=item.model||item.target;$('eng-copy').hidden=false;$('eng-write-next').hidden=false;
  $('eng-write-next').textContent=engWrite.i===engWrite.items.length-1?'Concluir meu treino →':'Próxima atividade →';
  requestAnimationFrame(resizeEnglishCanvas);
}
function nextEnglishWriting(){
  if(!engWrite.done)return;
  if(++engWrite.i<engWrite.items.length){loadEnglishWriting();window.scrollTo(0,0);return;}
  $('eng-result-title').textContent='Treino de escrita concluído!';
  $('eng-result-score').textContent=engWrite.items.length+' respostas escritas e conferidas';
  $('eng-result-note').textContent=`${engWrite.first} de primeira, sem modelo. A cópia à mão não foi corrigida automaticamente.`;
  $('eng-again').onclick=()=>startEnglishWriting(engWrite.topic,engWrite.completion);screen('eng-result');
}
const engCanvas=$('eng-canvas'),engCtx=engCanvas.getContext('2d');
let engStrokes=[],engPointer=null,engCW=0,engCH=0;
function resizeEnglishCanvas(){
  if(!$('eng-write').classList.contains('active')||$('eng-copy').hidden)return;
  const r=engCanvas.getBoundingClientRect(),scale=Math.min(window.devicePixelRatio||1,3);
  engCW=r.width;engCH=r.height;engCanvas.width=Math.round(engCW*scale);engCanvas.height=Math.round(engCH*scale);
  engCtx.setTransform(scale,0,0,scale,0,0);drawEnglishCanvas();
}
function drawEnglishCanvas(){
  engCtx.clearRect(0,0,engCW,engCH);engCtx.strokeStyle='#dce6e5';engCtx.lineWidth=1;
  for(let y=38;y<engCH;y+=38){engCtx.beginPath();engCtx.moveTo(14,y);engCtx.lineTo(engCW-14,y);engCtx.stroke();}
  engCtx.strokeStyle='#223f4b';engCtx.fillStyle='#223f4b';engCtx.lineWidth=3;engCtx.lineCap='round';engCtx.lineJoin='round';
  engStrokes.forEach(s=>{engCtx.beginPath();if(s.length===1){engCtx.arc(s[0].x*engCW,s[0].y*engCH,1.5,0,Math.PI*2);engCtx.fill();}else{engCtx.moveTo(s[0].x*engCW,s[0].y*engCH);s.slice(1).forEach(p=>engCtx.lineTo(p.x*engCW,p.y*engCH));engCtx.stroke();}});
}
function englishPoint(e){const r=engCanvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};}
engCanvas.addEventListener('pointerdown',e=>{if(engPointer!==null||e.isPrimary===false)return;e.preventDefault();engPointer=e.pointerId;engCanvas.setPointerCapture(e.pointerId);engStrokes.push([englishPoint(e)]);drawEnglishCanvas();});
engCanvas.addEventListener('pointermove',e=>{if(engPointer!==e.pointerId)return;e.preventDefault();const list=e.getCoalescedEvents?e.getCoalescedEvents():[e];(list.length?list:[e]).forEach(ev=>engStrokes[engStrokes.length-1].push(englishPoint(ev)));drawEnglishCanvas();});
function endEnglishStroke(e){if(engPointer!==e.pointerId)return;engPointer=null;if(engCanvas.hasPointerCapture(e.pointerId))engCanvas.releasePointerCapture(e.pointerId);}
engCanvas.addEventListener('pointerup',endEnglishStroke);engCanvas.addEventListener('pointercancel',endEnglishStroke);engCanvas.addEventListener('lostpointercapture',()=>engPointer=null);engCanvas.addEventListener('contextmenu',e=>e.preventDefault());
new ResizeObserver(resizeEnglishCanvas).observe(engCanvas.parentElement);
$('eng-undo').onclick=()=>{engStrokes.pop();drawEnglishCanvas();};$('eng-clear').onclick=()=>{engStrokes=[];drawEnglishCanvas();};
$('subject-pt').onclick=()=>screen('home');$('subject-en').onclick=englishHome;
document.querySelectorAll('[data-subjects]').forEach(b=>b.onclick=()=>screen('subjects'));
document.querySelectorAll('[data-english]').forEach(b=>b.onclick=englishHome);
document.querySelectorAll('[data-eng-learn]').forEach(b=>b.onclick=()=>startEnglishWriting(b.dataset.engLearn,true));
$('eng-listen-start').onclick=startEnglishQuiz;$('eng-play').onclick=playEnglishQuestion;
$('eng-transcript-button').onclick=showEnglishTranscript;$('eng-next').onclick=nextEnglish;
$('eng-dictation').onclick=()=>startEnglishWriting();
$('eng-writing-start').onclick=()=>startEnglishWriting(engTopic);$('eng-write-play').onclick=playEnglishWriting;
$('eng-write-hint').onclick=hintEnglishWriting;$('eng-check').onclick=checkEnglishWriting;$('eng-write-next').onclick=nextEnglishWriting;
$('eng-answer').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkEnglishWriting();}});
if(englishSynth)englishSynth.addEventListener('voiceschanged',populateVoices);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEnglishAudio();});
populateVoices();renderEnglishRecords();
