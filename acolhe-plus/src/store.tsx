import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
export interface ToastOpt { tipo?: 'ok' | 'erro'; desfazer?: () => void; rotuloDesfazer?: string }
export interface ConfirmReq { titulo: string; texto: string; detalhe?: string; ok?: string; cancelar?: string; perigo?: boolean }
import {
  type Role, type Modo, type Motivo, type Evento, type Documento, type Demanda, type Barreira, type Funcionario, type Paciente, type Meta,
  type Objetivo, type Dependente, type Servico, type Noticia, type Nota, type Marcacao, PROPOSITOS, sementeEventos, sementeDependentes, sementeServicos, sementeNoticias, sementeNotas, sementeMarcacoes, sementeDocs, sementeDemandas, sementeFuncionarios, sementePacientes, sementeMetas, uid, HOJE,
} from './data'

export interface A11y { fs: 1 | 2 | 3 | 4; contraste: boolean; calmo: boolean; modo: Modo; idade: number; voz: number }

function usePersist<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? { ...init, ...JSON.parse(s) } : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* sem armazenamento */ } }, [key, v])
  return [v, setV] as const
}

function useStoreValue() {
  const [logado, setLogado] = useState(false)
  const [role, setRole] = useState<Role>('colaborador')
  const [a11y, setA11y] = usePersist<A11y>('acolhe_a11y', { fs: 2, contraste: false, calmo: false, modo: 'auto', idade: 45, voz: 1 })
  const [proposito, setPropositoIdx] = useState<number | null>(null)
  const [objetivoCustom, setObjetivoCustom] = useState<Objetivo | null>(null)
  const setProposito = (i: number) => { setPropositoIdx(i); setObjetivoCustom(null) }
  const setPropositoIdxSilencioso = (i: number) => setPropositoIdx(i)
  const objetivoAtual = (): Objetivo => objetivoCustom ?? PROPOSITOS[proposito ?? 0]
  const [xp, setXp] = useState(640)
  const [eventos, setEventos] = useState<Evento[]>(sementeEventos)
  const [docs, setDocs] = useState<Documento[]>(sementeDocs)
  const [demandas, setDemandas] = useState<Demanda[]>(sementeDemandas)
  const [barreiras, setBarreiras] = useState<Barreira[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(sementeFuncionarios)
  const [pacientes, setPacientes] = useState<Paciente[]>(sementePacientes)
  const [metas, setMetas] = useState<Meta[]>(sementeMetas)
  const [toastMsg, setToastMsgRaw] = useState('')
  const [toastOpt, setToastOpt] = useState<ToastOpt>({})
  const [toastSeq, setToastSeq] = useState(0)
  const setToastMsg = (m: string) => { setToastMsgRaw(m); if (!m) setToastOpt({}) }
  const [resgatados, setResgatados] = useState<number[]>([])
  const [dependentes, setDependentes] = useState<Dependente[]>(sementeDependentes)
  const [servicos, setServicos] = useState<Servico[]>(sementeServicos)
  const [noticias, setNoticias] = useState<Noticia[]>(sementeNoticias)
  const [noticiaSel, setNoticiaSel] = useState<string>('n1')
  const [notas, setNotas] = useState<Record<string, Nota[]>>(sementeNotas)
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>(sementeMarcacoes)
  const [confirmReq, setConfirmReq] = useState<ConfirmReq | null>(null)
  const confirmResolve = useRef<((v: boolean) => void) | null>(null)
  function confirmar(c: ConfirmReq): Promise<boolean> {
    confirmResolve.current?.(false)
    setConfirmReq(c)
    return new Promise(res => { confirmResolve.current = res })
  }
  function responderConfirm(v: boolean) { const r = confirmResolve.current; confirmResolve.current = null; setConfirmReq(null); r?.(v) }
  const [saudeAba, setSaudeAba] = useState<'resumo' | 'docs'>('resumo')
  /** Adiciona anotação e devolve a função que a remove (para “Desfazer”). */
  function addNota(pid: string, n: Omit<Nota, 'id'>) {
    const id = uid()
    setNotas(x => ({ ...x, [pid]: [{ ...n, id }, ...(x[pid] ?? [])] }))
    return () => setNotas(x => ({ ...x, [pid]: (x[pid] ?? []).filter(y => y.id !== id) }))
  }

  const simples = a11y.modo === 'simples' || (a11y.modo === 'auto' && a11y.idade >= 60)

  /** Aviso de sucesso. Com `desfazer`, mostra o botão “Desfazer” por alguns segundos. */
  function toast(m: string, o: ToastOpt = {}) { setToastOpt(o); setToastMsgRaw(m); setToastSeq(n => n + 1) }
  /** Aviso de erro: explica como corrigir; não apaga o que foi preenchido. */
  function erro(m: string) { toast(m, { tipo: 'erro' }) }
  function ganhar(n: number) { setXp(x => x + n) }

  function speak(t: string) {
    try {
      if (!('speechSynthesis' in window)) { toast('A leitura em voz alta não está disponível neste navegador.'); return }
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; u.rate = a11y.voz
      window.speechSynthesis.speak(u)
    } catch { toast('A leitura em voz alta não está disponível aqui.') }
  }
  function pararVoz() { try { window.speechSynthesis.cancel() } catch { /* */ } }

  function relatarBarreira(motivo: Motivo, detalhe?: string) {
    setBarreiras(b => [{ id: uid(), pessoa: 'Juliana B. A.', motivo, detalhe, quando: 'agora', resolvida: false }, ...b])
    setPacientes(ps => ps.map(p => p.id === 'p1' ? { ...p, motivo, detalhe } : p))
  }
  /** Cria o agendamento e devolve a função para desfazer (remove e estorna os pontos). */
  function agendar(e: Omit<Evento, 'id' | 'status'>) {
    const id = uid()
    setEventos(ev => [...ev, { ...e, id, status: 'Confirmado' as const }].sort((a, b) => a.data.localeCompare(b.data)))
    ganhar(60)
    return () => { setEventos(ev => ev.filter(x => x.id !== id)); setXp(x => Math.max(0, x - 60)) }
  }
  function addDoc(d: Omit<Documento, 'id'>) { setDocs(ds => [{ ...d, id: uid() }, ...ds]) }
  function janelaDaJuliana() { return funcionarios.find(f => f.id === 'f1')?.janela ?? null }

  return {
    logado, setLogado, role, setRole, a11y, setA11y, simples, proposito, setProposito, setPropositoIdxSilencioso, objetivoCustom, setObjetivoCustom, objetivoAtual, xp, ganhar,
    eventos, setEventos, docs, setDocs, addDoc, demandas, setDemandas, barreiras, setBarreiras, funcionarios, setFuncionarios,
    pacientes, setPacientes, metas, setMetas, toastMsg, setToastMsg, toast, erro, toastOpt, toastSeq, speak, pararVoz, relatarBarreira, agendar, janelaDaJuliana,
    resgatados, setResgatados, hoje: HOJE,
    confirmReq, confirmar, responderConfirm,
    dependentes, setDependentes, servicos, setServicos, noticias, setNoticias, noticiaSel, setNoticiaSel, notas, addNota, setNotas, marcacoes, setMarcacoes, saudeAba, setSaudeAba,
  }
}

export type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue()
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore fora do StoreProvider')
  return v
}
