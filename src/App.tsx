// =============================================================================
// ARQUIVO DE ROTAS DA APLICAÇÃO
// =============================================================================
// Aqui definimos qual página aparece para cada endereço (URL).
// Ex.: "/mapa" mostra a página do Mapa.
// =============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Cabecalho from './componentes/Cabecalho'

// Importa todas as páginas do projeto
import Inicio from './paginas/Inicio'
import Mapa from './paginas/Mapa'
import Linhas from './paginas/Linhas'
import Acessibilidade from './paginas/Acessibilidade'
import Denuncias from './paginas/Denuncias'
import Dicas from './paginas/Dicas'
import IndiceMovida from './paginas/IndiceMovida'

export default function App() {
  return (
    // BrowserRouter ativa a navegação por rotas no navegador
    <BrowserRouter>
      {/* Cabeçalho aparece em todas as páginas */}
      <Cabecalho />

      {/* Routes: lista de caminhos e a página correspondente */}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/linhas" element={<Linhas />} />
        <Route path="/acessibilidade" element={<Acessibilidade />} />
        <Route path="/denuncias" element={<Denuncias />} />
        <Route path="/dicas" element={<Dicas />} />
        <Route path="/indice-movida" element={<IndiceMovida />} />

        {/* Rota coringa: qualquer endereço não listado cai no início */}
        <Route path="*" element={<Inicio />} />
      </Routes>

      {/* Rodapé com créditos da equipe */}
      <footer className="rodape">
        <strong>Desloca</strong> — Plataforma para acompanhamento de percurso de
        condução pública · Fatec Araçatuba 2026
      </footer>
    </BrowserRouter>
  )
}
