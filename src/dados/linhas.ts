// =============================================================================
// ARQUIVO DE DADOS SIMULADOS (mock)
// =============================================================================
// Enquanto não temos banco de dados conectado, usamos estes dados fixos aqui.
// No futuro, este conteúdo virá do backend (banco MySQL + API REST).
//
// Os TRAJETOS das linhas vêm do arquivo trajetos.json, que foi gerado pela
// API pública do OSRM (scripts/gerar_trajetos.py). Assim o caminho do ônibus
// segue as ruas de verdade, em vez de linhas retas atravessando quarteirões.
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
// Informações cadastrais de cada linha (o que muda pouco)
const CADASTRO = [
  {
    id: 1,
    codigo: '101',
    nome: 'Circular Centro',
    cor: '#1D1D1B',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 10 minutos',
    status: 'operacao' as const,
    nomesPontos: [
      'Terminal Central',
      'Av. Bandeirantes',
      'Praça da Bandeira',
      'Av. dos Estados',
      'Rodoviária',
    ],
    proximoOnibus: {
      placa: 'ABC-1D23',
      lotacao: 'medio' as const,
      previsao: '4 min',
    },
  },
  {
    id: 2,
    codigo: '202',
    nome: 'Vila Mineira - Centro',
    cor: '#C9A882',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 20 minutos',
    status: 'operacao' as const,
    nomesPontos: [
      'Vila Mineira',
      'Jardim Bandeirantes',
      'Hospital Regional',
      'Mercado Municipal',
      'Terminal Central',
    ],
    proximoOnibus: {
      placa: 'EFG-4H56',
      lotacao: 'cheio' as const,
      previsao: '11 min',
    },
  },
  {
    id: 3,
    codigo: '303',
    nome: 'Aeroporto - Terminal',
    cor: '#4F7A5A',
    tarifa: 'R$ 6,50',
    frequencia: 'a cada 30 minutos',
    status: 'operacao' as const,
    nomesPontos: [
      'Aeroporto',
      'Zona Sul',
      'Av. Odorindo Perenha',
      'Centro',
      'Terminal Central',
    ],
    proximoOnibus: {
      placa: 'IJK-7L89',
      lotacao: 'vazio' as const,
      previsao: '18 min',
    },
  },
  {
    id: 4,
    codigo: '404',
    nome: 'Circular Zona Norte',
    cor: '#8C6A4F',
    tarifa: 'R$ 5,00',
    frequencia: 'a cada 25 minutos',
    status: 'fora' as const, // Linha fora de operação (exibe aviso no mapa)
    nomesPontos: ['Zona Norte', 'Jardim Brasil', 'Shopping', 'Escola Técnica', 'Parque Industrial'],
    proximoOnibus: {
      placa: 'MNO-0P12',
      lotacao: 'vazio' as const,
      previsao: '—',
    },
  },
]

// Tipo do conteúdo do trajetos.json (para o TypeScript não reclamar)
type TrajetosJson = Record<
  string,
  {
    trajeto: [number, number][]
    paradas: [number, number][]
    distancia_km: number
    duracao_min: number
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
    // Cria os pontos usando as coordenadas das paradas do trajeto real
    pontos: (rota?.paradas ?? []).map((coords, indice) => ({
      nome: linha.nomesPontos[indice] ?? `Ponto ${indice + 1}`,
      coords,
    })),
    proximoOnibus: {
      placa: linha.proximoOnibus.placa,
      // Coloca o ônibus no meio do trajeto (posição simulada)
      posicao: rota?.trajeto[Math.floor((rota?.trajeto.length ?? 0) / 2)] ?? [-21.2087, -50.4347],
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
    titulo: 'Trânsito intenso na Av. Bandeirantes',
    descricao: 'Congestionamento devido à alta movimentação no horário de pico.',
    coords: [-21.216, -50.428],
    horario: '08:10',
  },
  {
    id: 2,
    tipo: 'acidente',
    titulo: 'Colisão entre dois veículos',
    descricao: 'Faixa direita bloqueada. Ônibus desviando pela rua paralela.',
    coords: [-21.222, -50.422],
    horario: '07:45',
  },
  {
    id: 3,
    tipo: 'obra',
    titulo: 'Reforma no ponto da Rodoviária',
    descricao: 'Ponto temporariamente deslocado para em frente ao mercado.',
    coords: [-21.204, -50.437],
    horario: 'Ontem',
  },
  {
    id: 4,
    tipo: 'clima',
    titulo: 'Chuva forte prevista para a tarde',
    descricao: 'Possível atraso nas linhas a partir das 14h.',
    coords: [-21.2087, -50.4347],
    horario: '12:00',
  },
]

// -----------------------------------------------------------------------------
// Dados de acessibilidade (rotas adaptadas) - simulados
// -----------------------------------------------------------------------------
export const ROTAS_ACESSIVEIS = [
  {
    id: 1,
    origem: 'Terminal Central',
    destino: 'Hospital Regional',
    detalhes: 'Com calçada acessível, sem degraus e com semáforo sonoro.',
    tempo: '18 min',
  },
  {
    id: 2,
    origem: 'Vila Mineira',
    destino: 'Praça da Bandeira',
    detalhes: 'Rota com elevador na passarela e piso tátil em todo o trajeto.',
    tempo: '25 min',
  },
]
