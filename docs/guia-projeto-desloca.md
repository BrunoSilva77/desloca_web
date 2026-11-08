# Desloca explicado para uma criança de 10 anos

## 1. O que é o Desloca?

O Desloca é um site que ajuda as pessoas a andar de ônibus em Araçatuba.

Imagine que a cidade é um tabuleiro enorme. Os ônibus são peças que percorrem caminhos, e o Desloca mostra:

- onde estão os ônibus;
- quais caminhos cada linha faz;
- onde ficam as paradas;
- quanto custa a passagem;
- se um ônibus está vazio, médio ou cheio;
- avisos de trânsito, obras e acidentes;
- um caminho sugerido para chegar a um destino.

O projeto é um protótipo. Por isso, muitos dados ainda são simulados, como se fossem uma brincadeira de cidade feita no computador.

## 2. Como o projeto é organizado?

O projeto tem partes com trabalhos diferentes, como uma equipe:

- `src/`: o coração do site que aparece para o usuário;
- `src/paginas/`: telas completas, como Início e Mapa;
- `src/componentes/`: peças reutilizáveis, como cabeçalho, mapa e popups;
- `src/dados/`: informações simuladas de linhas, ônibus e rotas;
- `src/utilidades/`: pequenos ajudantes para cálculos;
- `scripts/`: ferramentas que criam rotas, buscam lugares e publicam o site;
- `testes/`: arquivos usados para conferir se o site está funcionando;
- `banco/`: desenho do banco de dados futuro;
- `docs/`: documentos e diagramas do projeto.

## 3. Tecnologias: as ferramentas da oficina

### React

React monta o site usando peças pequenas. Em vez de construir uma casa inteira de uma vez, fazemos porta, janela e parede separadas.

### TypeScript

TypeScript é um fiscal. Ele avisa quando o código espera um número, mas alguém entrega um texto, por exemplo.

### Vite

Vite é o ajudante que liga o projeto rapidamente durante o desenvolvimento e prepara os arquivos para publicação.

### React Router

React Router decide qual tela mostrar para cada endereço:

- `/` mostra o início;
- `/mapa` mostra o mapa;
- `/linhas` mostra a área de linhas;
- `/acessibilidade` mostra rotas acessíveis;
- `/denuncias` mostra o formulário de denúncia;
- `/dicas` mostra dicas;
- `/indice-movida` mostra os indicadores.

### Leaflet e OpenStreetMap

Leaflet é o pincel do mapa. OpenStreetMap fornece o desenho das ruas. Juntos, eles mostram linhas, pontos, ônibus e alertas.

### Node.js

Node.js permite rodar JavaScript fora do navegador, principalmente no servidor.

### MySQL

MySQL é como um armário com gavetas. Cada gaveta guarda um tipo de informação: linhas, pontos, ônibus, alertas e denúncias.

## 4. Entrada do projeto e navegação

### `src/main.tsx`

É a porta de entrada. Ele pega o componente principal e coloca dentro da página HTML.

### `src/App.tsx`

É o mapa de endereços do site. Ele usa o React Router e coloca o cabeçalho em todas as telas.

### `src/componentes/Cabecalho.tsx`

Mostra a marca Desloca e os links para o usuário trocar de tela.

### `src/estilos/global.css`

É o livro de aparência do site: cores, tamanhos, fontes, espaços, botões e adaptação para celular.

## 5. As páginas do site

### `Inicio.tsx`

É a apresentação do projeto. Mostra o que o Desloca faz e leva o usuário para as funções principais.

### `Mapa.tsx`

É a tela mais importante. Ela junta mapa, lista de linhas, busca de destino, alertas, notificações, denúncia e localização do usuário.

Quando a tela abre, nenhuma rota começa selecionada. Os ônibus continuam aparecendo, mas os desenhos das rotas ficam escondidos para o mapa não ficar poluído.

Quando o usuário clica em uma linha, o sistema:

1. escolhe a linha;
2. coloca o trajeto dela no mapa;
3. aproxima o mapa;
4. mostra tarifa, frequência, placa, lotação e paradas;
5. permite clicar em cada parada.

### `Linhas.tsx`

Atualmente encaminha para o mapa integrado, porque a lista de linhas foi colocada dentro da tela do mapa.

### `Acessibilidade.tsx`

Mostra exemplos de trajetos pensados para pessoas com mobilidade reduzida.

### `Denuncias.tsx`

Permite relatar problemas, como buraco, iluminação, ponto ou ônibus.

### `Dicas.tsx`

Apresenta dicas sobre mobilidade e sustentabilidade.

### `IndiceMovida.tsx`

Mostra indicadores relacionados à mobilidade urbana.

## 6. Componentes reutilizáveis

### `MapaDesloca.tsx`

É o componente que desenha o mapa Leaflet. Ele cria:

- mapa e ruas;
- marcador do terminal;
- marcadores dos ônibus;
- trajetos pontilhados;
- pontos de parada;
- alertas;
- localização do usuário.

Cada linha tem dois ônibus simulados. Eles começam em vagas diferentes perto do terminal e se movem pela rota usando animação.

### `PopupDetalhesLinha.tsx`

Mostra informações extras de uma linha em uma janela pequena.

### `PopupNotificacoes.tsx`

Mostra os avisos que estão acontecendo na cidade.

### `PopupDenuncia.tsx`

É o formulário para o usuário enviar uma ocorrência.

### `DicaNotificacao.tsx`

Mostra pequenas dicas durante o uso.

### `Toast.tsx`

Mostra mensagens rápidas, como “denúncia enviada”.

## 7. Dados das linhas e ônibus

### `src/dados/linhas.ts`

É o cadastro das linhas simuladas. Hoje existem oito:

- 101 — Circular Norte;
- 202 — Circular Oeste;
- 303 — Circular Sul;
- 404 — Centro e Aeroporto;
- 505 — Expresso Nordeste;
- 606 — Universitário;
- 707 — Circular Sudoeste;
- 808 — Expresso Aeroporto.

Cada cadastro guarda código, nome, cor, tarifa, frequência, status, horário, placa, lotação e previsão.

Depois, o código junta esse cadastro com o caminho do arquivo `trajetos.json`.

### `src/dados/trajetos.json`

Guarda muitos pontos de latitude e longitude. Eles formam o desenho que o ônibus segue pelas ruas.

É parecido com uma lista de pegadas: juntando todas, aparece o caminho completo.

## 8. Busca de destino e roteiro

### `src/utilidades/roteiro.ts`

Esse arquivo é o planejador de viagem.

O usuário escreve um destino. O sistema procura paradas cujo nome combina com o texto. Depois tenta encontrar:

- uma linha direta; ou
- duas linhas com uma baldeação.

Para decidir, ele mede distâncias entre coordenadas usando a fórmula de Haversine. Ela calcula a distância aproximada entre dois pontos da Terra.

Se o GPS não estiver disponível, o sistema usa o Terminal Urbano como ponto de partida.

## 9. Outros ajudantes

### `src/utilidades/geo.ts`

Calcula distância, tempo aproximado de caminhada e textos como “450 m”.

### `src/utilidades/relogioSimulado.ts`

Cria o relógio e os horários simulados dos ônibus. O tempo da apresentação passa mais rápido que o tempo real.

## 10. APIs e serviços externos

### OSRM

OSRM é um serviço de rotas. O script envia pontos para ele e recebe um caminho pelas ruas, em vez de uma linha reta atravessando casas.

O resultado é salvo em `src/dados/trajetos.json`.

### OpenStreetMap / mapa de ruas

O mapa usa dados de ruas para o usuário reconhecer a cidade.

### Nominatim

Alguns scripts usam geocodificação para transformar nomes de bairros e lugares em coordenadas.

### API REST e WebSocket planejados

A documentação prevê um backend com Express para fornecer linhas, pontos, alertas e denúncias.

Também prevê Socket.IO para enviar posições de ônibus imediatamente. No protótipo atual, os dados principais ainda são simulados no front-end.

## 11. Scripts de criação e manutenção

### `gerar_rotas_apresentacao.py`

É o motorista que prepara os caminhos. Ele pega pontos de cada linha, conversa com o OSRM e grava os trajetos.

### `buscar_bairros.py`

Busca bairros e suas coordenadas.

### `buscar_pois.py` e `buscar_pois_2.py`

Buscam pontos importantes, como hospital, shopping e aeroporto.

### `recortar_logo.py`

Ajuda a preparar imagens da marca.

### `servidor-estatico.mjs`

Entrega os arquivos finais do site. Se alguém abrir `/mapa` diretamente, ele devolve o `index.html` para o React entender a rota.

### `atualizar_pr.ps1`

Ajuda em tarefas de atualização de pull request no GitHub.

## 12. Banco de dados

### `banco/desloca.sql`

Desenha o banco MySQL para uma versão mais completa do sistema.

As tabelas são:

- `linhas`: dados das linhas;
- `pontos`: paradas e coordenadas;
- `linha_ponto`: ordem das paradas em cada linha;
- `veiculos`: placas, modelos e posição conhecida;
- `alertas`: avisos de trânsito, acidentes, clima e obras;
- `denuncias`: problemas enviados pelos usuários.

A tabela `linha_ponto` é uma ponte. Ela diz quais pontos pertencem a cada linha e em que ordem o ônibus passa.

A posição ao vivo não precisa ser gravada a cada segundo no banco. Ela pode ficar na memória do servidor e ser enviada por WebSocket.

## 13. Testes

A pasta `testes/` reúne verificações e imagens de conferência.

Os testes podem:

- abrir o site;
- conferir se botões existem;
- clicar em linhas;
- verificar o mapa;
- capturar telas;
- observar mensagens do navegador;
- verificar responsividade em tamanhos diferentes;
- conferir posições dos ônibus e vagas do terminal.

As imagens PNG ajudam a comparar o que o site realmente mostra com o que a equipe esperava.

## 14. Como rodar

1. Instale Node.js 18 ou superior.
2. Abra o terminal na pasta do projeto.
3. Execute `npm install`.
4. Execute `npm run dev`.
5. Abra `http://localhost:5173`.

Para testar a versão de produção:

1. Execute `npm run build`.
2. Execute `npm start`.
3. Abra a porta mostrada no terminal, normalmente `http://localhost:4173`.

## 15. Como o usuário faz uma viagem?

1. A pessoa abre o mapa.
2. O mapa mostra os ônibus, sem desenhar todas as rotas de uma vez.
3. Ela escreve um destino.
4. O Desloca sugere paradas.
5. A pessoa escolhe uma parada.
6. O sistema procura uma linha direta ou uma baldeação.
7. O mapa destaca as linhas usadas.
8. A pessoa pode abrir os detalhes, ver pontos e acompanhar os ônibus.

## 16. Resumo final

O Desloca funciona como uma pequena central de ônibus:

- React constrói as telas;
- TypeScript ajuda a evitar erros;
- Leaflet desenha o mapa;
- OSRM ajuda a criar caminhos reais;
- scripts preparam dados;
- o banco guarda informações permanentes;
- testes conferem se tudo aparece corretamente;
- o servidor entrega o site para o navegador.

Mesmo sendo um protótipo, a estrutura já separa as responsabilidades. Isso facilita trocar os dados simulados por uma API e por ônibus reais no futuro.
