// =============================================================================
// PÁGINA DE DICAS DE SUSTENTABILIDADE
// =============================================================================
// Conteúdo informativo para incentivar o uso do transporte coletivo.
// =============================================================================

// Lista de dicas exibidas nos cartões
const DICAS = [
  {
    icone: '🚌',
    titulo: 'Prefira o transporte coletivo',
    descricao: 'Cada ônibus cheio tira vários carros da rua e reduz o congestionamento.',
  },
  {
    icone: '🗺️',
    titulo: 'Planeje o trajeto antes de sair',
    descricao: 'Verifique o mapa e os alertas para evitar esperas desnecessárias.',
  },
  {
    icone: '🚲',
    titulo: 'Combine com caminhada ou bicicleta',
    descricao: 'Para trechos curtos, deixe o ônibus de lado e vá a pé ou de bike.',
  },
  {
    icone: '🤝',
    titulo: 'Compartilhe as informações',
    descricao: 'Avise amigos e familiares sobre o horário das linhas que eles usam.',
  },
  {
    icone: '⏰',
    titulo: 'Viaje fora do horário de pico',
    descricao: 'Se puder, desloque-se mais cedo ou mais tarde para viajar com mais conforto.',
  },
  {
    icone: '⚠️',
    titulo: 'Reporte problemas',
    descricao: 'Uma denúncia rápida ajuda a manter pontos e veículos em boa condição.',
  },
]

export default function Dicas() {
  return (
    <div className="pagina">
      <h1 className="titulo-pagina">Dicas de sustentabilidade</h1>
      <p className="subtitulo">
        Pequenas atitudes, grandes mudanças para a cidade. Adotar o transporte público
        é um dos passos mais simples para reduzir a emissão de gases.
      </p>

      <div className="grade">
        {DICAS.map((dica) => (
          <div key={dica.titulo} className="cartao">
            <div className="atalho-icone" aria-hidden="true">
              {dica.icone}
            </div>
            <h3>{dica.titulo}</h3>
            <p>{dica.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
