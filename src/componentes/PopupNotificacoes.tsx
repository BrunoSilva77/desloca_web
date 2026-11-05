// =============================================================================
// COMPONENTE: POPUP DE NOTIFICAÇÕES ("Tudo que tá rolando")
// =============================================================================
// Central de avisos e notificações em tempo real. Mostra alertas de trânsito,
// estado das frotas, desvios e comunicados da mobilidade da cidade.
// =============================================================================

import { useState, useEffect } from 'react'

export interface ItemNotificacao {
  id: string | number
  tipo: 'transito' | 'frota' | 'clima' | 'aviso'
  titulo: string
  descricao: string
  horario: string
  icone: string
  coords?: [number, number]
  destaque?: boolean
}

interface PopupNotificacoesProps {
  onClose: () => void
  onVerNoMapa?: (coords: [number, number]) => void
  onLimparNaoLidas?: () => void
}

const NOTIFICACOES_PADRAO: ItemNotificacao[] = [
  {
    id: 'n1',
    tipo: 'transito',
    titulo: 'Obras na Av. Brasília (Sentido Centro)',
    descricao:
      'Trânsito em meia pista próximo ao shopping. Linhas 101 e 202 estão com atraso médio de 6 a 8 minutos.',
    horario: 'Há 5 minutos',
    icone: '🚧',
    coords: [-21.216, -50.428],
    destaque: true,
  },
  {
    id: 'n2',
    tipo: 'transito',
    titulo: 'Ponto Praça Rui Barbosa Deslocado',
    descricao:
      'Devido a manutenção nas calçadas acessíveis, o embarque está temporariamente 50 metros à frente.',
    horario: 'Há 18 minutos',
    icone: '🚏',
    coords: [-21.204, -50.437],
  },
  {
    id: 'n3',
    tipo: 'frota',
    titulo: 'Linha 101: Novo Ônibus Elétrico Ativo',
    descricao:
      'Veículo com ar-condicionado, Wi-Fi e tomadas USB já está rodando no trajeto Circular Centro.',
    horario: 'Há 35 minutos',
    icone: '🚌',
  },
  {
    id: 'n4',
    tipo: 'clima',
    titulo: 'Alerta Meteorológico: Chuvas à Tarde',
    descricao:
      'Previsão de tempestade isolada a partir das 15h. Dica: priorize aguardar em pontos cobertos.',
    horario: 'Hoje às 11:40',
    icone: '🌧️',
  },
  {
    id: 'n5',
    tipo: 'aviso',
    titulo: 'Terminal Central: Integração Ampliada',
    descricao:
      'A janela de integração gratuita de 60 minutos está valendo normalmente em todas as catracas.',
    horario: 'Hoje às 07:30',
    icone: '💳',
  },
]

export default function PopupNotificacoes({
  onClose,
  onVerNoMapa,
  onLimparNaoLidas,
}: PopupNotificacoesProps) {
  const [filtro, setFiltro] = useState<'todos' | 'transito' | 'frota' | 'aviso'>('todos')
  const [itens] = useState<ItemNotificacao[]>(NOTIFICACOES_PADRAO)

  useEffect(() => {
    onLimparNaoLidas?.()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onLimparNaoLidas])

  const itensFiltrados = itens.filter((item) => {
    if (filtro === 'todos') return true
    if (filtro === 'transito') return item.tipo === 'transito'
    if (filtro === 'frota') return item.tipo === 'frota'
    if (filtro === 'aviso') return item.tipo === 'aviso' || item.tipo === 'clima'
    return true
  })

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="popup-modal popup-notificacoes" onClick={(e) => e.stopPropagation()}>
        {/* Topo do popup */}
        <div className="popup-modal-cabecalho">
          <div className="popup-modal-titulo-bloco">
            <span className="icone-sino-destaque" aria-hidden="true">
              🔔
            </span>
            <div>
              <h3>O que tá rolando agora</h3>
              <p>Atualizações ao vivo do transporte e trânsito da cidade</p>
            </div>
          </div>
          <button
            type="button"
            className="popup-fechar"
            onClick={onClose}
            aria-label="Fechar notificações"
          >
            ✕
          </button>
        </div>

        {/* Abas de filtro */}
        <div className="popup-abas" role="tablist">
          <button
            type="button"
            className={`aba-item ${filtro === 'todos' ? 'ativa' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todas ({itens.length})
          </button>
          <button
            type="button"
            className={`aba-item ${filtro === 'transito' ? 'ativa' : ''}`}
            onClick={() => setFiltro('transito')}
          >
            Trânsito & Obras
          </button>
          <button
            type="button"
            className={`aba-item ${filtro === 'frota' ? 'ativa' : ''}`}
            onClick={() => setFiltro('frota')}
          >
            Frota & Linhas
          </button>
          <button
            type="button"
            className={`aba-item ${filtro === 'aviso' ? 'ativa' : ''}`}
            onClick={() => setFiltro('aviso')}
          >
            Avisos Gerais
          </button>
        </div>

        {/* Lista de cards de notificação */}
        <div className="popup-notificacoes-lista">
          {itensFiltrados.map((item) => (
            <article
              key={item.id}
              className={`cartao-notificacao ${item.destaque ? 'destaque' : ''}`}
            >
              <div className="notificacao-icone" aria-hidden="true">
                {item.icone}
              </div>
              <div className="notificacao-corpo">
                <div className="notificacao-cabecalho">
                  <h4 className="notificacao-titulo">{item.titulo}</h4>
                  <span className="notificacao-tempo">{item.horario}</span>
                </div>
                <p className="notificacao-descricao">{item.descricao}</p>

                {item.coords && onVerNoMapa && (
                  <button
                    type="button"
                    className="botao-ver-mapa"
                    onClick={() => {
                      onVerNoMapa(item.coords!)
                      onClose()
                    }}
                  >
                    📍 Ver local no mapa
                  </button>
                )}
              </div>
            </article>
          ))}

          {itensFiltrados.length === 0 && (
            <div className="notificacoes-vazio">
              <span>✓</span>
              <p>Nenhuma ocorrência encontrada nesta categoria no momento.</p>
            </div>
          )}
        </div>

        {/* Rodapé do popup */}
        <div className="popup-modal-rodape">
          <span className="texto-sincronizado">● Atualizado automaticamente</span>
          <button type="button" className="botao botao-pequeno" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

