import { useEffect, useRef, useState } from 'react'
import { ChevronRight, FileText, Target, Gift, Users, PlayCircle, Lock, MessageCircle, LogOut, Baby } from 'lucide-react'
import { useStore } from '../store'
import { Chip, Progress } from '../ui'
import type { Go } from '../App'

export function ColabConquistas() {
  const { xp, resgatados, setResgatados, toast, eventos, confirmar } = useStore()
  const nivel = Math.floor(xp / 300) + 1
  const R: [number, string, string, string][] = [[300, '💊', '15% na farmácia parceira', 'Para você e seus dependentes'], [600, '🏊', 'Aula de natação no SESI', 'Para um dependente, 1 mês'], [900, '🎟️', 'Passeio em família no clube SESI', 'Lazer e esporte com a família'], [1500, '🌴', 'Folga do cuidado', 'Conforme a política da empresa']]
  return <>
    <div className="page-head"><p className="eyebrow">CONQUISTAS</p><h1>Conquistas</h1><p className="muted">Pontos vêm de participar: agendar, comparecer, cumprir missões e enviar exames. <b>Nunca do resultado de exame.</b></p></div>
    <section className="card hero"><div className="lab">Nível {nivel}</div><div className="big">{xp} pontos</div><Progress value={(xp % 300) / 300} label="Progresso do nível" tone="light" /><p className="small" style={{ marginTop: 8 }}>{300 - xp % 300} pontos para o nível {nivel + 1}</p></section>
    <div className="grid2">
      <section className="card"><h3>Recompensas para curtir com a família</h3>
        {R.map(([pts, e, t, d]) => { const ok = xp >= pts, got = resgatados.includes(pts)
          return <div className="rw" key={pts}><span className="rw-i" aria-hidden>{e}</span><div style={{ flex: 1 }}><b>{t}</b><div className="small muted">{d}</div></div>
            {got ? <Chip tone="ok">Resgatado</Chip> : ok ? <button className="btn b-ok btn-sm" onClick={async () => { if (!(await confirmar({ titulo: 'Resgatar recompensa', texto: `Resgatar “${t}”?`, detalhe: 'O voucher é pessoal e vai para o seu WhatsApp. Depois de resgatado, não pode ser trocado.', ok: 'Resgatar recompensa', cancelar: 'Agora não' }))) return; setResgatados([...resgatados, pts]); toast('Recompensa resgatada. (Simulação: no produto final, o voucher chega no seu WhatsApp.)') }}>Resgatar</button> : <span className="small muted">{pts} pts</span>}</div> })}
      </section>
      <section className="card"><h3>Selos</h3><div className="badges">
        {([['🌱', 'Primeiro passo', true], ['📅', 'Consultas em dia', eventos.some(e => e.status === 'Confirmado')], ['🔥', '4 semanas seguidas', true], ['👨‍👩‍👧', 'Em família', true], ['🧪', 'Exames enviados', false], ['💙', 'Apoiador', false]] as [string, string, boolean][]).map(([e, t, on]) =>
          <div key={t} className={`bdg ${on ? '' : 'off'}`}><span className="bdg-i" aria-hidden>{e}</span>{t}{!on && <span className="sr"> (bloqueado)</span>}</div>)}
      </div></section>
    </div>
  </>
}

export function Privacidade({ consent = true }: { consent?: boolean }) {
  const { toast, confirmar } = useStore()
  const [c, setC] = useState({ familia: true, comunidade: true, lider: true, calendario: true })
  return <>
    <div className="page-head"><p className="eyebrow">PRIVACIDADE</p><h1>Quem vê o quê</h1><p className="muted">Dado de saúde é sensível (LGPD, art. 11).</p></div>
    <div className="grid2">
      <section className="card">{[['🔒', 'ok', 'Só você e a equipe de saúde', 'Diagnósticos, exames, atestados, plano, nível e conversas'], ['🏢', 'blue', 'Sua empresa (RH)', 'Dados funcionais, sua janela de disponibilidade e números gerais de grupos com 10+ pessoas'], ['🧑‍💼', 'warn', 'Seu líder', 'Só o horário do compromisso, sem o motivo'], ['👨‍👩‍👧', 'gold', 'Sua família', 'Missões e incentivos, se você permitir'], ['🏛️', 'gray', 'Instituto SESI', 'Somente indicadores agregados das unidades']].map(([e, t, n, d]) =>
        <div className="priv" key={n}><span className={`priv-i c-${t}`} aria-hidden>{e}</span><div><b>{n}</b><div className="small muted">{d}</div></div></div>)}
        <p className="small" style={{ marginTop: 10 }}>Atestado só mostra o CID se você autorizar.</p></section>
      {consent && <section className="card"><h3>Meus consentimentos</h3>
        {([['familia', 'Compartilhar missões com a família'], ['comunidade', 'Participar da comunidade'], ['lider', 'Enviar Passe Saúde ao líder'], ['calendario', 'Enviar compromissos ao Teams / Google Agenda']] as const).map(([k, l]) =>
          <div className="setrow" key={k}><span style={{ flex: 1 }}>{l}</span><button className="switch" role="switch" aria-label={l} aria-checked={c[k]} onClick={() => { const antes = c; setC({ ...c, [k]: !c[k] }); toast(c[k] ? `Permissão desativada: ${l.toLowerCase()}.` : 'Permissão ativada.', { desfazer: () => setC(antes) }) }} /></div>)}</section>}
    </div>
  </>
}

const FLOW: Record<string, { me?: string; bot: string; q: [string, string][] }> = {
  inicio: { bot: 'Oi, Juliana! 👋 Aqui é o Acolhe+ do SESI Saúde.\nSeu exame de sangue é *quinta, 20/11, às 07h30*. Lembre do jejum de 8 horas.', q: [['✅ Confirmar', 'conf'], ['🔁 Mudar horário', 'rem'], ['❌ Não vou poder', 'nao']] },
  conf: { me: '✅ Confirmar', bot: 'Confirmado! ✅ Seu líder recebeu só o horário. +20 pontos 🎯', q: [] },
  rem: { me: '🔁 Mudar horário', bot: 'Estes horários estão dentro da sua janela de disponibilidade:', q: [['Sex 21 · 07h10', 'ok'], ['Seg 24 · 07h50', 'ok']] },
  ok: { me: 'Sex 21 · 07h10', bot: 'Pronto! Mudado ✅ Te lembro 2 horas antes.', q: [] },
  nao: { me: '❌ Não vou poder', bot: 'Tudo bem. O que pesou mais? (1 toque)', q: [['Meu chefe não liberou', 'lider'], ['Transporte / distância', 'transp'], ['Estou com dúvida ou receio', 'medo'], ['✍️ Outro motivo', 'outro']] },
  outro: { me: '✍️ Outro motivo', bot: 'Pode contar com suas palavras 💬 (ex.: “vou estar de férias”). Vou repassar à enfermagem e ela te ajuda a remarcar.', q: [['Vou estar de férias nessa data', 'ferias']] },
  ferias: { me: 'Vou estar de férias nessa data', bot: 'Anotado ✅ A enfermagem recebeu. Quer que eu já sugira um horário para *depois das férias*?', q: [['👍 Pode sugerir', 'ok']] },
  lider: { me: 'Meu chefe não liberou', bot: 'Vou mandar um *Passe Saúde* ao RH (só o horário) e sugerir um horário da sua janela: *sexta, 21/11, 07h10*?', q: [['👍 Pode ser', 'ok']] },
  transp: { me: 'Transporte / distância', bot: 'Exames são presenciais, mas o retorno pode ser *por vídeo na sala de saúde da empresa*. E o vale-transporte digital já está incluso 🚌', q: [['Ok, vou manter', 'conf']] },
  medo: { me: 'Estou com dúvida ou receio', bot: 'Obrigado por contar 💙 Tudo fica *só entre você e a equipe de saúde*. A enfermeira Renata pode te ligar, 5 minutos?', q: [['📞 Pode ligar', 'lig']] },
  lig: { me: '📞 Pode ligar', bot: 'Combinado! A Renata liga hoje entre 14h e 15h 💙', q: [] },
}
export function Ajuda() {
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([])
  const [q, setQ] = useState<[string, string][]>([])
  const box = useRef<HTMLDivElement>(null)
  function step(k: string, first = false) {
    const n = FLOW[k]; setQ([])
    if (n.me && !first) setMsgs(m => [...m, { me: true, t: n.me! }])
    setTimeout(() => { setMsgs(m => [...m, { me: false, t: n.bot }]); setQ(n.q) }, first ? 0 : 400)
  }
  useEffect(() => { step('inicio', true) }, [])
  useEffect(() => { box.current?.scrollTo(0, box.current.scrollHeight) }, [msgs, q])
  const fmt = (t: string) => t.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <b key={i}>{p.slice(1, -1)}</b> : p)
  return <>
    <div className="page-head"><p className="eyebrow">AJUDA</p><h1>Ajuda e WhatsApp</h1><p className="muted">No produto final, o Acolhe+ também funciona pelo WhatsApp. Aqui você vê uma simulação dessa conversa.</p></div>
    <div className="grid2">
      <section className="card"><h3><MessageCircle size={20} aria-hidden /> Simulação da conversa</h3>
        <div className="chat" ref={box} aria-live="polite">{msgs.map((m, i) => <div key={i} className={`msg ${m.me ? 'me' : 'bot'}`}>{fmt(m.t)}</div>)}
          {q.length > 0 && <div className="qr">{q.map(([l, k]) => <button key={k + l} onClick={() => step(k)}>{l}</button>)}</div>}</div>
        <button className="btn b-line w100" style={{ marginTop: 10 }} onClick={() => { setMsgs([]); step('inicio', true) }}>Reiniciar conversa</button></section>
      <section className="card"><h3>Falar com uma pessoa</h3><p className="small muted">Segunda a sexta, das 7h às 19h.</p><p style={{ marginTop: 8 }}><b>WhatsApp:</b> (71) 0000-0000<br /><b>Telefone:</b> 0800 000 0000</p><p className="tiny muted">Números ilustrativos.</p></section>
    </div>
    <SobrePrototipo />
  </>
}

/** Transparência para a banca e para quem testa: o que funciona, o que é simulado e o que é integração futura. */
export function SobrePrototipo() {
  return <section className="card" aria-labelledby="sobre-h">
    <h3 id="sobre-h">Sobre este protótipo</h3>
    <p className="small muted">Todos os dados são fictícios. Não use dados reais de saúde nesta versão.</p>
    <div className="sobre-grid">
      <div><span className="chip c-ok">Funciona no protótipo</span><ul className="small">
        <li>Agendar, remarcar e cancelar, respeitando a janela da empresa</li><li>Objetivo e metas editáveis, com progresso calculado</li>
        <li>Fila de risco explicável, prontuário, anotações e marcações da enfermagem</li><li>Atestado e resumo de consulta em PDF (pela impressão do navegador)</li>
        <li>Botões Google Agenda e Teams/Outlook (abrem o calendário de verdade) e arquivo .ics</li><li>Acessibilidade (texto, contraste, voz) e entrada direta, sem cadastro</li></ul></div>
      <div><span className="chip c-warn">Simulado</span><ul className="small">
        <li>Não há login: “Iniciar” entra direto com uma usuária fictícia</li><li>Mensagens de WhatsApp, ligações e vouchers</li>
        <li>Autorização de dependentes adultos</li><li>Dados ficam só na memória do navegador e voltam ao início ao recarregar</li></ul></div>
      <div><span className="chip c-blue">Integração futura</span><ul className="small">
        <li>API Java (Spring Boot) com banco PostgreSQL, já modelada</li><li>Login com CPF e senha (a validação de CPF já está pronta em valid.ts)</li><li>Prontuário e agenda reais do SESI Saúde</li>
        <li>WhatsApp Business oficial</li><li>Libras com VLibras (gov.br)</li></ul></div>
    </div>
  </section>
}

export function ColabMais({ go }: { go: Go }) {
  const { setLogado, confirmar } = useStore()
  const items: [Parameters<Go>[0], typeof FileText, string, string][] = [
    ['documentos', FileText, 'Documentos e exames', 'Dentro de Minha saúde: atestados, PDFs, resultados'], ['objetivo', Target, 'Meu objetivo', 'Quanto falta para chegar lá'],
    ['dependentes', Baby, 'Meus dependentes', 'Vacinas e consultas da família'], ['comunidade', Users, 'Minha comunidade', 'Colegas, grupos e desafios'],
    ['conquistas', Gift, 'Conquistas', 'Pontos e recompensas'], ['minuto', PlayCircle, 'Minuto Saúde', 'Notícias, campanhas e serviços do SESI'], ['privacidade', Lock, 'Privacidade', 'Quem vê o quê'], ['ajuda', MessageCircle, 'Ajuda e WhatsApp', 'Fale com a equipe']]
  return <>
    <div className="page-head"><h1>Mais</h1></div>
    {items.map(([v, I, t, d]) => <button key={v} className="card menu-card" onClick={() => go(v)}><span className="menu-i" aria-hidden><I /></span><span style={{ flex: 1 }}><b>{t}</b><br /><span className="small muted">{d}</span></span><ChevronRight aria-hidden /></button>)}
    <button className="btn b-line w100" onClick={() => setLogado(false)}><LogOut size={18} aria-hidden /> Sair</button>
  </>
}
