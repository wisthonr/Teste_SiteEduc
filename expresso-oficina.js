const Oficina = (function createWorkshop(){
  const sum=values=>values.reduce((acc,v)=>acc+v,0);
  const count=(j,s)=>s.count??j.initial??0;
  const take=(s)=>s.selection||[];
  const loads=(j,s)=>s.loads||Array(j.groups).fill(0);
  const digits=n=>[Math.floor(n/100),Math.floor(n/10)%10,n%10];
  function material(j,s){
    if(s.boxes)return s.boxes;
    const a=digits(j.a),b=digits(j.b);
    return j.op==='+'?a.map((v,i)=>v+b[i]):a;
  }
  function exchangeAt(j,s){
    const m=material(j,s), b=digits(j.b);
    if(j.op==='+')return [2,1].find(i=>m[i]>=10);
    if(m[2]<b[2])return m[1]>0?2:1;
    if(m[1]<b[1])return 1;
  }
  function targetRows(j){
    const pair=j.wanted.map(i=>j.rows[i][1]);
    return j.op==='+'?sum(pair):Math.abs(pair[0]-pair[1]);
  }
  function adjust(j,s,action,n){
    const selected=take(s), quantity=count(j,s);
    switch(action){
      case 'trade':{
        const i=exchangeAt(j,s);
        if(i===undefined)return;
        const m=material(j,s).slice(), direction=j.op==='+'?1:-1;
        m[i]-=10*direction;m[i-1]+=direction;
        s.boxes=m;s.trades=[...(s.trades||[]),i];s.marked=[];break;
      }
      case 'pick':
        if(j.kind==='track'){
          if(selected.length<j.solution.length && (j.repeat||!selected.includes(n)))s.selection=[...selected,n];
        }else{
          s.selection=selected.includes(n)?selected.filter(x=>x!==n):[...selected,n];
        }
        break;
      case 'undo-pick':s.selection=selected.slice(0,-1);break;
      case 'choose':s.choice=n;break;
      case 'add-one':{
        const list=loads(j,s).slice();
        if(n<0||n>=list.length||sum(list)>=j.groups*j.each)return;
        list[n]++;s.loads=list;s.history=[...(s.history||[]),[n]];break;
      }
      case 'round':{
        const list=loads(j,s);
        if(sum(list)+j.groups>j.groups*j.each)return;
        s.loads=list.map(x=>x+1);s.history=[...(s.history||[]),list.map((_,i)=>i)];break;
      }
      case 'undo-load':{
        if(!s.history?.length)return;
        const list=loads(j,s).slice();
        for(const i of s.history.pop())list[i]--;
        s.loads=list;break;
      }
      case 'more':{
        const max=j.kind==='batch'?j.groups+1:j.total/j.each;
        s.count=Math.min(quantity+1,max);break;
      }
      case 'less':s.count=Math.max(quantity-1,0);break;
      case 'seat':
        if(selected.includes(n))s.selection=selected.filter(i=>i!==n);
        else if(selected.length<j.people)s.selection=[...selected,n];
        break;
    }
  }
  function storeSum(j,s){
    const parts=take(s).map(i=>j.pieces[i]).sort((a,b)=>b-a);
    if(sum(parts)!==j.target)return 'Olhe o total das fichas. Quanto falta ou quanto passou?';
    if(s.ways?.some(old=>old.join()===parts.join()))return 'Essa soma já está no bilhete. Troque uma parcela por outras de mesmo valor.';
    if((s.ways||[]).length<2)s.ways=[...(s.ways||[]),parts];
    s.selection=[];
    return '';
  }
  function judge(j,s){
    const selection=take(s);
    const number=String(s.answer??'').trim();
    const numeric=(want,more)=>/^\d+$/.test(number)&&Number(number)===want?null:more;
    let error,why=j.why;
    switch(j.kind){
      case 'exchange':{
        const total=j.op==='+'?j.a+j.b:j.a-j.b;
        const result=(s.result||[]).map(x=>String(x??'').trim());
        const expected=digits(total);
        for(let i=2;i>=0;i--){
          if((i===0&&expected[i]===0&&!result[i])||result[i]===String(expected[i]))continue;
          const place=['centenas','dezenas','unidades'][i];
          return {error:`Confira a coluna das ${place}. ${j.op==='+'?'Some os algarismos dessa coluna e confira as trocas.':'Use a quantidade que ficou após a troca, se houve troca, e retire o algarismo de baixo.'}`};
        }
        why=`${j.a} ${j.op} ${j.b} = ${total}. ${j.op==='+'?'A entrega tem':'A diferença é de'} ${total} ${j.unit}.`;break;
      }
      case 'track':{
        const values=selection.map(i=>j.picks[i]);
        if(values.length!==j.solution.length)error='Preencha todos os espaços vazios.';
        else{
          const i=values.findIndex((v,index)=>v!==j.solution[index]);
          if(i!==-1)error=`Olhe o ${i+1}º elemento que você escolheu. ${j.hint}`;
        }break;
      }
      case 'quiz':if(s.choice!==j.key)error=j.hint;break;
      case 'word':if(s.handReviewed && s.ink?.length){why='Você comparou sua escrita com a referência. '+MathBook.words(j.n)+'.';break;}if(MathBook.checkField({kind:'words',expected:MathBook.words(j.n)},number).status!=='ok')error='Leia as três partes em voz alta e ligue as palavras com “e”.';break;
      case 'sum':if(s.ways?.length!==2)error='Guarde duas somas com parcelas diferentes.';else why=s.ways.map(p=>`${p.join(' + ')} = ${j.target}`).join('  •  ');break;
      case 'table':{
        if(selection.length!==j.wanted.length||!j.wanted.every(i=>selection.includes(i)))error='Volte à pergunta e marque só as linhas que ela cita.';
        else error=numeric(targetRows(j),j.hint);
        const pair=j.wanted.map(i=>j.rows[i][1]).sort((a,b)=>b-a);
        why=`${pair.join(` ${j.op} `)} = ${targetRows(j)} ${j.unit}.`;break;
      }
      case 'load':
      case 'share':{
        const list=loads(j,s);
        if(list.some(x=>x!==j.each))error=j.kind==='load'?`Confira se cada grupo tem exatamente ${j.each} peças. Use “Desfazer” para retirar a última entrega.`:'Os grupos precisam ficar iguais e a cesta deve ficar vazia. Experimente desfazer a última entrega.';
        else error=numeric(j.kind==='load'?j.groups*j.each:j.each,'Conte outra vez e registre sua descoberta.');
        why=j.kind==='load'?`${Array(j.groups).fill(j.each).join(' + ')} = ${j.groups*j.each}. São ${j.groups} × ${j.each} ${j.item}.`:`${j.groups*j.each} ÷ ${j.groups} = ${j.each}. Cada grupo recebeu ${j.each} ${j.item}.`;break;
      }
      case 'batch':
        if(count(j,s)!==j.groups)error='Confira quantas porções o pedido pede. Cada porção precisa ter a mesma quantidade.';
        else error=numeric(j.groups*j.each,'Junte a quantidade de todas as porções.');
        why=`${Array(j.groups).fill(j.each).join(' + ')} = ${j.groups*j.each}. São ${j.groups*j.each} ${j.item}.`;break;
      case 'fraction':
        if(selection.length!==j.total/j.parts)error=`Você marcou ${selection.length}. Imagine ${j.parts} partes iguais desta barra e conte uma delas.`;
        why=`${j.total} ÷ ${j.parts} = ${j.total/j.parts}. Uma parte tem ${j.total/j.parts} quadradinhos.`;break;
      case 'bundles':
        if(count(j,s)*j.each!==j.total)error='Ainda há flores no cesto. Monte os buquês que faltam.';
        else error=numeric(j.total/j.each,'Conte os buquês prontos. A pergunta pede o número de buquês.');
        why=`${j.total} ÷ ${j.each} = ${j.total/j.each}. São ${j.total/j.each} buquês.`;break;
      case 'seats':{
        const capacity=j.rows*j.per;
        if(selection.length!==Math.min(capacity,j.people))error=j.object==='piões'?'Entregue todos os piões.':'Embarque todos os passageiros.';
        else if(j.object==='piões'&&s.choice!==0)error='Observe a fila. Ainda há alguém sem brinquedo?';
        else error=numeric(Math.abs(capacity-j.people),j.hint);
        why=j.object==='piões'?`${j.rows} × ${j.per} = ${capacity} piões. Faltam ${j.people-capacity} piões.`:`${j.rows} × ${j.per} = ${capacity} lugares. Ficam ${capacity-j.people} poltronas vazias.`;break;
      }
      case 'story':{
        if(!s.note?.trim()&&!s.ink?.length)error='Escreva ou desenhe sua pergunta para o próximo maquinista.';
        else if(!s.reviewed)error='Compare sua encomenda com o bilhete de revisão e marque a caixinha.';
        why=`Sua encomenda ficou guardada. ${s.groups||j.defaultGroups||3} grupos de ${s.each||j.defaultEach||4} dão ${(s.groups||j.defaultGroups||3)*(s.each||j.defaultEach||4)} ao todo.`;break;
      }
    }
    return {error,why};
  }
  return {count,take,loads,digits,material,exchangeAt,adjust,storeSum,judge,sum};
})();
if (typeof module !== 'undefined') module.exports = Oficina;
