import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { Usuario } from '../types';

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/Usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados: Usuario = { 
        nome, 
        email, 
        cpf, 
        telefone, 
        senha, 
        ativo: true 
    };

    try {
      if (editandoId) {
        await api.put(`/Usuarios/${editandoId}`, dados);
        Swal.fire({ icon: 'success', title: 'Acesso Atualizado!', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/Usuarios', dados);
        Swal.fire({ icon: 'success', title: 'Usuário Ativo!', text: 'O acesso já está liberado.', timer: 2000, showConfirmButton: false });
      }
      limparForm();
      load();
    } catch (error) {
      Swal.fire('Erro', 'Verifique os dados e tente novamente.', 'error');
    }
  };

  const limparForm = () => {
    setNome(''); setEmail(''); setCpf(''); setTelefone(''); setSenha('');
    setEditandoId(null);
  };

  const prepararEdicao = (u: Usuario) => {
    setEditandoId(u.id!);
    setNome(u.nome);
    setEmail(u.email);
    setCpf(u.cpf);
    setTelefone(u.telefone);
    setSenha(''); // Senha não retornamos por segurança, ele digita uma nova se quiser mudar
    setIsMinimized(false);
    window.scrollTo(0, 0);
  };

  const handleRemover = async (id: number, nomeUser: string) => {
    Swal.fire({
      title: 'Revogar Acesso?',
      text: `Deseja excluir o usuário ${nomeUser}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await api.delete(`/Usuarios/${id}`);
        load();
        Swal.fire('Excluído!', 'O acesso foi removido.', 'success');
      }
    });
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-black text-dark mb-0">GESTÃO DE ACESSOS</h2>
          <p className="text-muted small fw-bold">CONTROLE DE USUÁRIOS DO SISTEMA</p>
        </div>
        <span className="badge bg-dark px-3 py-2">{usuarios.length} USUÁRIOS</span>
      </div>

      {/* CARD DE CADASTRO */}
      <div className="card-premium-light shadow-sm">
        <div className="card-title-area bg-bar-gray">
          <div className="d-flex align-items-center">
            <button onClick={() => setIsMinimized(!isMinimized)} className="btn btn-sm p-0 me-2 border-0">
              <i className={`bi ${isMinimized ? 'bi-chevron-down' : 'bi-chevron-up'} text-dark fw-bold`}></i>
            </button>
            <span className="card-label">{editandoId ? 'Editar Perfil de Acesso' : 'Cadastrar Novo Administrador'}</span>
          </div>
          <i className="bi bi-shield-lock text-primary fs-5"></i>
        </div>
        {!isMinimized && (
          <div className="p-4">
            <form onSubmit={handleSalvar} className="row g-3">
              <div className="col-md-6">
                <label className="small fw-bold text-muted">NOME COMPLETO</label>
                <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted">E-MAIL</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">CPF</label>
                <input className="form-control" value={cpf} onChange={e => setCpf(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">TELEFONE</label>
                <input className="form-control" value={telefone} onChange={e => setTelefone(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted">SENHA DE ACESSO</label>
                <input type="password" placeholder="••••••" className="form-control" value={senha} onChange={e => setSenha(e.target.value)} required={!editandoId} />
              </div>
              
              <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={limparForm} className="btn btn-light border fw-bold px-4">CANCELAR</button>
                <button className={`btn ${editandoId ? 'btn-warning' : 'btn-primary'} fw-bold px-5 shadow-sm`}>
                  {editandoId ? 'ATUALIZAR ACESSO' : 'ATIVAR USUÁRIO'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="card-premium-light shadow-sm">
        <div className="card-title-area bg-bar-gray">
          <span className="card-label">Usuários Ativos no Core Finance</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted">
                <th className="ps-4">NOME / EMAIL</th>
                <th>CPF</th>
                <th>TELEFONE</th>
                <th>STATUS</th>
                <th className="text-end pe-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="ps-4 py-3">
                    <div className="fw-bold text-dark">{u.nome.toUpperCase()}</div>
                    <div className="text-muted small">{u.email}</div>
                  </td>
                  <td>{u.cpf}</td>
                  <td>{u.telefone}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">ATIVO</span>
                  </td>
                  <td className="text-end pe-4">
                    <button onClick={() => prepararEdicao(u)} className="btn btn-sm btn-outline-primary border-2 fw-bold me-2">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button onClick={() => handleRemover(u.id!, u.nome)} className="btn btn-sm btn-outline-danger border-2 fw-bold">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;