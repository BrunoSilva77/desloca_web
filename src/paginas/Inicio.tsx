// =============================================================================
// PÁGINA INICIAL
// =============================================================================
// Tela de boas-vindas com atalhos para as principais funcionalidades.
// =============================================================================

import { Link } from 'react-router-dom'
import { LINHAS, ALERTAS } from '../dados/linhas'

// Atalhos exibidos na grade (ícone + título + descrição + para onde leva)
const ATALHOS = [
  {
    icone: '🚌',
    titulo: 'Ver ônibus no mapa',
    descricao: 'Acompanhe a posição dos veículos em tempo real.',
    para: '/mapa',
  },
  {
    icone: '🗺️',
    titulo: 'Consultar linhas',
    descricao: 'Horários, trajeto, pontos de parada e tarifa.',
    para: '/linhas',
  },
  {
    icone: '♿',
    titulo: 'Rota acessível',
    descricao: 'Trajetos adaptados para cadeira de rodas e mobilidade reduzida.',
    para: '/acessibilidade',
  },
  {
    icone: '⚠️',
    titulo: 'Reportar problema',
    descricao: 'Avise sobre buracos, ponto quebrado ou sinalização.',
    para: '/denuncias',
  },
]

export default function Inicio() {
  // Conta quantas linhas estão em operação agora
  const emOperacao = LINHAS.filter((linha) => linha.status === 'operacao').length

  return (
    <div className="pagina">
      {/* Chamada principal da página (hero) */}
      <section className="destaque">
        <h1>Sua condução pública, sem surpresa.</h1>
        <p>
          Veja onde os ônibus estão, confira os horários das linhas e receba alertas
          de trânsito antes de sair de casa.
        </p>
        {/* Botão leva direto para a página do mapa */}
        <Link className="botao" to="/mapa">
          Abrir o mapa
        </Link>
      </section>

      {/* Resumo rápido com números do sistema */}
      <section className="grade" aria-label="Resumo do sistema">
        <div className="cartao">
          <h3>{emOperacao} linhas em operação</h3>
          <p>Atualizado agora mesmo.</p>
        </div>
        <div className="cartao">
          <h3>{ALERTAS.length} alertas ativos</h3>
          <p>Trânsito, obras e ocorrências na cidade.</p>
        </div>
        <div className="cartao">
          <h3>Tempo de espera estimado</h3>
          <p>Veja a previsão para o próximo ônibus no seu ponto.</p>
        </div>
      </section>

      {/* Atalhos para as telas do sistema */}
      <h2 className="titulo-pagina" style={{ marginTop: 44 }}>
        O que você precisa?
      </h2>
      <div className="grade">
        {ATALHOS.map((atalho) => (
          // Cada atalho é um cartão clicável que leva a uma página
          <Link key={atalho.titulo} to={atalho.para} className="cartao">
            <div className="atalho-icone" aria-hidden="true">
              {atalho.icone}
            </div>
            <h3>{atalho.titulo}</h3>
            <p>{atalho.descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
