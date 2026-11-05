# Sincroniza a descricao do PR #1 (ja merged) no GitHub.
# O PR #1 e o da equipe ("juncao da branch inicial com a branch Main");
# como o trabalho todo foi mergeado por ele, a descricao documenta o conteudo.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\atualizar_pr.ps1
$saida = "host=github.com`nprotocol=https`n" | git credential fill 2>$null
$token = ($saida | Where-Object { $_ -like 'password=*' }) -replace 'password=',''
if (-not $token) {
  Write-Output 'CREDENCIAL_NAO_ENCONTRADA'
  exit 1
}

$headers = @{
  Authorization = "Bearer $token"
  Accept        = 'application/vnd.github+json'
  'User-Agent'  = 'desloca-pr'
}

$corpo = @'
Prototipo navegavel do Desloca (Fatec Aracatuba) - simulacao de apresentacao completa.

### Mapa de apresentacao (simulacao)
- **4 linhas simuladas** saindo do Terminal Urbano Nelson Reis Alves, cobrindo todos os bairros urbanos (max. 2 linhas/bairro) e pontos importantes (Shoppings, Havan, Museu da Cidade, Aeroporto)
- **Trajetos reais das ruas** gerados via OSRM (`scripts/gerar_rotas_apresentacao.py` -> `src/dados/trajetos.json`)
- **Relogio simulado acelerado** (14:18, 10x mais rapido) com chip no topo do mapa
- **Horarios fixos de partida**: 101 as 14:20, 202 as 14:25, 303 as 14:30, 404 as 14:35, repetindo a cada 20 min simulados; fora da janela o onibus espera na vaga do Terminal
- **Rotas pontilhadas** (bolinhas) com ou sem linha selecionada e **onibus 50% mais lentos** (`FATOR_LENTIDAO = 1.5`)
- **Tiles Esri World Street Map** (visual tipo Google Maps, sem chave de API)

### Outros
- Novo Inicio com hero de mapa desfocado ao vivo
- Auditoria de responsividade (375px e 768px) e correcoes de painel/cabecalho
- Notificacoes centralizadas, dicas contextuais e menu responsivo
- Diagrama de arquitetura (`docs/diagrama-arquitetura.md`), `FERRAMENTAS.md`, `TAREFAS.md` com rotina Git (Conventional Commits em portugues)

### Verificacao
- `npm run build`: 0 erros de TypeScript
- Playwright (`testes/verificar_rotas_apresentacao.py`): partidas detectadas em 12/42/72/102s reais (14:20/14:25/14:30/14:35), 4/4 onibus parando na vaga, 4/4 rotas pontilhadas, relogio 14:18->14:44, 52 tiles Esri em HTTP 200, 0 erros de console
'@

$dados = @{
  title = 'juncao da branch inicial com a branch Main'
  body  = $corpo
} | ConvertTo-Json -Depth 4
$utf8 = [System.Text.Encoding]::UTF8.GetBytes($dados)

try {
  $pr = Invoke-RestMethod `
    -Uri 'https://api.github.com/repos/BrunoSilva77/desloca_web/pulls/1' `
    -Method Patch `
    -Headers $headers `
    -Body $utf8 `
    -ContentType 'application/json; charset=utf-8'
  Write-Output ('PR atualizado: ' + $pr.html_url)
  Write-Output ('titulo: ' + $pr.title)
  Write-Output ('estado: ' + $pr.state + ' | merged: ' + $pr.merged)
}
catch {
  $erro = $_
  Write-Output ('ERRO: ' + $erro.Exception.Message)
  if ($erro.ErrorDetails -and $erro.ErrorDetails.Message) {
    Write-Output ('DETALHE: ' + $erro.ErrorDetails.Message)
  }
  exit 1
}
