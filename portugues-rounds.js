// Rodadas adicionais mantêm as habilidades da apostila com novos textos e palavras.
const PT_PRACTICE = {
  stories: [
    ['Lia','uma chave','no jardim','um portão','LI-A','A chave abriu o portão.'],
    ['Beto','um mapa','na praia','um baú','BE-TO','O mapa mostrou o caminho.'],
    ['Nina','uma pena','na floresta','um pássaro','NI-NA','A pena caiu da árvore.'],
    ['Davi','uma concha','na areia','um barco','DA-VI','A concha brilhou ao sol.'],
    ['Rita','uma carta','na varanda','um castelo','RI-TA','A carta chegou de manhã.'],
    ['Luca','uma semente','na horta','uma flor','LU-CA','A semente virou uma planta.']
  ],
  h: [['FILA','FILHA','filha'],['VELA','VELHA','velha'],['MALA','MALHA','malha'],['BICO','BICHO','bicho'],['CAMA','CHAMA','chama'],['CÃO','CHÃO','chão']],
  spelling: [['CHAVE','CHUVA','CHA-VE','CHU-VA'],['PEIXE','FAIXA','PEI-XE','FAI-XA'],['CHINELO','BOLACHA','CHI-NE-LO','BO-LA-CHA'],['AMEIXA','LIXO','A-MEI-XA','LI-XO'],['FLECHA','CHUPETA','FLE-CHA','CHU-PE-TA'],['BRUXA','ENXADA','BRU-XA','EN-XA-DA']],
  sizes: [['PATO','PATINHO','PATÃO'],['BOLA','BOLINHA','BOLÃO'],['CASA','CASINHA','CASARÃO'],['COPO','COPINHO','COPÃO'],['RATO','RATINHO','RATÃO'],['SAPATO','SAPATINHO','SAPATÃO']],
  poems: [
    ['O passarinho','O passarinho no ninho\nrecebe muito carinho.\nQuando começa a cantar,\ntoda a mata quer escutar.','passarinho','ninho','carinho','mata'],
    ['O balão','Lá no céu vai o balão,\ncolorindo a imensidão.\nUma menina na janela\nolha a paisagem tão bela.','balão','janela','bela','céu'],
    ['O jardim','A borboleta pousou na flor,\nque perfumava tudo ao redor.\nNo jardim, uma joaninha\ncaminhava bem sozinha.','borboleta','joaninha','sozinha','jardim'],
    ['Na lagoa','O sapo pulou na lagoa,\npertinho de uma canoa.\nUm peixinho, bem ligeiro,\nse escondeu do companheiro.','sapo','lagoa','canoa','lagoa'],
    ['A estrela','Uma estrela reluzente\niluminou a noite da gente.\nUma criança, com emoção,\nguardou seu brilho no coração.','estrela','emoção','coração','noite'],
    ['O mar','O barquinho foi navegar,\nseguindo as ondas do mar.\nNa areia ficou um castelo,\nfeito de um sonho tão belo.','barquinho','castelo','belo','mar']
  ],
  synonyms: [['ALEGRE','CONTENTE','TRISTE'],['BONITO','BELO','FEIO'],['RÁPIDO','VELOZ','LENTO'],['CALMO','TRANQUILO','AGITADO'],['GRANDE','ENORME','PEQUENO'],['PERTO','PRÓXIMO','DISTANTE']],
  opposites: [['ALTO','BAIXO','GRANDE'],['QUENTE','FRIO','MORNO'],['CHEIO','VAZIO','LOTADO'],['CLARO','ESCURO','ILUMINADO'],['FORTE','FRACO','RESISTENTE'],['LIMPO','SUJO','LAVADO']],
  visual: [['CHUVA','gota','água'],['ÁRVORE','árvore','folha'],['LUA','lua','noite'],['CORAÇÃO','coração','amor'],['ONDA','onda','mar'],['PIPA','pipa','vento']]
};

function portuguesePractice(unit, round) {
  const index = round % 6;
  const base = PT[unit];
  const written = (prompt, model) => [prompt, null, model];
  const choice = (prompt, correct, wrong, hint) => {
    const options = [correct, ...wrong];
    const shift = (round + unit) % options.length;
    return [prompt, [...options.slice(shift), ...options.slice(0, shift)], (options.length - shift) % options.length, hint];
  };
  let text, intro, tasks;
  switch (unit) {
    case 0: {
      const [name, object, place, destination, syllables, sentence] = PT_PRACTICE.stories[index];
      intro = `A descoberta de ${name}`;
      text = `${name} encontrou ${object} ${place}. De repente, o objeto começou a falar! Ele contou como chegar até ${destination}. ${name} chamou uma amiga para viver essa aventura.`;
      tasks = [
        choice(`Quem encontrou ${object}?`, name, ['Uma professora', 'Um guarda'], `Releia o começo: ${name} fez a descoberta.`),
        written(`O que ${name} encontrou e onde?`, `${object}, ${place}.`),
        written(`Separe o nome ${name.toUpperCase()} em sílabas.`, syllables),
        written(`Reescreva com espaços e ponto-final: ${sentence.replaceAll(' ', '').replace('.', '').toUpperCase()}`, sentence)
      ]; break;
    }
    case 1: {
      const [before, after] = PT_PRACTICE.h[index];
      intro = 'Uma transformação com H';
      text = `Experimente acrescentar H à palavra ${before}. Leia a nova palavra em voz baixa e observe o que mudou.`;
      tasks = [
        choice(`Qual palavra se forma ao acrescentar H a ${before}?`, after, [before, 'H' + before], `Observe a escrita: ${before} → ${after}.`),
        written(`Escreva a palavra ${after} e circule o H.`, `${after}. O H deve aparecer junto da outra consoante.`),
        written(`Agora retire o H de ${after}. Que palavra aparece?`, before),
        written(`Crie uma frase usando ${after}.`, `Resposta pessoal com ${after}. Confira os espaços e o ponto-final.`)
      ]; break;
    }
    case 2: {
      const [first, second, splitFirst, splitSecond] = PT_PRACTICE.spelling[index];
      const letters = first.includes('CH') ? 'CH' : 'X';
      const wrong = first.replace(letters, letters === 'CH' ? 'X' : 'CH');
      intro = 'Palavras para investigar';
      text = 'Escolha a escrita correta. Depois escreva, separe as sílabas e forme uma frase.';
      tasks = [
        choice(`Qual é a escrita correta para ${['o objeto que abre a fechadura', 'o animal que vive na água', 'o calçado de usar nos pés', 'a fruta roxa com caroço', 'o objeto lançado por um arco', 'a personagem que voa numa vassoura'][index]}?`, first, [wrong], `A escrita correta é ${first}, com ${letters}.`),
        written(`Separe ${second} em sílabas.`, splitSecond),
        written(`Escreva ${first} com uma sílaba em cada espaço.`, splitFirst),
        written(`Crie uma frase com ${second}.`, `Resposta pessoal com ${second}. Confira a escrita e o ponto-final.`)
      ]; break;
    }
    case 3: {
      const [word, small, big] = PT_PRACTICE.sizes[index];
      intro = 'Uma palavra de cada tamanho';
      text = `Hoje vamos transformar a palavra ${word}. Podemos usar outras formas para indicar tamanho pequeno ou grande.`;
      tasks = [
        choice(`Como chamamos ${word} em tamanho pequeno?`, small, [big, word], `${small} indica tamanho pequeno.`),
        written(`Escreva o aumentativo de ${word}.`, big),
        written(`Escreva uma frase usando ${small}.`, `Resposta pessoal com ${small}.`),
        written(`Agora escreva outra frase usando ${big}.`, `Resposta pessoal com ${big}. Use uma ideia diferente da frase anterior.`)
      ]; break;
    }
    case 4: {
      const [title, poem, character, rhyme, match, place] = PT_PRACTICE.poems[index];
      intro = title; text = poem;
      tasks = [
        choice(`Quem aparece no começo de “${title}”?`, character, ['um elefante', 'uma girafa'], `Releia o primeiro verso: ${character}.`),
        written(`Encontre no poema uma palavra que rima com ${rhyme.toUpperCase()}.`, match),
        written(`Copie o verso que contém a palavra ${place.toUpperCase()}.`, poem.split('\n').find(line => line.toLowerCase().includes(place))),
        written(`Crie um novo verso para “${title}” usando ${match.toUpperCase()}.`, `Resposta pessoal com ${match}, relacionada ao poema.`)
      ]; break;
    }
    case 5: {
      const [word, synonym, opposite] = PT_PRACTICE.synonyms[index];
      intro = 'O mesmo sentido com outra palavra';
      text = `Leia as palavras e procure um sentido parecido com ${word}. Depois, use esse par em suas frases.`;
      tasks = [
        choice(`Qual palavra tem sentido parecido com ${word}?`, synonym, [opposite, 'AZUL'], `${word} e ${synonym} têm sentidos parecidos.`),
        written(`Escreva o par de palavras amigas de hoje, começando por ${word}.`, `${word} — ${synonym}`),
        written(`Crie uma frase com ${word}.`, `Resposta pessoal com ${word}.`),
        written(`Reescreva sua frase trocando ${word} pelo sinônimo.`, `Use ${synonym}, ajustando a palavra à frase quando necessário.`)
      ]; break;
    }
    case 6: {
      const [word, opposite, related] = PT_PRACTICE.opposites[index];
      intro = 'Mude a palavra, mude a ideia';
      text = `Vamos descobrir o contrário de ${word}. Leia as opções e depois pratique a escrita.`;
      tasks = [
        choice(`Qual é o contrário de ${word}?`, opposite, [related, word], `${word} e ${opposite} expressam ideias contrárias.`),
        written(`Escreva uma frase com ${word}.`, `Resposta pessoal com ${word}.`),
        written(`Transforme sua frase usando o contrário de ${word}.`, `Use ${opposite}. Confira se a ideia da frase mudou.`),
        written(`Desenhe algo ${word.toLowerCase()} e algo ${opposite.toLowerCase()}. Escreva as duas palavras.`, `${word} e ${opposite}, cada uma junto do desenho correspondente.`)
      ]; break;
    }
    case 7: {
      const [theme, shape, word] = PT_PRACTICE.visual[index];
      intro = `Poema visual: ${theme}`;
      text = `Nesta rodada, seu poema vai falar de ${theme.toLowerCase()}. As palavras podem acompanhar o desenho de ${shape}.`;
      tasks = [
        written(`Escreva três palavras que lembram ${theme}.`, `Resposta pessoal relacionada a ${theme.toLowerCase()}. Uma possibilidade é ${word}.`),
        written(`Crie um verso sobre ${theme} usando ${word.toUpperCase()}.`, `Resposta pessoal com ${word}, sobre ${theme.toLowerCase()}.`),
        written(`Desenhe ${shape} e escreva seu verso acompanhando essa forma.`, `Confira se o desenho e o verso expressam a ideia de ${theme.toLowerCase()}.`),
        written(`Dê ao seu poema sobre ${theme} um título que tenha a palavra ${word.toUpperCase()}.`, `Título pessoal que inclua ${word}.`)
      ]; break;
    }
  }
  return {...base, intro, text, tasks, source:'Variação de treino criada a partir das habilidades e dos tipos de exercício da apostila.'};
}
