// =============================================================================
// PÁGINA DE ACESSIBILIDADE — MOVIDA
// Guia para consultar recursos e rotas acessíveis.
// Os dados de rotas abaixo vêm do protótipo e ainda precisam ser validados.
// =============================================================================

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROTAS_ACESSIVEIS } from '../dados/linhas'

type Filtro = 'todos' | 'rampas' | 'piso' | 'sonoro' | 'banheiro'

const RECURSOS = [
  {
    id: 'rampas' as const,
    icone: '♿',
    titulo: 'Rampas e acesso sem degraus',
    descricao: 'Acesso com rampas, rebaixamento de calçada ou percurso sem escadas.',
  },
  {
    id: 'piso' as const,
    icone: '👣',
    titulo: 'Piso tátil',
    descricao: 'Sinalização tátil para orientar pessoas com deficiência visual.',
  },
  {
    id: 'sonoro' as const,
    icone: '🔊',
    titulo: 'Travessia com sinal sonoro',
    descricao: 'Semáforos com aviso sonoro para auxiliar a travessia.',
  },
  {
    id: 'banheiro' as const,
    icone: '🚻',
    titulo: 'Banheiro acessível',
    descricao: 'Sanitário com condições de acesso e uso por pessoas com deficiência ou mobilidade reduzida.',
  },
]

function possuiRecurso(texto: string, filtro: Filtro) {
  const normalizado = texto.toLocaleLowerCase('pt-BR')
  if (filtro === 'todos') return true
  if (filtro === 'rampas') return /rampa|sem degraus|passarela/.test(normalizado)
  if (filtro === 'piso') return /piso tátil/.test(normalizado)
  if (filtro === 'sonoro') return /sonoro/.test(normalizado)
  return /banheiro/.test(normalizado)
}

export default function Acessibilidade() {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const rotasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return ROTAS_ACESSIVEIS.filter((rota) => {
      const texto = `${rota.origem} ${rota.destino} ${rota.detalhes}`
      const correspondeBusca = !termo || texto.toLocaleLowerCase('pt-BR').includes(termo)
      return correspondeBusca && possuiRecurso(texto, filtro)
    })
  }, [busca, filtro])

  return (
    <main className="pagina acessibilidade-pagina">
      <section className="acessibilidade-introducao">
        <span className="acessibilidade-etiqueta">MOBILIDADE PARA TODOS</span>
        <h1 className="titulo-pagina">Acessibilidade urbana</h1>
        <p className="subtitulo">
          Consulte recursos de acessibilidade e encontre informações para planejar
          deslocamentos com mais autonomia e segurança.
        </p>
      </section>

      <section className="acessibilidade-recursos" aria-labelledby="titulo-recursos">
        <div className="acessibilidade-secao-cabecalho">
          <div>
            <h2 id="titulo-recursos">O que você precisa encontrar?</h2>
            <p>Conheça os recursos que ajudam a tornar os trajetos mais acessíveis.</p>
          </div>
        </div>

        <div className="acessibilidade-recursos-grade">
          {RECURSOS.map((recurso) => (
            <article className="acessibilidade-recurso" key={recurso.id}>
              <span className="acessibilidade-recurso-icone" aria-hidden="true">
                {recurso.icone}
              </span>
              <div>
                <h3>{recurso.titulo}</h3>
                <p>{recurso.descricao}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="acessibilidade-rotas" aria-labelledby="titulo-rotas">
        <div className="acessibilidade-secao-cabecalho">
          <div>
            <h2 id="titulo-rotas">Rotas acessíveis cadastradas</h2>
            <p>Pesquise os trajetos disponíveis e filtre pelos recursos informados.</p>
          </div>
          <span className="acessibilidade-contagem">
            {rotasFiltradas.length} {rotasFiltradas.length === 1 ? 'rota' : 'rotas'}
          </span>
        </div>

        <div className="acessibilidade-busca-filtros">
          <label className="acessibilidade-campo-busca">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar por origem, destino ou recurso..."
              aria-label="Buscar rotas acessíveis"
            />
          </label>

          <div className="acessibilidade-filtros" aria-label="Filtrar rotas por recurso">
            {([
              ['todos', 'Todos'],
              ['rampas', 'Rampas / sem degraus'],
              ['piso', 'Piso tátil'],
              ['sonoro', 'Sinal sonoro'],
              ['banheiro', 'Banheiro acessível'],
            ] as [Filtro, string][]).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                className={`acessibilidade-filtro ${filtro === valor ? 'selecionado' : ''}`}
                onClick={() => setFiltro(valor)}
                aria-pressed={filtro === valor}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        {rotasFiltradas.length > 0 ? (
          <div className="acessibilidade-rotas-grade">
            {rotasFiltradas.map((rota) => (
              <article className="acessibilidade-rota" key={rota.id}>
                <div className="acessibilidade-rota-topo">
                  <span className="acessibilidade-rota-icone" aria-hidden="true">↗</span>
                  <span className="acessibilidade-status">Informação do protótipo</span>
                </div>
                <h3>{rota.origem}</h3>
                <div className="acessibilidade-rota-destino">↓ {rota.destino}</div>
                <p>{rota.detalhes}</p>
                <div className="acessibilidade-rota-rodape">
                  <span>◷ Tempo estimado: <strong>{rota.tempo}</strong></span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="acessibilidade-sem-resultados">
            <span aria-hidden="true">⌕</span>
            <h3>Nenhuma rota encontrada</h3>
            <p>Tente alterar a pesquisa ou selecionar outro filtro.</p>
            <button type="button" className="botao secundario" onClick={() => { setBusca(''); setFiltro('todos') }}>
              Limpar filtros
            </button>
          </div>
        )}

        <p className="acessibilidade-aviso">
          <strong>Importante:</strong> as rotas exibidas são dados demonstrativos do protótipo.
          As condições de acessibilidade precisam ser verificadas antes de serem apresentadas
          como informações confirmadas ao público.
        </p>
      </section>

      <section className="acessibilidade-contribuir">
        <div className="acessibilidade-contribuir-icone" aria-hidden="true">＋</div>
        <div>
          <h2>Ajude a melhorar a acessibilidade da cidade</h2>
          <p>
            Encontrou uma calçada danificada, uma rampa bloqueada ou outro problema?
            Envie sua contribuição para que a situação possa ser registrada.
          </p>
        </div>
        <Link to="/denuncias" className="botao acessibilidade-contribuir-botao">
          Registrar problema
        </Link>
      </section>
    </main>
  )
}
