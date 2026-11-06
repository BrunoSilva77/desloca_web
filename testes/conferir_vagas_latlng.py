# -*- coding: utf-8 -*-
"""Lê os LatLng reais das vagas (Leaflet) e compara com o trajeto."""
import json
import math

from playwright.sync_api import sync_playwright

TERMINAL = [-21.203169, -50.4385078]

JS_VAGAS = """() => {
    const pontos = []
    window.__mapaDesloca.eachLayer((l) => {
        if (l.getLatLng && l.options && l.options.icon
            && l.getElement()
            && l.getElement().classList.contains('marcador-onibus-animado')) {
            const ll = l.getLatLng()
            pontos.push([ll.lat, ll.lng])
        }
    })
    return pontos
}"""


def hav(a, b):
    r = 6371000
    dla = (b[0] - a[0]) * math.pi / 180
    dlo = (b[1] - a[1]) * math.pi / 180
    la1 = a[0] * math.pi / 180
    la2 = b[0] * math.pi / 180
    h = math.sin(dla / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlo / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


with sync_playwright() as p:
    navegador = p.chromium.launch(headless=True)
    pagina = navegador.new_page(viewport={"width": 1440, "height": 900})
    pagina.goto("http://localhost:5173/mapa", wait_until="domcontentloaded")
    pagina.wait_for_function("() => !!window.__mapaDesloca", timeout=10000)
    pagina.wait_for_timeout(800)

    pontos = pagina.evaluate(JS_VAGAS)
    print(f"onibus encontrados: {len(pontos)}")
    for i, pt in enumerate(pontos):
        d = hav(TERMINAL, pt)
        rumo = math.degrees(
            math.atan2((pt[1] - TERMINAL[1]) * math.cos(math.radians(TERMINAL[0])),
                       pt[0] - TERMINAL[0])
        ) % 360
        print(f"  onibus {i}: {pt[0]:.6f},{pt[1]:.6f} | {d:.1f}m do terminal | rumo {rumo:.0f} graus")
    navegador.close()
