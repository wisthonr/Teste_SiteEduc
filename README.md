# O caderno de Matemática da Julia

Site estático em português para praticar Matemática do 2º ano. Publicação pelo GitHub Pages, na raiz da branch `main`.

## Atividades

- Página 103: tabela de assentos, valor posicional e decomposições distintas.
- Página 160: quadro de 100 números com lacunas, seleção por nome e regularidades.
- Páginas 161–162: sequências crescentes/decrescentes, identificação de regras e criação de uma sequência.
- Página 163: selecionar parcelas cuja soma forma o número pedido; qualquer combinação válida é aceita.
- Páginas 164–165: problemas com coleções e decomposição.
- Páginas 166–168: problemas de adição, registro nas ordens, resposta escrita e outra estratégia.
- Página 169: quatro adições com reagrupamento.
- Revisão complementar: antecessor/sucessor, ordenação, subtração com trocas e escrita por extenso, conforme os temas de estudo.
- Laboratório: montar números com material de base dez e percorrer sequências com saltos escolhidos.

O primeiro treino usa os valores das páginas de referência. O botão **Novos números** substitui somente a folha atual, após avisar sobre a limpeza de respostas e desenhos. O botão **Voltar aos números do livro** restaura aquela folha. Não há nota, cronômetro, bloqueio por erro ou obrigação de concluir uma folha para acessar outra.

## Escrita e salvamento

Campos HTML de texto com autocorreção e preenchimento automático desativados. No iPad compatível, a conversão de manuscrito em texto é feita pelo recurso **Escrever à Mão** do iPadOS. O site confere o texto convertido; não realiza reconhecimento de escrita. O canvas é um rascunho livre, com desfazer e limpar.

As respostas, seleções e traços ficam no `localStorage` deste navegador (`julia-matematica-v1`). Não há servidor de respostas, telemetria nem sincronização entre aparelhos. Falhas de armazenamento são informadas no rodapé. Os campos de explicação livre são comparados com modelos pela criança e pelo adulto, sem correção automática. As anotações de transporte/empréstimo são livres; a correção verifica os algarismos dos operandos editáveis e do resultado.

O total das operações é identificado como um campo para algarismos, com exemplo visível de outra conta. Problemas também oferecem espaço de frase em português, separado do resultado numérico, e um modelo que não usa a resposta esperada. Os exemplos não preenchem campos nem alteram a correção. Os campos de palavras usam `lang="pt-BR"` e `inputmode="text"`; os de algarismos usam `inputmode="numeric"`. A página não força o teclado do iPad nem configura o tempo de reconhecimento do recurso Escrever à Mão. **Escrever livre, sem converter** é o canvas já existente, sem conversão, limite de tempo ou correção automática, para permitir pausas entre letras.

## Desenvolvimento e verificação

Sem framework, instalação ou build:

```sh
python -m http.server 8765 --bind 127.0.0.1
node --check matematica.js
node --check matematica-data.js
node tests/matematica.test.cjs
```

O teste verifica 3.600 folhas geradas com semente fixa: limites de 0 a 999, soluções para as composições, resultados de contas, sequências e regras do corretor. Testes no navegador cobrem navegação livre, persistência, regeneração/cancelamento, seleções, trocas, criação de sequência, jogos e desenho. Dimensões verificadas incluem 375×812, 768×1024 e 1024×1366. Isso não substitui o teste físico da Apple Pencil e da conversão de manuscrito no Safari do iPad.

## Fontes privadas

As fotos de referência e temporários são ignorados pelo Git. Publicar apenas os arquivos didáticos derivados. Não incluir fotos das páginas, manuscritos, nomes da escola/professora/alunos nem mensagens privadas.

## Revisão visual

Menus e cabeçalhos usam cenas coloridas ligadas a cada tema: trens, caminhos com bichinhos, lupa, coleções, livros, bolas e roupas. As perguntas, respostas esperadas, geração de números e armazenamento não foram alterados nesta revisão. `matematica-art.js` contém apenas apresentação; `matematica-ilustracoes.css` adapta as cenas a tablet/celular, sem reduzir os campos de escrita. As ilustrações decorativas ficam fora da árvore de acessibilidade e da impressão.

As figuras SVG são de **OpenMoji 17.0.0**, copiadas do repositório oficial, sob **CC BY-SA 4.0**, e ficam hospedadas junto ao site. Não há carregamento de imagens ou fontes a partir de serviços externos durante o uso. Créditos, fonte, versão e licença estão em [assets/openmoji/CREDITOS.md](assets/openmoji/CREDITOS.md) e no rodapé. As composições dessas figuras também são disponibilizadas sob CC BY-SA 4.0.
