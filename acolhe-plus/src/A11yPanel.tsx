import { useStore } from './store'
import { Modal } from './ui'

export default function A11yPanel({ onClose }: { onClose: () => void }) {
  const { a11y, setA11y, simples, speak, pararVoz } = useStore()
  const set = (p: Partial<typeof a11y>) => setA11y({ ...a11y, ...p })
  const Sw = ({ k, label, desc }: { k: 'contraste' | 'calmo'; label: string; desc: string }) =>
    <div className="setrow"><div style={{ flex: 1 }}><b>{label}</b><div className="small muted">{desc}</div></div>
      <button className="switch" role="switch" aria-checked={a11y[k]} aria-label={label} onClick={() => set({ [k]: !a11y[k] } as Partial<typeof a11y>)} /></div>
  return <Modal title="Acessibilidade" onClose={onClose}>
    <p className="muted small" style={{ marginBottom: 14 }}>Ajuste do seu jeito. Fica salvo neste aparelho. Dica: use a tecla <kbd>Tab</kbd> para navegar e <kbd>Enter</kbd> para escolher.</p>
    <b>Tamanho do texto</b>
    <div className="fsrow" role="group" aria-label="Tamanho do texto">
      {([[1, 'A−'], [2, 'A'], [3, 'A+'], [4, 'A++']] as const).map(([v, l]) =>
        <button key={v} aria-pressed={a11y.fs === v} onClick={() => set({ fs: v })}>{l}</button>)}
    </div>
    <div className="setrow" style={{ flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}><b>Interface</b><div className="small muted">Automática: a partir de 60 anos, usa a interface simples e ampliada.</div></div>
      <select className="inp inp-sm" value={a11y.modo} onChange={e => set({ modo: e.target.value as typeof a11y.modo })} aria-label="Tipo de interface">
        <option value="auto">Automática por idade</option><option value="classica">Clássica</option><option value="simples">Simples e ampliada</option>
      </select>
    </div>
    {a11y.modo === 'auto' && <div className="setrow"><label htmlFor="idade" style={{ flex: 1 }}><b>Idade de exemplo</b><div className="small muted">Para testar a troca automática</div></label>
      <input id="idade" className="inp inp-sm" type="number" min={16} max={100} value={a11y.idade} onChange={e => set({ idade: Number(e.target.value) })} style={{ width: 100 }} /></div>}
    <p className="small" style={{ margin: '4px 0 6px' }}><b>Agora:</b> {simples ? 'interface simples e ampliada' : 'interface clássica'}</p>
    <Sw k="contraste" label="Alto contraste" desc="Preto e branco, bordas fortes" />
    <Sw k="calmo" label="Reduzir animações" desc="Sem movimentos na tela" />
    <div className="setrow"><div style={{ flex: 1 }}><b>Leitura em voz alta</b><div className="small muted">Botão 🔊 no topo ou “Ouvir” nos cartões</div></div>
      <button className="btn b-soft" onClick={() => speak('Olá! Eu sou o Acolhe mais. Posso ler as telas para você.')}>Testar</button>
      <button className="btn b-line" onClick={pararVoz}>Parar</button></div>
    <div className="setrow"><label htmlFor="voz" style={{ flex: 1 }}><b>Velocidade da voz</b></label>
      <select id="voz" className="inp inp-sm" value={a11y.voz} onChange={e => set({ voz: Number(e.target.value) })} style={{ width: 150 }}>
        <option value={0.8}>Devagar</option><option value={1}>Normal</option><option value={1.2}>Rápida</option></select></div>
    <div className="setrow"><div style={{ flex: 1 }}><b>Libras</b><div className="small muted">Na versão final, integração com o VLibras (gov.br)</div></div><span className="chip c-blue">em breve</span></div>
    <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={onClose}>Pronto</button>
  </Modal>
}
