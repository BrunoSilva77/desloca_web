// =============================================================================
// PÁGINA DE DENÚNCIAS E SUGESTÕES
// =============================================================================
// Formulário onde o usuário reporta problemas encontrados nos pontos e linhas.
// No protótipo o envio é simulado; no projeto final será gravado no banco.
// =============================================================================

import { useState, type FormEvent } from 'react'

// Tipos de problema que o usuário pode escolher
const TIPOS = [
  { id: 'buraco', icone: '🕳️', nome: 'Buraco' },
  { id: 'iluminacao', icone: '💡', nome: 'Iluminação' },
  { id: 'ponto', icone: '🚏', nome: 'Ponto de ônibus' },
  { id: 'onibus', icone: '🚌', nome: 'Problema no ônibus' },
]

export default function Denuncias() {
  // Estado de cada campo do formulário
  const [tipo, setTipo] = useState('buraco')
  const [local, setLocal] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviado, setEnviado] = useState(false)

  // Executa quando o usuário envia o formulário
  function aoEnviar(evento: FormEvent) {
    evento.preventDefault() // Impede a página de recarregar

    // Validação: precisa informar pelo menos onde é o problema
    if (!local.trim()) {
      alert('Informe onde está o problema.')
      return
    }

    // Simula o envio para o servidor (futura chamada à API)
    console.log('Denúncia enviada:', { tipo, local, descricao })

    setEnviado(true) // Mostra a mensagem de sucesso
    setLocal('') // Limpa o formulário
    setDescricao('')
  }

  return (
    <div className="pagina">
      <h1 className="titulo-pagina">Denúncias e sugestões</h1>
      <p className="subtitulo">
        Encontrou um problema no ponto ou na linha? Conte para nós e ajude a melhorar
        o transporte da cidade.
      </p>

      <div className="cartao" style={{ maxWidth: 640 }}>
        <form onSubmit={aoEnviar}>
          {/* Escolha do tipo de problema */}
          <span className="rotulo">O que você deseja reportar?</span>
          <div className="grade" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {TIPOS.map((item) => (
              <label
                key={item.id}
                className="cartao"
                style={{
                  cursor: 'pointer',
                  padding: 14,
                  // Destaque no tipo selecionado
                  borderColor: tipo === item.id ? 'var(--bege)' : undefined,
                  borderWidth: tipo === item.id ? 2 : undefined,
                }}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={item.id}
                  checked={tipo === item.id}
                  onChange={(e) => setTipo(e.target.value)} // Atualiza o tipo escolhido
                  style={{ display: 'none' }} // Esconde o botão nativo, usamos o card
                />
                <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
                  {item.icone}
                </span>
                <p style={{ fontWeight: 700, color: 'var(--preto)', marginTop: 4 }}>
                  {item.nome}
                </p>
              </label>
            ))}
          </div>

          {/* Local do problema */}
          <label className="rotulo" htmlFor="local">
            Onde é? (ponto, rua ou linha)
          </label>
          <input
            id="local"
            className="campo"
            type="text"
            placeholder="Ex.: Ponto da Rodoviária, linha 101"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />

          {/* Descrição opcional */}
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

          <button className="botao" type="submit" style={{ marginTop: 18 }}>
            Enviar denúncia
          </button>
        </form>

        {/* Mensagem exibida após o envio bem-sucedido */}
        {enviado && (
          <div className="aviso-sucesso" role="status">
            ✓ Denúncia registrada! Nossa equipe vai analisar em breve.
          </div>
        )}
      </div>
    </div>
  )
}
