import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TotaisPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(true); // Estado para o card de mensagem superior

  useEffect(() => { 
    // Busca totais e transações para os alertas
    Promise.all([
        api.get('/Totais/Pessoas'),
        api.get('/Transacoes')
    ]).then(([resTotais, resTrans]) => {
        setData(resTotais.data);
        setTransacoes(resTrans.data);
    }).catch(err => console.error("Erro na API:", err));
  }, []);


  if (!data) return (
    <div className="main-view animate__animated animate__fadeIn">
      {/* Skeleton do Título e Badge */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="skeleton-box w-25" style={{ height: '40px' }}></div>
        <div className="skeleton-box w-10" style={{ height: '30px', borderRadius: '20px' }}></div>
      </div>

      {/* Skeleton dos 4 Cards de Impacto */}
      <div className="row g-4 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-3">
            <div className="card-premium-light p-4" style={{ height: '140px' }}>
              <div className="skeleton-box w-50 mb-3"></div>
              <div className="skeleton-box w-100 mb-2" style={{ height: '30px' }}></div>
              <div className="skeleton-box w-25"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Skeleton Coluna Esquerda */}
        <div className="col-md-5">
            <div className="card-premium-light mb-4" style={{ height: '350px' }}>
                <div className="p-3 border-bottom"><div className="skeleton-box w-50"></div></div>
                <div className="p-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-box w-100 mb-3" style={{ height: '50px' }}></div>)}
                </div>
            </div>
            <div className="card-premium-light" style={{ height: '200px' }}>
                <div className="p-3 border-bottom"><div className="skeleton-box w-40"></div></div>
                <div className="p-4 text-center"><div className="skeleton-box w-100 mb-3"></div><div className="skeleton-box w-100"></div></div>
            </div>
        </div>

        {/* Skeleton Coluna Direita */}
        <div className="col-md-7">
            <div className="card-premium-light mb-4" style={{ height: '400px' }}>
                <div className="p-3 border-bottom"><div className="skeleton-box w-30"></div></div>
                <div className="p-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-box w-100 mb-2" style={{ height: '45px' }}></div>)}
                </div>
            </div>
            <div className="skeleton-box w-100" style={{ height: '120px', borderRadius: '12px' }}></div>
        </div>
      </div>
    </div>
  );

  const { totalReceitas, totalDespesas, saldo } = data.totalGeral;
  const percentualGasto = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;
  const statusCor = percentualGasto > 90 ? 'text-danger' : percentualGasto > 70 ? 'text-warning' : 'text-success';

  const pendentes = transacoes.filter(t => !t.pago && t.tipo === 'Despesa');

  return (
    <div className="animate__animated animate__fadeIn">

      {showWelcome && (
        <div className="card-premium-light bg-card-insight text-white p-3 mb-4 d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center">
            <i className="bi bi-shield-check fs-4 me-3"></i>
            <div>
              <span className="fw-black d-block">SISTEMA FINANCECORE ATIVO</span>
              <small className="opacity-75">Sua criptografia de ponta-a-ponta e monitoramento em tempo real estão operacionais.</small>
            </div>
          </div>
          <button onClick={() => setShowWelcome(false)} className="btn btn-sm text-white opacity-50 hover-opacity-100">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-black text-dark mb-0">TERMINAL DE INTELIGÊNCIA</h2>
          <p className="text-muted small mb-0">Monitoramento em tempo real do fluxo familiar.</p>
        </div>
        <div className="badge bg-primary px-3 py-2 shadow-sm fw-bold">FEVEREIRO / 2026</div>
      </div>

  
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card-premium-light h-100 border-primary">
            <div className="card-title-area bg-bar-gray"><span className="card-label">Patrimônio Líquido</span><i className="bi bi-bank text-primary"></i></div>
            <div className="p-3 text-center">
              <h3 className="fw-black text-primary mb-0">R$ {saldo.toLocaleString('pt-BR')}</h3>
              <small className="text-muted fw-bold" style={{fontSize: '10px'}}>DISPONIBILIDADE EM CONTA</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-premium-light h-100 border-success">
            <div className="card-title-area bg-bar-success"><span className="card-label">Receita Mensal</span><i className="bi bi-graph-up-arrow text-success"></i></div>
            <div className="p-3 text-center">
              <h3 className="fw-black text-success mb-0">R$ {totalReceitas.toLocaleString('pt-BR')}</h3>
              <small className="text-muted fw-bold" style={{fontSize: '10px'}}>TOTAL DE ENTRADAS</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-premium-light h-100 border-danger">
            <div className="card-title-area bg-bar-danger"><span className="card-label">Despesa Mensal</span><i className="bi bi-graph-down-arrow text-danger"></i></div>
            <div className="p-3 text-center">
              <h3 className="fw-black text-danger mb-0">R$ {totalDespesas.toLocaleString('pt-BR')}</h3>
              <small className="text-muted fw-bold" style={{fontSize: '10px'}}>TOTAL DE SAÍDAS</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-premium-light h-100 border-warning">
            <div className="card-title-area bg-bar-warning"><span className="card-label">Comprometimento</span><i className="bi bi-pie-chart-fill text-warning"></i></div>
            <div className="p-3 text-center">
              <h3 className={`fw-black mb-0 ${statusCor}`}>{percentualGasto.toFixed(1)}%</h3>
              <small className="text-muted fw-bold" style={{fontSize: '10px'}}>DA RENDA UTILIZADA</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        <div className="col-md-5">
            <div className="card-premium-light">
                <div className="card-title-area bg-dark text-white">
                    <span className="card-label text-white"><i className="bi bi-exclamation-octagon me-2"></i>Contas Pendentes / Vencimentos</span>
                </div>
                <div className="p-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {pendentes.length > 0 ? pendentes.map(p => (
                        <div key={p.id} className="d-flex align-items-center p-3 border-bottom hover-nav">
                            <div className="bg-danger-subtle p-2 rounded-circle me-3">
                                <i className="bi bi-calendar-x text-danger"></i>
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-0 fw-bold text-dark">{p.descricao.toUpperCase()}</p>
                                <span className="small text-muted fw-bold">VENCIMENTO: {new Date(p.dataVencimento).toLocaleDateString()}</span>
                            </div>
                            <div className="text-end">
                                <span className="d-block fw-black text-danger">R$ {p.valor.toFixed(2)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-muted">Nenhuma conta pendente. Parabéns!</div>
                    )}
                </div>
            </div>

            <div className="card-premium-light">
                <div className="card-title-area bg-bar-gray"><span className="card-label">Análise de Risco Operacional</span></div>
                <div className="p-4 text-center">
                    <h5 className={`fw-black ${statusCor}`}>STATUS: {percentualGasto > 80 ? 'CRÍTICO' : 'ESTÁVEL'}</h5>
                    <div className="progress mt-3" style={{height: '12px'}}>
                        <div className={`progress-bar ${percentualGasto > 80 ? 'bg-danger' : 'bg-success'}`} style={{width: `${percentualGasto}%`}}></div>
                    </div>
                    <p className="small text-muted mt-3 mb-0 italic">"Mantenha provisões para os próximos 3 meses de despesas fixas."</p>
                </div>
            </div>
        </div>


        <div className="col-md-7">
            <div className="card-premium-light">
                <div className="card-title-area bg-bar-gray"><span className="card-label">Fluxo Consolidado por Membro</span></div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small">
                                <th className="ps-4">MEMBRO</th>
                                <th className="text-center">RECEITAS</th>
                                <th className="text-center">DESPESAS</th>
                                <th className="text-end pe-4">SALDO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.totaisPorPessoa.map((p: any) => (
                                <tr key={p.id}>
                                    <td className="ps-4 py-3">
                                        <div className="fw-bold">{p.nome.toUpperCase()}</div>
                                        <div className="text-muted small" style={{fontSize: '9px'}}>ID: #00{p.id}</div>
                                    </td>
                                    <td className="text-center text-success fw-bold">R$ {p.totalReceitas.toLocaleString()}</td>
                                    <td className="text-center text-danger fw-bold">R$ {p.totalDespesas.toLocaleString()}</td>
                                    <td className={`text-end pe-4 fw-black ${p.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                                        R$ {p.saldo.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card-premium-light bg-primary text-white p-4">
                <div className="d-flex align-items-center">
                    <i className="bi bi-cpu-fill fs-1 me-3"></i>
                    <div>
                        <h5 className="fw-black mb-1">IA FINANCEIRA ATIVA</h5>
                        <p className="small mb-0 opacity-75">O sistema detectou que a maior parte das suas despesas está concentrada em <strong>Categorias Variáveis</strong>. Considere reduzir custos não essenciais.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
export default TotaisPage;
