// =============================================================================
// PÁGINA DE ACESSIBILIDADE
// =============================================================================
// Mostra rotas adaptadas para pessoas com mobilidade reduzida.
// (Tela mantida como exemplo — pode ser removida depois, conforme combinado)
// =============================================================================

import { ROTAS_ACESSIVEIS } from '../dados/linhas'

// Itens de requisito que uma rota precisa ter para ser considerada acessível
const REQUISITOS = [
  { icone: '🛗', titulo: 'Sem degraus', descricao: 'Preferência por rampas e passarelas.' },
  { icone: '🔊', titulo: 'Semáforo sonoro', descricao: 'Aviso sonoro para quem não enxerga.' },
  { icone: '👣', titulo: 'Piso tátil', descricao: 'Guia de piso para deficientes visuais.' },
  { icone: '🚻', titulo: 'Banheiro acessível', descricao: 'Nas estações e terminais principais.' },
]

export default function Acessibilidade() {
  return (
    <div className="pagina">
      <h1 className="titulo-pagina">Acessibilidade urbana</h1>
      <p className="subtitulo">
        Encontre rotas e locais acessíveis na região. Nossa meta é que todos se
        desloquem com segurança e independência.
      </p>

      {/* Requisitos de uma rota acessível */}
      <div className="grade">
        {REQUISITOS.map((item) => (
          <div key={item.titulo} className="cartao">
            <div className="atalho-icone" aria-hidden="true">
              {item.icone}
            </div>
            <h3>{item.titulo}</h3>
            <p>{item.descricao}</p>
          </div>
        ))}
      </div>

      {/* Rotas acessíveis cadastradas */}
      <h2 className="titulo-pagina" style={{ marginTop: 44, fontSize: '1.4rem' }}>
        Rotas acessíveis encontradas
      </h2>
      <div className="grade">
        {ROTAS_ACESSIVEIS.map((rota) => (
          <div key={rota.id} className="cartao">
            <h3>
              {rota.origem} → {rota.destino}
            </h3>
            <p>{rota.detalhes}</p>
            <p style={{ marginTop: 8, fontWeight: 700, color: 'var(--preto)' }}>
              Tempo estimado: {rota.tempo}
            </p>
            <span className="badge operacao" style={{ marginTop: 10 }}>
              Rota adaptada
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
