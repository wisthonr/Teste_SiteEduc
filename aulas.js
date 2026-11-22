/* Aulas curtas com exemplos próprios; não leem nem preenchem respostas da criança. */
const Aulas = (() => {
  let dialog, lesson, position=0, playing=false, sound=false, waiting=false, timer, fallback, generation=0, returnFocus, audio, speed=1;
  try {const saved=Number(window.localStorage.getItem('aulas-ritmo-v1'));if([.9,1,1.15].includes(saved))speed=saved;} catch {}
  const speedLabel=()=>`Ritmo: ${speed===1?'normal':speed>1?'mais rápido':'mais calmo'}`;
  const canNarrate=()=>typeof window.Audio==='function'||!!window.speechSynthesis;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const repeat=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join('');
  const dots=(n)=>repeat(n,i=>`<i class="lesson-dot" style="--i:${i}" aria-hidden="true"></i>`);
  function scene(s) {
    if(s.type==='packages') return `<div class="lesson-packages">${s.values.map((n,i)=>`<div class="lesson-package" style="--i:${i}"><img src="assets/openmoji/1F4E6.svg" alt="Caixa de lápis"><strong>${n}</strong><span>lápis</span></div>`).join('<span class="lesson-plus">+</span>')}${s.out?`<p>↗ Entregamos ${s.out} lápis.</p>`:''}</div>`;
    if(s.type==='blocks') return `<div class="lesson-blocks"><section class="${s.highlight==='tens'?'lesson-glow':''}"><h3>Dezenas</h3><div class="lesson-bars" aria-label="${s.tens} dezenas${s.removeTens?`, retirando ${s.removeTens}`:''}">${repeat(s.tens,i=>`<span class="lesson-ten ${i<s.removeTens?'lesson-removed':''}" style="--i:${i}" aria-hidden="true">${repeat(10,()=>'<i></i>')}</span>`)}</div><small>Uma barrinha vale 10.</small></section><section class="${s.highlight==='units'?'lesson-glow':''}"><h3>Unidades</h3><div class="lesson-units ${s.bundle?'lesson-bundling':''}" aria-label="${s.units} unidades${s.removeUnits?`, retirando ${s.removeUnits}`:''}">${repeat(s.units,i=>`<i class="lesson-unit ${i<s.removeUnits?'lesson-removed':''} ${s.bundle&&i<10?'lesson-bundle':''}" style="--i:${i}" aria-hidden="true"></i>`)}</div><small>Um quadradinho vale 1.</small></section></div>`;
    if(s.type==='groups') return `<div class="lesson-groups" style="--groups:${s.groups}">${repeat(s.groups,i=>`<section class="lesson-bowl"><h3>Caixa ${i+1}</h3><div class="lesson-dots" aria-label="${s.filled===undefined||i<s.filled?s.each:0} bolinhas">${dots(s.filled===undefined||i<s.filled?s.each:0)}</div>${s.labels?`<strong>${s.each} bolinhas</strong>`:''}</section>`)}</div>${s.remaining!==undefined?`<div class="lesson-basket"><span>Ainda na cesta</span><div class="lesson-dots" aria-label="${s.remaining} bolinhas">${dots(s.remaining)}</div></div>`:''}`;
    if(s.type==='sequence')return `<div class="lesson-sequence">${s.values.map((n,i)=>`${i&&s.jump?`<span class="lesson-jump">+${s.jump} →</span>`:''}<span class="lesson-car" style="--i:${i}">${n}</span>`).join('')}</div>`;
    if(s.type==='column') {
      const row=n=>`<span>${Math.floor(n/10)}</span><span>${n%10}</span>`;
      return `<div class="lesson-column" aria-label="Conta de exemplo ${s.a} ${s.op} ${s.b} igual a ${s.result}"><div><span></span><b>D</b><b>U</b></div><div class="lesson-marks"><span></span><span>${s.carry?'＋1':Math.floor(s.a/10)-1}</span><span>${s.borrow?10+s.a%10:''}</span></div><div class="${s.borrow?'lesson-old-digits':''}"><span></span>${row(s.a)}</div><div><b>${s.op}</b>${row(s.b)}</div><div class="lesson-result"><b>=</b>${row(s.result)}</div></div>`;
    }
    return '';
  }
  function stop() {
    generation++;clearTimeout(timer);clearTimeout(fallback);
    if(audio){audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();}
    if(sound&&window.speechSynthesis)window.speechSynthesis.cancel();
  }
  function controls() {
    if(!dialog)return;
    const play=dialog.querySelector('[data-lesson="play"]');
    play.textContent=playing?'Ⅱ Pausar':waiting?'Continuar a aula →':position===lesson.steps.length-1?'▶ Rever este passo':'▶ Reproduzir';
    play.setAttribute('aria-pressed',String(playing));
    dialog.querySelector('.lesson-status').textContent=waiting?'Sua vez de pensar. Continue quando estiver pronta.':playing?'Acompanhe a animação.':'No seu tempo. Você pode avançar ou repetir.';
  }
  function render() {
    const current=lesson.steps[position];
    const focused=document.activeElement?.dataset?.lesson;
    dialog.innerHTML=`<div class="lesson-top"><span>UMA CONTA DE EXEMPLO</span><button data-lesson="close" aria-label="Fechar aula e voltar à atividade">✕ Voltar</button></div>
      <h2 id="lesson-title">${esc(lesson.title)}</h2><p class="lesson-example">Exemplo ${esc(lesson.example)}</p><details class="book-reference"><summary>📖 Apostila · ${esc(lesson.reference.label)}</summary><p>${esc(lesson.reference.note)}</p></details>
      <div class="lesson-progress" aria-label="Passo ${position+1} de ${lesson.steps.length}">${lesson.steps.map((_,i)=>`<i class="${i<=position?'lesson-filled':''}"></i>`).join('')}<span>${position+1}/${lesson.steps.length}</span></div>
      <div class="lesson-screen"><h3>${esc(current.title)}</h3><div class="lesson-scene">${scene(current.scene)}</div><p class="lesson-equation">${esc(current.equation)}</p></div>
      <p class="lesson-caption" aria-live="polite">${esc(current.narration)}</p><p class="lesson-status" role="status"></p>
      <div class="lesson-controls"><button data-lesson="previous" ${position===0?'disabled':''}>← Anterior</button><button data-lesson="play" class="lesson-primary"></button><button data-lesson="next" ${position===lesson.steps.length-1?'disabled':''}>Próximo →</button></div>
      <div class="lesson-options"><button data-lesson="restart">↶ Recomeçar aula</button><button data-lesson="sound" aria-pressed="${sound}" ${!canNarrate()?'disabled':''}>${sound?'🔊 Voz ligada':'🔈 Ouvir explicação'}</button><button data-lesson="pace" aria-label="Mudar ritmo da narração" ${!canNarrate()?'disabled':''}>${speedLabel()}</button></div><p class="lesson-voice-note">Narração com voz sintética. Use “Ritmo” para ouvir mais rápido ou mais devagar.</p>`;
    controls();
    if(focused) {
      const next=dialog.querySelector(`[data-lesson="${focused}"]`);
      (next&&!next.disabled?next:dialog.querySelector('[data-lesson="play"]'))?.focus({preventScroll:true});
    }
  }
  function schedule() {
    stop();
    const id=generation, current=lesson.steps[position];
    let finished=false;
    function finish() {
      if(finished||id!==generation||!dialog.open||!playing)return;
      finished=true;clearTimeout(fallback);
      timer=setTimeout(()=>{
        if(id!==generation||!playing)return;
        if(current.pause||position===lesson.steps.length-1){playing=false;waiting=current.pause;controls();}
        else {position++;render();schedule();}
      },sound?350:0);
    }
    function speakWithDevice() {
      if(id!==generation||!dialog.open||!playing)return;
      clearTimeout(fallback);
      if(audio){audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();}
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
        playing=false;controls();dialog.querySelector('.lesson-status').textContent='Não foi possível carregar a voz. Toque em Reproduzir para tentar de novo.';return;
      }
      const utterance=new SpeechSynthesisUtterance(current.narration);
      utterance.lang='pt-BR';utterance.rate=speed;
      const voices=window.speechSynthesis.getVoices();
      const score=v=>(/^pt[-_]BR$/i.test(v.lang)?100:0)+(/premium|enhanced|aprimorada|natural|neural/i.test(v.name||'')?20:0);
      const voice=voices.filter(v=>/^pt/i.test(v.lang)).sort((a,b)=>score(b)-score(a))[0];
      if(voice)utterance.voice=voice;
      utterance.onend=finish;
      utterance.onerror=()=>{if(id===generation){stop();sound=false;playing=false;render();dialog.querySelector('.lesson-status').textContent='A voz não está disponível agora. Você pode ler a explicação.';}};
      dialog.querySelector('.lesson-voice-note').textContent='Áudio indisponível: usando a voz deste aparelho. Você também pode ler a explicação.';
      fallback=setTimeout(()=>{if(id===generation){stop();playing=false;controls();dialog.querySelector('.lesson-status').textContent='A narração parou. Toque em Reproduzir para tentar de novo.';}},45000);
      window.speechSynthesis.speak(utterance);
    }
    const recording=typeof LessonAudio!=='undefined'?LessonAudio[current.narration]:null;
    if(sound&&recording&&typeof window.Audio==='function') {
      // Um único player conserva a permissão de reprodução obtida pelo toque no iPad.
      if(!audio){audio=new window.Audio();audio.hidden=true;document.body.appendChild(audio);}
      audio.preload='auto';audio.setAttribute('playsinline','');audio.preservesPitch=true;
      audio.src=recording.src;audio.playbackRate=speed;
      let failed=false;
      function failedRecording(error) {
        if(failed||id!==generation||!dialog.open||!playing)return;
        failed=true;clearTimeout(fallback);
        if(error?.name==='NotAllowedError') {
          stop();playing=false;controls();dialog.querySelector('.lesson-status').textContent='Toque em Reproduzir para ouvir a explicação.';
        } else speakWithDevice();
      }
      audio.onended=finish;audio.onerror=failedRecording;
      audio.onplaying=()=>{if(id===generation)clearTimeout(fallback);};
      fallback=setTimeout(()=>failedRecording(),20000);
      try {audio.play()?.catch(failedRecording);} catch(error){failedRecording(error);}
    } else if(sound) speakWithDevice();
    else timer=setTimeout(finish,Math.max(6500,current.narration.split(/\s+/).length*400));
  }
  function navigate(next) {stop();playing=false;waiting=false;position=Math.max(0,Math.min(lesson.steps.length-1,next));render();}
  function ensureDialog() {
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.className='lesson-dialog';dialog.setAttribute('aria-labelledby','lesson-title');document.body.appendChild(dialog);
    dialog.addEventListener('click',event=>{
      const action=event.target.closest('[data-lesson]');if(!action||action.disabled)return;
      switch(action.dataset.lesson) {
        case 'close':dialog.close();break;
        case 'previous':navigate(position-1);break;
        case 'next':navigate(position+1);break;
        case 'restart':navigate(0);break;
        case 'play':
          if(playing){stop();playing=false;controls();}
          else {if(waiting){position=Math.min(position+1,lesson.steps.length-1);waiting=false;render();}playing=true;controls();schedule();}
          break;
        case 'sound':
          stop();sound=!sound;playing=true;waiting=false;render();schedule();break;
        case 'pace':
          speed=speed===1?1.15:speed===1.15?.9:1;
          try {window.localStorage.setItem('aulas-ritmo-v1',String(speed));} catch {}
          action.textContent=speedLabel();
          if(playing&&sound){if(audio&&!audio.paused)audio.playbackRate=speed;else schedule();}
          break;
      }
    });
    dialog.addEventListener('close',()=>{stop();playing=false;returnFocus?.focus({preventScroll:true});});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open){stop();playing=false;controls();}});
  }
  function open(topic,context={}) {
    ensureDialog();stop();returnFocus=document.activeElement;lesson=LessonData.create(topic,context);position=0;playing=false;waiting=false;render();if(!dialog.open)dialog.showModal();
  }
  return {open};
})();
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-aula]');if(trigger)Aulas.open(trigger.dataset.aula);
});
