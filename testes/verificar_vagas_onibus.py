# -*- coding: utf-8 -*-
"""
Verifica as vagas dos ônibus em volta do Terminal e o alinhamento do pin:

1. ônibus parados agrupados em volta do Terminal (poucos metros, na rua);
2. pino com a ponta na coordenada (sem deslocamento para fora da via);
3. na partida, o ônibus sai pelo trajeto e o emoji acompanha o rumo da rua;
4. zero erros de console.
"""
from playwright.sync_api import sync_playwright

TERMINAL = [-21.203169, -50.4385078]

JS_EMOJIS = """() =>
    [...document.querySelectorAll('.marcador-onibus-animado')]
        .map((el) => {
            const emoji = el.querySelector('.onibus-emoji')
            return (emoji && emoji.style.transform) || 'sem-giro'
        })
"""

JS_CENTROS = """() => {
    const termino = document.querySelector('.marcador-terminal')
    const t = termino.getBoundingClientRect()
    // Ponta do pin do Terminal = ponto (19, 46) na caixa de 38x38
    const cx = t.left + 19
    const cy = t.top + 46
    return {
        terminal: [cx, cy],
        onibus: [...document.querySelectorAll('.marcador-onibus-animado')]
            .map((el) => {
                const r = el.getBoundingClientRect()
                // Ponta do pin = ponto (17, 41) na caixa de 34x34 (iconAnchor)
                return [r.left + 17, r.top + 41]
            }),
    }
}
"""

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 900})
    erros = []
    pagina.on("pageerror", lambda e: erros.append(str(e)))
    pagina.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)

    pagina.goto("http://localhost:5173/mapa", wait_until="domcontentloaded")

    # Enquadra o Terminal de perto logo de cara (antes da 1ª partida, ~12s)
    pagina.wait_for_function("() => !!window.__mapaDesloca", timeout=10000)
    pagina.evaluate(
        """() => window.__mapaDesloca.setView([-21.203169, -50.4385078], 17,
           { animate: false })"""
    )
    pagina.wait_for_timeout(2500)

    # 1) PARADOS: distância das pontas dos pins até o Terminal (em px)
    c1 = pagina.evaluate(JS_CENTROS)
    dists = [
        round(((x - c1["terminal"][0]) ** 2 + (y - c1["terminal"][1]) ** 2) ** 0.5, 1)
        for x, y in c1["onibus"]
    ]
    # Vagas em fila: cada ônibus num ponto DISTINTO (não empilhados)
    separacoes = []
    for i in range(len(c1["onibus"])):
        for j in range(i + 1, len(c1["onibus"])):
            x1, y1 = c1["onibus"][i]
            x2, y2 = c1["onibus"][j]
            separacoes.append(round(((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5, 1))
    emojis_parados = pagina.evaluate(JS_EMOJIS)
    pagina.screenshot(path="testes/vaga-terminal-parados.png")

    # 2) ANDANDO: depois da 1ª partida (12s reais) — emoji deve girar
    pagina.wait_for_timeout(14000)
    emojis_andando = pagina.evaluate(JS_EMOJIS)
    pagina.screenshot(path="testes/onibus-saindo-da-vaga.png")

    giros_andando = [
        e for e in emojis_andando if e.startswith("rotate") and e != "rotate(45deg)"
    ]

    print(f"distancia das pontas ao terminal (px): {dists} (esperado 10 a 85)")
    print(f"separacao entre onibus (px): {separacoes} (esperado > 12)")
    print(f"emojis parados: {emojis_parados} (esperado rotate(45deg) em todos)")
    print(f"emojis girados com a rua: {len(giros_andando)}/{len(emojis_andando)}")
    print(f"erros de console: {erros if erros else 'nenhum'}")

    assert len(dists) == 4, f"esperava 4 onibus, achei {len(dists)}"
    assert all(10 < d < 85 for d in dists), f"onibus fora da fila do terminal: {dists}"
    assert all(s > 12 for s in separacoes), f"onibus empilhados na vaga: {separacoes}"
    assert all(e == "rotate(45deg)" for e in emojis_parados), (
        f"emoji de quem espera nao esta em pe: {emojis_parados}"
    )
    assert giros_andando, "nenhum onibus girou o emoji com o rumo da rua"
    assert not erros, f"erros de console: {erros}"

    navegador.close()
    print("\nVAGAS E ALINHAMENTO OK")
