// =============================================================================
// COMPONENTE: POPUP / CARD DE DETALHES DA LINHA
// =============================================================================
// Exibe resumo completo da linha selecionada: horários, paradas e previsão.
// =============================================================================

import type { Linha } from '../dados/linhas'

interface PopupDetalhesLinhaProps {
  linha: Linha
  onClose?: () => void
  onPontoClick?: (ponto: { nome: string; coords: [number, number] }) => void
  onReportarProblema?: (linha: Linha) => void
}

export default function PopupDetalhesLinha({
  linha,
  onClose,
  onPontoClick,
  onReportarProblema,
}: PopupDetalhesLinhaProps) {
  return (
    <div className="popup-detalhes popup-linha-card" role="region" aria-label="Detalhes da linha">
      <div className="popup-cabecalho">
        <span className="popup-cor" style={{ background: linha.cor }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
            {linha.codigo} — {linha.nome}
          </h3>
          <span className={`badge ${linha.status}`} style={{ marginTop: 4, display: 'inline-block' }}>
            {linha.status === 'operacao' ? 'Em operação regular' : 'Linha temporariamente inativa'}
          </span>
        </div>
        {onClose && (
          <button className="popup-fechar" onClick={onClose} aria-label="Fechar detalhes da linha">
            ✕
          </button>
        )}
      </div>

      <div className="popup-conteudo">
        <div className="resumo-metricas-grid">
          <div className="metrica-item">
            <span className="metrica-rotulo">💰 Tarifa</span>
            <strong className="metrica-valor">{linha.tarifa}</strong>
          </div>
          <div className="metrica-item">
            <span className="metrica-rotulo">⏰ Frequência</span>
            <strong className="metrica-valor">{linha.frequencia}</strong>
          </div>
          <div className="metrica-item">
            <span className="metrica-rotulo">🚌 Próximo ônibus</span>
            <strong className="metrica-valor">
              {linha.status === 'operacao' ? `Placa ${linha.proximoOnibus.placa}` : '—'}
            </strong>
          </div>
          <div className="metrica-item">
            <span className="metrica-rotulo">⏱️ Previsão</span>
            <strong className="metrica-valor">
              {linha.status === 'operacao' ? linha.proximoOnibus.previsao : 'Indisponível'}
            </strong>
          </div>
        </div>

        {linha.status === 'operacao' && (
          <div className="status-lotacao-bloco">
            <span>Lotação estimada do veículo:</span>
            <span className={`badge ${linha.proximoOnibus.lotacao}`}>
              {linha.proximoOnibus.lotacao === 'vazio'
                ? '🟢 Poucos passageiros (Vago)'
                : linha.proximoOnibus.lotacao === 'medio'
                  ? '🟡 Movimento moderado'
                  : '🔴 Capacidade máxima (Lotado)'}
            </span>
          </div>
        )}

        <div className="horarios-funcionamento">
          <span>🕒 Primeira viagem: <b>05h30</b></span>
          <span>🌙 Última viagem: <b>23h30</b></span>
        </div>

        <div className="pontos-sequencia-bloco">
          <div className="pontos-sequencia-titulo">
            <strong>Pontos de Parada ({linha.pontos.length})</strong>
            <small>Clique na parada para focar no mapa</small>
          </div>
          <ol className="lista-pontos-timeline">
            {linha.pontos.map((ponto, idx) => (
              <li
                key={`${ponto.nome}-${idx}`}
                className="item-ponto-timeline"
                onClick={() => onPontoClick?.(ponto)}
                role="button"
                tabIndex={0}
              >
                <span className="ponto-marcador-ordem" style={{ borderColor: linha.cor }}>
                  {idx + 1}
                </span>
                <span className="ponto-nome">{ponto.nome}</span>
              </li>
            ))}
          </ol>
        </div>

        {onReportarProblema && (
          <button
            type="button"
            className="botao-reportar-linha"
            onClick={() => onReportarProblema(linha)}
          >
            ⚠️ Reportar problema nesta linha
          </button>
        )}
      </div>
    </div>
  )
}
