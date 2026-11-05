# -*- coding: utf-8 -*-
"""
Verifica a simulação de apresentação do mapa (tudo por medidas reais,
pois a leitura de imagem do ambiente está imprevisível):

1. tiles do CARTO (Positron) no lugar do OSM poluído;
2. marcador do Terminal sempre presente;
3. ônibus presentes E ANDANDO (posição muda entre duas amostras de 4s);
4. as 4 rotas desenhadas por padrão, sem pontos de parada (só linha ativa);
5. pontos de parada aparecem ao selecionar uma linha;
6. zero erros de console na página do mapa e na home.
"""
from playwright.sync_api import sync_playwright

JS_POSICOES = """() =>
    [...document.querySelectorAll('.marcador-onibus-animado')]
        .map((el) => el.style.transform)
"""

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)

    # ---------------------------------------------------------------- MAPA
    pagina = navegador.new_page(viewport={"width": 1440, "height": 900})
    erros = []
    pagina.on("pageerror", lambda e: erros.append(str(e)))
    pagina.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)

    # Status HTTP dos tiles do CARTO: chave inválida devolve 401/403
    status_carto = []
    pagina.on(
        "response",
        lambda r: status_carto.append(r.status) if "rastertiles" in r.url else None,
    )

    pagina.goto("http://localhost:5173/mapa")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(1500)

    tiles = pagina.evaluate(
        """() => [...document.querySelectorAll('.leaflet-tile')]
              .map((t) => t.src).filter(Boolean).slice(0, 3)"""
    )
    n_onibus = pagina.evaluate(
        "() => document.querySelectorAll('.marcador-onibus-animado').length"
    )
    tem_terminal = pagina.evaluate(
        "() => !!document.querySelector('.marcador-terminal')"
    )
    n_rotas = pagina.evaluate(
        "() => document.querySelectorAll('.leaflet-overlay-pane path').length"
    )
    n_pontos_padrao = pagina.evaluate(
        "() => document.querySelectorAll('.marcador-ponto').length"
    )

    # Amostra 1 e 2 das posições dos ônibus (4 segundos de diferença)
    amostra1 = pagina.evaluate(JS_POSICOES)
    pagina.wait_for_timeout(4000)
    amostra2 = pagina.evaluate(JS_POSICOES)
    andaram = sum(1 for a, b in zip(amostra1, amostra2) if a != b)

    # Seleciona a linha 1: aí os pontos de parada dela devem aparecer
    pagina.evaluate(
        "() => window.__selecionarLinhaDesloca "
        "&& window.__selecionarLinhaDesloca(1)"
    )
    pagina.wait_for_timeout(900)
    n_pontos_ativa = pagina.evaluate(
        "() => document.querySelectorAll('.marcador-ponto').length"
    )

    carto_ok = all("cartocdn.com" in src and "key=" in src for src in tiles) and bool(tiles)
    carto_http_ok = bool(status_carto) and all(s == 200 for s in status_carto)

    print(f"tiles CARTO: {carto_ok} | http 200: {carto_http_ok} "
          f"({len(status_carto)} tiles) | exemplo: {tiles[:1]}")
    print(f"onibus no mapa: {n_onibus} (esperado 4)")
    print(f"terminal visivel: {tem_terminal}")
    print(f"rotas desenhadas (paths SVG): {n_rotas} (esperado >= 4)")
    print(f"pontos de parada no padrao: {n_pontos_padrao} (esperado 0)")
    print(f"onibus que andaram em 4s: {andaram}/{len(amostra1)} (esperado >= 1)")
    print(f"pontos apos selecionar linha 1: {n_pontos_ativa} (esperado 13)")
    print(f"erros de console (mapa): {erros if erros else 'nenhum'}")

    assert carto_ok, "tiles nao sao do CARTO com chave"
    assert carto_http_ok, f"tiles do CARTO fora de 200: {status_carto[:5]}"
    assert n_onibus == 4, f"esperava 4 onibus, achei {n_onibus}"
    assert tem_terminal, "marcador do Terminal ausente"
    assert n_rotas >= 4, f"esperava >= 4 rotas, achei {n_rotas}"
    assert n_pontos_padrao == 0, "pontos de parada aparecem sem linha ativa"
    assert andaram >= 1, "nenhum onibus andou em 4 segundos"
    assert n_pontos_ativa > 0, "pontos nao apareceram com linha selecionada"
    assert not erros, f"erros de console: {erros}"

    # Espera todas as partidas escalonadas (25s entre cada ônibus) e confirma
    # que os 4 veículos estão andando de fato
    pagina.wait_for_timeout(80000)
    amostra3 = pagina.evaluate(JS_POSICOES)
    andaram_todos = sum(1 for a, b in zip(amostra2, amostra3) if a != b)
    print(f"onibus andando apos 80s: {andaram_todos}/{len(amostra3)} (esperado 4)")
    assert andaram_todos == 4, "nem todos os onibus andaram apos as saidas"
    pagina.close()

    # ----------------------------------------------------------------- HOME
    pagina2 = navegador.new_page(viewport={"width": 1440, "height": 900})
    erros2 = []
    pagina2.on("pageerror", lambda e: erros2.append(str(e)))
    pagina2.on("console", lambda m: erros2.append(m.text) if m.type == "error" else None)
    pagina2.goto("http://localhost:5173/")
    pagina2.wait_for_load_state("networkidle")
    pagina2.wait_for_timeout(2500)

    tiles_home = pagina2.evaluate(
        """() => [...document.querySelectorAll('.inicio-hero-mapa .leaflet-tile')]
              .map((t) => t.src).filter(Boolean).slice(0, 2)"""
    )
    onibus_home = pagina2.evaluate(
        "() => document.querySelectorAll('.inicio-hero-mapa .marcador-onibus-animado').length"
    )
    carto_home = (
        all("cartocdn.com" in src and "key=" in src for src in tiles_home)
        and bool(tiles_home)
    )
    print(f"home: tiles CARTO {carto_home} | onibus no hero: {onibus_home}")
    print(f"erros de console (home): {erros2 if erros2 else 'nenhum'}")
    assert carto_home, "home nao esta com tiles do CARTO"
    assert onibus_home == 4, "hero sem os 4 onibus"
    assert not erros2, f"erros de console na home: {erros2}"

    navegador.close()
    print("\nTODAS AS VERIFICACOES PASSARAM")
