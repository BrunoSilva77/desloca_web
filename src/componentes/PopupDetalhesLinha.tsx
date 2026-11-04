// =============================================================================
// COMPONENTE: POPUP DE DETALHES DA LINHA
// =============================================================================
// Popup que aparece sobre o mapa quando o usuário clica em uma linha.
// Mostra código, nome, tarifa, frequência, próximo ônibus, lotação e status.
// =============================================================================

import type { Linha } from '../dados/linhas'

interface PopupDetalhesLinhaProps {
  linha: Linha
  onClose?: () => void
}

export default function PopupDetalhesLinha({ linha, onClose }: PopupDetalhesLinhaProps) {
  return (
    <div className="popup-detalhes">
      <button className="popup-fechar" onClick={onClose} aria-label="Fechar">
        ×
      </button>
      <div className="popup-cabecalho">
        <span className="popup-cor" style={{ background: linha.cor }} />
        <h3>
          {linha.codigo} — {linha.nome}
        </h3>
      </div>
      <div className="popup-conteudo">
        <div className="popup-item">
          <span>💰 Tarifa:</span>
          <strong>{linha.tarifa}</strong>
        </div>
        <div className="popup-item">
          <span>⏰ Frequência:</span>
          <strong>{linha.frequencia}</strong>
        </div>
        <div className="popup-item">
          <span>🚌 Próximo ônibus:</span>
          <strong>Placa {linha.proximoOnibus.placa}</strong>
        </div>
        <div className="popup-item">
          <span>⏱️ Previsão:</span>
          <strong>{linha.proximoOnibus.previsao}</strong>
        </div>
        <div className="popup-item">
          <span>📊 Lotação:</span>
          <span className={`badge ${linha.proximoOnibus.lotacao}`}>
            {linha.proximoOnibus.lotacao === 'vazio'
              ? 'Vago'
              : linha.proximoOnibus.lotacao === 'medio'
                ? 'Movimento médio'
                : 'Lotado'}
          </span>
        </div>
        <div className="popup-item">
          <span>📍 Status:</span>
          <span className={`badge ${linha.status}`}>
            {linha.status === 'operacao' ? 'Em operação' : 'Fora de linha'}
          </span>
        </div>
      </div>
    </div>
  )
}