"""Auditoria de responsividade: 5 rotas em mobile (375) e tablet (768).

Para cada combinação gera screenshot e lista elementos que estouram a largura
da viewport (causam rolagem horizontal ou conteúdo cortado).
"""
from playwright.sync_api import sync_playwright

ROTAS = [
    ("inicio", "/"),
    ("mapa", "/mapa"),
    ("acessibilidade", "/acessibilidade"),
    ("dicas", "/dicas"),
    ("indice-movida", "/indice-movida"),
]

TAMANHOS = [
    ("mobile", 375, 812),
    ("tablet", 768, 1024),
]

JS_AUDITORIA = """() => {
    const largura = document.documentElement.clientWidth;
    const estourados = [];
    document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > largura + 2 || r.left < -2) {
            const estilo = getComputedStyle(el);
            if (estilo.position === 'fixed') return; // popups fechados/overlays
            estourados.push({
                cls: (el.className && el.className.toString().slice(0, 50)) || el.tagName,
                left: Math.round(r.left),
                right: Math.round(r.right),
            });
        }
    });
    return {
        largura,
        scrollW: document.documentElement.scrollWidth,
        estourados: estourados.slice(0, 12),
    };
}"""

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    for nome_tam, w, h in TAMANHOS:
        pagina = navegador.new_page(viewport={"width": w, "height": h})
        for nome_rota, rota in ROTAS:
            pagina.goto(f"http://localhost:5173{rota}")
            pagina.wait_for_load_state("networkidle")
            pagina.wait_for_timeout(1200)
            dados = pagina.evaluate(JS_AUDITORIA)
            rolavel = dados["scrollW"] > dados["largura"] + 1
            print(f"[{nome_tam}] {nome_rota}: scrollW={dados['scrollW']} "
                  f"largura={dados['largura']} {'ROLAGEM-HORIZONTAL!' if rolavel else 'ok'}")
            for item in dados["estourados"]:
                print(f"    estoura: {item}")
            pagina.screenshot(
                path=f"testes/resp-{nome_tam}-{nome_rota}.png", full_page=True
            )
        pagina.close()
    navegador.close()
