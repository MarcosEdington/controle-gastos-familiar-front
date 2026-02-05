import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const MINIMUM_LOADING_TIME = 4500; // 4.5s mínimo para Render acordar

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const startTime = Date.now();

        try {
            await delay(MINIMUM_LOADING_TIME);
            const res = await api.get('/Usuarios');
            const usuarios = res.data;

            const usuarioValido = usuarios.find(
                (u: any) => u.email === email && u.senha === senha
            );

            if (usuarioValido) {
                localStorage.setItem('user_name', usuarioValido.nome);
                localStorage.setItem('auth', 'true');
                navigate('/totais');
            } else {
                throw new Error('Credenciais incorretas');
            }
        } catch (error) {
            const elapsed = Date.now() - startTime;
            const remaining = MINIMUM_LOADING_TIME - elapsed;

            if (remaining > 0) {
                await delay(remaining);
            }

            Swal.fire({
                icon: 'error',
                title: 'Falha na Autenticação',
                text: 'Credenciais incorretas ou servidor indisponível.',
                confirmButtonColor: '#3b82f6',
                target: 'body'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card-glass animate__animated animate__zoomIn">
                <div className="text-center mb-4">
                    <div
                        className="icon-box-premium mx-auto mb-3"
                        style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                            borderRadius: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className="bi bi-graph-up-arrow text-white fs-3" aria-hidden="true"></i>
                    </div>
                    <h3 className="fw-black text-white mb-1">
                        FINANCE<span className="text-primary">CORE</span>
                    </h3>
                    <p className="text-white-50 small fw-bold">SISTEMA DE GESTÃO PATRIMONIAL</p>
                </div>

                {loading ? (
                    <div className="skeleton-container animate__animated animate__fadeIn">
                        <div className="text-center mb-4">
                            <div className="skeleton-icon mx-auto mb-3"></div>
                            <div className="skeleton-title mb-1"></div>
                            <div className="skeleton-subtitle"></div>
                        </div>

                        <div className="mb-3">
                            <div className="skeleton-label small mb-1"></div>
                            <div className="input-group">
                                <div className="skeleton-input-icon"></div>
                                <div className="skeleton-input"></div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="skeleton-label small mb-1"></div>
                            <div className="input-group">
                                <div className="skeleton-input-icon"></div>
                                <div className="skeleton-input"></div>
                            </div>
                        </div>

                        <div className="skeleton-button w-100 mb-3 py-3 d-flex align-items-center justify-content-center">
                            <div className="skeleton-spinner me-2"></div>
                            VALIDANDO COM SERVIDOR...
                        </div>

                        <div className="text-center">
                            <span className="skeleton-small-text me-1"></span>
                            <div className="skeleton-link-text d-inline-block"></div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="text-white-50 small fw-bold mb-1" htmlFor="emailInput">USUÁRIO / E-MAIL</label>
                            <div className="input-group">
                                <span className="input-group-text bg-dark border-0 text-white-50">
                                    <i className="bi bi-person-fill" aria-hidden="true"></i>
                                </span>
                                <input
                                    id="emailInput"
                                    type="email"
                                    className="form-control bg-dark border-0 text-white"
                                    placeholder="admin@financeiro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    aria-label="E-mail de login"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-white-50 small fw-bold mb-1" htmlFor="senhaInput">SENHA MESTRA</label>
                            <div className="input-group">
                                <span className="input-group-text bg-dark border-0 text-white-50">
                                    <i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
                                </span>
                                <input
                                    id="senhaInput"
                                    type="password"
                                    className="form-control bg-dark border-0 text-white"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    disabled={loading}
                                    required
                                    aria-label="Senha de login"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary-premium w-100 mb-3 py-3"
                            aria-label="Entrar no sistema"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    VALIDANDO COM SERVIDOR...
                                </>
                            ) : (
                                'ENTRAR NO SISTEMA'
                            )}
                        </button>

                        <div className="text-center">
                            <span className="text-white-50 small">Problemas no acesso? </span>
                            <button
                                type="button"
                                className="btn btn-link p-0 text-primary small fw-bold text-decoration-none border-0 bg-transparent"
                                onClick={() => Swal.fire('Suporte TI', 'Contate o administrador em: suporte@financeiro.com', 'info')}
                                aria-label="Contato de suporte TI"
                            >
                                Suporte TI
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;