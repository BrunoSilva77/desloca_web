# -*- coding: utf-8 -*-
"""
Gera as rotas SIMULADAS de apresentacao do Desloca.

Regras da simulacao (combinadas para o dia da apresentacao):
- TODOS os onibus saem do Terminal Urbano Nelson Reis Alves e voltam para ele;
- cada volta completa leva poucos minutos (tempo comprimido de proposito);
- as rotas passam por todos os bairros urbanos da cidade;
- no maximo 2 linhas passam por cada bairro (na pratica, cada bairro pertence
  a exatamente 1 linha - o Terminal fica na Vila Mendonca e serve de hub
  comum, por isso ficou de fora da contagem);
- as rotas passam pelos pontos importantes (shoppings, Havan, museus,
  estadio, parques, hospital, aeroporto...).

As coordenadas vêm de:
- scripts/bairros_aracatuba.json (busca no OpenStreetMap, ver buscar_bairros.py)
- scripts/pois_aracatuba.json (geocodificacao Nominatim, ver buscar_pois.py)

O caminho entre os pontos segue as RUAS de verdade (OSRM publico), e o
resultado e gravado em src/dados/trajetos.json, que o React consome.
"""
import json
import urllib.request

TERMINAL = [-21.203169, -50.4385078]  # Terminal Urbano Nelson Reis Alves

# -----------------------------------------------------------------------------
# Pontos de cada linha, na ordem em que o onibus vai passar.
# Formato: (nome do ponto, [lat, lng]) - o primeiro e sempre o Terminal e o
# ultimo tambem (fecha a volta).
# -----------------------------------------------------------------------------
ROTAS_APRESENTACAO = {
    # NORTE: corredor norte + extremo noroeste, com o Zoo no comeco
    "101": [
        ("Terminal Urbano", TERMINAL),
        ("Zoológico Municipal", [-21.1927439, -50.4434665]),
        ("Dona Amélia", [-21.1897831, -50.4434352]),
        ("Ipanema", [-21.1827411, -50.4446573]),
        ("Jardim Ipanema", [-21.1779351, -50.4480627]),
        ("São Rafael", [-21.1698568, -50.4561647]),
        ("Verde Parque", [-21.1688741, -50.4689268]),
        ("Residencial Águas Claras", [-21.1699658, -50.4709673]),
        ("Residencial Aimoré", [-21.1576987, -50.4895675]),
        ("Conj. Manoel Pires", [-21.1753784, -50.4552068]),
        ("Boa Vista", [-21.1955379, -50.4581962]),
        ("Jardim Presidente", [-21.1961563, -50.462858]),
        ("Jardim Brasil", [-21.1986335, -50.4548515]),
        ("Terminal Urbano", TERMINAL),
    ],
    # OESTE: zona oeste ate o Shopping e as chacaras do lado oeste
    "202": [
        ("Terminal Urbano", TERMINAL),
        ("Havan", [-21.202375, -50.4388966]),
        ("Amizade", [-21.1893018, -50.4545329]),
        ("Paraíso", [-21.187085, -50.4594938]),
        ("Roselê", [-21.1854043, -50.4639896]),
        ("Parque Industrial", [-21.1910027, -50.4635243]),
        ("Res. e Com. Carazza", [-21.1898626, -50.4675487]),
        ("Porto Real II", [-21.191059, -50.4748018]),
        ("São José", [-21.1951075, -50.4792008]),
        ("Conj. Mãe Divina", [-21.1939405, -50.4802952]),
        ("Residencial Beatriz", [-21.2012374, -50.4808852]),
        ("Chácaras Califórnia", [-21.216732, -50.4815419]),
        ("Shopping Araçatuba", [-21.211808, -50.4698304]),
        ("Vila Nova", [-21.2106256, -50.4584211]),
        ("Terminal Urbano", TERMINAL),
    ],
    # SUL: estadio, parques, hospital e a ponta sul da cidade
    "303": [
        ("Terminal Urbano", TERMINAL),
        ("São Vicente", [-21.2052095, -50.4460937]),
        ("Higienópolis", [-21.2139139, -50.448644]),
        ("Morumbi", [-21.217933, -50.4471491]),
        ("Estádio Adhemar de Barros", [-21.2177087, -50.444384]),
        ("Saudade", [-21.2248896, -50.443607]),
        ("Parque Ecológico Baguaçu", [-21.221445, -50.4286407]),
        ("Hospital Unimed", [-21.2299234, -50.4157484]),
        ("Unesp FOA", [-21.2511175, -50.4205161]),
        ("Avenida Brasília", [-21.2372456, -50.4391301]),
        ("Lago Azul", [-21.2360547, -50.4598228]),
        ("Terminal Urbano", TERMINAL),
    ],
    # CENTRO + LESTE + AEROPORTO: os pontos turisticos do centro e o corredor leste
    "404": [
        ("Terminal Urbano", TERMINAL),
        ("Praça do Relógio", [-21.203668, -50.4388623]),
        ("Catedral N. Sra. Aparecida", [-21.207057, -50.4384783]),
        ("Praça Rui Barbosa", [-21.206225, -50.4388758]),
        ("Museu de Artes Plásticas", [-21.2060816, -50.4416659]),
        ("Centro Cultural Ferroviário", [-21.2012436, -50.4381535]),
        ("Avenida dos Araçás", [-21.2024012, -50.4307352]),
        ("Água Branca", [-21.2086069, -50.3979255]),
        ("Aeroporto de Araçatuba", [-21.140815, -50.4251391]),
        ("Terminal Urbano", TERMINAL),
    ],
}


def rota_osrm(pontos):
    """Pede ao OSRM a rota em rua (ida) e, se falhar, divide em duas metades."""
    coords = ";".join(f"{lng},{lat}" for _, (lat, lng) in pontos)
    url = (
        "http://router.project-osrm.org/route/v1/driving/"
        f"{coords}?overview=full&geometries=geojson&steps=false"
    )
    try:
        with urllib.request.urlopen(url, timeout=60) as resposta:
            dados = json.loads(resposta.read())
        if dados.get("code") == "Ok":
            return dados["routes"][0], dados["waypoints"]
    except Exception as erro:  # servidor publico cai, tenta o caminho dividido
        print(f"    rota cheia falhou ({erro}), tentando em duas metades...")

    # Fallback: metade de ida + metade de volta, coladas
    meio = len(pontos) // 2
    trechos, waypoints = [], []
    for pedaco in (pontos[: meio + 1], pontos[meio:]):
        coords = ";".join(f"{lng},{lat}" for _, (lat, lng) in pedaco)
        url = (
            "http://router.project-osrm.org/route/v1/driving/"
            f"{coords}?overview=full&geometries=geojson&steps=false"
        )
        with urllib.request.urlopen(url, timeout=60) as resposta:
            dados = json.loads(resposta.read())
        if dados.get("code") != "Ok":
            raise RuntimeError(f"OSRM recusou o trecho: {dados.get('code')}")
        trechos.append(dados["routes"][0])
        waypoints.append(dados["waypoints"])
    return (
        {
            "distance": trechos[0]["distance"] + trechos[1]["distance"],
            "duration": trechos[0]["duration"] + trechos[1]["duration"],
            "geometry": {
                "coordinates": trechos[0]["geometry"]["coordinates"]
                + trechos[1]["geometry"]["coordinates"][1:]
            },
        },
        waypoints[0] + waypoints[1][1:],
    )


def montar_rota(codigo, pontos):
    """Monta uma entrada do trajetos.json para uma linha."""
    print(f"  linha {codigo}: {len(pontos) - 1} trechos...")
    rota, waypoints = rota_osrm(pontos)

    # GeoJSON do OSRM vem como [lng, lat]; o React usa [lat, lng]
    trajeto = [[lat, lng] for lng, lat in rota["geometry"]["coordinates"]]
    distancia_km = round(rota["distance"] / 1000, 1)

    # Tempo da volta NA SIMULACAO: comprimido de proposito para a demonstracao
    # (volta completa de poucos minutos, entre 3 e 8)
    duracao_volta_min = round(max(3, min(8, distancia_km * 0.3)), 1)

    # Paradas = pontos de apoio ja presos a rua (o OSRM 'snapa' na via mais
    # proxima); o terminal final fica de fora (e o mesmo do comeco)
    paradas = [[lat, lng] for lng, lat in (w["location"] for w in waypoints[:-1])]
    nomes = [nome for nome, _ in pontos[:-1]]

    print(
        f"    {distancia_km} km | volta simulada: {duracao_volta_min} min "
        f"| {len(paradas)} paradas"
    )
    return {
        "trajeto": trajeto,
        "paradas": paradas,
        "paradas_nomes": nomes,
        "distancia_km": distancia_km,
        "duracao_min": int(round(rota["duration"] / 60)),  # tempo real de carro
        "duracao_volta_min": duracao_volta_min,  # usado pela animacao
    }


def main():
    trajetos = {}
    for codigo, pontos in ROTAS_APRESENTACAO.items():
        trajetos[codigo] = montar_rota(codigo, pontos)

    with open("src/dados/trajetos.json", "w", encoding="utf-8") as arquivo:
        json.dump(trajetos, arquivo, ensure_ascii=False)

    total = sum(t["distancia_km"] for t in trajetos.values())
    print(f"\nOK: 4 rotas, {total} km no total, salvo em src/dados/trajetos.json")


if __name__ == "__main__":
    main()
