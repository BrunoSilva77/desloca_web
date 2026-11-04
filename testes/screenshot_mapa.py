# Screenshot apenas da página do mapa (versão nova: tela cheia + painel flutuante)
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 850})
    pagina.goto("http://localhost:5173/mapa")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(2500)  # Tempo para o Leaflet carregar as ruas
    pagina.screenshot(path="testes/mapa-novo.png")
    print("Screenshot salvo: testes/mapa-novo.png")
    navegador.close()
