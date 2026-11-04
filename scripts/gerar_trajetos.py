# -*- coding: utf-8 -*-
"""
Gera os trajetos das linhas de onibus alinhados as ruas reais de Aracatuba.
Usa a API publica do OSRM (mesma tecnica do projeto KickIRL): a rota passa a
seguir as ruas de verdade, em vez de linhas retas atravessando quarteiroes.
O resultado e gravado em src/dados/trajetos.json, que o projeto usa depois.
"""
import json
import urllib.request

# Ponto central de Aracatuba - SP
# Waypoints de cada linha: [lat, lng] no inicio, meio e fim do percurso
LINHAS = {
    "101": [
        [-21.2087, -50.4347],  # Terminal Central (centro)
        [-21.2160, -50.4280],  # Praca da Bandeira
        [-21.2220, -50.4220],  # Rodoviaria
    ],
    "202": [
        [-21.1950, -50.4450],  # Vila Mineira
        [-21.2040, -50.4370],  # Hospital Regional
        [-21.2087, -50.4347],  # Terminal Central
        [-21.2130, -50.4320],  # Mercado Municipal
    ],
    "303": [
        [-21.2300, -50.4100],  # Aeroporto
        [-21.2250, -50.4170],
        [-21.2190, -50.4250],  # Zona Sul
        [-21.2130, -50.4320],
        [-21.2087, -50.4347],  # Terminal Central
    ],
    "404": [
        [-21.1900, -50.4350],  # Zona Norte
        [-21.2000, -50.4250],  # Shopping
        [-21.2050, -50.4200],  # Escola Tecnica
    ],
}

# URL do servidor publico do OSRM (gratuito, sem chave de API)
BASE = "http://router.project-osrm.org/route/v1/driving/"

saida = {}

for codigo, pontos in LINHAS.items():
    # O OSRM recebe as coordenadas no formato lng,lat separados por ponto e virgula
    coordenadas = ";".join(f"{lng},{lat}" for lat, lng in pontos)
    url = f"{BASE}{coordenadas}?overview=full&geometries=geojson"

    print(f"Consultando linha {codigo}...")
    with urllib.request.urlopen(url, timeout=30) as resposta:
        dados = json.load(resposta)

    if dados.get("code") != "Ok":
        print(f"  ERRO na linha {codigo}: {dados.get('code')}")
        continue

    rota = dados["routes"][0]
    # A geometria vem no formato [lng, lat]; invertemos para [lat, lng]
    # (mesmo formato usado pelo Leaflet)
    geometria = [[lat, lng] for lng, lat in rota["geometry"]["coordinates"]]

    # Escolhe pontos da rota para servir de paradas de onibus.
    # Como estao dentro da rota, garantem que o ponto cai na rua.
    total = len(geometria)
    indices = sorted({0, total // 4, total // 2, (3 * total) // 4, total - 1})
    paradas = [geometria[i] for i in indices]

    saida[codigo] = {
        "trajeto": geometria,
        "paradas": paradas,
        "distancia_km": round(rota["distance"] / 1000, 1),
        "duracao_min": round(rota["duration"] / 60),
    }
    print(f"  OK: {len(geometria)} pontos, {saida[codigo]['distancia_km']} km")

# Grava o arquivo que o projeto vai importar
with open("src/dados/trajetos.json", "w", encoding="utf-8") as arquivo:
    json.dump(saida, arquivo, ensure_ascii=False)

print("\nArquivo src/dados/trajetos.json gerado com sucesso!")
