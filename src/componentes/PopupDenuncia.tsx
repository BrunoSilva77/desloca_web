// =============================================================================
// COMPONENTE: POPUP DE DENÚNCIA
// =============================================================================
// Formulário de denúncia que aparece no mapa quando o usuário clica no ícone de perigo.
// Permite selecionar o tipo de problema, informar localização e enviar a descrição.
// =============================================================================

import { useState, type FormEvent } from 'react'

interface PopupDenunciaProps {
  onClose?: () => void
  onEnviar?: (tipo: string, local: string, descricao: string) => void
}

const TIPOS = [
  { id: 'buraco', icone: '🕳️', nome: 'Buraco' },
  { id: 'iluminacao', icone: '💡', nome: 'Iluminação' },
  { id: 'ponto', icone: '🚏', nome: 'Ponto de ônibus' },
  { id: 'onibus', icone: '🚌', nome: 'Problema no ônibus' },
]

export default function PopupDenuncia({ onClose, onEnviar }: PopupDenunciaProps) {
  const [tipo, setTipo] = useState('buraco')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviado, setEnviado] = useState(false)

  function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (!local.trim()) {
      alert('Informe onde está o problema.')
      return
    }

    onEnviar?.(tipo, local, descricao)
    setEnviado(true)
    setLocal('')
    setDescricao('')
  }

  return (
    <div className="popup-detalhes">
      <button className="popup-fechar" onClick={onClose} aria-label="Fechar">
        ×
      </button>
      <h3 style={{ marginBottom: '16px' }}>⚠️ Reportar problema</h3>

      {enviado ? (
        <div className="aviso-sucesso" role="status">
          ✓ Denúncia registrada! Nossa equipe vai analisar em breve.
        </div>
      ) : (
        <form onSubmit={aoEnviar}>
          <div className="popup-tipos">
            {TIPOS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tipo === item.id ? 'selecionado' : ''}
                onClick={() => setTipo(item.id)}
              >
                <span className="popup-icone">{item.icone}</span>
                <span>{item.nome}</span>
              </button>
            ))}
          </div>

          <label className="rotulo" htmlFor="local">
            Onde é?
          </label>
          <input
            id="local"
            className="campo"
            type="text"
            placeholder="Ex.: Ponto da Rodoviária, linha 101"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />

          <label className="rotulo" htmlFor="descricao">
            Descreva o problema (opcional)
          </label>
          <textarea
            id="descricao"
            className="campo"
            placeholder="Descreva o que você viu..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button className="botao" type="submit" style={{ marginTop: '16px', width: '100%' }}>
            Enviar denúncia
          </button>
        </form>
      )}

      {enviado && (
        <div className="aviso-sucesso" role="status">
          ✓ Denúncia registrada! Nossa equipe vai analisar em breve.
        </div>
      )}
    </div>
  )
}