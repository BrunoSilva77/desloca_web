// =============================================================================
// ROTEIRO DE ÔNIBUS (origem → destino)
// =============================================================================
// Cálculo simples, sem backend, para a busca "Para onde você vai?" do painel:
// a pessoa digita o destino (parada de ônibus), o sistema pega a localização
// dela (GPS, ou o Terminal Urbano quando a localização está indisponível) e
// sugere a (ou as) linha(s) que ela pode pegar — direto, ou com UMA
// baldeação quando nenhuma linha atende origem e destino sozinha.
//
// É um protótipo de apresentação: os critérios são distância em linha reta
// entre paradas (Haversine), não tempo de viagem real.
// =============================================================================

import { LINHAS, type Linha } from '../dados/linhas'
import { metrosEntre, COORD_TERMINAL } from '../componentes/MapaDesloca'

// Parada de ônibus usada nos cálculos (nome + coordenada)
export type Parada = { nome: string; coords: [number, number] }

// Trecho do trajeto: uma linha embarcada em X e desembarcada em Y
export type Perna = {
  linha: Linha
  embarque: Parada
  desembarque: Parada
  // Distância a pé da origem até o ponto de embarque (perna 1) — nas demais
  // pernas a pessoa já está no ponto (baldeação), então vale 0
  caminhadaM: number
}

// Rota sugerida ao usuário
export type Roteiro = {
  destino: Parada
  origem: Parada
  pernas: Perna[] // 1 perna = direto; 2 pernas = com baldeação
  baldeacao: Parada | null // Ponto de troca (só existe quando há 2 pernas)
  caminhadaDesembarqueM: number // A pé do último desembarque até o destino
}

// Raio, em metros, que a pessoa caminha até o ponto de ônibus
const RAIO_PARADA_M = 400
// Raio, em metros, entre paradas de duas linhas diferentes para valer troca
const RAIO_BALDEACAO_M = 300

// -----------------------------------------------------------------------------
// Paradas únicas de todas as linhas em operação (base da sugestão de destino)
// -----------------------------------------------------------------------------
export function paradasDisponiveis(): Parada[] {
  const vistos = new Set<string>()
  const unicas: Parada[] = []
  for (const linha of LINHAS) {
    if (linha.status !== 'operacao') continue
    for (const ponto of linha.pontos) {
      if (vistos.has(ponto.nome)) continue
      vistos.add(ponto.nome)
      unicas.push({ nome: ponto.nome, coords: ponto.coords })
    }
  }
  return unicas
}

// Destinos que casam com o texto digitado (máx. 6 sugestões no dropdown)
export function destinosPorTexto(texto: string): Parada[] {
  const termo = texto.trim().toLowerCase()
  if (!termo) return []
  return paradasDisponiveis()
    .filter((parada) => parada.nome.toLowerCase().includes(termo))
    .slice(0, 6)
}

// Códigos das linhas que passam em um destino (ex.: "101 · 303")
export function linhasNoDestino(destino: Parada): string[] {
  const codigos: string[] = []
  for (const linha of LINHAS) {
    if (linha.status !== 'operacao') continue
    if (linha.pontos.some((p) => p.nome === destino.nome)) codigos.push(linha.codigo)
  }
  return codigos
}

// -----------------------------------------------------------------------------
// Melhor parada de uma linha para chegar num ponto (origem ou destino).
// Retorna null quando nenhuma parada está dentro do raio permitido.
// -----------------------------------------------------------------------------
function melhorParada(
  linha: Linha,
  coords: [number, number],
  raioM: number
): { parada: Parada; distanciaM: number } | null {
  let melhor: { parada: Parada; distanciaM: number } | null = null
  for (const ponto of linha.pontos) {
    const distanciaM = metrosEntre(coords, ponto.coords)
    if (distanciaM <= raioM && (!melhor || distanciaM < melhor.distanciaM)) {
      melhor = { parada: { nome: ponto.nome, coords: ponto.coords }, distanciaM }
    }
  }
  return melhor
}

// -----------------------------------------------------------------------------
// Calcula o roteiro de uma viagem. Retorna null quando nenhuma linha atende
// (nem direto, nem com baldeação) a origem e o destino informados.
// -----------------------------------------------------------------------------
export function calcularRoteiro(
  destino: Parada,
  origemCoords: [number, number],
  origemNome: string
): Roteiro | null {
  const linhas = LINHAS.filter((l) => l.status === 'operacao' && l.pontos.length > 0)

  const servemOrigem = linhas.filter((l) => melhorParada(l, origemCoords, RAIO_PARADA_M))
  const servemDestino = linhas.filter((l) => melhorParada(l, destino.coords, RAIO_PARADA_M))

  type Candidato = {
    score: number
    pernas: Perna[]
    baldeacao: Parada | null
    caminhadaDesembarqueM: number
  }
  let melhor: Candidato | null = null

  // 1) DIRETA: uma única linha atende origem e destino
  for (const linha of servemOrigem) {
    const origem = melhorParada(linha, origemCoords, RAIO_PARADA_M)
    const alvo = melhorParada(linha, destino.coords, RAIO_PARADA_M)
    if (!origem || !alvo) continue

    const score = origem.distanciaM + alvo.distanciaM
    if (!melhor || score < melhor.score) {
      melhor = {
        score,
        pernas: [
          {
            linha,
            embarque: origem.parada,
            desembarque: alvo.parada,
            caminhadaM: Math.round(origem.distanciaM),
          },
        ],
        baldeacao: null,
        caminhadaDesembarqueM: Math.round(alvo.distanciaM),
      }
    }
  }
  if (melhor) return montarRoteiro(melhor, destino, origemCoords, origemNome)

  // 2) COM BALDEAÇÃO: uma linha leva até perto de outra que termina o caminho
  for (const l1 of servemOrigem) {
    const origem = melhorParada(l1, origemCoords, RAIO_PARADA_M)
    if (!origem) continue

    for (const l2 of servemDestino) {
      if (l2.id === l1.id) continue
      const alvo = melhorParada(l2, destino.coords, RAIO_PARADA_M)
      if (!alvo) continue

      // Melhor par de paradas (uma de cada linha) para a pessoa trocar
      let troca: { distanciaM: number; p1: Parada; p2: Parada } | null = null
      for (const p1 of l1.pontos) {
        for (const p2 of l2.pontos) {
          const distanciaM = metrosEntre(p1.coords, p2.coords)
          if (distanciaM <= RAIO_BALDEACAO_M && (!troca || distanciaM < troca.distanciaM)) {
            troca = {
              distanciaM,
              p1: { nome: p1.nome, coords: p1.coords },
              p2: { nome: p2.nome, coords: p2.coords },
            }
          }
        }
      }
      if (!troca) continue

      const score = origem.distanciaM + troca.distanciaM + alvo.distanciaM
      if (!melhor || score < melhor.score) {
        melhor = {
          score,
          pernas: [
            {
              linha: l1,
              embarque: origem.parada,
              desembarque: troca.p1,
              caminhadaM: Math.round(origem.distanciaM),
            },
            {
              linha: l2,
              embarque: troca.p2,
              desembarque: alvo.parada,
              caminhadaM: 0,
            },
          ],
          baldeacao: troca.p1,
          caminhadaDesembarqueM: Math.round(alvo.distanciaM),
        }
      }
    }
  }

  if (!melhor) return null
  return montarRoteiro(melhor, destino, origemCoords, origemNome)
}

// Monta o objeto final do roteiro (só enriquece com origem/destino)
function montarRoteiro(
  candidato: {
    pernas: Perna[]
    baldeacao: Parada | null
    caminhadaDesembarqueM: number
  },
  destino: Parada,
  origemCoords: [number, number],
  origemNome: string
): Roteiro {
  return {
    destino,
    origem: { nome: origemNome, coords: origemCoords },
    pernas: candidato.pernas,
    baldeacao: candidato.baldeacao,
    caminhadaDesembarqueM: candidato.caminhadaDesembarqueM,
  }
}

// Coordenadas do Terminal: usado como origem quando o GPS não está disponível
export const ORIGEM_PADRAO = COORD_TERMINAL
