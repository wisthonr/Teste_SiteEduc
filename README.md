# Expresso do Piquenique

Jogo de matemática para o 2º ano. A página inicial é publicada pelo GitHub Pages a partir da raiz da branch `main`.

A cada nova prova, a nova revisão substitui a anterior no mesmo endereço. As fotografias do livro, os manuscritos e os dados pessoais ficam fora da publicação.

## Viagem

As seis estações reúnem 28 entregas sobre os conteúdos das páginas 160–169, 173–189 e 192–202. A criança pode escolher qualquer estação, usar pistas, escrever na folha e conferir sua resposta. Cada estação completa rende um carimbo. As respostas e os desenhos ficam no armazenamento local do navegador, na chave `expresso-piquenique-v1`.

- **Estação das Encomendas** — material de base dez, trocas e registro da adição e da subtração.
- **Torre dos Sinais** — sequências crescentes e decrescentes, padrões de figuras e ordenação até 999.
- **Feira das Coleções** — escrita por extenso, valor posicional, decomposição, leitura de tabelas e comparação de quantidades.
- **Oficina dos Botões** — grupos iguais, adição de parcelas iguais, multiplicação e criação de um problema.
- **Cozinha do Vagão** — dobro, triplo, metade e terça parte.
- **Piquenique no Parque** — repartição, formação de grupos e problemas de falta e sobra.

Na criação de um problema, a criança revisa a própria pergunta. O jogo verifica os itens objetivos e oferece espaço para uma estratégia pessoal.

## Executar

Abra `index.html` ou inicie um servidor estático na raiz do projeto.

```sh
python -m http.server 8791 --bind 127.0.0.1
node tests/expresso.test.cjs
node tests/matematica.test.cjs
```

O jogo usa HTML, CSS e JavaScript e carrega seus recursos do próprio site. A ilustração de abertura foi criada para esta atividade.


## Uso no iPad e continuidade

A experiência é destinada a uma criança de 8 anos, do 2º ano, começando a usar o tablet, que escreve devagar e com letras grandes. Priorizar iPad em pé com Apple Pencil, instruções curtas, escolhas visuais e escrita livre sempre acessível. A folha fica aberta, preserva pausas e ignora toques da mão. O reconhecimento do iPad não é usado para corrigir os traços. Os resultados numéricos podem ser registrados por botões grandes, com teclado opcional. A escrita por extenso à mão usa comparação com modelo e revisão explícita, identificada no resultado.

O controle do adulto no mapa inicia outra viagem com números e respostas diferentes nas 28 entregas. Há oito variações completas antes de repetir o ciclo. A viagem original e seu progresso continuam até o adulto confirmar a troca. As novas viagens preservam os tipos de tarefa e o intervalo até 999.

Verificação adicional das rodadas e da entrada de respostas com `node tests/expresso-rodadas.test.cjs`. O teste físico da Apple Pencil precisa ser feito no aparelho.


## Desafio das Cargas

O botão principal abre `jogo.html`, um jogo de arrastar caixas com a caneta, o dedo ou o mouse. São seis fases de combinação de parcelas com limite de caixas, partilha, sequência, subtração, dobro/triplo e um pedido final que combina multiplicação, dobro e metade. As caixas podem voltar ao depósito, os movimentos podem ser desfeitos e a criança pode pedir pistas e conferir cada vagão. O toque em uma caixa seguido de “Colocar aqui” também funciona, assim como Tab e Enter.

Há 12 partidas com valores diferentes, totalizando 72 desafios. Depois o ciclo se repete. A partida é guardada na chave `expresso-cargas-v1`, com a fase atual, as posições das caixas e as conquistas. A opção de nova partida fica dentro do jogo e pede confirmação. O caderno continua acessível no mapa.

Execute `node tests/trem-jogo.test.cjs` para verificar soluções, limites, retomada e os handlers de interação com um adaptador de DOM. Esse teste não substitui a validação visual e o arraste com a Apple Pencil no iPad.


## Aulas e autonomia no cálculo

`aula.html` reúne seis aulas animadas com exemplos independentes, legendas, narração opcional em português e pausas que aguardam a criança pensar. Os controles permitem avançar, voltar, repetir e sair sem alterar a atividade. As aulas também podem ser abertas pelo caderno e pelo jogo. A voz usa SpeechSynthesis e as vozes disponíveis no aparelho; nenhuma instalação é necessária. Ao sair da aula ou ocultar a página, reprodução e voz são interrompidas.

A criança registra a conta e suas anotações de troca. As peças são um apoio opcional; na soma, é preciso selecionar dez antes de trocar. A correção aceita um resultado correto mesmo sem manipular peças. Foram retirados o botão que soma a carga, as diferenças numéricas das pistas de erro e contadores que entregavam resultados nas atividades. A resolução completa da própria conta só aparece depois de acertar. As anotações de troca são rascunho, sem correção automática.

`node tests/aulas.test.cjs` verifica cálculo sem ajuda automática, orientações sem resultado, conservação de quantidade nas trocas, exemplos alternativos, reprodução, pausas para pensar, navegação e cancelamento de voz. A interface também foi conferida em navegador com largura de iPad em orientação vertical; a caneta e a voz do iPad precisam ser experimentadas no aparelho.


## Referências da apostila

As 28 atividades, seis fases do jogo e seis aulas mostram a página da apostila. Ao abrir a referência, o adulto vê o exercício e a adaptação feita. A referência acompanha todas as rodadas, mesmo quando os números mudam. A numeração foi conferida nas fotografias da avaliação de Matemática enviadas no chat “Criar atividade matemática inovadora”. As fotos e as respostas manuscritas continuam privadas.

As bandeiras são uma atividade complementar do critério de sequências de figuras, sem exercício equivalente identificado nas fotos. A ordenação dos quatro bilhetes é complementar ao critério de ordenação, com o quadro da página 160 como apoio. O suco em triplo adapta o exercício 2 da página 188, que pede duas receitas. Os desafios de cargas e as aulas têm exemplos próprios, identificados como adaptações.
