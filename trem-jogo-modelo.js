/* Desafios resolvíveis com caixas inteiras, no conteúdo de Matemática do 2º ano. */
const CargoGame = (() => {
  function makeLevel(index, round = 0) {
    const r = round % 12;
    let title, prompt, hint, zones, values, solution, sequence = false;
    const zone = (label, target, count, showTarget = true) => ({label, target, count, showTarget});
    switch (index) {
      case 0:
        title = 'Duas encomendas, seis caixas';
        prompt = 'Complete os dois pedidos. Cada vagão leva exatamente 3 caixas. Duas caixas vão ficar no depósito.';
        values = [100+10*r,20+r,7,80+10*r,60+r,18,50+r,9];
        zones = [zone('Bosque',127+11*r,3),zone('Lago',158+11*r,3)];
        solution = [0,0,0,1,1,1,-1,-1];
        hint = 'Comece por uma caixa grande. Calcule quanto falta para o pedido e procure duas caixas que completem esse valor.';
        break;
      case 1:
        title = 'Uma partilha com caixas fechadas';
        prompt = `Reparta ${36+6*r} biscoitos igualmente entre 3 vagões. Use todas as caixas. Cada vagão deve levar 3 caixas.`;
        values = [6+r,4+r,2,6+r,4+r,2,6+r,4+r,2];
        zones = ['Bosque','Lago','Praça'].map(name=>zone(name,12+2*r,3,false));
        solution = [0,0,0,1,1,1,2,2,2];
        hint = 'Descubra quanto cada vagão deve receber. As caixas têm quantidades diferentes; tente combinar uma maior, uma média e uma pequena.';
        break;
      case 2: {
        title = 'O código do trilho';
        const start = 627+10*r, step = 3+r;
        prompt = `O trem passou por ${start} e ${start-step}. Arraste os próximos quatro números, na ordem. O salto é sempre igual.`;
        values = [2,3,4,5,6,7].map(n=>start-n*step);
        zones = [2,3,4,5].map((n,i)=>zone(`${i+1}º lugar`,start-n*step,1,false));
        solution = [0,1,2,3,-1,-1]; sequence = true;
        hint = `Compare ${start} com ${start-step}. O trem volta ${step} casas por vez. Continue a partir do segundo número.`;
        break;
      }
      case 3:
        title = 'O que ainda falta entregar?';
        prompt = `O pedido tem ${284+30*r} lápis. Já entregamos ${167+15*r}. Carregue o restante usando exatamente 3 caixas.`;
        values = [70+10*r,40+5*r,7,90+10*r,60+5*r,9];
        zones = [zone('Última entrega',117+15*r,3,false)];
        solution = [0,0,0,-1,-1,-1];
        hint = 'Tire a quantidade já entregue do pedido inteiro. Depois forme esse resultado com três caixas.';
        break;
      case 4: {
        title = 'Receitas em dobro e triplo';
        const base = 14+r;
        prompt = `Uma receita rende ${base} bolinhos. O Bosque pediu o dobro e o Lago pediu o triplo. Use 2 caixas no Bosque e 3 no Lago.`;
        values = [base+4,base-4,base+5,base-5,base,base+2,7];
        zones = [zone('Dobro',2*base,2,false),zone('Triplo',3*base,3,false)];
        solution = [0,0,1,1,1,-1,-1];
        hint = `O dobro reúne duas porções de ${base}. O triplo reúne três. Descubra os dois totais antes de escolher as caixas.`;
        break;
      }
      case 5: {
        title = 'O grande piquenique';
        const base = 6+r;
        prompt = `No Bosque são 4 crianças, com ${base} frutas para cada uma. O Lago precisa do dobro desse total. A Praça precisa da metade do total do Bosque.`;
        values = [2*base,2*base,3*base,3*base,2*base,base,base,5*base,base+1];
        zones = [zone('Bosque · 4 crianças',4*base,2,false),zone('Lago · dobro',8*base,3,false),zone('Praça · metade',2*base,2,false)];
        solution = [0,0,1,1,1,2,2,-1,-1];
        hint = `Primeiro calcule 4 grupos de ${base}. Use esse resultado para descobrir o dobro e a metade. Cada caixa tem a quantidade escrita nela.`;
        break;
      }
      default: throw new Error('Fase desconhecida');
    }
    // A posição inicial muda sem alterar a identidade ou o conteúdo das caixas.
    const pieces = values.map((value,id)=>({id,value}));
    const order = pieces.map((_,i)=>i).sort((a,b)=>((a*5+round*3)%values.length)-((b*5+round*3)%values.length));
    return {index,title,prompt,hint,zones,pieces,solution,order,sequence};
  }
  function empty(level) {return {places:level.pieces.map(()=>-1),history:[],done:false};}
  function restore(level, saved) {
    const valid = list => Array.isArray(list) && list.length===level.pieces.length && list.every(n=>Number.isInteger(n)&&n>=-1&&n<level.zones.length);
    if (!saved || !valid(saved.places)) return empty(level);
    const state = {places:[...saved.places], history:(Array.isArray(saved.history)?saved.history:[]).filter(valid).slice(-60),done:false};
    state.done=!!saved.done && check(level,state).ok;
    return state;
  }
  function totals(level, state) {
    return level.zones.map((zone,i)=>{
      const boxes=level.pieces.filter(p=>state.places[p.id]===i);
      return {count:boxes.length,total:boxes.reduce((sum,p)=>sum+p.value,0)};
    });
  }
  function move(level, state, id, destination) {
    if(state.done || !Number.isInteger(id) || !level.pieces[id] || !Number.isInteger(destination) || destination < -1 || destination >= level.zones.length) return false;
    if(state.places[id]===destination) return false;
    if(destination>=0 && state.places.filter(n=>n===destination).length >= level.zones[destination].count) return false;
    state.history.push([...state.places]);state.history=state.history.slice(-60);
    state.places[id]=destination;
    return true;
  }
  function undo(state) {
    if(state.done || !state.history.length) return false;
    state.places=state.history.pop();return true;
  }
  function check(level,state) {
    const loads=totals(level,state);
    const reports=level.zones.map((zone,i)=>{
      const load=loads[i];
      if(load.count!==zone.count) return {ok:false,text:`${zone.label}: coloque ${zone.count} ${level.sequence?'número':'caixas'}. Você colocou ${load.count}.`};
      if(load.total!==zone.target) {
        if(level.sequence)return {ok:false,text:`Confira o ${i+1}º lugar. Continue com o mesmo salto a partir do número anterior.`};
        return {ok:false,text:`${zone.label}: a quantidade ainda não confere. Calcule o pedido, some os números das suas caixas e compare. Depois tente outra combinação.`};
      }
      return {ok:true,text:`${zone.label}: combinação conferida!`};
    });
    return {ok:reports.every(r=>r.ok),reports};
  }
  return {makeLevel,empty,restore,totals,move,undo,check};
})();
if(typeof module!=='undefined')module.exports=CargoGame;
