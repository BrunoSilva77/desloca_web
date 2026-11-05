// =============================================================================
// ARQUIVO DE DADOS SIMULADOS (mock)
// =============================================================================
// Enquanto não temos banco de dados conectado, usamos estes dados fixos aqui.
// No futuro, este conteúdo virá do backend (banco MySQL + API REST).
//
// Os TRAJETOS das linhas vêm do arquivo trajetos.json, que foi gerado pela
// API pública do OSRM (scripts/gerar_rotas_apresentacao.py). Assim o caminho do
// ônibus segue as ruas de verdade, em vez de linhas retas atravessando quarteirões.
// IMPORTANTE: são rotas SIMULADAS para a apresentação — todas saem do Terminal
// Urbano Nelson Reis Alves, passam por bairros e pontos importantes da cidade
// e voltam ao terminal (volta completa de poucos minutos na animação).
// =============================================================================

// Importa os trajetos gerados (formato: { "101": { trajeto: [...], ... } })
import trajetos from './trajetos.json'

// Tipo (formato) de uma linha de ônibus.
// "type" serve para o TypeScript garantir que nada errado seja cadastrado.
export type Linha = {
  id: number
  codigo: string // Ex.: "101"
  nome: string // Ex.: "Circular Centro"
  cor: string // Cor usada para desenhar a linha no mapa
  tarifa: string // Valor da passagem
  frequencia: string // Ex.: "a cada 15 minutos"
  status: 'operacao' | 'fora' // Se está rodando ou não
  trajeto: [number, number][] // Lista de coordenadas [latitude, longitude] do caminho
  pontos: { nome: string; coords: [number, number] }[] // Paradas da linha
  duracaoVoltaMin: number // Duração da volta completa na simulação (minutos)
  proximoOnibus: {
    placa: string
    posicao: [number, number] // Onde o ônibus está agora
    lotacao: 'vazio' | 'medio' | 'cheio' // Ocupação estimada
    previsao: string // Tempo estimado até o próximo ponto
  }
}

// Coordenadas centrais de Araçatuba - SP (usadas como base do mapa)
export const CENTRO_ARACATUBA: [number, number] = [-21.2087, -50.4347]

// -----------------------------------------------------------------------------
// Monta a lista de linhas juntando as informações manuais (abaixo) com o
// trajeto real vindo do OSRM.
// -----------------------------------------------------------------------------
// Informações cadastrais de cada linha (o que muda pouco).
// As 4 linhas saem do Terminal e juntas cobrem todos os bairros urbanos,
// com no máximo 2 linhas por bairro (na prática, cada bairro pertence a 1).
const CADASTRO = [
  {
    id: 1,
    codigo: '101',
    nome: 'Circular Norte',
    cor: '#1D1D1B',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 10 minutos',
    status: 'operacao' as const,
    proximoOnibus: {
      placa: 'ABC-1D23',
      lotacao: 'medio' as const,
      previsao: '6 min',
    },
  },
  {
    id: 2,
    codigo: '202',
    nome: 'Circular Oeste',
    cor: '#C9A882',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 12 minutos',
    status: 'operacao' as const,
    proximoOnibus: {
      placa: 'EFG-4H56',
      lotacao: 'cheio' as const,
      previsao: '4 min',
    },
  },
  {
    id: 3,
    codigo: '303',
    nome: 'Circular Sul',
    cor: '#4F7A5A',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 15 minutos',
    status: 'operacao' as const,
    proximoOnibus: {
      placa: 'IJK-7L89',
      lotacao: 'medio' as const,
      previsao: '9 min',
    },
  },
  {
    id: 4,
    codigo: '404',
    nome: 'Centro e Aeroporto',
    cor: '#8C6A4F',
    tarifa: 'R$ 6,50',
    frequencia: 'a cada 15 minutos',
    status: 'operacao' as const,
    proximoOnibus: {
      placa: 'MNO-0P12',
      lotacao: 'vazio' as const,
      previsao: '7 min',
    },
  },
]

// Tipo do conteúdo do trajetos.json (para o TypeScript não reclamar)
type TrajetosJson = Record<
  string,
  {
    trajeto: [number, number][]
    paradas: [number, number][]
    paradas_nomes?: string[]
    distancia_km: number
    duracao_min: number
    duracao_volta_min: number
  }
>

// Junta tudo: cadastro + trajeto real do OSRM
export const LINHAS: Linha[] = CADASTRO.map((linha) => {
  // Busca o trajeto gerado para o código desta linha
  // (o "as unknown as" converte o JSON importado para o formato esperado)
  const rota = (trajetos as unknown as TrajetosJson)[linha.codigo]

  return {
    id: linha.id,
    codigo: linha.codigo,
    nome: linha.nome,
    cor: linha.cor,
    tarifa: linha.tarifa,
    frequencia: linha.frequencia,
    status: linha.status,
    // Se não existir trajeto gerado, fica vazio (a tela trata isso)
    trajeto: rota?.trajeto ?? [],
    // Paradas da rota com o nome real do ponto (vem do gerador de rotas)
    pontos: (rota?.paradas ?? []).map((coords, indice) => ({
      nome: rota?.paradas_nomes?.[indice] ?? `Ponto ${indice + 1}`,
      coords,
    })),
    // Duração da volta completa na simulação (usada pela animação do mapa)
    duracaoVoltaMin: rota?.duracao_volta_min ?? 6,
    proximoOnibus: {
      placa: linha.proximoOnibus.placa,
      // Ônibus começa NO TERMINAL: a simulação o faz sair e dar a volta
      posicao: rota?.trajeto[0] ?? [-21.203169, -50.4385078],
      lotacao: linha.proximoOnibus.lotacao,
      previsao: linha.proximoOnibus.previsao,
    },
  }
})

// -----------------------------------------------------------------------------
// Alertas de trânsito e ocorrências (também simulados)
// -----------------------------------------------------------------------------
export type Alerta = {
  id: number
  tipo: 'transito' | 'acidente' | 'clima' | 'obra'
  titulo: string
  descricao: string
  coords: [number, number]
  horario: string
}

export const ALERTAS: Alerta[] = [
  {
    id: 1,
    tipo: 'transito',
    titulo: 'Trânsito intenso na Av. dos Araçás',
    descricao: 'Congestionamento devido à alta movimentação no horário de pico.',
    coords: [-21.2024, -50.4307], // Av. dos Araçás (linha 404)
    horario: '08:10',
  },
  {
    id: 2,
    tipo: 'acidente',
    titulo: 'Colisão entre dois veículos',
    descricao: 'Faixa direita bloqueada. Ônibus desviando pela rua paralela.',
    coords: [-21.2179, -50.4471], // Morumbi (linha 303)
    horario: '07:45',
  },
  {
    id: 3,
    tipo: 'obra',
    titulo: 'Reforma no ponto em frente ao Shopping',
    descricao: 'Ponto temporariamente deslocado para a entrada principal.',
    coords: [-21.2118, -50.4698], // Shopping Araçatuba (linha 202)
    horario: 'Ontem',
  },
  {
    id: 4,
    tipo: 'clima',
    titulo: 'Chuva forte prevista para a tarde',
    descricao: 'Possível atraso nas linhas a partir das 14h.',
    coords: [-21.2032, -50.4385], // Terminal Urbano (ponto de partida)
    horario: '12:00',
  },
]

// -----------------------------------------------------------------------------
// Dados de acessibilidade (rotas adaptadas) - simulados
// -----------------------------------------------------------------------------
export const ROTAS_ACESSIVEIS = [
  {
    id: 1,
    origem: 'Terminal Urbano',
    destino: 'Hospital Unimed',
    detalhes: 'Com calçada acessível, sem degraus e com semáforo sonoro.',
    tempo: '18 min',
  },
  {
    id: 2,
    origem: 'Shopping Araçatuba',
    destino: 'Parque Ecológico Baguaçu',
    detalhes: 'Rota com elevador na passarela e piso tátil em todo o trajeto.',
    tempo: '25 min',
  },
]
