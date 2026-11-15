import { useEffect, useState } from 'react'

// No Render, VITE_API_HOST é preenchido pelo render.yaml (ex.: acolhe-api.onrender.com).
// Localmente, crie frontend/.env com VITE_API_HOST=localhost:8080 para testar com o backend.
const HOST = import.meta.env.VITE_API_HOST as string | undefined
export const API_URL = HOST ? (HOST.startsWith('http') ? HOST : `${HOST.startsWith('localhost') ? 'http' : 'https'}://${HOST}`) : ''

export default function ApiStatus() {
  const [st, setSt] = useState<'off' | 'acordando' | 'online' | 'erro'>(API_URL ? 'acordando' : 'off')
  useEffect(() => {
    if (!API_URL) return
    let vivo = true
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 90000) // plano gratuito pode levar ~1 min para acordar
    fetch(`${API_URL}/api/health`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => vivo && setSt('online'))
      .catch(() => vivo && setSt('erro'))
      .finally(() => clearTimeout(t))
    return () => { vivo = false; ctrl.abort() }
  }, [])
  if (st === 'off') return <span>Modo demonstração (sem servidor)</span>
  const txt = { acordando: 'API acordando… (até 1 min no plano gratuito)', online: 'API online', erro: 'API indisponível' }[st]
  return <span role="status"><span aria-hidden style={{ color: st === 'online' ? '#0E7A55' : st === 'erro' ? '#B42318' : '#9A5B00' }}>●</span> {txt}</span>
}
