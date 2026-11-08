# -*- coding: utf-8 -*-
"""Captura telas das novidades: toolbar sem chips, busca por destino com
sugestão de rota e a fila de 8 ônibus no Terminal (desktop e celular)."""
from playwright.sync_api import sync_playwright

URL = "http://localhost:5173/mapa"

with sync_playwright() as pw:
    navegador = pw.chromium.launch()

    # --- Desktop ---
    ctx = navegador.new_context(viewport={"width": 1440, "height": 900})
    pag = ctx.new_page()
    pag.goto(URL)
    pag.wait_for_timeout(4000)

    # Toolbar só com o relógio (sem chips de partida)
    pag.screenshot(path="testes/tela_toolbar_relogio.png", clip={"x": 0, "y": 0, "width": 1440, "height": 140})

    # Busca por destino: digita e abre o dropdown de sugestões
    campo = pag.locator(".campo-busca-linha")
    campo.click()
    campo.type("aero", delay=80)
    pag.wait_for_timeout(600)
    pag.screenshot(path="testes/tela_busca_destino.png", clip={"x": 0, "y": 0, "width": 480, "height": 700})

    # Escolhe o destino e vê o cartão de rota sugerida
    pag.locator(".item-destino").first.click()
    pag.wait_for_timeout(1200)
    pag.screenshot(path="testes/tela_sugestao_rota.png", clip={"x": 0, "y": 0, "width": 480, "height": 800})

    # Fila de 8 ônibus no terminal (zoom bem perto)
    pag.evaluate("""() => {
        const m = window.__mapaDesloca
        if (m) m.setView([-21.203169, -50.4385078], 17)
    }""")
    pag.wait_for_timeout(1500)
    pag.screenshot(path="testes/tela_fila_onibus.png")
    ctx.close()

    # --- Celular ---
    ctx2 = navegador.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    pag2 = ctx2.new_page()
    pag2.goto(URL)
    pag2.wait_for_timeout(4000)
    pag2.screenshot(path="testes/tela_celular_mapa.png")
    ctx2.close()

    navegador.close()

print("telas salvas em testes/")
