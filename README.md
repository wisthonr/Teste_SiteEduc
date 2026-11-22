# Matemática em cores

Jogo de matemática para o 2º ano. A página inicial é publicada pelo GitHub Pages a partir da raiz da branch `main`.

A cada nova prova, a nova revisão substitui a anterior no mesmo endereço. As fotografias do livro, os manuscritos e os dados pessoais ficam fora da publicação.

## Caderno

Os seis assuntos reúnem 27 atividades sobre os conteúdos das páginas 160–169, 173–189 e 192–202. A criança pode escolher qualquer assunto, usar pistas, escrever na folha e conferir sua resposta. Cada assunto completo rende um carimbo. As respostas e os desenhos ficam no armazenamento local do navegador, na chave `expresso-piquenique-v1`.

- **Somar e subtrair** — material de base dez, trocas e registro da adição e da subtração.
- **Sequências e ordem** — sequências crescentes e decrescentes, padrões de figuras e ordenação até 999.
- **Números e coleções** — escrita por extenso, valor posicional, decomposição, leitura de tabelas e comparação de quantidades.
- **Oficina dos Botões** — grupos iguais, adição de parcelas iguais, multiplicação.
- **Receitas e partes** — dobro, triplo, metade e terça parte.
- **Repartir e descobrir** — repartição, formação de grupos e problemas de falta e sobra.

Não propor elaboração de perguntas, histórias ou enunciados para a Júlia. Ela resolve as atividades da apostila e suas variações, com espaço para escrever cálculos e respostas.

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

O controle do adulto no início abre outra rodada com números e respostas diferentes nas 27 atividades. Há oito variações completas antes de repetir o ciclo. A rodada original e seu progresso continuam até o adulto confirmar a troca. As novas rodadas preservam os tipos de tarefa e o intervalo até 999.

Verificação adicional das rodadas e da entrada de respostas com `node tests/expresso-rodadas.test.cjs`. O teste físico da Apple Pencil precisa ser feito no aparelho.


## Desafio das Cargas

O botão principal abre `jogo.html`, um jogo de arrastar caixas com a caneta, o dedo ou o mouse. São seis fases de combinação de parcelas com limite de caixas, partilha, sequência, subtração, dobro/triplo e um pedido final que combina multiplicação, dobro e metade. As caixas podem voltar ao depósito, os movimentos podem ser desfeitos e a criança pode pedir pistas e conferir cada quadro. O toque em uma caixa seguido de “Colocar aqui” também funciona, assim como Tab e Enter.

Há 12 partidas com valores diferentes, totalizando 72 desafios. Depois o ciclo se repete. A partida é guardada na chave `expresso-cargas-v1`, com a fase atual, as posições das caixas e as conquistas. A opção de nova partida fica dentro do jogo e pede confirmação. O caderno continua acessível no mapa.

Execute `node tests/trem-jogo.test.cjs` para verificar soluções, limites, retomada e os handlers de interação com um adaptador de DOM. Esse teste não substitui a validação visual e o arraste com a Apple Pencil no iPad.


## Aulas e autonomia no cálculo

`aula.html` reúne seis aulas animadas com exemplos independentes, legendas, narração opcional em português e pausas que aguardam a criança pensar. Os controles permitem avançar, voltar, repetir e sair sem alterar a atividade. As aulas também podem ser abertas pelo caderno e pelo jogo. A voz usa SpeechSynthesis e as vozes disponíveis no aparelho; nenhuma instalação é necessária. Ao sair da aula ou ocultar a página, reprodução e voz são interrompidas.

A criança registra a conta e suas anotações de troca. As peças são um apoio opcional; na soma, é preciso selecionar dez antes de trocar. A correção aceita um resultado correto mesmo sem manipular peças. Foram retirados o botão que soma a carga, as diferenças numéricas das pistas de erro e contadores que entregavam resultados nas atividades. A resolução completa da própria conta só aparece depois de acertar. As anotações de troca são rascunho, sem correção automática.

`node tests/aulas.test.cjs` verifica cálculo sem ajuda automática, orientações sem resultado, conservação de quantidade nas trocas, exemplos alternativos, reprodução, pausas para pensar, navegação e cancelamento de voz. A interface também foi conferida em navegador com largura de iPad em orientação vertical; a caneta e a voz do iPad precisam ser experimentadas no aparelho.


## Referências da apostila

As 27 atividades, seis fases do jogo e seis aulas mostram a página da apostila. Ao abrir a referência, o adulto vê o exercício e a adaptação feita. A referência acompanha todas as rodadas, mesmo quando os números mudam. A numeração foi conferida nas fotografias da avaliação de Matemática enviadas no chat “Criar atividade matemática inovadora”. As fotos e as respostas manuscritas continuam privadas.

As bandeiras são uma atividade complementar do critério de sequências de figuras, sem exercício equivalente identificado nas fotos. A ordenação dos quatro fichas é complementar ao critério de ordenação, com o quadro da página 160 como apoio. O suco em triplo adapta o exercício 2 da página 188, que pede duas receitas. Os desafios de cargas e as aulas têm exemplos próprios, identificados como adaptações.

## Capa e identidade visual

Capa inspirada nos quadros azuis, rosas e roxos, botões e peças de contagem da apostila. Ilustração simples em SVG local, sem fotografias ou respostas da criança. O fundo é branco azulado, e o tema de trem foi retirado da interface. Atividades, jogo e aulas compartilham a paleta. Os identificadores internos e as chaves de armazenamento foram mantidos para preservar o progresso existente.

## Narração das aulas

As explicações usam arquivos MP3 de voz sintética em português brasileiro (Francisca Neural), com ritmo normal, servidos pelo próprio site. `aulas-audio.js` associa cada texto ao arquivo correspondente, incluindo os exemplos alternativos. O botão Ritmo alterna normal, mais rápido e mais calmo, com preferência salva neste navegador. As pausas de reflexão continuam até a criança avançar.

Um único elemento de áudio é reutilizado entre as etapas para favorecer a reprodução por toque no iPad. Fechar a aula, pausar ou mudar de página cancela a fala atual. Se o navegador bloquear a reprodução, a aula pede um novo toque sem avançar. Em caso de falha de arquivo, há alternativa de voz do aparelho, priorizando vozes brasileiras de qualidade superior quando disponíveis.

Verificação: `node tests/aulas.test.cjs` cobre narração, ritmo, pausas, cancelamento, alternativa de voz e bloqueio de reprodução. Os MP3 não contêm gravações da criança; são apenas a leitura dos exemplos didáticos.

## Anotações de troca na subtração

A linha superior indica Depois da troca: quantidades restantes nas colunas alteradas. Colunas não alteradas podem ficar vazias. Ao escrever uma quantidade diferente, o algarismo original fica riscado; apagar a anotação restaura sua aparência. Dois exemplos independentes mostram troca de centena e de dezena, sem preencher a resposta da atividade. As anotações continuam opcionais, sem avaliação automática. Ao tocar novamente em um campo numérico, o próximo dígito substitui o conteúdo anterior; os seguintes completam números como 12. O caso 822 − 370 está coberto pelos testes.
