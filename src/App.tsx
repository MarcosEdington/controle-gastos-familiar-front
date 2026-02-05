import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import PessoasPage from './pages/PessoasPage';
import CategoriasPage from './pages/CategoriasPage';
import TransacoesPage from './pages/TransacoesPage';
import TotaisPage from './pages/TotaisPage';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage'; // Vamos criar esta em seguida

const Sidebar = () => {
  const loc = useLocation();

  // Se estiver na tela de login, não renderiza a Sidebar
  if (loc.pathname === '/') return null;

  const menu = [
    { path: '/totais', label: 'Painel Geral', icon: 'bi-grid-fill' },
    { path: '/pessoas', label: 'Membros', icon: 'bi-people-fill' },
    { path: '/categorias', label: 'Categorias', icon: 'bi-tags-fill' },
    { path: '/transacoes', label: 'Lançamentos', icon: 'bi-cash-stack' },
    { path: '/usuarios', label: 'Acessos/Login', icon: 'bi-shield-lock-fill' },
  ];

  return (
    <div className="sidebar-premium animate__animated animate__fadeInLeft">
      <div className="mb-5 d-flex align-items-center">
        <div className="bg-primary p-2 rounded-3 me-3">
          <i className="bi bi-stack text-white fs-4"></i>
        </div>
        <h5 className="mb-0 fw-bold text-white">FINANCE<span className="text-primary">CORE</span></h5>
      </div>

      <nav className="nav flex-column gap-2 flex-grow-1">
        {menu.map(i => (
          <Link key={i.path} to={i.path} 
            className={`nav-link-custom ${loc.pathname === i.path ? 'active-menu' : ''}`}>
            <i className={`bi ${i.icon} me-3`}></i>
            {i.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-top border-secondary pt-3">
        <Link to="/" className="text-danger text-decoration-none fw-bold small d-flex align-items-center p-2 hover-nav">
          <i className="bi bi-box-arrow-left me-2"></i> SAIR DO SISTEMA
        </Link>
      </div>
    </div>
  );
};

// Componente para organizar o Layout
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const isLogin = loc.pathname === '/';

  return (
    <div className="d-flex">
      <Sidebar />
      {/* Se for login, removemos a classe 'main-view' que tem o margin-left de 280px */}
      <main className={isLogin ? "w-100" : "main-view w-100"}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Rota Inicial: TELA DE LOGIN PREMIUM */}
          <Route path="/" element={<LoginPage />} />

          {/* Rotas Internas */}
          <Route path="/totais" element={<TotaisPage />} />
          <Route path="/pessoas" element={<PessoasPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/transacoes" element={<TransacoesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />

          {/* Redirecionamento de segurança */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;