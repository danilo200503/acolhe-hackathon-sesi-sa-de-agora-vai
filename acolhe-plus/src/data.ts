// Dados FICTÍCIOS para demonstração. Não usar dados reais de saúde.

export type Role = 'colaborador' | 'enfermagem' | 'empresa' | 'instituto'
export type Modo = 'auto' | 'classica' | 'simples'
export type Motivo = 'Meu chefe não liberou' | 'Horário ruim para mim' | 'Transporte / distância' | 'Estou com dúvida ou receio' | 'Outro motivo'
export const MOTIVOS: Motivo[] = ['Meu chefe não liberou', 'Horário ruim para mim', 'Transporte / distância', 'Estou com dúvida ou receio', 'Outro motivo']

export type StatusEvento = 'Confirmado' | 'Solicitado' | 'Realizado' | 'Faltou' | 'Cancelado'
export interface Evento {
  id: string; data: string; hora: string; titulo: string; tipo: string
  modalidade: 'Vídeo na empresa' | 'Presencial no SESI'; local: string; status: StatusEvento; obs?: string
}

export interface Documento {
  id: string; tipo: 'consulta' | 'atestado' | 'exame'; titulo: string; data: string
  profissional?: string; registro?: string
  motivo?: string; avaliacao?: string; diagnostico?: string; cid?: string; conduta?: string; retorno?: string
  dias?: number; inicio?: string; mostrarCid?: boolean
  exameTipo?: string; resultado?: string; enviadoPeloPaciente?: boolean; avaliado?: boolean
  arquivoNome?: string; arquivoUrl?: string; arquivoTipo?: string
}

export interface Demanda { id: string; descricao: string; status: 'Pendente' | 'Em andamento' | 'Concluída'; prazo: string }

export interface Barreira { id: string; pessoa: string; motivo: Motivo; detalhe?: string; quando: string; resolvida: boolean }

// Janela de disponibilidade: dias (0=seg..4=sex) x horas (7..16)
export const HORAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
export const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
export type Janela = boolean[][] // [dia][indiceHora]
export const janelaPadrao = (): Janela => DIAS_SEMANA.map(() => HORAS.map(h => h >= 13 && h <= 15))

export interface Funcionario {
  id: string; nome: string; setor: string; turno: string; participacao: 'Ativo na jornada' | 'Convidado' | 'Sem acesso ainda'
  janela: Janela | null; maxSemana: number
}

export interface Paciente {
  id: string; nome: string; empresa: string; idade: number; risco: 1 | 2 | 3 | 4
  ultimoContato: number; retornoDias: number; faltas: number; missoes: number; familia: boolean; motivo?: Motivo; detalhe?: string
  cronico?: string // condição crônica: nível fixo 3
}

export interface Meta { id: string; nome: string; unidade: string; inicio: number; atual: number; alvo: number; dica: string; menorMelhor: boolean }

export const RISCO = [
  { n: 1, nome: 'Saúde em dia', retorno: 'retorno a cada 6 meses', cor: 'green' },
  { n: 2, nome: 'Acompanhar', retorno: 'retorno a cada 6 meses', cor: 'yellow' },
  { n: 3, nome: 'Cuidado próximo', retorno: 'retorno a cada 3 meses', cor: 'orange' },
  { n: 4, nome: 'Atenção prioritária', retorno: 'a equipe combina com você', cor: 'red' },
] as const

export interface Objetivo { e: string; t: string }
export const EMOJIS = ['✈️', '👨‍👩‍👧', '🎓', '🧓', '⚽', '🏠', '🎣', '💃', '🚴', '❤️']
export const PROPOSITOS = [
  { e: '✈️', t: 'Viajar e curtir com meus filhos', d: 'Férias em família com disposição' },
  { e: '🎓', t: 'Ver meus filhos se formarem', d: 'Estar bem nos momentos importantes' },
  { e: '🧓', t: 'Envelhecer com saúde', d: 'Ter energia aos 70 como tenho hoje' },
  { e: '⚽', t: 'Voltar a praticar esporte', d: 'Aguentar o jogo de sábado inteiro' },
]

export const sementeEventos = (): Evento[] => [
  { id: 'e0', data: '2026-08-12', hora: '14h10', titulo: 'Consulta médica', tipo: 'Consulta médica', modalidade: 'Presencial no SESI', local: 'SESI Saúde · Unidade CIA', status: 'Realizado' },
  { id: 'e1', data: '2026-11-20', hora: '07h30', titulo: 'Exame de sangue', tipo: 'Exame', modalidade: 'Presencial no SESI', local: 'SESI Saúde · Unidade CIA', status: 'Confirmado', obs: 'Jejum de 8 horas. Leve um documento com foto.' },
  { id: 'e2', data: '2026-11-25', hora: '14h10', titulo: 'Conversa com a nutricionista', tipo: 'Nutricionista', modalidade: 'Vídeo na empresa', local: 'Sala de saúde · Metalsul', status: 'Solicitado' },
  { id: 'e3', data: '2026-12-15', hora: '13h50', titulo: 'Retorno com a enfermagem', tipo: 'Consulta de enfermagem', modalidade: 'Vídeo na empresa', local: 'Sala de saúde · Metalsul', status: 'Confirmado' },
]

export const sementeDocs = (): Documento[] => [
  { id: 'd1', tipo: 'consulta', titulo: 'Resumo da consulta médica', data: '2026-08-12', profissional: 'Dra. Paula Ramos', registro: 'CRM-BA 00000',
    motivo: 'Retorno do acompanhamento de pressão arterial.', avaliacao: 'PA 142/90 mmHg. Peso 86 kg. Sem queixas agudas. Boa adesão à medicação.',
    diagnostico: 'Hipertensão arterial sistêmica em acompanhamento', cid: 'I10', conduta: 'Manter losartana 50 mg/dia. Caminhada 150 min/semana. Encaminhada à nutricionista. Solicitados exames de sangue.', retorno: 'Retorno em 3 meses ou antes se necessário.' },
  { id: 'd2', tipo: 'atestado', titulo: 'Atestado de comparecimento', data: '2026-08-12', profissional: 'Dra. Paula Ramos', registro: 'CRM-BA 00000', dias: 0, inicio: '2026-08-12', mostrarCid: false },
  { id: 'd3', tipo: 'exame', titulo: 'Glicemia de jejum', data: '2026-05-10', exameTipo: 'Sangue', resultado: '98 mg/dL (referência: 70–99)', avaliado: true },
  { id: 'd4', tipo: 'exame', titulo: 'Perfil lipídico', data: '2026-05-10', exameTipo: 'Sangue', resultado: 'LDL 128 mg/dL · HDL 48 mg/dL', avaliado: true },
]

export const sementeDemandas = (): Demanda[] => [
  { id: 'q1', descricao: 'Fazer exames de sangue solicitados', status: 'Pendente', prazo: '2026-11-30' },
  { id: 'q2', descricao: 'Conversar com a nutricionista', status: 'Em andamento', prazo: '2026-11-30' },
  { id: 'q3', descricao: 'Medir a pressão 1x por semana no posto da fábrica', status: 'Em andamento', prazo: '2026-12-15' },
]

export const sementeMetas = (): Meta[] => [
  { id: 'pa', nome: 'Pressão (máxima)', unidade: 'mmHg', inicio: 152, atual: 136, alvo: 130, dica: 'Remédio todo dia e menos sal', menorMelhor: true },
  { id: 'peso', nome: 'Peso', unidade: 'kg', inicio: 88, atual: 84, alvo: 78, dica: 'Combinado com a nutricionista', menorMelhor: true },
  { id: 'cam', nome: 'Caminhada na semana', unidade: 'min', inicio: 0, atual: 95, alvo: 150, dica: '30 min, 5 vezes por semana', menorMelhor: false },
  { id: 'cons', nome: 'Consultas e exames em dia', unidade: 'de 3', inicio: 0, atual: 2, alvo: 3, dica: 'Falta o exame de sangue', menorMelhor: false },
]

export const progressoMeta = (m: Meta) => {
  const total = Math.abs(m.alvo - m.inicio) || 1
  const feito = m.menorMelhor ? m.inicio - m.atual : m.atual - m.inicio
  return Math.max(0, Math.min(1, feito / total))
}
export const faltaMeta = (m: Meta) => {
  const f = m.menorMelhor ? m.atual - m.alvo : m.alvo - m.atual
  return Math.max(0, Math.round(f * 10) / 10)
}

export const sementePacientes = (): Paciente[] => [
  { id: 'p1', nome: 'Juliana B. A.', empresa: 'Metalsul', idade: 45, risco: 3, cronico: 'Hipertensão arterial', ultimoContato: 94, retornoDias: 25, faltas: 1, missoes: 2, familia: true },
  { id: 'p2', nome: 'Josefa M.', empresa: 'Têxtil Brisa', idade: 61, risco: 4, ultimoContato: 61, retornoDias: -21, faltas: 2, missoes: 1, familia: false, motivo: 'Estou com dúvida ou receio' },
  { id: 'p3', nome: 'Rafael S.', empresa: 'Metalsul', idade: 38, risco: 3, cronico: 'Diabetes tipo 2', ultimoContato: 120, retornoDias: -30, faltas: 2, missoes: 0, familia: false },
  { id: 'p4', nome: 'Edvaldo P.', empresa: 'Vale Verde', idade: 57, risco: 4, ultimoContato: 40, retornoDias: -5, faltas: 1, missoes: 2, familia: true, motivo: 'Transporte / distância' },
  { id: 'p5', nome: 'Wellington B.', empresa: 'Vale Verde', idade: 44, risco: 3, ultimoContato: 110, retornoDias: -20, faltas: 3, missoes: 0, familia: false, motivo: 'Meu chefe não liberou' },
  { id: 'p6', nome: 'Cláudia R.', empresa: 'Têxtil Brisa', idade: 50, risco: 3, cronico: 'Hipertensão arterial', ultimoContato: 85, retornoDias: 5, faltas: 1, missoes: 3, familia: true },
  { id: 'p7', nome: 'Gustavo M. C.', empresa: 'Metalsul', idade: 33, risco: 1, ultimoContato: 150, retornoDias: 30, faltas: 0, missoes: 4, familia: false },
]

export function scorePaciente(p: Paciente, motivo?: Motivo) {
  const f: [string, number][] = []
  let s = 0
  if (p.retornoDias < 0) { const v = Math.min(35, 15 + Math.abs(p.retornoDias)); s += v; f.push([`Retorno vencido há ${Math.abs(p.retornoDias)} dias`, v]) }
  if (p.faltas) { s += p.faltas * 12; f.push([`${p.faltas} falta(s) em 6 meses`, p.faltas * 12]) }
  if (p.missoes === 0) { s += 18; f.push(['Nenhuma missão em 14 dias', 18]) } else if (p.missoes === 1) { s += 8; f.push(['Pouca atividade (1 missão)', 8]) }
  if (p.risco === 4) { s += 12; f.push(['Nível de cuidado 4', 12]) }
  const m = motivo ?? p.motivo
  if (m) { s += 10; f.push([`Barreira relatada: ${m === 'Outro motivo' && p.detalhe ? p.detalhe.toLowerCase() : m.toLowerCase()}`, 10]) }
  if (p.familia) { s -= 10; f.push(['Família participando', -10]) }
  if (p.missoes >= 3) { s -= 10; f.push(['Missões em dia', -10]) }
  return { s: Math.max(3, Math.min(97, s)), f }
}

export const sementeFuncionarios = (): Funcionario[] => [
  { id: 'f1', nome: 'Juliana Barros Alves', setor: 'Produção · Linha 2', turno: 'A · 7h às 17h', participacao: 'Ativo na jornada', janela: janelaPadrao(), maxSemana: 2 },
  { id: 'f2', nome: 'Rafael Souza', setor: 'Produção · Linha 2', turno: 'A · 7h às 17h', participacao: 'Convidado', janela: null, maxSemana: 1 },
  { id: 'f3', nome: 'Gustavo Moreira Costa', setor: 'Manutenção', turno: 'B · 9h às 18h', participacao: 'Ativo na jornada', janela: janelaPadrao(), maxSemana: 2 },
  { id: 'f4', nome: 'Luciana Teixeira', setor: 'Expedição', turno: 'A · 7h às 17h', participacao: 'Ativo na jornada', janela: null, maxSemana: 1 },
  { id: 'f5', nome: 'Marcos Andrade', setor: 'Produção · Linha 4', turno: 'A · 7h às 17h', participacao: 'Sem acesso ainda', janela: null, maxSemana: 1 },
]

export const fmtData = (iso: string, opt: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', opt)
export const diaSemana = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })
export const uid = () => Math.random().toString(36).slice(2, 9)
export const HOJE = '2026-11-15'

export const NIVEL_CRONICO = 3

/* ---------- Dependentes ---------- */
export interface Vacina { nome: string; status: 'Em dia' | 'Pendente' | 'Agendada'; data?: string }
export interface Dependente {
  id: string; nome: string; parentesco: string; idade: number; carteira: string; autorizou: boolean
  vacinas: Vacina[]; consultas: { data: string; titulo: string; status: string }[]; alerta?: string; obs?: string
}
export const sementeDependentes = (): Dependente[] => [
  { id: 'dp1', nome: 'Pedro Alves', parentesco: 'Filho', idade: 12, carteira: 'SESI 0012-3456-02', autorizou: true,
    vacinas: [{ nome: 'HPV (2ª dose)', status: 'Pendente' }, { nome: 'Meningocócica ACWY', status: 'Em dia', data: '2026-03-10' }, { nome: 'Gripe 2026', status: 'Em dia', data: '2026-05-02' }],
    consultas: [{ data: '2026-12-02', titulo: 'Pediatra · rotina anual', status: 'Confirmado' }, { data: '2026-06-18', titulo: 'Dentista · limpeza', status: 'Realizado' }],
    alerta: 'Vacina HPV (2ª dose) pendente', obs: 'Natação no SESI liberada pelo pediatra.' },
  { id: 'dp2', nome: 'Ana Alves', parentesco: 'Filha', idade: 6, carteira: 'SESI 0012-3456-03', autorizou: true,
    vacinas: [{ nome: 'Tríplice viral (reforço)', status: 'Em dia', data: '2025-09-12' }, { nome: 'Gripe 2026', status: 'Agendada', data: '2026-11-22' }],
    consultas: [{ data: '2026-11-22', titulo: 'Vacina da gripe', status: 'Confirmado' }, { data: '2026-04-09', titulo: 'Oftalmologista', status: 'Realizado' }] },
  { id: 'dp3', nome: 'Carlos Alves', parentesco: 'Marido', idade: 47, carteira: 'SESI 0012-3456-01', autorizou: false,
    vacinas: [], consultas: [] },
]

/* ---------- Minuto Saúde ---------- */
export interface Servico { id: string; e: string; t: string; d: string }
export interface Noticia { id: string; titulo: string; categoria: string; data: string; e: string; resumo: string; texto: string }
export const sementeServicos = (): Servico[] => [
  { id: 's1', e: '🩺', t: 'Exame preventivo', d: 'Papanicolau e orientação' }, { id: 's2', e: '🌸', t: 'Colocação de DIU', d: 'Com consulta prévia' },
  { id: 's3', e: '👂', t: 'Lavagem de ouvido', d: 'Procedimento rápido' }, { id: 's4', e: '🩹', t: 'Curativo e retirada de pontos', d: 'Na unidade SESI' },
  { id: 's5', e: '🥗', t: 'Nutricionista', d: 'Por vídeo ou presencial' }, { id: 's6', e: '🧠', t: 'Psicólogo(a)', d: 'Saúde emocional' },
  { id: 's7', e: '📹', t: 'Consulta por vídeo', d: 'Na sala de saúde da empresa' },
]
export const sementeNoticias = (): Noticia[] => [
  { id: 'n1', titulo: 'Novembro Azul: SESI amplia exames de próstata para trabalhadores da indústria', categoria: 'Campanha', data: '2026-11-10', e: '💙',
    resumo: 'Até 30/11, homens acima de 45 anos podem agendar avaliação sem custo pelo Acolhe+.',
    texto: 'Durante todo o mês de novembro, as unidades do SESI Saúde ampliaram a oferta de consultas e exames de rastreio para homens acima de 45 anos.\n\nO agendamento é feito pelo próprio Acolhe+, dentro da janela de disponibilidade combinada com a empresa. A conversa com o médico pode acontecer por vídeo, na sala de saúde da fábrica, e os exames são presenciais.\n\nA campanha também leva rodas de conversa às empresas parceiras para quebrar tabus sobre a saúde do homem.' },
  { id: 'n2', titulo: 'Sala de saúde por vídeo reduz tempo fora da linha de 4 horas para 30 minutos', categoria: 'Inovação', data: '2026-11-03', e: '📹',
    resumo: 'Teleatendimento dentro da empresa facilita o acompanhamento de quem tem hipertensão e diabetes.',
    texto: 'Com as salas de saúde instaladas nas empresas, o trabalhador faz o retorno com a enfermagem ou com o médico por vídeo, sem precisar se deslocar até a unidade.\n\nO tempo fora da linha de produção cai de 3 a 4 horas para cerca de 30 minutos, o que facilita a liberação pela liderança e reduz faltas às consultas.' },
  { id: 'n3', titulo: 'Vacinação contra a gripe para dependentes: agende pelo app', categoria: 'Família', data: '2026-10-28', e: '💉',
    resumo: 'Filhos e cônjuges cadastrados podem tomar a vacina nas unidades SESI.',
    texto: 'Dependentes cadastrados no programa podem receber a vacina da gripe nas unidades do SESI Saúde.\n\nNo Acolhe+, abra “Meus dependentes”, escolha quem vai vacinar e marque o horário. A carteira de vacinação é atualizada automaticamente após a aplicação.' },
]

/* ---------- Enfermagem: anotações e marcações ---------- */
export interface Nota { id: string; data: string; hora: string; autor: string; tipo: 'Evolução' | 'Observação' | 'Contato' | 'Alerta'; texto: string }
export const sementeNotas = (): Record<string, Nota[]> => ({
  p1: [
    { id: 'nt1', data: '2026-11-14', hora: '15h20', autor: 'Enf. Renata Lima', tipo: 'Contato', texto: 'Ligação de acompanhamento. Paciente relata caminhadas 3x por semana e boa adesão à losartana. Reforçado jejum para o exame do dia 20/11.' },
    { id: 'nt2', data: '2026-08-12', hora: '14h40', autor: 'Dra. Paula Ramos', tipo: 'Evolução', texto: 'PA 142/90. Mantida medicação. Encaminhada à nutrição. Paciente motivada pelo objetivo de viajar com os filhos.' },
    { id: 'nt3', data: '2026-03-02', hora: '09h10', autor: 'Enf. Renata Lima', tipo: 'Alerta', texto: 'Alergia a dipirona confirmada pela paciente.' },
  ],
  p2: [{ id: 'nt4', data: '2026-10-30', hora: '10h00', autor: 'Enf. Renata Lima', tipo: 'Observação', texto: 'Demonstrou receio em realizar exames. Combinar ligação de acolhimento antes de remarcar.' }],
})
export interface Marcacao { id: string; data: string; hora: string; pacienteId: string; paciente: string; atendimento: string; modalidade: string; profissional: string; presenca?: 'Presente' | 'Faltou' }
export const sementeMarcacoes = (): Marcacao[] => [
  { id: 'm1', data: '2026-11-15', hora: '07h30', pacienteId: 'p1', paciente: 'Juliana B. A.', atendimento: 'Coleta · exame de sangue', modalidade: 'Presencial', profissional: 'Laboratório SESI' },
  { id: 'm2', data: '2026-11-15', hora: '09h10', pacienteId: 'p4', paciente: 'Edvaldo P.', atendimento: 'Consulta de enfermagem', modalidade: 'Presencial', profissional: 'Enf. Renata Lima' },
  { id: 'm3', data: '2026-11-15', hora: '13h50', pacienteId: 'p5', paciente: 'Wellington B.', atendimento: 'Retorno', modalidade: 'Vídeo · Vale Verde', profissional: 'Enf. Renata Lima' },
  { id: 'm4', data: '2026-11-15', hora: '14h10', pacienteId: 'p6', paciente: 'Cláudia R.', atendimento: 'Nutricionista', modalidade: 'Vídeo · Têxtil Brisa', profissional: 'Nut. Bruno Dias' },
  { id: 'm5', data: '2026-11-15', hora: '15h20', pacienteId: 'p2', paciente: 'Josefa M.', atendimento: 'Acolhimento', modalidade: 'Ligação', profissional: 'Enf. Renata Lima' },
  { id: 'm6', data: '2026-11-17', hora: '14h10', pacienteId: 'p7', paciente: 'Gustavo M. C.', atendimento: 'Consulta de enfermagem', modalidade: 'Vídeo · Metalsul', profissional: 'Enf. Renata Lima' },
  { id: 'm7', data: '2026-11-18', hora: '08h10', pacienteId: 'p3', paciente: 'Rafael S.', atendimento: 'Consulta médica', modalidade: 'Presencial', profissional: 'Dra. Paula Ramos' },
]
export const PROFISSIONAIS = ['Enf. Renata Lima', 'Dra. Paula Ramos', 'Nut. Bruno Dias', 'Psic. Carla Nunes']
