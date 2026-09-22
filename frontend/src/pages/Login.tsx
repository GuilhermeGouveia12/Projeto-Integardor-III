import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { user: username, password });
      if (response.data.status === 'success') {
        login(response.data.user);
        navigate('/');
      } else {
        setError(response.data.message || 'Erro ao realizar login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/static/logoCEUB.png?v=2" 
                 alt="CEUB Logo" 
                 className="auth-logo"
                 onError={(e) => { e.currentTarget.src = 'https://www.uniceub.br/imagens/logoCEUB2021.png'; }} />
            <h2>Acesso ao SisCPTI</h2>
            <p>Insira suas credenciais para entrar na plataforma</p>
          </div>

          {error && (
            <div className="auth-alerts">
              <div className="auth-alert alert-error">
                ❌ {error}
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user">Usuário</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  type="text" 
                  id="user" 
                  name="user" 
                  placeholder="Digite seu usuário (ex: admin)" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Senha</label>
                <Link to="/recuperar-senha" className="forgot-link">Esqueceu a senha?</Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Aguarde...' : 'Entrar na Conta'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Não possui cadastro no SisCPTI?</p>
            <Link to="/cadastro" className="btn-secondary-auth">Criar Nova Conta</Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          padding: 3rem 1.5rem;
          background: transparent;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2.5rem 2rem;
          box-shadow: var(--shadow-light);
          animation: fadeInUp 0.4s ease-out;
          transition: background var(--transition-speed) ease, border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 1.8rem;
        }

        .auth-logo {
          height: 42px;
          width: auto;
          margin-bottom: 1rem;
          object-fit: contain;
          transition: filter var(--transition-speed) ease;
        }
        body.dark-theme .auth-logo {
          filter: brightness(0) invert(1);
        }

        .auth-header h2 {
          font-family: var(--font-title);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.3rem;
        }

        .auth-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-form .form-group {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .auth-form label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--purple-primary);
          margin-bottom: 0.3rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          font-size: 1rem;
          color: var(--text-secondary);
          pointer-events: none;
          user-select: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.65rem 0.65rem 0.65rem 36px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input-wrapper input:focus {
          border-color: var(--purple-primary);
          box-shadow: 0 0 0 2px rgba(122, 27, 181, 0.12);
          outline: none;
        }

        .forgot-link {
          font-size: 0.8rem;
          color: var(--purple-primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .forgot-link:hover {
          color: var(--purple-hover);
        }

        .btn-submit {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background: var(--purple-primary);
          color: var(--text-on-purple);
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
        }

        .btn-submit:hover {
          background: var(--purple-hover);
        }

        .btn-submit:active {
          transform: translateY(1px);
        }

        .auth-footer {
          margin-top: 1.8rem;
          padding-top: 1.2rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .auth-footer p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0 0 0.8rem;
        }

        .btn-secondary-auth {
          display: inline-block;
          padding: 0.5rem 1.2rem;
          background: transparent;
          color: var(--purple-primary);
          border: 1.5px solid var(--purple-primary);
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-secondary-auth:hover {
          background: var(--purple-primary);
          color: #fff;
        }

        .auth-alerts {
          margin-bottom: 1rem;
        }

        .auth-alert {
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 500;
          text-align: left;
          margin-bottom: 0.5rem;
        }
        .auth-alert.alert-error {
          background-color: rgba(220, 53, 69, 0.08);
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #721c24;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 1.8rem 1.2rem;
          }
        }
      `}} />
    </>
  );
}
