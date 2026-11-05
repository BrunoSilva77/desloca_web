# =============================================================================
# GERADOR DO DIAGRAMA DE ARQUITETURA EM IMAGEM
# =============================================================================
# Renderiza o código Mermaid do docs/diagrama-arquitetura.md dentro de um
# navegador e salva como PNG pronto para o PowerPoint.
#
# Uso:  python testes/gerar_diagrama.py
# Saída: docs/diagrama-arquitetura.png
# =============================================================================

import pathlib
import re

from playwright.sync_api import sync_playwright

# Pasta raiz do projeto (sobe uma vez a partir de testes/)
RAIZ = pathlib.Path(__file__).resolve().parent.parent

# Biblioteca Mermaid baixada para fora do projeto (evita o Vite assistir o arquivo)
MERMAID_JS = pathlib.Path(r"C:\Users\User\AppData\Local\Temp\opencode\desloca\mermaid.min.js")

# Cores oficiais do logo Desloca
PRETO = "#1D1D1B"
BEGE = "#C9A882"
CREME = "#FAF8F4"


def extrair_diagramas(conteudo_md: str) -> list[str]:
    """Pega todos os blocos ```mermaid do arquivo Markdown."""
    return re.findall(r"```mermaid\n(.*?)```", conteudo_md, re.DOTALL)


def montar_html(codigo_mermaid: str) -> str:
    """Cria a página HTML que vai ser fotografada."""
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<script src="{MERMAID_JS.as_uri()}"></script>
<style>
  :root {{ --preto: {PRETO}; --bege: {BEGE}; --creme: {CREME}; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    padding: 36px 40px;
    background: {CREME};
    font-family: 'Segoe UI', Arial, sans-serif;
    color: {PRETO};
    width: max-content;
  }}
  h1 {{
    font-size: 26px;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
  }}
  .sub {{
    font-size: 14px;
    color: #6b6b69;
    margin: 0 0 22px;
  }}
  .sub b {{ color: {PRETO}; }}
  .legenda {{
    display: flex;
    gap: 22px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 2px solid {BEGE};
    font-size: 13px;
    flex-wrap: wrap;
  }}
  .legenda span {{ display: flex; align-items: center; gap: 8px; }}
  /* Largura automática: acompanha o tamanho real do SVG do Mermaid */
  #pagina {{ width: max-content; max-width: none; }}
  .quad {{
    width: 16px; height: 16px; border-radius: 4px;
    border: 2px solid {PRETO}; background: {CREME};
  }}
  .quad.tracejado {{ border-style: dashed; border-color: #8A8A88; background: #fff; }}
  .quad.bege {{ border-color: {BEGE}; background: #F1E7DA; }}
  .quad.preto {{ background: {PRETO}; }}
  #diagrama {{ background: #fff; border: 1px solid #e4e0da; border-radius: 12px; padding: 18px; }}
</style>
</head>
<body>
 <div id="pagina">
  <h1>Desloca — Diagrama de Arquitetura Técnica</h1>
  <p class="sub">Fatec Araçatuba · Análise e Desenvolvimento de Sistemas ·
     <b>Etapa de construção (05/11)</b></p>
  <div id="diagrama"><pre class="mermaid">{codigo_mermaid}</pre></div>
  <div class="legenda">
    <span><i class="quad"></i> Já implementado</span>
    <span><i class="quad tracejado"></i> Planejado (back-end + banco)</span>
    <span><i class="quad bege"></i> Serviço externo gratuito</span>
    <span><i class="quad preto"></i> Usuário final</span>
  </div>
 </div>
  <script>
    mermaid.initialize({{
      startOnLoad: true,
      theme: 'base',
      themeVariables: {{
        primaryColor: '{CREME}',
        primaryTextColor: '{PRETO}',
        primaryBorderColor: '{PRETO}',
        lineColor: '#8A8A88',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        fontSize: '17px',
        headingFontSize: '19px'
      }},
      flowchart: {{ curve: 'basis', padding: 14, nodeSpacing: 55, rankSpacing: 65, useMaxWidth: false }}
    }});
  </script>
</body>
</html>
"""


def principal() -> None:
    md = (RAIZ / "docs" / "diagrama-arquitetura.md").read_text(encoding="utf-8")
    diagramas = extrair_diagramas(md)
    print(f"Diagramas encontrados no Markdown: {len(diagramas)}")

    if not diagramas:
        raise SystemExit("Nenhum bloco ```mermaid encontrado.")

    html = montar_html(diagramas[0])  # Primeiro diagrama = arquitetura final
    arquivo_html = pathlib.Path(r"C:\Users\User\AppData\Local\Temp\opencode\desloca\diagrama.html")
    arquivo_html.write_text(html, encoding="utf-8")

    with sync_playwright() as p:
        navegador = p.chromium.launch(headless=True)
        pagina = navegador.new_page(viewport={"width": 1720, "height": 1200}, device_scale_factor=2)
        pagina.goto(arquivo_html.as_uri(), wait_until="networkidle")
        # Espera o Mermaid terminar de desenhar o SVG
        pagina.wait_for_selector("#diagrama svg", timeout=30000)
        pagina.wait_for_timeout(1500)

        destino = RAIZ / "docs" / "diagrama-arquitetura.png"
        # Fotografa só o conteúdo (sem espaço vazio da viewport)
        pagina.locator("#pagina").screenshot(path=str(destino))
        navegador.close()

    tamanho = destino.stat().st_size / 1024
    print(f"Imagem salva: {destino} ({tamanho:.0f} kB)")


if __name__ == "__main__":
    principal()
