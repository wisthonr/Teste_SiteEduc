/* Conteúdo didático derivado. Nenhuma fotografia ou anotação privada é usada. */
const MathBook = (() => {
  const pages = [
    ['103','Assentos do trem','Valor posicional e decomposição'],
    ['160','Regularidade dos números','Explore o quadro numérico'],
    ['161','Elabore sequências','Conte para a frente e para trás'],
    ['162','Descubra a regra','Observe, explique e crie sequências'],
    ['163','Componha números','Pinte parcelas para formar um número'],
    ['164','Coleções','Junte quantidades e faça trocas'],
    ['165','Mais coleções','Some e decomponha o resultado'],
    ['166','Arrecadar para doar','Do desenho à conta armada'],
    ['167','Bolas para brincar','Some e encontre outras decomposições'],
    ['168','Uma caixa de roupas','Duas maneiras de resolver'],
    ['169','Vamos calcular','Quatro adições no quadro de ordens'],
    ['revisao','Um pouco mais','Antecessor, sucessor, comparação e subtração']
  ].map(([id,title,subtitle]) => ({id,title,subtitle}));
  const rand=(min,max,rng=Math.random)=>Math.floor(rng()*(max-min+1))+min;
  const digits=n=>[Math.floor(n/100),Math.floor(n/10)%10,n%10];
  const decomposed=n=>digits(n).map((d,i)=>d*[100,10,1][i]).filter(Boolean);
  function words(n){
    const u=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
    const teen=['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
    const t=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
    const c=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
    if(n<10)return u[n];if(n<20)return teen[n-10];if(n<100)return t[Math.floor(n/10)]+(n%10?' e '+u[n%10]:'');
    if(n===100)return 'cem';return c[Math.floor(n/100)]+(n%100?' e '+words(n%100):'');
  }
  const numeric=(id,label,expected)=>({id,label,kind:'number',expected});
  const text=(id,label,model)=>({id,label,kind:'text',model});
  const expression=(id,label,n,positional=false)=>({id,label,kind:'expression',expected:n,positional});
  const sequence=(id,start,step,count,label='Escreva a sequência')=>({id,label,kind:'sequence',expected:Array.from({length:count},(_,i)=>start+step*i)});
  const task=(id,prompt,fields,extra={})=>({id,prompt,fields,...extra});
  function addition(id,a,b,context,extra={}){
    return task(id,context,[numeric('total','Ao todo:',a+b)],{type:'operation',a,b,op:'+',...extra});
  }
  function make(page,variant=0,rng=Math.random){
    const original=variant===0, pick=(n,lo=110,hi=780)=>original?n:rand(lo,hi,rng);
    const meta=pages.find(p=>p.id===page);if(!meta)throw Error('Folha desconhecida');
    const sheet={...meta,variant,tasks:[]}; const put=(...t)=>sheet.tasks.push(...t);
    if(page==='103'){
      const a=pick(367,201,499),b=pick(498,301,499),n=pick(269,210,299),x=original?245:[2,3,5,6,7,8,9][rand(0,6,rng)]*100+45,y=original?412:400+rand(1,3,rng)*10+2;
      sheet.trains=[a,x,y,b];sheet.composition=[100,100,50,n-250];
      if(n<250)sheet.composition=[100,100,10,n-210];
      put(task('a',`Complete os assentos do último trem. Junte: ${sheet.composition.join(' + ')}.`,[numeric('seats','Quantidade de assentos',n)]),
      task('b',`O algarismo 4 vale o mesmo em ${x} e ${y}? Explique.`,[{...numeric('value1',`Em ${x}, o 4 vale`,40),kind:'placevalue'},{...numeric('value2',`Em ${y}, o 4 vale`,400),kind:'placevalue'},text('why','Conte o que você percebeu','Não. Em um número, o 4 ocupa as dezenas e vale 40; no outro, ocupa as centenas e vale 400.')]),
      task('c',`Decomponha ${a} pelo valor de cada algarismo.`,[expression('decomp','Centenas + dezenas + unidades',a,true)],{hint:'Olhe cada posição: centenas, dezenas e unidades.'}),
      task('d',`Decomponha ${b} de três maneiras diferentes.`,[expression('way1','1ª maneira',b),expression('way2','2ª maneira',b),expression('way3','3ª maneira',b)],{distinct:true,hint:'Você pode separar uma centena em duas parcelas de 50, por exemplo. Mude as parcelas, não apenas a ordem.'}));
    }
    if(page==='160'){
      const start=original?701:rand(1,8,rng)*100+1;
      const holes=[8,14,31,37,55,60,76,79,83]; const targets=[start+68,start+41,start+53];
      sheet.chart={start,holes,targets,highlight:2};
      put(task('chart','Complete os espaços do quadro numérico.',holes.map(i=>numeric('cell'+i,`Espaço após ${start+i-1}`,start+i)),{type:'chart',wide:true}),
      task('rule','Observe o quadro. O que acontece com os números?',[
      text('across','Indo para a direita…','Aumentam de 1 em 1.'),text('down','Descendo na coluna amarela…','Aumentam de 10 em 10.')]),
      task('find',`Toque no quadro para marcar: ${targets.map(words).join('; ')}.`,[],{type:'chartFind',targets,hint:'Toque outra vez para tirar a marca. Os três números já estão impressos no quadro.'}),
      task('pairs',`Escreva os números de ${targets[1]} até ${targets[2]}, aumentando de 2 em 2.`,[sequence('seq',targets[1],2,7)]));
    }
    if(page==='161'){
      const a=pick(200,120,400),b=original?535:rand(40,150,rng)*5,c=pick(627,300,900),d=pick(140,200,700),e=original?510:rand(20,80,rng)*10;
      put(task('a',`De ${a} a ${a+12}: ordem crescente, de 2 em 2.`,[sequence('seq',a,2,7)]),
      task('b',`De ${b} a ${b+25}: ordem crescente, de 5 em 5.`,[sequence('seq',b,5,6)]),
      task('c',`De ${c-15} a ${c}: ordem decrescente, de 3 em 3.`,[sequence('seq',c,-3,6)]),
      task('d',`Pinte a sequência de ${d-20} a ${d}, em ordem decrescente, de 4 em 4.`,[],{type:'choice',choices:[Array.from({length:6},(_,i)=>d+i*4),Array.from({length:6},(_,i)=>d-i*5),Array.from({length:6},(_,i)=>d-i*4)],correct:2}),
      task('e',`Pinte a sequência de ${e} a ${e+50}, em ordem crescente, de 10 em 10.`,[],{type:'choice',choices:[Array.from({length:6},(_,i)=>e+50-i*10),Array.from({length:6},(_,i)=>e+i*10),Array.from({length:6},(_,i)=>e+i*2)],correct:1}));
    }
    if(page==='162'){
      const a=pick(705,300,900),b=original?410:rand(20,80,rng)*10,c=pick(664,200,900),d=pick(513,200,800);
      put(task('rules','Escreva como cada sequência muda.',[
        text('rule1',Array.from({length:6},(_,i)=>a-i).join(' – '),'Diminui de 1 em 1.'),
        text('rule2',Array.from({length:6},(_,i)=>b-i*10).join(' – '),'Diminui de 10 em 10.'),
        text('rule3',Array.from({length:6},(_,i)=>c+i*2).join(' – '),'Aumenta de 2 em 2.')],{wide:true}),
      task('seq',`Escreva de ${d} a ${d+15}, em ordem crescente, de 3 em 3.`,[sequence('seq',d,3,6)]),
      task('create','Agora invente uma sequência para alguém resolver.',[numeric('start','Começa em…',null),numeric('end','Termina em…',null),numeric('step','Salta de quanto em quanto?',null)],{type:'create',hint:'Escolha um início, um fim, um salto e uma direção. Depois escreva pelo menos quatro números seguindo sua regra.'}));
    }
    if(page==='163'){
      const originals=[98,804,387,542,163,542];
      const originalCells=[
        [34,40,40,31,50,8,90,5,39,72,2,70,1,4,18,26,67,20,58,80],
        [314,40,32,100,66,100,10,91,400,65,321,70,4,112,500,3,108,34,204,178],
        [300,150,90,207,80,240,147,400,180,100,325,2,7,60,29,200,182,287,385,10],
        [250,100,78,22,500,100,1,83,30,36,50,76,1,255,250,100,200,42,40,20],
        [24,31,55,21,98,100,30,83,30,65,50,76,50,132,21,3,10,49,60,122],
        [250,200,12,55,10,512,402,100,42,35,112,50,40,390,2,22,500,400,302,84]
      ];
      originals.forEach((n,i)=>{n=pick(n,60,899);let parts=decomposed(n);if(parts.length<2)parts=[n-10,10];
      const cells=[...parts];while(cells.length<20)cells.push(rand(1,Math.max(100,n),rng));
      for(let k=cells.length-1;k>0;k--){const j=rand(0,k,rng);[cells[k],cells[j]]=[cells[j],cells[k]];}
      put(task('paint'+i,`Pinte os retângulos que, juntos, formam ${n}.`,[],{type:'compose',target:n,cells:original?originalCells[i]:cells,hint:'Pode haver mais de um jeito certo. Toque para pintar ou despintar.'}));});
    }
    if(page==='164'){
      const a=pick(318,110,450),b=pick(104,20,240),c=pick(237,110,490),d=pick(19,11,89);
      put(addition('stamps',a,b,`Uma coleção tem ${a} selos antigos e ${b} novos. Quantos selos há ao todo?`,{icon:'✉️'}),
      addition('cards',c,d,`Um álbum tinha ${c} cartões-postais. Chegaram mais ${d}. Quantos cartões há agora?`,{icon:'🏞️'}));
    }
    if(page==='165'){
      const a=pick(306,200,450),b=pick(225,110,300),c=pick(466,200,650),d=pick(48,20,99),n=pick(693,101,899);
      put(addition('coins',a,b,`No baú há ${a} moedas brasileiras e ${b} estrangeiras. Quantas moedas há ao todo?`,{icon:'🪙'}),addition('pencils',c,d,`Uma coleção tinha ${c} lápis e ganhou mais ${d}. Com quantos lápis ficou?`,{icon:'✏️'}),task('keys',`Decomponha o número ${n} da coleção de chaveiros.`,[expression('decomp','Escreva uma adição',n,true)]));
    }
    if(page==='166'){
      const a=pick(328,200,450),b=pick(218,110,350);
      put(addition('books',a,b,`Uma campanha arrecadou ${a} gibis e ${b} livros. Quantos materiais de leitura foram arrecadados?`,{wide:true,editable:true,icon:'📚',sentence:true}));
    }
    if(page==='167'){
      const a=pick(349,200,500),b=pick(144,110,290);
      put(addition('balls',a,b,`Havia ${a} bolas de futebol. Chegaram ${b} bolas de vôlei. Quantas bolas há ao todo?`,{editable:true,icon:'⚽',sentence:true}),
      task('ways',`Decomponha ${a+b}, o total de bolas, de duas formas diferentes.`,[expression('way1','1ª maneira',a+b),expression('way2','2ª maneira',a+b)],{distinct:true}));
    }
    if(page==='168'){
      const a=pick(285,180,480),b=pick(169,110,350);
      put(addition('clothes',a,b,`Uma caixa tem ${a} camisetas para adultos e ${b} para crianças. Quantas camisetas há para doar?`,{editable:true,icon:'👕',wide:true,sentence:true}),
      task('another',`Mostre outro jeito de calcular ${a} + ${b}.`,[text('explain','Explique seu jeito',`Uma possibilidade: ${decomposed(a).join(' + ')} + ${decomposed(b).join(' + ')} = ${a+b}.`)],{wide:true,hint:'Você pode decompor os números, fazer um desenho ou completar uma dezena. Seu jeito pode ser diferente do modelo.'}));
    }
    if(page==='169'){
      [[537,374],[689,146],[293,268],[408,355]].forEach(([a,b],i)=>{
        if(!original){a=rand(200,600,rng);b=rand(100,Math.min(390,999-a),rng);if(a%10+b%10<10){a=a-a%10+7;b=b-b%10+5;if(a+b>999)b-=10;}}
        put(addition('sum'+i,a,b,`Calcule ${a} + ${b}.`,{columnsOnly:true}));
      });
    }
    if(page==='revisao'){
      const n=pick(500,101,898),a=pick(723,210,780),b=pick(248,100,199),nums=original?[407,470,704,740]:Array.from({length:4},(_,i)=>210+i*100+rand(0,79,rng));
      put(task('neighbors',`Quem vem logo antes e logo depois de ${n}?`,[numeric('before','Antecessor',n-1),numeric('after','Sucessor',n+1)]),
      task('order',`Escreva em ordem crescente: ${[nums[2],nums[0],nums[3],nums[1]].join(' · ')}.`,[{id:'seq',label:'Do menor para o maior',kind:'sequence',expected:[...nums].sort((a,b)=>a-b)}]),
      task('subtract',`Havia ${a} figurinhas. Foram doadas ${b}. Quantas ficaram?`,[numeric('total','Ficaram…',a-b)],{type:'operation',a,b,op:'−',icon:'🎴'}),
      task('words',`Escreva ${pick(608,101,999)} por extenso.`,[],{type:'words'}));
      const t=sheet.tasks.at(-1);t.number=Number(t.prompt.match(/\d+/)[0]);t.fields=[{id:'written',label:'Escreva o nome do número',kind:'words',expected:words(t.number)}];
    }
    return sheet;
  }
  const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.,;!?]/g,'').replace(/\s+/g,' ').trim();
  let namedNumbers;
  function parseQuantity(value){
    const raw=String(value).trim();
    // Never guess OCR substitutions such as 2 -> Z or silently accept decimals.
    if(!/^[\p{L}\d\s]+[.!]?$/u.test(raw))return null;
    const s=normalize(raw);
    namedNumbers??=new Map(Array.from({length:1000},(_,n)=>[normalize(words(n)),n]));
    const number=x=>{x=x.replace(/\buma\b/g,'um').replace(/\bduas\b/g,'dois').replace(/\b(duzent|trezent|quatrocent|quinhent|seiscent|setecent|oitocent|novecent)as\b/g,'$1os');return /^\d+$/.test(x)?Number(x):namedNumbers.get(x);};
    const unit=s.match(/^(.+?)\s*(unidades?|dezenas?|centenas?)$/);
    const count=number(unit?unit[1].trim():s);
    if(!Number.isSafeInteger(count)||count<0)return null;
    const n=count*(unit?(unit[2].startsWith('centena')?100:unit[2].startsWith('dezena')?10:1):1);
    return n<=999?n:null;
  }
  function prepareSheet(sheet){
    let changed=false;
    if(sheet.id==='103')for(const t of sheet.tasks){
      if(t.id==='b')for(const f of t.fields)if(['value1','value2'].includes(f.id)&&f.kind==='number'){f.kind='placevalue';changed=true;}
      if(t.id==='c'&&t.hint?.startsWith('Olhe cada posição.')&&t.hint!=='Olhe cada posição: centenas, dezenas e unidades.'){t.hint='Olhe cada posição: centenas, dezenas e unidades.';changed=true;}
    }
    return changed;
  }
  function fieldGuide(f,t={fields:[]}){
    const forbidden=[f.expected,...(t.fields??[]).map(x=>x.expected),t.a,t.b,t.op==='−'?t.a-t.b:t.a+t.b];
    const sample=[25,36,18,72].find(n=>!forbidden.includes(n)&&(f.kind!=='words'||normalize(words(n))!==normalize(f.expected)));
    if(f.kind==='placevalue'){const factor=f.expected>=100?100:f.expected>=10?10:1,unit=factor===100?'centenas':factor===10?'dezenas':'unidades';const count=[3,2,5].find(n=>!forbidden.includes(n*factor)),name=count===2?'duas':words(count);return {suffix:'',sample:String(count*factor),text:`Exemplo de outro valor: ${count*factor}, ${count} ${unit} ou ${name} ${unit}. Você pode escrever o valor em algarismos ou com palavras.`};}
    if(f.kind==='number')return {suffix:' — escreva só o número',sample:String(sample),text:`Exemplo de formato (outra situação): ${sample}. Use só algarismos, sem palavras.`};
    if(f.kind==='expression'){
      const n=[235,146,328,512].find(n=>!forbidden.includes(n));
      return {suffix:' — escreva uma adição',sample:String(n),text:`Exemplo de outro número: ${n} = ${decomposed(n).join(' + ')}. Use as parcelas do número pedido na atividade.`};
    }
    if(f.kind==='sequence'){let start=10;while(Array.isArray(f.expected)&&Array.from({length:4},(_,i)=>start+2*i).some(n=>f.expected.includes(n)))start+=20;const seq=Array.from({length:4},(_,i)=>start+2*i);return {suffix:' — números separados por espaços ou traços',sample:seq.join(' '),text:`Exemplo de outra sequência: ${seq.join(' – ')}. Escreva todos os números da sequência pedida.`};}
    if(f.kind==='words')return {suffix:' — use palavras',sample:String(sample),text:`Exemplo de outro número: ${sample} → ${words(sample)}. Aqui, escreva por extenso o número pedido.`};
    if(f.id==='sentence')return {suffix:'',sample:String(sample),text:`Exemplo de outra situação: “Ao todo, ficaram ${sample} objetos.” Use o resultado e os objetos da sua atividade.`};
    if(f.id==='why')return {suffix:'',sample:'',text:'Formato para explicar: “O algarismo está na ... e vale ... .” Complete com o que você percebeu.'};
    if(['across','down'].includes(f.id)||/^rule\d+$/.test(f.id))return {suffix:'',sample:'',text:'Formato para explicar: “Os números [aumentam ou diminuem] de ... em ... .” Complete com a regra que você observou.'};
    return {suffix:'',sample:'',text:'Escreva sua ideia em português, com suas palavras. Você também pode usar “Escrever livre, sem converter” e fazer pausas.'};
  }
  function parseExpression(s){
    s=String(s).replace(/\s/g,'');const sides=s.split('=');if(sides.length>2)return null;
    const parse=x=>/^\d+(\+\d+)+$/.test(x)?x.split('+').map(Number):null;
    let parts=parse(sides[0]),total=sides[1];
    if(!parts&&sides.length===2&&/^\d+$/.test(sides[0])){parts=parse(sides[1]);total=sides[0];}
    if(!parts||parts.some(x=>!Number.isSafeInteger(x)||x<0)||total!==undefined&&!/^\d+$/.test(total))return null;
    const sum=parts.reduce((a,b)=>a+b,0);if(total!==undefined&&Number(total)!==sum)return null;
    return {parts,sum,key:parts.filter(Boolean).sort((a,b)=>a-b).join('+')};
  }
  function checkField(f,value){
    const s=String(value??'').trim();if(!s)return {status:'empty',message:'Pode deixar para depois.'};
    if(f.kind==='text'||f.expected===null)return {status:'self',message:'Resposta aberta: compare sua ideia com o modelo de apoio.'};
    let ok=false;
    if(f.kind==='placevalue'){
      const n=parseQuantity(s);ok=n===f.expected;
      if(n===null)return {status:'retry',message:'Confira o texto que o iPad colocou. Você pode usar o valor em algarismos ou escrever a quantidade com dezenas, centenas ou unidades.'};
    }
    if(f.kind==='number')ok=/^\d+$/.test(s)&&Number(s)===f.expected;
    if(f.kind==='words')ok=normalize(s)===normalize(f.expected)||normalize(s).replace('catorze','quatorze')===normalize(f.expected);
    if(f.kind==='sequence'){const cleaned=s.replace(/[–—−]/g,'-');const vals=cleaned.split(/[\s,;\-]+/).filter(Boolean);ok=vals.length===f.expected.length&&vals.every((v,i)=>/^\d+$/.test(v)&&Number(v)===f.expected[i]);}
    if(f.kind==='expression'){const p=parseExpression(s);ok=p?.sum===f.expected;if(ok&&f.positional)ok=p.parts.filter(Boolean).sort((a,b)=>a-b).join('+')===decomposed(f.expected).sort((a,b)=>a-b).join('+');}
    return {status:ok?'ok':'retry',message:ok?'Isso mesmo!':'Vamos olhar mais uma vez? Use o apoio se quiser.'};
  }
  return {pages,make,words,digits,decomposed,parseExpression,parseQuantity,prepareSheet,fieldGuide,normalize,checkField,rand};
})();
if(typeof module!=='undefined')module.exports=MathBook;
