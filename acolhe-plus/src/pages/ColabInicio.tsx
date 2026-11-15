import { useState } from 'react'
import { ShieldCheck, CalendarDays, FileText, Target, Gift, ChevronRight, HeartPulse, Users } from 'lucide-react'
import { useStore } from '../store'
import { Listen, Progress, Chip, Modal } from '../ui'
import { PROPOSITOS, RISCO, MOTIVOS, EMOJIS, type Motivo, progressoMeta, faltaMeta, fmtData, diaSemana } from '../data'
import type { Go } from '../App'

export function objetivoGeral(metas: ReturnType<typeof useStore>['metas']) {
  return metas.reduce((s, m) => s + progressoMeta(m), 0) / metas.length
}

export function RiscoSteps({ atual }: { atual: number }) {
  return <ol className="risk-steps" aria-label="Nível de cuidado">
    {RISCO.map(r => <li key={r.n} className={`step ${r.cor} ${r.n === atual ? 'active' : ''}`} aria-current={r.n === atual ? 'step' : undefined}>
      <b>{r.n}</b><span>{r.n === atual ? 'Você está aqui' : r.nome}</span></li>)}
  </ol>
}

export function NaoConsigo({ compact }: { compact?: boolean }) {
  const { relatarBarreira, toast, erro } = useStore()
  const [sel, setSel] = useState<Motivo | ''>('')
  const [outro, setOutro] = useState('')
  const [enviadoOutro, setEnviadoOutro] = useState(false)
  const resp: Record<Motivo, string> = {
    'Meu chefe não liberou': 'Vamos enviar um Passe Saúde ao RH e sugerir um horário da sua janela.',
    'Horário ruim para mim': 'Mostramos outros horários dentro da sua janela de disponibilidade.',
    'Transporte / distância': 'Este atendimento pode ser por vídeo na sala de saúde da empresa.',
    'Estou com dúvida ou receio': 'A enfermeira vai te ligar para conversar. Tudo fica em sigilo.',
    'Outro motivo': 'Recebemos o seu motivo. A equipe de enfermagem vai entrar em contato para encontrar a melhor solução com você.',
  }
  return <div className="help-box">
    <h3>Não consegue ir agora?</h3>
    <p className="small muted">Avise a equipe com 1 toque. Se for outro motivo, conte com suas palavras.</p>
    <div className="reason-buttons">
      {MOTIVOS.map(m => <button key={m} aria-pressed={sel === m} aria-expanded={m === 'Outro motivo' ? sel === m : undefined} onClick={() => {
        setSel(m); setEnviadoOutro(false)
        if (m !== 'Outro motivo') { relatarBarreira(m); toast('Motivo enviado à equipe de enfermagem.') }
      }}>{m === 'Outro motivo' ? '✍️ Outro motivo' : m}</button>)}
    </div>
    {sel === 'Outro motivo' && !enviadoOutro && <form className="outro-box" onSubmit={e => {
      e.preventDefault(); const t = outro.trim()
      if (!t) { erro('Escreva o motivo para enviar.'); return }
      relatarBarreira('Outro motivo', t); setEnviadoOutro(true); setOutro(''); toast('Motivo enviado à equipe de enfermagem.')
    }}>
      <label className="f" htmlFor="outroMot">Qual é o motivo?</label>
      <textarea id="outroMot" className="inp" maxLength={200} placeholder="Ex.: Vou estar de férias nessa data / tenho que levar meu filho ao médico" value={outro} onChange={e => setOutro(e.target.value)} />
      <button className="btn b-pri" type="submit" style={{ marginTop: 8 }}>Enviar motivo</button>
    </form>}
    {sel && (sel !== 'Outro motivo' || enviadoOutro) && !compact && <p className="answer" role="status">💙 {resp[sel]}</p>}
  </div>
}

function proximo(eventos: ReturnType<typeof useStore>['eventos'], hoje: string) {
  return eventos.filter(e => e.data >= hoje && (e.status === 'Confirmado' || e.status === 'Solicitado')).sort((a, b) => a.data.localeCompare(b.data))[0]
}

export default function ColabInicio({ go }: { go: Go }) {
  const s = useStore()
  const { simples, proposito, metas, eventos, demandas, hoje, xp, setProposito, ganhar } = s
  const p = s.objetivoAtual()
  const g = objetivoGeral(metas)
  const prox = proximo(eventos, hoje)
  const pend = demandas.filter(d => d.status !== 'Concluída')
  const [onb, setOnb] = useState(proposito === null)

  const [escrever, setEscrever] = useState(false)
  const [texto, setTexto] = useState('')
  const [emoji, setEmoji] = useState('❤️')
  function concluirOnb() {
    if (escrever) {
      if (!texto.trim()) { s.erro('Escreva o seu objetivo ou escolha uma sugestão.'); document.getElementById('onbObj')?.focus(); return }
      if (texto.trim().length < 5) { s.erro('Escreva o objetivo com um pouco mais de detalhe (mínimo 5 letras).'); return }
      s.setObjetivoCustom({ e: emoji, t: texto.trim() })
      if (proposito === null) s.setPropositoIdxSilencioso(0)
    } else if (proposito === null) setProposito(0)
    setOnb(false); ganhar(50); s.toast('Objetivo salvo! +50 pontos')
  }
  const onbModal = onb && <Modal title="Por que você quer se cuidar?" onClose={() => { if (proposito === null) setProposito(0); setOnb(false) }}>
    <p className="muted">Não é sobre doença. É sobre o que você quer viver. Escolha um ou escreva o seu.</p>
    <div className={`subform obj-livre ${escrever ? 'on' : ''}`} style={{ marginTop: 6 }}>
      <label className="f" htmlFor="onbObj">✍️ Escreva o seu objetivo, com as suas palavras</label>
      <textarea id="onbObj" className="inp" maxLength={120} rows={3} placeholder="Ex.: Ter saúde para levar meus filhos para conhecer a praia de Morro de São Paulo" value={texto}
        onChange={e => { setTexto(e.target.value); setEscrever(e.target.value.trim().length > 0) }} />
      <div className="row between"><span className="tiny muted">{escrever ? 'Este será o seu objetivo.' : 'Comece a escrever ou escolha uma sugestão abaixo.'}</span><span className="tiny muted" aria-live="polite">{texto.length}/120</span></div>
      {escrever && <><p className="f" id="onbEmj">Escolha um ícone</p>
      <div className="emoji-row" role="group" aria-labelledby="onbEmj">{EMOJIS.map(e => <button key={e} className="emoji" aria-pressed={emoji === e} aria-label={`Ícone ${e}`} onClick={() => setEmoji(e)}>{e}</button>)}</div></>}
    </div>
    <p className="f" style={{ marginTop: 14 }}>Ou escolha uma sugestão</p>
    <div className="opts">{PROPOSITOS.map((x, i) => <button key={i} className="opt" aria-pressed={!escrever && proposito === i} onClick={() => { setEscrever(false); setProposito(i) }}><span className="e" aria-hidden>{x.e}</span><span><b>{x.t}</b><br /><span className="small muted">{x.d}</span></span></button>)}</div>
    <button className="btn b-pri w100" style={{ marginTop: 16 }} onClick={concluirOnb}>Começar minha jornada</button>
  </Modal>

  const risco = s.pacientes.find(x => x.id === 'p1')
  const nivel = risco?.risco ?? 3
  const cronico = risco?.cronico
  const textoNivel = cronico ? `Seu nível de cuidado é ${nivel}. Como você tem ${cronico.toLowerCase()}, uma condição crônica, o nível fica sempre em ${nivel}: isso garante acompanhamento de perto, com retorno a cada 3 meses.`
    : `Seu nível de cuidado é ${nivel}.`

  const head = <div className="welcome">
    <div><p className="eyebrow">SUA JORNADA DE CUIDADO</p><h1>Olá, Juliana. Vamos cuidar de você?</h1><p className="muted">Um passo de cada vez. Seu cuidado cabe na sua rotina.</p></div>
    <div className="privacy"><ShieldCheck size={26} aria-hidden /><span><b>Seus dados são sigilosos.</b><span className="priv-more"><br />A empresa não vê suas consultas nem seus exames.</span></span></div>
  </div>

  const proxCard = (extra = '') => <div className={`card ${prox ? 'card-ok' : 'card-warn'} ${extra}`}>
    <div className="row between"><h3 className="h-ico"><CalendarDays size={20} aria-hidden /> Próximo compromisso</h3>{prox && <Chip tone={prox.status === 'Confirmado' ? 'ok' : 'warn'}>{prox.status}</Chip>}</div>
    {prox ? <p style={{ margin: '8px 0 14px' }}><b>{prox.titulo}</b><br />{diaSemana(prox.data)}, {fmtData(prox.data, { day: '2-digit', month: 'long' })} às {prox.hora} · {prox.modalidade}</p>
      : <p style={{ margin: '8px 0 14px' }}>Nenhum compromisso marcado.</p>}
    <button className="btn b-pri" onClick={() => go('agenda')}><CalendarDays size={18} aria-hidden /> Ver minha agenda</button>
  </div>

  if (simples) return <>{onbModal}{head}
    <div className="simple-layout">
      <section className="card purpose-simple"><p className="eyebrow">O QUE TE MOVE?</p><h2>{p.e} Meu objetivo é {p.t.charAt(0).toLowerCase() + p.t.slice(1)}.</h2>
        <p>Você já percorreu <b>{Math.round(g * 100)}%</b> do caminho até o seu objetivo.</p><Progress value={g} label="Progresso do objetivo" />
        <div className="row wrap" style={{ marginTop: 12, gap: 8 }}><Listen text={`Seu objetivo é ${p.t}. Você já percorreu ${Math.round(g * 100)} por cento do caminho.`} label="Ouvir explicação" /><button className="btn b-soft" onClick={() => go('objetivo')}>Ver o que falta</button></div></section>
      <section className="card"><p className="eyebrow">COMO ESTÁ MINHA SAÚDE HOJE?</p><RiscoSteps atual={nivel} />
        <h2>Nível {nivel}: {RISCO[nivel - 1].nome.toLowerCase()}.</h2><p className="muted">{cronico ? <>Por causa da {cronico.toLowerCase()} (condição crônica), seu nível fica sempre em {nivel}. Isso garante que a equipe acompanhe você de perto, com retorno a cada 3 meses.</> : 'Esta classificação é feita pela equipe de saúde.'}</p>
        <Listen text={textoNivel} label="Ouvir explicação" /></section>
      {proxCard()}
      <section className="card"><p className="eyebrow">O QUE PRECISO FAZER AGORA?</p>
        {pend.map((d, i) => <div className="action-row" key={d.id}><div><b>{i + 1}. {d.descricao}</b><p className="small muted">Prazo: {fmtData(d.prazo)}</p></div>
          <button className="btn b-pri btn-lg" onClick={() => go('agenda')}>Ver na minha agenda</button></div>)}
        <NaoConsigo /></section>
      <section className="card reward"><Gift size={34} aria-hidden /><div style={{ flex: 1 }}><p className="eyebrow">FAMÍLIA E CONQUISTAS</p><h2>{xp} pontos</h2><Progress value={(xp % 300) / 300} label="Progresso até a próxima conquista" tone="blue" />
        <p className="small" style={{ marginTop: 6 }}>Próxima conquista: passeio em família no clube SESI.</p></div></section>
      <div className="big-links">
        <button className="card big-link" onClick={() => go('documentos')}><FileText aria-hidden /> Documentos e exames</button>
        <button className="card big-link" onClick={() => go('saude')}><HeartPulse aria-hidden /> Minha saúde</button>
      </div>
    </div></>

  return <>{onbModal}{head}
    {proxCard('only-mobile')}
    <div className="grid2">
      <div>
        <section className="card hero">
          <div className="lab">Meu objetivo</div><div className="big">{p.e} {p.t}</div>
          <div className="row between small" style={{ marginBottom: 8 }}><span>Caminho percorrido</span><b>{Math.round(g * 100)}%</b></div>
          <Progress value={g} label="Progresso do objetivo" tone="light" />
          <ul className="mini-metas">{metas.map(m => <li key={m.id}><span>{m.nome}</span><b>{faltaMeta(m) === 0 ? 'meta batida ✓' : `faltam ${faltaMeta(m)} ${m.unidade}`}</b></li>)}</ul>
          <div className="row wrap" style={{ gap: 8 }}><button className="btn b-white" onClick={() => go('objetivo')}><Target size={18} aria-hidden /> Ver meu objetivo</button><button className="btn b-white" onClick={() => { setEscrever(!!s.objetivoCustom); setTexto(s.objetivoCustom?.t ?? ''); setOnb(true) }}>✍️ Escrever meu objetivo</button></div>
        </section>
        <section className="card"><div className="row between"><h3>Minha jornada de cuidado</h3><Chip tone="ok">Etapa 3 de 5</Chip></div>
          <div className="trail" role="list" aria-label="Etapas da jornada"><div className="fill" style={{ width: 'calc((100% - 44px) * .5)' }} />
            {[['✓', 'Acolhimento', 'done'], ['✓', 'Atendimento', 'done'], ['3', 'Plano de cuidado', 'now'], ['4', 'Acompanhamento', ''], ['5', 'Reavaliação', '']].map(x =>
              <div role="listitem" key={x[1]} className={`st ${x[2]}`} aria-current={x[2] === 'now' ? 'step' : undefined}><span className="d">{x[0]}</span>{x[1]}</div>)}
          </div></section>
        <section className="card"><h3>O que preciso fazer agora?</h3>
          {pend.map(d => <div className="task" key={d.id}><span className="dotn" aria-hidden /><div style={{ flex: 1 }}><b>{d.descricao}</b><div className="small muted">{d.status} · prazo {fmtData(d.prazo)}</div></div>
            <button className="btn b-soft btn-sm" onClick={() => go('agenda')}>Ver na agenda</button></div>)}
        </section>
      </div>
      <div>
        {proxCard('hide-mobile')}
        <section className="card"><NaoConsigo /></section>
        <section className="card"><div className="row between"><h3>Atalhos</h3></div>
          {[['documentos', 'Documentos e exames (em Minha saúde)', FileText], ['saude', 'Meu prontuário e evolução', HeartPulse], ['dependentes', 'Saúde dos meus dependentes', Users], ['conquistas', 'Conquistas e recompensas', Gift]].map(([v, l, I]) => {
            const Icon = I as typeof FileText
            return <button key={v as string} className="menu-row" onClick={() => go(v as Parameters<Go>[0])}><Icon aria-hidden /><span>{l as string}</span><ChevronRight aria-hidden /></button>
          })}
        </section>
      </div>
    </div></>
}
