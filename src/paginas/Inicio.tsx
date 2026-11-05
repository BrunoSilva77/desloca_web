// =============================================================================
// PÁGINA INICIAL
// =============================================================================
// Tela de boas-vindas com hero animado (mapa desfocado ao vivo), números do
// sistema com contagem animada, atalhos e um bloco "como funciona".
// =============================================================================

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MapaDesloca from '../componentes/MapaDesloca'
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

// Passos do bloco "Como funciona"
const PASSOS = [
  {
    titulo: 'Escolha sua linha',
    descricao: 'Busque por número ou nome e veja o trajeto completo com todos os pontos.',
  },
  {
    titulo: 'Acompanhe ao vivo',
    descricao: 'Os ônibus andam no mapa com previsão de chegada para o seu ponto.',
  },
  {
    titulo: 'Fique por dentro',
    descricao: 'Obras, congestionamentos e ocorrências chegam como alerta na hora.',
  },
]

// Contador que anima do zero até o valor final quando a página monta.
// Respeita quem prefere menos movimento: nesse caso mostra o valor já no fim.
function useContador(alvo: number, duracao = 1100) {
  const [valor, setValor] = useState(0)
  const inicioRef = useRef<number | null>(null)

  useEffect(() => {
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (menosMovimento) {
      setValor(alvo)
      return
    }

    let quadro = 0
    const passo = (tempo: number) => {
      if (inicioRef.current === null) inicioRef.current = tempo
      const decorrido = tempo - inicioRef.current
      const progresso = Math.min(decorrido / duracao, 1)
      // Curva suave: começa rápido e desacelera no fim
      const suave = 1 - Math.pow(1 - progresso, 3)
      setValor(Math.round(alvo * suave))
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, duracao])

  return valor
}

export default function Inicio() {
  // Conta quantas linhas estão em operação agora
  const emOperacao = LINHAS.filter((linha) => linha.status === 'operacao').length
  // Soma todas as paradas cadastradas nas linhas
  const totalPontos = LINHAS.reduce((total, linha) => total + linha.pontos.length, 0)

  const linhasAnimadas = useContador(emOperacao)
  const alertasAnimados = useContador(ALERTAS.length, 1300)
  const pontosAnimados = useContador(totalPontos, 1500)

  return (
    <div className="inicio-pagina">
      {/* =====================================================================
          HERO: mapa da cidade desfocado ao vivo por trás do texto
      ===================================================================== */}
      <section className="inicio-hero">
        {/* Mapa real (Leaflet) com os ônibus andando, usado só como pano de fundo */}
        <div className="inicio-hero-mapa" aria-hidden="true">
          <MapaDesloca todasLinhas={LINHAS} />
        </div>

        {/* Veu escuro por cima do mapa para o texto ficar legível */}
        <div className="inicio-hero-veu" aria-hidden="true" />

        <div className="inicio-hero-conteudo">
          <span className="inicio-selo animar" style={{ animationDelay: '0.05s' }}>
            <span className="inicio-selo-ponto" aria-hidden="true" />
            Ao vivo · Araçatuba-SP
          </span>

          <h1 className="animar" style={{ animationDelay: '0.18s' }}>
            Sua condução pública,
            <br />
            <span className="inicio-destaque">sem surpresa.</span>
          </h1>

          <p className="animar" style={{ animationDelay: '0.32s' }}>
            Acompanhe os ônibus em tempo real, confira os horários das linhas e receba
            alertas de trânsito antes de sair de casa.
          </p>

          <div className="inicio-hero-botoes animar" style={{ animationDelay: '0.46s' }}>
            <Link className="botao inicio-botao-primario" to="/mapa">
              Abrir o mapa ao vivo
            </Link>
            <Link className="botao inicio-botao-secundario" to="/linhas">
              Explorar linhas
            </Link>
          </div>
        </div>

        {/* Crédito do mapa em texto nítido (o do Leaflet fica desfocado) */}
        <span className="inicio-hero-creditos">Mapa © OpenStreetMap</span>
      </section>

      <div className="pagina">
        {/* =====================================================================
            FAIXA DE NÚMEROS (encosta no hero e conta até o valor final)
        ===================================================================== */}
        <section className="inicio-numeros" aria-label="Resumo do sistema">
          <div className="inicio-numero animar" style={{ animationDelay: '0.55s' }}>
            <strong>{linhasAnimadas}</strong>
            <span>
              {linhasAnimadas === 1 ? 'linha em operação' : 'linhas em operação'}
              <small>Atualizado agora mesmo.</small>
            </span>
          </div>
          <div className="inicio-numero animar" style={{ animationDelay: '0.68s' }}>
            <strong>{alertasAnimados}</strong>
            <span>
              {alertasAnimados === 1 ? 'alerta ativo' : 'alertas ativos'}
              <small>Trânsito, obras e ocorrências na cidade.</small>
            </span>
          </div>
          <div className="inicio-numero animar" style={{ animationDelay: '0.81s' }}>
            <strong>{pontosAnimados}</strong>
            <span>
              {pontosAnimados === 1 ? 'ponto de parada' : 'pontos de parada'}
              <small>Mapeados nas linhas do protótipo.</small>
            </span>
          </div>
        </section>

        {/* =====================================================================
            ATALHOS PARA AS TELAS DO SISTEMA
        ===================================================================== */}
        <section className="inicio-secao">
          <h2 className="titulo-pagina animar" style={{ animationDelay: '0.2s' }}>
            O que você precisa?
          </h2>
          <div className="grade">
            {ATALHOS.map((atalho, indice) => (
              <Link
                key={atalho.titulo}
                to={atalho.para}
                className="cartao inicio-atalho animar"
                style={{ animationDelay: `${0.25 + indice * 0.09}s` }}
              >
                <div className="atalho-icone" aria-hidden="true">
                  {atalho.icone}
                </div>
                <h3>{atalho.titulo}</h3>
                <p>{atalho.descricao}</p>
                <span className="inicio-atalho-seta" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================================
            COMO FUNCIONA (3 passos numerados)
        ===================================================================== */}
        <section className="inicio-secao">
          <h2 className="titulo-pagina animar" style={{ animationDelay: '0.2s' }}>
            Como funciona
          </h2>
          <ol className="inicio-passos">
            {PASSOS.map((passo, indice) => (
              <li
                key={passo.titulo}
                className="inicio-passo animar"
                style={{ animationDelay: `${0.25 + indice * 0.12}s` }}
              >
                <span className="inicio-passo-numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h3>{passo.titulo}</h3>
                  <p>{passo.descricao}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
