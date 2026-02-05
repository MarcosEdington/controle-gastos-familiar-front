export interface Pessoa {
  id?: number;
  nome: string;
  idade: number;
}

export interface Categoria {
  id?: number;
  descricao: string;
  finalidade: string;
}

export interface Transacao {
  id?: number;
  descricao: string;
  valor: number;
  tipo: 'Despesa' | 'Receita';
  categoriaId: number;
  pessoaId: number;
  dataVencimento: string; 
  pago: boolean;
}

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha?: string;
  ativo: boolean;
}