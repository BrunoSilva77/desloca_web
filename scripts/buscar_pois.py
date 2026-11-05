# -*- coding: utf-8 -*-
"""
Geocodifica os pontos importantes de Aracatuba (POIs) usando o Nominatim
do OpenStreetMap. Respeita o limite de 1 requisicao por segundo.
Saida: scripts/pois_aracatuba.json (apenas pontos dentro da area urbana).
"""
import json
import time
import urllib.parse
import urllib.request

# Consultas: o que a apresentacao precisa mostrar passando nas rotas
CONSULTAS = [
    "Terminal Urbano Nelson Reis Alves, Araçatuba",
    "Shopping Araçatuba, Araçatuba",
    "Havan Araçatuba, Araçatuba",
    "Museu Histórico Marechal Cândido Rondon, Araçatuba",
    "Museu Araçatubense de Artes Plásticas, Araçatuba",
    "Santa Casa de Misericórdia de Araçatuba",
    "Aeroporto Estadual Adhemar de Barros, Araçatuba",
    "Parque Ecológico Baguaçu, Araçatuba",
    "Zoológico Municipal Dr. Flávio Leite Ribeiro, Araçatuba",
    "Estádio Municipal Adhemar de Barros, Araçatuba",
    "Mercado Municipal de Araçatuba",
    "Praça Rui Barbosa, Araçatuba",
    "Teatro Municipal Castro Alves, Araçatuba",
    "Centro Cultural Ferroviário, Araçatuba",
    "Fatec Araçatuba",
    "Universidade Estadual Paulista Júlio de Mesquita Filho Araçatuba",
    "Catedral Nossa Senhora Aparecida, Araçatuba",
    "Avenida Brasília, Araçatuba",
]

# Área urbana de Araçatuba (margem de segurança)
FAIXA_LAT = (-21.26, -21.14)
FAIXA_LON = (-50.50, -50.38)

NOMINATIM = "https://nominatim.openstreetmap.org/search?"


def geocodificar(consulta: str):
    parametros = urllib.parse.urlencode(
        {
            "q": consulta,
            "format": "json",
            "limit": 1,
            "viewbox": f"{FAIXA_LON[0]},{FAIXA_LAT[1]},{FAIXA_LON[1]},{FAIXA_LAT[0]}",
            "bounded": 0,
        }
    )
    requisicao = urllib.request.Request(
        NOMINATIM + parametros,
        headers={"User-Agent": "desloca-projeto-academico/1.0"},
    )
    resposta = json.loads(urllib.request.urlopen(requisicao, timeout=30).read())
    if not resposta:
        return None
    ponto = resposta[0]
    lat, lon = float(ponto["lat"]), float(ponto["lon"])
    dentro = FAIXA_LAT[0] <= lat <= FAIXA_LAT[1] and FAIXA_LON[0] <= lon <= FAIXA_LON[1]
    return {
        "consulta": consulta,
        "nome": ponto.get("display_name", "").split(",")[0],
        "lat": lat,
        "lon": lon,
        "dentro_da_cidade": dentro,
    }


pois = []
for consulta in CONSULTAS:
    try:
        ponto = geocodificar(consulta)
    except Exception as erro:  # rede instavel nao pode derrubar tudo
        print(f"  ERRO {consulta}: {erro}")
        ponto = None
    if ponto:
        marca = "ok" if ponto["dentro_da_cidade"] else "FORA"
        print(f"  [{marca}] {consulta} -> {ponto['lat']}, {ponto['lon']}")
        pois.append(ponto)
    else:
        print(f"  [NADA] {consulta}")
    time.sleep(1.1)  # limite do Nominatim

with open("scripts/pois_aracatuba.json", "w", encoding="utf-8") as arquivo:
    json.dump(pois, arquivo, ensure_ascii=False, indent=1)

print(f"\n{len(pois)} POIs salvos em scripts/pois_aracatuba.json")
