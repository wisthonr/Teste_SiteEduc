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
