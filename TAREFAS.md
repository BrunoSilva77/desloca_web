# 📋 TAREFAS PENDENTES — Projeto Desloca

> **Como usar este arquivo:** toda vez que formos trabalhar no projeto, leia esta
> lista primeiro. Ao final de cada sessão, marque o que foi feito e adicione o que
> surgiu. Este arquivo é **commitado no Git** para a equipe inteira acompanhar.

---

## 🔄 Rotina de Git (toda vez que formos subir)

Siga sempre nesta ordem:

```bash
# 1. Veja o que mudou
git status

# 2. Adicione os arquivos alterados
git add .

# 3. Faça o commit com uma mensagem clara (em português)
git commit -m "tipo: descrição do que mudou"

# 4. Suba para a branch atual
git push
```

**Tipos de mensagem de commit (padrão Conventional Commits):**

| Tipo | Quando usar | Exemplo |
| --- | --- | --- |
| `feat:` | Nova funcionalidade | `feat: adiciona filtro de todas as linhas` |
| `fix:` | Correção de bug | `fix: corrige pontos duplicados no aviso` |
| `style:` | Visual / CSS | `style: ajusta cores do painel de filtros` |
| `docs:` | Só documentação | `docs: atualiza README com stack` |
| `refactor:` | Reorganizar código | `refactor: extrai cálculo de distância` |
| `test:` | Testes | `test: adiciona screenshot do mapa` |
| `chore:` | Manutenção | `chore: configura gitignore` |

---

## ✅ Feito (histórico)

- [x] **03/11** — Estrutura do projeto (React + TypeScript + Vite)
- [x] **03/11** — 6 telas: Início, Mapa, Linhas, Acessibilidade, Denúncias, Dicas
- [x] **03/11** — Mapa em tela cheia com painel de filtros flutuante
- [x] **03/11** — Trajetos reais alinhados às ruas (gerados via OSRM)
- [x] **03/11** — Identidade visual com as cores do logo Desloca
- [x] **03/11** — `FERRAMENTAS.md` (linguagens, ferramentas e uso de IA)
- [x] **03/11** — `README.md` completo com justificativa da stack
- [x] **03/11** — `banco/desloca.sql` (7 tabelas MySQL comentadas)
- [x] **03/11** — Filtro "Todas as linhas"
- [x] **03/11** — Logo do D no cabeçalho
- [x] **03/11** — Localização do usuário + ponto mais próximo + tempo a pé
- [x] **04/11** — **Diagrama de arquitetura técnica** (`docs/diagrama-arquitetura.md`
      + `.png` para o PowerPoint, gerado por `testes/gerar_diagrama.py`)
- [x] **04/11** — **Merge do trabalho da equipe** (histórias separadas no Git,
      juntadas com `--allow-unrelated-histories`)
- [x] **04/11** — Página **Índice MOVIDA** (novo painel de indicadores, da equipe)
- [x] **04/11** — **Acessibilidade** reescrita com busca, filtros e rotas (da equipe)
- [x] **04/11** — CSS unido: **comentários em português mantidos** + estilos novos
      da equipe (785 linhas) — zero conflito de código, só de comentário
- [x] **04/11** — **Sobreposição painel × cabeçalho** corrigida no mapa: rodapé
      escondido na tela cheia (gerava rolagem), z-index do cabeçalho subiu para
      1200 e alturas em `calc(100vh - 63px)` — verificado com Playwright
- [x] **04/11** — **Novo Início**: hero com mapa da cidade desfocado ao vivo
      (Leaflet + ônibus andando), animações de entrada escalonadas, contadores
      animados (linhas/alertas/pontos) e bloco "Como funciona"
- [x] **04/11** — **Auditoria de responsividade** em 5 rotas × 375px e 768px
      (`testes/auditoria_responsividade.py`): zero rolagem horizontal
- [x] **04/11** — **Rotas simuladas de apresentação**: 4 linhas saem do Terminal
      Urbano Nelson Reis Alves, cobrem todos os bairros urbanos (máx. 2 linhas
      por bairro) e passam por shoppings, Havan, museus, estádio, parques,
      hospital e aeroporto — rotas em rua real via OSRM
      (`scripts/gerar_rotas_apresentacao.py`, geocodificação em
      `scripts/buscar_bairros.py` e `scripts/buscar_pois.py`)
- [x] **04/11** — **Ônibus andando de verdade**: animação em loop pelo trajeto
      com saída escalonada do Terminal (25s entre cada) e volta completa de
      6,5 a 8 minutos; verificado com Playwright (4/4 veículos em movimento)
- [x] **04/11** — **Mapa mais limpo**: tiles CARTO Positron (fundo claro, sem
      poluição visual), marcador fixo do Terminal, pontos de parada só da linha
      ativa e enquadramento automático da rede de rotas
      (`testes/verificar_rotas_apresentacao.py`)
- [x] **04/11** — **Mapa tipo Google + horários de partida**: tiles Esri World
      Street Map (mais contraste e sem poluição, sem chave), linhas mais finas
      (4px ativa / 2px demais), **relógio simulado acelerado** (14:18, 10× mais
      rápido) no topo do mapa e partidas fixas por linha — 101 às 14:20, 202 às
      14:25, 303 às 14:30, 404 às 14:35, repetindo a cada 20 min simulados; o
      ônibus espera na vaga do Terminal fora da janela da viagem e o popup mostra
      a próxima partida ao vivo (Playwright: partidas em 12/42/72/102s reais,
      4/4 parando na vaga, relógio 14:18→14:44, 0 erros de console)
- [x] **05/11** — **Rotas pontilhadas + ônibus mais lentos**: todas as rotas
      viraram tracejado redondo (com ou sem linha selecionada) e a volta dos
      ônibus ficou 50% mais lenta (`FATOR_LENTIDAO = 1.5`, sem alterar os
      horários de partida); Playwright: 4/4 pontilhadas, 4/4 parando na vaga,
      0 erros de console
- [x] **06/11** — **Nova logo no cabeçalho**: wordmark oficial de
      `uploads/logoDesloca.jpeg` recortado e com fundo transparente
      (`scripts/recortar_logo.py` → `src/assets/logo-marca.png`), usado no
      cabeçalho e no menu mobile (texto "Desloca" removido, pois a logo já
      traz o nome); verificado com Playwright (logo carregada 98×30, 0 erros)
- [x] **06/11** — **Vagas no terminal + pin alinhado na rua**: ônibus agora
      esperam enfileirados NA rua de saída do Terminal (15/35/55/75 m, as 4
      rotas compartilham os 172 m iniciais) e a partida segue o trajeto direto
      (sem pular quarteirão); alfinetes girados −45° com a âncora na ponta —
      ponta encosta na coordenada da rua — e emoji em pé que gira no rumo da
      via. Playwright: vagas 33–81 m do terminal em pontos distintos do
      trajeto, emojis girando com a rua, 0 erros (`verificar_vagas_onibus.py`,
      `conferir_vagas_latlng.py`)
- [x] **06/11** — **Redesign "Placa de partidas" no mapa** (skill
      `frontend-design`): chrome de tinta #1D1D1B flutuando sobre o mapa claro
      com detalhes em bege #C9A882 — placa de partidas no topo (relógio +
      horário de saída de cada linha em números tabulares), placas quadradas
      com o código das linhas, painel com cabeçalho de tinta e lista em linhas
      de fio (sem cards arredondados), faixa de tinta com o próximo veículo e
      a próxima partida no detalhe, popups do Leaflet na mesma família (faixa
      de tinta + corpo em papel) e bottom sheet mobile com cantos curtos.
      Botão "Abrir Linhas" removido da barra no desktop minimizado (quem
      reabre é o "◀ Linhas & Horários"). Capturas em `capturar_desenho.py`
      (desktop, detalhe, popup, mobile); `npm run build` sem erros e suíte de
      apresentação completa verde
- [x] **08/11** — **Ajustes finais de apresentação + preparo Render**:
      chips de partida removidas da barra (só o relógio simulado), aviso do
      Modo Limpo virou só notificação (disparada ao desmarcar a última linha),
      **2 veículos por linha = 8 ônibus** (2º sai meio intervalo depois, fila
      de vagas reespacada 14–154 m, placa própria ABC-1D24), **busca por
      destino** ("Para onde você vai?") com sugestão de paradas e cartão de
      rota (direto ou com 1 baldeação — `src/utilidades/roteiro.ts`) e
      **preparação para o Render** (`render.yaml` +
      `scripts/servidor-estatico.mjs` com fallback SPA, `npm start`, seção
      "Publicação no Render" no README). Testes atualizados para 8 ônibus e
      verdes (`verificar_vagas_onibus.py`, `verificar_rotas_apresentacao.py`
      com 30 amostras)

---

## 📌 Próxima sessão (o que falta fazer)

### 🔴 Urgente (cronograma da faculdade)

- [x] **Commit inicial no GitHub** — branch `feature/prototipo-navegavel` enviada em 03/11
- [ ] **README inicial** já está feito, mas precisa dos **badges** e print das telas
- [x] **Diagrama de arquitetura técnica** (tarefa de 05/11) — pronto em
      `docs/diagrama-arquitetura.md` (Mermaid) e `.png` (PowerPoint)
- [ ] **Justificativa da stack** já escrita no README, revisar com a equipe
- [ ] **Prints das telas** para colocar no README (estão em `testes/`)
- [ ] **Levar o merge para a `main`** — o trabalho está na
      `feature/prototipo-navegavel`; a equipe trabalha na `main`

### 🟡 Importante (funcionalidade e qualidade)

- [ ] **Ônibus andando no mapa** — animar a posição do veículo em tempo real
      (simulado com `setInterval`, depois trocado por WebSocket)
- [ ] **Página de detalhes da linha** com todos os horários
- [ ] **Busca por origem/destino** (estilo Uber: "de → para")
- [x] **Responsividade no celular** — auditoria automática em 375px/768px em
      todas as telas (`testes/auditoria_responsividade.py`), sem rolagem horizontal
- [ ] **Testar localização no celular real** (o `getCurrentPosition` é diferente)
- [ ] **Comentários nos estilos novos** da Acessibilidade/Índice MOVIDA — a equipe
      deixou só o cabeçalho de seção; falta comentar propriedade por propriedade

### 🟢 Desejável (diferenciais)

- [ ] **Indicador de lotação** mais visível (vago/médio/lotado com cor)
- [ ] **Alertas colaborativos** — usuário reporta e aparece no mapa
- [ ] **Tela de acessibilidade com mapa** (hoje é só texto)
- [ ] **Conectar o MySQL** — trocar os dados mockados por chamadas à API
- [ ] **Back-end Node.js + WebSocket** (herdado do KickIRL)

### ⚪ Cortado (não faremos)

- ~~Meu Perfil / gamificação~~
- ~~Card de contribuição ambiental (CO₂)~~
- ~~Ciclovias~~
- ~~**Login / cadastro de usuário**~~ — o protótipo não tem autenticação

### 🧹 Pendência de limpeza (decorrente do corte do login)

- [x] **Remover a tabela `usuarios`** do `banco/desloca.sql` (tem `senha_hash`)
      — feito em 08/11 (banco ficou com 6 tabelas)
- [x] **Tirar JWT e bcrypt** do `FERRAMENTAS.md` — feito em 08/11 (ficou uma
      nota explicando que o protótipo não tem login)

---

## 🧪 Como testar o projeto

```bash
cd desloca-web
npm install      # primeira vez apenas
npm run dev      # abre em http://localhost:5173
npm run build    # verifica se há erros de tipagem
```

Screenshots de teste ficam na pasta `testes/` (rodar `python testes/...py`).

---

## 📌 Observações da equipe

- **Prazo:** protótipo navegável final até **06/11**
- **Mínimo exigido:** 3 telas navegáveis + 1 funcionalidade simulada com dados ✅ (já temos)
- **Comentários em português** em todo o código (regra do projeto)
- Stack provisória: **TypeScript + React + MySQL**
