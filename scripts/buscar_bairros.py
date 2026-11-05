# -*- coding: utf-8 -*-
"""
Busca os bairros reais de Aracatuba no banco do OpenStreetMap (Overpass API).
Cada bairro volta com nome e coordenada do centroide, que depois viram
waypoints das rotas simuladas de apresentacao.
Salva o resultado em scripts/bairros_aracatuba.json.
"""
import json
import urllib.parse
import urllib.request

CONSULTA = """[out:json][timeout:60];
area["name"="Araçatuba"]["admin_level"="8"]->.a;
(
  node["place"~"^(suburb|neighbourhood|quarter)$"](area.a);
  way["place"~"^(suburb|neighbourhood|quarter)$"](area.a);
);
out center tags 300;"""

req = urllib.request.Request(
    "https://overpass-api.de/api/interpreter",
    data=urllib.parse.urlencode({"data": CONSULTA}).encode("utf-8"),
    headers={"User-Agent": "desloca-projeto-academico/1.0"},
)
resposta = json.loads(urllib.request.urlopen(req, timeout=90).read())

bairros = []
for elemento in resposta["elements"]:
    tags = elemento.get("tags", {})
    nome = tags.get("name")
    if not nome:
        continue
    lat = elemento.get("lat") or elemento.get("center", {}).get("lat")
    lon = elemento.get("lon") or elemento.get("center", {}).get("lon")
    bairros.append(
        {"nome": nome, "tipo": tags.get("place"), "lat": lat, "lon": lon}
    )

bairros.sort(key=lambda b: b["nome"])
with open("scripts/bairros_aracatuba.json", "w", encoding="utf-8") as arquivo:
    json.dump(bairros, arquivo, ensure_ascii=False, indent=1)

print(f"{len(bairros)} bairros encontrados")
for bairro in bairros:
    print(f"  {bairro['nome']} | {bairro['tipo']} | {bairro['lat']}, {bairro['lon']}")
