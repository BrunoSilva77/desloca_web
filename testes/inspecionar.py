# Inspeciona o que está realmente sendo renderizado na página do mapa
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 850})
    pagina.goto("http://localhost:5173/mapa")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(2000)

    print("URL:", pagina.url)
    print("--- TEXTO DA PAGINA ---")
    print(pagina.inner_text("body")[:800])
    print("--- HTML RAIZ ---")
    print(pagina.evaluate("document.getElementById('root').innerHTML.slice(0,500)"))

    navegador.close()
