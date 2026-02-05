import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const CategoriasPage: React.FC = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [final, setFinal] = useState('Ambas');
  const [filtroFinal, setFiltroFinal] = useState('Todas');
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/Categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      Swal.fire('Erro', 'Falha ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Categorias', { descricao: desc, finalidade: final });
      Swal.fire({
        icon: 'success',
        title: 'Categoria Salva!',
        text: `"${desc}" foi adicionada.`,
        timer: 1800,
        showConfirmButton: false
      });
      setDesc('');
      load();
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível salvar.', 'error');
    }
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categorias');

    worksheet.columns = [
      { header: 'DESCRIÇÃO', key: 'desc', width: 30 },
      { header: 'FINALIDADE', key: 'final', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    categorias.forEach(c => worksheet.addRow({ desc: c.descricao, final: c.finalidade }));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Categorias_FinanceCore_${new Date().toLocaleDateString('pt-BR')}.xlsx`);
  };

  const filtradas = categorias.filter(c => filtroFinal === 'Todas' || c.finalidade === filtroFinal);

  if (loading) {
    return (
      <div className="animate__animated animate__fadeIn">
        <div className="skeleton-box w-25 mb-4" style={{ height: '40px' }}></div>
        <div className="card-premium-light mb-4">
          <div className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>
          <div className="p-4 row g-3">
            <div className="col-md-6"><div className="skeleton-form-field"></div></div>
            <div className="col-md-4"><div className="skeleton-form-field"></div></div>
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
      <h2 className="fw-black text-dark mb-4">CLASSIFICAÇÃO FINANCEIRA</h2>

      <div className="card-premium-light">
        <div className="card-title-area bg-bar-gray">
          <div className="d-flex align-items-center">
            <button onClick={() => setIsMinimized(!isMinimized)} className="btn btn-sm p-0 me-2 border-0" aria-label="Minimizar/Expandir">
              <i className={`bi ${isMinimized ? 'bi-chevron-down' : 'bi-chevron-up'} text-dark fw-bold`}></i>
            </button>
            <span className="card-label">Nova Categoria</span>
          </div>
          <i className="bi bi-tag-fill text-primary fs-5" aria-hidden="true"></i>
        </div>
        {!isMinimized && (
          <div className="p-4">
            <p className="text-muted small mb-3 italic">* Organize gastos (Ex: Lazer, Saúde).</p>
            <form onSubmit={handleSalvar} className="row g-3">
              <div className="col-md-6">
                <input className="form-control" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} required aria-label="Descrição da categoria" />
              </div>
              <div className="col-md-4">
                <select className="form-select" value={final} onChange={e => setFinal(e.target.value)} aria-label="Finalidade da categoria">
                  <option value="Despesa">SAÍDA</option>
                  <option value="Receita">ENTRADA</option>
                  <option value="Ambas">AMBAS</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100 fw-bold" data-bs-toggle="tooltip" title="Criar nova categoria">CRIAR</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card-premium-light">
        <div className="card-title-area bg-bar-gray d-flex justify-content-between">
          <span className="card-label">Categorias Ativas</span>
          <div>
            <select className="form-select form-select-sm d-inline-block w-auto me-2" value={filtroFinal} onChange={e => setFiltroFinal(e.target.value)} aria-label="Filtro por finalidade">
              <option value="Todas">Todas</option>
              <option value="Despesa">Saídas</option>
              <option value="Receita">Entradas</option>
              <option value="Ambas">Ambas</option>
            </select>
            <button className="btn btn-sm btn-outline-dark" onClick={exportarExcel} data-bs-toggle="tooltip" title="Exportar para Excel" aria-label="Exportar categorias para Excel">
              <i className="bi bi-file-earmark-excel"></i>
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table mb-0 table-hover">
            <tbody>
              {filtradas.map(c => (
                <tr key={c.id}>
                  <td className="ps-4 py-3 fw-bold">{c.descricao.toUpperCase()}</td>
                  <td className="text-end pe-4">
                    <span className={`badge border ${c.finalidade === 'Despesa' ? 'text-danger border-danger' : 'text-success border-success'}`}>
                      {c.finalidade.toUpperCase()}
                    </span>
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

export default CategoriasPage;