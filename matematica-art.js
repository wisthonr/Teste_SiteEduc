/* Ilustrações OpenMoji 17.0.0, CC BY-SA 4.0. Ver assets/openmoji/CREDITOS.md. */
const MathArt = (() => {
  const themes={
    '103':{name:'train',main:'1F682',side:'2600',tokens:['','',''],color:'sky'},
    '160':{name:'pond',main:'1F438',side:'1F98B',tokens:['1','2','3'],color:'mint'},
    '161':{name:'hops',main:'1F430',side:'2728',tokens:['→','→','→'],color:'peach'},
    '162':{name:'detective',main:'1F50D',side:'1F9E9',tokens:['●','▲','●'],color:'lavender'},
    '163':{name:'paint',main:'1F3A8',side:'270F',tokens:['+','=',''],color:'lemon'},
    '164':{name:'postcards',main:'1F48C',side:'1F304',tokens:['','',''],color:'sky'},
    '165':{name:'treasure',main:'1FA99',side:'270F',tokens:['','',''],color:'peach'},
    '166':{name:'books',main:'1F4DA',side:'1F381',tokens:['','',''],color:'mint'},
    '167':{name:'sport',main:'26BD',side:'1F3D0',tokens:['','',''],color:'sky'},
    '168':{name:'clothes',main:'1F455',side:'1F4E6',tokens:['','',''],color:'peach'},
    '169':{name:'abacus',main:'1F9EE',side:'270F',tokens:['+','=',''],color:'lavender'},
    'revisao':{name:'space',main:'1F680',side:'2728',tokens:['','',''],color:'lavender'},
    'lab':{name:'lab',main:'1F9EA',side:'1F9E9',tokens:['+','=',''],color:'mint'}
  };
  function picture(code,cls=''){return `<img class="${cls}" src="assets/openmoji/${code}.svg" alt="" width="160" height="160" decoding="async" draggable="false">`;}
  function scene(id,size='card'){
    const t=themes[id]??themes.lab;
    return `<span class="picture-scene scene-${t.name} art-${t.color} picture-${size}" aria-hidden="true"><span class="scene-sun"></span><span class="scene-cloud cloud-one"></span><span class="scene-cloud cloud-two"></span><span class="scene-ground"></span><span class="scene-path"></span>${picture(t.main,'scene-main')}${picture(t.side,'scene-side')}<span class="scene-tokens">${t.tokens.map((x,i)=>`<i class="token token-${i}">${x}</i>`).join('')}</span><span class="scene-spark spark-one">✦</span><span class="scene-spark spark-two">✧</span></span>`;
  }
  function hero(){return `<div class="adventure-art" aria-hidden="true"><span class="adventure-hill hill-back"></span><span class="adventure-hill hill-front"></span><span class="adventure-cloud"></span>${picture('2600','adventure-sun')}${picture('1F98B','adventure-butterfly')}<span class="adventure-notebook"><span class="notebook-rings"></span><span class="notebook-numbers"><b>1</b><b>2</b><b>3</b></span>${picture('1F4D6','adventure-book')}<span class="notebook-marks">＋ − ＝</span></span>${picture('1F682','adventure-train')}${picture('270F','adventure-pencil')}<span class="adventure-star star-a">✦</span><span class="adventure-star star-b">✦</span></div>`;}
  const icons={stamps:'1F48C',cards:'1F304',coins:'1FA99',pencils:'270F',keys:'1FA99',books:'1F4DA',balls:'26BD',clothes:'1F455',subtract:'1F4E6'};
  function task(t){const code=icons[t.id];return code?`<span class="exercise-picture" aria-hidden="true">${picture(code)}</span>`:'';}
  return {scene,hero,task};
})();
