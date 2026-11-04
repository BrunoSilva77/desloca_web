# Screenshot com nome único (evita cache de leitura de imagem) + checagem do conteúdo
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 850})

    # Desativa cache para garantir que pega o código mais novo
    contexto = navegador.new_context(viewport={"width": 1440, "height": 850}, bypass_csp=True)
    pg = contexto.new_page()
    pg.route("**/*", lambda route: route.continue_())
    pg.goto("http://localhost:5173/mapa", wait_until="networkidle")
    pg.wait_for_timeout(4000)

    # Confere o conteúdo antes de fotografar
    print("TITULO:", pg.title())
    print("TEM PAINEL:", pg.locator(".painel-filtros").count())
    print("TEM TELA-MAPA:", pg.locator(".tela-mapa").count())
    print("CLASSE DO MAPA:", pg.locator(".mapa").get_attribute("class"))

    nome = "testes/verificacao-final.png"
    pg.screenshot(path=nome)
    print("SALVO:", nome)

    navegador.close()
