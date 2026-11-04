// =============================================================================
// PÁGINA DE LINHAS
// =============================================================================
// Lista todas as linhas de ônibus e mostra o detalhe (trajeto, pontos, previsão)
// quando o usuário escolhe uma delas.
// =============================================================================

import { useState } from 'react'
import MapaDesloca from '../componentes/MapaDesloca'
import { LINHAS, type Linha } from '../dados/linhas'

export default function Linhas() {
  // Linha escolhida pelo usuário (para mostrar no mapa e nos detalhes)
  const [selecionada, setSelecionada] = useState<Linha | null>(null)

  return (
    <div className="pagina">
      <h1 className="titulo-pagina">Linhas de ônibus</h1>
      <p className="subtitulo">
        Escolha uma linha para ver o trajeto no mapa, os pontos de parada e a previsão
        do próximo veículo.
      </p>

      <div className="grade">
        {LINHAS.map((linha) => (
          <div
            key={linha.id}
            className="cartao"
            style={{
              cursor: 'pointer',
              borderColor: selecionada?.id === linha.id ? linha.cor : undefined,
              borderWidth: selecionada?.id === linha.id ? 2 : undefined,
            }}
            // Clique no cartão seleciona a linha
            onClick={() => setSelecionada(linha)}
            role="button"
            tabIndex={0}
            // Permite selecionar também usando o teclado (acessibilidade)
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelecionada(linha)
              }
            }}
          >
            <div
              style={{
                height: 6,
                width: 46,
                background: linha.cor,
                borderRadius: 99,
                marginBottom: 10,
              }}
            />
            <h3>
              {linha.codigo} — {linha.nome}
            </h3>
            <p>
              Tarifa: {linha.tarifa} · {linha.frequencia}
            </p>
            <span className={`badge ${linha.status}`} style={{ marginTop: 8 }}>
              {linha.status === 'operacao' ? 'Em operação' : 'Fora de linha'}
            </span>
          </div>
        ))}
      </div>

      {/* Detalhes da linha selecionada */}
      {selecionada && (
        <section style={{ marginTop: 40 }} aria-label="Detalhes da linha">
          <h2 className="titulo-pagina" style={{ fontSize: '1.4rem' }}>
            {selecionada.codigo} — {selecionada.nome}
          </h2>

          {/* Informações rápidas em cartões */}
          <div className="grade" style={{ margin: '18px 0' }}>
            <div className="cartao">
              <h3>Próximo ônibus</h3>
              <p>
                Placa {selecionada.proximoOnibus.placa} · chega em{' '}
                {selecionada.proximoOnibus.previsao}
              </p>
              <span className={`badge ${selecionada.proximoOnibus.lotacao}`}>
                {selecionada.proximoOnibus.lotacao === 'vazio'
                  ? 'Vago'
                  : selecionada.proximoOnibus.lotacao === 'medio'
                    ? 'Movimento médio'
                    : 'Lotado'}
              </span>
            </div>
            <div className="cartao">
              <h3>Horários</h3>
              <p>Primeira viagem: 05h30</p>
              <p>Última viagem: 23h30</p>
            </div>
          </div>

          {/* Mapa mostrando apenas o trajeto desta linha */}
          <MapaDesloca linhas={[selecionada]} linhaAtiva={selecionada} />

          {/* Lista de pontos de parada na ordem do trajeto */}
          <h3 style={{ margin: '24px 0 10px' }}>Pontos de parada</h3>
          <div className="grade">
            {selecionada.pontos.map((ponto, indice) => (
              <div key={ponto.nome} className="cartao">
                <p style={{ fontWeight: 700, color: 'var(--preto)' }}>
                  {/* Numera cada ponto na ordem em que o ônibus passa */}
                  {indice + 1}. {ponto.nome}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
