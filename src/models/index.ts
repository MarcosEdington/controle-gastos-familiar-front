export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: string;  // "Despesa", "Receita" ou "Ambas"
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: string;  // "Despesa" ou "Receita"
  categoriaId: number;
  pessoaId: number;
}

export interface TotalPorPessoa {
  id: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface TotalGeral {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}