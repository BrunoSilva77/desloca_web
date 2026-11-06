# -*- coding: utf-8 -*-
"""
Recorta a logo oficial (uploads/logoDesloca.jpeg) para o formato do
wordmark "Desloca" e deixa o fundo branco transparente.

Gera src/assets/logo-marca.png, usado no cabeçalho e no menu mobile.
"""
from PIL import Image

ORIGEM = "uploads/logoDesloca.jpeg"
DESTINO = "src/assets/logo-marca.png"

imagem = Image.open(ORIGEM).convert("RGBA")
largura, altura = imagem.size
pixels = imagem.load()

# Máscara do que NÃO é fundo (fundo é branco/quinase branco)
def eh_fundo(r: int, g: int, b: int) -> bool:
    return r >= 245 and g >= 245 and b >= 245


# 1) Caixa mínima que contém a logo inteira
min_x, min_y, max_x, max_y = largura, altura, 0, 0
for y in range(altura):
    for x in range(largura):
        r, g, b, _ = pixels[x, y]
        if not eh_fundo(r, g, b):
            if x < min_x:
                min_x = x
            if x > max_x:
                max_x = x
            if y < min_y:
                min_y = y
            if y > max_y:
                max_y = y

# 2) Folga em volta da logo (4% do maior lado) para não ficar "colado"
folga = int(max(largura, altura) * 0.04)
min_x = max(0, min_x - folga)
min_y = max(0, min_y - folga)
max_x = min(largura - 1, max_x + folga)
max_y = min(altura - 1, max_y + folga)

recorte = imagem.crop((min_x, min_y, max_x + 1, max_y + 1))

# 3) Fundo branco vira transparente (serve no cabeçalho branco e no menu)
px = recorte.load()
w, h = recorte.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if eh_fundo(r, g, b):
            px[x, y] = (r, g, b, 0)

recorte.save(DESTINO)
print(f"logo gerada: {DESTINO} ({recorte.size[0]}x{recorte.size[1]})")
print(f"recorte de origem: x {min_x}-{max_x} | y {min_y}-{max_y}")
