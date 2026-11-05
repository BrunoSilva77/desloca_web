// =============================================================================
// RELÓGIO DA SIMULAÇÃO (apresentação)
// =============================================================================
// Tempo fictício da demonstração: começa às 14:18 e corre 10x mais rápido que
// o relógio real (1 minuto simulado a cada 6 segundos reais).
//
// Os ônibus consultam ESTE relógio para respeitar os horários de partida fixos
// de cada linha (ex.: 101 sai às 14:20, depois a cada 20 minutos simulados).
// O painel do mapa mostra o mesmo relógio, então o que se vê bate com o
// horário indicado na tela.
// =============================================================================

// Início do relógio simulado, em minutos desde a meia-noite (14:18)
export const INICIO_RELOGIO_MIN = 14 * 60 + 18

// Quão mais rápido que o real o relógio corre (10 = 1 min simulado = 6s reais)
export const RAZAO_SIMULACAO = 10

// Marco único criado no carregamento do app — painel e mapa compartilham
// o mesmo relógio, então o horário exibido é sempre o das partidas
const MARCO_INICIAL = Date.now()

// Minutos simulados decorridos desde o início (ex.: 862 = 14:22)
export function minutosSimulados(): number {
  const reaisDecorridos = (Date.now() - MARCO_INICIAL) / 60000
  return INICIO_RELOGIO_MIN + reaisDecorridos * RAZAO_SIMULACAO
}

// Formata como "14:23" (aceita minutos opcionais; senão usa o agora)
export function formatarRelogio(minutos?: number): string {
  const total = Math.floor(minutos ?? minutosSimulados())
  const hora = Math.floor(total / 60) % 24
  const minuto = ((total % 60) + 60) % 60
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`
}

// Próxima partida de uma linha: horário fixo (primeira) + intervalo em
// minutos simulados. Se estiver exatamente na hora, devolve a própria hora.
export function proximaPartida(primeiraPartida: number, intervalo: number): number {
  const agora = minutosSimulados()
  if (agora <= primeiraPartida) return primeiraPartida
  const decorridas = Math.ceil((agora - primeiraPartida) / intervalo)
  return primeiraPartida + decorridas * intervalo
}

// Minutos desde a última partida da linha (0 = acabou de sair).
// Retorna null quando a linha ainda nem teve a primeira partida.
export function desdeUltimaPartida(primeiraPartida: number, intervalo: number): number | null {
  const agora = minutosSimulados()
  if (agora < primeiraPartida) return null
  return (agora - primeiraPartida) % intervalo
}
