(() => {
  'use strict';
  const M=MathBook,$=s=>document.querySelector(s),root=$('#content'),KEY='julia-matematica-v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let store={sheets:{}},current=null,labMode='build',saveFailed=false,drawObservers=[];
  try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1&&saved.sheets&&typeof saved.sheets==='object')store=saved;}catch{saveFailed=true;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({...store,version:1}));saveFailed=false;}catch{saveFailed=true;}$('#save-status').textContent=saveFailed?'Não foi possível guardar neste navegador. Mantenha a página aberta.':'Respostas guardadas neste navegador.';}
  function sheetState(id){
    const existing=store.sheets[id];
    if(!existing?.sheet||!Array.isArray(existing.sheet.tasks))store.sheets[id]={sheet:M.make(id),answers:{},selections:{},strokes:{},supports:{},checked:false};
    const st=store.sheets[id]; for(const key of ['answers','selections','strokes','supports'])st[key]??={};return st;
  }
  const fieldKey=(t,f)=>t.id+'-'+f.id;
  function input(f,key,value='',label=true){
    const attrs=`id="f-${esc(key)}" class="answer" data-answer="${esc(key)}" type="text" lang="pt-BR" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${f.kind==='number'?'inputmode="numeric"':''} aria-label="${esc(f.label)}" aria-describedby="fb-${esc(key)}"`;
    const area=f.kind==='text'||f.kind==='sequence';
    return `${label?`<label class="answer-label" for="f-${esc(key)}">${esc(f.label)}</label>`:''}${area?`<textarea ${attrs} rows="2">${esc(value)}</textarea>`:`<input ${attrs} value="${esc(value)}">`}<div id="fb-${esc(key)}" class="feedback" data-feedback="${esc(key)}"></div>`;
  }
  function field(f,t){const key=fieldKey(t,f);return `<div class="field">${input(f,key,current.answers[key]??'')}</div>`;}
  function hint(html){return `<details class="hint"><summary>Uma pista para pensar</summary><p>${html}</p></details>`;}
  function scratch(t){return `<details class="scratch" data-scratch="${t.id}"><summary>✎ Rascunhar com a caneta</summary><p class="small">Desenho livre. Não vira texto nem é corrigido. Dedo também desenha aqui.</p><canvas data-canvas="${t.id}" aria-label="Rascunho da atividade ${esc(t.id)}"></canvas><div class="button-row"><button data-undo="${t.id}">↶ Desfazer traço</button><button data-clear="${t.id}">Apagar rascunho</button></div></details>`;}
  function train(color='#9a8aaf'){return `<svg class="train" viewBox="0 0 200 55" aria-hidden="true"><path d="M8 36Q25 8 65 8h113q12 0 12 12v21H10Z" fill="${color}"/><path d="m22 29 25-14h16v14Z" fill="#fffefa"/><path d="M68 15h103v14H68Z" fill="#dfe9e0"/><path d="M92 15v14m23-14v14m23-14v14m23-14v14" stroke="${color}" stroke-width="5"/><path d="M10 40h180" stroke="#344c3d" stroke-width="4"/><circle cx="51" cy="44" r="7" fill="#344c3d"/><circle cx="151" cy="44" r="7" fill="#344c3d"/></svg>`;}
  function hero(){return `<svg viewBox="0 0 400 300" fill="none" aria-hidden="true"><rect x="60" y="35" width="245" height="235" rx="16" fill="#b4c1aa" transform="rotate(-8 60 35)"/><rect x="88" y="29" width="245" height="235" rx="16" fill="#fffefa" transform="rotate(4 88 29)"/><path d="M123 90h150M122 122h154M120 156h156M118 190h155M116 222h155" stroke="#e4e3d7" stroke-width="2"/><path d="M151 46v204" stroke="#d5a4a0" stroke-width="2"/><rect x="167" y="87" width="56" height="56" rx="5" fill="#efd17b"/><path d="M178 88v55m11-55v55m11-55v55m11-55v55m-44-44h56m-56 11h56m-56 11h56m-56 11h56" stroke="#c3a85d"/><rect x="236" y="95" width="12" height="55" rx="2" fill="#9e8db1"/><rect x="259" y="95" width="12" height="55" rx="2" fill="#9e8db1"/><rect x="167" y="170" width="14" height="14" rx="3" fill="#87a58a"/><rect x="190" y="170" width="14" height="14" rx="3" fill="#87a58a"/><rect x="213" y="170" width="14" height="14" rx="3" fill="#87a58a"/><path d="M302 199 351 69l13 5-49 130-16 17Z" fill="#d5a251"/><path d="m299 221 3-22 13 5Z" fill="#536554"/><circle cx="60" cy="161" r="28" fill="#9d8ab3"/><path d="M47 161h26m-13-13v26" stroke="#fffefa" stroke-width="4" stroke-linecap="round"/><path d="m345 247 6 8 12-19" stroke="#6c8c70" stroke-width="5" stroke-linecap="round"/></svg>`;}
  function home(){
    root.innerHTML=`<section class="home-hero"><div><p class="eyebrow">ESCREVER · DESCOBRIR · TENTAR DE NOVO</p><h1>Os números têm<br><span>muito para contar.</span></h1><p class="hero-description">Vamos explorar, Julia? Abra uma folha, escreva do seu jeito e descubra como os números se transformam.</p><div class="button-row"><a class="primary cta" href="#folha/103">Abrir meu caderno →</a><button class="plain" data-help>Como usar a caneta</button></div></div><div class="hero-art">${hero()}<div class="art-note">Uma ideia, muitos jeitos de resolver.</div></div></section><div class="intro-line"><h2>Escolha uma folha</h2><p class="small">Na ordem do livro. No seu ritmo.</p></div><section class="book-grid" aria-label="Folhas de Matemática">${M.pages.map(p=>{const st=store.sheets[p.id];const filled=st?Object.values(st.answers).filter(v=>String(v).trim()).length:0;return `<a href="#folha/${p.id}" class="book-card ${p.id==='revisao'?'extra':''}"><span class="page-label">${p.id==='revisao'?'REVISÃO COMPLEMENTAR':'PÁGINA '+p.id}</span><span class="card-arrow" aria-hidden="true">↗</span><h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p><span class="card-state">${filled?'Continuar de onde parei':'Vamos descobrir'}</span></a>`;}).join('')}</section><section class="lab-banner"><div><p class="eyebrow">MÃOS À OBRA</p><h2>Um laboratório de números</h2><p>Monte números, troque pecinhas e descubra os saltos.</p></div><a href="#laboratorio" class="primary cta">Explorar e brincar →</a></section><p class="page-note">Atividades adaptadas das páginas 103 e 160 a 169. Os números do livro estão no primeiro treino; use “Novos números” para repetir. A revisão complementar segue os temas das orientações de estudo.</p>`;
  }
  function column(t){
    const a=M.digits(t.a),b=M.digits(t.b),r=M.digits(t.op==='−'?t.a-t.b:t.a+t.b);
    let html='<div class="column-math" aria-label="Conta organizada por centenas, dezenas e unidades"><span></span>'+['Centenas','Dezenas','Unidades'].map(x=>`<div class="col-head">${x}</div>`).join('');
    html+='<span></span>'+[0,1,2].map(i=>`<div class="digit carry">${input({label:`Anotação de troca: ${['centenas','dezenas','unidades'][i]}`,kind:'number'},t.id+'-carry'+i,current.answers[t.id+'-carry'+i]??'',false)}</div>`).join('');
    [a,b,r].forEach((row,ri)=>{html+=`<div class="op">${ri===1?t.op:''}</div>`+row.map((d,i)=>{const key=t.id+'-row'+ri+'col'+i;return `<div class="digit ${ri===2?'result':''}">${ri===2||t.editable?input({label:`${['Primeira parcela','Segunda parcela','Resultado'][ri]}: ${['centenas','dezenas','unidades'][i]}`,kind:'number'},key,current.answers[key]??'',false):d}</div>`;}).join('');});
    return html+'</div><p class="small">Os espaços amarelos são para anotar as trocas, se precisar.</p>';
  }
  function blocks(counts,editable=false){return `<div class="blocks">${counts.map((n,i)=>`<div class="block-col"><h3>${['Centenas','Dezenas','Unidades'][i]}</h3><div class="block-pieces" aria-hidden="true">${Array.from({length:n},()=>`<span class="base-piece ${['hundred','ten','unit'][i]}"></span>`).join('')}</div><p class="block-count" aria-label="${n} ${['centenas','dezenas','unidades'][i]}">${n}</p>${editable?`<div class="button-row"><button data-build="${i}:-1" aria-label="Tirar uma ${['centena','dezena','unidade'][i]}">−</button><button data-build="${i}:1" aria-label="Adicionar uma ${['centena','dezena','unidade'][i]}">+</button></div>`:''}</div>`).join('')}</div>`;}
  function support(t){
    const key=t.id,existing=current.supports[key];const counts=existing?.counts??(t.op==='−'?M.digits(t.a):M.digits(t.a).map((d,i)=>d+M.digits(t.b)[i]));
    const message=existing?.message??(t.op==='−'?`Comece com ${t.a}. Para tirar ${t.b}, veja se precisa trocar uma centena por 10 dezenas ou uma dezena por 10 unidades.`:'Aqui estão as pecinhas das duas parcelas juntas. Troque grupos de 10 para organizar o total.');
    return `<details class="operation-support" data-support="${key}"><summary>Entender com o quadro de trocas</summary><div class="exchange-panel" data-exchange-panel="${key}">${exchangeContent(t,counts,message)}</div></details>`;
  }
  function exchangeContent(t,counts,message){return `${blocks(counts)}<div class="button-row">${t.op==='−'?`<button data-exchange="${t.id}:borrowHundred" ${counts[0]<1?'disabled':''}>1 centena → 10 dezenas</button><button data-exchange="${t.id}:borrowTen" ${counts[1]<1?'disabled':''}>1 dezena → 10 unidades</button><button data-exchange="${t.id}:subtract">Tirar ${t.b}</button>`:`<button data-exchange="${t.id}:units" ${counts[2]<10?'disabled':''}>10 unidades → 1 dezena</button><button data-exchange="${t.id}:tens" ${counts[1]<10?'disabled':''}>10 dezenas → 1 centena</button>`}<button data-exchange="${t.id}:reset">Recomeçar as peças</button></div><p class="exchange-message" role="status">${esc(message)}</p><p class="small">Este é um apoio para pensar. Depois registre sua conta nos campos.</p>`;}
  function renderChart(sheet,t){
    const {start,holes,highlight}=sheet.chart;
    return `<p class="small">Na coluna amarela, observe os saltos de uma linha para a outra.</p><p class="small chart-scroll-note">Deslize o quadro para o lado para ver todas as colunas.</p><div class="number-chart-scroll"><div class="number-grid" aria-label="Quadro numérico de ${start} a ${start+99}">${Array.from({length:100},(_,i)=>`<div class="grid-cell ${i%10===highlight?'highlight':''}">${holes.includes(i)?input(t.fields.find(f=>f.id==='cell'+i),fieldKey(t,{id:'cell'+i}),current.answers[fieldKey(t,{id:'cell'+i})]??'',false):`<button data-chart-mark="${start+i}" aria-label="Marcar ${start+i}" aria-pressed="${(current.selections.chartMarks??[]).includes(start+i)}">${start+i}</button>`}</div>`).join('')}</div></div>`;
  }
  function renderTask(t,sheet,index){
    let body='';
    if(t.type==='chart')body=renderChart(sheet,t);
    else if(t.type==='chartFind')body='<p class="small">Use o quadro acima. As marcas aparecem como círculos.</p><div class="feedback" data-task-feedback="'+t.id+'"></div>';
    else if(t.type==='choice')body=`<div class="choice-list">${t.choices.map((seq,i)=>`<button data-choice="${t.id}:${i}" aria-pressed="${current.selections[t.id]===i}">${seq.join(' – ')}</button>`).join('')}</div><div class="feedback" data-task-feedback="${t.id}"></div>`;
    else if(t.type==='compose')body=`<p class="number-pill">${t.target}</p><div class="compose-grid">${t.cells.map((n,i)=>`<button data-paint="${t.id}:${i}" aria-label="Parcela ${n}, posição ${i+1}" aria-pressed="${(current.selections[t.id]??[]).includes(i)}">${n}</button>`).join('')}</div><p class="selection-sum" data-sum="${t.id}">${selectionSum(t)}</p><div class="feedback" data-task-feedback="${t.id}"></div>`;
    else if(t.type==='operation'){
      body=`${t.icon?`<span class="task-icon" aria-hidden="true">${t.icon}</span>`:''}${column(t)}${!t.columnsOnly?t.fields.map(f=>field(f,t)).join(''):''}<div class="feedback" data-task-feedback="${t.id}"></div>${t.sentence?field({id:'sentence',label:'Agora escreva uma frase com sua resposta',kind:'text'},t):''}${support(t)}`;
    }else{body=t.fields.map(f=>field(f,t)).join('');}
    if(t.type==='create')body+=`<label class="answer-label" for="create-direction">Direção</label><select id="create-direction" data-direction><option value="up" ${current.answers.direction!=='down'?'selected':''}>Crescente: aumenta</option><option value="down" ${current.answers.direction==='down'?'selected':''}>Decrescente: diminui</option></select>${field({id:'sequence',label:'Escreva sua sequência (pelo menos 4 números)',kind:'sequence'},t)}<button data-test-create>Conferir minha regra</button><div class="feedback" data-task-feedback="${t.id}"></div>`;
    const modelFields=t.fields.filter(f=>f.kind==='text');
    return `<article class="activity ${t.wide?'wide':''}" data-task="${t.id}"><div class="activity-head"><span class="activity-number">${index+1}</span><h2>${esc(t.prompt)}</h2></div>${body}${t.hint?hint(esc(t.hint)):''}${modelFields.length?`<details class="hint"><summary>Comparar com uma ideia de resposta</summary>${modelFields.map(f=>`<p><strong>${esc(f.label)}</strong><br>${esc(f.model)}</p>`).join('')}<p>Você pode explicar com suas palavras. Esta escrita é para comparar junto com um adulto.</p></details>`:''}${scratch(t)}</article>`;
  }
  function selectionSum(t){const selected=current.selections[t.id]??[];return selected.length?selected.map(i=>t.cells[i]).join(' + ')+' = '+selected.reduce((a,i)=>a+t.cells[i],0):'Toque nos retângulos para pintar.';}
  function showSheet(id){
    drawObservers.forEach(o=>o.disconnect());drawObservers=[];
    current=sheetState(id);const s=current.sheet,index=M.pages.findIndex(p=>p.id===id);
    root.innerHTML=`<a href="#inicio" class="back">← Meu caderno</a><header class="sheet-top"><div><p class="eyebrow">${id==='revisao'?'REVISÃO COMPLEMENTAR':'CADERNO · PÁGINA '+id} · ${s.variant===0?'NÚMEROS DO LIVRO':'TREINO '+(s.variant+1)}</p><h1>${esc(s.title)}</h1><p class="small">${esc(s.subtitle)}. Responda na ordem que quiser.</p></div><div class="button-row"><button id="new-numbers">↻ Novos números</button><button class="plain" id="book-numbers">Voltar aos números do livro</button></div></header><nav class="page-rail" aria-label="Páginas do caderno">${M.pages.map(p=>`<a href="#folha/${p.id}" ${id===p.id?'aria-current="page"':''} aria-label="${p.id==='revisao'?'Revisão complementar':'Página '+p.id+': '+esc(p.title)}">${p.id==='revisao'?'Revisão':p.id}</a>`).join('')}</nav><p class="writing-note">✎ Escreva nos campos com a caneta ou o teclado. <button class="plain" data-help>Ajuda para usar a Apple Pencil</button></p><section class="sheet-paper" aria-label="Exercícios da folha ${id}">${id==='103'?`<div class="table-wrap"><table><caption>Quantos assentos há em cada trem?</caption><thead><tr><th scope="col">Trem</th><th scope="col">Assentos</th></tr></thead><tbody>${[...s.trains,null].map((n,i)=>`<tr><td>${train(['#d2b05d','#a4ac9f','#9a8aaf','#ca896c','#566f5d'][i])}<span class="small">Trem ${i+1}</span></td><td>${n??'Complete na atividade 1'}</td></tr>`).join('')}</tbody></table></div>`:''}<div class="activities">${s.tasks.map((t,i)=>renderTask(t,s,i)).join('')}</div><p id="sheet-status" class="sheet-status" role="status" aria-live="polite"></p><div class="sheet-bottom"><button id="check-sheet" class="primary">Conferir respostas</button><div class="button-row">${index>0?`<a class="cta" href="#folha/${M.pages[index-1].id}">← Folha anterior</a>`:''}${index<M.pages.length-1?`<a class="cta" href="#folha/${M.pages[index+1].id}">Próxima folha →</a>`:'<a class="cta" href="#inicio">Meu caderno →</a>'}</div></div></section><p class="page-note">${id==='revisao'?'Temas das orientações de estudo; atividades adicionais às páginas fotografadas.':'Recriação interativa do tipo de atividade do livro. Textos e desenhos foram adaptados para a tela.'} Você pode conferir e continuar tentando. <button class="plain" id="print-sheet">Imprimir esta folha</button></p>`;
    bindSheet();if(current.checked)checkSheet(false);
    const active=$('.page-rail [aria-current]');if(active)active.parentElement.scrollLeft=Math.max(0,active.offsetLeft-active.parentElement.offsetLeft-120);
  }
  function feedback(key,result){const box=document.querySelector(`[data-feedback="${key}"]`),inp=document.querySelector(`[data-answer="${key}"]`);if(box){box.textContent=result.message;box.className='feedback '+(result.status==='ok'?'ok':result.status==='self'||result.status==='empty'?'neutral':'');}if(inp){inp.classList.toggle('correct',result.status==='ok');inp.setAttribute('aria-invalid',result.status==='retry'?'true':'false');}}
  function taskFeedback(id,ok,message){const box=document.querySelector(`[data-task-feedback="${id}"]`);if(box){box.textContent=message;box.className='feedback '+(ok?'ok':'');}}
  function checkCreate(){
    const t=current.sheet.tasks.find(t=>t.type==='create');if(!t)return null;
    const start=current.answers['create-start']??'',end=current.answers['create-end']??'',step=current.answers['create-step']??'',seq=current.answers['create-sequence']??'',dir=current.answers.direction==='down'?-1:1;
    if(!String(start).trim()||!String(end).trim()||!String(step).trim()||!String(seq).trim()){taskFeedback(t.id,false,'Escolha o início, o fim, o salto e escreva sua sequência.');return false;}
    const values=String(seq).replace(/[–—−]/g,'-').split(/[\s,;\-]+/).filter(Boolean);
    const ok=/^\d+$/.test(start)&&/^\d+$/.test(end)&&/^\d+$/.test(step)&&Number(step)>0&&values.length>=4&&Number(values.at(-1))===Number(end)&&values.every((v,i)=>/^\d+$/.test(v)&&Number(v)===Number(start)+dir*Number(step)*i&&Number(v)<=999);
    taskFeedback(t.id,ok,ok?'Sua sequência segue a regra que você criou!':'Confira o começo e o fim, os saltos e a direção. Use pelo menos 4 números entre 0 e 999.');return ok;
  }
  function checkSheet(announce=true){
    let okCount=0,retry=0,empty=0,self=0;
    for(const t of current.sheet.tasks){
      if(t.type==='create'){const result=checkCreate();result?okCount++:retry++;continue;}
      if(t.type==='operation'){
        const rows=t.editable?[0,1,2]:[2],expected=[t.a,t.b,t.op==='−'?t.a-t.b:t.a+t.b];
        let all=true,has=false;
        rows.forEach(ri=>M.digits(expected[ri]).forEach((d,i)=>{const key=t.id+'-row'+ri+'col'+i,value=current.answers[key]??'';const result=M.checkField({kind:'number',expected:d},value);feedback(key,result);if(String(value).trim())has=true;if(result.status!=='ok')all=false;}));
        if(all)okCount++;else if(has)retry++;else empty++;
        taskFeedback(t.id,all,all?'A conta ficou organizada. Isso mesmo!':has?'Confira as colunas. Na casa que está vazia na quantidade, escreva 0.':'Você pode resolver esta conta depois.');
      }
      if(t.type==='compose'){
        const sel=current.selections[t.id]??[],sum=sel.reduce((a,i)=>a+t.cells[i],0),ok=sel.length>0&&sum===t.target;
        if(!sel.length)empty++;else if(ok)okCount++;else retry++;
        taskFeedback(t.id,ok,ok?'Você formou o número! Esse é um jeito possível.':sel.length?`Você juntou ${sum}. ${sum<t.target?'Falta um pouco.':'Passou do número.'} Pode pintar ou despintar.`:'Pinte quando quiser.');
      }
      if(t.type==='choice'){
        const selected=current.selections[t.id],ok=selected===t.correct;if(selected===undefined)empty++;else if(ok)okCount++;else retry++;
        taskFeedback(t.id,ok,ok?'Isso! A direção e os saltos combinam com o pedido.':selected===undefined?'Escolha uma sequência quando quiser.':'Confira se aumenta ou diminui e conte o tamanho dos saltos.');
      }
      if(t.type==='chartFind'){
        const chosen=current.selections.chartMarks??[],ok=t.targets.length===chosen.length&&t.targets.every(n=>chosen.includes(n));
        if(!chosen.length)empty++;else if(ok)okCount++;else retry++;
        taskFeedback(t.id,ok,ok?'Você encontrou os três números!':'Confira os três nomes. Toque novamente para tirar uma marca.');
      }
      if(!t.columnsOnly)for(const f of t.fields){const key=fieldKey(t,f),result=M.checkField(f,current.answers[key]);feedback(key,result);if(result.status==='ok')okCount++;else if(result.status==='retry')retry++;else if(result.status==='empty')empty++;else self++;}
      if(t.distinct){const seen=new Set();for(const f of t.fields){const key=fieldKey(t,f),p=M.parseExpression(current.answers[key]??'');if(p?.sum===f.expected){if(seen.has(p.key)){feedback(key,{status:'retry',message:'Essa é a mesma decomposição em outra ordem. Tente separar uma parcela de outro jeito.'});retry++;}seen.add(p.key);}}}
    }
    const status=$('#sheet-status');if(status)status.textContent=retry?'Há respostas para olhar de novo. Os espaços marcados têm uma pista; você pode continuar em qualquer folha.':okCount?'Bom trabalho! Você pode continuar praticando.'+(empty?' Há espaços para fazer depois.':'')+(self?' Compare suas explicações com os modelos de apoio.':''):'Escreva um pouco e confira quando quiser.';
    if(announce){current.checked=true;save();}
  }
  function exchange(id,action){
    const t=current.sheet.tasks.find(t=>t.id===id);if(!t)return;
    const initial=()=>t.op==='−'?M.digits(t.a):M.digits(t.a).map((n,i)=>n+M.digits(t.b)[i]);
    const st=current.supports[id]??={counts:initial(),message:'',subtracted:false};const c=st.counts;
    if(action==='reset'){st.counts=initial();st.subtracted=false;st.message='As peças voltaram ao começo.';}
    else if(st.subtracted)st.message='Você já retirou essa quantidade. Recomece as peças para explorar de novo.';
    else if(action==='units'&&c[2]>=10){c[2]-=10;c[1]++;st.message='10 unidades viraram 1 dezena. A quantidade total continua igual!';}
    else if(action==='tens'&&c[1]>=10){c[1]-=10;c[0]++;st.message='10 dezenas viraram 1 centena. A quantidade total continua igual!';}
    else if(action==='borrowHundred'&&c[0]>0){c[0]--;c[1]+=10;st.message='1 centena virou 10 dezenas. Agora você pode tirar as dezenas de que precisa.';}
    else if(action==='borrowTen'&&c[1]>0){c[1]--;c[2]+=10;st.message='1 dezena virou 10 unidades. Agora você pode tirar as unidades de que precisa.';}
    else if(action==='subtract'){const d=M.digits(t.b);if(c.every((n,i)=>n>=d[i])){st.counts=c.map((n,i)=>n-d[i]);st.subtracted=true;st.message=`Você tirou ${t.b}. Conte as peças que ficaram e escreva a resposta.`;}else st.message='Faltam peças em uma das colunas para retirar. Faça uma troca primeiro.';}
    document.querySelector(`[data-exchange-panel="${id}"]`).innerHTML=exchangeContent(t,st.counts,st.message);save();
  }
  function bindSheet(){
    $('#new-numbers').onclick=()=>replaceSheet(false);$('#book-numbers').onclick=()=>replaceSheet(true);
    $('#check-sheet').onclick=()=>checkSheet();$('#print-sheet').onclick=()=>window.print();
    root.querySelectorAll('[data-scratch]').forEach(el=>{el.addEventListener('toggle',()=>{if(el.open)setupCanvas(el.querySelector('canvas'));});});
  }
  function onAnswer(event){const el=event.target;if(!current||!el.dataset.answer)return;const key=el.dataset.answer;current.answers[key]=el.value;el.classList.remove('correct');el.removeAttribute('aria-invalid');const fb=document.querySelector(`[data-feedback="${key}"]`);if(fb)fb.textContent='';const task=el.closest('[data-task]');if(task){const tf=task.querySelector('[data-task-feedback]');if(tf)tf.textContent='';}const status=$('#sheet-status');if(status)status.textContent='Resposta alterada. Confira quando quiser.';current.checked=false;save();}
  function replaceSheet(original){const id=current.sheet.id;const dialog=$('#replace-dialog');$('#replace-title').textContent=original?'Voltar aos números do livro?':'Praticar com novos números?';dialog.returnValue='';dialog.showModal();dialog.onclose=()=>{if(dialog.returnValue!=='confirm')return;const variant=original?0:current.sheet.variant+1;store.sheets[id]={sheet:M.make(id,variant),answers:{},selections:{},strokes:{},supports:{},checked:false};save();showSheet(id);root.focus({preventScroll:true});};}
  function setupCanvas(canvas){
    if(canvas.dataset.ready)return;canvas.dataset.ready='true';const owner=current,id=canvas.dataset.canvas;owner.strokes[id]??=[];
    const ctx=canvas.getContext('2d');let stroke=null;
    function redraw(){const rect=canvas.getBoundingClientRect();if(!rect.width)return;const dpr=window.devicePixelRatio||1;canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.scale(dpr,dpr);ctx.strokeStyle='#345544';ctx.lineWidth=2.8;ctx.lineCap='round';ctx.lineJoin='round';for(const line of owner.strokes[id]){if(!line.length)continue;ctx.beginPath();ctx.moveTo(line[0][0]*rect.width,line[0][1]*rect.height);if(line.length===1){ctx.lineTo(line[0][0]*rect.width+.2,line[0][1]*rect.height+.2);}else line.slice(1).forEach(p=>ctx.lineTo(p[0]*rect.width,p[1]*rect.height));ctx.stroke();}}
    const point=e=>{const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];};
    let activePointer=null;
    canvas.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(stroke)return;e.preventDefault();activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);stroke=[point(e)];owner.strokes[id].push(stroke);redraw();};
    canvas.onpointermove=e=>{if(!stroke||e.pointerId!==activePointer)return;e.preventDefault();stroke.push(point(e));redraw();};
    const finish=e=>{if(!stroke||e.pointerId!==activePointer)return;stroke=null;activePointer=null;save();};canvas.onpointerup=finish;canvas.onpointercancel=finish;canvas.onlostpointercapture=finish;
    canvas.setAttribute('aria-description',`Rascunho recuperado com ${owner.strokes[id].length} traços.`);
    canvas._redraw=redraw;const observer=new ResizeObserver(redraw);observer.observe(canvas);drawObservers.push(observer);redraw();
  }
  function labState(){store.lab??={target:234,counts:[0,0,0],start:200,step:2,direction:1,trail:[200],answer:'',message:''};return store.lab;}
  function showLab(){
    const l=labState();current=null;
    root.innerHTML=`<a href="#inicio" class="back">← Meu caderno</a><header class="sheet-top"><div><p class="eyebrow">EXPLORAR E BRINCAR</p><h1>Laboratório de números</h1><p class="small">Toque, observe e conte o que você descobriu. Sem tempo para terminar.</p></div></header><div class="lab-tabs" aria-label="Escolha uma brincadeira"><button data-lab-mode="build" aria-pressed="${labMode==='build'}">Montar um número</button><button data-lab-mode="jump" aria-pressed="${labMode==='jump'}">Caminho dos saltos</button></div><div id="lab-body"></div>`;
    if(labMode==='build')$('#lab-body').innerHTML=`<div class="lab-layout"><section class="lab-panel"><p class="eyebrow">DESAFIO DAS PECINHAS</p><h2>Vamos montar este número?</h2><p class="big-target">${l.target}</p><p>Use os botões + e − para colocar ou tirar peças. Cada placa vale 100; cada barra vale 10; cada cubinho vale 1.</p><button id="build-target">↻ Outro número</button><details class="hint"><summary>Uma pista</summary><p>Comece olhando as centenas. Depois complete com dezenas e unidades. 10 unidades valem 1 dezena.</p></details><a class="lab-link" href="#folha/103">Praticar a escrita na folha 103 →</a></section><section class="lab-panel"><div id="build-blocks">${blocks(l.counts,true)}</div><p class="number-pill" id="build-total">Você montou: ${l.counts[0]*100+l.counts[1]*10+l.counts[2]}</p><p id="build-message" role="status">${esc(l.message||'Cada toque muda a quantidade. Experimente!')}</p><div class="button-row"><button id="build-exchange-units">10 unidades → 1 dezena</button><button id="build-exchange-tens">10 dezenas → 1 centena</button><button id="build-reset">Tirar todas as peças</button></div></section></div>`;
    else $('#lab-body').innerHTML=`<div class="lab-layout"><section class="lab-panel"><p class="eyebrow">UM SALTO DE CADA VEZ</p><h2>Descubra o próximo número</h2><p>Comece em <strong>${l.start}</strong> e ${l.direction===1?'avance':'volte'} de <strong>${l.step} em ${l.step}</strong>.</p><div class="jump-track" aria-label="Números do caminho">${l.trail.map(n=>`<span>${n}</span>`).join('')}</div><label for="jump-answer" class="answer-label">Qual é o próximo número?</label><input id="jump-answer" type="text" class="answer" inputmode="numeric" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" value="${esc(l.answer)}"><div class="button-row" style="margin-top:18px"><button id="jump-check" class="primary">Experimentar o salto</button><button id="jump-show">Ver um salto de apoio</button></div><p id="jump-message" role="status" class="exchange-message">${esc(l.jumpMessage||'Conte o tamanho do salto e escreva sua ideia.')}</p></section><section class="lab-panel"><h2>Escolha o caminho</h2><label class="answer-label" for="jump-step">Tamanho dos saltos</label><select id="jump-step">${[1,2,3,4,5,10,50].map(n=>`<option value="${n}" ${n===l.step?'selected':''}>De ${n} em ${n}</option>`).join('')}</select><label class="answer-label" for="jump-direction" style="margin-top:22px">Direção</label><select id="jump-direction"><option value="1" ${l.direction===1?'selected':''}>Crescente: aumenta</option><option value="-1" ${l.direction===-1?'selected':''}>Decrescente: diminui</option></select><p style="margin-top:24px"><button id="jump-reset">↻ Começar outro caminho</button></p><p class="small">Mudar o caminho começa uma nova sequência. As folhas do caderno ficam guardadas.</p><a href="#folha/161" class="lab-link">Escrever sequências na folha 161 →</a></section></div>`;
  }
  function renderBuild(){const l=labState(),total=l.counts[0]*100+l.counts[1]*10+l.counts[2];$('#build-blocks').innerHTML=blocks(l.counts,true);$('#build-total').textContent='Você montou: '+total;$('#build-message').textContent=total===l.target?'Você montou o número! Que outros jeitos de representar essa quantidade você consegue descobrir?':total<l.target?'Ainda faltam '+(l.target-total)+'. Escolha as peças para completar.':'Passou '+(total-l.target)+'. Experimente tirar ou trocar peças.';$('#build-exchange-units').disabled=l.counts[2]<10;$('#build-exchange-tens').disabled=l.counts[1]<10;save();}
  function newJump(){const l=labState();l.step=Number($('#jump-step').value);l.direction=Number($('#jump-direction').value);l.start=l.direction===1?M.rand(100,400):M.rand(600,950);l.trail=[l.start];l.answer='';l.jumpMessage='Um caminho novo. Vamos descobrir o primeiro salto?';save();showLab();}
  function jump(show){const l=labState(),last=l.trail.at(-1),next=last+l.step*l.direction;const value=$('#jump-answer').value.trim();l.answer=value;if(next<0||next>999){l.jumpMessage='Chegamos ao fim deste caminho. Escolha outro para continuar.';save();showLab();return;}if(show||/^\d+$/.test(value)&&Number(value)===next){l.trail.push(next);if(l.trail.length>10)l.trail.shift();l.answer='';l.jumpMessage=show?`${last} ${l.direction===1?'+':'−'} ${l.step} = ${next}. Esse foi um salto de apoio. Agora experimente o próximo.`:`Isso! ${last} ${l.direction===1?'+':'−'} ${l.step} = ${next}. Continue se quiser.`;save();showLab();$('#jump-answer').focus({preventScroll:true});}else{l.jumpMessage=`Comece em ${last} e conte ${l.step} ${l.direction===1?'para a frente':'para trás'}. Pode tentar outra vez ou ver um salto de apoio.`;$('#jump-message').textContent=l.jumpMessage;save();}}
  root.addEventListener('input',e=>{onAnswer(e);if(e.target.id==='jump-answer'){labState().answer=e.target.value;save();}});
  root.addEventListener('change',e=>{if(e.target.matches('[data-direction]')&&current){current.answers.direction=e.target.value;current.checked=false;save();}if(e.target.id==='jump-step'||e.target.id==='jump-direction')newJump();});
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-help'))$('#help').showModal();
    if(b.dataset.choice){const [id,i]=b.dataset.choice.split(':');current.selections[id]=Number(i);document.querySelectorAll(`[data-choice^="${id}:"]`).forEach(el=>el.setAttribute('aria-pressed',String(el===b)));taskFeedback(id,false,'');current.checked=false;save();}
    if(b.dataset.paint){const [id,index]=b.dataset.paint.split(':'),i=Number(index),selected=current.selections[id]??=[];const pos=selected.indexOf(i);if(pos>=0)selected.splice(pos,1);else selected.push(i);current.selections[id]=selected;b.setAttribute('aria-pressed',String(selected.includes(i)));document.querySelector(`[data-sum="${id}"]`).textContent=selectionSum(current.sheet.tasks.find(t=>t.id===id));taskFeedback(id,false,'');current.checked=false;save();}
    if(b.dataset.chartMark){const n=Number(b.dataset.chartMark),selected=current.selections.chartMarks??=[],i=selected.indexOf(n);if(i>=0)selected.splice(i,1);else selected.push(n);current.selections.chartMarks=selected;b.setAttribute('aria-pressed',String(selected.includes(n)));taskFeedback('find',false,'');current.checked=false;save();}
    if(b.dataset.exchange){const [id,action]=b.dataset.exchange.split(':');exchange(id,action);}
    if(b.dataset.undo||b.dataset.clear){const id=b.dataset.undo||b.dataset.clear;if(b.dataset.undo)current.strokes[id]?.pop();else current.strokes[id]=[];document.querySelector(`[data-canvas="${id}"]`)._redraw?.();save();}
    if(b.hasAttribute('data-test-create')){checkCreate();save();}
    if(b.dataset.labMode){labMode=b.dataset.labMode;showLab();if(labMode==='build')renderBuild();}
    if(b.dataset.build){const l=labState(),[i,d]=b.dataset.build.split(':').map(Number),total=l.counts[0]*100+l.counts[1]*10+l.counts[2];if(l.counts[i]+d>=0&&l.counts[i]+d<=19&&total+d*[100,10,1][i]<=999){l.counts[i]+=d;}renderBuild();}
    if(b.id==='build-target'){const l=labState();l.target=M.rand(101,899);l.counts=[0,0,0];l.message='Um número novo. Vamos montar?';save();showLab();renderBuild();}
    if(b.id==='build-reset'){labState().counts=[0,0,0];renderBuild();}
    if(b.id==='build-exchange-units'){const c=labState().counts;if(c[2]>=10){c[2]-=10;c[1]++;}renderBuild();}
    if(b.id==='build-exchange-tens'){const c=labState().counts;if(c[1]>=10){c[1]-=10;c[0]++;}renderBuild();}
    if(b.id==='jump-reset')newJump();if(b.id==='jump-check')jump(false);if(b.id==='jump-show')jump(true);
  });
  root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='jump-answer'){e.preventDefault();jump(false);}});
  $('#help-button').onclick=()=>$('#help').showModal();
  $('.skip').onclick=e=>{e.preventDefault();root.focus();root.scrollIntoView();};
  function route(){drawObservers.forEach(o=>o.disconnect());drawObservers=[];const match=location.hash.match(/^#folha\/(\w+)$/);if(match&&M.pages.some(p=>p.id===match[1]))showSheet(match[1]);else if(location.hash==='#laboratorio'){showLab();if(labMode==='build')renderBuild();}else{current=null;home();}document.title=(current?current.sheet.title:'O caderno de Matemática')+' · Julia';window.scrollTo(0,0);root.focus({preventScroll:true});}
  window.addEventListener('hashchange',route);window.addEventListener('pagehide',save);route();
  if(saveFailed)$('#save-status').textContent='Não foi possível recuperar o estudo anterior. As novas respostas ficam nesta sessão.';
})();
