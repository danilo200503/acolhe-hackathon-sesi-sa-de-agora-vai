import { useMemo, useState } from 'react'
import { CalendarDays, Video, Building, Clock, CalendarPlus, ShieldCheck, Footprints, Scale, HeartPulse } from 'lucide-react'
import { useStore } from '../store'
import { Chip, Modal, Progress, Listen } from '../ui'
import { NaoConsigo, objetivoGeral } from './ColabInicio'
import { DIAS_SEMANA, HORAS, PROPOSITOS, EMOJIS, fmtData, diaSemana, progressoMeta, faltaMeta, uid, type Evento, type Meta } from '../data'
import type { Go } from '../App'
import { CalButtons, baixarIcs, type CalItem } from '../cal'

/* ================= MINHA AGENDA ================= */
export function ColabAgenda({ go }: { go: Go }) {
  const { eventos, setEventos, hoje, toast, confirmar: perguntar, erro } = useStore()
  const [aba, setAba] = useState<'prox' | 'hist'>('prox')
  const [det, setDet] = useState<Evento | null>(null)
  const [nao, setNao] = useState<Evento | null>(null)
  const lista = eventos.filter(e => aba === 'prox' ? e.data >= hoje && e.status !== 'Cancelado' : e.data < hoje || e.status === 'Cancelado')
    .sort((a, b) => aba === 'prox' ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data))
  // mini calendário do mês atual (novembro/2026)
  const mes = useMemo(() => {
    const first = new Date('2026-11-01T12:00:00'); const pad = (first.getDay() + 6) % 7
    return { pad, dias: 30 }
  }, [])
  const calItem = (e: Evento): CalItem => ({ titulo: `${e.titulo} · Acolhe+ SESI`, data: e.data, hora: e.hora, local: e.local, minutos: e.modalidade === 'Vídeo na empresa' ? 30 : 60,
    detalhes: `${e.modalidade}${e.obs ? ' · ' + e.obs : ''} · Lembretes também pelo WhatsApp do Acolhe+.` })
  const marcado = (d: number) => eventos.some(e => e.data === `2026-11-${String(d).padStart(2, '0')}` && e.status !== 'Cancelado')
  return <>
    <div className="page-head row between wrap"><div><p className="eyebrow">MINHA AGENDA</p><h1>Meus compromissos de saúde</h1><p className="muted">Consultas, exames e retornos em um só lugar. Agende por aqui.</p></div>
      <button className="btn b-pri btn-lg" onClick={() => go('agendar')}><CalendarPlus size={20} aria-hidden /> Agendar atendimento</button></div>
    <div className="grid2">
      <div>
        <div className="tabs" role="tablist" aria-label="Compromissos">
          <button role="tab" aria-selected={aba === 'prox'} onClick={() => setAba('prox')}>Próximos</button>
          <button role="tab" aria-selected={aba === 'hist'} onClick={() => setAba('hist')}>Histórico</button>
        </div>
        {lista.length === 0 && <div className="card"><p>Nada por aqui.</p></div>}
        {lista.map(e => <article className="card ev" key={e.id} aria-label={`${e.titulo}, ${fmtData(e.data)} às ${e.hora}`}>
          <div className="ev-date"><b>{fmtData(e.data, { day: '2-digit' })}</b><span>{fmtData(e.data, { month: 'short' }).replace('.', '')}</span></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row between wrap"><h3>{e.titulo}</h3><Chip tone={e.status === 'Confirmado' ? 'ok' : e.status === 'Solicitado' ? 'warn' : e.status === 'Realizado' ? 'blue' : 'gray'}>{e.status}</Chip></div>
            <p className="small muted ev-line"><Clock size={16} aria-hidden /> {diaSemana(e.data)}, {e.hora}</p>
            <p className="small muted ev-line">{e.modalidade === 'Vídeo na empresa' ? <Video size={16} aria-hidden /> : <Building size={16} aria-hidden />} {e.modalidade} · {e.local}</p>
            {aba === 'prox' && <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
              <button className="btn b-soft btn-sm" onClick={() => setDet(e)}>Detalhes</button>
              <button className="btn b-line btn-sm" onClick={() => go('agendar')}>Remarcar</button>
              <button className="btn b-line btn-sm" onClick={() => setNao(e)}>Não vou poder</button>
            </div>}
            {aba === 'prox' && e.status !== 'Cancelado' && <CalButtons item={calItem(e)} compact />}
          </div>
        </article>)}
        <button className="btn b-soft w100 btn-lg" onClick={() => go('agendar')}><CalendarPlus size={20} aria-hidden /> Agendar novo atendimento</button>
      </div>
      <div>
        <section className="card"><h3><CalendarDays size={20} aria-hidden /> Novembro de 2026</h3>
          <div className="cal" role="grid" aria-label="Calendário de novembro">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => <span key={i} className="cal-h" aria-hidden>{d}</span>)}
            {Array.from({ length: mes.pad }).map((_, i) => <span key={'p' + i} />)}
            {Array.from({ length: mes.dias }, (_, i) => i + 1).map(d => <span key={d} className={`cal-d ${marcado(d) ? 'on' : ''} ${d === 15 ? 'today' : ''}`} aria-label={`${d} de novembro${marcado(d) ? ', com compromisso' : ''}`}>{d}</span>)}
          </div>
          <p className="tiny muted" style={{ marginTop: 8 }}>● dias com compromisso · contorno = hoje</p></section>
        <section className="card"><h3>Levar para o meu calendário</h3><p className="small muted">Use os botões <b>Google Agenda</b> ou <b>Teams / Outlook</b> em cada compromisso. Você também recebe lembretes no WhatsApp 2 dias e 2 horas antes.</p>
          <button className="btn b-soft w100" style={{ marginTop: 10 }} onClick={() => { const futuros = eventos.filter(e => e.data >= hoje && e.status !== 'Cancelado'); baixarIcs(futuros.map(calItem)); toast(`${futuros.length} compromisso(s) exportado(s). Abra o arquivo para adicionar ao calendário.`) }}>Baixar todos (.ics para celular, Teams ou Google)</button></section>
      </div>
    </div>
    {det && <Modal title={det.titulo} onClose={() => setDet(null)}>
      <p><b>{diaSemana(det.data)}, {fmtData(det.data, { day: '2-digit', month: 'long', year: 'numeric' })} às {det.hora}</b></p>
      <p style={{ marginTop: 6 }}>{det.modalidade} · {det.local}</p>
      {det.obs && <p className="answer" style={{ marginTop: 12 }}>ℹ️ {det.obs}</p>}
      <p className="f" style={{ marginTop: 14 }}>Adicionar ao meu calendário</p>
      <CalButtons item={calItem(det)} />
      <p className="small muted" style={{ marginTop: 12 }}><ShieldCheck size={16} aria-hidden /> Seu líder recebe só o horário (Passe Saúde), nunca o motivo.</p>
      {det.status === 'Solicitado' && <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => { setEventos(ev => ev.map(x => x.id === det.id ? { ...x, status: 'Confirmado' } : x)); setDet(null); toast('Presença confirmada.') }}>Confirmar presença</button>}
    </Modal>}
    {nao && <Modal title="Não vou poder ir" onClose={() => setNao(null)}>
      <p className="muted">{nao.titulo} · {fmtData(nao.data)} às {nao.hora}</p>
      <NaoConsigo />
      <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
        <button className="btn b-pri" onClick={() => { setNao(null); go('agendar') }}>Escolher outro horário</button>
        <button className="btn b-line" onClick={async () => { const alvo = nao; if (!(await perguntar({ titulo: 'Cancelar agendamento', texto: `Cancelar ${alvo.titulo} de ${fmtData(alvo.data)} às ${alvo.hora}?`, detalhe: 'O horário será liberado para outro trabalhador. A equipe de saúde será avisada.', ok: 'Cancelar agendamento', cancelar: 'Manter agendamento', perigo: true }))) return
          const statusAntes = alvo.status
          setEventos(ev => ev.map(x => x.id === alvo.id ? { ...x, status: 'Cancelado' } : x)); setNao(null)
          toast('Agendamento cancelado. O horário foi liberado.', { desfazer: () => setEventos(ev => ev.map(x => x.id === alvo.id ? { ...x, status: statusAntes } : x)), rotuloDesfazer: 'Desfazer cancelamento' }) }}>Cancelar agendamento</button>
      </div>
    </Modal>}
  </>
}

/* ================= AGENDAR (tela só de agendamento) ================= */
const TIPOS = [
  ['Consulta de enfermagem', '🩺', 'Acompanhamento do seu plano'],
  ['Consulta médica', '👩‍⚕️', 'Avaliação com médico(a)'],
  ['Nutricionista', '🥗', 'Alimentação do dia a dia'],
  ['Psicólogo(a)', '🧠', 'Saúde emocional'],
  ['Exame', '🧪', 'Exames solicitados pela equipe'],
  ['Preventivo', '🌸', 'Exame preventivo'],
] as const

function proximosDiasUteis(hoje: string, n: number) {
  const out: string[] = []; const d = new Date(hoje + 'T12:00:00')
  while (out.length < n) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w >= 1 && w <= 5) out.push(d.toISOString().slice(0, 10)) }
  return out
}

export function ColabAgendar({ go }: { go: Go }) {
  const { janelaDaJuliana, agendar, hoje, toast, eventos, confirmar: perguntar, erro } = useStore()
  const [tipo, setTipo] = useState<string>('')
  const [mod, setMod] = useState<'Vídeo na empresa' | 'Presencial no SESI'>('Vídeo na empresa')
  const dias = proximosDiasUteis(hoje, 10)
  const [dia, setDia] = useState(dias[0])
  const [slot, setSlot] = useState<string>('')
  const janela = janelaDaJuliana()
  const dIdx = (new Date(dia + 'T12:00:00').getDay() + 6) % 7
  const exigePresencial = tipo === 'Exame' || tipo === 'Preventivo'
  const modal = exigePresencial ? 'Presencial no SESI' : mod
  const slots = HORAS.map((h, i) => {
    const label = `${String(h).padStart(2, '0')}h${h % 2 ? '50' : '10'}`
    const dentro = janela ? janela[dIdx][i] : h >= 9 && h <= 16
    const ocupado = (Number(dia.slice(8)) + h) % 4 === 0
    return { label, dentro, ocupado }
  })
  const [salvando, setSalvando] = useState(false)
  async function confirmar() {
    if (salvando) return // evita agendamento duplicado por clique duplo
    if (!tipo || !slot) { erro(!tipo ? 'Escolha o tipo de atendimento.' : 'Escolha um horário.'); return }
    if (dia < hoje) { erro('Não é possível agendar em uma data que já passou.'); return }
    const ativos = eventos.filter(e => e.status !== 'Cancelado' && e.status !== 'Realizado')
    if (ativos.some(e => e.data === dia && e.hora === slot)) { erro('Você já tem um compromisso nesse dia e horário. Escolha outro.'); return }
    const mesmoTipo = ativos.find(e => e.tipo === tipo && e.data >= hoje)
    if (mesmoTipo && !(await perguntar({ titulo: 'Você já tem esse atendimento', texto: `“${mesmoTipo.titulo}” já está marcado para ${fmtData(mesmoTipo.data)} às ${mesmoTipo.hora}.`,
      detalhe: 'Se for para remarcar, cancele o anterior na sua agenda. Quer marcar outro mesmo assim?', ok: 'Marcar outro mesmo assim', cancelar: 'Voltar' }))) return
    setSalvando(true)
    const desfazer = agendar({ data: dia, hora: slot, titulo: tipo, tipo, modalidade: modal, local: modal === 'Vídeo na empresa' ? 'Sala de saúde · Metalsul' : 'SESI Saúde · Unidade CIA' })
    toast(`Agendado para ${fmtData(dia)} às ${slot}. +60 pontos.`, { desfazer, rotuloDesfazer: 'Desfazer' })
    setSalvando(false); go('agenda')
  }
  const passo = !tipo ? 1 : !slot ? 3 : 4
  return <>
    <div className="page-head"><p className="eyebrow">AGENDAMENTO</p><h1>Agendar atendimento</h1><p className="muted">4 passos simples. Os horários seguem a janela de disponibilidade combinada com a sua empresa.</p></div>
    <ol className="stepper" aria-label={`Passo ${passo} de 4`}>{['O quê', 'Como', 'Dia', 'Horário'].map((t, i) => <li key={t} className={i + 1 < passo ? 'done' : i + 1 === passo ? 'now' : ''}>{i + 1}. {t}</li>)}</ol>
    <section className="card"><h3>1. O que você quer agendar?</h3>
      <div className="opts opts-grid tiles">{TIPOS.map(([t, e, d]) => <button key={t} className="opt" aria-pressed={tipo === t} onClick={() => setTipo(t)}><span className="e" aria-hidden>{e}</span><span><b>{t}</b><span className="desc"><br /><span className="small muted">{d}</span></span></span></button>)}</div></section>
    <section className="card"><h3>2. Como prefere?</h3>
      <div className="opts opts-2">
        <button className="opt" aria-pressed={modal === 'Vídeo na empresa'} disabled={exigePresencial} onClick={() => setMod('Vídeo na empresa')}><Video aria-hidden /><span><b>Por vídeo na empresa</b><br /><span className="small muted">Sala de saúde · cerca de 30 min fora da linha</span></span></button>
        <button className="opt" aria-pressed={modal === 'Presencial no SESI'} onClick={() => setMod('Presencial no SESI')}><Building aria-hidden /><span><b>Presencial no SESI</b><br /><span className="small muted">3 a 4 horas · vale-transporte incluso</span></span></button>
      </div>{exigePresencial && <p className="small muted" style={{ marginTop: 8 }}>Exames e preventivo são feitos presencialmente no SESI.</p>}</section>
    <section className="card"><h3>3. Qual dia?</h3>
      <div className="days" role="group" aria-label="Dias disponíveis">{dias.map(d => <button key={d} className="day" aria-pressed={dia === d} onClick={() => { setDia(d); setSlot('') }}>{fmtData(d, { weekday: 'short' }).replace('.', '')}<b>{fmtData(d, { day: '2-digit' })}</b><span className="tiny">{fmtData(d, { month: 'short' }).replace('.', '')}</span></button>)}</div>
      <h3 style={{ marginTop: 18 }}>4. Qual horário?</h3>
      <p className="small muted">{janela ? 'Verde = dentro da janela que sua empresa liberou para cuidar da saúde.' : 'Sua empresa ainda não definiu uma janela. Mostramos o horário comercial.'}</p>
      <div className="slots" role="group" aria-label="Horários">{slots.map(x => {
        const disabled = !x.dentro || x.ocupado
        return <button key={x.label} className={`slot ${x.dentro && !x.ocupado ? 'green' : ''}`} disabled={disabled} aria-pressed={slot === x.label} onClick={() => setSlot(x.label)}
          aria-label={`${x.label}${!x.dentro ? ', fora da sua janela' : x.ocupado ? ', ocupado' : ', disponível'}`}>{x.label}<small>{!x.dentro ? 'fora da janela' : x.ocupado ? 'ocupado' : 'livre'}</small></button>
      })}</div>
      <div className="sticky-cta">
      <div className="summary" aria-live="polite">{tipo && slot ? <>📋 <b>{tipo}</b> · {diaSemana(dia)}, {fmtData(dia, { day: '2-digit', month: 'long' })} às {slot} · {modal}</> : 'Escolha o tipo, o dia e o horário.'}</div>
      <button className="btn b-pri w100 btn-lg" onClick={confirmar} disabled={salvando} aria-busy={salvando} aria-disabled={!tipo || !slot} style={{ opacity: tipo && slot ? 1 : .55 }}>{salvando ? 'Agendando…' : 'Confirmar agendamento'}</button>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}><ShieldCheck size={16} aria-hidden /> Seu líder recebe só: “Juliana tem compromisso de saúde”, com o horário. Nunca o motivo.</p>
    </section>
  </>
}

/* ================= MEU OBJETIVO ================= */
function EditarObjetivo({ onClose }: { onClose: () => void }) {
  const { proposito, setProposito, objetivoCustom, setObjetivoCustom, objetivoAtual, metas, setMetas, toast, confirmar: perguntar, erro } = useStore()
  const [aba, setAba] = useState<'obj' | 'metas'>('obj')
  const [modo, setModo] = useState<'lista' | 'outro'>(objetivoCustom ? 'outro' : 'lista')
  const [idx, setIdx] = useState<number>(proposito ?? 0)
  const [texto, setTexto] = useState(objetivoCustom?.t ?? '')
  const [emoji, setEmoji] = useState(objetivoCustom?.e ?? '❤️')
  const [ms, setMs] = useState<Meta[]>(() => metas.map(m => ({ ...m })))
  const upd = (id: string, p: Partial<Meta>) => setMs(x => x.map(m => m.id === id ? { ...m, ...p } : m))
  const [erroObj, setErroObj] = useState('')
  const [inicial] = useState(() => JSON.stringify({ texto, idx, emoji, modo, ms }))
  const mudou = () => JSON.stringify({ texto, idx, emoji, modo, ms }) !== inicial
  async function fechar() {
    if (mudou() && !(await perguntar({ titulo: 'Descartar alterações?', texto: 'Você fez alterações que ainda não foram salvas.', ok: 'Descartar alterações', cancelar: 'Continuar editando', perigo: true }))) return
    onClose()
  }
  async function salvar() {
    if (modo === 'outro') {
      const t = texto.trim()
      if (t.length < 5) { setAba('obj'); setErroObj('Escreva o seu objetivo com pelo menos 5 letras. Ex.: “Brincar com meus netos”.'); setTimeout(() => document.getElementById('objTxt')?.focus(), 0); return }
    }
    const preenchidas = ms.filter(m => m.nome.trim())
    if (!preenchidas.length) { setAba('metas'); erro('Mantenha pelo menos uma meta.'); return }
    const ruim = preenchidas.find(m => !(m.alvo > 0) || m.atual < 0 || m.inicio < 0 || m.alvo === m.inicio)
    if (ruim) { setAba('metas'); erro(`Confira os números da meta “${ruim.nome}”: a meta precisa ser maior que zero e diferente do valor inicial.`); return }
    if (ms.length !== preenchidas.length && !(await perguntar({ titulo: 'Metas sem nome', texto: `${ms.length - preenchidas.length} meta(s) sem nome não serão salvas.`, detalhe: 'Dê um nome para manter a meta, ou continue para salvar só as metas preenchidas.', ok: 'Salvar sem as metas vazias', cancelar: 'Voltar e preencher' }))) return
    if (modo === 'outro') setObjetivoCustom({ e: emoji, t: texto.trim() }); else setProposito(idx)
    setMetas(preenchidas); toast('Objetivo e metas salvos.'); onClose()
  }
  return <Modal title="Editar objetivo e metas" onClose={fechar} wide>
    <div className="tabs" role="tablist" aria-label="Editar">
      <button role="tab" aria-selected={aba === 'obj'} onClick={() => setAba('obj')}>Meu objetivo</button>
      <button role="tab" aria-selected={aba === 'metas'} onClick={() => setAba('metas')}>Minhas metas ({ms.length})</button>
    </div>
    {aba === 'obj' && <div>
      <p className="muted small">Atual: <b>{objetivoAtual().e} {objetivoAtual().t}</b></p>
      <div className={`subform obj-livre ${modo === 'outro' ? 'on' : ''}`} style={{ marginTop: 0 }}>
        <label className="f" htmlFor="objTxt">✍️ Escreva o seu objetivo, com as suas palavras</label>
        <textarea id="objTxt" className="inp" maxLength={120} rows={3} placeholder="Ex.: Levar minha família para conhecer a praia de Morro de São Paulo" value={texto}
          onChange={e => { setTexto(e.target.value); setErroObj(''); setModo(e.target.value.trim() ? 'outro' : 'lista') }} aria-invalid={!!erroObj} aria-describedby="objTxt-msg" />
        {erroObj && <div id="objTxt-msg" className="err" role="alert">{erroObj}</div>}
        <div className="row between"><span className="tiny muted">{modo === 'outro' ? 'Este será o seu objetivo.' : 'Comece a escrever ou escolha uma sugestão abaixo.'}</span><span className="tiny muted" aria-live="polite">{texto.length}/120</span></div>
        {modo === 'outro' && <><p className="f" id="emj-l">Escolha um ícone</p>
        <div className="emoji-row" role="group" aria-labelledby="emj-l">{EMOJIS.map(e => <button key={e} className="emoji" aria-pressed={emoji === e} aria-label={`Ícone ${e}`} onClick={() => setEmoji(e)}>{e}</button>)}</div></>}
      </div>
      <p className="f" style={{ marginTop: 14 }}>Ou escolha uma sugestão</p>
      <div className="opts">
        {PROPOSITOS.map((x, i) => <button key={i} className="opt" aria-pressed={modo === 'lista' && idx === i} onClick={() => { setModo('lista'); setIdx(i) }}><span className="e" aria-hidden>{x.e}</span><span><b>{x.t}</b><br /><span className="small muted">{x.d}</span></span></button>)}
      </div>
    </div>}
    {aba === 'metas' && <div>
      <p className="muted small">Edite as metas que levam ao seu objetivo. O ideal é combinar com a equipe de saúde.</p>
      {ms.map((m, i) => <fieldset className="meta-edit" key={m.id}>
        <legend>Meta {i + 1}</legend>
        <div className="me-grid">
          <div className="me-name"><label className="f" htmlFor={`n${m.id}`}>Nome</label><input id={`n${m.id}`} className="inp" value={m.nome} onChange={e => upd(m.id, { nome: e.target.value })} /></div>
          <div><label className="f" htmlFor={`u${m.id}`}>Unidade</label><input id={`u${m.id}`} className="inp" value={m.unidade} onChange={e => upd(m.id, { unidade: e.target.value })} /></div>
          <div><label className="f" htmlFor={`i${m.id}`}>Começou em</label><input id={`i${m.id}`} className="inp" type="number" value={m.inicio} onChange={e => upd(m.id, { inicio: Number(e.target.value) })} /></div>
          <div><label className="f" htmlFor={`a${m.id}`}>Hoje</label><input id={`a${m.id}`} className="inp" type="number" value={m.atual} onChange={e => upd(m.id, { atual: Number(e.target.value) })} /></div>
          <div><label className="f" htmlFor={`t${m.id}`}>Meta</label><input id={`t${m.id}`} className="inp" type="number" value={m.alvo} onChange={e => upd(m.id, { alvo: Number(e.target.value) })} /></div>
        </div>
        <div className="row between wrap" style={{ marginTop: 10 }}>
          <label className="cb"><input type="checkbox" checked={m.menorMelhor} onChange={e => upd(m.id, { menorMelhor: e.target.checked })} /> Quanto menor, melhor (ex.: pressão, peso)</label>
          <button className="btn b-line btn-sm" onClick={async () => { if (ms.length <= 1) { erro('Mantenha pelo menos uma meta.'); return } if (await perguntar({ titulo: 'Remover meta', texto: `Remover a meta “${m.nome || `Meta ${i + 1}`}”?`, detalhe: 'A remoção só vale quando você clicar em “Salvar objetivo e metas”.', ok: 'Remover meta', cancelar: 'Manter meta', perigo: true })) setMs(x => x.filter(y => y.id !== m.id)) }} aria-label={`Remover meta ${m.nome || i + 1}`}>Remover</button>
        </div>
      </fieldset>)}
      <button className="btn b-soft w100" onClick={() => { if (ms.length >= 6) { erro('Máximo de 6 metas. Foque no que é mais importante.'); return } setMs(x => [...x, { id: uid(), nome: '', unidade: '', inicio: 0, atual: 0, alvo: 10, dica: 'Meta pessoal', menorMelhor: false }]) }}>+ Adicionar meta</button>
    </div>}
    <button className="btn b-pri w100 btn-lg" style={{ marginTop: 16 }} onClick={salvar}>Salvar objetivo e metas</button>
  </Modal>
}

export function ColabObjetivo() {
  const { objetivoAtual, metas, setMetas, toast, ganhar, erro } = useStore()
  const [edit, setEdit] = useState(false)
  const p = objetivoAtual()
  const g = metas.length ? objetivoGeral(metas) : 0
  const reg = (id: string, f: (v: number) => number, msg: string) => { setMetas(ms => ms.map(m => m.id === id ? { ...m, atual: Math.round(f(m.atual) * 10) / 10 } : m)); ganhar(10); toast(msg) }
  const cam = metas.find(m => m.id === 'cam')
  const semanas = !cam || cam.atual >= cam.alvo ? 0 : Math.ceil((cam.alvo - cam.atual) / 30)
  return <>
    <div className="page-head row between wrap"><div><p className="eyebrow">MEU OBJETIVO</p><h1>{p.e} {p.t}</h1><p className="muted">Suas metas e quanto falta para chegar lá.</p></div>
      <button className="btn b-pri" onClick={() => setEdit(true)}>✏️ Editar objetivo e metas</button></div>
    <div className="grid2">
      <div>
        <section className="card hero center-col">
          <div className="ring" style={{ ['--p' as string]: `${Math.round(g * 100)}` }} role="img" aria-label={`${Math.round(g * 100)} por cento do objetivo`}><span>{Math.round(g * 100)}%</span></div>
          <p className="big" style={{ marginTop: 12 }}>Você já percorreu {Math.round(g * 100)}% do caminho</p>
          <p className="small">Falta {100 - Math.round(g * 100)}%.{cam ? (semanas ? ` No ritmo atual, a meta de caminhada chega em cerca de ${semanas} semana(s).` : ' Meta de caminhada batida!') : ''}</p>
          <div className="row wrap" style={{ gap: 8, justifyContent: 'center', marginTop: 10 }}><Listen text={`Seu objetivo é ${p.t}. Você já percorreu ${Math.round(g * 100)} por cento do caminho.`} /><button className="btn b-white btn-sm" style={{ marginTop: 0 }} onClick={() => setEdit(true)}>Trocar objetivo</button></div>
        </section>
        <section className="card"><h3>Marcos do objetivo</h3>
          {([[25, 'Selo “Primeiro passo”'], [50, 'Desconto na farmácia parceira'], [75, 'Passeio em família no clube SESI'], [100, 'Folga do cuidado (política da empresa)']] as [number, string][]).map(([v, l]) =>
            <div className="task" key={v}><span className={`tick-s ${g * 100 >= v ? 'on' : ''}`} aria-hidden>{g * 100 >= v ? '✓' : ''}</span><span style={{ flex: 1 }}><b>{v}%</b> · {l}</span>{g * 100 >= v ? <Chip tone="ok">conquistado</Chip> : <Chip tone="gray">faltam {Math.ceil(v - g * 100)}%</Chip>}</div>)}
        </section>
      </div>
      <div>
        {metas.length === 0 && <section className="card"><p>Nenhuma meta ainda.</p><button className="btn b-soft" onClick={() => setEdit(true)}>Adicionar meta</button></section>}
        {metas.map(m => { const pr = progressoMeta(m), f = faltaMeta(m); return <section className="card meta" key={m.id}>
          <div className="row between"><h3>{m.nome}</h3><b className="meta-pct">{Math.round(pr * 100)}%</b></div>
          <p className="small muted">Começou em {m.inicio} · hoje <b>{m.atual} {m.unidade}</b> · meta {m.menorMelhor ? 'até ' : ''}{m.alvo} {m.unidade}</p>
          <Progress value={pr} label={`Progresso da meta ${m.nome}`} />
          <p className="meta-falta">{f === 0 ? '🎉 Meta batida!' : <>Faltam <b>{f} {m.unidade}</b> · {m.dica}</>}</p>
          {m.id === 'cam' ? <button className="btn b-soft btn-sm" onClick={() => reg('cam', v => v + 30, 'Caminhada registrada: +30 min. +10 pontos')}><Footprints size={18} aria-hidden /> Registrar 30 min de caminhada</button>
            : m.id === 'pa' ? <button className="btn b-soft btn-sm" onClick={() => reg('pa', v => Math.max(118, v - 2), 'Medida registrada. +10 pontos')}><HeartPulse size={18} aria-hidden /> Registrar medida de pressão</button>
            : m.id === 'peso' ? <button className="btn b-soft btn-sm" onClick={() => reg('peso', v => v - 0.5, 'Peso registrado. +10 pontos')}><Scale size={18} aria-hidden /> Registrar peso</button>
            : <button className="btn b-soft btn-sm" onClick={() => reg(m.id, v => m.menorMelhor ? v - 1 : v + 1, 'Progresso registrado. +10 pontos')}>Registrar progresso</button>}
        </section> })}
      </div>
    </div>
    {edit && <EditarObjetivo onClose={() => setEdit(false)} />}
  </>
}

export { DIAS_SEMANA }
