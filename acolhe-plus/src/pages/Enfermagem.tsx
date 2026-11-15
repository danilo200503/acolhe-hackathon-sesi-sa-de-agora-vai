import { useState, type FormEvent } from 'react'
import { MessageCircle, Video, Phone, FileText, FilePlus2, ClipboardList, Bell, CheckCircle2, CalendarPlus, NotebookPen, Lock } from 'lucide-react'
import { useStore } from '../store'
import { Chip, DocView, Modal } from '../ui'
import { RiscoSteps } from './ColabInicio'
import { scorePaciente, fmtData, uid, NIVEL_CRONICO, PROFISSIONAIS, HOJE, type Paciente, type Documento, type Demanda, type Nota } from '../data'

const tone = (s: number) => s >= 60 ? 'bad' : s >= 35 ? 'warn' : 'ok'

export function EnfFila() {
  const { pacientes, barreiras, setBarreiras, docs, toast, erro } = useStore()
  const [emp, setEmp] = useState('Todas')
  const [pront, setPront] = useState<{ p: Paciente; aba?: Aba } | null>(null)
  const [marcar, setMarcar] = useState<Paciente | null>(null)
  const { notas, addNota, confirmar } = useStore()
  const lista = pacientes.map(p => ({ p, ...scorePaciente(p) })).filter(x => emp === 'Todas' || x.p.empresa === emp).sort((a, b) => b.s - a.s)
  const [sel, setSel] = useState(0)
  const cur = lista[sel] ?? lista[0]
  const novosExames = docs.filter(d => d.enviadoPeloPaciente && !d.avaliado).length
  return <>
    <div className="page-head"><p className="eyebrow">GESTÃO DO CUIDADO</p><h1>Painel da enfermagem</h1><p className="muted">Quem tem mais risco de abandonar o cuidado aparece primeiro, com o motivo e a próxima ação.</p></div>
    <div className="stats-grid">
      <div className="card stat"><strong>128</strong><span>Pessoas acompanhadas</span></div>
      <div className="card stat"><strong>{lista.filter(x => x.s >= 60).length + 21}</strong><span>Precisam de contato</span></div>
      <div className="card stat"><strong>76%</strong><span>Planos em continuidade</span></div>
      <div className="card stat"><strong>{barreiras.filter(b => !b.resolvida).length + novosExames}</strong><span>Novidades dos pacientes</span></div>
    </div>
    {(barreiras.some(b => !b.resolvida) || novosExames > 0) && <section className="card card-warn" aria-live="polite"><h3><Bell size={20} aria-hidden /> Novidades enviadas pelos pacientes</h3>
      {barreiras.filter(b => !b.resolvida).map(b => <div className="task" key={b.id}><span style={{ flex: 1 }}><b>{b.pessoa}</b> relatou: “{b.motivo === 'Outro motivo' && b.detalhe ? `Outro motivo: ${b.detalhe}` : b.motivo}” · {b.quando}</span>
        <button className="btn b-soft btn-sm" onClick={() => { setBarreiras(bs => bs.map(x => x.id === b.id ? { ...x, resolvida: true } : x)); const tirar = addNota('p1', { data: HOJE, hora: agora(), autor: 'Enf. Renata Lima', tipo: 'Contato', texto: `Contato após barreira relatada: ${b.motivo === 'Outro motivo' && b.detalhe ? b.detalhe : b.motivo}.` }); toast('Contato registrado no prontuário. Barreira resolvida.', { desfazer: () => { tirar(); setBarreiras(bs => bs.map(x => x.id === b.id ? { ...x, resolvida: false } : x)) } }) }}>Registrar contato</button></div>)}
      {novosExames > 0 && <div className="task"><span style={{ flex: 1 }}><b>Juliana B. A.</b> enviou {novosExames} resultado(s) de exame</span><button className="btn b-soft btn-sm" onClick={() => setPront({ p: pacientes[0], aba: 'exames' })}>Abrir prontuário</button></div>}
    </section>}
    <div className="tabs" role="tablist" aria-label="Filtrar por empresa">{['Todas', 'Metalsul', 'Têxtil Brisa', 'Vale Verde'].map(t => <button key={t} role="tab" aria-selected={emp === t} onClick={() => { setEmp(t); setSel(0) }}>{t}</button>)}</div>
    <div className="grid2 fila-grid">
      <section className="card table-wrap"><table className="rtable"><caption className="sr">Fila priorizada por risco de evasão</caption>
        <thead><tr><th>Risco</th><th>Trabalhador (fictício)</th><th>Empresa</th><th>Nível</th><th>Barreira relatada</th></tr></thead>
        <tbody>{lista.map((x, i) => <tr key={x.p.id} aria-selected={i === sel}>
          <td data-label="Risco"><span className={`score c-${tone(x.s)}`}>{x.s}</span></td>
          <td data-label="Trabalhador"><button className="linklike strong" onClick={() => { setSel(i); if (window.innerWidth < 1180) setTimeout(() => document.getElementById('det-paciente')?.scrollIntoView({ behavior: 'smooth' }), 50) }} aria-label={`Ver ${x.p.nome}`}>{x.p.nome}</button></td>
          <td data-label="Empresa" className="muted">{x.p.empresa}</td><td data-label="Nível">{x.p.risco}{x.p.cronico ? ' 🔒' : ''}</td><td data-label="Barreira">{x.p.motivo === 'Outro motivo' && x.p.detalhe ? `Outro: ${x.p.detalhe}` : x.p.motivo ?? 'Sem retorno registrado'}</td></tr>)}</tbody></table>
        <p className="tiny muted" style={{ marginTop: 8 }}>🔒 = nível fixo em 3 por condição crônica.</p></section>
      {cur && <section className="card" id="det-paciente">
        <div className="row between"><h3>{cur.p.nome} · {cur.p.empresa}</h3><span className={`score c-${tone(cur.s)}`}>{cur.s}</span></div>
        <p className="small muted">Nível {cur.p.risco}{cur.p.cronico ? ` (fixo · ${cur.p.cronico.toLowerCase()})` : ''} · {cur.p.idade} anos · último contato há {cur.p.ultimoContato} dias · retorno {cur.p.retornoDias < 0 ? `vencido há ${-cur.p.retornoDias} dias` : `em ${cur.p.retornoDias} dias`}</p>
        <b className="small">Por que esse risco</b>
        {cur.f.map(([t, v]) => <div className="factor" key={t}><span>{t}</span><b className={v > 0 ? 'neg' : 'pos'}>{v > 0 ? '+' : ''}{v}</b></div>)}
        <div className="next"><span className="tiny">PRÓXIMA AÇÃO SUGERIDA</span><b>{cur.p.motivo === 'Meu chefe não liberou' ? 'Acionar RH e oferecer horário da janela' : cur.p.motivo === 'Transporte / distância' ? 'Oferecer vídeo na sala de saúde' : cur.p.motivo === 'Estou com dúvida ou receio' ? 'Ligação de acolhimento' : cur.s >= 35 ? 'Mensagem pelo propósito + convite' : 'Manter régua automática'}</b></div>
        {(notas[cur.p.id] ?? [])[0] && <div className="nota" style={{ marginTop: 10 }}><div className="nh"><b>Última anotação</b><span>{fmtData(notas[cur.p.id][0].data)} · {notas[cur.p.id][0].autor}</span></div><p className="small">{notas[cur.p.id][0].texto}</p></div>}
        <div className="actions-col">
          <button className="btn b-pri" onClick={() => setPront({ p: cur.p })}><ClipboardList size={18} aria-hidden /> Abrir prontuário</button>
          <button className="btn b-pri" onClick={() => setMarcar(cur.p)}><CalendarPlus size={18} aria-hidden /> Marcar atendimento</button>
          <button className="btn b-soft" onClick={() => setPront({ p: cur.p, aba: 'notas' })}><NotebookPen size={18} aria-hidden /> Registrar anotação</button>
          <button className="btn b-soft" onClick={() => { const tirar = addNota(cur.p.id, { data: HOJE, hora: agora(), autor: 'Enf. Renata Lima', tipo: 'Contato', texto: 'Mensagem de acompanhamento enviada por WhatsApp (simulação no protótipo).' }); toast(`Registrado no prontuário. Simulação: no produto final, ${cur.p.nome} recebe no WhatsApp.`, { desfazer: tirar }) }}><MessageCircle size={18} aria-hidden /> Enviar WhatsApp <span className="sim-tag">simulado</span></button>
          <button className="btn b-line" onClick={() => setMarcar(cur.p)}><Video size={18} aria-hidden /> Oferecer vídeo</button>
          <button className="btn b-line" onClick={() => { const tirar = addNota(cur.p.id, { data: HOJE, hora: agora(), autor: 'Enf. Renata Lima', tipo: 'Contato', texto: 'Ligação realizada para acompanhamento.' }); toast('Ligação registrada nas anotações do prontuário.', { desfazer: tirar }) }}><Phone size={18} aria-hidden /> Registrar ligação</button>
        </div>
      </section>}
    </div>
    {pront && <Prontuario p={pront.p} abaInicial={pront.aba} onClose={() => setPront(null)} />}
    {marcar && <MarcarModal paciente={marcar} onClose={() => setMarcar(null)} />}
  </>
}

const agora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}` }
type Aba = 'resumo' | 'notas' | 'plano' | 'consultas' | 'exames' | 'atestados'

/* ---------- Marcação de atendimento pela enfermagem ---------- */
export function MarcarModal({ paciente, onClose }: { paciente?: Paciente; onClose: () => void }) {
  const s = useStore()
  const [pid, setPid] = useState(paciente?.id ?? s.pacientes[0].id)
  const [salvando, setSalvando] = useState(false)
  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (salvando) return
    const f = new FormData(e.currentTarget)
    const p = s.pacientes.find(x => x.id === pid)!
    const data = String(f.get('data')), hh = String(f.get('hora')), at = String(f.get('at')), mod = String(f.get('mod')), prof = String(f.get('prof'))
    if (!data || !hh) { s.erro('Escolha a data e o horário.'); return }
    if (data < HOJE) { s.erro('Não é possível marcar em data que já passou.'); return }
    if (new Date(data + 'T12:00:00').getDay() === 0) { s.erro('Não há atendimento aos domingos.'); return }
    const [h, m] = hh.split(':'); const hora = `${h}h${m}`
    if (Number(h) < 7 || Number(h) > 18) { s.erro('Horário fora do funcionamento da unidade (7h às 19h).'); return }
    if (s.marcacoes.some(x => x.data === data && x.hora === hora && x.profissional === prof)) { s.erro(`${prof} já tem atendimento em ${fmtData(data)} às ${hora}.`); return }
    const mesmoDia = s.marcacoes.find(x => x.data === data && x.pacienteId === p.id)
    if (mesmoDia && !(await s.confirmar({ titulo: 'Paciente já tem atendimento nesse dia', texto: `${p.nome} já tem “${mesmoDia.atendimento}” em ${fmtData(data)} às ${mesmoDia.hora}.`,
      detalhe: 'Quer marcar mais um atendimento no mesmo dia?', ok: 'Marcar mesmo assim', cancelar: 'Escolher outro dia' }))) return
    setSalvando(true)
    const mid = uid(), eid = uid()
    s.setMarcacoes(ms => [...ms, { id: mid, data, hora, pacienteId: p.id, paciente: p.nome, atendimento: at, modalidade: mod === 'Vídeo na empresa' ? `Vídeo · ${p.empresa}` : mod, profissional: prof }])
    const tirarNota = s.addNota(p.id, { data: HOJE, hora: agora(), autor: 'Enf. Renata Lima', tipo: 'Observação', texto: `Atendimento marcado: ${at} em ${fmtData(data)} às ${hora} (${mod}) com ${prof}.` })
    if (p.id === 'p1') {
      s.setEventos(ev => [...ev, { id: eid, data, hora, titulo: at, tipo: at, modalidade: mod === 'Vídeo na empresa' ? 'Vídeo na empresa' as const : 'Presencial no SESI' as const, local: mod === 'Vídeo na empresa' ? 'Sala de saúde · Metalsul' : 'SESI Saúde · Unidade CIA', status: 'Solicitado' as const, obs: `Marcado pela equipe de saúde (${prof}). Confirme sua presença.` }].sort((a, b) => a.data.localeCompare(b.data)))
    }
    const desfazer = () => { s.setMarcacoes(ms => ms.filter(x => x.id !== mid)); s.setEventos(ev => ev.filter(x => x.id !== eid)); tirarNota() }
    s.toast(p.id === 'p1' ? 'Atendimento marcado. Já aparece na agenda da Juliana para ela confirmar.' : `Atendimento de ${p.nome} marcado.`, { desfazer })
    onClose()
  }
  return <Modal title="Marcar atendimento" onClose={onClose}>
    <form onSubmit={salvar}>
      <label className="f" htmlFor="mp">Paciente</label>
      <select id="mp" className="inp" value={pid} onChange={e => setPid(e.target.value)}>{s.pacientes.map(p => <option key={p.id} value={p.id}>{p.nome} · {p.empresa}</option>)}</select>
      <label className="f" htmlFor="mat">Atendimento</label>
      <select id="mat" name="at" className="inp"><option>Consulta de enfermagem</option><option>Consulta médica</option><option>Retorno</option><option>Nutricionista</option><option>Psicólogo(a)</option><option>Coleta de exames</option><option>Acolhimento por ligação</option></select>
      <div className="grid-2f">
        <div><label className="f" htmlFor="md">Data</label><input id="md" name="data" type="date" className="inp" defaultValue="2026-11-18" min={HOJE} /></div>
        <div><label className="f" htmlFor="mh">Horário</label><input id="mh" name="hora" type="time" className="inp" defaultValue="14:10" step={600} /></div>
      </div>
      <div className="grid-2f">
        <div><label className="f" htmlFor="mm">Modalidade</label><select id="mm" name="mod" className="inp"><option>Vídeo na empresa</option><option>Presencial</option><option>Ligação</option></select></div>
        <div><label className="f" htmlFor="mpr">Profissional</label><select id="mpr" name="prof" className="inp">{PROFISSIONAIS.map(p => <option key={p}>{p}</option>)}</select></div>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>Dica: prefira horários dentro da janela que a empresa liberou. O paciente recebe o convite para confirmar.</p>
      <button className="btn b-pri w100 btn-lg" style={{ marginTop: 14 }} type="submit">Marcar atendimento</button>
    </form>
  </Modal>
}

function Prontuario({ p: p0, abaInicial, onClose }: { p: Paciente; abaInicial?: Aba; onClose: () => void }) {
  const s = useStore()
  const p = s.pacientes.find(x => x.id === p0.id) ?? p0
  const ehJuliana = p.id === 'p1'
  const [aba, setAba] = useState<Aba>(abaInicial ?? 'resumo')
  const [marcar, setMarcar] = useState(false)
  const notas = s.notas[p.id] ?? []
  const [filtro, setFiltro] = useState<'Todas' | Nota['tipo']>('Todas')
  const [doc, setDoc] = useState<Documento | null>(null)
  const [localDocs, setLocalDocs] = useState<Documento[]>([])
  const [localDem, setLocalDem] = useState<Demanda[]>([{ id: 'x1', descricao: 'Retorno de enfermagem', status: 'Pendente', prazo: '2026-12-01' }])
  const docs = ehJuliana ? s.docs : localDocs
  const dems = ehJuliana ? s.demandas : localDem
  const setDems = ehJuliana ? s.setDemandas : setLocalDem
  const add = (d: Omit<Documento, 'id'>) => ehJuliana ? s.addDoc(d) : setLocalDocs(x => [{ ...d, id: uid() }, ...x])
  const nome = ehJuliana ? 'Juliana Barros Alves' : p.nome

  async function regConsulta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form)
    if (String(f.get('motivo') || '').trim().length < 3 || String(f.get('diag') || '').trim().length < 3) { s.erro('Preencha motivo e diagnóstico.'); return }
    if (!(await s.confirmar({ titulo: 'Registrar consulta', texto: 'Registrar a consulta e gerar o PDF?', detalhe: ehJuliana ? 'O resumo ficará visível para a paciente em “Documentos e exames”. Depois de emitido, não pode ser apagado, só retificado.' : 'O registro ficará no prontuário e não pode ser apagado, só retificado.', ok: 'Registrar e gerar PDF', cancelar: 'Revisar' }))) return
    add({ tipo: 'consulta', titulo: `Resumo · ${f.get('tipo')}`, data: '2026-11-15', profissional: 'Enf. Renata Lima', registro: 'COREN-BA 000000',
      motivo: String(f.get('motivo')), avaliacao: String(f.get('aval')), diagnostico: String(f.get('diag')), cid: String(f.get('cid') || ''), conduta: String(f.get('cond')), retorno: String(f.get('ret')) })
    form.reset(); s.toast(ehJuliana ? 'Consulta registrada. O PDF já aparece para a paciente.' : 'Consulta registrada.')
  }
  async function emitirAtestado(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget)
    const dias = Number(f.get('dias'))
    const ini = String(f.get('inicio') || '')
    if (ini && (ini < '2026-11-10' || ini > '2026-11-20')) { s.erro('O início do atestado deve ser próximo à data do atendimento.'); return }
    if (!(await s.confirmar({ titulo: dias ? 'Emitir atestado' : 'Emitir declaração', texto: dias ? `Emitir atestado de ${dias} dia(s) para ${nome.split(' ')[0]}?` : `Emitir declaração de comparecimento para ${nome.split(' ')[0]}?`,
      detalhe: `${f.get('autoriza') === 'on' ? 'O CID será impresso (paciente autorizou).' : 'O CID não será impresso.'} Depois de emitido, não pode ser apagado, só retificado.`, ok: dias ? 'Emitir atestado' : 'Emitir declaração', cancelar: 'Revisar' }))) return
    add({ tipo: 'atestado', titulo: dias ? `Atestado · ${dias} dia(s)` : 'Declaração de comparecimento', data: '2026-11-15', profissional: 'Dra. Paula Ramos', registro: 'CRM-BA 00000',
      dias, inicio: String(f.get('inicio')), cid: String(f.get('cid') || ''), mostrarCid: f.get('autoriza') === 'on' })
    s.toast(ehJuliana ? 'Atestado emitido. Já está nos documentos da paciente.' : 'Atestado emitido.')
  }
  return <Modal title={`Prontuário · ${nome}`} onClose={onClose} wide>
    <div className="tabs" role="tablist" aria-label="Seções do prontuário">
      {([['resumo', 'Resumo'], ['notas', `Anotações (${notas.length})`], ['plano', 'Plano de cuidado'], ['consultas', 'Consultas'], ['exames', 'Exames'], ['atestados', 'Atestados']] as const).map(([k, l]) =>
        <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)}>{l}</button>)}
    </div>
    {aba === 'resumo' && <div>
      <dl className="doc-meta"><div><dt>Empresa</dt><dd>{p.empresa}</dd></div><div><dt>Idade</dt><dd>{p.idade} anos</dd></div><div><dt>Alergias</dt><dd>{ehJuliana ? 'Dipirona' : 'Nenhuma conhecida'}</dd></div><div><dt>Medicamentos</dt><dd>{ehJuliana ? 'Losartana 50 mg' : '—'}</dd></div></dl>
      <h4 style={{ margin: '12px 0 4px' }}>Nível de cuidado</h4>
      <RiscoSteps atual={p.risco} />
      {p.cronico ? <p className="lock-note"><Lock size={18} aria-hidden /><span><b>Nível fixo em {NIVEL_CRONICO}.</b> Paciente com condição crônica ({p.cronico.toLowerCase()}). Pelo protocolo, o nível de cuidado não muda: o acompanhamento segue a cada 3 meses. A evolução aparece nas metas e nas anotações.</span></p>
        : <><label className="f" htmlFor="nr">Atualizar nível</label>
          <select id="nr" className="inp inp-sm" value={p.risco} onChange={e => { const r = Number(e.target.value) as 1 | 2 | 3 | 4; s.setPacientes(ps => ps.map(x => x.id === p.id ? { ...x, risco: r } : x)); s.toast('Nível atualizado.') }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>Nível {n}</option>)}</select></>}
      <form className="row wrap" style={{ gap: 8, marginTop: 12 }} onSubmit={async e => { e.preventDefault(); const f = new FormData(e.currentTarget); const c = String(f.get('cr') || '').trim(); if (c.length < 3) { s.erro('Informe a condição crônica.'); return }
        if (!(await s.confirmar({ titulo: 'Registrar condição crônica', texto: `Registrar “${c}” para ${nome.split(' ')[0]}?`, detalhe: `O nível de cuidado ficará fixo em ${NIVEL_CRONICO}, conforme o protocolo. Essa ação fica registrada no prontuário.`, ok: 'Registrar e fixar nível', cancelar: 'Voltar' }))) return
        s.setPacientes(ps => ps.map(x => x.id === p.id ? { ...x, cronico: c, risco: NIVEL_CRONICO } : x)); s.addNota(p.id, { data: HOJE, hora: agora(), autor: 'Enf. Renata Lima', tipo: 'Alerta', texto: `Condição crônica registrada: ${c}. Nível fixado em ${NIVEL_CRONICO}.` }); s.toast(`Condição crônica registrada. Nível fixado em ${NIVEL_CRONICO}.`) }}>
        {!p.cronico && <><label className="sr" htmlFor="cr">Registrar condição crônica</label><input id="cr" name="cr" className="inp" style={{ flex: 1, minWidth: 180 }} placeholder="Registrar condição crônica (ex.: Diabetes tipo 2)" /><button className="btn b-soft" type="submit">Registrar</button></>}
      </form>
      <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => setMarcar(true)}><CalendarPlus size={18} aria-hidden /> Marcar atendimento para {nome.split(' ')[0]}</button>
    </div>}
    {aba === 'notas' && <div>
      <form className="subform" style={{ marginTop: 0 }} onSubmit={e => {
        e.preventDefault(); const f = new FormData(e.currentTarget); const t = String(f.get('ntx') || '').trim()
        if (t.length < 10) { s.erro('Escreva a anotação com pelo menos 10 caracteres.'); document.getElementById('ntx')?.focus(); return }
        s.addNota(p.id, { data: HOJE, hora: agora(), autor: String(f.get('nau')), tipo: f.get('ntp') as Nota['tipo'], texto: t }); e.currentTarget.reset(); s.toast('Anotação salva no prontuário.')
      }}>
        <h4><NotebookPen size={18} aria-hidden /> Nova anotação sobre o paciente</h4>
        <div className="grid-2f">
          <div><label className="f" htmlFor="ntp">Tipo</label><select id="ntp" name="ntp" className="inp"><option>Evolução</option><option>Observação</option><option>Contato</option><option>Alerta</option></select></div>
          <div><label className="f" htmlFor="nau">Profissional</label><select id="nau" name="nau" className="inp">{PROFISSIONAIS.map(x => <option key={x}>{x}</option>)}</select></div>
        </div>
        <label className="f" htmlFor="ntx">Anotação</label>
        <textarea id="ntx" name="ntx" className="inp" maxLength={1000} placeholder="Ex.: Paciente relata melhora no sono. Orientada sobre redução de sal. Combinar retorno por vídeo." />
        <button className="btn b-pri w100" style={{ marginTop: 12 }} type="submit">Salvar anotação</button>
        <p className="tiny muted" style={{ marginTop: 6 }}>Anotações são internas da equipe de saúde. Empresa e líder nunca têm acesso.</p>
      </form>
      <div className="tabs tabs-sub" role="tablist" aria-label="Filtrar anotações" style={{ marginTop: 14 }}>{(['Todas', 'Evolução', 'Observação', 'Contato', 'Alerta'] as const).map(t => <button key={t} role="tab" aria-selected={filtro === t} onClick={() => setFiltro(t)}>{t}</button>)}</div>
      {notas.filter(n => filtro === 'Todas' || n.tipo === filtro).map(n => <div className={`nota t-${n.tipo}`} key={n.id}><div className="nh"><Chip tone={n.tipo === 'Alerta' ? 'bad' : n.tipo === 'Contato' ? 'ok' : n.tipo === 'Observação' ? 'warn' : 'blue'}>{n.tipo}</Chip><span>{fmtData(n.data)} · {n.hora}</span><span>{n.autor}</span></div><p>{n.texto}</p></div>)}
      {!notas.length && <p className="muted">Nenhuma anotação ainda.</p>}
    </div>}
    {aba === 'plano' && <div>
      {dems.map(d => <div className="task" key={d.id}><span style={{ flex: 1 }}><b>{d.descricao}</b><br /><span className="small muted">Prazo {fmtData(d.prazo)}</span></span>
        <select className="inp inp-sm" aria-label={`Status de ${d.descricao}`} value={d.status} onChange={e => setDems(ds => ds.map(x => x.id === d.id ? { ...x, status: e.target.value as Demanda['status'] } : x))}>
          <option>Pendente</option><option>Em andamento</option><option>Concluída</option></select></div>)}
      <form className="row wrap" style={{ gap: 8, marginTop: 12 }} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const t = String(f.get('nd') || '').trim(); if (!t) return; setDems(ds => [...ds, { id: uid(), descricao: t, status: 'Pendente', prazo: '2026-12-15' }]); e.currentTarget.reset() }}>
        <label className="sr" htmlFor="nd">Nova demanda</label><input id="nd" name="nd" className="inp" placeholder="Nova demanda do plano de cuidado" style={{ flex: 1, minWidth: 200 }} />
        <button className="btn b-pri" type="submit">Adicionar</button></form>
    </div>}
    {aba === 'consultas' && <div>
      {docs.filter(d => d.tipo === 'consulta').map(d => <div className="task" key={d.id}><FileText aria-hidden /><span style={{ flex: 1 }}><b>{d.titulo}</b><br /><span className="small muted">{fmtData(d.data)} · {d.diagnostico}</span></span><button className="btn b-soft btn-sm" onClick={() => setDoc(d)}>PDF</button></div>)}
      <form className="subform" onSubmit={regConsulta}><h4><FilePlus2 size={18} aria-hidden /> Registrar consulta e gerar PDF</h4>
        <div className="grid-2f"><div><label className="f" htmlFor="ct">Tipo</label><select id="ct" name="tipo" className="inp"><option>Consulta de enfermagem</option><option>Consulta médica</option><option>Nutrição</option><option>Psicologia</option></select></div>
          <div><label className="f" htmlFor="cm">Motivo</label><input id="cm" name="motivo" className="inp" defaultValue="Acompanhamento do plano de cuidado" /></div></div>
        <label className="f" htmlFor="ca">Avaliação</label><input id="ca" name="aval" className="inp" defaultValue="PA 136/88 mmHg. Peso 84 kg. Relata caminhadas 3x/semana." />
        <div className="grid-2f"><div><label className="f" htmlFor="cd">Diagnóstico</label><input id="cd" name="diag" className="inp" defaultValue="Hipertensão arterial em controle" /></div>
          <div><label className="f" htmlFor="cc">CID-10</label><input id="cc" name="cid" className="inp" defaultValue="I10" /></div></div>
        <label className="f" htmlFor="co">Conduta</label><input id="co" name="cond" className="inp" defaultValue="Manter medicação e caminhada. Reforçada redução de sal." />
        <label className="f" htmlFor="cr">Retorno</label><input id="cr" name="ret" className="inp" defaultValue="Retorno em 6 meses." />
        <button className="btn b-pri w100" style={{ marginTop: 14 }} type="submit">Salvar e gerar PDF</button></form>
    </div>}
    {aba === 'exames' && <div>
      {docs.filter(d => d.tipo === 'exame').length === 0 && <p className="muted">Nenhum exame registrado.</p>}
      {docs.filter(d => d.tipo === 'exame').map(d => <div className="task" key={d.id}><FileText aria-hidden /><span style={{ flex: 1 }}><b>{d.titulo}</b> {d.enviadoPeloPaciente && !d.avaliado && <Chip tone="warn">novo · enviado pela paciente</Chip>}<br /><span className="small muted">{fmtData(d.data)}{d.resultado ? ` · ${d.resultado}` : ''}</span></span>
        <button className="btn b-soft btn-sm" onClick={() => setDoc(d)}>Ver</button>
        {d.enviadoPeloPaciente && !d.avaliado && <button className="btn b-ok btn-sm" onClick={() => { s.setDocs(ds => ds.map(x => x.id === d.id ? { ...x, avaliado: true } : x)); s.toast('Exame marcado como avaliado. A paciente vê o aviso no app.', { desfazer: () => s.setDocs(ds => ds.map(x => x.id === d.id ? { ...x, avaliado: false } : x)) }) }}><CheckCircle2 size={16} aria-hidden /> Avaliado</button>}</div>)}
      <form className="subform" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const t = String(f.get('en') || '').trim(); if (t.length < 3) { s.erro('Informe o nome do exame.'); return } add({ tipo: 'exame', titulo: t, data: '2026-11-15', exameTipo: 'Sangue', resultado: String(f.get('er') || ''), avaliado: true }); e.currentTarget.reset(); s.toast('Resultado registrado.') }}>
        <h4>Registrar resultado de exame</h4>
        <div className="grid-2f"><div><label className="f" htmlFor="en">Exame</label><input id="en" name="en" className="inp" placeholder="Ex.: Hemoglobina glicada" /></div><div><label className="f" htmlFor="er">Resultado</label><input id="er" name="er" className="inp" placeholder="Ex.: 5,6%" /></div></div>
        <button className="btn b-pri w100" style={{ marginTop: 14 }} type="submit">Registrar</button></form>
    </div>}
    {aba === 'atestados' && <div>
      {docs.filter(d => d.tipo === 'atestado').map(d => <div className="task" key={d.id}><FileText aria-hidden /><span style={{ flex: 1 }}><b>{d.titulo}</b><br /><span className="small muted">{fmtData(d.data)}</span></span><button className="btn b-soft btn-sm" onClick={() => setDoc(d)}>PDF</button></div>)}
      <form className="subform" onSubmit={emitirAtestado}><h4><FilePlus2 size={18} aria-hidden /> Emitir atestado</h4>
        <div className="grid-2f"><div><label className="f" htmlFor="ad">Dias de afastamento</label><select id="ad" name="dias" className="inp"><option value="0">0 · só comparecimento</option><option value="1">1 dia</option><option value="2">2 dias</option><option value="3">3 dias</option></select></div>
          <div><label className="f" htmlFor="ai">A partir de</label><input id="ai" name="inicio" type="date" className="inp" defaultValue="2026-11-15" /></div></div>
        <div className="grid-2f"><div><label className="f" htmlFor="acid">CID-10 (opcional)</label><input id="acid" name="cid" className="inp" placeholder="Ex.: J06.9" /></div>
          <label className="cb" style={{ marginTop: 36 }}><input type="checkbox" name="autoriza" /> Paciente autorizou mostrar o CID</label></div>
        <button className="btn b-pri w100" style={{ marginTop: 14 }} type="submit">Emitir atestado</button></form>
    </div>}
    {doc && <DocView d={doc} paciente={nome} onClose={() => setDoc(null)} />}
    {marcar && <MarcarModal paciente={p} onClose={() => setMarcar(false)} />}
  </Modal>
}

export function EnfAgenda() {
  const { marcacoes, setMarcacoes, toast, addNota, confirmar, erro } = useStore()
  const [novo, setNovo] = useState(false)
  const dias = Array.from(new Set(marcacoes.map(m => m.data))).sort()
  const [dia, setDia] = useState(HOJE)
  const lista = marcacoes.filter(m => m.data === dia).sort((a, b) => a.hora.localeCompare(b.hora))
  const setPres = (id: string, v: 'Presente' | 'Faltou') => setMarcacoes(ms => ms.map(m => m.id === id ? { ...m, presenca: v } : m))
  return <>
    <div className="page-head row between wrap"><div><p className="eyebrow">AGENDA DA EQUIPE</p><h1>Agenda e marcações</h1><p className="muted">Atendimentos por dia. Marque novos atendimentos e registre a presença.</p></div>
      <button className="btn b-pri btn-lg" onClick={() => setNovo(true)}><CalendarPlus size={20} aria-hidden /> Nova marcação</button></div>
    <div className="tabs" role="tablist" aria-label="Dia">{(dias.includes(HOJE) ? dias : [HOJE, ...dias]).map(d => <button key={d} role="tab" aria-selected={dia === d} onClick={() => setDia(d)}>{d === HOJE ? 'Hoje' : fmtData(d, { weekday: 'short', day: '2-digit', month: '2-digit' })} ({marcacoes.filter(m => m.data === d).length})</button>)}</div>
    <section className="card table-wrap">{lista.length === 0 ? <p className="muted">Nenhum atendimento neste dia.</p> : <table className="rtable"><thead><tr><th>Hora</th><th>Paciente</th><th>Atendimento</th><th>Modalidade</th><th>Profissional</th><th>Presença</th></tr></thead>
      <tbody>{lista.map(m => <tr key={m.id}><td data-label="Hora"><b>{m.hora}</b></td><td data-label="Paciente">{m.paciente}</td><td data-label="Atendimento">{m.atendimento}</td><td data-label="Modalidade" className="muted">{m.modalidade}</td><td data-label="Profissional" className="muted">{m.profissional}</td>
        <td data-label="Presença">{m.presenca ? <Chip tone={m.presenca === 'Presente' ? 'ok' : 'bad'}>{m.presenca}</Chip> : m.data > HOJE ? <Chip tone="blue">Agendado</Chip> : <div className="row" style={{ gap: 6 }}>
          <button className="btn b-ok btn-sm" onClick={() => { setPres(m.id, 'Presente'); toast(`Presença de ${m.paciente} registrada.`, { desfazer: () => setMarcacoes(ms => ms.map(x => x.id === m.id ? { ...x, presenca: undefined } : x)) }) }}>Presente</button>
          <button className="btn b-line btn-sm" onClick={async () => { if (!(await confirmar({ titulo: 'Registrar falta', texto: `Registrar falta de ${m.paciente}?`, detalhe: 'A falta entra no cálculo de risco e o paciente recebe uma mensagem perguntando o motivo (simulada no protótipo).', ok: 'Registrar falta', cancelar: 'Voltar', perigo: true }))) return; setPres(m.id, 'Faltou'); const tirar = addNota(m.pacienteId, { data: HOJE, hora: m.hora, autor: 'Enf. Renata Lima', tipo: 'Observação', texto: `Faltou ao atendimento (${m.atendimento}). Mensagem perguntando o motivo (simulada).` }); toast(`${m.paciente}: falta registrada.`, { desfazer: () => { tirar(); setMarcacoes(ms => ms.map(x => x.id === m.id ? { ...x, presenca: undefined } : x)) } }) }}>Faltou</button></div>}</td></tr>)}</tbody></table>}</section>
    {novo && <MarcarModal onClose={() => setNovo(false)} />}
  </>
}
