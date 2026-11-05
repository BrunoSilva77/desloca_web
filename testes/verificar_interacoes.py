from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://localhost:5173/mapa')
    page.wait_for_timeout(1000)
    page.click('.botao-toggle-painel-mobile')
    page.wait_for_timeout(500)
    
    top_pos = page.evaluate("() => document.querySelector('.painel-linhas-integrado').getBoundingClientRect().top")
    print('Painel recolhido top:', top_pos)
    page.screenshot(path='testes/mobile-painel-recolhido.png')
    browser.close()

