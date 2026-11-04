import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite: ferramenta que compila e roda o projeto em modo de desenvolvimento.
// O plugin "react" cuida da transformação do JSX/TSX para o navegador entender.
export default defineConfig({
  plugins: [react()],
  server: {
    // Porta padrão do servidor de desenvolvimento (acessada em http://localhost:5173)
    port: 5173,
  },
})
