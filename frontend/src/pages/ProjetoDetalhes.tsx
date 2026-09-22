import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';

export function ProjetoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [projeto, setProjeto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjeto = async () => {
      try {
        const response = await api.get(`/projeto/${id}`);
        if (response.data.status === 'success') {
          setProjeto(response.data.projeto);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjeto();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  if (!projeto) {
    return <div className="text-center py-20 text-text-secondary">Projeto não encontrado.</div>;
  }

  const imagemUrl = projeto.imagem.startsWith('http') ? projeto.imagem : `/static/img/${projeto.imagem}`;

  let coverGradClass = 'bg-[#1a0a2e]';
  if (projeto.imagem.includes('default_capa_1')) coverGradClass = 'bg-gradient-to-br from-indigo-500/18 to-purple-600/18 bg-bg-surface';
  else if (projeto.imagem.includes('default_capa_2')) coverGradClass = 'bg-gradient-to-br from-teal-500/18 to-blue-600/18 bg-bg-surface';
  else if (projeto.imagem.includes('default_capa_3')) coverGradClass = 'bg-gradient-to-br from-purple-500/18 to-pink-500/18 bg-bg-surface';

  let statusClass = 'text-[#6c757d]';
  if (projeto.status.includes('EXECUTADO')) statusClass = 'text-[#28a745]';
  else if (projeto.status.includes('EXECUÇÃO')) statusClass = 'text-[#ff9800]';
  else if (projeto.status.includes('INDISPONÍVEL')) statusClass = 'text-[#dc3545]';

  return (
    <div>
      {/* HERO */}
      <div className={`relative h-[320px] overflow-hidden ${coverGradClass}`}>
        <img 
          src={imagemUrl} 
          alt={projeto.titulo} 
          className={`w-full h-full object-cover transition-opacity ${projeto.imagem.includes('default_capa') ? 'mix-blend-multiply opacity-100' : 'opacity-45'}`} 
          onError={(e) => { e.currentTarget.src = '/static/default_capa_1.jpg'; }}
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-8 bg-gradient-to-t from-[rgba(10,4,20,0.85)] to-[transparent_60%]">
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <span className={`inline-block px-2 py-1 rounded-full text-[0.85rem] mb-3 font-bold bg-bg-primary uppercase ${statusClass}`}>
              {projeto.status}
            </span>
            <h1 className="font-title text-[clamp(1.4rem,4vw,2.2rem)] font-extrabold text-white m-0 mb-1.5 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              {projeto.titulo}
            </h1>
            <p className="text-[rgba(255,255,255,0.8)] m-0 text-[0.95rem]">
              👨‍🏫 <strong>{projeto.professor || '—'}</strong>
              &nbsp;·&nbsp;
              🗂 {projeto.categoria || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-[90%] max-w-[1200px] mx-auto pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-start">
          
          {/* COLUNA PRINCIPAL */}
          <div>
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              <div className="bg-bg-surface border border-border-color rounded-full px-4 py-1.5 text-[0.85rem] text-text-secondary font-medium">
                📋 <span id="total-avaliacoes">—</span> avaliações
              </div>
              <div className="bg-bg-surface border border-border-color rounded-full px-4 py-1.5 text-[0.85rem] text-text-secondary font-medium">
                ⭐ Média: <span id="media-nota">—</span>
              </div>
              <div className="bg-bg-surface border border-border-color rounded-full px-4 py-1.5 text-[0.85rem] text-text-secondary font-medium">
                👥 {projeto.candidaturas_aprovadas || 0} no time
              </div>
            </div>

            {/* Detalhes do projeto */}
            <div className="bg-bg-surface rounded-2xl p-7 mb-6 shadow-light">
              <h2 className="font-title text-[1.1rem] font-bold text-text-primary m-0 mb-5 pb-2.5 border-b-2 border-border-color">📄 Sobre o Projeto</h2>
              {projeto.detalhes ? (
                projeto.detalhes.map((paragrafo: string, index: number) => (
                  <p key={index} className="leading-[1.8] text-text-primary mb-4">{paragrafo}</p>
                ))
              ) : (
                <p className="text-text-secondary">Informações detalhadas não disponíveis.</p>
              )}
            </div>

            {/* Avaliações (Placeholder idêntico ao HTML) */}
            <div className="bg-bg-surface rounded-2xl p-7 mb-6 shadow-light">
              <h2 className="font-title text-[1.1rem] font-bold text-text-primary m-0 mb-5 pb-2.5 border-b-2 border-border-color">⭐ Avaliações</h2>
              <div className="mb-6">
                <p className="text-text-secondary italic">Carregando avaliações...</p>
              </div>
              {!user && (
                <p className="text-text-secondary italic m-0">
                  <Link to="/login" className="text-purple-primary font-semibold no-underline hover:underline">Faça login</Link> para avaliar este projeto.
                </p>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-4">
            <div className="bg-bg-surface rounded-2xl p-6 shadow-light">
              <h3 className="font-title text-[1rem] font-bold text-text-primary m-0 mb-4 pb-2 border-b-2 border-border-color">Candidatar-se</h3>
              {user ? (
                <Link to={`/projeto/${projeto.id}/candidatar`} className="block w-full text-center py-3 px-4 rounded-full bg-gradient-to-br from-purple-primary to-purple-hover text-white font-bold no-underline text-[0.95rem] shadow-[0_4px_16px_rgba(122,27,181,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,27,181,0.45)] hover:brightness-110 transition-all">
                  🚀 Me Candidatar
                </Link>
              ) : (
                <>
                  <p className="text-text-secondary text-[0.9rem] m-0 mb-3">Faça login para se candidatar.</p>
                  <Link to="/login" className="block w-full text-center py-3 px-4 rounded-full bg-gradient-to-br from-purple-primary to-purple-hover text-white font-bold no-underline text-[0.95rem] shadow-[0_4px_16px_rgba(122,27,181,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,27,181,0.45)] hover:brightness-110 transition-all">
                    🔑 Fazer Login
                  </Link>
                </>
              )}
            </div>

            <div className="bg-bg-surface rounded-2xl p-6 shadow-light">
              <h3 className="font-title text-[1rem] font-bold text-text-primary m-0 mb-4 pb-2 border-b-2 border-border-color">Informações</h3>
              <div className="flex justify-between items-start gap-2 py-2 border-b border-border-color text-[0.88rem] flex-wrap">
                <span className="text-text-secondary">📌 Status</span>
                <strong>{projeto.status || '—'}</strong>
              </div>
              <div className="flex justify-between items-start gap-2 py-2 border-b border-border-color text-[0.88rem] flex-wrap">
                <span className="text-text-secondary">🗂 Categoria</span>
                <strong>{projeto.categoria || '—'}</strong>
              </div>
              <div className="flex justify-between items-start gap-2 py-2 text-[0.88rem] flex-wrap">
                <span className="text-text-secondary">👨‍🏫 Professor</span>
                <strong>{projeto.professor || '—'}</strong>
              </div>
            </div>

            <Link to="/projetos" className="block text-center mt-2 text-purple-primary font-semibold text-[0.9rem] no-underline hover:underline">
              ← Voltar aos Projetos
            </Link>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
