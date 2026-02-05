import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { Pessoa, Categoria, Transacao } from '../types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const TransacoesPage: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Estados do formulário de lançamento
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'Despesa' | 'Receita'>('Despesa');
  const [pessoaId, setPessoaId] = useState('');
  const [catId, setCatId] = useState('');
  const [dataVenc, setDataVenc] = useState(new Date().toISOString().split('T')[0]);
  const [pago, setPago] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, p, c] = await Promise.all([
        api.get('/Transacoes'),
        api.get('/Pessoas'),
        api.get('/Categorias')
      ]);
      setTransacoes(t.data);
      setPessoas(p.data);
      setCategorias(c.data);
    } catch (error) {
      console.error("Erro FinanceCore:", error);
      Swal.fire('Erro', 'Falha ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtro combinado: busca textual + período de datas
  const filtradas = transacoes.filter(t => {
    const termo = busca.toLowerCase();
    const nomeP = pessoas.find(p => p.id === t.pessoaId)?.nome.toLowerCase() || '';
    const nomeC = categorias.find(c => c.id === t.categoriaId)?.descricao.toLowerCase() || '';
    const dataTrans = new Date(t.dataVencimento);
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;

    return (
      (t.descricao.toLowerCase().includes(termo) ||
       nomeP.includes(termo) ||
       nomeC.includes(termo)) &&
      (!inicio || dataTrans >= inicio) &&
      (!fim || dataTrans <= fim)
    );
  });

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório de Caixa');

    worksheet.columns = [
      { header: 'DATA', key: 'data', width: 15 },
      { header: 'HISTÓRICO', key: 'desc', width: 40 },
      { header: 'CATEGORIA', key: 'cat', width: 20 },
      { header: 'RESPONSÁVEL', key: 'pess', width: 20 },
      { header: 'VALOR (R$)', key: 'val', width: 15 },
      { header: 'STATUS', key: 'status', width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    filtradas.forEach(t => {
      const row = worksheet.addRow({
        data: new Date(t.dataVencimento).toLocaleDateString('pt-BR'),
        desc: t.descricao.toUpperCase(),
        cat: categorias.find(c => c.id === t.categoriaId)?.descricao || 'N/A',
        pess: pessoas.find(p => p.id === t.pessoaId)?.nome || 'N/A',
        val: t.valor,
        status: t.pago ? 'PAGO' : 'PENDENTE'
      });

      const color = t.tipo === 'Receita' ? '008000' : 'FF0000';
      row.getCell('val').font = { color: { argb: color }, bold: true };
      row.getCell('val').numFmt = '"R$ "#,##0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FinanceCore_Relatorio_${new Date().getTime()}.xlsx`);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const novaTransacao = {
      descricao: desc,
      valor: Number(valor),
      tipo,
      pessoaId: Number(pessoaId),
      categoriaId: Number(catId),
      dataVencimento: dataVenc,
      pago
    };

    try {
      await api.post('/Transacoes', novaTransacao);
      Swal.fire({ icon: 'success', title: 'LANÇAMENTO REALIZADO', timer: 1500, showConfirmButton: false });
      setDesc(''); setValor(''); setPago(false);
      loadData();
    } catch (err) {
      Swal.fire('Erro', 'Não foi possível salvar o lançamento.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate__animated animate__fadeIn">
        <div className="skeleton-box w-50 mb-4" style={{ height: '40px' }}></div>

        <div className="card-premium-light mb-4">
          <div className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>
          <div className="p-4 row g-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="col-md-3">
                <div className="skeleton-box w-100" style={{ height: '38px' }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium-light">
          <div className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton-box w-100 mb-2" style={{ height: '52px', margin: '0 16px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="fw-black text-dark mb-4">LANÇAMENTOS FINANCEIROS</h2>

      {/* CARD DE NOVO LANÇAMENTO */}
      <div className="card-premium-light mb-4">
        <div className="card-title-area bg-bar-gray">
          <span className="card-label">Novo Lançamento</span>
          <i className="bi bi-arrow-up-right-square text-primary fs-5"></i>
        </div>
        <div className="p-4">
          <form onSubmit={handleSalvar} className="row g-3">
            <div className="col-md-4">
              <label className="small fw-bold text-muted">HISTÓRICO</label>
              <input 
                className="form-control" 
                placeholder="Descrição do lançamento" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">VALOR R$</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                placeholder="0.00" 
                value={valor} 
                onChange={e => setValor(e.target.value)} 
                required 
                min="0.01"
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">RESPONSÁVEL</label>
              <select 
                className="form-select" 
                value={pessoaId} 
                onChange={e => setPessoaId(e.target.value)} 
                required
              >
                <option value="">Selecione...</option>
                {pessoas.map(p => (
                  <option key={p.id} value={p.id}>{p.nome.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">CATEGORIA</label>
              <select 
                className="form-select" 
                value={catId} 
                onChange={e => setCatId(e.target.value)} 
                required
              >
                <option value="">Selecione...</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.descricao.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">VENCIMENTO</label>
              <input 
                type="date" 
                className="form-control" 
                value={dataVenc} 
                onChange={e => setDataVenc(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">TIPO</label>
              <select 
                className="form-select" 
                value={tipo} 
                onChange={e => setTipo(e.target.value as 'Despesa' | 'Receita')}
              >
                <option value="Despesa">SAÍDA / DESPESA</option>
                <option value="Receita">ENTRADA / RECEITA</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-center mt-4">
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  checked={pago} 
                  onChange={e => setPago(e.target.checked)} 
                  id="pagoSwitch" 
                />
                <label className="form-check-label fw-bold small text-uppercase ms-2" htmlFor="pagoSwitch">
                  Já Pago?
                </label>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary-premium w-100 fw-black text-uppercase shadow">
                Efetuar Lançamento
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CARD DE BUSCA E FILTROS – agora 100% alinhado */}
<div className="card-premium-light mb-4">
  <div className="card-title-area bg-bar-gray">
    <span className="card-label">Busca e Filtros</span>
    <i className="bi bi-search text-primary"></i>
  </div>
  <div className="p-4 row g-3 align-items-end">  {/* ← align-items-end faz todos os campos ficarem alinhados pela base */}
    <div className="col-md-6">
      <input 
        className="form-control" 
        placeholder="Filtrar por nome, categoria ou descrição..." 
        value={busca} 
        onChange={e => setBusca(e.target.value)} 
      />
    </div>
    <div className="col-md-3">
      <label className="small fw-bold text-muted d-block mb-1">Data Início</label>  {/* label com mb-1 para espaçamento consistente */}
      <input 
        type="date" 
        className="form-control" 
        value={dataInicio} 
        onChange={e => setDataInicio(e.target.value)} 
      />
    </div>
    <div className="col-md-3">
      <label className="small fw-bold text-muted d-block mb-1">Data Fim</label>
      <input 
        type="date" 
        className="form-control" 
        value={dataFim} 
        onChange={e => setDataFim(e.target.value)} 
      />
    </div>
  </div>
</div>

      {/* TABELA DE REGISTROS */}
      <div className="card-premium-light">
        <div className="card-title-area bg-bar-gray d-flex justify-content-between align-items-center">
          <span className="card-label">
            Registros de Caixa ({filtradas.length} itens)
          </span>
          <button 
            className="btn btn-sm btn-outline-success"
            onClick={exportarExcel}
            title="Exportar relatório completo para Excel"
          >
            <i className="bi bi-file-earmark-spreadsheet me-1"></i>
            Exportar Excel
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted text-uppercase">
                <th className="ps-4">Status</th>
                <th>Histórico / Responsável</th>
                <th>Categoria</th>
                <th className="text-end pe-4">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.slice().reverse().map(t => (
                <tr key={t.id}>
                  <td className="ps-4">
                    <span className={`badge border ${t.pago ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                      {t.pago ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{t.descricao.toUpperCase()}</div>
                    <div className="small text-muted fw-bold">
                      <i className="bi bi-person me-1"></i>
                      {pessoas.find(p => p.id === t.pessoaId)?.nome || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border px-3">
                      {categorias.find(c => c.id === t.categoriaId)?.descricao || 'N/A'}
                    </span>
                  </td>
                  <td className={`text-end pe-4 fw-black fs-5 ${t.tipo === 'Receita' ? 'text-success' : 'text-danger'}`}>
                    {t.tipo === 'Receita' ? '+ ' : '- '} 
                    R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

export default TransacoesPage;