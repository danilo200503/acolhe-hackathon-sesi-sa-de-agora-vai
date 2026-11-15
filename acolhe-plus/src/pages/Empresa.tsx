import { useState, type FormEvent } from 'react'
import { ShieldCheck, UserCog, Clock, Download, Trash2, Newspaper, PlusCircle } from 'lucide-react'
import { CalButtons, baixarIcs, type CalItem } from '../cal'
import { useStore } from '../store'
import { Chip, Modal } from '../ui'
import { DIAS_SEMANA, HORAS, janelaPadrao, uid, fmtData, type Funcionario, type Janela } from '../data'

export function EmpPainel() {
  const meses = ['jun', 'jul', 'ago', 'set', 'out', 'nov'], att = [49, 51, 55, 58, 61, 64], eng = [22, 31, 40, 48, 55, 61]
  return <>
    <div className="page-head"><p className="eyebrow">EMPRESA · METALSUL (FICTÍCIA)</p><h1>Painel da empresa</h1><p className="muted">Adesão e impacto do programa, sem nenhum dado de saúde individual.</p></div>
    <div className="privacy wide"><ShieldCheck size={24} aria-hidden /><span>A empresa vê dados funcionais e indicadores agregados de grupos com 10 ou mais pessoas. <b>Não vê consultas, exames, atestados com CID nem diagnósticos.</b></span></div>
    <div className="stats-grid">
      <div className="card stat"><strong>61%</strong><span>Participando da jornada</span></div>
      <div className="card stat"><strong>64%</strong><span>Comparecimento às consultas</span></div>
      <div className="card stat"><strong>412 h</strong><span>Horas de produção preservadas</span></div>
      <div className="card stat"><strong>≈ R$ 21 mil</strong><span>Impacto estimado por ano</span></div>
    </div>
    <section className="card"><h2>Participação e comparecimento · 180 pessoas</h2>
      <div className="bars-chart" role="img" aria-label="Comparecimento de 49% em junho para 64% em novembro; participação de 22% para 61%">
        {meses.map((m, i) => <div className="bc-col" key={m}><div className="bc-pair"><i className="bc-a" style={{ height: `${att[i] * 2}px` }}><span>{att[i]}%</span></i><i className="bc-b" style={{ height: `${eng[i] * 2}px` }}><span>{eng[i]}%</span></i></div><small>{m}</small></div>)}
      </div>
      <div className="legend"><span><i className="lg-a" />Comparecimento</span><span><i className="lg-b" />Participando da jornada</span></div>
    </section>
  </>
}

function JanelaEditor({ f, onClose }: { f: Funcionario; onClose: () => void }) {
  const { setFuncionarios, toast, confirmar, erro } = useStore()
  const [j, setJ] = useState<Janela>(() => (f.janela ?? janelaPadrao()).map(r => [...r]))
  const [max, setMax] = useState(f.maxSemana)
  const toggle = (d: number, h: number) => setJ(x => x.map((r, di) => di === d ? r.map((v, hi) => hi === h ? !v : v) : r))
  const preset = (fn: (h: number) => boolean) => setJ(DIAS_SEMANA.map(() => HORAS.map(fn)))
  const horasSemana = j.flat().filter(Boolean).length
  const [diaM, setDiaM] = useState(0)
  return <Modal title={`Janela de disponibilidade · ${f.nome}`} onClose={onClose} wide>
    <p className="muted small">Marque os horários em que <b>{f.nome.split(' ')[0]}</b> pode sair da linha para cuidar da saúde. O Acolhe+ só oferece consultas dentro desta janela. A empresa não vê o motivo das consultas.</p>
    <div className="row wrap" style={{ gap: 8, margin: '12px 0' }}>
      <button className="btn b-soft btn-sm" onClick={() => preset(h => h >= 13 && h <= 15)}>Depois do pico (13h–16h)</button>
      <button className="btn b-soft btn-sm" onClick={() => preset(h => h === 7 || h === 8)}>Início do turno (7h–9h)</button>
      <button className="btn b-soft btn-sm" onClick={() => preset(() => true)}>Horário todo</button>
      <button className="btn b-line btn-sm" onClick={() => preset(() => false)}>Limpar</button>
    </div>
    <div className="jgrid" role="grid" aria-label="Grade de disponibilidade: dias por horário">
      <div role="row" className="jrow"><span className="jh" />{HORAS.map(h => <span key={h} className="jh" role="columnheader">{h}h</span>)}</div>
      {DIAS_SEMANA.map((d, di) => <div role="row" className="jrow" key={d}><span className="jh" role="rowheader">{d}</span>
        {HORAS.map((h, hi) => <button key={h} role="gridcell" className={`jc ${j[di][hi] ? 'on' : ''}`} aria-pressed={j[di][hi]} aria-label={`${d} ${h}h ${j[di][hi] ? 'disponível' : 'indisponível'}`} onClick={() => toggle(di, hi)}>{j[di][hi] ? '✓' : ''}</button>)}</div>)}
    </div>
    <div className="jmobile">
      <div className="tabs" role="tablist" aria-label="Dia da semana">{DIAS_SEMANA.map((d, di) => <button key={d} role="tab" aria-selected={diaM === di} onClick={() => setDiaM(di)}>{d} <span className="tiny">({j[di].filter(Boolean).length})</span></button>)}</div>
      <p className="small muted">Toque nos horários livres de <b>{DIAS_SEMANA[diaM]}</b>:</p>
      <div className="jhours">{HORAS.map((h, hi) => <button key={h} className={`jc ${j[diaM][hi] ? 'on' : ''}`} aria-pressed={j[diaM][hi]} onClick={() => toggle(diaM, hi)}>{h}h {j[diaM][hi] ? '✓' : ''}</button>)}</div>
      <button className="btn b-line btn-sm" style={{ marginTop: 10 }} onClick={() => setJ(x => x.map(() => [...x[diaM]]))}>Copiar {DIAS_SEMANA[diaM]} para todos os dias</button>
    </div>
    <div className="row wrap" style={{ gap: 16, marginTop: 14 }}>
      <label htmlFor="mx" className="row"><b>Máximo de saídas por semana</b>
        <select id="mx" className="inp inp-sm" value={max} onChange={e => setMax(Number(e.target.value))}>{[1, 2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></label>
      <span className="small muted"><Clock size={16} aria-hidden /> {horasSemana} faixas de horário liberadas por semana</span>
    </div>
    <button className="btn b-pri w100 btn-lg" style={{ marginTop: 16 }} onClick={async () => {
      const horas = j.flat().filter(Boolean).length
      if (horas === 0) { erro('Libere pelo menos 1 horário. Sem janela, o colaborador não consegue se cuidar.'); return }
      if (horas < 2 && !(await confirmar({ titulo: 'Janela muito pequena', texto: `Só ${horas} hora liberada na semana.`, detalhe: 'Com tão pouco horário, a chance de falta aumenta. Recomendamos pelo menos 2 horas por semana.', ok: 'Salvar mesmo assim', cancelar: 'Ajustar janela', perigo: true }))) return
      const antes = { janela: f.janela, maxSemana: f.maxSemana }
      setFuncionarios(fs => fs.map(x => x.id === f.id ? { ...x, janela: j, maxSemana: max } : x)); toast(`Janela de ${f.nome.split(' ')[0]} salva (${horas} h por semana). Os horários do agendamento já foram atualizados.`, { desfazer: () => setFuncionarios(fs => fs.map(x => x.id === f.id ? { ...x, ...antes } : x)) }); onClose() }}>Salvar janela</button>
  </Modal>
}

export function EmpColaboradores() {
  const { funcionarios } = useStore()
  const [ed, setEd] = useState<Funcionario | null>(null)
  const [q, setQ] = useState('')
  const lista = funcionarios.filter(f => f.nome.toLowerCase().includes(q.toLowerCase()) || f.setor.toLowerCase().includes(q.toLowerCase()))
  return <>
    <div className="page-head"><p className="eyebrow">COLABORADORES</p><h1>Colaboradores e janelas de disponibilidade</h1><p className="muted">Acesse o colaborador e defina quando ele pode sair da linha para cuidar da saúde.</p></div>
    <label className="sr" htmlFor="busca">Buscar colaborador</label>
    <input id="busca" className="inp" placeholder="Buscar por nome ou setor" value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 14 }} />
    <section className="card table-wrap"><table className="rtable"><thead><tr><th>Colaborador</th><th>Setor</th><th>Turno</th><th>Participação</th><th>Janela</th><th><span className="sr">Ação</span></th></tr></thead>
      <tbody>{lista.map(f => <tr key={f.id}><td data-label="Colaborador"><b>{f.nome}</b></td><td data-label="Setor" className="muted">{f.setor}</td><td data-label="Turno" className="muted">{f.turno}</td>
        <td data-label="Participação"><Chip tone={f.participacao === 'Ativo na jornada' ? 'ok' : f.participacao === 'Convidado' ? 'warn' : 'gray'}>{f.participacao}</Chip></td>
        <td data-label="Janela">{f.janela ? <Chip tone="blue">{f.janela.flat().filter(Boolean).length} faixas · até {f.maxSemana}x/sem</Chip> : <Chip tone="warn">Não definida</Chip>}</td>
        <td data-label=""><button className="btn b-soft btn-sm" onClick={() => setEd(f)}><UserCog size={16} aria-hidden /> Abrir</button></td></tr>)}</tbody></table></section>
    <p className="small muted">Sem nenhum dado clínico. O agendamento do colaborador respeita a janela definida aqui.</p>
    {ed && <JanelaEditor f={ed} onClose={() => setEd(null)} />}
  </>
}

export function EmpPasses() {
  const { eventos, hoje, toast, erro } = useStore()
  const [quem, setQuem] = useState('Todos')
  const jul = eventos.filter(e => e.data >= hoje && e.status !== 'Cancelado').map(e => ['Juliana B. Alves', e.data, e.hora, e.modalidade === 'Vídeo na empresa' ? 'Vídeo na sala de saúde · 30 min' : 'Atendimento externo no SESI'])
  const outros = [['Gustavo M. Costa', '2026-11-17', '14h10', 'Vídeo na sala de saúde · 30 min'], ['Luciana Teixeira', '2026-11-18', '13h50', 'Vídeo na sala de saúde · 30 min']]
  const todos = [...jul, ...outros].sort((a, b) => (a[1] + a[2]).localeCompare(b[1] + b[2])).filter(p => quem === 'Todos' || p[0] === quem)
  const nomes = ['Todos', ...Array.from(new Set([...jul, ...outros].map(p => p[0])))]
  // Sem motivo clínico: o título só diz "Compromisso de saúde"
  const item = (p: string[]): CalItem => ({ titulo: `Compromisso de saúde · ${p[0]} (Passe Saúde)`, data: p[1], hora: p[2], minutos: p[3].startsWith('Vídeo') ? 30 : 240,
    local: p[3].startsWith('Vídeo') ? 'Sala de saúde · Metalsul' : 'Unidade SESI Saúde', detalhes: `${p[3]}. Liberação dentro da janela de disponibilidade. O motivo do atendimento é sigiloso (LGPD).` })
  return <>
    <div className="page-head row between wrap"><div><p className="eyebrow">LIDERANÇA · PASSES SAÚDE</p><h1>Agenda da equipe</h1><p className="muted">Compromissos de saúde dos colaboradores. O líder vê só o horário, nunca o motivo. Leve para o Teams ou o Google Agenda.</p></div>
      <button className="btn b-pri" onClick={() => { baixarIcs(todos.map(item), 'agenda-equipe-acolhe.ics'); toast(`${todos.length} compromisso(s) exportado(s) para importar no Teams/Outlook ou Google.`) }}><Download size={18} aria-hidden /> Baixar todos (.ics)</button></div>
    <div className="tabs" role="tablist" aria-label="Filtrar por colaborador">{nomes.map(n => <button key={n} role="tab" aria-selected={quem === n} onClick={() => setQuem(n)}>{n === 'Todos' ? 'Todos' : n.split(' ')[0]}</button>)}</div>
    <section className="card">{todos.map((p, i) => <div className="rw rw-col" key={i}>
      <div className="row" style={{ gap: 12, width: '100%' }}><span className="rw-i c-blue" aria-hidden>🛂</span><div style={{ flex: 1, minWidth: 0 }}><b>{p[0]}</b><div className="small muted">{new Date(p[1] + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} · {p[2]} · {p[3]}</div></div><Chip tone="ok">dentro da janela</Chip></div>
      <CalButtons item={item(p)} compact />
    </div>)}</section>
    <p className="small muted"><ShieldCheck size={16} aria-hidden /> O convite enviado ao calendário diz apenas “Compromisso de saúde”, sem tipo de consulta, exame ou diagnóstico.</p>
  </>
}

export function Instituto() {
  const { servicos, noticias } = useStore()
  const [periodo, setPeriodo] = useState('30')
  const [un, setUn] = useState('Todas')
  const k = periodo === '7' ? 0.25 : periodo === '90' ? 2.6 : 1
  const adesao = periodo === '7' ? 79 : periodo === '90' ? 84 : 82
  return <>
    <div className="page-head"><p className="eyebrow">VISÃO INSTITUCIONAL</p><h1>Instituto SESI</h1><p className="muted">Indicadores agregados para acompanhar a promoção da saúde nas unidades.</p></div>
    <section className="card filters">
      <label htmlFor="per">Período <select id="per" className="inp inp-sm" value={periodo} onChange={e => setPeriodo(e.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label>
      <label htmlFor="un">Unidade <select id="un" className="inp inp-sm" value={un} onChange={e => setUn(e.target.value)}><option>Todas</option><option>Unidade Industrial A</option><option>Unidade Industrial B</option></select></label>
    </section>
    <div className="stats-grid">
      <div className="card stat"><strong>{un === 'Todas' ? '10.303' : '1.248'}</strong><span>Vidas atendidas</span></div>
      <div className="card stat"><strong>{adesao}%</strong><span>Adesão ({periodo} dias)</span></div>
      <div className="card stat"><strong>64%</strong><span>Comparecimento (era ≈ 50%)</span></div>
      <div className="card stat"><strong>{Math.round(316 * k)}</strong><span>Atendimentos realizados</span></div>
    </div>
    <div className="grid2">
      <section className="card"><h2>Indicadores de promoção da saúde</h2>
        {[['Participação nas ações', adesao], ['Planos em continuidade', 74], ['Ações preventivas concluídas', 68], ['Motivos de falta registrados', 84]].map(([l, v]) =>
          <div className="bar-item" key={l as string}><div><span>{l}</span><b>{v}%</b></div><div className="bar bar-ok" role="progressbar" aria-valuenow={v as number} aria-valuemin={0} aria-valuemax={100} aria-label={l as string}><i style={{ width: `${v}%` }} /></div></div>)}
        <p className="small muted">Dados fictícios e agregados. Não exibe consultas, exames ou diagnósticos individuais.</p></section>
      <section className="card"><h2>Por que as pessoas faltam?</h2>
        {[['Esqueceu / conflito de agenda', 29], ['Chefe não liberou', 25], ['Transporte / distância', 17], ['Dúvida ou receio', 13], ['Horário ruim', 9], ['Outro motivo (escrito pelo paciente)', 7]].map(([l, v]) =>
          <div className="bar-item" key={l as string}><div><span>{l}</span><b>{v}%</b></div><div className="bar bar-blue"><i style={{ width: `${(v as number) * 2.5}%` }} /></div></div>)}
        <h2 style={{ marginTop: 18 }}>Minuto Saúde</h2><p className="small muted">{servicos.length} serviços e {noticias.length} notícias publicados para os trabalhadores.</p>
        <div className="chips">{servicos.slice(0, 6).map(c => <span key={c.id}>{c.e} {c.t}</span>)}</div></section>
    </div>
  </>
}

/* ================= INSTITUTO: GESTÃO DO MINUTO SAÚDE ================= */
export function InstMinuto() {
  const { servicos, setServicos, noticias, setNoticias, toast, confirmar, erro } = useStore()
  const [e, setE] = useState('🩺')
  const [en, setEn] = useState('📰')
  async function addServ(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const form = ev.currentTarget; const f = new FormData(form)
    const t = String(f.get('st') || '').trim(); if (t.length < 3) { erro('Informe o nome do serviço.'); document.getElementById('st')?.focus(); return }
    if (servicos.some(x => x.t.toLowerCase() === t.toLowerCase())) { erro('Esse serviço já está publicado.'); return }
    const sid = uid()
    setServicos(x => [...x, { id: sid, e, t, d: String(f.get('sd') || '').trim() || 'Novo serviço SESI' }])
    form.reset(); toast(`Serviço “${t}” publicado. Já aparece para os trabalhadores no Minuto Saúde.`, { desfazer: () => setServicos(x => x.filter(y => y.id !== sid)) })
  }
  async function addNot(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault(); const form = ev.currentTarget; const f = new FormData(form)
    const titulo = String(f.get('nt') || '').trim(); const resumo = String(f.get('nr') || '').trim(); const texto = String(f.get('nx') || '').trim()
    if (titulo.length < 10 || resumo.length < 10) { erro('Preencha título e resumo da notícia (mínimo 10 caracteres cada).'); return }
    if (noticias.some(x => x.titulo.toLowerCase() === titulo.toLowerCase())) { erro('Já existe uma notícia com esse título.'); return }
    const nid = uid()
    setNoticias(x => [{ id: nid, titulo, resumo, texto: texto || resumo, categoria: String(f.get('nc')), data: '2026-11-15', e: en }, ...x])
    form.reset(); toast('Notícia publicada no Minuto Saúde.', { desfazer: () => setNoticias(x => x.filter(y => y.id !== nid)) })
  }
  const icones = ['🩺', '🦷', '💉', '🧠', '🥗', '👁️', '🏃', '🌸', '❤️', '📹']
  return <>
    <div className="page-head"><p className="eyebrow">INSTITUTO SESI</p><h1>Minuto Saúde · gestão</h1><p className="muted">Publique novos serviços e notícias. Eles aparecem na hora para os trabalhadores no app.</p></div>
    <div className="grid2">
      <section className="card"><h2><PlusCircle size={22} aria-hidden /> Novo serviço ofertado</h2>
        <form onSubmit={addServ}>
          <label className="f" htmlFor="st">Nome do serviço</label><input id="st" name="st" className="inp" placeholder="Ex.: Avaliação de saúde bucal" />
          <label className="f" htmlFor="sd">Descrição curta</label><input id="sd" name="sd" className="inp" placeholder="Ex.: Com dentista na unidade SESI" />
          <p className="f" id="sic">Ícone</p>
          <div className="emoji-row" role="group" aria-labelledby="sic">{icones.map(x => <button type="button" key={x} className="emoji" aria-pressed={e === x} aria-label={`Ícone ${x}`} onClick={() => setE(x)}>{x}</button>)}</div>
          <button className="btn b-pri w100" style={{ marginTop: 14 }} type="submit">Publicar serviço</button>
        </form>
        <h3 style={{ marginTop: 18 }}>Serviços publicados ({servicos.length})</h3>
        {servicos.map(sv => <div className="task" key={sv.id}><span aria-hidden style={{ fontSize: '1.3rem' }}>{sv.e}</span><span style={{ flex: 1, minWidth: 0 }}><b>{sv.t}</b><br /><span className="small muted">{sv.d}</span></span>
          <button className="btn b-line btn-sm" aria-label={`Remover ${sv.t}`} onClick={async () => { if (!(await confirmar({ titulo: 'Remover serviço', texto: `Remover “${sv.t}”?`, detalhe: 'O serviço deixa de aparecer para os trabalhadores.', ok: 'Remover serviço', cancelar: 'Manter serviço', perigo: true }))) return; const antes = servicos; setServicos(x => x.filter(y => y.id !== sv.id)); toast('Serviço removido.', { desfazer: () => setServicos(antes) }) }}><Trash2 size={16} aria-hidden /></button></div>)}
      </section>
      <section className="card"><h2><Newspaper size={22} aria-hidden /> Nova notícia</h2>
        <form onSubmit={addNot}>
          <label className="f" htmlFor="nt">Título</label><input id="nt" name="nt" className="inp" placeholder="Ex.: Mutirão de vacinação nas fábricas" />
          <div className="grid-2f"><div><label className="f" htmlFor="nc">Categoria</label><select id="nc" name="nc" className="inp"><option>Campanha</option><option>Família</option><option>Inovação</option><option>Prevenção</option><option>Evento</option></select></div>
            <div><p className="f" id="nic">Ícone</p><div className="emoji-row" role="group" aria-labelledby="nic">{['📰', '💉', '💙', '🎉', '🏃'].map(x => <button type="button" key={x} className="emoji" aria-pressed={en === x} aria-label={`Ícone ${x}`} onClick={() => setEn(x)}>{x}</button>)}</div></div></div>
          <label className="f" htmlFor="nr">Resumo (aparece na lista)</label><input id="nr" name="nr" className="inp" maxLength={140} placeholder="Uma frase sobre a notícia" />
          <label className="f" htmlFor="nx">Texto completo</label><textarea id="nx" name="nx" className="inp" placeholder="Escreva a notícia. Use linhas em branco para separar parágrafos." />
          <button className="btn b-pri w100" style={{ marginTop: 14 }} type="submit">Publicar notícia</button>
        </form>
        <h3 style={{ marginTop: 18 }}>Notícias publicadas ({noticias.length})</h3>
        {noticias.map(n => <div className="task" key={n.id}><span aria-hidden style={{ fontSize: '1.3rem' }}>{n.e}</span><span style={{ flex: 1, minWidth: 0 }}><b>{n.titulo}</b><br /><span className="small muted">{n.categoria} · {fmtData(n.data)}</span></span>
          <button className="btn b-line btn-sm" aria-label={`Remover notícia ${n.titulo}`} onClick={async () => { if (!(await confirmar({ titulo: 'Remover notícia', texto: `Remover “${n.titulo}”?`, detalhe: 'A notícia deixa de aparecer para os trabalhadores.', ok: 'Remover notícia', cancelar: 'Manter notícia', perigo: true }))) return; const antes = noticias; setNoticias(x => x.filter(y => y.id !== n.id)); toast('Notícia removida.', { desfazer: () => setNoticias(antes) }) }}><Trash2 size={16} aria-hidden /></button></div>)}
      </section>
    </div>
    <p className="small muted">Dica: troque para a visualização “Colaborador(a)” e abra Minuto Saúde para ver o que foi publicado.</p>
  </>
}
