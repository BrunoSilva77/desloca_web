// =============================================================================
// COMPONENTE DO CABEÇALHO (topo do site)
// =============================================================================
// Componente é uma parte reutilizável da tela. Este aparece em todas as páginas.
// =============================================================================

import { NavLink } from 'react-router-dom'
// Importa a imagem da logo (o Vite copia para a pasta de builds automaticamente)
import logoD from '../assets/logo-d.jpg'

// Lista de páginas do site. Cada item é um link da navegação.
// "to" é o endereço da rota e "nome" é o texto exibido.
const LINKS = [
  { to: '/', nome: 'Início' },
  { to: '/mapa', nome: 'Mapa' },
  { to: '/linhas', nome: 'Linhas' },
  { to: '/acessibilidade', nome: 'Acessibilidade' },
  { to: '/denuncias', nome: 'Denúncias' },
  { to: '/dicas', nome: 'Dicas' },
  { to: '/indice-movida', nome: 'Índice MOVIDA' },
]

export default function Cabecalho() {
  return (
    <header className="cabecalho">
      {/* Marca do site: logo do "D" + nome Desloca */}
      <div className="marca">
        <img className="marca-logo" src={logoD} alt="" aria-hidden="true" />
        Desloca
      </div>

      {/* Navegação entre as páginas */}
      <nav className="nav" aria-label="Navegação principal">
        {LINKS.map((link) => (
          // NavLink já aplica a classe "ativo" sozinho quando a página atual
          // corresponde ao endereço do link
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'ativo' : '')}
            end={link.to === '/'}
          >
            {link.nome}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
