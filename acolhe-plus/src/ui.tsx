import { useEffect, useRef, type ReactNode } from 'react'
import { Volume2, X, CheckCircle2, AlertCircle, Printer, Download } from 'lucide-react'
import { useStore } from './store'
import { type Documento, fmtData } from './data'
import logo from './assets/acolhe-logo.png'

// Proporção fixa do arquivo (852×185). width/height no HTML reservam o espaço certo; object-fit impede distorção
export const Logo = ({ h = 34 }: { h?: number }) => <img className="logo-img" src={logo} alt="Acolhe+" width={Math.round(h * 852 / 185)} height={h} style={{ height: h, width: 'auto' }} />

export function Listen({ text, label = 'Ouvir' }: { text: string; label?: string }) {
  const { speak } = useStore()
  return <button className="listen" onClick={() => speak(text)}><Volume2 size={18} aria-hidden /> {label}</button>
}

export function Progress({ value, label, tone = 'ok' }: { value: number; label: string; tone?: 'ok' | 'light' | 'blue' }) {
  const v = Math.round(value * 100)
  return <div className={`bar bar-${tone}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: `${v}%` }} /></div>
}

export function Modal({ title, onClose, children, wide, alerta, descId }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; alerta?: boolean; descId?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  // Guarda o onClose mais recente sem reexecutar o efeito: assim o foco só é movido ao ABRIR a janela,
  // e não a cada letra digitada (bug: o cursor pulava da caixa de texto para as opções).
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    const first = el?.querySelector<HTMLElement>('[data-autofocus], button:not(.iconbtn), input, select, textarea, a[href]')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      const todas = document.querySelectorAll('.dlg')
      if (el && todas[todas.length - 1] !== el) return // só a janela do topo responde
      if (e.key === 'Escape') { e.stopImmediatePropagation(); closeRef.current() }
      if (e.key === 'Tab' && el) {
        const f = Array.from(el.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"]')).filter(x => !x.hasAttribute('disabled'))
        if (!f.length) return
        const a = f[0], z = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [])
  return <div className="ov" onMouseDown={e => { if (e.target === e.currentTarget) closeRef.current() }}>
    <div className={`dlg ${wide ? 'dlg-wide' : ''}`} role={alerta ? 'alertdialog' : 'dialog'} aria-modal="true" aria-label={title} aria-describedby={descId} ref={ref}>
      <div className="dlg-head"><h2>{title}</h2><button className="iconbtn" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
      {children}
    </div>
  </div>
}

export function Toast() {
  const { toastMsg, setToastMsg, toastOpt, toastSeq } = useStore()
  const erro = toastOpt.tipo === 'erro'
  const desfazer = toastOpt.desfazer
  // Mais tempo quando dá para desfazer ou quando é erro (a pessoa precisa ler e agir)
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(''), desfazer ? 8000 : erro ? 6000 : 3500); return () => clearTimeout(t) }, [toastMsg, toastSeq]) // eslint-disable-line
  return <>
    <div className="toast-wrap" role="status" aria-live="polite">
      {toastMsg && !erro && <div className="toast"><CheckCircle2 size={20} aria-hidden /><span className="toast-txt">{toastMsg}</span>
        {desfazer && <button className="toast-undo" onClick={() => { desfazer(); setToastMsg('') }}>{toastOpt.rotuloDesfazer ?? 'Desfazer'}</button>}
        <button onClick={() => setToastMsg('')} aria-label="Fechar aviso">×</button></div>}
    </div>
    <div className="toast-wrap" role="alert" aria-live="assertive">
      {toastMsg && erro && <div className="toast toast-erro"><AlertCircle size={20} aria-hidden /><span className="toast-txt">{toastMsg}</span><button onClick={() => setToastMsg('')} aria-label="Fechar aviso">×</button></div>}
    </div>
  </>
}

export const Chip = ({ tone = 'blue', children }: { tone?: 'blue' | 'ok' | 'warn' | 'bad' | 'gold' | 'gray'; children: ReactNode }) =>
  <span className={`chip c-${tone}`}>{children}</span>

/* ---------- Documento em formato de PDF ---------- */
export function DocView({ d, paciente = 'Juliana Barros Alves', onClose }: { d: Documento; paciente?: string; onClose: () => void }) {
  const { toast } = useStore()
  function imprimir() {
    try { document.body.classList.add('printing'); window.print() } catch { toast('Use Ctrl+P para salvar em PDF.') }
    setTimeout(() => document.body.classList.remove('printing'), 500)
  }
  return <Modal title={d.titulo} onClose={onClose} wide>
    <div className="doc print-area" aria-label={`Documento: ${d.titulo}`}>
      <div className="doc-head"><Logo h={24} /><div className="doc-org"><b>SESI Saúde Acolhe</b><span>Atenção Primária à Saúde</span></div></div>
      <h3 className="doc-title">{d.tipo === 'consulta' ? 'Resumo de atendimento' : d.tipo === 'atestado' ? (d.dias ? 'Atestado médico' : 'Declaração de comparecimento') : 'Resultado de exame'}</h3>
      <dl className="doc-meta">
        <div><dt>Paciente</dt><dd>{paciente}</dd></div>
        <div><dt>Data</dt><dd>{fmtData(d.data)}</dd></div>
        {d.profissional && <div><dt>Profissional</dt><dd>{d.profissional} · {d.registro}</dd></div>}
      </dl>
      {d.tipo === 'consulta' && <>
        <section><h4>Motivo do atendimento</h4><p>{d.motivo}</p></section>
        <section><h4>Avaliação</h4><p>{d.avaliacao}</p></section>
        <section><h4>Diagnóstico</h4><p>{d.diagnostico}{d.cid ? ` (CID-10 ${d.cid})` : ''}</p></section>
        <section><h4>Conduta e orientações</h4><p>{d.conduta}</p></section>
        <section><h4>Retorno</h4><p>{d.retorno}</p></section>
      </>}
      {d.tipo === 'atestado' && <section><p className="doc-body">
        {d.dias
          ? <>Atesto, para os devidos fins, que <b>{paciente}</b> foi atendida nesta data e necessita de <b>{d.dias} dia(s)</b> de afastamento de suas atividades a partir de {fmtData(d.inicio || d.data)}.{d.mostrarCid && d.cid ? <> CID-10: {d.cid} (informado com autorização da paciente).</> : null}</>
          : <>Declaro, para os devidos fins, que <b>{paciente}</b> compareceu a atendimento de saúde nesta unidade em {fmtData(d.data)}.</>}
      </p></section>}
      {d.tipo === 'exame' && <>
        <section><h4>Exame</h4><p>{d.titulo} · {d.exameTipo}</p></section>
        {d.resultado && <section><h4>Resultado</h4><p>{d.resultado}</p></section>}
        {d.arquivoUrl && (d.arquivoTipo?.startsWith('image/')
          ? <img src={d.arquivoUrl} alt={`Arquivo do exame ${d.titulo}`} className="doc-img" />
          : <p><a href={d.arquivoUrl} target="_blank" rel="noreferrer">Abrir arquivo enviado ({d.arquivoNome})</a></p>)}
        <p className="small muted">{d.enviadoPeloPaciente ? (d.avaliado ? 'Enviado pela paciente · avaliado pela equipe.' : 'Enviado pela paciente · aguardando avaliação da equipe.') : 'Resultado registrado pela equipe de saúde.'}</p>
      </>}
      <div className="doc-sign">{d.profissional ? <><span className="line" />{d.profissional}<br /><small>{d.registro} · assinatura digital (demonstração)</small></> : null}</div>
      <p className="doc-foot">Documento demonstrativo · dados fictícios · Acolhe+ · Equipe Nexus</p>
    </div>
    <div className="row wrap" style={{ marginTop: 16, gap: 10 }}>
      <button className="btn b-pri" onClick={imprimir}><Download size={18} aria-hidden /> Baixar PDF</button>
      <button className="btn b-line" onClick={imprimir}><Printer size={18} aria-hidden /> Imprimir</button>
    </div>
    <p className="tiny muted" style={{ marginTop: 8 }}>No navegador, escolha “Salvar como PDF” na janela de impressão.</p>
  </Modal>
}

/* ---------- Confirmação de ações ---------- */
export function ConfirmDialog() {
  const { confirmReq, responderConfirm } = useStore()
  if (!confirmReq) return null
  const c = confirmReq
  return <Modal title={c.titulo} onClose={() => responderConfirm(false)} alerta descId="confirm-desc">
    <div className={`confirm-ico ${c.perigo ? 'danger' : ''}`} aria-hidden>{c.perigo ? '⚠️' : '❔'}</div>
    <div id="confirm-desc"><p className="confirm-txt">{c.texto}</p>
    {c.detalhe && <p className="small muted" style={{ textAlign: 'center' }}>{c.detalhe}</p>}</div>
    <div className="confirm-btns">
      <button className="btn b-line" data-autofocus onClick={() => responderConfirm(false)}>{c.cancelar ?? 'Voltar'}</button>
      <button className={`btn ${c.perigo ? 'b-danger' : 'b-pri'}`} onClick={() => responderConfirm(true)}>{c.ok ?? 'Confirmar'}</button>
    </div>
  </Modal>
}
