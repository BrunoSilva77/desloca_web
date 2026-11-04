# Diagnóstico: fotografa e imprime os estilos reais dos elementos na MESMA execução
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 850})
    pagina.goto("http://localhost:5173/mapa", wait_until="networkidle")
    pagina.wait_for_timeout(4000)

    # Imprime informações que provam qual versão está rodando
    info = pagina.evaluate(
        """() => {
        const mapa = document.querySelector('.mapa');
        const painel = document.querySelector('.painel-filtros');
        const tela = document.querySelector('.tela-mapa');
        const body = getComputedStyle(document.body);
        return {
            classeMapa: mapa ? mapa.className : 'NAO EXISTE',
            altMapa: mapa ? mapa.offsetHeight : 0,
            temPainel: !!painel,
            larguraPainel: painel ? painel.offsetWidth : 0,
            temTelaCheia: !!tela,
            alturaTela: tela ? tela.offsetHeight : 0,
            fundoBody: body.backgroundColor,
            fonteBody: body.fontFamily,
            totalFolhasCSS: document.styleSheets.length,
        };
    }"""
    )

    for chave, valor in info.items():
        print(f"{chave}: {valor}")

    # Fotografa apenas a área do mapa (prova visual do layout)
    if info["temTelaCheia"]:
        pagina.screenshot(path="testes/diagnostico.png")
        print("Screenshot: testes/diagnostico.png")

    navegador.close()
