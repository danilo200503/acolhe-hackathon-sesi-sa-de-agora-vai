import { useState, type FormEvent } from 'react'
import { FileText, FileUp, Paperclip, Pill, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import { Chip, DocView, Listen, Modal } from '../ui'
import { RiscoSteps } from './ColabInicio'
import { fmtData, type Documento } from '../data'

/* ================= MINHA SAÚDE (prontuário do colaborador) ================= */
export function ColabSaude() {
  const { demandas, docs, pacientes, saudeAba, setSaudeAba } = useStore()
  const [doc, setDoc] = useState<Documento | null>(null)
  const pac = pacientes.find(p => p.id === 'p1')
  const risco = pac?.risco ?? 3
  const cronico = pac?.cronico
  const novos = docs.filter(d => d.tipo === 'exame' && d.enviadoPeloPaciente && !d.avaliado).length
  const sys = [152, 148, 145, 142, 139, 136]
  const P = (v: number, i: number) => `${40 + i * 96},${150 - (v - 125) * 4.2}`
  const consultas = docs.filter(d => d.tipo === 'consulta')
  return <>
    <div className="page-head"><p className="eyebrow">MINHA SAÚDE</p><h1>Minha saúde</h1><p className="muted">Seu plano, sua evolução, seus documentos e exames, em linguagem simples. Só você e a equipe de saúde veem.</p></div>
    <div className="tabs" role="tablist" aria-label="Minha saúde">
      <button role="tab" aria-selected={saudeAba === 'resumo'} onClick={() => setSaudeAba('resumo')}>Resumo e plano</button>
      <button role="tab" aria-selected={saudeAba === 'docs'} onClick={() => setSaudeAba('docs')}>Documentos e exames ({docs.length}){novos ? ' •' : ''}</button>
    </div>
    {saudeAba === 'docs' ? <ColabDocumentos embedded /> : <div className="grid2">
      <div>
        <section className="card"><div className="row between wrap"><h3>Como está minha saúde hoje?</h3><Listen text={`Seu nível de cuidado é ${risco}.${cronico ? ` Como você tem ${cronico.toLowerCase()}, uma condição crônica, o nível fica sempre em ${risco}.` : ''} O retorno é a cada ${risco >= 3 ? 3 : 6} meses.`} /></div>
          <RiscoSteps atual={risco} /><p>Retorno a cada <b>{risco >= 3 ? '3' : '6'} meses</b>.</p>
          {cronico && <p className="lock-note">🔒 <span>Você tem <b>{cronico.toLowerCase()}</b>, uma condição crônica. Por isso seu nível fica <b>sempre em {risco}</b>: não é nota nem castigo, é a garantia de acompanhamento de perto. O que muda com o seu esforço são as suas metas.</span></p>}</section>
        <section className="card"><h3>Plano de cuidado</h3>
          {demandas.map(d => <div className="task" key={d.id}><span className={`tick-s ${d.status === 'Concluída' ? 'on' : ''}`} aria-hidden>{d.status === 'Concluída' ? '✓' : ''}</span>
            <div style={{ flex: 1 }}><b>{d.descricao}</b><div className="small muted">Prazo {fmtData(d.prazo)}</div></div>
            <Chip tone={d.status === 'Concluída' ? 'ok' : d.status === 'Em andamento' ? 'blue' : 'warn'}>{d.status}</Chip></div>)}</section>
        <section className="card"><h3><Pill size={20} aria-hidden /> Medicamentos e alergias</h3>
          <div className="task"><b style={{ flex: 1 }}>Losartana 50 mg</b><span className="small muted">1 comprimido às 8h</span></div>
          <div className="task"><AlertTriangle size={20} aria-hidden color="#9A5B00" /><span style={{ flex: 1 }}>Alergia a dipirona</span></div></section>
      </div>
      <div>
        <section className="card"><div className="row between"><h3>Minha pressão</h3><Chip tone="ok">−16 em 6 meses</Chip></div>
          <svg viewBox="0 0 560 190" width="100%" role="img" aria-label="Pressão máxima: de 152 em junho para 136 em novembro. Meta: 130.">
            <line x1="20" x2="540" y1={150 - (130 - 125) * 4.2} y2={150 - (130 - 125) * 4.2} stroke="#0E7A55" strokeDasharray="6 6" />
            <text x="540" y={144 - (130 - 125) * 4.2} fontSize="13" textAnchor="end" fill="#0E7A55">meta 13 por 8,5</text>
            <polyline points={sys.map(P).join(' ')} fill="none" stroke="#006CBE" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            {sys.map((v, i) => <g key={i}><circle cx={40 + i * 96} cy={150 - (v - 125) * 4.2} r="6" fill="#fff" stroke="#006CBE" strokeWidth="3" />
              <text x={40 + i * 96} y={134 - (v - 125) * 4.2} fontSize="14" fontWeight="700" textAnchor="middle" fill="#0B1F3A">{v}</text>
              <text x={40 + i * 96} y="182" fontSize="13" textAnchor="middle" fill="#4A5B73">{['jun', 'jul', 'ago', 'set', 'out', 'nov'][i]}</text></g>)}
          </svg>
          <p className="answer">🎯 Comparado a 3 meses atrás, você está melhor na pressão (142 → 136) e no peso (86 → 84 kg).</p></section>
        <section className="card"><h3>Histórico de consultas</h3>
          {consultas.map(c => <div className="task" key={c.id}><FileText aria-hidden /><div style={{ flex: 1 }}><b>{c.titulo}</b><div className="small muted">{fmtData(c.data)} · {c.profissional}</div><div className="small">Diagnóstico: {c.diagnostico}</div></div>
            <button className="btn b-soft btn-sm" onClick={() => setDoc(c)}>Ver PDF</button></div>)}
          <button className="btn b-line w100" style={{ marginTop: 10 }} onClick={() => setSaudeAba('docs')}>Ver todos os documentos e exames</button></section>
      </div>
    </div>}
    {doc && <DocView d={doc} onClose={() => setDoc(null)} />}
  </>
}

/* ================= DOCUMENTOS E EXAMES ================= */
export function ColabDocumentos({ embedded }: { embedded?: boolean }) {
  const { docs, addDoc, toast, ganhar, erro } = useStore()
  const [f, setF] = useState<'todos' | 'consulta' | 'atestado' | 'exame'>('todos')
  const [doc, setDoc] = useState<Documento | null>(null)
  const [up, setUp] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const lista = docs.filter(d => f === 'todos' || d.tipo === f)
  const nomes = { consulta: 'Resumo de consulta (PDF)', atestado: 'Atestado', exame: 'Resultado de exame' }
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const file = fd.get('arquivo') as File | null
    const titulo = String(fd.get('nome') || '').trim()
    const data = String(fd.get('data') || '')
    if (titulo.length < 3) { erro('Informe o nome do exame (ex.: Hemograma).'); document.getElementById('nome')?.focus(); return }
    if (data && data > '2026-11-15') { erro('A data do exame não pode ser no futuro.'); return }
    const temArq = file && file.size > 0
    if (temArq) {
      const okTipo = /^(application\/pdf|image\/(jpeg|png|webp|heic))$/.test(file!.type) || /\.(pdf|jpe?g|png|webp|heic)$/i.test(file!.name)
      if (!okTipo) { erro('Envie o resultado em PDF ou foto (JPG ou PNG).'); return }
      if (file!.size > 10 * 1024 * 1024) { erro('Arquivo muito grande. O limite é 10 MB.'); return }
    }
    setEnviando(true)
    addDoc({ tipo: 'exame', titulo, data: String(fd.get('data') || '2026-11-15'), exameTipo: String(fd.get('tipoEx')), resultado: String(fd.get('obs') || '') || undefined,
      enviadoPeloPaciente: true, avaliado: false, arquivoNome: temArq ? file!.name : undefined, arquivoUrl: temArq ? URL.createObjectURL(file!) : undefined, arquivoTipo: temArq ? file!.type : undefined })
    setEnviando(false); setUp(false); ganhar(20); toast('Resultado enviado para a equipe de saúde. +20 pontos')
  }
  return <>
    <div className={embedded ? 'row between wrap' : 'page-head row between wrap'} style={embedded ? { margin: '4px 0 14px', gap: 10 } : undefined}>{embedded ? <p className="muted" style={{ margin: 0 }}>Atestados, resumos das consultas em PDF e resultados de exames.</p> : <div><p className="eyebrow">DOCUMENTOS</p><h1>Documentos e exames</h1><p className="muted">Atestados, resumos das consultas em PDF e resultados de exames.</p></div>}
      <button className="btn b-pri btn-lg" onClick={() => setUp(true)}><FileUp size={20} aria-hidden /> Adicionar resultado de exame</button></div>
    <div className="tabs tabs-sub" role="tablist" aria-label="Filtrar documentos">
      {([['todos', 'Todos'], ['consulta', 'Consultas'], ['atestado', 'Atestados'], ['exame', 'Exames']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)}>{l}</button>)}
    </div>
    <div className="doc-grid">
      {lista.map(d => <article className="card doc-card" key={d.id}>
        <div className={`doc-ic t-${d.tipo}`} aria-hidden><FileText /></div>
        <div style={{ flex: 1, minWidth: 0 }}><span className="tiny muted">{nomes[d.tipo]}</span><h3>{d.titulo}</h3><p className="small muted">{fmtData(d.data)}{d.profissional ? ` · ${d.profissional}` : ''}</p>
          {d.enviadoPeloPaciente && <Chip tone={d.avaliado ? 'ok' : 'warn'}>{d.avaliado ? 'Avaliado pela equipe' : 'Aguardando avaliação'}</Chip>}
          {d.arquivoNome && <p className="tiny muted"><Paperclip size={14} aria-hidden /> {d.arquivoNome}</p>}</div>
        <button className="btn b-soft btn-sm" onClick={() => setDoc(d)}>Abrir</button>
      </article>)}
    </div>
    {doc && <DocView d={doc} onClose={() => setDoc(null)} />}
    {up && <Modal title="Adicionar resultado de exame" onClose={() => setUp(false)}>
      <form onSubmit={enviar}>
        <p className="muted small">Fez exame fora do SESI? Envie aqui. A equipe de enfermagem recebe e avalia.</p>
        <label className="f" htmlFor="nome">Nome do exame</label><input id="nome" name="nome" className="inp" placeholder="Ex.: Hemograma completo" required />
        <div className="grid-2f">
          <div><label className="f" htmlFor="tipoEx">Tipo</label><select id="tipoEx" name="tipoEx" className="inp"><option>Sangue</option><option>Urina</option><option>Imagem</option><option>Outro</option></select></div>
          <div><label className="f" htmlFor="data">Data do exame</label><input id="data" name="data" type="date" className="inp" defaultValue="2026-11-14" /></div>
        </div>
        <label className="f" htmlFor="arquivo">Arquivo (PDF ou foto)</label><input id="arquivo" name="arquivo" type="file" accept="application/pdf,image/*" className="inp file" />
        <label className="f" htmlFor="obs">Resultado ou observação (opcional)</label><input id="obs" name="obs" className="inp" placeholder="Ex.: Glicose 102 mg/dL" />
        <button className="btn b-pri w100 btn-lg" style={{ marginTop: 18 }} type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? 'Enviando…' : 'Enviar para a equipe'}</button>
      </form>
    </Modal>}
  </>
}
