// =============================================================================
// SERVIDOR ESTÁTICO DE PRODUÇÃO (Render)
// =============================================================================
// Sobe o build do Vite (pasta dist/) em qualquer hospedagem Node, sem
// dependências extras. Faz o fallback SPA: qualquer rota que não seja arquivo
// (ex.: /mapa) devolve o index.html, que é quem cuida do React Router.
// A porta vem da variável PORT (a Render define automaticamente).
// =============================================================================

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

// Pasta dist/ (gerada por `npm run build`), relativa a este script
const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const porta = Number(process.env.PORT) || 4173

// Tipos de arquivo que o navegador precisa receber com o MIME correto
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const servidor = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    // Normaliza o caminho e bloqueia tentativas de sair da pasta dist/
    const caminho = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
    let arquivo = join(raiz, caminho)
    let conteudo

    try {
      const info = await stat(arquivo)
      if (info.isDirectory()) throw new Error('é um diretório')
      conteudo = await readFile(arquivo)
    } catch {
      // Fallback SPA: rota desconhecida (/mapa, /denuncia...) vira o index.html
      arquivo = join(raiz, 'index.html')
      conteudo = await readFile(arquivo)
    }

    const tipo = TIPOS[extname(arquivo).toLowerCase()] ?? 'application/octet-stream'
    res.writeHead(200, {
      'content-type': tipo,
      // HTML sempre fresco; assets com hash podem ficar em cache
      'cache-control':
        extname(arquivo).toLowerCase() === '.html'
          ? 'no-cache'
          : 'public, max-age=31536000, immutable',
    })
    res.end(conteudo)
  } catch {
    // dist/ não existe (esqueceram de rodar o build) ou erro de leitura
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Erro ao carregar o Desloca. Rode: npm run build')
  }
})

servidor.listen(porta, () => {
  console.log(`Desloca (produção) rodando em http://localhost:${porta}`)
})
