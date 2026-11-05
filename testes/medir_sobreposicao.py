"""Confere se o CSS servido contém a regra nova de altura da tela do mapa."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1280, "height": 720})
    pagina.goto("http://localhost:5173/mapa")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(1500)
    print(
        pagina.evaluate(
            """() => {
        const achados = [];
        for (const folha of document.styleSheets) {
            let regras;
            try { regras = folha.cssRules; } catch { continue; }
            for (const regra of regras) {
                if (regra.selectorText && regra.selectorText.includes('tela-mapa')) {
                    achados.push(regra.selectorText + ' => ' + regra.style.height +
                        ' (href: ' + (folha.href || 'inline') + ')');
                }
            }
        }
        return {
            regras: achados,
            vh: getComputedStyle(document.documentElement).getPropertyValue('--vh-test') || null,
            innerH: window.innerHeight,
            clientH: document.documentElement.clientHeight,
            telaComputed: getComputedStyle(document.querySelector('.tela-mapa-unificada')).height,
        };
    }"""
        )
    )
    navegador.close()
