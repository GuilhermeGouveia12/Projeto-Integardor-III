import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-bg-surface pt-3 pb-1 relative z-50 transition-colors">
      <div className="w-[90%] max-w-[1200px] mx-auto flex items-center justify-between">
        
        <Link to="/">
          <img 
            src="/static/logoCEUB.png?v=2" 
            alt="Logo CEUB" 
            className="w-[170px] h-auto"
            onError={(e) => { e.currentTarget.src = 'https://www.uniceub.br/imagens/logoCEUB2021.png'; }}
          />
        </Link>

        <nav className="flex-1 flex items-center justify-between ml-10">
          <ul className="flex items-center gap-6 m-0 p-0 list-none">
            <li><Link to="/" className="text-purple-primary font-semibold hover:text-purple-hover transition-colors">Início</Link></li>
            <li><Link to="/projetos" className="text-purple-primary font-semibold hover:text-purple-hover transition-colors">Projetos</Link></li>
            <li><Link to="/sobre" className="text-purple-primary font-semibold hover:text-purple-hover transition-colors">Sobre</Link></li>
          </ul>

          <ul className="flex items-center gap-6 m-0 p-0 list-none">
            {user ? (
              <>
                <li className="relative">
                  <button className="text-purple-primary text-xl p-1.5 rounded-full hover:bg-purple-primary/10 transition-all flex items-center justify-center">
                    🔔
                  </button>
                </li>
                <li>
                  <button className="text-purple-primary text-xl p-1.5 rounded-full hover:bg-purple-primary/10 transition-all flex items-center justify-center">
                    🌓
                  </button>
                </li>
                <li className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1 text-purple-primary font-semibold hover:text-purple-hover bg-transparent border-none cursor-pointer text-base"
                  >
                    <span>👤 {user.username}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-surface rounded-lg shadow-hover py-2 z-50 border border-border-color">
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-purple-primary hover:bg-purple-primary/5 hover:text-purple-hover font-medium">
                          ⚙️ Painel Admin
                        </Link>
                      )}
                      <Link to="/perfil" className="block px-4 py-2 text-purple-primary hover:bg-purple-primary/5 hover:text-purple-hover font-medium">
                        👤 Meu Perfil
                      </Link>
                      <Link to="/submissao" className="block px-4 py-2 text-purple-primary hover:bg-purple-primary/5 hover:text-purple-hover font-medium">
                        📤 Submissão
                      </Link>
                      <div className="h-px bg-border-color my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium cursor-pointer border-none bg-transparent"
                      >
                        🚪 Sair
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="text-purple-primary font-semibold hover:text-purple-hover transition-colors">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="h-1 bg-purple-primary w-full relative top-[6px] shadow-sm transition-colors"></div>
    </header>
  );
}
