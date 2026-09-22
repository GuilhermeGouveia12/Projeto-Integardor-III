import { useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/recuperar-senha', { email });
      if (res.data.status === 'success') {
        setMessage(res.data.message);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao tentar recuperar a senha.');
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
          <h2 className="font-title text-2xl font-bold text-text-primary m-0 mb-1">Recuperar Senha</h2>
          <p className="text-[0.85rem] text-text-secondary m-0 leading-snug">Digite seu e-mail cadastrado abaixo para enviarmos as instruções de redefinição.</p>
        </div>

        {error && (
          <div className="mb-4 bg-[rgba(220,53,69,0.08)] border border-[rgba(220,53,69,0.2)] text-[#721c24] p-2.5 rounded-md text-[0.82rem] font-medium text-left">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-[rgba(40,167,69,0.08)] border border-[rgba(40,167,69,0.2)] text-[#155724] p-2.5 rounded-md text-[0.82rem] font-medium text-left">
            ✅ {message}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-[0.85rem] font-semibold text-purple-primary mb-1">E-mail Cadastrado</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base text-text-secondary pointer-events-none select-none">📧</span>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="exemplo@ceub.edu.br" 
                required 
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pr-2.5 pl-9 border border-border-color rounded-md text-[0.95rem] bg-bg-primary text-text-primary transition-all focus:border-purple-primary focus:shadow-[0_0_0_2px_rgba(122,27,181,0.12)] focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="block w-full p-3 bg-purple-primary text-text-on-purple border-none rounded-md text-[0.95rem] font-bold cursor-pointer transition-all hover:bg-purple-hover active:translate-y-[1px] disabled:opacity-70"
          >
            {submitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
