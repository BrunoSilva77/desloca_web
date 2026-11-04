# =============================================================================
# TESTE DE INTEGRAÇÃO PÓS-MERGE
# =============================================================================
# Abre todas as páginas do protótipo e verifica se renderizam sem erro.
# Foco nas páginas novas da equipe: /indice-movida e /acessibilidade.
# =============================================================================

from playwright.sync_api import sync_playwright

# Todas as rotas do site com o que cada uma deve conter
PAGINAS = [
    ("/", "Desloca"),
    ("/mapa", "Filtrar linhas"),
    ("/linhas", "Linhas"),
    ("/acessibilidade", "Acessibilidade"),
    ("/denuncias", "Denúncias"),
    ("/dicas", "Dicas"),
    ("/indice-movida", "MOVIDA"),
]

LAT, LNG = -21.2087, -50.4347


def principal() -> None:
    with sync_playwright() as p:
        navegador = p.chromium.launch(headless=True)
        contexto = navegador.new_context(
            viewport={"width": 1440, "height": 900},
            geolocation={"latitude": LAT, "longitude": LNG},
            permissions=["geolocation"],
        )
        pagina = contexto.new_page()

        # Guarda qualquer erro de JavaScript do console
        erros: list[str] = []
        pagina.on("pageerror", lambda erro: erros.append(str(erro)))

        for rota, esperado in PAGINAS:
            erros.clear()
            pagina.goto(f"http://localhost:5173{rota}", wait_until="networkidle")
            pagina.wait_for_timeout(1200)

            corpo = pagina.inner_text("body")
            contem = esperado.lower() in corpo.lower()

            # Confere se o link novo aparece no cabeçalho
            tem_link = True
            if rota == "/":
                tem_link = "Índice MOVIDA" in corpo

            situacao = "OK " if (contem and not erros and tem_link) else "ERRO"
            detalhe = ""
            if not contem:
                detalhe += f" | texto '{esperado}' ausente"
            if erros:
                detalhe += f" | {len(erros)} erro(s) JS: {erros[0][:80]}"
            if not tem_link:
                detalhe += " | link 'Índice MOVIDA' ausente no cabeçalho"

            print(f"[{situacao}] {rota:18} {detalhe}")

            # Fotografa as duas páginas novas da equipe
            if rota in ("/indice-movida", "/acessibilidade"):
                nome = rota.strip("/").replace("-", "_")
                pagina.screenshot(path=f"testes/pos_merge_{nome}.png", full_page=True)

        navegador.close()


if __name__ == "__main__":
    principal()
