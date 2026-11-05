"""Identifica qual elemento ultrapassa a viewport no mobile do Início."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 375, "height": 812})
    pagina.goto("http://localhost:5173/")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(2000)
    print(
        pagina.evaluate(
            """() => {
        const largura = document.documentElement.clientWidth;
        const fora = [];
        document.querySelectorAll('body *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return;
            if (getComputedStyle(el).position === 'fixed') return;
            if (el.closest('.leaflet-container')) return;
            if (r.right > largura + 2) {
                let recortado = false;
                let pai = el.parentElement;
                while (pai) {
                    const o = getComputedStyle(pai).overflow;
                    if (o === 'hidden' || o === 'clip') { recortado = true; break; }
                    pai = pai.parentElement;
                }
                fora.push({
                    cls: (el.className || '').toString().slice(0, 45),
                    right: Math.round(r.right),
                    recortadoPorOverflowHidden: recortado,
                });
            }
        });
        return fora;
    }"""
        )
    )
    navegador.close()
