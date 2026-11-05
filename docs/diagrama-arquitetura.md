# 📐 Diagrama de Arquitetura Técnica — Desloca

> **Etapa:** 05/11 — Construção (diagrama de arquitetura, stack e justificativa)
> **Responsável:** Bruno Henrique Silva

Este documento mostra **como as partes do sistema se conectam**: de onde vem o
dado, por onde passa e onde é guardado.

---

## 1. Arquitetura final (alvo do projeto)

```mermaid
flowchart TB
    user(("👤 Usuário<br/>celular ou computador"))

    subgraph FE["🎨 FRONT-END — React 18 + TypeScript + Vite"]
        direction TB
        telas["Telas do protótipo<br/>Início · Mapa · Linhas ·<br/>Acessibilidade · Denúncias · Dicas"]
        mapa["Mapa Leaflet<br/>+ OpenStreetMap"]
        filtros["Filtros · geolocalização ·<br/>ponto mais próximo (Haversine)"]
        mock["Dados locais (mock)<br/>linhas.ts + trajetos.json"]
    end

    subgraph BE["⚙️ BACK-END — Node.js + Express + Socket.IO"]
        direction TB
        rest["API REST<br/>GET /linhas · /pontos · /alertas<br/>POST /denuncias"]
        ws["Socket.IO (WebSocket)<br/>posição dos ônibus ao vivo"]
    end

    subgraph DB["🗄️ BANCO DE DADOS — MySQL"]
        direction TB
        mysql[("linhas · pontos · veículos ·<br/>alertas · denúncias · trajetos")]
    end

    subgraph EXT["🌐 SERVIÇOS EXTERNOS (gratuitos)"]
        direction TB
        osm["OpenStreetMap<br/>imagens do mapa (tiles)"]
        osrm["OSRM<br/>alinha o trajeto às ruas reais"]
        gps["GPS embarcado<br/>nos ônibus"]
    end

    user --> telas
    telas --> mapa
    telas --> filtros
    telas --> mock

    telas -->|"HTTPS · requisições"| rest
    telas -.->|"WebSocket · tempo real"| ws

    rest -->|"SQL"| mysql
    ws -.->|"recebe posições"| gps

    mapa -->|"baixa as imagens"| osm
    osrm -.->|"gera os trajetos<br/>(fora da execução)"| mock

    classDef atual fill:#FAF8F4,stroke:#1D1D1B,stroke-width:2px,color:#1D1D1B
    classDef futuro fill:#FFFFFF,stroke:#8A8A88,stroke-width:2px,stroke-dasharray:6 4,color:#555555
    classDef externo fill:#F1E7DA,stroke:#C9A882,stroke-width:2px,color:#1D1D1B
    classDef usuario fill:#1D1D1B,stroke:#1D1D1B,stroke-width:2px,color:#FAF8F4

    class user usuario
    class telas,mapa,filtros,mock atual
    class rest,ws,mysql futuro
    class osm,osrm,gps externo
```

### 🎨 Legenda de cores

| Estilo | Significado |
|--------|-------------|
| **Borda sólida escura** | Já implementado no protótipo atual |
| **Borda tracejada** | Planejado para a fase de construção (back-end + banco) |
| **Borda bege** | Serviço externo gratuito (não faz parte do nosso código) |
| **Caixa preta** | O usuário final |

---

## 2. Fluxo do dado — passo a passo

**Quando o usuário abre o mapa:**

1. O **navegador** carrega o front-end (React + TypeScript).
2. O front-end pedi as **imagens das ruas** ao **OpenStreetMap** (gratuito).
3. Lê os **dados das linhas** do arquivo local (`linhas.ts` + `trajetos.json`).
4. Pede a **localização do usuário** à API de Geolocalização do navegador
   (com permissão) e calcula o **ponto de ônibus mais próximo**
   (distância de Haversine + tempo de caminhada a 4,5 km/h).
5. Desenha as **linhas no mapa** com Leaflet e aplica os filtros escolhidos.

**Na fase de construção (com back-end):**

6. O front-end passa a pedir as linhas à **API REST** (`GET /linhas`).
7. A API consulta o **MySQL** e devolve as respostas em JSON.
8. A posição dos ônibus chega **ao vivo** pelo **WebSocket (Socket.IO)**,
   que recebe os dados do **GPS embarcado** nos veículos.

---

## 3. Camadas e responsabilidades

| Camada | Tecnologia | Responsabilidade |
|--------|------------|------------------|
| **Apresentação** | React 18 + TypeScript + Vite | Telas, componentes, filtros, estado |
| **Mapa** | Leaflet + OpenStreetMap | Desenhar ruas, trajetos e marcadores |
| **Comunicação** | HTTPS (REST) + WebSocket | Buscar dados fixos e receber tempo real |
| **Aplicação** | Node.js + Express + Socket.IO | Regras de negócio e endpoints da API |
| **Persistência** | MySQL | Guardar linhas, pontos, veículos, alertas, denúncias |
| **Serviços externos** | OpenStreetMap · OSRM · Geolocation API | Ruas, alinhamento de trajeto e posição do usuário |

---

## 4. Diagrama do estado ATUAL (protótipo de front-end)

> Importante para a apresentação: hoje o protótipo é **100% front-end** —
> as caixas tracejadas do diagrama acima ainda não estão ligadas.

```mermaid
flowchart TB
    user(("👤 Usuário"))

    subgraph FE["FRONT-END (React + TypeScript) — implementado"]
        direction TB
        telas["6 telas navegáveis"]
        mapa["Mapa Leaflet + filtros +<br/>ponto mais próximo"]
        dados["dados mockados<br/>linhas.ts + trajetos.json"]
    end

    subgraph EXT["SERVIÇOS EXTERNOS"]
        direction TB
        osm["OpenStreetMap (tiles)"]
        geo["API de Geolocalização<br/>do navegador"]
        fonts["Google Fonts (Manrope)"]
        osrm["OSRM — usado no momento<br/>da geração dos trajetos"]
    end

    user --> telas
    telas --> mapa
    telas --> dados
    mapa --> osm
    mapa --> geo
    telas --> fonts
    osrm -.->|"gera o arquivo"| dados

    classDef atual fill:#FAF8F4,stroke:#1D1D1B,stroke-width:2px,color:#1D1D1B
    classDef externo fill:#F1E7DA,stroke:#C9A882,stroke-width:2px,color:#1D1D1B
    classDef usuario fill:#1D1D1B,stroke:#1D1D1B,stroke-width:2px,color:#FAF8F4

    class user usuario
    class telas,mapa,dados atual
    class osm,geo,fonts,osrm externo
```

---

## 5. Justificativa da stack (resumo)

| Escolha | Por quê |
|---------|---------|
| **TypeScript** | Checagem de tipos reduz erros com várias pessoas mexendo ao mesmo tempo |
| **React** | Componentização reutilizável (mapa e cabeçalho aparecem em várias telas) e forte demanda no mercado |
| **Vite** | Servidor de desenvolvimento instantâneo e build rápido |
| **Node.js + Express** | Mesma linguagem do front-end — compartilha tipos e lógica entre camadas |
| **Socket.IO** | Posição dos ônibus precisa chegar ao mapa instantaneamente (reaproveitado do KickIRL) |
| **MySQL** | Banco relacional maduro, gratuito e definido na disciplina |
| **Leaflet + OpenStreetMap** | Gratuito, sem chave de API e sem conta de faturamento |
| **OSRM** | Alinha o trajeto às ruas reais (road snapping), técnica herdada do KickIRL |

---

## 📌 Como renderizar este diagrama

- **No GitHub:** o Mermaid é renderizado automaticamente ao abrir este arquivo.
- **No PowerPoint:** use a imagem `docs/diagrama-arquitetura.png` (gerada por
  `python testes/gerar_diagrama.py`).
- **Editável no draw.io:** copie a estrutura do fluxo da seção 1.
