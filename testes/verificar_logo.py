# -*- coding: utf-8 -*-
"""Tira print do cabeçalho (desktop e mobile) para conferir a nova logo."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)

    # Desktop
    pagina = navegador.new_page(viewport={"width": 1440, "height": 400})
    erros = []
    pagina.on("pageerror", lambda e: erros.append(str(e)))
    pagina.goto("http://localhost:5173/")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(1200)
    pagina.locator(".cabecalho").screenshot(path="testes/logo-cabecalho-desktop.png")

    # Medidas da imagem no cabeçalho
    medidas = pagina.evaluate(
        """() => {
            const img = document.querySelector('.cabecalho .marca-logo')
            if (!img) return null
            const r = img.getBoundingClientRect()
            return {
                largura: Math.round(r.width),
                altura: Math.round(r.height),
                carregada: img.complete && img.naturalWidth > 0,
                natural: img.naturalWidth + 'x' + img.naturalHeight,
                temTexto: !!document.querySelector('.cabecalho .marca span'),
            }
        }"""
    )
    print("desktop:", medidas)
    print("erros:", erros if erros else "nenhum")
    pagina.close()

    # Mobile (menu aberto para ver a logo também no drawer)
    pagina2 = navegador.new_page(viewport={"width": 375, "height": 812})
    pagina2.goto("http://localhost:5173/")
    pagina2.wait_for_load_state("networkidle")
    pagina2.wait_for_timeout(800)
    pagina2.locator(".cabecalho").screenshot(path="testes/logo-cabecalho-mobile.png")
    pagina2.locator(".botao-hamburguer").click()
    pagina2.wait_for_timeout(500)
    pagina2.locator(".menu-mobile").screenshot(path="testes/logo-menu-mobile.png")
    pagina2.close()

    navegador.close()
    print("prints gerados em testes/logo-*.png")
