function iniciarExpresso(){
  let stops;
  const W=Oficina, game=document.getElementById('game');
  const by=id=>document.getElementById(id);
  const escape=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  const key='expresso-piquenique-v1';
  let book={}, stop, job, sheet, message='', observer, focusReturn;
  try{book=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
  if (typeof book !== 'object' || Array.isArray(book)) book = {};
  stops = ExpressoRounds.create(Number.isInteger(book.round) ? book.round : 0);
  let numberTarget, replaceNumber=false;
  function save(){
    try{localStorage.setItem(key,JSON.stringify(book));by('storage-note').textContent='Atividades guardadas neste navegador.';}
    catch{by('storage-note').textContent='O navegador não conseguiu guardar estas atividades.';}
  }
  function entry(s,j){return (book[s.id]||={})[j.id]||=( {} );}
  function completed(s){return s.jobs.filter(j=>book[s.id]?.[j.id]?.done).length;}
  function first(s){return s.jobs.find(j=>!book[s.id]?.[j.id]?.done)||s.jobs[0];}
  function url(s,j){return `#${s.id}/${(j||first(s)).id}`;}
  function destination(){
    if(book.last){
      const s=stops.find(s=>s.id===book.last[0]);
      if(s&&completed(s)<s.jobs.length){
        const j=s.jobs.find(j=>j.id===book.last[1]&&!book[s.id]?.[j.id]?.done);
        return url(s,j);
      }
    }
    const next=stops.find(s=>completed(s)<s.jobs.length);
    return next?url(next):'#bilhete';
  }
  function icon(s){return `<span class="tile-icon ${s.color}" aria-hidden="true">${s.icon}</span>`;}
  function stamps(){return stops.filter(s=>completed(s)===s.jobs.length).length;}
  const meter=(n,total)=>`<span class="pips" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</span>`;
  function map(){
    game.innerHTML=`<section class="hero">
      <div class="hero-copy"><span class="overline">MEU CADERNO · 2º ANO</span><h1>Matemática<br><em>em cores!</em></h1><p>Vamos descobrir, experimentar<br>e aprender um pouquinho mais?</p></div><div class="cover-art"><img src="assets/caderno-matematica.svg" alt="Caderno com botões coloridos e peças de contagem, como nas atividades da apostila."></div></section><nav class="home-menu" aria-label="Menu principal">
        <a class="home-option home-game" href="jogo.html?v=20261122-sem-criacao"><span class="home-icon" aria-hidden="true"><img src="assets/openmoji/1F9E9.svg" alt=""></span><span><strong>Jogar</strong><small>Arraste as caixas e resolva os desafios.</small></span></a>
        <a class="home-option home-work" href="${destination()}"><span class="home-icon" aria-hidden="true"><img src="assets/openmoji/270F.svg" alt=""></span><span><strong>Fazer atividades</strong><small>${book.last?'Continue de onde parou no caderno.':'Resolva as contas e escreva na sua folha.'}</small></span></a>
        <a class="home-option home-lessons" href="aula.html?v=20261122-sem-criacao"><span class="home-icon" aria-hidden="true"><img src="assets/openmoji/1F4D6.svg" alt=""></span><span><strong>Assistir às aulas</strong><small>Aprenda passo a passo com as animações.</small></span></a>
      </nav><section class="route-area"><div class="section-head"><div><span class="overline">ESCOLHA UM ASSUNTO</span><h2>Meu caderno</h2></div><a class="small-ticket" href="#bilhete">✦ ${stamps()} de 6 carimbos</a></div>
      <div class="routes">${stops.map((s,i)=>`<a href="${url(s)}" class="route-card ${s.color}">${icon(s)}<div><span class="index">${s.jobs.length} atividades</span><h3>${s.title}</h3><p>${s.subject}</p>${meter(completed(s),s.jobs.length)}<span class="sr">${completed(s)} de ${s.jobs.length} atividades concluídas</span></div></a>`).join('')}</div><div class="adult-tools"><button data-act="new-trip">Para o adulto · Nova rodada com outros números</button><p>8 variações completas. Depois, o ciclo recomeça.</p></div></section>`;
  }
  function ticket(){
    const done=stamps(),total=stops.reduce((acc,s)=>acc+completed(s),0),max=stops.reduce((acc,s)=>acc+s.jobs.length,0);
    game.innerHTML=`<section class="pass"><span class="overline">Clube da Matemática</span><h1>Minhas conquistas</h1><p>${done===6?'Você completou os seis assuntos do seu caderno!':'Complete as atividades de um assunto para ganhar um carimbo.'}</p>
      <div class="pass-count"><strong>${done} / 6</strong> carimbos · ${total} de ${max} atividades</div>
      <div class="stamp-grid">${stops.map(s=>`<a href="${url(s)}" class="stamp ${s.color} ${completed(s)===s.jobs.length?'earned':''}">${icon(s)}<strong>${s.short}</strong><small>${completed(s)===s.jobs.length?'Carimbado':`${completed(s)} de ${s.jobs.length} atividades`}</small></a>`).join('')}</div>
      <a class="primary" href="#mapa">Voltar ao início</a></section>`;
  }
  function btn(action,label,i=null,opts={}){
    return `<button type="button" data-act="${action}"${i===null?'':` data-n="${i}"`}${opts.pressed===undefined?'':` aria-pressed="${opts.pressed}"`}${opts.disabled?' disabled':''}${opts.cls?` class="${opts.cls}"`:''}${opts.aria?` aria-label="${escape(opts.aria)}"`:''}>${label}</button>`;
  }
  function numInput(label){
    return `<label class="answer-line">${label}<span class="small">Toque no campo para usar os números.</span><input id="num" data-field="answer" readonly inputmode="none" data-number type="text" autocomplete="off" maxlength="5" value="${escape(sheet.answer)}" /></label>`;
  }
  function calcView(){
    const m=W.material(job,sheet), trade=W.exchangeAt(job,sheet), plus=job.op==='+', names=['Centenas','Dezenas','Unidades'];
    const changed=i=>!plus&&String(sheet.notes?.[i]??'').trim()!==''&&Number(sheet.notes[i])!==W.digits(job.a)[i];
    const digits=(n,original=false)=>W.digits(n).map((d,i)=>`<span ${original?`id="original-digit-${i}" class="${changed(i)?'replaced-digit':''}"`:''}>${i===0&&d===0?'':d}</span>`).join('');
    const marked=sheet.marked||[];
    const material=m.map((count,i)=>{
      const canPick=plus&&i===trade;
      const pieces=Array.from({length:count},(_,k)=>{
        const piece=`<i class="block b${i}" aria-hidden="true"></i>`;
        return canPick?btn('mark',piece,k,{pressed:marked.includes(k),cls:'piece',aria:`Marcar peça ${k+1} de ${names[i]}`}):piece;
      }).join('');
      return `<div class="place" id="place-${i}"><b>${names[i]}</b><div class="tokens">${pieces}</div></div>`;
    }).join('');
    const tradeText=trade===2?(plus?'Juntar 10 unidades':'Abrir 1 dezena'):plus?'Juntar 10 dezenas':'Abrir 1 centena';
    const carries=names.map((name,i)=>`<input class="carry-note" data-carry="${i}" readonly data-number inputmode="none" autocomplete="off" maxlength="2" aria-label="${plus?`Anotação de troca nas ${name}`:`${name} após a troca`}" aria-describedby="exchange-instructions" value="${escape(sheet.notes?.[i])}">`).join('');
    return `<div class="exchange"><div class="calc-wrap"><h3>Resolva a conta</h3><p class="small" id="exchange-instructions">${plus?'Comece pelas unidades. Nos quadrados de cima, anote o que passou para a próxima coluna.':'Comece pelas unidades. Se fizer uma troca, anote em cima a quantidade que ficou em cada coluna alterada. Deixe vazio onde nada mudou.'}</p>
      ${plus?'':`<details class="exchange-guide"><summary>Como preencher os quadrados de cima</summary><p>Na subtração, anote quanto <strong>ficou</strong> depois da troca, nas duas colunas que mudaram.</p><div class="exchange-examples"><section><h4>Trocar uma centena</h4><p>Exemplo: <strong>642 − 280</strong></p><p>6 centenas viram <b>5</b>.<br>4 dezenas viram <b>14</b>.</p><div class="example-notes" aria-label="Exemplo: C 5, D 14, U vazio"><span>C<b>5</b></span><span>D<b>14</b></span><span>U<b>—</b></span></div></section><section><h4>Trocar uma dezena</h4><p>Exemplo: <strong>346 − 128</strong></p><p>4 dezenas viram <b>3</b>.<br>6 unidades viram <b>16</b>.</p><div class="example-notes" aria-label="Exemplo: C vazio, D 3, U 16"><span>C<b>—</b></span><span>D<b>3</b></span><span>U<b>16</b></span></div></section></div><p class="small">O traço significa deixar vazio. São exemplos com outros números; faça as trocas da sua conta.</p></details>`}
      <div class="calc"><p class="notes-title">${plus?'Trocas da adição':'Depois da troca'}</p><div class="calc-row heads"><span></span><span>C</span><span>D</span><span>U</span></div><div class="calc-row marks"><span></span>${carries}</div><div class="calc-row"><span></span>${digits(job.a,true)}</div><div class="calc-row"><b>${job.op}</b>${digits(job.b)}</div><div class="calc-row result"><span>=</span>${names.map((name,i)=>`<input data-result="${i}" readonly data-number inputmode="none" autocomplete="off" maxlength="1" aria-label="${name} do resultado" value="${escape(sheet.result?.[i])}">`).join('')}</div></div><p class="small calc-note">As anotações de cima são opcionais. Você também pode fazer as trocas na sua folha.</p></div>
      <details class="material-help" ${sheet.supportOpen?'open':''}><summary>Preciso de peças para pensar</summary><p class="small">${plus?'As peças das duas parcelas estão juntas. Conte e faça as trocas.':'Estas peças mostram a quantidade de cima. Você pode trocar 1 centena por 10 dezenas ou 1 dezena por 10 unidades. O total não muda.'}</p><div class="places">${material}</div>
      <div class="subaction">${trade===undefined?'<strong>Conte as peças e faça seu registro.</strong>':btn('trade',tradeText,null,{cls:'accent',disabled:plus&&marked.length!==10})}</div>
      ${plus&&trade!==undefined?`<p class="piece-note">Marque dez peças para juntá-las. ${marked.length?`Você marcou ${marked.length} de 10.`:''}</p>`:''}</details></div>`;
  }

  function trackView(){
    const picked=W.take(sheet), named=v=>({'☀️':'sol','🍃':'folha','🌙':'lua'}[v]||v);
    const cars=[...job.line,...Array.from({length:job.solution.length},(_,i)=>i<picked.length?job.picks[picked[i]]:null)];
    return `<div class="rail">${cars.map((v,i)=>`<div class="wagon ${i>=job.line.length?'joined':''} ${v===null?'empty':''}" aria-label="${v===null?'espaço vazio':escape(named(v))}">${v??'?'}</div>`).join('')}</div><p class="small">Toque nas peças na ordem em que elas vão entrar.</p><div class="tools">${job.picks.map((v,i)=>btn('pick',String(v),i,{aria:`Escolher ${named(v)}`,disabled:(!job.repeat&&picked.includes(i))||picked.length===job.solution.length,cls:'chip'})).join('')}${btn('undo-pick','Retirar o último',null,{disabled:!picked.length})}</div>`;
  }
  function groupsView(){
    const list=W.loads(job,sheet), total=job.groups*job.each, left=total-W.sum(list), share=job.kind==='share';
    return `<div class="counter">${job.token} ${share?`${left} ${job.item} na cesta`:`Prepare ${job.groups} grupos com ${job.each} ${job.item}.`}</div><p class="small">Toque em ${share?'um grupo':'um grupo'} para entregar uma peça.</p>
      <div class="crates">${list.map((n,i)=>btn('add-one',`<b>${share?(job.container||'Criança'):'Grupo'} ${i+1}</b><span class="group-pieces" aria-hidden="true">${job.token.repeat(n)||'·'}</span>`,i,{cls:'crate',disabled:!left,aria:`Entregar a ${share?(job.container||'criança'):'grupo'} ${i+1}, com ${n} peças`})).join('')}</div>
      <div class="tools">${share?btn('round','Dar uma para cada grupo',null,{disabled:left<job.groups}):''}${btn('undo-load','Desfazer última entrega',null,{disabled:!sheet.history?.length})}</div>
      ${share?'':`<div class="formula">${list.join(' + ')}</div>`}${numInput(share?'Quantas peças em cada grupo?':'Quantos botões ao todo?')}`;
  }
  function taskView(){
    const sel=W.take(sheet),n=W.count(job,sheet), arr=(len,fn)=>Array.from({length:len},(_,i)=>fn(i)).join('');
    switch(job.kind){
      case 'exchange':return calcView();
      case 'track':return trackView();
      case 'quiz':return `<div class="answers">${job.choices.map((v,i)=>btn('choose',v,i,{pressed:sheet.choice===i})).join('')}</div>`;
      case 'word':return `<div class="number-label">${job.n}</div><p>Escreva o nome deste número na folha abaixo.</p><details><summary>Digitar ou editar</summary><label class="word-label">Número por extenso<input data-field="answer" type="text" lang="pt-BR" autocomplete="off" autocorrect="off" spellcheck="false" value="${escape(sheet.answer)}"></label></details>`;
      case 'sum':{
        const ways=sheet.ways||[], val=sel.map(i=>job.pieces[i]);
        return `<div class="chips">${job.pieces.map((v,i)=>btn('pick',String(v),i,{pressed:sel.includes(i),disabled:ways.length===2,cls:'chip'})).join('')}</div>
          <div class="formula">${val.length?`${val.join(' + ')} = ?`:'Escolha as parcelas'}</div>
          ${btn('keep-sum','Guardar esta soma',null,{disabled:!sel.length||ways.length===2})}
          <div class="saved-sums">${ways.map((parts,i)=>`<p>✓ ${i+1}ª soma &nbsp; ${parts.join(' + ')} = ${job.target}</p>`).join('')}</div>`;
      }
      case 'table':return `<table><caption>Tampinhas da coleção</caption><thead><tr><th>Escolha</th><th>Tipo</th><th>Quantidade</th></tr></thead><tbody>${job.rows.map(([name,value],i)=>`<tr><td>${btn('pick',sel.includes(i)?'✓':'○',i,{pressed:sel.includes(i),aria:`Selecionar ${name}`})}</td><th scope="row">${name}</th><td>${value}</td></tr>`).join('')}</tbody></table>${numInput('Quantas tampinhas?')}`;
      case 'load':case 'share':return groupsView();
      case 'batch':return `<div class="servings">${arr(n,()=>`<div class="portion"><span>${job.token}</span><b>${job.each} ${job.item}</b></div>`)||'Monte a primeira porção.'}</div><div class="tools">${btn('more',`Acrescentar uma ${job.thing}`,null,{disabled:n>=job.groups+1})}${btn('less',`Retirar uma ${job.thing}`,null,{disabled:!n})}</div>${numInput(`Qual é o total em ${job.item}?`)}`;
      case 'fraction':return `<p class="small">Toque em um quadradinho para marcar ou desmarcar.</p><div class="chocolate" style="--cols:${job.cols}">${arr(job.total,i=>btn('pick',sel.includes(i)?'✓':'',i,{pressed:sel.includes(i),aria:`Quadradinho ${i+1}`}))}</div><p class="counter">Conte os quadradinhos marcados e confira as partes iguais.</p>`;
      case 'bundles':return `<div class="counter">🌷 ${job.total-n*job.each} flores no cesto</div><div class="servings">${arr(n,()=>'<span class="bouquet" aria-label="Buquê de 4 flores">💐</span>')}</div><div class="tools">${btn('more','Montar um buquê de 4',null,{disabled:n===job.total/job.each})}${btn('less','Desfazer um buquê',null,{disabled:!n})}</div>${numInput('Quantos buquês ficaram prontos?')}`;
      case 'seats':{
        const toys=job.object==='piões';
        return `<div class="counter">${job.people} ${toys?'crianças precisam de um pião':'passageiros vão embarcar'}</div><p class="small">${toys?'Toque em cada pião para entregá-lo.':'Toque nas poltronas para sentar os passageiros.'}</p><div class="seat-grid" style="--cols:${job.per}">${arr(job.rows*job.per,i=>btn('seat',sel.includes(i)?'✓':toys?'🪀':'▱',i,{pressed:sel.includes(i),aria:`${toys?'Pião':'Poltrona'} ${i+1}`,disabled:!sel.includes(i)&&sel.length>=job.people}))}</div>
        ${toys?`<div class="tools">${['Faltam piões','Sobram piões'].map((v,i)=>btn('choose',v,i,{pressed:sheet.choice===i})).join('')}</div>`:''}${numInput(toys?'Quantos piões faltam ou sobram?':'Quantas poltronas ficaram vazias?')}`;
      }
    }
  }
  function toolbar(){
    return `<section class="scratch" aria-label="Folha de escrita"><h2>✎ Minha folha</h2>
      <p class="small">Escreva com a caneta, no seu tempo. Use o dedo fora da folha para rolar.</p>
      <canvas id="ink" aria-label="Folha para escrever com a caneta"></canvas>
      <div class="tools">${btn('undo-ink','↶ Desfazer traço')}${btn('clear-ink','Apagar folha')}</div>
      <details><summary>Digitar como pensei</summary><label class="word-label">Minha ideia<textarea lang="pt-BR" autocorrect="off" data-field="note" rows="3">${escape(sheet.note)}</textarea></label></details>
      </section>`;
  }
  function numberPad(){
    return `<section id="number-pad" class="number-pad" hidden aria-label="Botões para registrar o resultado">
      <p id="number-label"></p><div class="digits">${[1,2,3,4,5,6,7,8,9,0].map(n=>btn('digit',n,n)).join('')}${btn('erase-digit','⌫',null,{aria:'Apagar último algarismo'})}${btn('close-pad','Pronto')}</div>
      ${btn('keyboard','Usar teclado')}
    </section>`;
  }
  function lessonTopic(){
    if(['exchange','table'].includes(job.kind))return job.op==='+'?'soma':'subtracao';
    if(job.kind==='sum')return 'soma';
    if(job.kind==='track'&&job.line.length&&typeof job.line[0]==='number')return 'sequencia';
    if(job.kind==='batch'&&['dobro','triplo'].includes(job.id))return 'dobro';
    if(['load','batch'].includes(job.kind))return 'multiplicacao';
    if(['share','fraction','bundles'].includes(job.kind))return 'divisao';
    return '';
  }
  function mission(){
    const i=stop.jobs.indexOf(job),done=!!sheet.done;
    game.innerHTML=`<div class="play ${stop.color}"><div class="play-nav"><a href="#mapa">Meu caderno</a><span>${stop.title}</span></div>
      <div class="job-head">${icon(stop)}<div><span class="overline">Atividade ${i+1} de ${stop.jobs.length}</span><h1>${job.title}</h1></div></div>
      <div class="job-dots" aria-label="Atividades do assunto">${stop.jobs.map((j,k)=>`<a href="${url(stop,j)}" aria-label="Atividade ${k+1}: ${j.title}" ${j===job?'aria-current="step"':''} class="${book[stop.id]?.[j.id]?.done?'done':''}">${book[stop.id]?.[j.id]?.done?'✓':k+1}</a>`).join('')}</div>
      <section class="board"><p class="prompt">${job.prompt}</p><details class="book-reference"><summary>📖 Apostila · ${escape(job.reference.label)}</summary><p>${escape(job.reference.note)}${book.round>0?' Nesta rodada, números e opções podem mudar para repetir o raciocínio.':''}</p></details>${btn('hint','✦ Pista',null,{pressed:!!sheet.hint})}${lessonTopic()?btn('lesson','▶ Ver uma aula de exemplo',null,{cls:'lesson-help'}):''}<div class="hint"${sheet.hint?'':' hidden'}>${job.hint}</div><div class="workbench">${taskView()}</div>${numberPad()}${toolbar()}
      <div class="actions">${btn('check','Conferir resposta',null,{cls:'primary'})}</div>
      <div class="feedback" id="feedback" role="status"></div>${done?`<div class="success"><b>✓ ${sheet.handReviewed?'Escrita revisada':'Atividade conferida'}</b><p>${escape(W.judge(job,sheet).why)}</p><a class="primary" href="${i+1<stop.jobs.length?url(stop,stop.jobs[i+1]):completed(stop)===stop.jobs.length?'#bilhete':url(stop,first(stop))}">${i+1<stop.jobs.length?'Próxima atividade':completed(stop)===stop.jobs.length?'Ver meu carimbo':'Continuar neste assunto'}</a></div>`:''}</section></div>`;
    by('feedback').textContent=message;
    numberTarget = null;
    setupInk();
  }

  function renderMission(){
    const active=document.activeElement;
    const restore=active?.dataset.act;
    const index=active?.dataset.n;
    observer?.disconnect();mission();
    if(restore){
      const selector=`[data-act="${restore}"]${index===undefined?'':`[data-n="${index}"]`}`;
      const el=game.querySelector(selector);
      if(el&&!el.disabled)el.focus({preventScroll:true});
    }
  }
  function setupInk(){
    observer?.disconnect();
    const c=by('ink'),ctx=c.getContext('2d');let active=null,line;
    const strokes=sheet.ink||=[];
    function paint(){
      const r=c.getBoundingClientRect();if(!r.width||!r.height)return;
      const d=window.devicePixelRatio||1;c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);ctx.scale(d,d);
      ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#174d4b';
      for(const l of strokes){
        if(!l.length)continue;
        ctx.beginPath();ctx.moveTo(l[0][0]*r.width,l[0][1]*r.height);
        for(const [x,y] of l)ctx.lineTo(x*r.width,y*r.height);
        if(l.length===1)ctx.lineTo(l[0][0]*r.width+.12,l[0][1]*r.height+.12);
        ctx.stroke();
      }
    }
    const point=e=>{const r=c.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
    c.onpointerdown=e=>{
      if(e.pointerType==='touch'||active!==null||e.button>0||!e.isPrimary)return;
      if (job.kind==='word') {sheet.handReviewed=false;sheet.done=false;game.querySelector('.success')?.remove();}
      e.preventDefault();active=e.pointerId;c.setPointerCapture(active);line=[point(e)];strokes.push(line);paint();
    };
    c.onpointermove=e=>{
      if(active!==e.pointerId)return;
      const rect=c.getBoundingClientRect();
      const coalesced=e.getCoalescedEvents?.();
      const samples=coalesced?.length?coalesced:[e];
      const last=line[line.length-1];
      ctx.beginPath();ctx.moveTo(last[0]*rect.width,last[1]*rect.height);
      for(const sample of samples){
        const position=point(sample);line.push(position);
        ctx.lineTo(position[0]*rect.width,position[1]*rect.height);
      }
      ctx.stroke();
    };
    function end(e){if(active!==e.pointerId)return;active=null;save();}
    c.onpointerup=end;c.onpointercancel=end;c.onlostpointercapture=end;
    observer=new ResizeObserver(paint);observer.observe(c);paint();
  }
  function navigate(){
    observer?.disconnect();stop=undefined;job=undefined;sheet=undefined;message='';
    const [section,id]=location.hash.slice(1).split('/');
    stop=stops.find(s=>s.id===section);
    // Links salvos da atividade retirada seguem para as atividades restantes ou para a conquista.
    if(stop?.id==='botoes'&&id==='autora'){location.hash=completed(stop)===stop.jobs.length?'#bilhete':url(stop);navigate();return;}
    if(stop){
      job=stop.jobs.find(j=>j.id===id)||first(stop);sheet=entry(stop,job);book.last=[stop.id,job.id];save();mission();
    }else if(section==='bilhete')ticket();else map();
    by('map-link').setAttribute('aria-current',section!=='bilhete'?'page':'false');by('ticket-link').setAttribute('aria-current',section==='bilhete'?'page':'false');
    window.scrollTo(0,0);game.focus({preventScroll:true});
  }
  by('map-link').onclick=()=>location.hash='mapa';by('ticket-link').onclick=()=>location.hash='bilhete';
  by('brand').onclick=e=>{e.preventDefault();location.hash='mapa';};
  by('help').onclick=()=>{focusReturn=document.activeElement;by('help-panel').showModal();};
  by('help-close').onclick=()=>by('help-panel').close();by('help-panel').onclose=()=>focusReturn?.focus();
  game.addEventListener('focusin',e=>{
    if (!e.target.matches('[data-number]') || !e.target.readOnly) return;
    numberTarget=e.target;replaceNumber=true;
    by('number-label').textContent=e.target.getAttribute('aria-label')||'Toque nos números da sua resposta.';
    by('number-pad').hidden=false;
  });
  game.addEventListener('input',e=>{
    if(!sheet)return;
    const t=e.target, field=t.dataset.field;
    if(field){
      if(field!=='note')sheet.handReviewed=false;
      sheet[field]=field==='reviewed'?t.checked:['each','groups'].includes(field)?Number(t.value):t.value;
    }else if(t.dataset.carry!==undefined){
      const i=Number(t.dataset.carry);
      sheet.notes||=['','',''];sheet.notes[i]=t.value.trim();
      if(job.op!=='+' && by(`original-digit-${i}`))by(`original-digit-${i}`).classList.toggle('replaced-digit',sheet.notes[i]!==''&&Number(sheet.notes[i])!==W.digits(job.a)[i]);
      save();return;
    }else if(t.dataset.result!==undefined){
      sheet.result||=['','',''];sheet.result[Number(t.dataset.result)]=t.value.trim();
    }else return;
    if(field==='note'){save();return;}
    message='';sheet.done=false;game.querySelector('.success')?.remove();by('feedback').textContent='';save();
  });
  game.addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');
    if (!b) return;
    const action=b.dataset.act,n=Number(b.dataset.n);
    if (action==='new-trip') {
      if (!confirm('Começar uma nova rodada? Os números das 27 atividades vão mudar. As respostas, os desenhos e os carimbos desta rodada serão apagados neste navegador.')) return;
      const nextBook = {round:(Number.isInteger(book.round)?book.round:0)+1};
      try {localStorage.setItem(key,JSON.stringify(nextBook));}
      catch {by('storage-note').textContent='Não foi possível guardar a nova rodada. Tente novamente.';return;}
      book=nextBook;stops=ExpressoRounds.create(book.round);navigate();return;
    }
    if (!sheet) return;
    if (action==='lesson') {Aulas.open(lessonTopic(),job);return;}
    if (['mark','trade'].includes(action))sheet.supportOpen=true;
    if (['digit','erase-digit','close-pad','keyboard'].includes(action)) {
      if (!numberTarget?.isConnected) return;
      if (action==='close-pad') {by('number-pad').hidden=true;return;}
      if (action==='keyboard') {numberTarget.readOnly=false;numberTarget.inputMode='numeric';by('number-pad').hidden=true;numberTarget.focus();return;}
      const limit=numberTarget.maxLength>0?numberTarget.maxLength:5;
      numberTarget.value=action==='erase-digit'?numberTarget.value.slice(0,-1):limit===1||replaceNumber?String(n):(numberTarget.value+String(n)).slice(0,limit);
      replaceNumber=false;
      numberTarget.dispatchEvent(new Event('input',{bubbles:true}));return;
    }
    if (action==='review-word') {sheet.handReviewed=true;sheet.done=true;save();renderMission();return;}
    if (action==='clear-ink') {
      if (!sheet.ink?.length || !confirm('Apagar os traços desta folha?')) return;
      sheet.ink=[];sheet.handReviewed=false;
      if(job.kind==='word')sheet.done=false;
      save();renderMission();return;
    }
    if(action==='locate'){
      const p=by(`place-${n}`);p.classList.remove('highlight');void p.offsetWidth;p.classList.add('highlight');return;
    }
    message='';
    if(action==='mark'){
      const marked=sheet.marked||[];
      if(marked.includes(n))sheet.marked=marked.filter(i=>i!==n);
      else if(marked.length<10)sheet.marked=[...marked,n];
    }else if(action==='trade'&&sheet.marked?.length&&sheet.marked.length!==10){
      message=`Você marcou ${sheet.marked.length}. Marque mais ${10-sheet.marked.length} para fazer a troca.`;
    }else if(action==='hint'){sheet.hint=!sheet.hint;}
    else if(action==='undo-ink'){sheet.ink?.pop();sheet.handReviewed=false;if(job.kind==='word')sheet.done=false;}
    else if(action==='check'){
      if (job.kind==='word' && !sheet.answer?.trim() && sheet.ink?.length) {
        by('feedback').innerHTML=`<p>Compare sua escrita com <strong>${escape(MathBook.words(job.n))}</strong>.</p><p>Confira cada palavra e os espaços. Peça ajuda a um adulto se precisar.</p>${btn('review-word','Já revisei minha escrita')}`;
        return;
      }
      const result=W.judge(job,sheet);sheet.done=!result.error;message=result.error||'';
    }else if(action==='keep-sum'){
      message=W.storeSum(job,sheet);sheet.done=false;
    }else{W.adjust(job,sheet,action,n);sheet.done=false;}
    save();renderMission();
    if(action==='check'&&sheet.done)game.querySelector('.success a')?.focus({preventScroll:true});
  });
  window.addEventListener('hashchange',navigate);navigate();
}
iniciarExpresso();
