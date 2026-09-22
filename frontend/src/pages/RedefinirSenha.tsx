import { useState } from 'react';
import { api } from '../services/api';
import { Link, useParams, useNavigate } from 'react-router-dom';

export function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post(`/redefinir-senha/${token}`, { password, confirm });
      if (res.data.status === 'success') {
        alert("✅ Senha redefinida com sucesso!");
        navigate('/login');
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] p-12 bg-transparent">
      <div className="w-full max-w-[400px] bg-bg-surface border border-border-color rounded-lg p-10 px-8 shadow-light animate-[fadeInUp_0.4s_ease-out] transition-all">
        
        <div className="text-center mb-7">
          <img 
            src="/static/logoCEUB.png" 
            alt="CEUB Logo" 
            className="h-[42px] w-auto mb-4 object-contain transition-all dark:invert dark:brightness-0" 
            onError={(e) => { e.currentTarget.src = '/static/logoCEUB.png'; }}
          />
          <h2 className="font-title text-2xl font-bold text-text-primary m-0 mb-1">Nova Senha</h2>
          <p className="text-[0.85rem] text-text-secondary m-0 leading-snug">Insira sua nova senha abaixo para recuperar o acesso à sua conta.</p>
        </div>

        {error && (
          <div className="mb-4 bg-[rgba(220,53,69,0.08)] border border-[rgba(220,53,69,0.2)] text-[#721c24] p-2.5 rounded-md text-[0.82rem] font-medium text-left">
            ❌ {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-[0.85rem] font-semibold text-purple-primary mb-1">Nova Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">🔑</span>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Mínimo 4 caracteres" 
                required 
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-[0.95rem] bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="confirm" className="text-[0.85rem] font-semibold text-purple-primary mb-1">Confirmar Nova Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">🔒</span>
              <input 
                type="password" 
                id="confirm" 
                name="confirm" 
                placeholder="Repita a nova senha" 
                required 
                minLength={4}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-[0.95rem] bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="block w-full p-3 bg-purple-primary text-text-on-purple border-none rounded-md text-[0.95rem] font-bold cursor-pointer transition-all hover:bg-purple-hover active:translate-y-[1px] disabled:opacity-70"
          >
            {submitting ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-border-color text-center">
          <p className="text-[0.82rem] text-text-secondary m-0 mb-3">Lembrou da senha?</p>
          <Link to="/login" className="inline-block py-2 px-5 bg-transparent text-purple-primary border-[1.5px] border-purple-primary rounded-md text-[0.82rem] font-semibold no-underline transition-all hover:bg-purple-primary hover:text-white">
            Voltar para o Login
          </Link>
        </div>
        
      </div>
    </div>
  );
}
