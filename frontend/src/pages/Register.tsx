import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/cadastro', { username, email, password, confirm });
      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data.message || 'Erro ao realizar cadastro.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-6 bg-transparent">
      <div className="w-full max-w-[400px] bg-bg-surface border border-border-color rounded-lg p-10 shadow-light transition-all animate-[fadeInUp_0.4s_ease-out]">
        
        <div className="text-center mb-7">
          <img 
            src="/static/logoCEUB.png?v=2" 
            alt="CEUB Logo" 
            className="h-[42px] w-auto mx-auto mb-4 object-contain"
            onError={(e) => { e.currentTarget.src = 'https://www.uniceub.br/imagens/logoCEUB2021.png'; }}
          />
          <h2 className="font-title text-2xl font-bold text-text-primary m-0 mb-1">Crie sua Conta</h2>
          <p className="text-sm text-text-secondary m-0">Cadastre seu usuário para participar dos projetos</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-md text-sm font-medium text-left">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-2.5 rounded-md text-sm font-medium text-left">
            ✅ {success}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col text-left">
            <label htmlFor="username" className="text-sm font-semibold text-purple-primary mb-1">Usuário</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">👤</span>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-sm bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
                placeholder="Crie seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-sm font-semibold text-purple-primary mb-1">E-mail</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-sm bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-sm font-semibold text-purple-primary mb-1">Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">🔑</span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-sm bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
                placeholder="Digite uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="confirm" className="text-sm font-semibold text-purple-primary mb-1">Confirmar Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">🔄</span>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-sm bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="block w-full p-3 bg-purple-primary text-text-on-purple border-none rounded-md text-sm font-bold cursor-pointer hover:bg-purple-hover active:translate-y-[1px] transition-all disabled:opacity-70 mt-2"
          >
            {loading ? 'Aguarde...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-border-color text-center">
          <p className="text-xs text-text-secondary mb-3">Já possui cadastro no SisCPTI?</p>
          <Link 
            to="/login" 
            className="inline-block px-5 py-2 bg-transparent text-purple-primary border-[1.5px] border-purple-primary rounded-md text-xs font-semibold hover:bg-purple-primary hover:text-white transition-all"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
