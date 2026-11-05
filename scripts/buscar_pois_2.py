# -*- coding: utf-8 -*-
"""
Segunda tentativa de geocodificacao dos POIs que falharam na primeira rodada,
com nomes alternativos. Junta o resultado ao scripts/pois_aracatuba.json.
"""
import json
import time
import urllib.parse
import urllib.request

CONSULTAS = [
    "Museu Marechal Rondon Araçatuba",
    "Santa Casa de Misericórdia Araçatuba",
    "Aeroporto de Araçatuba",
    "Aeroporto Adhemar de Barros Araçatuba",
    "Mercado Municipal Araçatuba",
    "Teatro Castro Alves Araçatuba",
    "Faculdade de Tecnologia de Araçatuba",
    "Faculdade de Odontologia de Araçatuba",
    "Hospital Araçatuba",
    "Hospital Regional Araçatuba",
    "Universidade Federal da Grande Fronteira Araçatuba",  # UFGF tem campus lá
    "Shopping Iguatemi Araçatuba",  # se existir outro shopping
    "Praça do Relógio Araçatuba",
    "Avenida dos Araçás Araçatuba",
]

FAIXA_LAT = (-21.26, -21.14)
FAIXA_LON = (-50.50, -50.38)
NOMINATIM = "https://nominatim.openstreetmap.org/search?"

caminho = "scripts/pois_aracatuba.json"
with open(caminho, encoding="utf-8") as arquivo:
    pois = json.load(arquivo)
ja_tem = {p["consulta"] for p in pois}

for consulta in CONSULTAS:
    parametros = urllib.parse.urlencode(
        {
            "q": consulta,
            "format": "json",
            "limit": 1,
            "viewbox": f"{FAIXA_LON[0]},{FAIXA_LAT[1]},{FAIXA_LON[1]},{FAIXA_LAT[0]}",
        }
    )
    requisicao = urllib.request.Request(
        NOMINATIM + parametros,
        headers={"User-Agent": "desloca-projeto-academico/1.0"},
    )
    try:
        resposta = json.loads(urllib.request.urlopen(requisicao, timeout=30).read())
    except Exception as erro:
        print(f"  ERRO {consulta}: {erro}")
        resposta = []
    if resposta:
        ponto = resposta[0]
        lat, lon = float(ponto["lat"]), float(ponto["lon"])
        dentro = (
            FAIXA_LAT[0] <= lat <= FAIXA_LAT[1]
            and FAIXA_LON[0] <= lon <= FAIXA_LON[1]
        )
        if dentro and consulta not in ja_tem:
            item = {
                "consulta": consulta,
                "nome": ponto.get("display_name", "").split(",")[0],
                "lat": lat,
                "lon": lon,
                "dentro_da_cidade": True,
            }
            pois.append(item)
            print(f"  [ok] {consulta} -> {lat}, {lon} ({item['nome']})")
        else:
            print(f"  [{'FORA' if not dentro else 'REPETIDO'}] {consulta} -> {lat}, {lon}")
    else:
        print(f"  [NADA] {consulta}")
    time.sleep(1.1)

with open(caminho, "w", encoding="utf-8") as arquivo:
    json.dump(pois, arquivo, ensure_ascii=False, indent=1)

print(f"\n{len(pois)} POIs no total")
