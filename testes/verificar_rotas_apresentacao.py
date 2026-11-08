# -*- coding: utf-8 -*-
"""
Verifica a simulação de apresentação do mapa (tudo por medidas reais,
pois a leitura de imagem do ambiente está imprevisível):

1. tiles do Esri World Street Map (visual tipo Google Maps, sem chave);
2. marcador do Terminal sempre presente;
3. ônibus presentes, saindo EM HORÁRIOS DIFERENTES (relógio simulado
   acelerado: 101 sai às 14:20, 202 às 14:25, 303 às 14:30, 404 às 14:35)
   — cada ônibus anda, para na vaga do Terminal e volta a sair;
4. chip do relógio simulado no topo do mapa e avançando;
5. as 4 rotas desenhadas por padrão, SEMPRE pontilhadas (com ou sem linha
   ativa) e sem pontos de parada (só linha ativa);
6. pontos de parada aparecem ao selecionar uma linha;
7. zero erros de console na página do mapa e na home.

A amostragem dura ~165s (relógio corre 10x: 1 min simulado = 6s reais),
cobre as 4 primeiras partidas e parte das segundas voltas.
"""
import re
import time

from playwright.sync_api import sync_playwright

JS_POSICOES = """() =>
    [...document.querySelectorAll('.marcador-onibus-animado')]
        .map((el) => el.style.transform)
"""

JS_RELOGIO = """() =>
    (document.querySelector('.relogio-simulado b') || {}).textContent || ''
"""

# Intervalo entre amostras (ms) e quantidade: 30 x 6s = 180s de observação
# (cobre as 4 primeiras partidas, as dos 2ºs veículos no +10 min simulado
#  e parte das segundas voltas)
INTERVALO_MS = 6000
AMOSTRAS = 30

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)

    # ---------------------------------------------------------------- MAPA
    pagina = navegador.new_page(viewport={"width": 1440, "height": 900})
    erros = []
    pagina.on("pageerror", lambda e: erros.append(str(e)))
    pagina.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)

    # Status HTTP dos tiles do Esri (falha de rede aparece como 4xx/5xx)
    status_tiles = []
    pagina.on(
        "response",
        lambda r: status_tiles.append(r.status) if "arcgisonline.com" in r.url else None,
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
    # Todas as rotas devem ser pontilhadas (com ou sem linha selecionada)
    dash_rotas = pagina.evaluate(
        """() => [...document.querySelectorAll('.leaflet-overlay-pane path')]
              .map((p) => p.getAttribute('stroke-dasharray'))"""
    )

    # ------------------------------------------------ AMOSTRAGEM DA SIMULAÇÃO
    # Posições + relógio a cada 6s: dá para detectar quem andou, quem ficou
    # parado na vaga e em que momento cada linha começou a se mover
    historico = []  # lista de (hora_real, [transforms...], texto_relogio)
    inicio_amostragem = time.monotonic()
    for _ in range(AMOSTRAS):
        historico.append(
            (
                time.monotonic() - inicio_amostragem,
                pagina.evaluate(JS_POSICOES),
                pagina.evaluate(JS_RELOGIO),
            )
        )
        pagina.wait_for_timeout(INTERVALO_MS)

    # Para cada ônibus: instantes em que a posição mudou (andando) e amostras
    # em que ficou parado na mesma coordenada (vaga do Terminal)
    tempos_primeira_movimentacao = []
    total_paradas = 0
    for indice in range(len(historico[0][1])):
        mudou_em = []
        parado_desde_inicio = 0
        for k in range(1, len(historico)):
            anterior = historico[k - 1][1][indice]
            atual = historico[k][1][indice]
            if atual and atual != anterior:
                mudou_em.append(historico[k][0])
            elif anterior == atual:
                parado_desde_inicio += 1
        if mudou_em:
            tempos_primeira_movimentacao.append(mudou_em[0])
        total_paradas += 1 if parado_desde_inicio >= 2 else 0
        print(
            f"  onibus #{indice}: andou {len(mudou_em)}x | "
            f"primeiro movimento aos {mudou_em[0]:.0f}s"
            if mudou_em
            else f"  onibus #{indice}: NUNCA andou"
        )
        assert mudou_em, f"onibus #{indice} nao andou durante {len(historico)} amostras"
        assert parado_desde_inicio >= 2, (
            f"onibus #{indice} nunca ficou parado na vaga do Terminal"
        )

    # Partidas escalonadas: o 1º ônibus a andar deve sair bem antes do último
    atraso_entre_partidas = (
        max(tempos_primeira_movimentacao) - min(tempos_primeira_movimentacao)
    )

    relogio1 = historico[0][2]
    relogio2 = historico[-1][2]
    relogio_ok = bool(re.fullmatch(r"\d{2}:\d{2}", relogio1 or "")) and relogio1 != relogio2

    # Seleciona a linha 1: aí os pontos de parada dela devem aparecer
    pagina.evaluate(
        "() => window.__selecionarLinhaDesloca "
        "&& window.__selecionarLinhaDesloca(1)"
    )
    pagina.wait_for_timeout(900)
    n_pontos_ativa = pagina.evaluate(
        "() => document.querySelectorAll('.marcador-ponto').length"
    )
    dash_ativa = pagina.evaluate(
        """() => [...document.querySelectorAll('.leaflet-overlay-pane path')]
              .map((p) => p.getAttribute('stroke-dasharray'))"""
    )

    tiles_esri = all("arcgisonline.com" in src for src in tiles) and bool(tiles)
    tiles_http_ok = bool(status_tiles) and all(s == 200 for s in status_tiles)

    print(f"tiles Esri: {tiles_esri} | http 200: {tiles_http_ok} "
          f"({len(status_tiles)} tiles) | exemplo: {tiles[:1]}")
    print(f"onibus no mapa: {n_onibus} (esperado 8)")
    print(f"terminal visivel: {tem_terminal}")
    print(f"rotas desenhadas (paths SVG): {n_rotas} (esperado >= 4)")
    print(f"rotas pontilhadas: {sum(1 for d in dash_rotas if d)}/{len(dash_rotas)}")
    print(f"pontos de parada no padrao: {n_pontos_padrao} (esperado 0)")
    print(f"onibus que ficaram parados na vaga: {total_paradas}/8")
    print(f"atraso entre a 1a e a ultima partida: {atraso_entre_partidas:.0f}s "
          f"(esperado >= 60s)")
    print(f"relogio simulado: {relogio1} -> {relogio2} (deve avancar)")
    print(f"pontos apos selecionar linha 1: {n_pontos_ativa} (esperado 13)")
    print(f"erros de console (mapa): {erros if erros else 'nenhum'}")

    assert tiles_esri, "tiles nao sao do Esri World Street Map"
    assert tiles_http_ok, f"tiles do Esri fora de 200: {status_tiles[:5]}"
    assert n_onibus == 8, f"esperava 8 onibus, achei {n_onibus}"
    assert tem_terminal, "marcador do Terminal ausente"
    assert n_rotas >= 4, f"esperava >= 4 rotas, achei {n_rotas}"
    assert n_pontos_padrao == 0, "pontos de parada aparecem sem linha ativa"
    assert dash_rotas and all(d for d in dash_rotas), "alguma rota nao esta pontilhada"
    assert total_paradas == 8, "nem todos os onibus aguardaram na vaga do Terminal"
    assert atraso_entre_partidas >= 60, (
        f"partidas muito juntas ({atraso_entre_partidas:.0f}s entre a 1a e a ultima)"
    )
    assert relogio_ok, f"chip do relogio nao avanca: {relogio1!r} -> {relogio2!r}"
    assert n_pontos_ativa > 0, "pontos nao apareceram com linha selecionada"
    assert dash_ativa and all(d for d in dash_ativa), (
        "linha selecionada deixou de ser pontilhada"
    )
    assert not erros, f"erros de console: {erros}"
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
    esri_home = all("arcgisonline.com" in src for src in tiles_home) and bool(tiles_home)
    print(f"home: tiles Esri {esri_home} | onibus no hero: {onibus_home}")
    print(f"erros de console (home): {erros2 if erros2 else 'nenhum'}")
    assert esri_home, "home nao esta com tiles do Esri"
    assert onibus_home == 8, "hero sem os 8 onibus"
    assert not erros2, f"erros de console na home: {erros2}"

    navegador.close()
    print("\nTODAS AS VERIFICACOES PASSARAM")
