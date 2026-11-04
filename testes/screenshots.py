# Script de teste visual: tira screenshot de cada página do Desloca
# O servidor já está rodando em localhost:5173 (iniciado antes deste script)
from playwright.sync_api import sync_playwright

# Lista das páginas para fotografar: (rota, nome do arquivo)
PAGINAS = [
    ("/", "inicio"),
    ("/mapa", "mapa"),
    ("/linhas", "linhas"),
    ("/acessibilidade", "acessibilidade"),
    ("/denuncias", "denuncias"),
    ("/dicas", "dicas"),
]

with sync_playwright() as p:
    # Abre o navegador em modo sem interface (headless)
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1366, "height": 900})

    for rota, nome in PAGINAS:
        pagina.goto(f"http://localhost:5173{rota}")
        # Espera a página terminar de carregar (JS + imagens + mapas)
        pagina.wait_for_load_state("networkidle")
        pagina.wait_for_timeout(1500)  # Tempo extra para o Leaflet desenhar o mapa
        pagina.screenshot(path=f"testes/{nome}.png", full_page=True)
        print(f"Screenshot salvo: testes/{nome}.png")

    navegador.close()
