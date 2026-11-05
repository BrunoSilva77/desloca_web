// =============================================================================
// COMPONENTE: POPUP DE DENÚNCIA / REPORTAR PROBLEMA
// =============================================================================
// Modal acessível onde o usuário reporta problemas na rota, paradas ou veículos.
// =============================================================================

import { useState, useEffect, type FormEvent } from 'react'

export interface DadosDenuncia {
  tipo: string
  local: string
  descricao: string
  urgencia: 'normal' | 'alta'
  linhaId?: string
}

interface PopupDenunciaProps {
  onClose: () => void
  onEnviar: (denuncia: DadosDenuncia) => void
  minhaPosicao?: [number, number] | null
  linhaPreSelecionada?: string
}

const TIPOS = [
  { id: 'buraco', icone: '🕳️', nome: 'Buraco na via' },
  { id: 'iluminacao', icone: '💡', nome: 'Falta de iluminação' },
  { id: 'ponto', icone: '🚏', nome: 'Ponto danificado' },
  { id: 'onibus', icone: '🚌', nome: 'Problema no ônibus' },
  { id: 'acessibilidade', icone: '♿', nome: 'Sem acessibilidade' },
]

export default function PopupDenuncia({
  onClose,
  onEnviar,
  minhaPosicao,
  linhaPreSelecionada,
}: PopupDenunciaProps) {
  const [tipo, setTipo] = useState('buraco')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [urgencia, setUrgencia] = useState<'normal' | 'alta'>('normal')
  const [linhaId, setLinhaId] = useState(linhaPreSelecionada || '')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function usarMinhaLocalizacao() {
    if (minhaPosicao) {
      setLocal(`Minha posição atual (${minhaPosicao[0].toFixed(4)}, ${minhaPosicao[1].toFixed(4)})`)
      setErro('')
    } else {
      setErro('Localização do dispositivo não disponível no momento.')
    }
  }

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (!local.trim()) {
      setErro('Por favor, informe onde está o problema (rua, ponto ou linha).')
      return
    }

    setErro('')
    onEnviar({
      tipo,
      local: local.trim(),
      descricao: descricao.trim(),
      urgencia,
      linhaId: linhaId || undefined,
    })

    setEnviado(true)
    setTimeout(() => {
      onClose()
    }, 1800)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="popup-modal popup-denuncia-modal" onClick={(e) => e.stopPropagation()}>
        {/* Topo do modal */}
        <div className="popup-modal-cabecalho">
          <div className="popup-modal-titulo-bloco">
            <span className="icone-alerta-destaque" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h3>Reportar problema</h3>
              <p>Ajude a equipe da cidade e outros passageiros informando ocorrências</p>
            </div>
          </div>
          <button
            type="button"
            className="popup-fechar"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            ✕
          </button>
        </div>

        {enviado ? (
          <div className="aviso-sucesso-modal" role="status">
            <span className="icone-check">✓</span>
            <h4>Denúncia registrada com sucesso!</h4>
            <p>Ocorrência adicionada ao mapa. Obrigado por colaborar com a mobilidade urbana!</p>
          </div>
        ) : (
          <form onSubmit={aoEnviar} className="formulario-denuncia">
            {/* Escolha do tipo */}
            <div className="campo-grupo">
              <label className="rotulo">Tipo de ocorrência</label>
              <div className="popup-tipos-grid">
                {TIPOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`botao-tipo ${tipo === item.id ? 'selecionado' : ''}`}
                    onClick={() => setTipo(item.id)}
                  >
                    <span className="popup-icone" aria-hidden="true">
                      {item.icone}
                    </span>
                    <span>{item.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Onde é o problema? */}
            <div className="campo-grupo">
              <div className="rotulo-com-acao">
                <label className="rotulo" htmlFor="local-problema">
                  Onde fica? (ponto, rua ou cruzamento) *
                </label>
                {minhaPosicao && (
                  <button
                    type="button"
                    className="botao-link-gps"
                    onClick={usarMinhaLocalizacao}
                  >
                    📍 Usar meu GPS
                  </button>
                )}
              </div>
              <input
                id="local-problema"
                className="campo"
                type="text"
                placeholder="Ex.: Ponto da Rodoviária ou Av. Brasília, 1200"
                value={local}
                onChange={(e) => {
                  setLocal(e.target.value)
                  if (erro) setErro('')
                }}
                required
              />
            </div>

            {/* Linha associada (opcional) */}
            <div className="campo-grupo">
              <label className="rotulo" htmlFor="linha-afetada">
                Linha envolvida (opcional)
              </label>
              <select
                id="linha-afetada"
                className="campo campo-select"
                value={linhaId}
                onChange={(e) => setLinhaId(e.target.value)}
              >
                <option value="">Não sei ou ocorrência geral na via</option>
                <option value="101">101 — Circular Centro</option>
                <option value="202">202 — Vila Mineira - Centro</option>
                <option value="303">303 — Aeroporto - Terminal</option>
                <option value="404">404 — Circular Zona Norte</option>
              </select>
            </div>

            {/* Descrição detalhada */}
            <div className="campo-grupo">
              <label className="rotulo" htmlFor="descricao-problema">
                Descreva o problema (opcional)
              </label>
              <textarea
                id="descricao-problema"
                className="campo campo-textarea"
                rows={3}
                placeholder="Ex.: Poste apagado deixando a parada escura; ônibus atrasou mais de 20 min..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Gravidade */}
            <div className="campo-grupo">
              <label className="rotulo">Nível de gravidade</label>
              <div className="urgencia-opcoes">
                <label className={`urgencia-chip ${urgencia === 'normal' ? 'ativo' : ''}`}>
                  <input
                    type="radio"
                    name="urgencia"
                    checked={urgencia === 'normal'}
                    onChange={() => setUrgencia('normal')}
                  />
                  <span>Normal (Manutenção de rotina)</span>
                </label>
                <label className={`urgencia-chip urgente ${urgencia === 'alta' ? 'ativo' : ''}`}>
                  <input
                    type="radio"
                    name="urgencia"
                    checked={urgencia === 'alta'}
                    onChange={() => setUrgencia('alta')}
                  />
                  <span>Urgente (Risco de acidente ou paralisação)</span>
                </label>
              </div>
            </div>

            {erro && <div className="mensagem-erro">{erro}</div>}

            <div className="popup-modal-rodape">
              <button type="button" className="botao-secundario" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="botao">
                Enviar denúncia
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
