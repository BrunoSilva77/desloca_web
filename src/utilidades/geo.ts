// =============================================================================
// UTILIDADES DE GEOLOCALIZAÇÃO
// =============================================================================
// Funções de cálculo de distância e tempo entre dois pontos no mapa.
// Usadas para mostrar ao usuário qual ponto de ônibus está mais perto dele.
// =============================================================================

// Converte graus (medida de mapa) para radianos (medida usada em fórmulas)
function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180
}

// -----------------------------------------------------------------------------
// Distância em linha reta entre dois pontos, em quilômetros.
// Fórmula de Haversine: calcula a distância real sobre a superfície da Terra.
// -----------------------------------------------------------------------------
export function distanciaKm(
  pontoA: [number, number],
  pontoB: [number, number]
): number {
  const raioTerraKm = 6371 // Raio médio da Terra

  const diferencaLat = paraRadianos(pontoB[0] - pontoA[0])
  const diferencaLng = paraRadianos(pontoB[1] - pontoA[1])

  const lat1 = paraRadianos(pontoA[0])
  const lat2 = paraRadianos(pontoB[0])

  // Termo intermediário da fórmula de Haversine
  const a =
    Math.sin(diferencaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(diferencaLng / 2) ** 2

  const angulo = 2 * Math.asin(Math.sqrt(a))
  return raioTerraKm * angulo
}

// -----------------------------------------------------------------------------
// Tempo estimado de CAMINHADA até o ponto, em minutos.
// Velocidade média de uma pessoa andando: 4,5 km/h.
// -----------------------------------------------------------------------------
export function tempoCaminhadaMin(distanciaEmKm: number): number {
  const velocidadeCaminhadaKmH = 4.5
  const minutos = (distanciaEmKm / velocidadeCaminhadaKmH) * 60
  // No mínimo 1 minuto (evita exibir "0 min")
  return Math.max(1, Math.round(minutos))
}

// Formata a distância para exibição: menos de 1 km vira em metros
export function formatarDistancia(distanciaEmKm: number): string {
  if (distanciaEmKm < 1) {
    return `${Math.round(distanciaEmKm * 1000)} m`
  }
  return `${distanciaEmKm.toFixed(1)} km`
}
