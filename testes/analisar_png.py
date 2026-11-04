# Analisa o screenshot por pixels (sem depender da leitura visual de imagem)
# Confere se o layout é o do MAPA (mapa + painel branco à direita)
from PIL import Image

img = Image.open("testes/diagnostico.png").convert("RGB")
largura, altura = img.size
print("Tamanho:", largura, "x", altura)

# Regiões a amostrar: (nome, x, y)
pontos = [
    ("topo-esquerda (mapa/ruas)", 300, 150),
    ("centro (mapa)", 600, 400),
    ("direita-topo (painel branco)", 1250, 120),
    ("direita-meio (painel)", 1250, 300),
    ("base-esquerda (mapa)", 200, 700),
]

for nome, x, y in pontos:
    if x < largura and y < altura:
        cor = img.getpixel((x, y))
        print(f"{nome}: RGB{cor}")

# O painel flutuante fica entre x=1110 e x=1424 (330px + margem 16px)
# Se for branco/creme em toda essa faixa, o painel está no lugar
faixa = [img.getpixel((x, 200)) for x in range(1120, 1420, 30)]
brancos = sum(1 for r, g, b in faixa if r > 240 and g > 240 and b > 235)
print(f"Pontos claros na faixa do painel: {brancos}/{len(faixa)}")

# Amostra o meio do mapa (deve ter cores variadas de rua/vegetacao)
meio = [img.getpixel((x, y)) for x in range(300, 900, 60) for y in range(200, 700, 100)]
cores_unicas = len(set(meio))
print(f"Cores diferentes no meio do mapa: {cores_unicas} (mapa real tem muitas)")
