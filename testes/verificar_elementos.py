# Verificação objetiva: mede posições e estilos dos elementos novos.
# Não depende de leitura de imagem.
from playwright.sync_api import sync_playwright

LAT, LNG = -21.2087, -50.4347

with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    contexto = navegador.new_context(
        viewport={"width": 1440, "height": 850},
        geolocation={"latitude": LAT, "longitude": LNG},
        permissions=["geolocation"],
    )
    pagina = contexto.new_page()
    pagina.goto("http://localhost:5173/mapa", wait_until="networkidle")
    pagina.wait_for_timeout(4000)

    resultado = pagina.evaluate(
        """() => {
        const pegar = (sel) => document.querySelector(sel);
        const logo = pegar('.marca-logo');
        const mapa = pegar('.mapa');
        const painel = pegar('.painel-filtros');
        const aviso = pegar('.aviso-proximo');
        const todas = pegar('.filtro-todas');
        const usuario = pegar('.leaflet-marker-icon[src*=""], .mapa div[style*="2563EB"]');
        const caixa = (el) => el ? el.getBoundingClientRect() : null;

        return {
            logoSrc: logo ? logo.getAttribute('src') : 'AUSENTE',
            logoAltura: logo ? logo.offsetHeight : 0,
            mapaTelaCheia: mapa ? mapa.offsetHeight : 0,
            painelLado: painel ? Math.round(painel.getBoundingClientRect().right) : 0,
            painelLargura: painel ? painel.offsetWidth : 0,
            avisoTexto: aviso ? aviso.innerText.replace(/\\n/g, ' | ') : 'AUSENTE',
            avisoPosicao: aviso ? getComputedStyle(aviso).position : '',
            botaoTodas: todas ? todas.innerText.replace(/\\n/g, ' | ') : 'AUSENTE',
            totalLinhasFiltro: document.querySelectorAll('.filtro-linha').length,
        };
    }"""
    )

    for chave, valor in resultado.items():
        print(f"{chave}: {valor}")

    navegador.close()
