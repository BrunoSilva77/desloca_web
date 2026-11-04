// =============================================================================
// COMPONENTE: TOAST (notificação flutuante)
// =============================================================================
// Banner que aparece temporariamente no canto superior direito com uma dica
// ou mensagem de feedback. Desaparece automaticamente após um tempo.
// =============================================================================

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number // em milisegundos, padrão 4000
  onClose?: () => void
}

export default function Toast({ message, duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      // Espera a animação de sair antes de notificar o pai
      setTimeout(() => onClose?.(), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div className="toast">
      <span className="toast-icone" aria-hidden="true">
        💡
      </span>
      <span className="toast-message">{message}</span>
    </div>
  )
}