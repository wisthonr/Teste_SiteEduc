(() => {
  const root = document.getElementById('cargo-game');
  const storage = document.getElementById('storage');
  const key = 'expresso-cargas-v1';
  const model = CargoGame;
  let book;
  try {book = JSON.parse(localStorage.getItem(key) || '{}');} catch {book = {};}
  if (!book || typeof book !== 'object' || Array.isArray(book)) book = {};
  book.round = Number.isInteger(book.round) && book.round >= 0 ? book.round : 0;
  book.level = Number.isInteger(book.level) && book.level >= 0 && book.level < 6 ? book.level : 0;
  if (!book.states || typeof book.states !== 'object') book.states = {};
  let level, state, selected = null, drag = null, recent = null;
  let showHint = false, report = null, message = '', suppressClickUntil = 0;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save() {
    book.states[book.level] = state;
    try {localStorage.setItem(key, JSON.stringify(book)); storage.textContent = 'Partida guardada neste aparelho.';}
    catch {storage.textContent = 'Não foi possível guardar. Mantenha a página aberta para continuar.';}
  }
  function load() {
    level = model.makeLevel(book.level, book.round);
    state = model.restore(level, book.states[book.level]);
    selected = null; recent = null; showHint = false; report = null; message = '';
    save(); render();
  }
  function piece(id) {
    const item = level.pieces[id];
    return `<button class="cargo ${selected===id?'selected':''} ${recent===id?'arrived':''}" data-piece="${id}" aria-pressed="${selected===id}" aria-label="${level.sequence?'Número':'Caixa com'} ${item.value}${selected===id?', selecionada':''}" ${state.done?'disabled':''}><img src="assets/openmoji/${level.sequence?'1F48C':'1F4E6'}.svg" alt="" draggable="false"><strong>${item.value}</strong></button>`;
  }
  function render() {
    const loads = model.totals(level,state);
    const completed = Object.values(book.states).filter(s=>s.done).length;
    root.innerHTML = `<nav class="levels" aria-label="Fases do jogo">${Array.from({length:6},(_,i)=>`<button data-action="level" data-index="${i}" aria-label="Fase ${i+1}" ${i===book.level?'aria-current="step"':''}>${book.states[i]?.done?'✓':i+1}</button>`).join('')}<span>${completed}/6 entregas</span></nav>
      <section class="brief"><span class="eyebrow">Fase ${book.level+1} · ${['Combinar','Repartir','Ordenar','Subtrair','Multiplicar','Desafio final'][book.level]}</span><h1>${escape(level.title)}</h1><p>${escape(level.prompt)}</p></section>
      <div class="guidance"><span>${selected===null?'Arraste uma caixa até o vagão.':`Caixa ${level.pieces[selected].value} selecionada. Toque em “Colocar aqui”.`}</span><button data-action="hint" aria-expanded="${showHint}">💡 Pista</button><button data-action="lesson">▶ Aula de exemplo</button></div>
      ${showHint?`<p class="hint">${escape(level.hint)}</p>`:''}
      <section class="train ${level.sequence?'sequence':''} ${state.done?'departed':''}" aria-label="Vagões de entrega">
        <img class="engine" src="assets/openmoji/1F682.svg" alt="Locomotiva" draggable="false">
        <div class="wagons" style="--zones:${level.zones.length}">${level.zones.map((zone,i)=>`<section class="wagon zone-${i}" data-zone="${i}" aria-label="${escape(zone.label)}">
          <h2>${escape(zone.label)}</h2><p class="goal">${zone.showTarget?`Pedido <strong>${zone.target}</strong>`:`${zone.count} ${level.sequence?'número':'caixas'}`}</p>
          <div class="cargo-slots">${level.pieces.filter(p=>state.places[p.id]===i).map(p=>piece(p.id)).join('')}</div>
          <button class="drop-button" data-action="drop" data-zone="${i}" ${state.done?'disabled':''}>${loads[i].count>=zone.count?'Vagão cheio':'Colocar aqui'}</button>
          <small>${loads[i].count}/${zone.count} ${level.sequence?'número':'caixas'}</small>
          ${report?`<p class="zone-feedback ${report.reports[i].ok?'ok':''}">${escape(report.reports[i].text)}</p>`:''}
        </section>`).join('')}</div>
      </section>
      <section class="depot" data-zone="-1" aria-label="Depósito"><div class="depot-head"><h2>${level.sequence?'Bilhetes disponíveis':'Depósito de caixas'}</h2><button data-action="drop" data-zone="-1" ${state.done?'disabled':''}>Devolver aqui</button></div><div class="supply">${level.order.filter(id=>state.places[id]===-1).map(piece).join('')||'<span class="empty">Todas as caixas embarcaram.</span>'}</div></section>
      <div class="controls"><button data-action="undo" ${!state.history.length||state.done?'disabled':''}>↶ Desfazer</button><button class="primary" data-action="check" ${state.done?'disabled':''}>Conferir carga</button></div>
      <p class="message" role="status">${escape(message)}</p>
      ${state.done?`<section class="victory" role="status"><img src="assets/openmoji/2728.svg" alt=""><h2>Entrega pronta!</h2><p>${completed===6?'Você resolveu os seis desafios do piquenique!':'As quantidades e o número de caixas estão certos.'}</p><button class="primary" data-action="next">${completed===6?'Ver minha conquista':'Próxima missão →'}</button></section>`:''}
      <div class="adult"><button data-action="restart">Recomeçar esta fase</button><button data-action="new-round">Adulto · Nova partida</button><span>12 partidas com valores diferentes, depois o ciclo recomeça.</span></div>`;
    recent = null;
  }
  function movePiece(id, destination) {
    if(state.places[id]===destination){selected=null;message='A caixa continuou no mesmo lugar.';render();return;}
    if (!model.move(level,state,id,destination)) {
      message = destination>=0 ? 'Para trocar a carga de um vagão cheio, devolva uma caixa ao depósito primeiro.' : 'Escolha uma caixa de um vagão para devolver.';
      render(); return;
    }
    recent = id; selected = null; report = null;
    message = destination===-1 ? 'Caixa de volta ao depósito.' : `Caixa ${level.pieces[id].value} no vagão ${level.zones[destination].label}.`;
    save(); render();
  }
  root.addEventListener('click',event=>{
    if (performance.now() < suppressClickUntil) return;
    const card = event.target.closest('[data-piece]');
    if(card && !state.done) {
      const id=Number(card.dataset.piece);
      selected=selected===id?null:id;message='';render();
      root.querySelector(`[data-piece="${id}"]`)?.focus({preventScroll:true});return;
    }
    const button=event.target.closest('[data-action]');
    if(!button || button.disabled) return;
    switch(button.dataset.action) {
      case 'drop':
        if(selected===null){message='Primeiro toque em uma caixa ou arraste uma até aqui.';render();}
        else movePiece(selected,Number(button.dataset.zone));
        break;
      case 'hint':showHint=!showHint;render();break;
      case 'lesson':Aulas.open(['soma','divisao','sequencia','subtracao','dobro','multiplicacao'][book.level]);break;
      case 'undo':
        model.undo(state);selected=null;report=null;message='Último movimento desfeito.';save();render();break;
      case 'check':
        report=model.check(level,state);state.done=report.ok;
        message=report.ok?'O trem está pronto para partir!':'Veja a dica em cada vagão e ajuste as caixas.';
        save();render();
        root.querySelector(state.done?'.victory':'.zone-feedback:not(.ok)')?.scrollIntoView({block:'nearest',behavior:'smooth'});
        break;
      case 'level':save();book.level=Number(button.dataset.index);load();window.scrollTo(0,0);break;
      case 'next': {
        const pending=Array.from({length:6},(_,i)=>(book.level+i+1)%6).find(i=>!book.states[i]?.done);
        if(pending===undefined) {
          message='🏅 Seis entregas completas! Use “Nova partida” para jogar com outros valores.';
          render();root.querySelector('.adult').scrollIntoView({block:'nearest',behavior:'smooth'});
        } else {book.level=pending;load();window.scrollTo(0,0);}
        break;
      }
      case 'restart':
        if(confirm('Devolver todas as caixas desta fase ao depósito?')){state=model.empty(level);selected=null;report=null;message='Vamos tentar outra estratégia.';save();render();}
        break;
      case 'new-round':
        if(confirm('Começar uma nova partida com outros valores? As caixas e conquistas desta partida serão reiniciadas.')) {
          book={round:book.round+1,level:0,states:{}};load();window.scrollTo(0,0);
        }
        break;
    }
  });
  function targetAt(x,y) {return document.elementFromPoint(x,y)?.closest('[data-zone]');}
  function clearDrag() {
    if(!drag)return;
    const previous=drag;drag=null;
    cancelAnimationFrame(previous.frame);
    previous.ghost?.remove();previous.element.classList.remove('lifting');
    root.querySelectorAll('.drop-hover').forEach(el=>el.classList.remove('drop-hover'));
    if(previous.element.hasPointerCapture(previous.pointer))previous.element.releasePointerCapture(previous.pointer);
  }
  function positionGhost() {
    if(!drag?.ghost)return;
    drag.ghost.style.left=`${drag.x-drag.offsetX}px`;
    drag.ghost.style.top=`${drag.y-drag.offsetY}px`;
    root.querySelectorAll('.drop-hover').forEach(el=>el.classList.remove('drop-hover'));
    targetAt(drag.x,drag.y)?.classList.add('drop-hover');
  }
  function scrollWhileDragging() {
    if(!drag?.moved)return;
    if(drag.y<75)window.scrollBy(0,-8);
    else if(drag.y>window.innerHeight-75)window.scrollBy(0,8);
    positionGhost();drag.frame=requestAnimationFrame(scrollWhileDragging);
  }
  root.addEventListener('pointerdown',event=>{
    const card=event.target.closest('[data-piece]');
    if(!card || state.done || drag || event.button>0 || !event.isPrimary)return;
    const rect=card.getBoundingClientRect();
    drag={id:Number(card.dataset.piece),element:card,pointer:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,moved:false};
    card.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.pointer)return;
    drag.x=event.clientX;drag.y=event.clientY;
    if(!drag.moved && Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>7) {
      drag.moved=true;selected=null;
      drag.ghost=drag.element.cloneNode(true);drag.ghost.classList.add('drag-ghost');
      drag.ghost.setAttribute('aria-hidden','true');drag.ghost.removeAttribute('data-piece');
      drag.ghost.style.width=`${drag.element.getBoundingClientRect().width}px`;
      drag.element.classList.add('lifting');document.body.appendChild(drag.ghost);
      drag.frame=requestAnimationFrame(scrollWhileDragging);
    }
    if(drag.moved){event.preventDefault();positionGhost();}
  });
  root.addEventListener('pointerup',event=>{
    if(!drag || event.pointerId!==drag.pointer)return;
    const {id,moved}=drag;
    const target=targetAt(event.clientX,event.clientY);
    clearDrag();
    if(!moved)return;
    suppressClickUntil=performance.now()+400;
    if(target)movePiece(id,Number(target.dataset.zone));
    else {message='Solte dentro de um vagão ou do depósito. A caixa voltou ao lugar.';render();}
  });
  root.addEventListener('pointercancel',event=>{if(drag?.pointer===event.pointerId)clearDrag();});
  root.addEventListener('lostpointercapture',event=>{if(drag?.pointer===event.pointerId)clearDrag();});
  window.addEventListener('blur',clearDrag);
  document.getElementById('help').onclick=()=>document.getElementById('help-dialog').showModal();
  document.getElementById('close-help').onclick=()=>document.getElementById('help-dialog').close();
  load();
})();
