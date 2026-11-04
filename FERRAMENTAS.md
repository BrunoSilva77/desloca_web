# 🛠️ Ferramentas, Linguagens e Tecnologias — Projeto Desloca

> Arquivo de referência da equipe: lista tudo o que usamos no projeto e o que foi
> feito com ajuda da Inteligência Artificial.

---

## 1. Linguagens

| Linguagem | Para que serve no projeto |
| --- | --- |
| **TypeScript** | Linguagem principal do front-end. É JavaScript com "tipos", ou seja, ele avisa se a gente digitar algo errado (ex.: passar texto onde o código espera um número). |
| **JavaScript** | Base do TypeScript. Usado indiretamente em tudo que roda no navegador. |
| **SQL** | Linguagem do banco de dados. Usada para criar e consultar as tabelas (linhas, pontos, veículos, alertas). |
| **HTML** | Estrutura das páginas (o esqueleto da interface). |
| **CSS** | Visual do site: cores, fontes, tamanho, disposição dos elementos e responsividade (celular). |

---

## 2. Front-end (o que o usuário vê)

| Ferramenta | O que é | Para que usamos |
| --- | --- | --- |
| **React 18** | Biblioteca (framework) de front-end | Construir as telas em "componentes" (partes reutilizáveis, como cabeçalho, cartões e mapa). |
| **Vite 5** | Ferramenta de build/serve | Rodar o projeto em modo de desenvolvimento e compilar para produção. Muito rápido. |
| **React Router 6** | Biblioteca de rotas | Controlar a navegação entre as páginas (Início, Mapa, Linhas, etc.) sem recarregar o site. |
| **Leaflet + OpenStreetMap** | Biblioteca de mapas | Desenhar o mapa, as linhas dos trajetos, os pontos de parada e a posição dos ônibus. Gratuito e sem chave de API. |
| **Manrope (Google Fonts)** | Fonte tipográfica | Padronizar a tipografia do site inteiro. |

---

## 3. Back-end (fase de construção — parte do Bruno e da Talita)

| Ferramenta | O que é | Para que usamos |
| --- | --- | --- |
| **Node.js** | Runtime de JavaScript no servidor | Rodar o servidor que recebe e distribui a localização dos ônibus (mesma base do projeto KickIRL do Bruno). |
| **Express** | Biblioteca do Node.js | Criar as rotas da API (`GET`, `POST`) que o front-end vai consumir. |
| **WebSockets (Socket.IO)** | Comunicação em tempo real | Enviar a posição do ônibus para o mapa instantaneamente, sem precisar recarregar a página. |
| **MySQL** | Sistema de banco de dados | Armazenar as informações permanentes: linhas, pontos, veículos, alertas e denúncias. |
| **JWT + bcrypt** | Segurança | Autenticação de usuários: senha criptografada e token de acesso (se precisarmos de login). |

---

## 4. Banco de dados

| Tabela | O que guarda |
| --- | --- |
| `linhas` | Código, nome, cor, tarifa, frequência e status da linha |
| `pontos` | Nome, endereço, latitude e longitude de cada ponto de parada |
| `linha_ponto` | Ordem dos pontos em cada linha (o itinerário) |
| `veiculos` | Placa, modelo e status do ônibus (em operação / fora de linha) |
| `alertas` | Tipo, descrição, local e horário dos alertas |
| `denuncias` | O que os usuários reportaram e o status da resolução |

> 📄 Arquivo do schema completo: [`banco/desloca.sql`](banco/desloca.sql)

---

## 5. Ferramentas de trabalho e publicação

| Ferramenta | Para que usamos |
| --- | --- |
| **GitHub** | Hospedar o código do projeto (`github.com/BrunoSilva77/desloca_web`) e controlar as versões com commits. |
| **Git** | Sistema de versionamento: guarda o histórico do que mudou em cada dia. |
| **Render.com** | Publicar o site/backend gratuitamente (mesma hospedagem usada no KickIRL). |
| **Figma** | Mockup e wireframes de baixa fidelidade (tarefa do Guilherme). |
| **Antigravity** | Ferramenta de IA usada na call de treino da equipe. |
| **OpenAI / IA (esta conversa)** | Apoio no planejamento, arquitetura, código e documentação. |

---

## 6. O que o Bruno está fazendo com ajuda da IA

Tarefa definida no documento de escopo: **"Auxiliar no uso das ferramentas e backend"**.
Especificamente, a IA está ajudando o Bruno a:

1. **Organizar o projeto** — interpretar os documentos do repositório (Business Model Canvas,
   escopo, tarefas) e transformar tudo em um plano de execução.
2. **Montar a estrutura do front-end** — criar o projeto React + TypeScript, as rotas, os
   componentes e as telas (Início, Mapa, Linhas, Acessibilidade, Denúncias, Dicas).
3. **Escrever o código com comentários em português** — cada parte do código tem
   explicando o que faz, para a equipe entender e conseguir mexer depois.
4. **Modelar o banco de dados** — definição das tabelas SQL e do que cada uma guarda.
5. **Criar o README e a documentação** — descrição do projeto, stack, como rodar e
   justificativa das escolhas técnicas.
6. **Sugerir diferenciais do produto** — funcionalidades que separam o Desloca dos
   apps de ônibus comuns (previsão de lotação, alertas colaborativos, etc.).

> ⚠️ **Transparência acadêmica:** a IA é usada como **ferramenta de apoio**, igual a
> um mentor ou documentação. A equipe revisa, entende e assume a responsabilidade pelo
> que é entregue. Todo o conteúdo precisa estar compreendido pelos membros antes da
> apresentação.

---

## 7. Diagrama resumo da stack

```
┌────────────────────────── FRONT-END ──────────────────────────┐
│  React + TypeScript + Vite                                    │
│  ├── Telas (Início, Mapa, Linhas, Acessibilidade, Denúncias)  │
│  ├── Leaflet + OpenStreetMap (mapa)                           │
│  └── Estilos em CSS (identidade do logo Desloca)              │
└────────────────────────────┬──────────────────────────────────┘
                             │  HTTP (API REST) + WebSocket
┌────────────────────────────▼──────────────────────────────────┐
│  BACK-END (Node.js + Express + Socket.IO)                     │
│  ├── API REST: linhas, pontos, alertas, denúncias             │
│  ├── WebSocket: posição dos ônibus em tempo real              │
│  └── MySQL: dados permanentes do sistema                      │
└───────────────────────────────────────────────────────────────┘
```
