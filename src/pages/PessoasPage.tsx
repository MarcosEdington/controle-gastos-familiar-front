import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { Pessoa } from '../types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const PessoasPage: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/Pessoas');
      setPessoas(res.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      Swal.fire('Erro', 'Falha ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(idade) < 0 || Number(idade) > 120) {
      return Swal.fire('Erro', 'Idade inválida.', 'error');
    }
    const dados = { nome, idade: Number(idade) };

    try {
      if (editandoId) {
        await api.put(`/Pessoas/${editandoId}`, dados);
        Swal.fire({ icon: 'success', title: 'Atualizado!', timer: 2000, showConfirmButton: false });
      } else {
        await api.post('/Pessoas', dados);
        Swal.fire({ icon: 'success', title: 'Salvo!', timer: 2000, showConfirmButton: false });
      }
      limparForm();
      load();
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível processar.', 'error');
    }
  };

  const limparForm = () => {
    setNome(''); setIdade(''); setEditandoId(null);
  };

  const prepararEdicao = (p: Pessoa) => {
    setEditandoId(p.id!);
    setNome(p.nome);
    setIdade(p.idade.toString());
    setIsMinimized(false);
    window.scrollTo(0, 0);
  };

  const handleRemover = async (id: number, nomePessoa: string) => {
    Swal.fire({
      title: 'Remover Membro?',
      text: `Excluir ${nomePessoa}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, remover'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await api.delete(`/Pessoas/${id}`);
        load();
        Swal.fire('Removido!', '', 'success');
      }
    });
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pessoas');

    worksheet.columns = [
      { header: 'NOME', key: 'nome', width: 30 },
      { header: 'IDADE', key: 'idade', width: 10 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    pessoas.forEach(p => worksheet.addRow({ nome: p.nome, idade: p.idade }));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Pessoas_FinanceCore_${new Date().toLocaleDateString('pt-BR')}.xlsx`);
  };

  const paginadas = pessoas.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <div className="animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="skeleton-box w-30" style={{ height: '40px' }}></div>
          <div className="skeleton-box w-15" style={{ height: '30px', borderRadius: '20px' }}></div>
        </div>
        <div className="card-premium-light mb-4">
          <div className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>
          <div className="p-4 row g-3">
            <div className="col-md-7"><div className="skeleton-form-field"></div></div>
            <div className="col-md-3"><div className="skeleton-form-field"></div></div>
            <div className="col-md-2"><div className="skeleton-button w-100"></div></div>
          </div>
        </div>
        <div className="card-premium-light">
          <div className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>
          {[1, 2, 3].map(i => <div key={i} className="skeleton-table-row"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-black text-dark mb-0">GESTÃO DE INTEGRANTES</h2>
        <span className="badge bg-dark px-3 py-2">{pessoas.length} MEMBROS</span>
      </div>

      <div className="card-premium-light">
        <div className="card-title-area bg-bar-gray">
          <div className="d-flex align-items-center">
            <button onClick={() => setIsMinimized(!isMinimized)} className="btn btn-sm p-0 me-2 border-0" aria-label="Minimizar/Expandir">
              <i className={`bi ${isMinimized ? 'bi-chevron-down' : 'bi-chevron-up'} text-dark fw-bold`}></i>
            </button>
            <span className="card-label">{editandoId ? 'Editando Membro' : 'Novo Cadastro'}</span>
          </div>
          <i className={`bi ${editandoId ? 'bi-pencil-square text-warning' : 'bi-person-plus-fill text-primary'} fs-5`} aria-hidden="true"></i>
        </div>
        {!isMinimized && (
          <div className="p-4">
            <form onSubmit={handleSalvar} className="row g-3">
              <div className="col-md-7">
                <label className="small fw-bold text-muted">NOME COMPLETO</label>
                <input className="form-control" placeholder="Ex: Marcos Silva" value={nome} onChange={e => setNome(e.target.value)} required aria-label="Nome completo" />
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted">IDADE</label>
                <input className="form-control" type="number" value={idade} onChange={e => setIdade(e.target.value)} required min="0" max="120" aria-label="Idade" />
              </div>
              <div className="col-md-2 d-flex align-items-end gap-2">
                <button className={`btn ${editandoId ? 'btn-warning' : 'btn-primary'} w-100 fw-bold py-2 shadow-sm`} data-bs-toggle="tooltip" title={editandoId ? 'Atualizar membro' : 'Salvar novo membro'}>
                  {editandoId ? 'ATUALIZAR' : 'SALVAR'}
                </button>
                {editandoId && <button type="button" onClick={limparForm} className="btn btn-light border fw-bold py-2" aria-label="Cancelar edição">X</button>}
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card-premium-light">
        <div className="card-title-area bg-bar-gray d-flex justify-content-between">
          <span className="card-label">Integrantes da Família</span>
          <button className="btn btn-sm btn-outline-dark" onClick={exportarExcel} data-bs-toggle="tooltip" title="Exportar para Excel" aria-label="Exportar lista de pessoas">
            <i className="bi bi-file-earmark-excel"></i>
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small">
                <th className="ps-4">NOME</th>
                <th>IDADE</th>
                <th className="text-end pe-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {paginadas.map(p => (
                <tr key={p.id}>
                  <td className="ps-4 py-3 fw-bold text-dark">{p.nome.toUpperCase()}</td>
                  <td><span className="badge bg-light text-dark border">{p.idade} ANOS</span></td>
                  <td className="text-end pe-4">
                    <button onClick={() => prepararEdicao(p)} className="btn btn-sm btn-outline-primary border-2 fw-bold me-2" data-bs-toggle="tooltip" title="Editar membro" aria-label="Editar">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button onClick={() => handleRemover(p.id!, p.nome)} className="btn btn-sm btn-outline-danger border-2 fw-bold" data-bs-toggle="tooltip" title="Remover membro" aria-label="Remover">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pessoas.length > itemsPerPage && (
          <div className="text-center p-3">
            <button className="btn btn-outline-primary" onClick={() => setPage(p => p + 1)} disabled={page * itemsPerPage >= pessoas.length} aria-label="Carregar mais itens">
              Carregar Mais
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PessoasPage;