// =============================================================================
// COMPONENTE: DICA CONTEXTUAL (Notificação inteligente)
// =============================================================================
// Exibe dicas dinâmicas quando o usuário realiza ações no sistema.
// Ex.: "Dica: Toque em qualquer parada da lista para aproximar o mapa nela."
// =============================================================================

import { useEffect, useState } from 'react'

interface DicaNotificacaoProps {
  mensagem: string | null
  duracao?: number // milissegundos
  onClose: () => void
}

export default function DicaNotificacao({
  mensagem,
  duracao = 6500,
  onClose,
}: DicaNotificacaoProps) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (!mensagem) {
      setVisivel(false)
      return
    }

    setVisivel(true)
    const timer = setTimeout(() => {
      setVisivel(false)
      setTimeout(onClose, 300) // aguarda transição de saída
    }, duracao)

    return () => clearTimeout(timer)
  }, [mensagem, duracao, onClose])

  if (!mensagem || !visivel) return null

  return (
    <aside className="dica-contextual-container" role="status" aria-live="polite">
      <div className="dica-contextual-card">
        <div className="dica-icone-box" aria-hidden="true">
          💡
        </div>
        <div className="dica-conteudo">
          <span className="dica-rotulo">Dica Desloca</span>
          <p className="dica-texto">{mensagem}</p>
        </div>
        <button
          type="button"
          className="dica-botao-fechar"
          onClick={() => {
            setVisivel(false)
            setTimeout(onClose, 250)
          }}
          aria-label="Dispensar dica"
        >
          ✕
        </button>
      </div>
    </aside>
  )
}

