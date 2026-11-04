// =============================================================================
// DECLARAÇÃO DE TIPOS DO VITE
// =============================================================================
// O TypeScript não sabe reconhecer arquivos de imagem (.jpg, .png) como módulos.
// Este arquivo ensina que importar uma imagem devolve o caminho dela (string).
// =============================================================================

/// <reference types="vite/client" />

// Quando importamos uma imagem, o resultado é o endereço (URL) dela
declare module '*.jpg' {
  const caminho: string
  export default caminho
}

declare module '*.jpeg' {
  const caminho: string
  export default caminho
}

declare module '*.png' {
  const caminho: string
  export default caminho
}

declare module '*.svg' {
  const caminho: string
  export default caminho
}
