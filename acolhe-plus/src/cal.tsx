// Gera links para adicionar compromissos ao Google Agenda e ao Teams/Outlook, e arquivo .ics
export interface CalItem { titulo: string; data: string; hora: string; local?: string; detalhes?: string; minutos?: number }

function partes(c: CalItem) {
  const m = c.hora.match(/(\d{1,2})h(\d{2})?/)
  const h = m ? Number(m[1]) : 9, mi = m && m[2] ? Number(m[2]) : 0
  const ini = new Date(`${c.data}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:00`)
  const fim = new Date(ini.getTime() + (c.minutos ?? 60) * 60000)
  return { ini, fim }
}
const p2 = (n: number) => String(n).padStart(2, '0')
const local = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:00`
const compacto = (d: Date) => local(d).replace(/[-:]/g, '')

export function googleUrl(c: CalItem) {
  const { ini, fim } = partes(c)
  const q = new URLSearchParams({ action: 'TEMPLATE', text: c.titulo, dates: `${compacto(ini)}/${compacto(fim)}`, details: c.detalhes ?? '', location: c.local ?? '', ctz: 'America/Bahia' })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
export function outlookUrl(c: CalItem) {
  const { ini, fim } = partes(c)
  const q = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: c.titulo, startdt: local(ini), enddt: local(fim), body: c.detalhes ?? '', location: c.local ?? '' })
  return `https://outlook.office.com/calendar/0/deeplink/compose?${q.toString()}`
}
export function baixarIcs(itens: CalItem[], nome = 'acolhe-agenda.ics') {
  const esc = (t: string) => t.replace(/[,;\\]/g, m => '\\' + m).replace(/\n/g, '\\n')
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Acolhe+//SESI Saude//PT']
  itens.forEach((c, i) => {
    const { ini, fim } = partes(c)
    linhas.push('BEGIN:VEVENT', `UID:acolhe-${i}-${compacto(ini)}@acolhe.plus`, `DTSTAMP:${compacto(new Date())}`, `DTSTART:${compacto(ini)}`, `DTEND:${compacto(fim)}`,
      `SUMMARY:${esc(c.titulo)}`, `LOCATION:${esc(c.local ?? '')}`, `DESCRIPTION:${esc(c.detalhes ?? '')}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Lembrete Acolhe+', 'END:VALARM', 'END:VEVENT')
  })
  linhas.push('END:VCALENDAR')
  const url = URL.createObjectURL(new Blob([linhas.join('\r\n')], { type: 'text/calendar' }))
  const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const GIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" stroke="#4285F4" strokeWidth="2" /><rect x="3" y="4" width="18" height="5" rx="2" fill="#4285F4" /><text x="12" y="18.5" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="#34A853">31</text></svg>
const TIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="14" height="14" rx="2.5" fill="#5059C9" /><text x="9" y="15.5" fontSize="10" fontWeight="700" textAnchor="middle" fill="#fff">T</text><circle cx="19" cy="8" r="3" fill="#7B83EB" /><rect x="16" y="11.5" width="6.5" height="7" rx="2" fill="#7B83EB" /></svg>

export function CalButtons({ item, compact }: { item: CalItem; compact?: boolean }) {
  return <div className={`cal-btns ${compact ? 'compact' : ''}`} role="group" aria-label={`Adicionar ${item.titulo} ao calendário`}>
    <a className="btn b-line btn-sm" href={googleUrl(item)} target="_blank" rel="noopener noreferrer"><GIcon /> Google<span className="cal-long"> Agenda</span></a>
    <a className="btn b-line btn-sm" href={outlookUrl(item)} target="_blank" rel="noopener noreferrer"><TIcon /> Teams<span className="cal-long"> / Outlook</span></a>
  </div>
}
