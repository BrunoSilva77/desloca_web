// =============================================================================
// PÁGINA DO MAPA & LINHAS INTEGRADA
// =============================================================================
// Tela principal e central do Desloca:
//   1. Mapa interativo com todas as linhas, paradas e ônibus em tempo real.
//   2. Ônibus andando em tempo real pelo mapa (animação contínua).
//   3. Modo limpo: possibilidade de não selecionar nenhum ônibus/linha, exibindo
//      apenas os veículos em movimento pelas ruas.
//   4. Botão de restauração flutuante quando o painel for minimizado.
//   5. Painel de Linhas integrado com detalhes completos, horários e paradas.
//   6. Notificações ("Tudo que tá rolando") e Denúncias integradas na tela.
// =============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import MapaDesloca from '../componentes/MapaDesloca'
import PopupNotificacoes from '../componentes/PopupNotificacoes'
import PopupDenuncia, { type DadosDenuncia } from '../componentes/PopupDenuncia'
import DicaNotificacao from '../componentes/DicaNotificacao'
import Toast from '../componentes/Toast'
import { LINHAS, ALERTAS, type Linha, type Alerta } from '../dados/linhas'
import { distanciaKm, tempoCaminhadaMin, formatarDistancia } from '../utilidades/geo'
import { formatarRelogio, proximaPartida, desdeUltimaPartida } from '../utilidades/relogioSimulado'
import {
  destinosPorTexto,
  linhasNoDestino,
  calcularRoteiro,
  type Parada,
  type Roteiro,
} from '../utilidades/roteiro'
import { COORD_TERMINAL } from '../componentes/MapaDesloca'

// Próxima partida de uma linha no relógio simulado (para a placa de partidas)
function proximaPartidaLinha(linha: Linha): number {
  return proximaPartida(linha.partida.primeira, linha.partida.intervalo)
}

// Quantos veículos circulam por linha (mesmo número usado na simulação do mapa:
// o 2º veículo sai meio intervalo depois do 1º) — cada um com sua placa e seu
// próprio horário de próxima partida, para a lista do painel mostrar OS DOIS
const VEICULOS_LISTA = [0, 1]

// Dados de um veículo específico da linha (placa própria + situação atual)
function veiculosDaLinha(linha: Linha) {
  return VEICULOS_LISTA.map((veiculo) => {
    // Mesmo deslocamento de partida usado no MapaDesloca (2º sai +intervalo/2)
    const primeira = linha.partida.primeira + (linha.partida.intervalo / 2) * veiculo
    const desde = desdeUltimaPartida(primeira, linha.partida.intervalo)
    const emRota = desde !== null && desde < linha.duracaoVoltaMin
    // Segunda placa: soma 1 no último caractere (ABC-1D23 → ABC-1D24)
    const ultimo = linha.proximoOnibus.placa.slice(-1)
    const proximo =
      /[0-9]/.test(ultimo)
        ? String((Number(ultimo) + 1) % 10)
        : String.fromCharCode(ultimo.charCodeAt(0) + 1)
    const placa =
      veiculo === 0 ? linha.proximoOnibus.placa : linha.proximoOnibus.placa.slice(0, -1) + proximo
    return {
      veiculo,
      placa,
      emRota,
      proxima: proximaPartida(primeira, linha.partida.intervalo),
    }
  })
}

// Ícone SVG de ônibus reutilizável
function IconeOnibus({ cor }: { cor: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 15V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V15"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15V7C6 5.34315 7.34315 4 9 4H15C16.6569 4 18 5.34315 18 7V15"
        stroke={cor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="19" r="1" fill={cor} />
      <circle cx="16" cy="19" r="1" fill={cor} />
    </svg>
  )
}

export default function Mapa() {
  const [searchParams] = useSearchParams()

  // Busca por DESTINO ("Para onde você vai?"): o texto digitado vira
  // sugestão de paradas; escolher uma calcula o roteiro de ônibus
  const [buscaDestino, setBuscaDestino] = useState('')
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'operacao'>('todas')

  // Linhas cujos trajetos e pontos serão desenhados no mapa (vazio = modo limpo, só ônibus andando!)
  // Começa no modo limpo: nenhuma rota desenhada, apenas os ônibus em movimento
  const [linhasVisiveisIds, setLinhasVisiveisIds] = useState<number[]>([])

  const [mostrarAlertas, setMostrarAlertas] = useState(true)

  // Linha selecionada para detalhes completos
  const [linhaSelecionada, setLinhaSelecionada] = useState<Linha | null>(null)

  // Coordenadas para foco no mapa (quando o usuário clica numa parada ou alerta)
  const [focoCoords, setFocoCoords] = useState<[number, number] | null>(null)

  // Modais flutuantes e estado dos painéis
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false)
  const [mostrarDenuncia, setMostrarDenuncia] = useState(false)
  const [painelAbertoMobile, setPainelAbertoMobile] = useState(true)
  const [painelMinimizadoDesktop, setPainelMinimizadoDesktop] = useState(false)

  // Notificações e alertas dinâmicos
  const [alertasLista, setAlertasLista] = useState<Alerta[]>(ALERTAS)
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(3)

  // Localização do usuário (usada no card "Ponto mais próximo" e no roteiro
  // por destino; quando o GPS falha, simplesmente não mostra o card)
  const [minhaPosicao, setMinhaPosicao] = useState<[number, number] | null>(null)

  // Sistema de dicas e toasts
  const [dicaContextual, setDicaContextual] = useState<string | null>(null)
  const [toastMensagem, setToastMensagem] = useState<string | null>(null)

  // Relógio da simulação (corre 10x mais rápido que o real). Atualiza a cada
  // segundo real para o horário do chip acompanhar as partidas dos ônibus
  const [horaSimulada, setHoraSimulada] = useState(() => formatarRelogio())

  useEffect(() => {
    const intervalo = setInterval(() => setHoraSimulada(formatarRelogio()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  // ---------------------------------------------------------------------------
  // Disparador de dica contextual
  // ---------------------------------------------------------------------------
  const dispararDica = useCallback((mensagem: string) => {
    setDicaContextual(mensagem)
  }, [])

  // ---------------------------------------------------------------------------
  // Integração com parâmetros da URL (ex.: ?acao=denuncia ou ?linha=101)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const acao = searchParams.get('acao')
    const codigoLinha = searchParams.get('linha')

    if (acao === 'denuncia') {
      setMostrarDenuncia(true)
      dispararDica('Dica: Informar detalhes e pontos de referência agiliza a resposta da equipe.')
    }

    if (codigoLinha) {
      const encontrada = LINHAS.find((l) => l.codigo === codigoLinha)
      if (encontrada) {
        setLinhaSelecionada(encontrada)
        dispararDica(`Dica: Toque nos pontos de parada da Linha ${encontrada.codigo} para focar no mapa.`)
      }
    }
  }, [searchParams, dispararDica])

  // ---------------------------------------------------------------------------
  // Geolocalização do usuário
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Sem GPS disponível (ou permissão negada): apenas não mostra o card de
    // ponto mais próximo — nenhum aviso de erro na tela
    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (pos) => setMinhaPosicao([pos.coords.latitude, pos.coords.longitude]),
      undefined,
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // ---------------------------------------------------------------------------
  // Dica inicial e rotativa
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const timerInicial = setTimeout(() => {
      dispararDica('Dica: Toque em qualquer linha da lista ou do mapa para ver o trajeto e os horários em tempo real.')
    }, 1800)

    const intervaloDicas = setInterval(() => {
      const dicasExtras = [
        'Dica: No modo limpo, você pode acompanhar os ônibus na cidade sem poluição visual.',
        'Dica de Mobilidade: Andar de ônibus poupa combustível e reduz as emissões de carbono da cidade.',
        'Dica: No Terminal Central a integração temporal entre linhas é garantida por até 60 minutos.',
        'Dica: O botão ⚠️ no canto do mapa permite reportar buracos, iluminação falha ou paradas quebradas.',
        'Dica: Clique no sino 🔔 para ver o boletim de obras e alertas de trânsito atualizados ao vivo.',
      ]
      const sorteada = dicasExtras[Math.floor(Math.random() * dicasExtras.length)]
      dispararDica(sorteada)
    }, 55000)

    return () => {
      clearTimeout(timerInicial)
      clearInterval(intervaloDicas)
    }
  }, [dispararDica])

  // ---------------------------------------------------------------------------
  // Cálculo dos pontos mais próximos do usuário
  // ---------------------------------------------------------------------------
  const pontosProximos = useMemo(() => {
    if (!minhaPosicao) return []

    const todos: { distancia: number; nome: string; linha: Linha }[] = []
    LINHAS.forEach((linha) => {
      linha.pontos.forEach((ponto) => {
        todos.push({
          distancia: distanciaKm(minhaPosicao, ponto.coords),
          nome: ponto.nome,
          linha,
        })
      })
    })

    const ordenados = todos.sort((a, b) => a.distancia - b.distancia)
    const vistos = new Set<string>()
    const unicos: typeof ordenados = []

    for (const item of ordenados) {
      if (vistos.has(item.nome)) continue
      vistos.add(item.nome)
      unicos.push(item)
      if (unicos.length === 3) break
    }

    return unicos
  }, [minhaPosicao])

  const pontoMaisProximo = pontosProximos[0]

  // ---------------------------------------------------------------------------
  // Busca por destino: sugestões de paradas + cálculo do roteiro de ônibus
  // ---------------------------------------------------------------------------
  const destinosSugeridos = useMemo(() => destinosPorTexto(buscaDestino), [buscaDestino])

  // Escolheu um destino: monta o roteiro (direto ou com baldeação) a partir
  // da localização atual (ou do Terminal, se o GPS não estiver disponível)
  function escolherDestino(destino: Parada) {
    const origemCoords = minhaPosicao ?? COORD_TERMINAL
    const origemNome = minhaPosicao ? 'sua localização' : 'Terminal Urbano'
    const novoRoteiro = calcularRoteiro(destino, origemCoords, origemNome)

    setBuscaDestino(destino.nome)
    setRoteiro(novoRoteiro)
    setFocoCoords(destino.coords)
    setLinhaSelecionada(null)

    if (novoRoteiro) {
      // Deixa no mapa só as linhas do roteiro sugerido
      setLinhasVisiveisIds([...new Set(novoRoteiro.pernas.map((p) => p.linha.id))])
      const codigos = novoRoteiro.pernas.map((p) => p.linha.codigo).join(' → ')
      dispararDica(
        novoRoteiro.pernas.length === 1
          ? `Rota para ${destino.nome}: pegue a linha ${codigos}.`
          : `Rota para ${destino.nome} com baldeação: ${codigos}.`
      )
    } else {
      dispararDica(
        `Nenhuma linha encontrada de ${origemNome} até ${destino.nome} — tente outro destino.`
      )
    }
  }

  // Limpa a rota sugerida e volta a busca ao estado inicial
  function limparRoteiro() {
    setRoteiro(null)
    setBuscaDestino('')
  }

  // ---------------------------------------------------------------------------
  // Filtragem das linhas da lista (por status; a lista não é filtrada mais
  // por texto — a busca virou busca de DESTINO com sugestão de roteiro)
  // ---------------------------------------------------------------------------
  const linhasFiltradas = useMemo(() => {
    return LINHAS.filter((linha) => {
      const coincideStatus =
        filtroStatus === 'todas' ? true : linha.status === 'operacao'

      return coincideStatus
    })
  }, [filtroStatus])

  // ---------------------------------------------------------------------------
  // Linhas cujos trajetos e paradas serão desenhados no mapa
  // Se nenhuma estiver marcada e nenhuma linha estiver inspecionada, retorna []
  // (MODO LIMPO: apenas os ônibus andando!)
  // ---------------------------------------------------------------------------
  const linhasComTrajeto = useMemo(() => {
    if (linhaSelecionada) return [linhaSelecionada]
    if (linhasVisiveisIds.length === 0) return [] // Modo limpo: nenhum traçado desenhado
    return LINHAS.filter((l) => linhasVisiveisIds.includes(l.id))
  }, [linhaSelecionada, linhasVisiveisIds])

  // Todas as linhas marcadas?
  const todasMarcadas = linhasVisiveisIds.length === LINHAS.length

  function alternarTodas() {
    if (todasMarcadas) {
      setLinhasVisiveisIds([])
      dispararDica('Modo limpo ativo: apenas a localização dos ônibus está visível no mapa. Marque a caixa de uma linha para traçar seu trajeto.')
    } else {
      setLinhasVisiveisIds(LINHAS.map((l) => l.id))
      dispararDica('Exibindo todos os trajetos e pontos de parada no mapa.')
    }
  }

  function alternarLinhaVisibilidade(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setLinhasVisiveisIds((atual) => {
      const novo = atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
      if (novo.length === 0) {
        dispararDica('Modo limpo ativo: apenas a localização dos ônibus está visível no mapa. Marque a caixa de uma linha para traçar seu trajeto.')
      } else {
        dispararDica(`Trajeto atualizado no mapa (${novo.length} visíveis).`)
      }
      return novo
    })
  }

  // ---------------------------------------------------------------------------
  // Seleção e interação com a Linha
  // ---------------------------------------------------------------------------
  function selecionarLinha(linha: Linha) {
    setLinhaSelecionada(linha)
    setPainelAbertoMobile(true)
    setPainelMinimizadoDesktop(false)
    dispararDica(
      `Linha ${linha.codigo}: Toque em qualquer ponto de parada da lista para aproximar o mapa!`
    )
  }

  function desmarcarLinha() {
    setLinhaSelecionada(null)
    setFocoCoords(null)
  }

  // Clique em ponto de parada
  function focarPonto(coords: [number, number], nome: string) {
    setFocoCoords(coords)
    dispararDica(`Aproximando parada: ${nome}`)
  }

  // Centralizar na localização do usuário
  function centralizarNoUsuario() {
    if (minhaPosicao) {
      setFocoCoords(minhaPosicao)
      dispararDica('Mapa centralizado na sua localização atual.')
    } else {
      dispararDica('Ative a permissão de GPS no navegador para encontrar paradas próximas.')
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers de Notificação e Denúncia
  // ---------------------------------------------------------------------------
  function handleAbrirNotificacoes() {
    setMostrarNotificacoes(true)
    dispararDica('Dica: Você pode tocar em "Ver local no mapa" para conferir desvios e ocorrências.')
  }

  function handleAbrirDenuncia() {
    setMostrarDenuncia(true)
    dispararDica('Dica: Se estiver no ponto ou ônibus, use a opção "Usar meu GPS" para preencher o local.')
  }

  function handleDenunciaEnviada(dados: DadosDenuncia) {
    const novoAlerta: Alerta = {
      id: Date.now(),
      tipo: dados.tipo === 'buraco' ? 'obra' : 'transito',
      titulo: `Relato da comunidade: ${dados.local}`,
      descricao: dados.descricao || 'Problema reportado recentemente por passageiro.',
      coords: minhaPosicao || [-21.2087, -50.4347],
      horario: 'Agora mesmo',
    }

    setAlertasLista((prev) => [novoAlerta, ...prev])
    setToastMensagem('✓ Denúncia registrada com sucesso! Ponto marcado no mapa.')
    setMostrarDenuncia(false)
    dispararDica('Obrigado! Sua colaboração ajuda a mobilidade urbana de Araçatuba.')
  }

  return (
    <div className="tela-mapa tela-mapa-unificada">
      {/* -------------------------------------------------------------------------
          MAPA PRINCIPAL (Ônibus andando em tempo real + rotas selecionadas)
      ------------------------------------------------------------------------- */}
      <MapaDesloca
        linhasComTrajeto={linhasComTrajeto}
        todasLinhas={LINHAS}
        linhaAtiva={linhaSelecionada}
        alertasCoords={
          mostrarAlertas
            ? alertasLista.map((a) => ({
                coords: a.coords,
                titulo: a.titulo,
                tipo: a.tipo,
                descricao: a.descricao,
                id: a.id,
              }))
            : []
        }
        telaCheia
        minhaPosicao={minhaPosicao}
        focoCoords={focoCoords}
        onLinhaClick={selecionarLinha}
        onPontoClick={(ponto) => focarPonto(ponto.coords, ponto.nome)}
        onAlertaClick={(alerta) => {
          setFocoCoords(alerta.coords)
          dispararDica(`Ocorrência: ${alerta.titulo}`)
        }}
      />

      {/* -------------------------------------------------------------------------
          BARRA DE AÇÕES FLUTUANTES (Top bar sobre o mapa)
      ------------------------------------------------------------------------- */}
      <div className="acoes-flutuantes-mapa" role="toolbar" aria-label="Ações do mapa">
        {/* Relógio da simulação: corre 10x mais rápido que o real e mostra o
            horário das partidas no mapa */}
        <div className="placa-partidas" aria-label="Relógio da simulação">
          <span className="relogio-simulado" aria-label="Horário da simulação">
            🕐 <b>{horaSimulada}</b>
          </span>
        </div>

        {/* Sino de Notificações com badge de novidades */}
        <button
          type="button"
          className="botao-flutuante sino-notificacoes"
          onClick={handleAbrirNotificacoes}
          aria-label="Abrir central de notificações e ocorrências"
          title="Ver o que tá rolando"
        >
          <span className="icone" aria-hidden="true">
            🔔
          </span>
          {notificacoesNaoLidas > 0 && (
            <span className="notificacao-badge" aria-label={`${notificacoesNaoLidas} novidades`}>
              {notificacoesNaoLidas}
            </span>
          )}
        </button>

        {/* Botão de Perigo / Denúncia */}
        <button
          type="button"
          className="botao-flutuante botao-alerta-denuncia"
          onClick={handleAbrirDenuncia}
          aria-label="Reportar problema ou denúncia na via"
          title="Reportar problema na via ou transporte"
        >
          <span className="icone-perigo" aria-hidden="true">
            ⚠️
          </span>
          <span className="texto-botao-fab">Denunciar</span>
        </button>

        {/* Botão de GPS / Meu Local */}
        <button
          type="button"
          className="botao-flutuante botao-meu-local"
          onClick={centralizarNoUsuario}
          aria-label="Centralizar no meu local"
          title="Meu local no mapa"
        >
          <span className="icone" aria-hidden="true">
            🎯
          </span>
        </button>

        {/* Botão "Linhas" REMOVIDO da barra: no desktop quem reabre o painel
            minimizado é o "◀ Linhas & Horários" e no mobile a barra de arrasto
            (painel-touch-handle) do bottom sheet */}
      </div>

      {/* -------------------------------------------------------------------------
          BOTÃO RESTAURAR PAINEL (Aparece no Desktop quando o painel for minimizado)
      ------------------------------------------------------------------------- */}
      {painelMinimizadoDesktop && (
        <button
          type="button"
          className="botao-restaurar-painel"
          onClick={() => setPainelMinimizadoDesktop(false)}
          aria-label="Restaurar painel de linhas"
          title="Clique para reabrir o painel de linhas"
        >
          <span className="icone" aria-hidden="true">
            ◀
          </span>
          <span className="texto">Linhas & Horários</span>
          <span className="badge-contador">{LINHAS.length}</span>
        </button>
      )}

      {/* -------------------------------------------------------------------------
          CARD DO PONTO MAIS PRÓXIMO (Canto inferior esquerdo)
          Sem GPS não há card nenhum (o aviso "Localização indisponível" foi removido)
      ------------------------------------------------------------------------- */}
      {pontoMaisProximo ? (
        <aside
          className="aviso-proximo"
          role="status"
          onClick={() => focarPonto(pontoMaisProximo.linha.pontos[0].coords, pontoMaisProximo.nome)}
          style={{ cursor: 'pointer' }}
          title="Clique para aproximar no mapa"
        >
          <span className="aviso-icone" aria-hidden="true">
            📍
          </span>
          <div>
            <strong>Ponto mais próximo: {pontoMaisProximo.nome}</strong>
            <p>
              Linha {pontoMaisProximo.linha.codigo} · {formatarDistancia(pontoMaisProximo.distancia)} ·{' '}
              <b>{tempoCaminhadaMin(pontoMaisProximo.distancia)} min a pé</b>
            </p>
            {pontosProximos.slice(1).map((ponto) => (
              <p key={`${ponto.linha.id}-${ponto.nome}`} className="aviso-extra">
                Também: {ponto.nome} ({formatarDistancia(ponto.distancia)})
              </p>
            ))}
          </div>
        </aside>
      ) : null}

      {/* -------------------------------------------------------------------------
          PAINEL INTEGRADO DE LINHAS & DETALHES (Lado direito / Bottom Sheet)
      ------------------------------------------------------------------------- */}
      <aside
        className={`painel-linhas-integrado ${
          painelAbertoMobile ? 'mobile-aberto' : 'mobile-fechado'
        } ${painelMinimizadoDesktop ? 'desktop-minimizado' : ''}`}
        aria-label="Painel de linhas e itinerários"
      >
        {/* Handle de toque para celular */}
        <div
          className="painel-touch-handle"
          onClick={() => setPainelAbertoMobile((prev) => !prev)}
          aria-hidden="true"
        >
          <div className="barra-puxar" />
        </div>

        {/* =====================================================================
            CASO 1: DETALHES COMPLETOS DA LINHA SELECIONADA
        ===================================================================== */}
        {linhaSelecionada ? (
          <div className="painel-detalhe-linha">
            {/* Cabeçalho do detalhe */}
            <div className="detalhe-linha-topo">
              <button
                type="button"
                className="botao-voltar-linhas"
                onClick={desmarcarLinha}
                aria-label="Voltar para a lista de todas as linhas"
              >
                ← Todas as linhas
              </button>
              <button
                type="button"
                className="botao-fechar-detalhe"
                onClick={desmarcarLinha}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="detalhe-linha-titulo-bloco">
              <span
                className="badge-codigo badge-codigo-grande"
                style={{ '--cor-linha': linhaSelecionada.cor } as React.CSSProperties}
              >
                {linhaSelecionada.codigo}
              </span>
              <div>
                <h2>{linhaSelecionada.nome}</h2>
                <span className={`badge ${linhaSelecionada.status}`}>
                  {linhaSelecionada.status === 'operacao' ? 'Em operação normal' : 'Fora de linha'}
                </span>
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="detalhe-metricas-grid">
              <div className="metrica-box">
                <span className="rotulo">💰 Tarifa</span>
                <strong>{linhaSelecionada.tarifa}</strong>
              </div>
              <div className="metrica-box">
                <span className="rotulo">⏰ Frequência</span>
                <strong>{linhaSelecionada.frequencia}</strong>
              </div>
              <div className="metrica-box">
                <span className="rotulo">🕒 Início</span>
                <strong>05h30</strong>
              </div>
              <div className="metrica-box">
                <span className="rotulo">🌙 Último</span>
                <strong>23h30</strong>
              </div>
            </div>

            {/* Informações do próximo ônibus em circulação */}
            {linhaSelecionada.status === 'operacao' && (
              <div className="cartao-proximo-veiculo">
                <div className="proximo-veiculo-topo">
                  <span className="icone-bus" aria-hidden="true">
                    🚌
                  </span>
                  <div>
                    <strong>Próximo veículo: Placa {linhaSelecionada.proximoOnibus.placa}</strong>
                    <p>Previsão estimada: <b>{linhaSelecionada.proximoOnibus.previsao}</b></p>
                  </div>
                  <div className="partida-destaque">
                    <small>próxima partida</small>
                    <b>{formatarRelogio(proximaPartidaLinha(linhaSelecionada))}</b>
                  </div>
                </div>
                <div className="lotacao-status-barra">
                  <span className="texto-lotacao">Lotação estimada:</span>
                  <span className={`badge ${linhaSelecionada.proximoOnibus.lotacao}`}>
                    {linhaSelecionada.proximoOnibus.lotacao === 'vazio'
                      ? '🟢 Vago'
                      : linhaSelecionada.proximoOnibus.lotacao === 'medio'
                        ? '🟡 Movimento moderado'
                        : '🔴 Cheio'}
                  </span>
                </div>
              </div>
            )}

            {/* Timeline interativa de Pontos de Parada */}
            <div className="secao-pontos-parada">
              <div className="pontos-cabecalho">
                <h3>Pontos de parada ({linhaSelecionada.pontos.length})</h3>
                <small>Toque para aproximar no mapa</small>
              </div>

              <ol className="lista-pontos-detalhe">
                {linhaSelecionada.pontos.map((ponto, index) => (
                  <li
                    key={`${ponto.nome}-${index}`}
                    className="item-ponto-interativo"
                    onClick={() => focarPonto(ponto.coords, ponto.nome)}
                    role="button"
                    tabIndex={0}
                  >
                    <span
                      className="circulo-ordem"
                      style={{ borderColor: linhaSelecionada.cor }}
                    >
                      {index + 1}
                    </span>
                    <div className="ponto-info">
                      <strong className="ponto-nome">{ponto.nome}</strong>
                      <span className="ponto-acao-texto">📍 Ver parada no mapa</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Ações de rodapé da linha */}
            <div className="detalhe-linha-acoes">
              <button
                type="button"
                className="botao botao-secundario botao-full"
                onClick={() => {
                  setMostrarDenuncia(true)
                  dispararDica(`Reportando ocorrência vinculada à Linha ${linhaSelecionada.codigo}`)
                }}
              >
                ⚠️ Reportar problema nesta linha
              </button>
            </div>
          </div>
        ) : (
          /* =====================================================================
              CASO 2: LISTA DE LINHAS & FILTROS (VISÃO GERAL)
          ===================================================================== */
          <div className="painel-lista-linhas">
            <div className="painel-cabecalho-principal">
              <div>
                <h2 className="painel-titulo">Linhas de ônibus</h2>
                <p className="painel-subtitulo">
                  Selecione uma linha ou veja os ônibus circulando
                </p>
              </div>
              <button
                type="button"
                className="botao-minimizar-desktop"
                onClick={() => {
                  setPainelMinimizadoDesktop(true)
                  dispararDica('Painel recolhido! Use o botão "◀ Linhas" no canto para reabrir.')
                }}
                title="Minimizar painel (ver mapa completo)"
                aria-label="Minimizar painel de linhas"
              >
                ⇥
              </button>
            </div>

            {/* Busca por DESTINO: digitar começa a sugerir paradas; escolher
                uma delas calcula o roteiro de ônibus até lá */}
            <div className="campo-pesquisa-container">
              <input
                className="campo campo-busca-linha"
                type="search"
                placeholder="Para onde você vai? (ex: Zoológico, Aeroporto)..."
                value={buscaDestino}
                onChange={(e) => {
                  setBuscaDestino(e.target.value)
                  setRoteiro(null)
                }}
                aria-label="Para onde você vai"
              />

              {/* Sugestões de destino enquanto digita (só se ainda não escolheu) */}
              {!roteiro && destinosSugeridos.length > 0 && (
                <ul className="lista-destinos">
                  {destinosSugeridos.map((destino) => (
                    <li key={destino.nome}>
                      <button
                        type="button"
                        className="item-destino"
                        onClick={() => escolherDestino(destino)}
                      >
                        <span className="item-destino-icone" aria-hidden="true">
                          🚏
                        </span>
                        <span className="item-destino-texto">
                          <strong>{destino.nome}</strong>
                          <small>Linhas {linhasNoDestino(destino).join(' · ')}</small>
                        </span>
                        <span className="item-destino-seta" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Roteiro sugerido (origem → destino,1 ou 2 linhas) */}
            {roteiro && (
              <div className="sugestao-rota">
                <div className="sugestao-rota-topo">
                  <div>
                    <small>Rota sugerida</small>
                    <strong>🚏 {roteiro.destino.nome}</strong>
                  </div>
                  <button
                    type="button"
                    className="sugestao-fechar"
                    onClick={limparRoteiro}
                    aria-label="Limpar rota sugerida"
                    title="Limpar rota"
                  >
                    ✕
                  </button>
                </div>
                <p className="sugestao-origem">
                  Partindo de <b>{roteiro.origem.nome}</b>
                  {roteiro.pernas.length > 1 && ' · troca de ônibus no caminho'}
                </p>

                <ol className="sugestao-pernas">
                  {roteiro.pernas.map((perna, indice) => (
                    <li key={`${perna.linha.id}-${indice}`}>
                      <span
                        className="badge-codigo"
                        style={{ '--cor-linha': perna.linha.cor } as React.CSSProperties}
                      >
                        {perna.linha.codigo}
                      </span>
                      <div className="perna-info">
                        <strong>{perna.linha.nome}</strong>
                        <small>
                          Embarque: {perna.embarque.nome}
                          {perna.caminhadaM > 0 && ` · ${perna.caminhadaM} m a pé`}
                        </small>
                        {indice === 0 && roteiro.baldeacao && (
                          <small className="perna-baldeacao">
                            Baldeação: {roteiro.baldeacao.nome}
                          </small>
                        )}
                        <small>Desembarque: {perna.desembarque.nome}</small>
                      </div>
                      <button
                        type="button"
                        className="perna-ver"
                        onClick={() => selecionarLinha(perna.linha)}
                        title={`Ver detalhes da linha ${perna.linha.codigo}`}
                      >
                        Ver
                      </button>
                    </li>
                  ))}
                </ol>

                <p className="sugestao-nota">
                  + {roteiro.caminhadaDesembarqueM} m a pé até {roteiro.destino.nome}
                </p>
              </div>
            )}

            {/* Filtros rápidos de status */}
            <div className="filtros-status-tags">
              <button
                type="button"
                className={`tag-filtro ${filtroStatus === 'todas' ? 'ativa' : ''}`}
                onClick={() => setFiltroStatus('todas')}
              >
                Todas ({LINHAS.length})
              </button>
              <button
                type="button"
                className={`tag-filtro ${filtroStatus === 'operacao' ? 'ativa' : ''}`}
                onClick={() => setFiltroStatus('operacao')}
              >
                Em operação ({LINHAS.filter((l) => l.status === 'operacao').length})
              </button>
            </div>

            {/* Botão de ligar/desligar todas as linhas no mapa */}
            <button
              type="button"
              className={`filtro-todas ${todasMarcadas ? 'marcada' : ''}`}
              onClick={alternarTodas}
              aria-pressed={todasMarcadas}
            >
              <span className="caixa" aria-hidden="true">
                {todasMarcadas && '✓'}
              </span>
              <span className="texto-filtro">
                <strong>{todasMarcadas ? 'Ocultar todas as rotas' : 'Exibir todas as rotas no mapa'}</strong>
                <small>{todasMarcadas ? 'Clique para ver apenas os ônibus' : 'Toque para mostrar todos os trajetos'}</small>
              </span>
              <span className="icone-filtro">
                <IconeOnibus cor="#1D1D1B" />
              </span>
            </button>

            {/* Aviso do Modo Limpo NÃO fica mais fixo no painel: ele aparece
                só como notificação (dica) no momento em que a última rota é
                desmarcada — ver alternarTodas / alternarLinhaVisibilidade */}

            {/* Lista dos cards de linhas */}
            <ul className="lista-filtros">
              {linhasFiltradas.map((linha) => {
                const visivelNoMapa = linhasVisiveisIds.includes(linha.id)

                return (
                  <li key={linha.id} className="item-linha-card">
                    <div
                      className={`cartao-linha-interativo ${visivelNoMapa ? 'ativo-no-mapa' : ''}`}
                      onClick={() => selecionarLinha(linha)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          selecionarLinha(linha)
                        }
                      }}
                    >
                      {/* Checkbox para ligar/desligar a rota desta linha */}
                      <button
                        type="button"
                        className={`checkbox-visibilidade ${visivelNoMapa ? 'marcado' : ''}`}
                        onClick={(e) => alternarLinhaVisibilidade(linha.id, e)}
                        title={visivelNoMapa ? 'Ocultar trajeto desta linha' : 'Exibir trajeto desta linha no mapa'}
                        aria-label={`Alternar visibilidade do trajeto da linha ${linha.codigo}`}
                      >
                        {visivelNoMapa ? '✓' : ''}
                      </button>

                      {/* Ícone com cor oficial da linha */}
                      <span
                        className="badge-codigo"
                        style={{ '--cor-linha': linha.cor } as React.CSSProperties}
                      >
                        {linha.codigo}
                      </span>

                      {/* Texto descritivo da linha */}
                      <div className="linha-info-bloco">
                        <div className="linha-nome-linha">
                          <strong>{linha.nome}</strong>
                        </div>
                        <div className="linha-subinfo">
                          <span>{linha.tarifa}</span> ·{' '}
                          <span>{linha.frequencia}</span>
                        </div>
                      </div>

                      {/* Próximas partidas: OS DOIS veículos da linha, cada um
                          com sua placa e seu horário (o 2º sai +intervalo/2) */}
                      {linha.status === 'operacao' ? (
                        <div className="linha-partida">
                          <small>{veiculosDaLinha(linha).some((v) => v.emRota) ? 'situação' : 'próximas'}</small>
                          {veiculosDaLinha(linha).map((veiculo) => (
                            <span key={veiculo.veiculo} className="linha-veiculo">
                              <small className="placa-veiculo">{veiculo.placa}</small>
                              <strong
                                className={veiculo.emRota ? 'em-rota' : ''}
                                title={`Próxima partida do veículo ${veiculo.placa}`}
                              >
                                {veiculo.emRota ? 'em rota' : formatarRelogio(veiculo.proxima)}
                              </strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="fora-de-linha">Fora de operação</span>
                      )}

                      {/* Botão de seta para detalhes */}
                      <span className="seta-detalhes" aria-hidden="true">
                        ›
                      </span>
                    </div>
                  </li>
                )
              })}

              {linhasFiltradas.length === 0 && (
                <li className="vazio">
                  <span>🔍 Nenhuma linha neste filtro.</span>
                </li>
              )}
            </ul>

            <hr className="divisor" />

            {/* Checkbox de alertas de trânsito */}
            <label className="filtro-alertas">
              <input
                type="checkbox"
                checked={mostrarAlertas}
                onChange={(e) => {
                  setMostrarAlertas(e.target.checked)
                  dispararDica(
                    e.target.checked
                      ? 'Dica: Alertas de trânsito e obras ativados no mapa.'
                      : 'Dica: Alertas de trânsito foram ocultados.'
                  )
                }}
              />
              <span>Mostrar alertas de trânsito no mapa</span>
            </label>

            {/* Legenda do mapa */}
            <div className="legenda-painel">
              <span>
                <i className="ponto-legend" style={{ background: '#1D1D1B' }} /> Ônibus
              </span>
              <span>
                <i
                  className="ponto-legend"
                  style={{ background: '#fff', border: '2px solid #1D1D1B' }}
                />{' '}
                Ponto
              </span>
              <span>
                <i className="ponto-legend" style={{ background: '#B3453A' }} /> Alerta
              </span>
              <span>
                <i className="ponto-legend" style={{ background: '#2563EB' }} /> Você
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* -------------------------------------------------------------------------
          POPUP MODAL: CENTRAL DE NOTIFICAÇÕES ("Tudo que tá rolando")
      ------------------------------------------------------------------------- */}
      {mostrarNotificacoes && (
        <PopupNotificacoes
          onClose={() => setMostrarNotificacoes(false)}
          onLimparNaoLidas={() => setNotificacoesNaoLidas(0)}
          onVerNoMapa={(coords) => {
            setFocoCoords(coords)
            dispararDica('Local da ocorrência focado no mapa.')
          }}
        />
      )}

      {/* -------------------------------------------------------------------------
          POPUP MODAL: FORMULÁRIO DE DENÚNCIA / PERIGO
      ------------------------------------------------------------------------- */}
      {mostrarDenuncia && (
        <PopupDenuncia
          onClose={() => setMostrarDenuncia(false)}
          onEnviar={handleDenunciaEnviada}
          minhaPosicao={minhaPosicao}
          linhaPreSelecionada={linhaSelecionada?.codigo}
        />
      )}

      {/* -------------------------------------------------------------------------
          SISTEMA DE DICAS CONTEXTUAIS DINÂMICAS
      ------------------------------------------------------------------------- */}
      <DicaNotificacao
        mensagem={dicaContextual}
        onClose={() => setDicaContextual(null)}
      />

      {/* Toast de confirmação rápida */}
      {toastMensagem && (
        <Toast
          message={toastMensagem}
          duration={4000}
          onClose={() => setToastMensagem(null)}
        />
      )}
    </div>
  )
}
