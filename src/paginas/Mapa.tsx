// =============================================================================
// PÁGINA DO MAPA
// =============================================================================
// Tela principal do projeto: mapa em tela cheia com o painel de filtros
// flutuante sobreposto no lado direito.
//
// Recursos desta tela:
//   1. Filtro de linhas (com opção "Todas as linhas")
//   2. Localização do usuário e cálculo do ponto de ônibus mais próximo
//   3. Alertas de trânsito ligáveis/desligáveis
// =============================================================================

import { useState, useEffect, useMemo } from 'react'
import MapaDesloca from '../componentes/MapaDesloca'
import { LINHAS, ALERTAS, type Linha } from '../dados/linhas'
import { distanciaKm, tempoCaminhadaMin, formatarDistancia } from '../utilidades/geo'

// Ícone SVG de ônibus usado nos filtros (desenhado à mão para não depender
// de emoji, que muda de desenho em cada sistema operacional)
function IconeOnibus({ cor }: { cor: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke={cor}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Carroceria do ônibus */}
      <rect x="4" y="3" width="16" height="14" rx="3" />
      {/* Faixa das janelas */}
      <path d="M4 10h16" />
      {/* Farol e para-choque */}
      <path d="M7 17v2M17 17v2" />
      {/* Rodas */}
      <circle cx="8" cy="14" r="1" fill={cor} stroke="none" />
      <circle cx="16" cy="14" r="1" fill={cor} stroke="none" />
    </svg>
  )
}

export default function Mapa() {
  // Estado da busca: o que o usuário digitou no campo de procura
  const [busca, setBusca] = useState('')

  // Linhas que o usuário marcou no painel de filtros (vazio = mostra todas)
  const [linhasSelecionadas, setLinhasSelecionadas] = useState<number[]>([])

  // Filtro de alertas ligado ou desligado
  const [mostrarAlertas, setMostrarAlertas] = useState(true)

  // Localização do usuário (null enquanto não autoriza ou ainda não chegou)
  const [minhaPosicao, setMinhaPosicao] = useState<[number, number] | null>(null)
  const [erroLocalizacao, setErroLocalizacao] = useState(false)

  // -----------------------------------------------------------------------------
  // Pede a localização do usuário ao abrir a página.
  // O navegador mostra um aviso pedindo permissão (é obrigatório pedir).
  // -----------------------------------------------------------------------------
  useEffect(() => {
    // Verifica se o navegador suporta geolocalização
    if (!('geolocation' in navigator)) {
      setErroLocalizacao(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      // Sucesso: guarda as coordenadas (latitude, longitude)
      (posicao) => setMinhaPosicao([posicao.coords.latitude, posicao.coords.longitude]),
      // Erro: usuário negou a permissão ou não foi possível encontrar
      () => setErroLocalizacao(true),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, []) // [] = executa apenas uma vez, ao montar a tela

  // -----------------------------------------------------------------------------
  // Calcula os pontos de ônibus mais próximos da localização do usuário.
  // useMemo guarda o resultado e só recalcula quando a posição muda.
  // -----------------------------------------------------------------------------
  const pontosProximos = useMemo(() => {
    if (!minhaPosicao) return []

    // Guarda a distância de TODOS os pontos de todas as linhas
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

    // Ordena do mais perto para o mais longe e pega os 3 primeiros.
    // O filtro por nome evita repetir o mesmo ponto (várias linhas podem
    // compartilhar a mesma parada, ex.: Terminal Central).
    const ordenados = todos.sort((a, b) => a.distancia - b.distancia)
    const vistos = new Set<string>()
    const unicos: typeof ordenados = []

    for (const item of ordenados) {
      if (vistos.has(item.nome)) continue // Pula ponto já adicionado
      vistos.add(item.nome)
      unicos.push(item)
      if (unicos.length === 3) break // Guarda só os 3 mais próximos
    }

    return unicos
  }, [minhaPosicao])

  // Ponto mais perto (primeiro da lista) — usado no aviso em destaque
  const pontoMaisProximo = pontosProximos[0]

  // Filtra as linhas pelo que foi digitado (código ou nome)
  const linhasFiltradas = LINHAS.filter(
    (linha) =>
      linha.nome.toLowerCase().includes(busca.toLowerCase()) ||
      linha.codigo.includes(busca)
  )

  // Linhas visíveis no mapa: as que passaram na busca E estão marcadas nos filtros
  const linhasVisiveis = linhasFiltradas.filter(
    (linha) => linhasSelecionadas.length === 0 || linhasSelecionadas.includes(linha.id)
  )

  // Liga/desliga uma linha no painel de filtros
  function alternarLinha(id: number) {
    setLinhasSelecionadas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    )
  }

  // Marca ou desmarca todas as linhas de uma vez
  function alternarTodas() {
    // Se já estão todas marcadas (lista vazia), marca apenas a primeira.
    // Se tem alguma marcada, limpa tudo (volta a mostrar todas).
    setLinhasSelecionadas((atual) => (atual.length === 0 ? [LINHAS[0].id] : []))
  }

  // Verifica se TODAS as linhas estão marcadas (lista vazia = tudo visível)
  const todasMarcadas = linhasSelecionadas.length === 0

  // Converte a lista de alertas no formato que o componente do mapa espera
  const alertasCoords = mostrarAlertas
    ? ALERTAS.map((a) => ({ coords: a.coords, titulo: a.titulo }))
    : []

  return (
    <div className="tela-mapa">
      {/* Mapa ocupando toda a área disponível da tela */}
      <MapaDesloca
        linhas={linhasVisiveis}
        linhaAtiva={null}
        alertasCoords={alertasCoords}
        telaCheia
        minhaPosicao={minhaPosicao}
      />

      {/* Aviso flutuante com o ponto mais próximo (canto inferior esquerdo) */}
      {pontoMaisProximo && (
        <div className="aviso-proximo" role="status">
          <span className="aviso-icone" aria-hidden="true">
            📍
          </span>
          <div>
            <strong>Ponto mais próximo: {pontoMaisProximo.nome}</strong>
            <p>
              Linha {pontoMaisProximo.linha.codigo} · {formatarDistancia(pontoMaisProximo.distancia)} ·{' '}
              <b>{tempoCaminhadaMin(pontoMaisProximo.distancia)} min a pé</b>
            </p>
            {/* Mostra os outros 2 pontos próximos em texto menor */}
            {pontosProximos.slice(1).map((ponto) => (
              <p key={`${ponto.linha.id}-${ponto.nome}`} className="aviso-extra">
                Também: {ponto.nome} ({formatarDistancia(ponto.distancia)})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem caso a localização não esteja disponível */}
      {erroLocalizacao && !minhaPosicao && (
        <div className="aviso-proximo aviso-erro" role="status">
          <span className="aviso-icone" aria-hidden="true">
            ℹ️
          </span>
          <div>
            <strong>Localização indisponível</strong>
            <p>Permita o acesso à localização para ver os pontos mais próximos.</p>
          </div>
        </div>
      )}

      {/* Painel de filtros flutuando por cima do mapa, no lado direito */}
      <aside className="painel-filtros" aria-label="Filtros do mapa">
        <h2 className="painel-titulo">Filtrar linhas</h2>

        {/* Busca por nome ou código */}
        <input
          className="campo"
          type="search"
          placeholder="Buscar linha..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)} // Atualiza a busca a cada tecla
          aria-label="Buscar linha"
        />

        {/* Botão que marca/desmarca todas as linhas de uma vez */}
        <button
          className={`filtro-todas ${todasMarcadas ? 'marcada' : ''}`}
          onClick={alternarTodas}
          aria-pressed={todasMarcadas}
        >
          <span className="caixa" aria-hidden="true">
            {todasMarcadas && '✓'}
          </span>
          <span className="texto-filtro">
            <strong>Todas as linhas</strong>
            <small>{todasMarcadas ? 'Exibindo o mapa completo' : 'Toque para mostrar todas'}</small>
          </span>
          {/* Ícone de ônibus com a cor preta (representa o conjunto) */}
          <span className="icone-filtro">
            <IconeOnibus cor="#1D1D1B" />
          </span>
        </button>

        {/* Lista de linhas com botão de seleção */}
        <ul className="lista-filtros">
          {linhasFiltradas.map((linha) => {
            // Verifica se esta linha está marcada nos filtros
            const marcada = linhasSelecionadas.length === 0 || linhasSelecionadas.includes(linha.id)

            return (
              <li key={linha.id}>
                <button
                  className={`filtro-linha ${marcada ? 'marcada' : ''}`}
                  onClick={() => alternarLinha(linha.id)}
                  // aria-pressed informa ao leitor de tela se o botão está ativo
                  aria-pressed={marcada}
                >
                  {/* Caixinha de seleção */}
                  <span className="caixa" aria-hidden="true">
                    {marcada && '✓'}
                  </span>

                  {/* Ícone de ônibus na cor da linha */}
                  <span className="icone-filtro">
                    <IconeOnibus cor={linha.cor} />
                  </span>

                  {/* Texto da linha */}
                  <span className="texto-filtro">
                    <strong>
                      {linha.codigo} — {linha.nome}
                    </strong>
                    <small>
                      {linha.status === 'operacao'
                        ? `Próximo em ${linha.proximoOnibus.previsao}`
                        : 'Fora de linha'}
                    </small>
                  </span>

                  {/* Bolinha com a cor da linha */}
                  <i className="cor-linha" style={{ background: linha.cor }} />
                </button>
              </li>
            )
          })}

          {/* Mensagem exibida quando nenhuma linha é encontrada */}
          {linhasFiltradas.length === 0 && (
            <li className="vazio">Nenhuma linha encontrada.</li>
          )}
        </ul>

        {/* Separador */}
        <hr className="divisor" />

        {/* Filtro dos alertas */}
        <label className="filtro-alertas">
          <input
            type="checkbox"
            checked={mostrarAlertas}
            onChange={(e) => setMostrarAlertas(e.target.checked)} // Liga/desliga alertas
          />
          <span>Mostrar alertas de trânsito</span>
        </label>

        {/* Legenda dos símbolos do mapa */}
        <div className="legenda-painel">
          <span>
            <i className="ponto-legend" style={{ background: '#1D1D1B' }} /> Ônibus
          </span>
          <span>
            <i className="ponto-legend" style={{ background: '#fff', border: '2px solid #1D1D1B' }} />{' '}
            Ponto
          </span>
          <span>
            <i className="ponto-legend" style={{ background: '#B3453A' }} /> Alerta
          </span>
          <span>
            <i className="ponto-legend" style={{ background: '#2563EB' }} /> Você
          </span>
        </div>
      </aside>
    </div>
  )
}
