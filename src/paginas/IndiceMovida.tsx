import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALERTAS, LINHAS } from '../dados/linhas'

type Periodo = 'geral' | 'transporte' | 'alertas'

export default function IndiceMovida() {
  const [periodo, setPeriodo] = useState<Periodo>('geral')

  const resumo = useMemo(() => {
    const pontosUnicos = new Set(LINHAS.flatMap((linha) => linha.pontos.map((ponto) => ponto.nome)))
    return {
      linhas: LINHAS.length,
      linhasAtivas: LINHAS.filter((linha) => linha.status === 'operacao').length,
      pontos: pontosUnicos.size,
      alertas: ALERTAS.length,
      alertasAtivos: ALERTAS.length,
    }
  }, [])

  const linhasAtivas = LINHAS.filter((linha) => linha.status === 'operacao')

  return (
    <main className="pagina indice-pagina">
    <section className="indice-cabecalho">
        <div>
          <span className="indice-sobretitulo">INTELIGÊNCIA EM MOBILIDADE URBANA</span>
          <h1 className="titulo-pagina">Índice MOVIDA</h1>
          <p className="subtitulo">
            Uma visão geral dos dados de transporte e mobilidade reunidos pelo MOVIDA.
          </p>
        </div>
        <div className="indice-atualizacao">
          <span className="indice-ponto-status" />
          Dados do protótipo
        </div>
      </section>

      <section className="indice-introducao">
        <div className="indice-intro-icone" aria-hidden="true">📊</div>
        <div>
          <h2>Entenda a mobilidade da cidade</h2>
          <p>
            O painel reúne indicadores para facilitar a consulta das informações disponíveis.
            Conforme as funcionalidades forem conectadas ao banco de dados, os números serão
            atualizados automaticamente.
          </p>
        </div>
      </section>

      <div className="indice-filtros" role="group" aria-label="Filtrar indicadores">
        <span>Visualizar:</span>
        <button className={periodo === 'geral' ? 'selecionado' : ''} onClick={() => setPeriodo('geral')}>Visão geral</button>
        <button className={periodo === 'transporte' ? 'selecionado' : ''} onClick={() => setPeriodo('transporte')}>Transporte</button>
        <button className={periodo === 'alertas' ? 'selecionado' : ''} onClick={() => setPeriodo('alertas')}>Alertas</button>
      </div>

      {(periodo === 'geral' || periodo === 'transporte') && (
        <section className="indice-secao">
          <div className="indice-titulo-secao">
            <div>
              <span className="indice-sobretitulo">REDE DE TRANSPORTE</span>
              <h2>Transporte público</h2>
            </div>
            <Link to="/linhas">Consultar linhas →</Link>
          </div>
          <div className="indice-cartoes">
            <article className="indice-card">
              <span className="indice-card-icone">🚌</span>
              <strong>{resumo.linhas}</strong>
              <span>Linhas cadastradas</span>
              <small>Conforme o cadastro demonstrativo</small>
            </article>
            <article className="indice-card">
              <span className="indice-card-icone">✓</span>
              <strong>{resumo.linhasAtivas}</strong>
              <span>Linhas em operação</span>
              <small>Indicadas como ativas no protótipo</small>
            </article>
            <article className="indice-card">
              <span className="indice-card-icone">🚏</span>
              <strong>{resumo.pontos}</strong>
              <span>Pontos identificados</span>
              <small>Paradas únicas nas linhas cadastradas</small>
            </article>
          </div>
          <div className="indice-lista-linhas">
            <h3>Situação das linhas cadastradas</h3>
            {LINHAS.map((linha) => (
              <div className="indice-linha" key={linha.id}>
                <span className="indice-linha-cor" style={{ backgroundColor: linha.cor }} />
                <div className="indice-linha-nome">
                  <strong>{linha.codigo} · {linha.nome}</strong>
                  <small>{linha.frequencia}</small>
                </div>
                <span className={`indice-status ${linha.status === 'operacao' ? 'status-ativo' : 'status-fora'}`}>
                  {linha.status === 'operacao' ? 'Em operação' : 'Fora de operação'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(periodo === 'geral' || periodo === 'alertas') && (
        <section className="indice-secao">
          <div className="indice-titulo-secao">
            <div>
              <span className="indice-sobretitulo">ACOMPANHAMENTO DA CIDADE</span>
              <h2>Notícias e alertas</h2>
            </div>
            <Link to="/mapa">Ver mapa →</Link>
          </div>
          <div className="indice-cartoes indice-cartoes--dois">
            <article className="indice-card">
              <span className="indice-card-icone">🔔</span>
              <strong>{resumo.alertas}</strong>
              <span>Alertas no conjunto demonstrativo</span>
              <small>Registros estáticos usados no protótipo</small>
            </article>
            <article className="indice-card">
              <span className="indice-card-icone">📍</span>
              <strong>{resumo.alertasAtivos}</strong>
              <span>Ocorrências listadas</span>
              <small>Consulte os detalhes na página do mapa</small>
            </article>
          </div>
          <div className="indice-alertas-lista">
            {ALERTAS.slice(0, 4).map((alerta) => (
              <article className="indice-alerta" key={alerta.id}>
                <span className="indice-alerta-tipo">{alerta.tipo}</span>
                <div>
                  <strong>{alerta.titulo}</strong>
                  <p>{alerta.descricao}</p>
                </div>
                <small>{alerta.horario}</small>
              </article>
            ))}
            {ALERTAS.length === 0 && <p className="indice-vazio">Nenhum alerta cadastrado no protótipo.</p>}
          </div>
        </section>
      )}

      {periodo === 'geral' && (
        <section className="indice-secao">
          <div className="indice-titulo-secao">
            <div>
              <span className="indice-sobretitulo">PRÓXIMOS INDICADORES</span>
              <h2>Participação e inclusão</h2>
            </div>
          </div>
          <div className="indice-pendencias">
            <article>
              <span>📣</span>
              <div>
                <h3>Denúncias e sugestões</h3>
                <p>Os registros ainda não são persistidos no banco. A contagem será exibida após a integração.</p>
                <Link to="/denuncias">Acessar denúncias →</Link>
              </div>
              <span className="indice-em-breve">Integração pendente</span>
            </article>
            <article>
              <span>♿</span>
              <div>
                <h3>Acessibilidade urbana</h3>
                <p>Os locais e recursos acessíveis serão contabilizados quando houver cadastro estruturado e verificado.</p>
                <Link to="/acessibilidade">Acessar acessibilidade →</Link>
              </div>
              <span className="indice-em-breve">Cadastro pendente</span>
            </article>
            <article>
              <span>🌱</span>
              <div>
                <h3>Sustentabilidade</h3>
                <p>Indicadores de participação poderão ser incluídos quando o sistema registrar essas interações.</p>
                <Link to="/dicas">Ver dicas →</Link>
              </div>
              <span className="indice-em-breve">Dados futuros</span>
            </article>
          </div>
        </section>
      )}

      <aside className="indice-nota">
        <strong>Sobre os dados deste painel</strong>
        <p>
          Os números de transporte e alertas são calculados a partir dos dados demonstrativos
          existentes no projeto. Eles não representam estatísticas oficiais da cidade nem dados
          recebidos em tempo real. Indicadores de denúncias, acessibilidade e sustentabilidade
          aparecerão quando essas informações estiverem integradas e armazenadas.
        </p>
      </aside>
    </main>
  )
}
