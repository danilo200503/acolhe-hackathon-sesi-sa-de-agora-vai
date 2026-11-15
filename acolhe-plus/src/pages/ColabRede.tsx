import { useState, type FormEvent } from 'react'
import { Users, Syringe, CalendarPlus, ShieldCheck, Lock, Newspaper, Building2, PlayCircle, ArrowLeft, UserPlus, Heart, Send, IdCard } from 'lucide-react'
import { useStore } from '../store'
import { Chip, Modal } from '../ui'
import { CalButtons } from '../cal'
import { fmtData, uid, type Dependente } from '../data'
import type { Go } from '../App'

/* ================= MEUS DEPENDENTES ================= */
export function ColabDependentes() {
  const { dependentes, setDependentes, toast, ganhar, confirmar, erro } = useStore()
  const [vac, setVac] = useState<Dependente | null>(null)
  const [ag, setAg] = useState<Dependente | null>(null)
  const [novo, setNovo] = useState(false)
  const [pedir, setPedir] = useState<Dependente | null>(null)

  async function agendarDep(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!ag) return
    const f = new FormData(e.currentTarget)
    const titulo = String(f.get('tipo')), data = String(f.get('data')), hora = String(f.get('hora'))
    if (!data || data < '2026-11-16') { erro('Escolha uma data a partir de amanhã.'); return }
    if (new Date(data + 'T12:00:00').getDay() === 0) { erro('A unidade não atende aos domingos. Escolha outro dia.'); return }
    if (ag.consultas.some(c => c.data === data && c.status === 'Confirmado')) { erro(`${ag.nome.split(' ')[0]} já tem um atendimento nesse dia.`); return }
    const antes = dependentes
    setDependentes(ds => ds.map(d => d.id === ag.id ? {
      ...d, consultas: [{ data, titulo, status: 'Confirmado' }, ...d.consultas].sort((a, b) => b.data.localeCompare(a.data)),
      vacinas: titulo.startsWith('Vacina') ? d.vacinas.map(v => v.status === 'Pendente' ? { ...v, status: 'Agendada' as const, data } : v) : d.vacinas,
      alerta: titulo.startsWith('Vacina') ? undefined : d.alerta,
    } : d))
    ganhar(30); toast(`${titulo} de ${ag.nome.split(' ')[0]} agendado para ${fmtData(data)} às ${hora}. Leve a carteirinha SESI.`, { desfazer: () => { setDependentes(antes); ganhar(-30) } }); setAg(null)
  }
  async function addDep(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget)
    const nome = String(f.get('nome') || '').trim().replace(/\s+/g, ' '); const idade = Number(f.get('idade')); const par = String(f.get('par'))
    if (!/^[A-Za-zÀ-ÿ' ]+$/.test(nome) || nome.split(' ').length < 2) { erro('Informe nome e sobrenome do dependente (só letras).'); document.getElementById('nn')?.focus(); return }
    if (!Number.isInteger(idade) || idade < 0 || idade > 110) { erro('Informe uma idade válida.'); return }
    if (par.startsWith('Filho') && idade > 24) { erro('Filhos podem ser dependentes até 24 anos.'); return }
    if (par === 'Cônjuge' && idade < 16) { erro('Confira a idade do cônjuge.'); return }
    if (dependentes.some(d => d.nome.toLowerCase() === nome.toLowerCase())) { erro('Esse dependente já está cadastrado.'); return }
    const antes = dependentes
    setDependentes(ds => [...ds, { id: uid(), nome, parentesco: par, idade, carteira: 'Em emissão', autorizou: idade < 18, vacinas: [], consultas: [] }])
    setNovo(false); toast(idade >= 18 ? `${nome.split(' ')[0]} cadastrado(a). Como é maior de idade, precisa autorizar o compartilhamento.` : `${nome.split(' ')[0]} cadastrado(a). Você já acompanha a saúde dele(a).`, { desfazer: () => setDependentes(antes) })
  }

  return <>
    <div className="page-head row between wrap"><div><p className="eyebrow">MEUS DEPENDENTES</p><h1>Saúde da minha família</h1><p className="muted">Acompanhe vacinas, consultas e cuidados dos seus dependentes no SESI.</p></div>
      <button className="btn b-pri btn-lg" onClick={() => setNovo(true)}><UserPlus size={20} aria-hidden /> Adicionar dependente</button></div>
    <div className="grid2">
      {dependentes.map(d => {
        const menor = d.idade < 18
        const pode = menor || d.autorizou
        const prox = d.consultas.filter(c => c.status === 'Confirmado').sort((a, b) => a.data.localeCompare(b.data))[0]
        const pend = d.vacinas.filter(v => v.status === 'Pendente').length
        return <section className="card dep-card" key={d.id}>
          <div className="dep-top"><span className="av" aria-hidden>{d.nome[0]}</span><div style={{ flex: 1, minWidth: 0 }}><h3>{d.nome}</h3><div className="small muted">{d.parentesco} · {d.idade} anos</div><div className="tiny muted"><IdCard size={13} aria-hidden /> {d.carteira}</div></div>
            {pode ? (pend ? <Chip tone="warn">{pend} vacina pendente</Chip> : <Chip tone="ok">Em dia</Chip>) : <Chip tone="gray">Privado</Chip>}</div>
          {!pode ? <>
            <p className="lock-note"><Lock size={18} aria-hidden /><span>{d.nome.split(' ')[0]} é maior de idade. Pela LGPD, você só vê a saúde dele(a) se ele(a) autorizar no próprio Acolhe+.</span></p>
            <button className="btn b-soft w100" style={{ marginTop: 10 }} onClick={() => setPedir(d)}>Pedir para compartilhar comigo</button>
          </> : <>
            {d.alerta && <div className="dep-alert">⚠️ {d.alerta}</div>}
            <div className="task" style={{ marginTop: 8 }}><CalendarPlus size={20} aria-hidden /><span style={{ flex: 1 }}>{prox ? <><b>Próximo:</b> {prox.titulo}<br /><span className="small muted">{fmtData(prox.data, { weekday: 'long', day: '2-digit', month: 'long' })}</span></> : <span className="muted">Nenhum compromisso marcado</span>}</span></div>
            {d.consultas.filter(c => c.status !== 'Confirmado').slice(0, 2).map(c => <div className="task" key={c.data + c.titulo}><span className="tick-s on" aria-hidden>✓</span><span style={{ flex: 1 }}>{c.titulo}<br /><span className="small muted">{fmtData(c.data)} · {c.status}</span></span></div>)}
            {d.obs && <p className="small" style={{ marginTop: 6 }}>💬 {d.obs}</p>}
            {prox && <CalButtons item={{ titulo: `${prox.titulo} · ${d.nome.split(' ')[0]} · SESI`, data: prox.data, hora: '08h10', local: 'SESI Saúde · Unidade CIA' }} compact />}
            <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
              <button className="btn b-pri btn-sm" onClick={() => setAg(d)}><CalendarPlus size={16} aria-hidden /> Agendar para {d.nome.split(' ')[0]}</button>
              <button className="btn b-soft btn-sm" onClick={() => setVac(d)}><Syringe size={16} aria-hidden /> Carteira de vacinação</button>
            </div>
          </>}
        </section>
      })}
      <section className="card"><h3><Heart size={20} aria-hidden /> Missão em família</h3><p className="small muted">A caminhada de domingo vale pontos em dobro quando um dependente participa.</p>
        <button className="btn b-soft w100" style={{ marginTop: 10 }} onClick={() => toast('Convite registrado. (Simulação: no produto final, a família recebe pelo WhatsApp.)')}>Convidar para domingo</button></section>
    </div>
    <p className="small muted"><ShieldCheck size={16} aria-hidden /> Filhos menores de 18 anos aparecem automaticamente. Adultos precisam autorizar. Sua empresa nunca vê dados dos seus dependentes.</p>

    {vac && <Modal title={`Carteira de vacinação · ${vac.nome}`} onClose={() => setVac(null)}>
      {vac.vacinas.length === 0 && <p className="muted">Nenhuma vacina registrada ainda.</p>}
      {vac.vacinas.map(v => <div className="vac" key={v.nome}><span>{v.nome}</span><span>{v.data && <span className="small muted">{fmtData(v.data)} · </span>}<Chip tone={v.status === 'Em dia' ? 'ok' : v.status === 'Agendada' ? 'blue' : 'warn'}>{v.status}</Chip></span></div>)}
      <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => { setAg(vac); setVac(null) }}>Agendar vacina</button>
    </Modal>}
    {ag && <Modal title={`Agendar para ${ag.nome}`} onClose={() => setAg(null)}>
      <form onSubmit={agendarDep}>
        <label className="f" htmlFor="dt">Atendimento</label>
        <select id="dt" name="tipo" className="inp" defaultValue={ag.vacinas.some(v => v.status === 'Pendente') ? 'Vacina' : 'Consulta pediátrica'}>
          <option>Vacina</option><option>Consulta pediátrica</option><option>Dentista</option><option>Consulta médica</option><option>Natação / esporte no SESI</option></select>
        <div className="grid-2f">
          <div><label className="f" htmlFor="dd">Dia</label><input id="dd" name="data" type="date" className="inp" defaultValue="2026-11-21" min="2026-11-16" /></div>
          <div><label className="f" htmlFor="dh">Horário</label><select id="dh" name="hora" className="inp"><option>08h10</option><option>09h30</option><option>14h10</option><option>16h30</option><option>Sábado 09h00</option></select></div>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>Atendimentos de dependentes acontecem na unidade SESI Saúde · CIA.</p>
        <button className="btn b-pri w100 btn-lg" style={{ marginTop: 14 }} type="submit">Confirmar agendamento</button>
      </form>
    </Modal>}
    {novo && <Modal title="Adicionar dependente" onClose={() => setNovo(false)}>
      <form onSubmit={addDep}>
        <label className="f" htmlFor="nn">Nome completo</label><input id="nn" name="nome" className="inp" placeholder="Nome do dependente" />
        <div className="grid-2f">
          <div><label className="f" htmlFor="np">Parentesco</label><select id="np" name="par" className="inp"><option>Filho(a)</option><option>Cônjuge</option><option>Enteado(a)</option></select></div>
          <div><label className="f" htmlFor="ni">Idade</label><input id="ni" name="idade" type="number" min="0" max="99" className="inp" defaultValue={8} /></div>
        </div>
        <button className="btn b-pri w100 btn-lg" style={{ marginTop: 14 }} type="submit">Cadastrar</button>
      </form>
    </Modal>}
    {pedir && <Modal title="Pedir compartilhamento" onClose={() => setPedir(null)}>
      <p>Vamos enviar um convite no WhatsApp de <b>{pedir.nome}</b> pedindo autorização para você acompanhar vacinas e consultas dele(a).</p>
      <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => { setDependentes(ds => ds.map(x => x.id === pedir.id ? { ...x, autorizou: true, vacinas: [{ nome: 'Gripe 2026', status: 'Em dia', data: '2026-05-02' }, { nome: 'Hepatite B', status: 'Em dia', data: '2019-08-10' }], consultas: [{ data: '2026-09-15', titulo: 'Check-up anual', status: 'Realizado' }] } : x)); setPedir(null); toast(`Simulação: ${pedir.nome.split(' ')[0]} autorizou. Agora você acompanha a saúde dele.`) }}>Enviar convite (simular aceite)</button>
    </Modal>}
  </>
}

/* ================= MINHA COMUNIDADE ================= */
export function ColabComunidade() {
  const { toast, ganhar, confirmar, erro } = useStore()
  const [posts, setPosts] = useState([
    { id: 'c1', i: 'M', n: 'Marcos · Linha 4', t: 'Troquei o refrigerante por água com limão faz 21 dias. A pressão desceu!', c: 12 },
    { id: 'c2', i: 'R', n: 'Enf. Renata · SESI', t: 'Dica: medir a pressão sempre no mesmo horário ajuda a ver a evolução.', c: 30 },
    { id: 'c3', i: 'L', n: 'Lu · Expedição', t: 'Alguém do turno B topa caminhar depois do expediente?', c: 8 },
  ])
  const [apoiados, setApoiados] = useState<string[]>([])
  const [txt, setTxt] = useState('')
  const [grupos, setGrupos] = useState<string[]>(['Pressão sob controle'])
  const [ultimoPost, setUltimoPost] = useState(0)
  const [erroPost, setErroPost] = useState('')
  function moderar(t: string): string {
    if (t.length < 5) return 'Escreva pelo menos 5 letras.'
    if (t.length > 280) return 'Máximo de 280 caracteres.'
    const n = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const ofensas = ['idiota', 'burro', 'otario', 'imbecil', 'lixo', 'porra', 'merda', 'caralho', 'fdp', 'vagabund', 'retardad']
    if (ofensas.some(o => n.includes(o))) return 'Sua mensagem tem palavras ofensivas. A comunidade é um espaço de respeito.'
    if (/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(t) || /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/.test(t) || /\S+@\S+\.\S+/.test(t)) return 'Não publique CPF, telefone ou e-mail. Proteja seus dados.'
    if (/(colega|ele tem|ela tem|o fulano|a fulana|meu chefe tem)/.test(n) && /(diagnostic|cancer|hiv|depress|diabet|hipertens|exame|cid )/.test(n)) return 'Não exponha a saúde de outras pessoas.'
    if (/(.)\1{6,}/.test(t) || (t.replace(/[^A-Z]/g, '').length > 12 && t === t.toUpperCase())) return 'Evite mensagens em caixa alta ou com letras repetidas.'
    if (Date.now() - ultimoPost < 30000) return 'Aguarde alguns segundos antes de publicar de novo.'
    return ''
  }
  return <>
    <div className="page-head"><p className="eyebrow">MINHA COMUNIDADE</p><h1>Comunidade de colegas</h1><p className="muted">Troque experiências e incentivo com colegas. Você aparece como “Juliana B.” e a equipe de saúde modera.</p></div>
    <div className="grid2">
      <section className="card"><h3>Mural</h3>
        <form className="row wrap" style={{ gap: 8, marginBottom: 12 }} onSubmit={e => { e.preventDefault(); const t = txt.trim(); const err = moderar(t); setErroPost(err); if (err) return
          setPosts(p => [{ id: uid(), i: 'J', n: 'Juliana B. · Linha 2', t, c: 0 }, ...p]); setTxt(''); setUltimoPost(Date.now()); ganhar(10); toast('Publicado! +10 pontos') }}>
          <label className="sr" htmlFor="post">Escreva para a comunidade</label>
          <input id="post" className="inp" style={{ flex: 1, minWidth: 0 }} maxLength={280} placeholder="Compartilhe uma conquista ou dica" value={txt} onChange={e => { setTxt(e.target.value); setErroPost('') }} aria-invalid={!!erroPost} aria-describedby="postErr" />
          <button className="btn b-pri" type="submit"><Send size={18} aria-hidden /> Publicar</button></form>
        {erroPost ? <p id="postErr" className="err" role="alert" style={{ marginTop: -4, marginBottom: 10 }}>{erroPost}</p> : <p id="postErr" className="tiny muted" style={{ marginTop: -4, marginBottom: 10 }}>Seja gentil. Não publique dados pessoais nem a saúde de outras pessoas.</p>}
        {posts.map(p => <div className="post row" key={p.id} style={{ alignItems: 'flex-start' }}><span className="av" aria-hidden>{p.i}</span><div style={{ flex: 1, minWidth: 0 }}><b className="small">{p.n}</b><p>{p.t}</p>
          <button className="linklike small" aria-pressed={apoiados.includes(p.id)} onClick={() => { if (apoiados.includes(p.id)) return; setApoiados(a => [...a, p.id]); ganhar(5); toast('Apoio enviado. +5 pontos') }}>💙 {p.c + (apoiados.includes(p.id) ? 1 : 0)} apoios{apoiados.includes(p.id) ? ' · você apoiou' : ' · Apoiar'}</button></div></div>)}
      </section>
      <div>
        <section className="card"><h3><Users size={20} aria-hidden /> Grupos</h3>
          {[['🚶', 'Caminhada turno B', '34 colegas'], ['❤️', 'Pressão sob controle', '58 colegas'], ['🥗', 'Marmita saudável', '41 colegas'], ['🚭', 'Parar de fumar', '17 colegas']].map(([e, n, q]) => {
            const dentro = grupos.includes(n)
            return <div className="task" key={n}><span aria-hidden style={{ fontSize: '1.4rem' }}>{e}</span><span style={{ flex: 1 }}><b>{n}</b><br /><span className="small muted">{q}</span></span>
              <button className={`btn btn-sm ${dentro ? 'b-ok' : 'b-soft'}`} aria-pressed={dentro} onClick={() => { const antes = grupos; setGrupos(g => dentro ? g.filter(x => x !== n) : [...g, n]); toast(dentro ? `Você saiu de ${n}.` : `Você entrou em ${n}.`, { desfazer: () => setGrupos(antes) }) }}>{dentro ? 'Participando' : 'Entrar'}</button></div>
          })}</section>
        <section className="card"><h3>Desafio da semana</h3><p className="small muted">Linha 2 contra Linha 4: quem soma mais minutos de caminhada até sexta?</p>
          <div className="bar-item"><div><span>Linha 2 (sua equipe)</span><b>1.240 min</b></div><div className="bar bar-ok"><i style={{ width: '62%' }} /></div></div>
          <div className="bar-item"><div><span>Linha 4</span><b>1.090 min</b></div><div className="bar bar-blue"><i style={{ width: '54%' }} /></div></div></section>
        <p className="small muted"><ShieldCheck size={16} aria-hidden /> Na comunidade ninguém vê seus exames ou diagnósticos. Só o que você escolher publicar.</p>
      </div>
    </div>
  </>
}

/* ================= MINUTO SAÚDE ================= */
export function ColabMinuto({ go }: { go: Go }) {
  const { ganhar, toast, servicos, noticias, setNoticiaSel, erro } = useStore()
  const abrir = (id: string) => { setNoticiaSel(id); go('noticia') }
  return <>
    <div className="page-head"><p className="eyebrow">MINUTO SAÚDE</p><h1>Minuto Saúde</h1><p className="muted">Notícias, campanhas e tudo o que o SESI oferece para você e sua família.</p></div>
    <div className="big-choice">
      <button className="card" onClick={() => go('sesi')}><Building2 aria-hidden /><span><b>O que o SESI faz</b><br /><span className="small muted">Saúde, educação, esporte e lazer para a indústria</span></span></button>
      <button className="card" onClick={() => abrir(noticias[0]?.id ?? '')} disabled={!noticias.length}><Newspaper aria-hidden /><span><b>Ler a notícia do dia</b><br /><span className="small muted">{noticias[0]?.titulo ?? 'Sem notícias'}</span></span></button>
    </div>
    <section className="card hero row wrap"><PlayCircle size={42} aria-hidden /><div style={{ flex: 1, minWidth: 0 }}><div className="lab">60 segundos</div><b className="big" style={{ margin: 0 }}>Novembro Azul: 3 mitos sobre saúde do homem</b></div>
      <button className="btn b-white" onClick={() => { ganhar(15); toast('Vídeo assistido! +15 pontos') }}>Assistir</button></section>
    <div className="grid2">
      <section className="card"><h3><Newspaper size={20} aria-hidden /> Notícias</h3>
        {noticias.map(n => <button key={n.id} className="news-card task" onClick={() => abrir(n.id)}><span className="ne" aria-hidden>{n.e}</span><span style={{ flex: 1, minWidth: 0 }}><span className="tiny muted">{n.categoria} · {fmtData(n.data)}</span><br /><b>{n.titulo}</b><br /><span className="small muted">{n.resumo}</span></span></button>)}
      </section>
      <section className="card"><h3>Serviços incluídos no seu programa</h3><p className="small muted">Sem custo para você.</p>
        {servicos.map(sv => <div className="task" key={sv.id}><span aria-hidden style={{ fontSize: '1.4rem' }}>{sv.e}</span><span style={{ flex: 1, minWidth: 0 }}><b>{sv.t}</b><br /><span className="small muted">{sv.d}</span></span><button className="btn b-soft btn-sm" onClick={() => go('agendar')}>Agendar</button></div>)}
      </section>
    </div>
  </>
}

export function NoticiaPage({ go }: { go: Go }) {
  const { noticias, noticiaSel, setNoticiaSel, ganhar, toast, erro } = useStore()
  const n = noticias.find(x => x.id === noticiaSel) ?? noticias[0]
  const outras = noticias.filter(x => x.id !== n?.id)
  if (!n) return <section className="card"><p>Nenhuma notícia publicada.</p><button className="btn b-soft" onClick={() => go('minuto')}>Voltar</button></section>
  return <>
    <button className="btn b-line btn-sm" onClick={() => go('minuto')} style={{ marginBottom: 14 }}><ArrowLeft size={18} aria-hidden /> Voltar ao Minuto Saúde</button>
    <div className="grid2">
      <article className="card article">
        <p className="eyebrow">{n.categoria.toUpperCase()}</p><h1>{n.e} {n.titulo}</h1>
        <p className="meta">Publicado em {fmtData(n.data, { day: '2-digit', month: 'long', year: 'numeric' })} · Instituto SESI</p>
        <p><b>{n.resumo}</b></p>
        {n.texto.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        <div className="row wrap" style={{ gap: 8 }}><button className="btn b-pri" onClick={() => go('agendar')}>Agendar pelo Acolhe+</button><button className="btn b-soft" onClick={() => { ganhar(5); toast('Leitura registrada. +5 pontos') }}>Li a notícia (+5)</button></div>
      </article>
      <section className="card"><h3>Outras notícias</h3>
        {outras.map(o => <button key={o.id} className="news-card task" onClick={() => { setNoticiaSel(o.id); window.scrollTo(0, 0) }}><span className="ne" aria-hidden>{o.e}</span><span style={{ flex: 1, minWidth: 0 }}><span className="tiny muted">{o.categoria}</span><br /><b>{o.titulo}</b></span></button>)}
        {!outras.length && <p className="muted small">Sem outras notícias.</p>}
      </section>
    </div>
  </>
}

export function SesiPage({ go }: { go: Go }) {
  return <>
    <button className="btn b-line btn-sm" onClick={() => go('minuto')} style={{ marginBottom: 14 }}><ArrowLeft size={18} aria-hidden /> Voltar ao Minuto Saúde</button>
    <div className="page-head"><p className="eyebrow">CONHEÇA O SESI</p><h1>O que o SESI faz por você</h1><p className="muted">O Serviço Social da Indústria cuida da saúde, da educação e da qualidade de vida de quem trabalha na indústria e da sua família.</p></div>
    <section className="card hero row wrap"><div style={{ flex: 1, minWidth: 0 }}><div className="lab">SESI Saúde Acolhe</div><b className="big" style={{ margin: 0 }}>10.303 vidas atendidas</b><p className="small" style={{ marginTop: 6 }}>Atenção Primária à Saúde perto do trabalhador: acolhimento, acompanhamento e prevenção.</p></div></section>
    <div className="sesi-grid">
      {[['🩺', 'Atenção Primária à Saúde', 'Consultas, enfermagem, exames e acompanhamento de condições crônicas como hipertensão e diabetes.'],
        ['🦺', 'Segurança e saúde no trabalho', 'Exames ocupacionais, ergonomia e prevenção de acidentes nas empresas.'],
        ['🧠', 'Saúde emocional', 'Psicólogos e ações de bem-estar para reduzir estresse e ansiedade.'],
        ['🎓', 'Educação', 'Escolas SESI, educação de jovens e adultos e cursos para o trabalhador.'],
        ['🏊', 'Esporte e lazer', 'Clubes, natação, academias e eventos para a família da indústria.'],
        ['🥗', 'Alimentação saudável', 'Nutricionistas e campanhas para uma rotina mais leve, dentro e fora da fábrica.']].map(([e, t, d]) =>
        <section className="card" key={t}><span className="e" aria-hidden>{e}</span><h3 style={{ marginTop: 6 }}>{t}</h3><p className="small muted">{d}</p></section>)}
    </div>
    <section className="card" style={{ marginTop: 16 }}><h3>Como usar pelo Acolhe+</h3>
      <p className="small">Marque atendimentos em <b>Minha agenda</b>, acompanhe sua família em <b>Meus dependentes</b> e veja campanhas no <b>Minuto Saúde</b>. Dúvidas? Fale com a equipe em <b>Ajuda e WhatsApp</b>.</p>
      <div className="row wrap" style={{ gap: 8, marginTop: 10 }}><button className="btn b-pri" onClick={() => go('agenda')}>Ir para minha agenda</button><button className="btn b-soft" onClick={() => go('dependentes')}>Meus dependentes</button></div></section>
    <p className="tiny muted">Conteúdo ilustrativo para o protótipo.</p>
  </>
}
