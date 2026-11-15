import { useEffect, useRef, useState } from 'react'
import { Home, CalendarDays, HeartPulse, Target, Gift, Users, PlayCircle, Lock, MessageCircle, LayoutGrid, Baby, Newspaper,
  ListChecks, ClipboardList, Building2, UserCog, IdCard, Landmark, Accessibility, Volume2, LogOut, type LucideIcon } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import { Logo, Toast, ConfirmDialog, Modal } from './ui'
import A11yPanel from './A11yPanel'
import ApiStatus from './ApiStatus'
import Login from './pages/Login'
import ColabInicio from './pages/ColabInicio'
import { ColabAgenda, ColabAgendar, ColabObjetivo } from './pages/ColabAgenda'
import { ColabSaude } from './pages/ColabSaude'
import { ColabDependentes, ColabComunidade, ColabMinuto, NoticiaPage, SesiPage } from './pages/ColabRede'
import { ColabConquistas, Privacidade, Ajuda, ColabMais, SobrePrototipo } from './pages/ColabMais'
import { EnfFila, EnfAgenda } from './pages/Enfermagem'
import { EmpPainel, EmpColaboradores, EmpPasses, Instituto, InstMinuto } from './pages/Empresa'
import type { Role } from './data'

export type View = 'inicio' | 'objetivo' | 'agenda' | 'agendar' | 'saude' | 'documentos' | 'conquistas' | 'dependentes' | 'comunidade' | 'minuto' | 'noticia' | 'sesi' | 'privacidade' | 'ajuda' | 'mais'
  | 'fila' | 'agenda-equipe' | 'painel' | 'colaboradores' | 'passes' | 'instituto' | 'inst-minuto'
export type Go = (v: View) => void

type NavItem = [View, string, LucideIcon]
const NAV: Record<Role, { side: NavItem[]; bottom: View[] }> = {
  colaborador: {
    side: [['inicio', 'Início', Home], ['objetivo', 'Meu objetivo', Target], ['agenda', 'Minha agenda', CalendarDays], ['saude', 'Minha saúde', HeartPulse],
      ['dependentes', 'Meus dependentes', Baby], ['comunidade', 'Minha comunidade', Users], ['conquistas', 'Conquistas', Gift], ['minuto', 'Minuto Saúde', PlayCircle],
      ['privacidade', 'Privacidade', Lock], ['ajuda', 'Ajuda e WhatsApp', MessageCircle]],
    bottom: ['inicio', 'agenda', 'saude', 'dependentes', 'mais'],
  },
  enfermagem: { side: [['fila', 'Fila de cuidado', ListChecks], ['agenda-equipe', 'Agenda e marcações', ClipboardList], ['privacidade', 'Privacidade', Lock]], bottom: ['fila', 'agenda-equipe', 'privacidade'] },
  empresa: { side: [['painel', 'Painel', Building2], ['colaboradores', 'Colaboradores', UserCog], ['passes', 'Agenda da equipe', IdCard], ['privacidade', 'Privacidade', Lock]], bottom: ['painel', 'colaboradores', 'passes', 'privacidade'] },
  instituto: { side: [['instituto', 'Indicadores', Landmark], ['inst-minuto', 'Minuto Saúde', Newspaper], ['privacidade', 'Privacidade', Lock]], bottom: ['instituto', 'inst-minuto', 'privacidade'] },
}
const MAIS_LABEL: NavItem = ['mais', 'Mais', LayoutGrid]
const CURTO: Partial<Record<View, string>> = { agenda: 'Agenda', saude: 'Saúde', dependentes: 'Família', 'agenda-equipe': 'Agenda', colaboradores: 'Equipe', passes: 'Agenda', 'inst-minuto': 'Minuto', instituto: 'Indicadores', fila: 'Fila', privacidade: 'Privacidade' }
const INICIAL: Record<Role, View> = { colaborador: 'inicio', enfermagem: 'fila', empresa: 'painel', instituto: 'instituto' }
const ROLE_NOME: Record<Role, string> = { colaborador: 'Colaborador(a)', enfermagem: 'Enfermagem', empresa: 'Empresa / RH', instituto: 'Instituto SESI' }

function Shell() {
  const s = useStore()
  const { logado, setLogado, role, setRole, a11y, simples, speak } = s
  const [view, setView] = useState<View>(INICIAL[role])
  const [acc, setAcc] = useState(false)
  const [sobre, setSobre] = useState(false)
  const main = useRef<HTMLElement>(null)

  useEffect(() => { setView(INICIAL[role]) }, [role])
  useEffect(() => {
    const h = document.documentElement
    h.dataset.fs = String(a11y.fs)
    h.classList.toggle('contrast', a11y.contraste)
    h.classList.toggle('calm', a11y.calmo)
    h.classList.toggle('simple', simples)
  }, [a11y, simples])

  const go: Go = v => { if (v === 'documentos') { s.setSaudeAba('docs'); v = 'saude' } else if (v === 'saude') s.setSaudeAba('resumo'); setView(v); window.scrollTo(0, 0); setTimeout(() => main.current?.focus({ preventScroll: true }), 0) }
  const items = NAV[role]
  const all = [...items.side, MAIS_LABEL]
  const bottom = items.bottom.map(v => all.find(i => i[0] === v)!).filter(Boolean)
  const isMais = role === 'colaborador' && !items.bottom.includes(view)

  if (!logado) return <><a href="#cpf" className="skip">Pular para o login</a><Login onAcc={() => setAcc(true)} />{acc && <A11yPanel onClose={() => setAcc(false)} />}<Toast /><ConfirmDialog /></>

  const page = (() => {
    switch (view) {
      case 'inicio': return <ColabInicio go={go} />
      case 'objetivo': return <ColabObjetivo />
      case 'agenda': return <ColabAgenda go={go} />
      case 'agendar': return <ColabAgendar go={go} />
      case 'saude': case 'documentos': return <ColabSaude />
      case 'conquistas': return <ColabConquistas />
      case 'dependentes': return <ColabDependentes />
      case 'comunidade': return <ColabComunidade />
      case 'minuto': return <ColabMinuto go={go} />
      case 'noticia': return <NoticiaPage go={go} />
      case 'sesi': return <SesiPage go={go} />
      case 'privacidade': return <Privacidade consent={role === 'colaborador'} />
      case 'ajuda': return <Ajuda />
      case 'mais': return <ColabMais go={go} />
      case 'fila': return <EnfFila />
      case 'agenda-equipe': return <EnfAgenda />
      case 'painel': return <EmpPainel />
      case 'colaboradores': return <EmpColaboradores />
      case 'passes': return <EmpPasses />
      case 'instituto': return <Instituto />
      case 'inst-minuto': return <InstMinuto />
    }
  })()

  return <div className="app">
    <a href="#conteudo" className="skip">Pular para o conteúdo</a>
    <aside className="side" aria-label="Menu principal">
      <div className="side-logo"><Logo h={36} /></div>
      <nav aria-label="Navegação">
        {items.side.map(([v, l, I]) => <button key={v} className="navbtn" aria-current={view === v || ((view === 'noticia' || view === 'sesi') && v === 'minuto') || (view === 'agendar' && v === 'agenda') ? 'page' : undefined} onClick={() => go(v)}><I size={22} aria-hidden /><span>{l}</span></button>)}
      </nav>
      <div className="grow" />
      <button className="navbtn" onClick={() => setLogado(false)}><LogOut size={22} aria-hidden /><span>Sair</span></button>
    </aside>
    <div className="main">
      <header className="topbar">
        <div className="top-logo"><Logo h={26} /></div>
        <label className="role-label"><span className="role-txt">Visualização</span>
          <select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Trocar visualização">
            {(Object.keys(ROLE_NOME) as Role[]).map(r => <option key={r} value={r}>{ROLE_NOME[r]}</option>)}
          </select></label>
        <div className="top-actions">
          <button className="iconbtn" onClick={() => speak(main.current?.innerText.replace(/\s+/g, ' ').slice(0, 1500) ?? '')} aria-label="Ouvir esta tela" title="Ouvir esta tela"><Volume2 size={22} /></button>
          <button className="access-button" onClick={() => setAcc(true)} aria-haspopup="dialog"><Accessibility size={22} aria-hidden /><span className="hide-sm">Acessibilidade</span></button>
        </div>
      </header>
      <main id="conteudo" ref={main} tabIndex={-1} className="content" key={view + role}>
        {page}
        <footer className="foot"><span>Acolhe+ · O futuro começa pelo cuidado</span><span>Protótipo demonstrativo · Equipe Nexus · dados fictícios · <button type="button" className="linklike" onClick={() => setSobre(true)}>O que é real e o que é simulado</button></span><ApiStatus /></footer>
      </main>
    </div>
    <nav className="bnav" aria-label="Menu inferior" style={{ gridTemplateColumns: `repeat(${bottom.length}, 1fr)` }}>
      {bottom.map(([v, l, I]) => <button key={v} aria-current={view === v || (v === 'agenda' && view === 'agendar') || (v === 'mais' && isMais && view !== 'agendar') ? 'page' : undefined} onClick={() => go(v)}><I size={24} aria-hidden /><span>{CURTO[v] ?? l}</span></button>)}
    </nav>
    {acc && <A11yPanel onClose={() => setAcc(false)} />}
    {sobre && <Modal title="Sobre este protótipo" onClose={() => setSobre(false)} wide><SobrePrototipo /></Modal>}
    <Toast /><ConfirmDialog />
  </div>
}

export default function App() { return <StoreProvider><Shell /></StoreProvider> }
