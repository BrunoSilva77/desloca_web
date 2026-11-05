// =============================================================================
// COMPONENTE DO CABEÇALHO (topo do site)
// =============================================================================
// Cabeçalho institucional com navegação responsiva (desktop e mobile).
// =============================================================================

import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoD from '../assets/logo-d.jpg'

const LINKS = [
  { to: '/', nome: 'Início' },
  { to: '/mapa', nome: 'Mapa & Linhas' },
  { to: '/acessibilidade', nome: 'Acessibilidade' },
  { to: '/mapa?acao=denuncia', nome: 'Denúncias' },
  { to: '/dicas', nome: 'Dicas' },
  { to: '/indice-movida', nome: 'Índice MOVIDA' },
]

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false)
  const location = useLocation()

  function fecharMenu() {
    setMenuAberto(false)
  }

  // Verifica se o link do mapa está ativo (inclusive para denúncias no mapa)
  const isLinkAtivo = (to: string) => {
    if (to === '/') return location.pathname === '/'
    if (to.includes('?acao=denuncia')) {
      return location.pathname === '/mapa' && location.search.includes('acao=denuncia')
    }
    if (to === '/mapa') {
      return location.pathname === '/mapa' && !location.search.includes('acao=denuncia')
    }
    return location.pathname.startsWith(to)
  }

  return (
    <header className="cabecalho">
      {/* Marca do site: logo do "D" + nome Desloca */}
      <NavLink to="/" className="marca" onClick={fecharMenu}>
        <img className="marca-logo" src={logoD} alt="" aria-hidden="true" />
        <span>Desloca</span>
      </NavLink>

      {/* Botão hamburguer no mobile */}
      <button
        type="button"
        className={`botao-hamburguer ${menuAberto ? 'aberto' : ''}`}
        onClick={() => setMenuAberto((prev) => !prev)}
        aria-label={menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        aria-expanded={menuAberto}
      >
        <span className="barra" />
        <span className="barra" />
        <span className="barra" />
      </button>

      {/* Navegação principal (desktop) */}
      <nav className="nav nav-desktop" aria-label="Navegação principal">
        {LINKS.map((link) => {
          const ativo = isLinkAtivo(link.to)
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={ativo ? 'ativo' : ''}
              end={link.to === '/'}
            >
              {link.nome}
            </NavLink>
          )
        })}
      </nav>

      {/* Drawer / Menu colapsável para mobile */}
      {menuAberto && (
        <div className="menu-mobile-backdrop" onClick={fecharMenu}>
          <nav
            className="menu-mobile"
            aria-label="Menu móvel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-mobile-topo">
              <div className="marca">
                <img className="marca-logo" src={logoD} alt="" aria-hidden="true" />
                <span>Desloca</span>
              </div>
              <button
                type="button"
                className="botao-fechar-menu"
                onClick={fecharMenu}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>
            <div className="menu-mobile-links">
              {LINKS.map((link) => {
                const ativo = isLinkAtivo(link.to)
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`menu-mobile-item ${ativo ? 'ativo' : ''}`}
                    onClick={fecharMenu}
                  >
                    <span>{link.nome}</span>
                    {link.to.includes('mapa') && <span className="tag-mapa">Ao vivo</span>}
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
