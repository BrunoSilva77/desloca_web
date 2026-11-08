# -*- coding: utf-8 -*-
"""Capturas da tela do mapa na nova direção visual (placa de partidas)."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)

    # --- Desktop 1440x900: lista + barra --------------------------------
    pagina = navegador.new_page(viewport={"width": 1440, "height": 900})
    erros = []
    pagina.on("pageerror", lambda e: erros.append(str(e)))
    pagina.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)

    pagina.goto("http://localhost:5173/mapa", wait_until="domcontentloaded")
    pagina.wait_for_timeout(4000)
    pagina.screenshot(path="testes/desenho-mapa-desktop.png")

    # --- Detalhe da linha 101 aberto -----------------------------------
    pagina.evaluate("window.__selecionarLinhaDesloca && window.__selecionarLinhaDesloca(1)")
    pagina.wait_for_timeout(1500)
    pagina.screenshot(path="testes/desenho-mapa-detalhe.png")

    # --- Popup de um ônibus --------------------------------------------
    pagina.evaluate(
        """() => {
            const el = document.querySelector('.marcador-onibus-animado .onibus-emoji')
            if (el) el.click()
        }"""
    )
    pagina.wait_for_timeout(800)
    pagina.screenshot(path="testes/desenho-mapa-popup.png")
    pagina.close()

    # --- Mobile 375x812 -------------------------------------------------
    mobile = navegador.new_page(viewport={"width": 375, "height": 812})
    mobile.on("pageerror", lambda e: erros.append(str(e)))
    mobile.goto("http://localhost:5173/mapa", wait_until="domcontentloaded")
    mobile.wait_for_timeout(4000)
    mobile.screenshot(path="testes/desenho-mapa-mobile.png")
    mobile.close()

    print(f"erros de console: {erros if erros else 'nenhum'}")
    assert not erros, erros
    navegador.close()
    print("CAPTURAS OK")
