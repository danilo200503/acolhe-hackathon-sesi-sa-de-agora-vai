import { useState } from 'react'
import { Accessibility, ArrowRight, MessageCircle, Lock, Stethoscope, Building2, Landmark } from 'lucide-react'
import { useStore } from '../store'
import { Logo, Modal } from '../ui'
import type { Role } from '../data'

/**
 * Tela inicial do protótipo: sem login. Um toque em “Iniciar” entra como colaborador(a).
 * Os outros perfis ficam acessíveis aqui e pelo seletor “Visualização” dentro do app.
 * Termos de uso e Política de Privacidade continuam disponíveis para leitura.
 */
export default function Login({ onAcc }: { onAcc: () => void }) {
  const { setLogado, setRole } = useStore()
  const [modal, setModal] = useState<'' | 'ajuda' | 'termos' | 'lgpd'>('')
  const entrar = (r: Role) => { setRole(r); setLogado(true); window.scrollTo(0, 0) }
  return <div className="login">
    <section className="lg-left">
      <div className="lg-brand"><Logo h={48} /><span className="lg-slogan">O futuro começa pelo cuidado</span></div>
      <h1>Seu cuidado começa com acolhimento.</h1>
      <p>Um espaço para acompanhar sua saúde e cuidar do que importa para você.</p>
      <svg className="art" viewBox="0 0 560 300" width="100%" aria-hidden="true">
        <path d="M0 230 C 90 150, 160 150, 230 200 S 380 250, 450 140 S 540 60, 560 60" fill="none" stroke="#1E88D8" strokeWidth="3" />
        <rect x="70" y="120" width="230" height="150" rx="75" fill="none" stroke="#3A75A8" strokeWidth="40" />
        <rect x="220" y="70" width="230" height="150" rx="75" fill="none" stroke="#8ECFF6" strokeWidth="40" />
        <path d="M118 175 C 160 200, 210 230, 300 210" fill="none" stroke="#1E88D8" strokeWidth="3" />
      </svg>
      <div className="tag">O FUTURO COMEÇA PELO CUIDADO</div>
    </section>
    <section className="lg-right">
      <div style={{ textAlign: 'right' }}><button className="acc-btn" onClick={onAcc}><Accessibility size={24} aria-hidden /> Acessibilidade</button></div>
      <div className="lg-form lg-start">
        <h1>Que bom ter você por aqui.</h1>
        <p className="muted lead">Acompanhe sua saúde, agende atendimentos no seu horário e cuide do que importa para você.</p>
        <ul className="lg-pontos">
          <li>📅 Agende dentro do horário que a empresa liberou</li>
          <li>🎯 Veja quanto falta para chegar no seu objetivo</li>
          <li>🔒 Seus dados de saúde são só seus e da equipe de saúde</li>
        </ul>
        <button className="btn b-pri w100 btn-xl" onClick={() => entrar('colaborador')}>Iniciar <ArrowRight size={22} aria-hidden /></button>
        <p className="small muted lg-termos">Ao iniciar, você concorda com os <button type="button" className="linklike" onClick={() => setModal('termos')}>Termos de uso</button> e a <button type="button" className="linklike" onClick={() => setModal('lgpd')}>Política de Privacidade (LGPD)</button>.</p>
        <div className="lg-perfis" role="group" aria-labelledby="perfis-l">
          <p id="perfis-l" className="small muted">Ou veja o Acolhe+ como:</p>
          <div className="lg-perfis-btns">
            <button type="button" className="btn b-line btn-sm" onClick={() => entrar('enfermagem')}><Stethoscope size={18} aria-hidden /> Enfermagem</button>
            <button type="button" className="btn b-line btn-sm" onClick={() => entrar('empresa')}><Building2 size={18} aria-hidden /> Empresa / RH</button>
            <button type="button" className="btn b-line btn-sm" onClick={() => entrar('instituto')}><Landmark size={18} aria-hidden /> Instituto SESI</button>
          </div>
        </div>
        <p className="small muted row lg-foot" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}><MessageCircle size={16} aria-hidden /> Precisa de ajuda? <button type="button" className="linklike" onClick={() => setModal('ajuda')}>Fale com a equipe</button></p>
        <p className="tiny muted row" style={{ justifyContent: 'center', gap: 6, marginTop: 4 }}><Lock size={14} aria-hidden /> Protótipo de demonstração: sem cadastro e com dados fictícios.</p>
      </div>
    </section>
    {modal === 'ajuda' && <Modal title="Fale com a equipe" onClose={() => setModal('')}>
      <p>Segunda a sexta, das 7h às 19h.</p><p style={{ marginTop: 8 }}><b>WhatsApp:</b> (71) 0000-0000<br /><b>Telefone:</b> 0800 000 0000</p>
      <p className="tiny muted" style={{ marginTop: 8 }}>Números ilustrativos do protótipo.</p>
    </Modal>}
    {modal === 'termos' && <Modal title="Termos de uso do Acolhe+" onClose={() => setModal('')} wide>
      <div className="legal">
        <p className="small muted">Versão de demonstração · novembro de 2026 · texto-modelo sujeito a revisão jurídica</p>
        <h4>1. O que é o Acolhe+</h4><p>Plataforma do programa SESI Saúde Acolhe (Atenção Primária à Saúde) para o trabalhador acompanhar seu plano de cuidado, agendar atendimentos, ver documentos e receber lembretes. Não cria novos serviços: organiza o acesso aos que já existem no programa.</p>
        <h4>2. Quem pode usar</h4><p>Trabalhadores incluídos pela empresa contratante, seus dependentes vinculados, profissionais de saúde do SESI e gestores da empresa e do SESI, cada um com acesso apenas ao que seu perfil permite.</p>
        <h4>3. Não é atendimento de urgência</h4><p>Em caso de emergência, ligue <b>192 (SAMU)</b> ou procure o pronto-socorro mais próximo. As mensagens e o chat não substituem a consulta.</p>
        <h4>4. Suas responsabilidades</h4><p>Manter sua senha em sigilo, informar dados verdadeiros e usar a comunidade com respeito. Conteúdos ofensivos ou que exponham a saúde de outras pessoas podem ser removidos.</p>
        <h4>5. Pontos e recompensas</h4><p>Pontos vêm da participação (agendar, comparecer, cumprir missões) e nunca de resultado de exame. Recompensas dependem da disponibilidade dos parceiros e da política da empresa.</p>
        <h4>6. Documentos</h4><p>Atestados e resumos de consulta são emitidos pelos profissionais responsáveis. O CID só aparece no atestado com a sua autorização.</p>
        <h4>7. Alterações</h4><p>Estes termos podem mudar. Você será avisado no aplicativo antes de qualquer alteração relevante.</p>
      </div>
      <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => setModal('')}>Entendi</button>
    </Modal>}
    {modal === 'lgpd' && <Modal title="Política de Privacidade · LGPD" onClose={() => setModal('')} wide>
      <div className="legal">
        <p className="small muted">Lei Geral de Proteção de Dados (Lei nº 13.709/2018) · texto-modelo sujeito a revisão jurídica</p>
        <h4>Quem cuida dos seus dados</h4><p>O SESI é o controlador dos dados tratados no programa. Encarregado de dados (DPO): <b>privacidade@exemplo.org.br</b> (contato ilustrativo).</p>
        <h4>Quais dados</h4><p>Identificação (nome, CPF, contato), dados funcionais (empresa, setor, turno, janela de disponibilidade) e <b>dados de saúde</b> (plano de cuidado, consultas, exames, atestados), que são dados sensíveis (art. 5º, II).</p>
        <h4>Para quê e com qual base legal</h4><p>Para prestar e coordenar o seu cuidado, agendar atendimentos e enviar lembretes: tutela da saúde (art. 11, II, “f”) e o seu consentimento (art. 11, I) para recursos opcionais, como família e comunidade.</p>
        <h4>Quem vê o quê</h4><p><b>Equipe de saúde:</b> seus dados clínicos. <b>Empresa:</b> dados funcionais, janela de disponibilidade e indicadores agregados de grupos com 10 ou mais pessoas. <b>Líder:</b> só o horário do compromisso. <b>Família:</b> só missões e incentivos, se você permitir. <b>Parceiros:</b> só o voucher, nunca dados de saúde.</p>
        <h4>Seus direitos (art. 18)</h4><p>Confirmar o tratamento, acessar, corrigir, pedir anonimização ou exclusão do que não for obrigatório guardar, saber com quem compartilhamos e revogar consentimentos a qualquer momento em “Privacidade”.</p>
        <h4>Segurança e guarda</h4><p>Dados criptografados, acesso por perfil e registro de quem acessou. O prontuário é guardado pelo prazo exigido pelas normas de saúde.</p>
      </div>
      <button className="btn b-pri w100" style={{ marginTop: 14 }} onClick={() => setModal('')}>Entendi</button>
    </Modal>}
  </div>
}
