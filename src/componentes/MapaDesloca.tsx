// =============================================================================
// COMPONENTE DO MAPA
// =============================================================================
// Usa a biblioteca Leaflet + OpenStreetMap (gratuitos e sem chave de API).
// Este componente é reutilizado: a página do mapa usa sozinho, e a página de
// linhas usa para mostrar o trajeto de uma linha específica.
// =============================================================================

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css' // CSS obrigatório do Leaflet (ícones e zoom)
import type { Linha } from '../dados/linhas'

// Props = informações que a página passa para o componente funcionar
type Props = {
  linhaAtiva?: Linha | null // Linha selecionada (opcional)
  linhas: Linha[] // Todas as linhas para desenhar
  alertasCoords?: { coords: [number, number]; titulo: string }[] // Marcadores de alerta
  telaCheia?: boolean // Se true, o mapa ocupa toda a área disponível
  minhaPosicao?: [number, number] | null // Localização atual do usuário
}

// Cria o ícone de ônibus personalizado usando um emoji dentro de um círculo
function iconeOnibus(cor: string) {
  return L.divIcon({
    className: '', // Remove o estilo padrão do Leaflet
    html: `<div style="
      background:${cor};
      width:34px;height:34px;border-radius:50% 50% 50% 4px;
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
      transform:rotate(45deg);font-size:15px">🚌</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })
}

// Ícone simples de ponto de parada (bolinha branca com borda)
function iconePonto() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#fff;width:14px;height:14px;border-radius:50%;
      border:3px solid #1D1D1B;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

// Ícone da localização do usuário (bolinha azul estilo Google Maps)
function iconeUsuario() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#2563EB;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(37,99,235,.25),0 2px 8px rgba(0,0,0,.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

export default function Mapa({
  linhaAtiva,
  linhas,
  alertasCoords = [],
  telaCheia = false,
  minhaPosicao = null,
}: Props) {
  // Referência para o objeto do mapa do Leaflet (para poder manipular depois)
  const mapaRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Camada de controle que guarda todos os marcadores desenhados,
  // assim conseguimos limpar e redesenhar sem recarregar a página
  const camadaRef = useRef<L.LayerGroup | null>(null)

  // useEffect executa o código quando o componente aparece na tela
  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return

    // Cria o mapa centrado em Araçatuba - SP com zoom 14
    const mapa = L.map(containerRef.current).setView([-21.2087, -50.4347], 14)

    // Em tela cheia, recarrega o tamanho do mapa depois de montado.
    // Sem isso, o Leaflet calcula o tamanho errado e corta a visualização.
    if (telaCheia) {
      setTimeout(() => mapa.invalidateSize(), 250)
    }

    // Adiciona o mapa base (ruas) do OpenStreetMap — gratuito
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapa)

    // Cria a camada de marcadores e guarda as referências
    camadaRef.current = L.layerGroup().addTo(mapa)
    mapaRef.current = mapa

    // remove o mapa quando o componente sai da tela (evita vazamento de memória)
    return () => {
      mapa.remove()
      mapaRef.current = null
    }
  }, [])

  // useEffect separado: redesenha os marcadores sempre que a linha muda
  useEffect(() => {
    const camada = camadaRef.current
    if (!camada) return
    camada.clearLayers() // Limpa marcadores antigos

    // Desenha as linhas que NÃO estão selecionadas (versão esmaecida)
    linhas.forEach((linha) => {
      const ativa = linhaAtiva?.id === linha.id
      if (linhaAtiva && !ativa) return // Se tem linha ativa, mostra só ela

      // Linha do trajeto: polilinha conectando as coordenadas
      L.polyline(linha.trajeto, {
        color: linha.cor,
        weight: ativa ? 6 : 4,
        opacity: ativa ? 1 : 0.5,
        // Deixa a linha "pulsando" quando é a selecionada
        dashArray: ativa ? undefined : '8 8',
      }).addTo(camada)

      // Marcadores dos pontos de parada
      linha.pontos.forEach((ponto) => {
        L.marker(ponto.coords, { icon: iconePonto() })
          .bindPopup(`<b>Ponto:</b> ${ponto.nome}<br><b>Linha:</b> ${linha.codigo}`)
          .addTo(camada)
      })

      // Marcador do ônibus mais próximo (só se a linha estiver operando)
      if (linha.status === 'operacao') {
        L.marker(linha.proximoOnibus.posicao, { icon: iconeOnibus(linha.cor) })
          .bindPopup(
            `<b>Linha ${linha.codigo} - ${linha.nome}</b><br>
             Ônibus: ${linha.proximoOnibus.placa}<br>
             Lotação: ${linha.proximoOnibus.lotacao}<br>
             Previsão: ${linha.proximoOnibus.previsao}`
          )
          .addTo(camada)
      }
    })

    // Desenha os marcadores de alerta (quando a página os informa)
    alertasCoords.forEach((alerta) => {
      L.marker(alerta.coords, {
        // Ícone de alerta: losango vermelho com "!"
        icon: L.divIcon({
          className: '',
          html: `<div style="
            background:#B3453A;width:26px;height:26px;border-radius:6px;
            transform:rotate(45deg);display:flex;align-items:center;
            justify-content:center;color:#fff;font-weight:bold;
            border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">
            <span style="transform:rotate(-45deg)">!</span></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
        }),
      })
        .bindPopup(`<b>⚠ Alerta</b><br>${alerta.titulo}`)
        .addTo(camada)
    })

    // Desenha o marcador da localização do usuário (bolinha azul)
    if (minhaPosicao) {
      L.marker(minhaPosicao, { icon: iconeUsuario() })
        .bindPopup('<b>Você está aqui</b>')
        .addTo(camada)
    }

    // Se tem uma linha selecionada, ajusta o zoom para enxergar o trajeto inteiro
    if (linhaAtiva && linhaAtiva.trajeto.length > 1) {
      mapaRef.current?.fitBounds(L.latLngBounds(linhaAtiva.trajeto), {
        padding: [40, 40],
      })
    }

    // Quando a localização do usuário chega, centraliza o mapa nela
    if (minhaPosicao && !linhaAtiva) {
      mapaRef.current?.setView(minhaPosicao, 15)
    }
  }, [linhaAtiva, linhas, alertasCoords, minhaPosicao])

  // O que é desenhado na tela: a "caixa" onde o mapa é montado.
  // "telaCheia" aplica a classe que faz o mapa ocupar toda a área da página.
  return (
    <div
      className={telaCheia ? 'mapa mapa--tela-cheia' : 'mapa'}
      ref={containerRef}
      role="application"
      aria-label="Mapa de mobilidade"
    />
  )
}
