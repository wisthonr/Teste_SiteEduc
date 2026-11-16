(() => {
  const app = document.querySelector('#app');
  const key = 'jardim-portugues-v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch { state = {}; }
  if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
  let unit = null;
  let question = 0;
  let observer;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save() {
    const progress = app.querySelector('progress');
    if (progress && unit !== null) progress.value = session().answers.filter(a => a?.done).length;
    try { localStorage.setItem(key, JSON.stringify(state)); document.querySelector('#saved').textContent = 'Seu caderno está guardado neste aparelho.'; }
    catch { document.querySelector('#saved').textContent = 'Não foi possível guardar. Mantenha esta página aberta para continuar.'; }
  }
  function session() {
    if (!state[unit] || !Array.isArray(state[unit].answers)) state[unit] = {round:0, answers:[]};
    return state[unit];
  }
  function lesson() {
    const current = session();
    return Number.isInteger(current.practiceRound) ? portuguesePractice(unit, current.practiceRound) : PT[unit];
  }
  function nextRound(current = {}) {
    return {round: (current.round || 0) + 1, practiceRound: (current.practiceRound ?? -1) + 1, answers: []};
  }
  function tasks() { if (Number.isInteger(session().practiceRound)) return lesson().tasks; const data = PT[unit]; return session().round % 2 ? [...data.extra, ...data.tasks.slice(data.extra.length)] : data.tasks; }
  function answer() { const s = session(); return s.answers[question] ||= {strokes:[],text:'',choice:null,done:false}; }
  function top() { window.scrollTo({top:0,behavior:'instant'}); }
  function home() {
    observer?.disconnect(); unit = null;
    app.innerHTML = `<section class="intro"><img src="assets/openmoji/1F98B.svg" alt="Borboleta"><p>LER · DESCOBRIR · ESCREVER</p><h1>Vamos brincar<br>com as palavras?</h1><p>Escolha um caminho para começar.</p></section><section class="garden" aria-label="Caminhos de estudo">${PT.map((d,i)=>`<button class="trail" data-unit="${i}"><img src="assets/openmoji/${d.icon}.svg" alt=""><strong>${escape(d.title)}</strong><small>${state[i]?.answers?.filter(a=>a?.done).length || 0} atividades conferidas</small></button>`).join('')}</section>`;
    app.insertAdjacentHTML('beforeend', `<div class="adult-tools"><button id="new-round-all">Para o adulto · Outra rodada em tudo</button></div>`);
    document.querySelector('#new-round-all').onclick = () => {
      const confirmed = confirm('Começar outra rodada em todos os caminhos? As respostas, os desenhos e as marcações deste caderno serão apagados neste aparelho. Todos os caminhos receberão novas propostas. São seis rodadas de variações; depois o ciclo recomeça.');
      if (!confirmed) return;
      PT.forEach((data, index) => {
        state[index] = nextRound(state[index]);
      });
      save();
      home();
      top();
    };
    app.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => {unit=Number(b.dataset.unit);question=0;render();top();});
  }
  function render() {
    observer?.disconnect();
    const data = lesson(), list = tasks(), a = answer(), t = list[question];
    app.innerHTML = `<div class="row"><button id="back-home">← Caminhos</button><span class="muted">${question+1} de ${list.length}</span></div><progress value="${session().answers.filter(x=>x?.done).length}" max="${list.length}" aria-label="Atividades conferidas"></progress><h1>${escape(data.title)}</h1><details class="reading" ${question===0?'open':''}><summary>📖 ${escape(data.intro)}</summary><div class="poem">${escape(data.text)}</div>${data.source?`<p class="muted">${escape(data.source)}</p>`:''}<p class="muted">Baseado nas páginas ${data.pages} da apostila.</p></details><section class="paper">${unit===3 && !Number.isInteger(session().practiceRound)?'<div class="sizes" aria-label="Sapos pequeno, médio e grande"><img src="assets/openmoji/1F438.svg" alt="Sapo pequeno"><img src="assets/openmoji/1F438.svg" alt="Sapo médio"><img src="assets/openmoji/1F438.svg" alt="Sapo grande"></div>':''}<h2>${escape(t[0])}</h2>${t[1]?`<div class="choices">${t[1].map((v,i)=>`<button class="choice" data-choice="${i}" aria-pressed="${a.choice===i}">${escape(v)}</button>`).join('')}</div>`:`<p class="muted">Escreva com a caneta. Pode ir bem devagar.</p><canvas class="writing" aria-label="Folha para escrever sua resposta com a caneta"></canvas><div class="tools"><button id="undo">↶ Desfazer</button><button id="clear">Apagar folha</button></div><details class="keyboard"><summary>⌨ Digitar</summary><label for="typed">Sua resposta</label><textarea id="typed" lang="pt-BR" spellcheck="false" autocorrect="off">${escape(a.text)}</textarea></details>`}<div class="next"><button class="primary" id="check">${t[1]?'Conferir resposta':'Conferir com uma pista'}</button></div><div id="feedback" role="status"></div></section><div class="row"><button id="prev" ${question===0?'disabled':''}>← Voltar</button><button class="primary" id="next">${question===list.length-1?'Terminar caminho 🌼':'Próxima →'}</button></div>`;
    document.querySelector('#back-home').onclick = () => {home();top();};
    document.querySelector('#prev').onclick = () => {question--;render();top();};
    document.querySelector('#next').onclick = () => {if(question===list.length-1) finish();else {question++;render();top();}};
    app.querySelectorAll('[data-choice]').forEach(b => b.onclick = () => {
      a.choice=Number(b.dataset.choice);a.done=false;save();
      app.querySelectorAll('[data-choice]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
      document.querySelector('#feedback').innerHTML='';
    });
    document.querySelector('#check').onclick = () => {
      const feedback=document.querySelector('#feedback');
      if(t[1]) {
        if(a.choice===null) {feedback.innerHTML='<p class="feedback">Toque em uma resposta primeiro.</p>';return;}
        const correct=a.choice===t[2];a.done=correct;
        feedback.innerHTML=`<p class="feedback ${correct?'good':''}">${correct?'🌼 Isso mesmo!':'Vamos olhar de novo?'} ${escape(t[3])}</p>`;
      } else {
        if(!a.strokes.length && !a.text.trim()) {feedback.innerHTML='<p class="feedback">Experimente escrever ou desenhar sua ideia primeiro.</p>';return;}
        feedback.innerHTML=`<div class="feedback"><strong>Vamos comparar juntos?</strong><p>${escape(t[2])}</p><p class="muted">Olhe sua escrita. Falta alguma letra, espaço ou ponto?</p><button id="reviewed">Já revisei 🌼</button></div>`;
        document.querySelector('#reviewed').onclick=()=>{a.done=true;save();feedback.innerHTML='<p class="feedback good">🌼 Revisão registrada. Você pode continuar escrevendo ou seguir.</p>';};
      }
      save();
    };
    if(!t[1]) {
      document.querySelector('#typed').oninput=e=>{a.text=e.target.value;a.done=false;save();};
      setupInk(a);
    }
  }
  function setupInk(a) {
    const canvas=app.querySelector('canvas'),ctx=canvas.getContext('2d');let active=null,line=null;
    if(!Array.isArray(a.strokes)) a.strokes=[];
    function draw() {
      const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
      canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.scale(dpr,dpr);
      ctx.strokeStyle='#264b76';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
      for(const stroke of a.strokes) {if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(stroke[0][0]*r.width,stroke[0][1]*r.height);for(const p of stroke.slice(1))ctx.lineTo(p[0]*r.width,p[1]*r.height);if(stroke.length===1)ctx.lineTo(stroke[0][0]*r.width+.1,stroke[0][1]*r.height+.1);ctx.stroke();}
    }
    function point(e) {const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];}
    canvas.onpointerdown=e=>{if(e.pointerType==='touch'||active!==null||e.button>0)return;e.preventDefault();active=e.pointerId;canvas.setPointerCapture(active);line=[point(e)];a.strokes.push(line);a.done=false;draw();};
    canvas.onpointermove=e=>{if(e.pointerId!==active)return;e.preventDefault();for(const p of (e.getCoalescedEvents?.()||[e]))line.push(point(p));draw();};
    function end(e) {if(e.pointerId!==active)return;active=null;line=null;save();}
    canvas.onpointerup=end;canvas.onpointercancel=end;canvas.onlostpointercapture=end;
    document.querySelector('#undo').onclick=()=>{a.strokes.pop();a.done=false;draw();save();};
    document.querySelector('#clear').onclick=()=>{if(a.strokes.length && confirm('Apagar os traços desta resposta?')){a.strokes=[];a.done=false;draw();save();}};
    observer=new ResizeObserver(draw);observer.observe(canvas);draw();
  }
  function finish() {
    observer?.disconnect();const s=session(),count=s.answers.filter(a=>a?.done).length;
    app.innerHTML=`<section class="celebrate"><img src="assets/openmoji/1F98B.svg" alt="Borboleta"><h1>Mais palavras no seu jardim!</h1><p>Você conferiu ${count} de ${tasks().length} atividades deste caminho.</p><p>Você pode voltar, continuar ou praticar outra rodada.</p><div class="tools"><button id="return">Rever atividades</button><button id="again">Outra rodada</button><button class="primary" id="garden">Escolher caminho</button></div></section>`;
    document.querySelector('#return').onclick=()=>{question=0;render();top();};
    document.querySelector('#garden').onclick=()=>{home();top();};
    document.querySelector('#again').onclick=()=>{if(confirm('Começar outra rodada? As respostas deste caminho serão apagadas.')){state[unit]=nextRound(s);question=0;save();render();top();}};top();
  }
  document.querySelector('#home').onclick=e=>{e.preventDefault();home();top();};
  document.querySelector('#help').onclick=()=>document.querySelector('#guide').showModal();
  document.querySelector('#close-help').onclick=()=>document.querySelector('#guide').close();
  home();
})();
