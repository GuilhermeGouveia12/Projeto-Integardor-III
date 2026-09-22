import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export function VerificarConta() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ativarConta = async () => {
      try {
        const res = await api.get(`/verificar-conta/${token}`);
        if (res.data.status === 'success') {
          setSuccess(true);
          setMessage(res.data.message || 'Sua conta foi ativada com sucesso!');
        } else {
          setSuccess(false);
          setMessage(res.data.message || 'Não foi possível ativar sua conta.');
        }
      } catch (err: any) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Link de ativação inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      ativarConta();
    } else {
      setLoading(false);
      setMessage('Token de ativação ausente.');
    }
  }, [token]);

  return (
    <div className="flex justify-center items-center py-20 px-4">
      <div className="bg-bg-surface p-10 rounded-2xl shadow-light max-w-md w-full border border-border-color text-center">
        {loading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary mx-auto mb-4"></div>
            <p className="text-text-secondary font-medium">Validando token de ativação...</p>
          </div>
        ) : (
          <div>
            <span className="text-5xl mb-4 block">{success ? '🎉' : '❌'}</span>
            <h2 className="font-title text-2xl font-bold text-text-primary mb-3">
              {success ? 'Conta Ativada!' : 'Falha na Ativação'}
            </h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <Link 
              to="/login"
              className="inline-block bg-purple-primary text-white font-bold px-8 py-3 rounded-xl no-underline hover:bg-purple-hover transition-all shadow-sm"
            >
              Ir para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
