# Screenshot da página do mapa (versão nova: tela cheia + painel flutuante)
import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 850})
    pagina.goto("http://localhost:5173/mapa")
    pagina.wait_for_load_state("networkidle")
    pagina.wait_for_timeout(4000)  # Espera o Leaflet carregar as ruas

    # Confere se o painel flutuante existe antes de fotografar
    tem_painel = pagina.locator(".painel-filtros").count()
    print("Painel flutuante encontrado:", tem_painel)

    arquivo = sys.argv[1] if len(sys.argv) > 1 else "testes/mapa-final.png"
    pagina.screenshot(path=arquivo)
    print("Screenshot salvo:", arquivo)

    navegador.close()
