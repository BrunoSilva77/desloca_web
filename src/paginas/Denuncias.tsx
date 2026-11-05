// =============================================================================
// PÁGINA DE DENÚNCIAS (INTEGRADA AO MAPA)
// =============================================================================
// Redireciona para o Mapa abrindo diretamente o modal popup de denúncia.
// =============================================================================

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Denuncias() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/mapa?acao=denuncia', { replace: true })
  }, [navigate])

  return null
}
