function iniciarExpresso(){
  const stops=Expresso.stops, W=Oficina, game=document.getElementById('game');
  const by=id=>document.getElementById(id);
  const escape=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  const key='expresso-piquenique-v1';
  let book={}, stop, job, sheet, message='', observer, focusReturn;
  try{book=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
  function save(){
    try{localStorage.setItem(key,JSON.stringify(book));by('storage-note').textContent='Viagem guardada neste navegador.';}
    catch{by('storage-note').textContent='O navegador não conseguiu guardar esta viagem.';}
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
      <div class="hero-copy"><span class="overline"><i></i> Matemática · 2º ano</span><h1>Expresso do<br><em>Piquenique</em></h1><p>O trem vai partir! Ajude a preparar as encomendas e leve o piquenique até o parque.</p><a class="primary" href="${destination()}">${stamps()===stops.length?'Ver meu bilhete':book.last?'Continuar viagem':'Embarcar no trem'}</a></div>
      <div class="postcard"><img src="assets/expresso-paisagem.webp" alt="Uma locomotiva com encomendas atravessa uma ponte a caminho do piquenique."></div>
    </section><section class="route-area"><div class="section-head"><div><span class="overline">Escolha onde jogar</span><h2>Mapa da viagem</h2></div><a class="small-ticket" href="#bilhete">✦ ${stamps()} de 6 carimbos</a></div>
      <div class="routes">${stops.map((s,i)=>`<a href="${url(s)}" class="route-card ${s.color}">${icon(s)}<div><span class="index">Estação ${String(i+1).padStart(2,'0')}</span><h3>${s.title}</h3><p>${s.subject}</p>${meter(completed(s),s.jobs.length)}<span class="sr">${completed(s)} de ${s.jobs.length} entregas concluídas</span></div></a>`).join('')}</div></section>`;
  }
  function ticket(){
    const done=stamps(),total=stops.reduce((acc,s)=>acc+completed(s),0),max=stops.reduce((acc,s)=>acc+s.jobs.length,0);
    game.innerHTML=`<section class="pass"><span class="overline">Clube do Trilho</span><h1>Meu bilhete</h1><p>${done===6?'O piquenique chegou ao parque com os seis carimbos!':'Complete as entregas de uma estação para ganhar o carimbo dela.'}</p>
      <div class="pass-count"><strong>${done} / 6</strong> carimbos · ${total} de ${max} entregas</div>
      <div class="stamp-grid">${stops.map(s=>`<a href="${url(s)}" class="stamp ${s.color} ${completed(s)===s.jobs.length?'earned':''}">${icon(s)}<strong>${s.short}</strong><small>${completed(s)===s.jobs.length?'Carimbado':`${completed(s)} de ${s.jobs.length} entregas`}</small></a>`).join('')}</div>
      <a class="primary" href="#mapa">Voltar ao mapa</a></section>`;
  }
  function btn(action,label,i=null,opts={}){
    return `<button type="button" data-act="${action}"${i===null?'':` data-n="${i}"`}${opts.pressed===undefined?'':` aria-pressed="${opts.pressed}"`}${opts.disabled?' disabled':''}${opts.cls?` class="${opts.cls}"`:''}${opts.aria?` aria-label="${escape(opts.aria)}"`:''}>${label}</button>`;
  }
  function numInput(label){
    return `<label class="answer-line">${label}<input id="num" data-field="answer" inputmode="numeric" type="text" autocomplete="off" maxlength="5" value="${escape(sheet.answer)}" /></label>`;
  }
  function calcView(){
    const m=W.material(job,sheet), trade=W.exchangeAt(job,sheet), plus=job.op==='+', names=['Centenas','Dezenas','Unidades'];
    const digits=n=>W.digits(n).map((d,i)=>`<span>${i===0&&d===0?'':d}</span>`).join('');
    const marks=sheet.trades||[];
    const marked=sheet.marked||[];
    const material=m.map((count,i)=>{
      const canPick=plus&&i===trade;
      const pieces=Array.from({length:count},(_,k)=>{
        const piece=`<i class="block b${i}" aria-hidden="true"></i>`;
        return canPick?btn('mark',piece,k,{pressed:marked.includes(k),cls:'piece',aria:`Marcar peça ${k+1} de ${names[i]}`}):piece;
      }).join('');
      return `<div class="place" id="place-${i}"><b>${names[i]}</b><div class="tokens">${pieces}</div><strong>${count}</strong></div>`;
    }).join('');
    const tradeText=trade===2?(plus?'Juntar 10 unidades':'Abrir 1 dezena'):plus?'Juntar 10 dezenas':'Abrir 1 centena';
    const carries=names.map((_,i)=>{
      const added=marks.includes(i+1);
      if(plus&&added)return btn('locate','1',i,{cls:'carry',aria:`Mostrar a peça que passou para ${names[i]}`});
      if(!plus&&marks.length&&m[i]!==W.digits(job.a)[i])return btn('locate',String(m[i]),i,{cls:'carry',aria:`Mostrar ${m[i]} ${names[i]}`});
      return '<span></span>';
    }).join('');
    return `<div class="exchange"><div><h3>Quadro de trocas</h3><div class="places">${material}</div>
      <div class="subaction">${trade===undefined?'<strong>As peças estão prontas.</strong>':btn('trade',tradeText,null,{cls:'accent'})}</div>
      ${plus&&trade!==undefined?`<p class="piece-note">Toque em dez peças ou use o botão para juntá-las de uma vez. ${marked.length?`Você marcou ${marked.length} de 10.`:''}</p>`:''}
      </div>
      <div class="calc-wrap"><h3>Registre a conta</h3><div class="calc"><div class="calc-row heads"><span></span><span>C</span><span>D</span><span>U</span></div><div class="calc-row marks"><span></span>${carries}</div><div class="calc-row"><span></span>${digits(job.a)}</div><div class="calc-row"><b>${job.op}</b>${digits(job.b)}</div><div class="calc-row result"><span>=</span>${names.map((name,i)=>`<input data-result="${i}" inputmode="numeric" autocomplete="off" maxlength="1" aria-label="${name} do resultado" value="${escape(sheet.result?.[i])}">`).join('')}</div></div></div></div>`;
  }
  function trackView(){
    const picked=W.take(sheet), named=v=>({'☀️':'sol','🍃':'folha','🌙':'lua'}[v]||v);
    const cars=[...job.line,...Array.from({length:job.solution.length},(_,i)=>i<picked.length?job.picks[picked[i]]:null)];
    return `<div class="rail">${cars.map((v,i)=>`<div class="wagon ${i>=job.line.length?'joined':''} ${v===null?'empty':''}" aria-label="${v===null?'vagão vazio':escape(named(v))}">${v??'?'}</div>`).join('')}</div><p class="small">Toque nas peças na ordem em que elas vão entrar.</p><div class="tools">${job.picks.map((v,i)=>btn('pick',String(v),i,{aria:`Engatar ${named(v)}`,disabled:(!job.repeat&&picked.includes(i))||picked.length===job.solution.length,cls:'chip'})).join('')}${btn('undo-pick','Desengatar o último',null,{disabled:!picked.length})}</div>`;
  }
  function groupsView(){
    const list=W.loads(job,sheet), total=job.groups*job.each, left=total-W.sum(list), share=job.kind==='share';
    return `<div class="counter">${job.token} ${left} ${job.item} ${share?'na cesta':'para embarcar'}</div><p class="small">Toque em ${share?'um grupo':'um vagão'} para entregar uma peça.</p>
      <div class="crates">${list.map((n,i)=>btn('add-one',`<b>${share?(job.container||'Criança'):'Vagão'} ${i+1}</b><span class="group-pieces" aria-hidden="true">${job.token.repeat(n)||'·'}</span><strong>${n}</strong>`,i,{cls:'crate',disabled:!left,aria:`Entregar a ${share?(job.container||'criança'):'vagão'} ${i+1}, com ${n} peças`})).join('')}</div>
      <div class="tools">${share?btn('round','Dar uma para cada grupo',null,{disabled:left<job.groups}):''}${btn('undo-load','Desfazer última entrega',null,{disabled:!sheet.history?.length})}</div>
      ${share?'':`<div class="formula">${list.join(' + ')}</div>`}${numInput(share?'Quantas peças em cada grupo?':'Quantos botões ao todo?')}`;
  }
  function taskView(){
    const sel=W.take(sheet),n=W.count(job,sheet), arr=(len,fn)=>Array.from({length:len},(_,i)=>fn(i)).join('');
    switch(job.kind){
      case 'exchange':return calcView();
      case 'track':return trackView();
      case 'quiz':return `<div class="answers">${job.choices.map((v,i)=>btn('choose',v,i,{pressed:sheet.choice===i})).join('')}</div>`;
      case 'word':return `<div class="number-label">${job.n}</div><label class="word-label">Número por extenso<input data-field="answer" type="text" autocomplete="off" spellcheck="false" value="${escape(sheet.answer)}"></label>`;
      case 'sum':{
        const ways=sheet.ways||[], val=sel.map(i=>job.pieces[i]);
        return `<div class="chips">${job.pieces.map((v,i)=>btn('pick',String(v),i,{pressed:sel.includes(i),disabled:ways.length===2,cls:'chip'})).join('')}</div>
          <div class="formula">${val.length?`${val.join(' + ')} = ${W.sum(val)}`:'Escolha as parcelas'}</div>
          ${btn('keep-sum','Guardar esta soma',null,{disabled:!sel.length||ways.length===2})}
          <div class="saved-sums">${ways.map((parts,i)=>`<p>✓ ${i+1}ª soma &nbsp; ${parts.join(' + ')} = ${job.target}</p>`).join('')}</div>`;
      }
      case 'table':return `<table><caption>Tampinhas da coleção</caption><thead><tr><th>Escolha</th><th>Tipo</th><th>Quantidade</th></tr></thead><tbody>${job.rows.map(([name,value],i)=>`<tr><td>${btn('pick',sel.includes(i)?'✓':'○',i,{pressed:sel.includes(i),aria:`Selecionar ${name}`})}</td><th scope="row">${name}</th><td>${value}</td></tr>`).join('')}</tbody></table>${numInput('Quantas tampinhas?')}`;
      case 'load':case 'share':return groupsView();
      case 'batch':return `<div class="servings">${arr(n,()=>`<div class="portion"><span>${job.token}</span><b>${job.each} ${job.item}</b></div>`)||'Monte a primeira porção.'}</div><div class="tools">${btn('more',`Acrescentar uma ${job.thing}`,null,{disabled:n>=job.groups+1})}${btn('less',`Retirar uma ${job.thing}`,null,{disabled:!n})}</div>${numInput(`Qual é o total em ${job.item}?`)}`;
      case 'fraction':return `<p class="small">Toque em um quadradinho para marcar ou desmarcar.</p><div class="chocolate" style="--cols:${job.cols}">${arr(job.total,i=>btn('pick',sel.includes(i)?'✓':'',i,{pressed:sel.includes(i),aria:`Quadradinho ${i+1}`}))}</div><p class="counter">${sel.length} de ${job.total} quadradinhos marcados</p>`;
      case 'bundles':return `<div class="counter">🌷 ${job.total-n*job.each} flores no cesto</div><div class="servings">${arr(n,()=>'<span class="bouquet" aria-label="Buquê de 4 flores">💐</span>')}</div><div class="tools">${btn('more','Montar um buquê de 4',null,{disabled:n===job.total/job.each})}${btn('less','Desfazer um buquê',null,{disabled:!n})}</div>${numInput('Quantos buquês ficaram prontos?')}`;
      case 'seats':{
        const toys=job.object==='piões';
        return `<div class="counter">${job.people-sel.length} ${toys?'criança(s) esperando um pião':'passageiro(s) esperando'}</div><p class="small">${toys?'Toque em cada pião para entregá-lo.':'Toque nas poltronas para sentar os passageiros.'}</p><div class="seat-grid" style="--cols:${job.per}">${arr(job.rows*job.per,i=>btn('seat',sel.includes(i)?'✓':toys?'🪀':'▱',i,{pressed:sel.includes(i),aria:`${toys?'Pião':'Poltrona'} ${i+1}`,disabled:!sel.includes(i)&&sel.length>=job.people}))}</div>
        ${toys?`<div class="tools">${['Faltam piões','Sobram piões'].map((v,i)=>btn('choose',v,i,{pressed:sheet.choice===i})).join('')}</div>`:''}${numInput(toys?'Quantos piões faltam ou sobram?':'Quantas poltronas ficaram vazias?')}`;
      }
      case 'story':{
        const selector=(field,title,defaultValue)=>`<label>${title}<select data-field="${field}">${[2,3,4,5,6].map(v=>`<option ${v===(sheet[field]||defaultValue)?'selected':''}>${v}</option>`).join('')}</select></label>`;
        return `<div class="selects">${selector('groups','Quantos vagões?',3)}${selector('each','Quantos objetos por vagão?',4)}</div>
          <label class="word-label">Minha pergunta<textarea data-field="note" rows="3" placeholder="Escreva aqui ou desenhe no rascunho.">${escape(sheet.note)}</textarea></label><label class="review"><input type="checkbox" data-field="reviewed" ${sheet.reviewed?'checked':''}> Revisei minha história. Ela conta o que vai nos vagões e pergunta quantos objetos há ao todo.</label>`;
      }
    }
  }
  function toolbar(){
    return `<details class="scratch" ${sheet.scratchOpen?'open':''}><summary>✎ &nbsp; Meu rascunho</summary><p class="small">Desenhe sua estratégia. Use a caneta, o dedo ou o mouse.</p><canvas id="ink" aria-label="Espaço para desenhar sua estratégia"></canvas><div class="tools">${btn('undo-ink','Desfazer traço')}</div>
      ${job.kind==='story'?'':`<label class="word-label">Como eu pensei<textarea data-field="note" rows="2">${escape(sheet.note)}</textarea></label>`}</details>`;
  }
  function mission(){
    const i=stop.jobs.indexOf(job),done=!!sheet.done;
    game.innerHTML=`<div class="play ${stop.color}"><div class="play-nav"><a href="#mapa">Mapa da viagem</a><span>${stop.title}</span></div>
      <div class="job-head">${icon(stop)}<div><span class="overline">Entrega ${i+1} de ${stop.jobs.length}</span><h1>${job.title}</h1></div></div>
      <div class="job-dots" aria-label="Entregas da estação">${stop.jobs.map((j,k)=>`<a href="${url(stop,j)}" aria-label="Entrega ${k+1}: ${j.title}" ${j===job?'aria-current="step"':''} class="${book[stop.id]?.[j.id]?.done?'done':''}">${book[stop.id]?.[j.id]?.done?'✓':k+1}</a>`).join('')}</div>
      <section class="board"><p class="prompt">${job.prompt}</p><div class="workbench">${taskView()}</div>
      <div class="actions">${btn('check',job.kind==='story'?'Guardar minha encomenda':'Conferir entrega',null,{cls:'primary'})}${btn('hint','✦ Pista',null,{pressed:!!sheet.hint})}</div>
      <div class="hint"${sheet.hint?'':' hidden'}>${job.hint}</div><div class="feedback" id="feedback" role="status"></div>${done?`<div class="success"><b>✓ ${job.kind==='story'?'Encomenda guardada':'Entrega conferida'}</b><p>${escape(W.judge(job,sheet).why)}</p><a class="primary" href="${i+1<stop.jobs.length?url(stop,stop.jobs[i+1]):completed(stop)===stop.jobs.length?'#bilhete':url(stop,first(stop))}">${i+1<stop.jobs.length?'Próxima entrega':completed(stop)===stop.jobs.length?'Ver meu carimbo':'Continuar nesta estação'}</a></div>`:''}</section>${toolbar()}</div>`;
    by('feedback').textContent=message;
    if(sheet.scratchOpen)setupInk();
    game.querySelector('.scratch').ontoggle=e=>{
      if(!e.target.isConnected)return;
      sheet.scratchOpen=e.target.open;save();
      if(sheet.scratchOpen)setupInk();else observer?.disconnect();
    };
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
      if(active!==null||e.button>0||!e.isPrimary)return;
      e.preventDefault();active=e.pointerId;c.setPointerCapture(active);line=[point(e)];strokes.push(line);paint();
    };
    c.onpointermove=e=>{if(active!==e.pointerId)return;line.push(point(e));paint();};
    function end(e){if(active!==e.pointerId)return;active=null;save();}
    c.onpointerup=end;c.onpointercancel=end;c.onlostpointercapture=end;
    observer=new ResizeObserver(paint);observer.observe(c);paint();
  }
  function navigate(){
    observer?.disconnect();stop=undefined;job=undefined;sheet=undefined;message='';
    const [section,id]=location.hash.slice(1).split('/');
    stop=stops.find(s=>s.id===section);
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
  game.addEventListener('input',e=>{
    if(!sheet)return;
    const t=e.target, field=t.dataset.field;
    if(field){
      sheet[field]=field==='reviewed'?t.checked:['each','groups'].includes(field)?Number(t.value):t.value;
    }else if(t.dataset.result!==undefined){
      sheet.result||=['','',''];sheet.result[Number(t.dataset.result)]=t.value.trim();
    }else return;
    if(field==='note'&&job.kind!=='story'){save();return;}
    message='';sheet.done=false;game.querySelector('.success')?.remove();by('feedback').textContent='';save();
  });
  game.addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');if(!b||!sheet)return;
    const action=b.dataset.act,n=Number(b.dataset.n);
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
    else if(action==='undo-ink'){sheet.ink?.pop();if(job.kind==='story'&&!sheet.note?.trim()&&!sheet.ink?.length)sheet.done=false;}
    else if(action==='check'){
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
