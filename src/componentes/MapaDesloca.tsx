// =============================================================================
// COMPONENTE DO MAPA
// =============================================================================
// Usa a biblioteca Leaflet + OpenStreetMap (gratuitos e sem chave de API).
// Suporta:
//   1. Ônibus andando em tempo real pelo mapa (animação suave contínua).
//   2. Modo limpo: se nenhuma linha for marcada, exibe APENAS os ônibus em movimento.
//   3. Desenho de rotas e pontos de parada somente para as linhas selecionadas.
//   4. Foco suave (flyTo) em coordenadas de paradas, alertas ou GPS.
// =============================================================================

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Linha } from '../dados/linhas'

type AlertaItem = {
  coords: [number, number]
  titulo: string
  tipo?: string
  descricao?: string
  id?: number | string
}

type Props = {
  linhaAtiva?: Linha | null
  linhasComTrajeto?: Linha[] // Linhas que terão trajetos e paradas desenhados
  linhas?: Linha[] // Retrocompatibilidade
  todasLinhas?: Linha[] // Todas as linhas (para manter os ônibus sempre andando)
  alertasCoords?: AlertaItem[]
  telaCheia?: boolean
  minhaPosicao?: [number, number] | null
  focoCoords?: [number, number] | null
  onLinhaClick?: (linha: Linha) => void
  onPontoClick?: (ponto: { nome: string; coords: [number, number] }, linha: Linha) => void
  onAlertaClick?: (alerta: AlertaItem) => void
}

// Distância em metros entre duas coordenadas (fórmula de Haversine),
// usada para calcular a velocidade da animação dos ônibus
function metrosEntre(a: [number, number], b: [number, number]) {
  const RAIO = 6371000
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const lat1 = (a[0] * Math.PI) / 180
  const lat2 = (b[0] * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO * Math.asin(Math.sqrt(h))
}

// Coordenada do Terminal Urbano Nelson Reis Alves: origem e destino de
// todas as rotas simuladas da apresentação
const COORD_TERMINAL: [number, number] = [-21.203169, -50.4385078]

function iconeTerminal() {
  return L.divIcon({
    className: 'marcador-terminal',
    html: `<div style="
      background:#1D1D1B;
      width:38px;height:38px;border-radius:50% 50% 50% 6px;
      display:flex;align-items:center;justify-content:center;
      border:3px solid #C9A882;box-shadow:0 4px 14px rgba(0,0,0,.45);
      transform:rotate(45deg);font-size:17px">🚉</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  })
}

function iconeOnibus(cor: string) {
  return L.divIcon({
    className: 'marcador-onibus-animado',
    html: `<div style="
      background:${cor};
      width:34px;height:34px;border-radius:50% 50% 50% 4px;
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.35);
      transform:rotate(45deg);font-size:15px;cursor:pointer">🚌</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })
}

function iconePonto(destaque = false) {
  const tam = destaque ? 18 : 14
  return L.divIcon({
    className: 'marcador-ponto', // classe própria para os testes contarem os pontos
    html: `<div style="
      background:${destaque ? '#C9A882' : '#fff'};width:${tam}px;height:${tam}px;border-radius:50%;
      border:3px solid #1D1D1B;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:transform .2s"></div>`,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam / 2],
  })
}

function iconeUsuario() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#2563EB;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(37,99,235,.25),0 2px 8px rgba(0,0,0,.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function iconeAlerta(tipo = 'transito') {
  const emoji = tipo === 'obra' ? '🚧' : tipo === 'clima' ? '🌧️' : '⚠️'
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#B3453A;width:30px;height:30px;border-radius:8px;
      transform:rotate(45deg);display:flex;align-items:center;
      justify-content:center;color:#fff;font-weight:bold;
      border:2px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.35);cursor:pointer">
      <span style="transform:rotate(-45deg);font-size:15px">${emoji}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

export default function MapaDesloca({
  linhaAtiva,
  linhasComTrajeto,
  linhas,
  todasLinhas = [],
  alertasCoords = [],
  telaCheia = false,
  minhaPosicao = null,
  focoCoords = null,
  onLinhaClick,
  onPontoClick,
  onAlertaClick,
}: Props) {
  const mapaRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const camadaTrajetosRef = useRef<L.LayerGroup | null>(null)
  const camadaOnibusRef = useRef<L.LayerGroup | null>(null)
  const camadaAlertasRef = useRef<L.LayerGroup | null>(null)

  // Controle dos marcadores de ônibus
  const marcadoresOnibusRef = useRef<Record<number, L.Marker>>({})

  // Último conjunto de rotas desenhado (serve para enquadrar o mapa só quando
  // a seleção muda, e não a cada renderização do React)
  const ultimaSelecaoRef = useRef('')

  // Linhas que terão trajetos e paradas desenhados
  const linhasParaDesenhar = linhasComTrajeto ?? linhas ?? []

  // Inicialização do mapa Leaflet
  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return

    // Visão inicial cobrindo a cidade inteira (as 4 rotas vão do norte ao sul)
    const mapa = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([-21.205, -50.442], 13)

    L.control.zoom({ position: 'bottomleft' }).addTo(mapa)

    if (telaCheia) {
      setTimeout(() => mapa.invalidateSize(), 250)
    }

    // Tiles leves do CARTO (Positron): fundo cinza-claro, sem poluição visual
    // — rotas e ônibus aparecem com muito mais destaque que no OSM padrão
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(mapa)

    camadaTrajetosRef.current = L.layerGroup().addTo(mapa)
    camadaAlertasRef.current = L.layerGroup().addTo(mapa)
    camadaOnibusRef.current = L.layerGroup().addTo(mapa)
    mapaRef.current = mapa

    // Terminal Urbano Nelson Reis Alves: marcador sempre visível, pois é o
    // ponto de partida e chegada de todas as linhas (simulação da apresentação)
    L.marker(COORD_TERMINAL, { icon: iconeTerminal(), zIndexOffset: 600 })
      .bindPopup(
        `
        <div style="font-family: 'Manrope', sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="font-size: 14px; display: block; margin-bottom: 2px;">🚉 Terminal Urbano</strong>
          <span style="color: #6B6863;">Nelson Reis Alves</span><br>
          <span style="color: #6B6863;">Todos os ônibus saem e voltam aqui.</span>
        </div>
      `
      )
      .addTo(mapa)

    const onResize = () => mapa.invalidateSize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      mapa.remove()
      mapaRef.current = null
    }
  }, [])

  // Foco suave em coordenadas específicas (ao clicar numa parada, alerta ou GPS)
  useEffect(() => {
    if (focoCoords && mapaRef.current) {
      mapaRef.current.flyTo(focoCoords, 16, { duration: 1.2 })
    }
  }, [focoCoords])

  // ---------------------------------------------------------------------------
  // EXIBIÇÃO DOS ÔNIBUS EM OPERAÇÃO NO MAPA (Posições estáticas)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const camadaOnibus = camadaOnibusRef.current
    if (!camadaOnibus || !todasLinhas.length) return

    camadaOnibus.clearLayers()
    marcadoresOnibusRef.current = {}

    todasLinhas.forEach((linha) => {
      if (linha.status !== 'operacao') return

      const coordAtual = linha.proximoOnibus.posicao

      const marker = L.marker(coordAtual, {
        icon: iconeOnibus(linha.cor),
      })

      marker.bindPopup(`
        <div style="font-family: 'Manrope', sans-serif; font-size: 13px; line-height: 1.45;">
          <strong style="display: block; font-size: 14px; margin-bottom: 3px;">🚌 Linha ${linha.codigo} — ${linha.nome}</strong>
          <div style="color: #4F7A5A; font-weight: 700; margin-bottom: 4px;">● Em operação</div>
          <div>Placa: <b>${linha.proximoOnibus.placa}</b></div>
          <div>Previsão: <b>${linha.proximoOnibus.previsao}</b></div>
          <div>Lotação: <b>${linha.proximoOnibus.lotacao}</b></div>
          <button style="margin-top: 8px; width: 100%; padding: 6px 10px; background: #1D1D1B; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;" onclick="window.__selecionarLinhaDesloca && window.__selecionarLinhaDesloca(${linha.id})">
            Ver trajeto completo
          </button>
        </div>
      `)

      if (onLinhaClick) {
        marker.on('click', () => onLinhaClick(linha))
      }

      marker.addTo(camadaOnibus)
      marcadoresOnibusRef.current[linha.id] = marker
    })

    ;(window as unknown as { __selecionarLinhaDesloca?: (id: number) => void }).__selecionarLinhaDesloca = (id: number) => {
      const encontrada = todasLinhas.find((l) => l.id === id)
      if (encontrada && onLinhaClick) onLinhaClick(encontrada)
    }
  }, [todasLinhas, onLinhaClick])

  // ---------------------------------------------------------------------------
  // ANIMAÇÃO DOS ÔNIBUS: saem do Terminal e dão a volta completa na rota em
  // loop (simulação da apresentação). Cada linha parte escalonada, para os
  // ônibus não saírem todos juntos do mesmo ponto.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Quem prefere menos movimento fica com os ônibus parados no terminal
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (semMovimento) return

    // Pré-calcula, para cada linha, a distância acumulada até cada vértice do
    // trajeto — assim dá para interpolar a posição exata entre dois pontos
    const rotas = todasLinhas
      .filter((linha) => linha.status === 'operacao' && linha.trajeto.length > 1)
      .map((linha, indice) => {
        const acumulado: number[] = [0]
        let total = 0
        for (let i = 1; i < linha.trajeto.length; i++) {
          total += metrosEntre(linha.trajeto[i - 1], linha.trajeto[i])
          acumulado.push(total)
        }
        const duracaoSeg = linha.duracaoVoltaMin * 60
        return {
          linha,
          acumulado,
          total,
          duracaoSeg,
          // Saída escalonada: cada ônibus parte 25s depois do anterior, para
          // todos estarem andando já no começo da apresentação
          atrasoSeg: indice * 25,
        }
      })
      .filter((rota) => rota.total > 0)

    if (!rotas.length) return

    const inicio = performance.now()

    const animar = (tempo: number) => {
      const decorrido = (tempo - inicio) / 1000

      rotas.forEach((rota) => {
        const marcador = marcadoresOnibusRef.current[rota.linha.id]
        if (!marcador) return

        const desdePartida = decorrido - rota.atrasoSeg

        // Ainda não partiu: ônibus espera no Terminal
        if (desdePartida <= 0) {
          marcador.setLatLng(rota.linha.trajeto[0])
          return
        }

        // Fração da volta atual (0 = saiu do terminal, 1 = voltou)
        const fracao = (desdePartida % rota.duracaoSeg) / rota.duracaoSeg
        const alvo = fracao * rota.total

        // Busca binária do trecho onde o ônibus está agora
        let esquerda = 0
        let direita = rota.acumulado.length - 1
        while (esquerda < direita) {
          const meio = Math.floor((esquerda + direita) / 2)
          if (rota.acumulado[meio] < alvo) esquerda = meio + 1
          else direita = meio
        }
        const indice = Math.max(esquerda, 1)

        // Interpolação linear entre os dois vértices do trecho
        const distAntes = rota.acumulado[indice - 1]
        const distDepois = rota.acumulado[indice]
        const peso = distDepois > distAntes ? (alvo - distAntes) / (distDepois - distAntes) : 0
        const a = rota.linha.trajeto[indice - 1]
        const b = rota.linha.trajeto[indice]
        marcador.setLatLng([a[0] + (b[0] - a[0]) * peso, a[1] + (b[1] - a[1]) * peso])
      })

      quadro = requestAnimationFrame(animar)
    }

    let quadro = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(quadro)
  }, [todasLinhas])

  // ---------------------------------------------------------------------------
  // DESENHO DAS POLILINHAS E PARADAS (Apenas para linhas selecionadas)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const camadaTrajetos = camadaTrajetosRef.current
    if (!camadaTrajetos) return
    camadaTrajetos.clearLayers()

    // Ajusta a visão só quando o conjunto de rotas em tela MUDA (e não há
    // linha selecionada): assim dá para explorar o mapa à mão sem o Leaflet
    // puxar a câmera de volta a cada renderização do React
    const chaveSelecao = linhasParaDesenhar.map((l) => l.id).join(',')
    const mudouSelecao = chaveSelecao !== ultimaSelecaoRef.current
    ultimaSelecaoRef.current = chaveSelecao

    // Se nenhuma linha foi selecionada/marcada, o mapa fica no MODO LIMPO
    // exibindo apenas os ônibus andando (gerenciados na camada de ônibus acima)
    linhasParaDesenhar.forEach((linha) => {
      const ativa = linhaAtiva?.id === linha.id

      // Trajeto da linha (polilinha)
      const polyline = L.polyline(linha.trajeto, {
        color: linha.cor,
        weight: ativa ? 7 : 4,
        opacity: ativa ? 1 : linhaAtiva ? 0.25 : 0.7,
        dashArray: ativa ? undefined : '6 6',
      }).addTo(camadaTrajetos)

      if (onLinhaClick) {
        polyline.on('click', () => onLinhaClick(linha))
      }

      // Pontos de parada: só da linha ativa, para não poluir o mapa com
      // dezenas de pontinhos quando várias rotas aparecem de uma vez
      if (ativa) {
        linha.pontos.forEach((ponto) => {
          const marker = L.marker(ponto.coords, {
            icon: iconePonto(ativa),
          })

          const popupContent = `
            <div style="font-family: 'Manrope', sans-serif; font-size: 13px; line-height: 1.4;">
              <strong style="font-size: 14px; display: block; margin-bottom: 2px;">🚏 ${ponto.nome}</strong>
              <span style="color: #6B6863;">Linha: <b>${linha.codigo} — ${linha.nome}</b></span><br>
              <span style="color: #6B6863;">Tarifa: ${linha.tarifa}</span>
            </div>
          `
          marker.bindPopup(popupContent)

          if (onPontoClick) {
            marker.on('click', () => onPontoClick(ponto, linha))
          }

          marker.addTo(camadaTrajetos)
        })
      }
    })

    // Ajusta o zoom na linha ativa se ela existir
    if (linhaAtiva && linhaAtiva.trajeto.length > 1) {
      mapaRef.current?.fitBounds(L.latLngBounds(linhaAtiva.trajeto), {
        padding: [50, 50],
      })
    } else if (mudouSelecao && linhasParaDesenhar.length > 1) {
      // Sem linha ativa mas com várias rotas marcadas: enquadra a rede toda
      // (as rotas cobrem ~12 km de norte a sul — zoom fixo não dá conta)
      const limites = L.latLngBounds(
        linhasParaDesenhar.flatMap((linha) => linha.trajeto)
      )
      if (limites.isValid()) {
        mapaRef.current?.fitBounds(limites, { padding: [40, 40] })
      }
    }
  }, [linhaAtiva, linhasParaDesenhar, onLinhaClick, onPontoClick])

  // ---------------------------------------------------------------------------
  // DESENHO DOS ALERTAS E LOCALIZAÇÃO DO USUÁRIO
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const camadaAlertas = camadaAlertasRef.current
    if (!camadaAlertas) return
    camadaAlertas.clearLayers()

    alertasCoords.forEach((alerta) => {
      const marker = L.marker(alerta.coords, {
        icon: iconeAlerta(alerta.tipo),
      })

      marker.bindPopup(`
        <div style="font-family: 'Manrope', sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="color: #B3453A; font-size: 14px; display: block; margin-bottom: 2px;">⚠️ Alerta / Ocorrência</strong>
          <div><b>${alerta.titulo}</b></div>
          ${alerta.descricao ? `<p style="margin-top: 4px; color: #6B6863;">${alerta.descricao}</p>` : ''}
        </div>
      `)

      if (onAlertaClick) {
        marker.on('click', () => onAlertaClick(alerta))
      }

      marker.addTo(camadaAlertas)
    })

    if (minhaPosicao) {
      L.marker(minhaPosicao, { icon: iconeUsuario() })
        .bindPopup(`
          <div style="font-family: 'Manrope', sans-serif; font-size: 13px;">
            <b>📍 Você está aqui</b>
          </div>
        `)
        .addTo(camadaAlertas)
    }
  }, [alertasCoords, minhaPosicao, onAlertaClick])

  return (
    <div
      className={telaCheia ? 'mapa mapa--tela-cheia' : 'mapa'}
      ref={containerRef}
      role="application"
      aria-label="Mapa de mobilidade urbana"
    />
  )
}
