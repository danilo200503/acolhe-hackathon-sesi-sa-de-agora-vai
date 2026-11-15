// Validações prontas para o login real (integração futura). Hoje o protótipo entra sem login.
// Validações reutilizáveis (CPF, data de nascimento)
export function soDigitos(v: string) { return v.replace(/\D/g, '') }
export function mascaraCPF(v: string) {
  const d = soDigitos(v).slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}
/** Valida CPF pelos dígitos verificadores (algoritmo da Receita Federal). */
export function cpfValido(v: string) {
  const c = soDigitos(v)
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  const dv = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(c[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10])
}
/** Mensagem de erro do CPF ou '' se estiver ok. */
export function erroCPF(v: string) {
  const c = soDigitos(v)
  if (!c.length) return 'Digite o seu CPF.'
  if (c.length < 11) return `Faltam ${11 - c.length} número(s) no CPF.`
  if (/^(\d)\1{10}$/.test(c)) return 'CPF inválido: números todos iguais.'
  if (!cpfValido(c)) return 'CPF inválido. Confira os números digitados.'
  return ''
}
export function mascaraData(v: string) {
  const d = soDigitos(v).slice(0, 8)
  return d.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}
export function erroNascimento(v: string, hojeISO = '2026-11-15') {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return 'Use o formato dd/mm/aaaa.'
  const [, dd, mm, aa] = m.map(Number) as unknown as number[]
  const dt = new Date(aa, mm - 1, dd)
  if (dt.getFullYear() !== aa || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return 'Essa data não existe.'
  const hoje = new Date(hojeISO + 'T12:00:00')
  let idade = hoje.getFullYear() - aa; if (hoje < new Date(hoje.getFullYear(), mm - 1, dd)) idade--
  if (idade < 14) return 'Idade mínima para o programa: 14 anos.'
  if (idade > 110) return 'Confira o ano de nascimento.'
  return ''
}
