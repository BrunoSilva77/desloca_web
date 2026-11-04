// =============================================================================
// PONTO DE ENTRADA DA APLICAÇÃO
// =============================================================================
// Este é o primeiro arquivo executado pelo navegador. Ele carrega o CSS global
// e monta o componente App (que tem as rotas) dentro da div "root" do index.html.
// =============================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './estilos/global.css'

// Procura a div com id="root" no HTML e injeta o React dentro dela
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
