# Teste do mapa: libera a localização do usuário (fingindo estar no centro de
# Araçatuba) e fotografa o resultado com o aviso do ponto mais próximo.
from playwright.sync_api import sync_playwright

# Coordenadas falsas usadas no teste (centro de Araçatuba)
LAT, LNG = -21.2087, -50.4347

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)

    # Cria o contexto PERMITINDO geolocalização (senão o navegador nega)
    contexto = navegador.new_context(
        viewport={"width": 1440, "height": 850},
        geolocation={"latitude": LAT, "longitude": LNG},
        permissions=["geolocation"],  # Libera a permissão automaticamente
    )
    pagina = contexto.new_page()
    pagina.goto("http://localhost:5173/mapa", wait_until="networkidle")
    pagina.wait_for_timeout(4000)

    # Confere se os elementos novos existem
    print("Logo no cabecalho:", pagina.locator(".marca-logo").count())
    print("Botao todas as linhas:", pagina.locator(".filtro-todas").count())
    print("Aviso ponto proximo:", pagina.locator(".aviso-proximo").count())

    # Mostra o texto do aviso de ponto mais próximo
    if pagina.locator(".aviso-proximo").count() > 0:
        print("TEXTO AVISO:", pagina.locator(".aviso-proximo").inner_text())

    pagina.screenshot(path="testes/mapa-localizacao.png")
    print("Screenshot: testes/mapa-localizacao.png")

    navegador.close()
