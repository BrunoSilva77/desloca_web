-- =============================================================================
-- BANCO DE DADOS DO PROJETO DESLOCA (MySQL)
-- =============================================================================
-- Este arquivo cria a estrutura de tabelas do sistema.
-- As tabelas guardam as informações PERMANENTES (linhas, pontos, veículos...).
-- A posição em tempo real dos ônibus NÃO fica aqui (fica na memória do servidor,
-- enviada por WebSocket, para não sobrecarregar o banco).
--
-- Como usar:
--   1. Abra o MySQL (ou phpMyAdmin / Workbench)
--   2. Crie o banco:  CREATE DATABASE desloca;
--   3. Execute este arquivo inteiro.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS desloca;
USE desloca;

-- -----------------------------------------------------------------------------
-- Tabela LINHAS: guarda cada linha de ônibus (ex.: "101 - Circular Centro")
-- -----------------------------------------------------------------------------
CREATE TABLE linhas (
    id          INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único da linha
    codigo      VARCHAR(10)  NOT NULL,          -- Código exibido (101, 202...)
    nome        VARCHAR(80)  NOT NULL,          -- Nome da linha
    cor         VARCHAR(7)   NOT NULL,          -- Cor no mapa (ex.: #1D1D1B)
    tarifa      VARCHAR(20)  NOT NULL,          -- Valor da passagem
    frequencia  VARCHAR(40)  NOT NULL,          -- Ex.: "a cada 10 minutos"
    status      ENUM('operacao','fora') DEFAULT 'operacao', -- Situação da linha
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Tabela PONTOS: paradas de ônibus (endereço e coordenadas no mapa)
-- -----------------------------------------------------------------------------
CREATE TABLE pontos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(80)   NOT NULL,         -- Nome do ponto
    endereco    VARCHAR(120),                   -- Rua / referência
    latitude    DECIMAL(10,8) NOT NULL,         -- Posição no mapa (eixo Y)
    longitude   DECIMAL(11,8) NOT NULL          -- Posição no mapa (eixo X)
);

-- -----------------------------------------------------------------------------
-- Tabela LINHA_PONTO: relação N:N entre linha e ponto (o itinerário)
-- "ordem" define em que posição o ônibus passa em cada parada.
-- -----------------------------------------------------------------------------
CREATE TABLE linha_ponto (
    linha_id    INT NOT NULL,
    ponto_id    INT NOT NULL,
    ordem       INT NOT NULL,                   -- Ordem de passagem (1, 2, 3...)
    PRIMARY KEY (linha_id, ponto_id),
    FOREIGN KEY (linha_id) REFERENCES linhas(id) ON DELETE CASCADE,
    FOREIGN KEY (ponto_id) REFERENCES pontos(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Tabela VEICULOS: ônibus cadastrados e sua situação atual
-- -----------------------------------------------------------------------------
CREATE TABLE veiculos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    linha_id    INT NOT NULL,                   -- A qual linha o veículo pertence
    placa       VARCHAR(10)  NOT NULL,          -- Placa do ônibus
    modelo      VARCHAR(60),                    -- Modelo/ano
    status      ENUM('operacao','fora','manutencao') DEFAULT 'operacao',
    ultima_lat  DECIMAL(10,8),                  -- Última posição conhecida
    ultima_lng  DECIMAL(11,8),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (linha_id) REFERENCES linhas(id)
);

-- -----------------------------------------------------------------------------
-- Tabela ALERTAS: avisos de trânsito, acidentes, obras e clima
-- -----------------------------------------------------------------------------
CREATE TABLE alertas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tipo        ENUM('transito','acidente','clima','obra') NOT NULL,
    titulo      VARCHAR(100) NOT NULL,
    descricao   TEXT,
    latitude    DECIMAL(10,8) NOT NULL,         -- Onde aconteceu
    longitude   DECIMAL(11,8) NOT NULL,
    horario     DATETIME NOT NULL,
    ativo       BOOLEAN DEFAULT TRUE,           -- Se continua aparecendo no mapa
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Tabela DENUNCIAS: o que os usuários reportaram pelo formulário
-- -----------------------------------------------------------------------------
CREATE TABLE denuncias (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tipo        ENUM('buraco','iluminacao','ponto','onibus') NOT NULL,
    local       VARCHAR(120) NOT NULL,          -- Onde é o problema
    descricao   TEXT,                           -- Detalhe opcional
    status      ENUM('aberta','analise','resolvida') DEFAULT 'aberta',
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Tabela USUARIOS: cadastro de quem usa o sistema (se houver login)
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(80)  NOT NULL,
    email       VARCHAR(120) NOT NULL UNIQUE,   -- UNIQUE: e-mail não pode repetir
    senha_hash  VARCHAR(255) NOT NULL,          -- Senha criptografada (bcrypt)
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- DADOS DE EXEMPLO (seed) para testar o sistema sem digitar tudo na mão
-- -----------------------------------------------------------------------------
INSERT INTO linhas (codigo, nome, cor, tarifa, frequencia) VALUES
('101', 'Circular Centro',        '#1D1D1B', 'R$ 5,00', 'a cada 10 minutos'),
('202', 'Vila Mineira - Centro',  '#C9A882', 'R$ 5,00', 'a cada 20 minutos'),
('303', 'Aeroporto - Terminal',   '#4F7A5A', 'R$ 6,50', 'a cada 30 minutos'),
('404', 'Circular Zona Norte',    '#8C6A4F', 'R$ 5,00', 'a cada 25 minutos');

INSERT INTO pontos (nome, endereco, latitude, longitude) VALUES
('Terminal Central',   'Praça Central',            -21.2087, -50.4347),
('Praça da Bandeira',  'Av. Bandeirantes',         -21.2160, -50.4280),
('Rodoviária',         'Rua das Flores',           -21.2220, -50.4220),
('Hospital Regional',  'Av. Saudade',              -21.2040, -50.4370),
('Vila Mineira',       'Rua Vila Mineira',         -21.1950, -50.4450);
