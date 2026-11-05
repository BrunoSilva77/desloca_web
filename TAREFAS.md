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

- [ ] **Remover a tabela `usuarios`** do `banco/desloca.sql` (tem `senha_hash`)
- [ ] **Tirar JWT e bcrypt** do `FERRAMENTAS.md` — senão alguém pergunta "e esse
      JWT aqui?" na apresentação e a equipe fica sem resposta

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
