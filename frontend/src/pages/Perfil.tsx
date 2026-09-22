import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Perfil() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inscricoes' | 'propostas' | 'meusprojetos' | 'recomendacoes'>('inscricoes');
  
  const [minhasCandidaturas, setMinhasCandidaturas] = useState<any[]>([]);
  const [minhasSubmissoes, setMinhasSubmissoes] = useState<any[]>([]);
  const [meusProjetos, setMeusProjetos] = useState<any[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros locais para a lista de candidaturas
  const [searchCand, setSearchCand] = useState('');
  const [statusFilterCand, setStatusFilterCand] = useState('TODOS');

  // Filtros locais para propostas
  const [searchSubm, setSearchSubm] = useState('');

  const fetchPerfil = async () => {
    try {
      const response = await api.get('/perfil');
      if (response.data.status === 'success') {
        setMinhasCandidaturas(response.data.data.minhas_candidaturas || []);
        setMinhasSubmissoes(response.data.data.minhas_submissoes || []);
        setMeusProjetos(response.data.data.meus_projetos || []);
        setRecomendacoes(response.data.data.recomendacoes || []);
      }
    } catch (error) {
      console.error("Erro ao carregar o perfil", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleCancelarCandidatura = async (candId: number) => {
    if (!window.confirm('Tem certeza de que deseja cancelar esta candidatura acadêmica?')) return;
    try {
      const res = await api.post(`/perfil/candidatura/${candId}/cancelar`);
      if (res.data.status === 'success' || res.status === 200) {
        setMinhasCandidaturas(prev => prev.filter(c => c.id !== candId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar candidatura.');
    }
  };

  const handleExcluirSubmissao = async (subId: number) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta proposta de projeto?')) return;
    try {
      const res = await api.post(`/submissao/${subId}/excluir`);
      if (res.data.status === 'success' || res.status === 200) {
        setMinhasSubmissoes(prev => prev.filter(s => s.id !== subId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir proposta.');
    }
  };

  const handleAcaoCandidato = async (candId: number, acao: 'aprovar' | 'rejeitar' | 'reavaliar', projId: number) => {
    try {
      const res = await api.post(`/perfil/candidatura/${candId}/${acao}`);
      if (res.data.status === 'success' && res.data.new_status) {
        setMeusProjetos(prev => prev.map(p => {
          if (p.id !== projId) return p;
          const newCands = (p.candidaturas || []).map((c: any) => c.id === candId ? { ...c, status: res.data.new_status } : c);
          return { ...p, candidaturas: newCands };
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Erro ao ${acao} candidatura.`);
    }
  };

  // Projetos ativos em que o aluno foi aprovado (com acesso direto a Workspace)
  const projetosAtivosAluno = useMemo(() => {
    return minhasCandidaturas.filter(c => c.status === 'APROVADA');
  }, [minhasCandidaturas]);

  // Candidaturas filtradas por busca e status
  const candidaturasFiltradas = useMemo(() => {
    return minhasCandidaturas.filter(cand => {
      const matchBusca = (cand.projeto || '').toLowerCase().includes(searchCand.toLowerCase()) ||
                         (cand.motivo || '').toLowerCase().includes(searchCand.toLowerCase());
      const matchStatus = statusFilterCand === 'TODOS' || cand.status === statusFilterCand;
      return matchBusca && matchStatus;
    });
  }, [minhasCandidaturas, searchCand, statusFilterCand]);

  // Submissões filtradas por busca
  const submissoesFiltradas = useMemo(() => {
    return minhasSubmissoes.filter(subm => {
      return (subm.nome_projeto || '').toLowerCase().includes(searchSubm.toLowerCase()) ||
             (subm.categoria || '').toLowerCase().includes(searchSubm.toLowerCase());
    });
  }, [minhasSubmissoes, searchSubm]);

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    admin: 'Administrador do Sistema',
    coordenador: 'Coordenador Acadêmico',
    professor: 'Professor Orientador',
    user: 'Discente / Membro Acadêmico',
    aluno: 'Discente / Membro Acadêmico',
    lider: 'Líder de Equipe de Projeto',
    empresa: 'Representante de Empresa Parceira',
    cliente: 'Cliente / Proponente Externo'
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col justify-center items-center py-24 text-text-primary">
        <svg className="animate-spin w-10 h-10 text-purple-primary mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary m-0">
          Carregando dados acadêmicos...
        </p>
      </div>
    );
  }

  return (
    <div className="w-[92%] max-w-[1240px] mx-auto my-8 space-y-6">
      
      {/* 1. CABEÇALHO INSTITUCIONAL DO ALUNO */}
      <div className="bg-bg-surface border border-border-color rounded-md p-6 sm:p-7 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-md bg-purple-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 border border-purple-hover/20">
              {user.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary m-0 tracking-tight">
                  {user.username}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                  {roleLabels[user.role] || 'Discente / Membro Acadêmico'}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-text-secondary m-0">
                {user.email || 'E-mail institucional não cadastrado'}
              </p>

              {user.bio && (
                <p className="text-xs text-text-secondary/80 m-0 max-w-2xl line-clamp-2 pt-0.5">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <Link 
              to="/perfil/editar" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary hover:bg-bg-surface border border-border-color hover:border-purple-primary text-text-primary hover:text-purple-primary rounded-md text-xs sm:text-sm font-semibold transition-colors no-underline shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Editar Perfil</span>
            </Link>

            <Link 
              to="/submissao" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-primary hover:bg-purple-hover text-white rounded-md text-xs sm:text-sm font-semibold transition-colors no-underline shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Proposta</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. CARDS DE INDICADORES (KPIS EXECUTIVOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Projetos Ativos */}
        <div className="bg-bg-surface border border-border-color rounded-md p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
              Projetos em Andamento
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-purple-primary tracking-tight">
                {projetosAtivosAluno.length + meusProjetos.length}
              </span>
              <span className="text-xs text-text-secondary">
                com acesso a Workspaces
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-md bg-purple-primary/10 text-purple-primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Candidaturas */}
        <div className="bg-bg-surface border border-border-color rounded-md p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
              Minhas Candidaturas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                {minhasCandidaturas.length}
              </span>
              <span className="text-xs text-text-secondary">
                ({minhasCandidaturas.filter(c => c.status === 'APROVADA').length} aprovadas · {minhasCandidaturas.filter(c => c.status === 'PENDENTE' || c.status === 'EM ANÁLISE').length} em análise)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Propostas Submetidas */}
        <div className="bg-bg-surface border border-border-color rounded-md p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
              Propostas de Projeto
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                {minhasSubmissoes.length}
              </span>
              <span className="text-xs text-text-secondary">
                ({minhasSubmissoes.filter(s => s.status === 'APROVADA').length} validadas pela coordenação)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

      </div>

      {/* 3. MEUS PROJETOS EM ANDAMENTO (ACESSO RÁPIDO AO WORKSPACE) */}
      <div className="bg-bg-surface border border-border-color rounded-md p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-color">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary m-0">
              Workspaces das Minhas Equipes
            </h2>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              Salas de trabalho colaborativas com chat, kanban de tarefas e entregas de projeto.
            </p>
          </div>
          <Link 
            to="/projetos" 
            className="text-xs font-semibold text-purple-primary hover:text-purple-hover hover:underline inline-flex items-center gap-1"
          >
            <span>Explorar novos projetos</span>
            <span>→</span>
          </Link>
        </div>

        {projetosAtivosAluno.length === 0 && meusProjetos.length === 0 ? (
          <div className="p-8 text-center bg-bg-primary rounded-md border border-dashed border-border-color">
            <svg className="w-10 h-10 text-text-secondary/50 mx-auto mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-semibold text-text-primary m-0">
              Você ainda não está vinculado a nenhum projeto ativo
            </p>
            <p className="text-xs text-text-secondary m-0 mt-1 max-w-md mx-auto">
              Candidate-se a projetos abertos no caderno de TI para ter acesso ao Workspace, chat e quadro kanban da equipe.
            </p>
            <div className="mt-4">
              <Link 
                to="/projetos" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-primary hover:bg-purple-hover text-white rounded-md text-xs font-bold no-underline transition-colors shadow-sm"
              >
                <span>Ver Projetos com Inscrições Abertas</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Projetos como Membro Aprovado */}
            {projetosAtivosAluno.map(cand => (
              <div 
                key={`aprovado-${cand.id}`} 
                className="bg-bg-primary border border-border-color hover:border-purple-primary/50 rounded-md p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      Membro Ativo
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      Inscrição #{cand.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary m-0 mb-1 leading-snug">
                    {cand.projeto}
                  </h3>

                  <p className="text-xs text-text-secondary m-0 mb-4 line-clamp-2">
                    {cand.motivo ? `"${cand.motivo}"` : 'Participação ativa na equipe acadêmica.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-color flex items-center justify-between gap-2">
                  <Link 
                    to={`/projeto/${cand.projeto_id}`} 
                    className="text-xs text-text-secondary hover:text-purple-primary no-underline font-medium"
                  >
                    Ver detalhes
                  </Link>
                  <Link 
                    to={`/workspace/${cand.projeto_id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-primary hover:bg-purple-hover text-white rounded text-xs font-bold no-underline transition-colors shadow-sm"
                  >
                    <span>Entrar no Workspace</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}

            {/* Projetos Próprios como Dono / Líder */}
            {meusProjetos.map(proj => (
              <div 
                key={`owner-${proj.id}`} 
                className="bg-bg-primary border border-purple-primary/30 rounded-md p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                      Líder / Proponente
                    </span>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary m-0 mb-1 leading-snug">
                    {proj.titulo}
                  </h3>

                  <p className="text-xs text-text-secondary m-0 mb-4 line-clamp-2">
                    {proj.descricao_curta || 'Projeto sob sua gestão acadêmica.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-color flex items-center justify-between gap-2">
                  <Link 
                    to={`/projeto/${proj.id}/editar`} 
                    className="text-xs text-text-secondary hover:text-purple-primary no-underline font-medium"
                  >
                    Editar dados
                  </Link>
                  <Link 
                    to={`/workspace/${proj.id}`} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold no-underline transition-colors shadow-sm"
                  >
                    <span>Gerenciar Workspace</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SEÇÃO DE ABAS DE GESTÃO ACADÊMICA */}
      <div className="bg-bg-surface border border-border-color rounded-md p-6 shadow-sm">
        
        {/* Barra de Seleção de Abas (Segmented Control) */}
        <div className="flex flex-wrap gap-2 pb-4 mb-6 border-b border-border-color">
          
          <button 
            type="button"
            onClick={() => setActiveTab('inscricoes')}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-2 border-none ${
              activeTab === 'inscricoes'
                ? 'bg-purple-primary text-white shadow-sm'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-primary/80'
            }`}
          >
            <span>Minhas Inscrições</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'inscricoes' ? 'bg-white/20 text-white' : 'bg-border-color text-text-secondary'
            }`}>
              {minhasCandidaturas.length}
            </span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('propostas')}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-2 border-none ${
              activeTab === 'propostas'
                ? 'bg-purple-primary text-white shadow-sm'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-primary/80'
            }`}
          >
            <span>Minhas Propostas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'propostas' ? 'bg-white/20 text-white' : 'bg-border-color text-text-secondary'
            }`}>
              {minhasSubmissoes.length}
            </span>
          </button>

          {meusProjetos.length > 0 && (
            <button 
              type="button"
              onClick={() => setActiveTab('meusprojetos')}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-2 border-none ${
                activeTab === 'meusprojetos'
                  ? 'bg-purple-primary text-white shadow-sm'
                  : 'bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-primary/80'
              }`}
            >
              <span>Gerenciar Projetos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'meusprojetos' ? 'bg-white/20 text-white' : 'bg-border-color text-text-secondary'
              }`}>
                {meusProjetos.length}
              </span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setActiveTab('recomendacoes')}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center gap-2 border-none ${
              activeTab === 'recomendacoes'
                ? 'bg-purple-primary text-white shadow-sm'
                : 'bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-primary/80'
            }`}
          >
            <span>Recomendações de Projetos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'recomendacoes' ? 'bg-white/20 text-white' : 'bg-border-color text-text-secondary'
            }`}>
              {recomendacoes.length}
            </span>
          </button>

        </div>

        {/* CONTEÚDO DA ABA 1: MINHAS INSCRIÇÕES */}
        {activeTab === 'inscricoes' && (
          <div className="space-y-4">
            
            {/* Filtros da Tabela de Inscrições */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  value={searchCand}
                  onChange={(e) => setSearchCand(e.target.value)}
                  placeholder="Pesquisar por projeto ou motivo..."
                  className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border-color rounded-md text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-purple-primary transition-colors"
                />
                <svg className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="filterStatusCand" className="text-xs font-semibold text-text-secondary">Status:</label>
                <select 
                  id="filterStatusCand"
                  value={statusFilterCand}
                  onChange={(e) => setStatusFilterCand(e.target.value)}
                  className="px-3 py-2 bg-bg-primary border border-border-color rounded-md text-xs font-semibold text-text-primary focus:outline-none focus:border-purple-primary transition-colors"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="APROVADA">Aprovadas</option>
                  <option value="PENDENTE">Em Análise / Pendente</option>
                  <option value="REJEITADA">Rejeitadas</option>
                </select>
              </div>
            </div>

            {/* Tabela de Inscrições */}
            <div className="border border-border-color rounded-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm text-text-primary">
                <thead>
                  <tr className="bg-bg-primary text-text-secondary border-b border-border-color font-semibold">
                    <th className="py-3 px-4">Projeto</th>
                    <th className="py-3 px-4">Motivo Apresentado</th>
                    <th className="py-3 px-4">Status da Candidatura</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {candidaturasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-secondary">
                        Nenhuma candidatura encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    candidaturasFiltradas.map(cand => (
                      <tr key={cand.id} className="hover:bg-purple-primary/5 transition-colors">
                        <td className="py-3.5 px-4 font-medium align-top">
                          <div className="font-bold text-text-primary">{cand.projeto}</div>
                          <Link 
                            to={`/projeto/${cand.projeto_id}`} 
                            className="text-[11px] text-purple-primary hover:text-purple-hover hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Visualizar caderno do projeto</span>
                            <span>↗</span>
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary align-top max-w-xs leading-relaxed">
                          {cand.motivo || 'Nenhum motivo informado.'}
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          {cand.status === 'APROVADA' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Aprovada</span>
                            </span>
                          )}

                          {(cand.status === 'PENDENTE' || cand.status === 'EM ANÁLISE') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Em Análise</span>
                            </span>
                          )}

                          {cand.status === 'REJEITADA' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Não Aprovada</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex items-center gap-2">
                            {cand.status === 'APROVADA' && (
                              <Link 
                                to={`/workspace/${cand.projeto_id}`} 
                                className="px-2.5 py-1 bg-purple-primary hover:bg-purple-hover text-white rounded text-xs font-semibold no-underline transition-colors shadow-sm"
                              >
                                Workspace
                              </Link>
                            )}

                            {cand.status !== 'APROVADA' && (
                              <>
                                <Link 
                                  to={`/candidatura/${cand.id}/editar`} 
                                  className="px-2.5 py-1 bg-bg-primary hover:bg-border-color text-text-primary rounded text-xs font-semibold no-underline border border-border-color transition-colors"
                                >
                                  Editar
                                </Link>

                                <button 
                                  type="button"
                                  onClick={() => handleCancelarCandidatura(cand.id)}
                                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded text-xs font-semibold border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 2: MINHAS PROPOSTAS */}
        {activeTab === 'propostas' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  value={searchSubm}
                  onChange={(e) => setSearchSubm(e.target.value)}
                  placeholder="Pesquisar por título ou categoria da proposta..."
                  className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border-color rounded-md text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-purple-primary transition-colors"
                />
                <svg className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <Link 
                to="/submissao" 
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-primary hover:bg-purple-hover text-white rounded-md text-xs font-bold transition-colors no-underline shadow-sm shrink-0"
              >
                <span>+ Enviar Nova Proposta</span>
              </Link>
            </div>

            <div className="border border-border-color rounded-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm text-text-primary">
                <thead>
                  <tr className="bg-bg-primary text-text-secondary border-b border-border-color font-semibold">
                    <th className="py-3 px-4">Título do Projeto</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Parecer Institucional</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {submissoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-secondary">
                        Você ainda não enviou propostas de projetos.
                      </td>
                    </tr>
                  ) : (
                    submissoesFiltradas.map(subm => (
                      <tr key={subm.id} className="hover:bg-purple-primary/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold align-top">
                          {subm.nome_projeto}
                          {subm.descricao && (
                            <p className="text-xs text-text-secondary font-normal m-0 mt-0.5 line-clamp-1">
                              {subm.descricao}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary align-top">
                          <span className="inline-block px-2 py-0.5 rounded bg-bg-primary border border-border-color text-xs font-medium">
                            {subm.categoria || 'Geral'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          {subm.status === 'APROVADA' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              Aprovada pelo Colegiado
                            </span>
                          )}

                          {subm.status === 'EM ANÁLISE' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                              Em Avaliação Pedagógica
                            </span>
                          )}

                          {subm.status === 'REJEITADA' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                              Indeferida
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex items-center gap-2">
                            {subm.status === 'EM ANÁLISE' ? (
                              <>
                                <Link 
                                  to={`/submissao/${subm.id}/editar`} 
                                  className="px-2.5 py-1 bg-bg-primary hover:bg-border-color text-text-primary rounded text-xs font-semibold no-underline border border-border-color transition-colors"
                                >
                                  Editar
                                </Link>

                                <button 
                                  type="button"
                                  onClick={() => handleExcluirSubmissao(subm.id)}
                                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded text-xs font-semibold border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                                >
                                  Excluir
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-text-secondary italic">
                                Parecer finalizado
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 3: GERENCIAR MEUS PROJETOS */}
        {activeTab === 'meusprojetos' && meusProjetos.length > 0 && (
          <div className="space-y-6">
            {meusProjetos.map(proj => (
              <div key={proj.id} className="border border-border-color rounded-md p-5 bg-bg-primary space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border-color gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-text-primary m-0">
                        {proj.titulo}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary m-0 mt-0.5">
                      Categoria: {proj.categoria || 'Geral'} · Gestor: {user.username}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/projeto/${proj.id}/editar`} 
                      className="px-3 py-1.5 bg-bg-surface hover:border-purple-primary border border-border-color text-text-primary rounded text-xs font-semibold no-underline transition-colors"
                    >
                      Editar Dados
                    </Link>
                    <Link 
                      to={`/workspace/${proj.id}`} 
                      className="px-3 py-1.5 bg-purple-primary hover:bg-purple-hover text-white rounded text-xs font-semibold no-underline transition-colors shadow-sm flex items-center gap-1"
                    >
                      <span>Abrir Workspace</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {/* Tabela de Candidaturas Recebidas para este projeto */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2.5">
                    Candidatos Inscritos para sua Equipe:
                  </h4>

                  <div className="border border-border-color rounded-md overflow-x-auto bg-bg-surface">
                    <table className="w-full border-collapse text-left text-xs text-text-primary">
                      <thead>
                        <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                          <th className="py-2.5 px-3 font-semibold">Candidato</th>
                          <th className="py-2.5 px-3 font-semibold">Motivo</th>
                          <th className="py-2.5 px-3 font-semibold">Experiência</th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Avaliação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {(!proj.candidaturas || proj.candidaturas.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-5 text-center text-text-secondary italic">
                              Nenhum aluno se candidatou para este projeto até o momento.
                            </td>
                          </tr>
                        ) : (
                          proj.candidaturas.map((cand: any) => (
                            <tr key={cand.id} className="hover:bg-purple-primary/5 transition-colors">
                              <td className="py-2.5 px-3 font-bold align-top">{cand.username}</td>
                              <td className="py-2.5 px-3 text-text-secondary align-top max-w-xs">{cand.motivo || '-'}</td>
                              <td className="py-2.5 px-3 text-text-secondary align-top max-w-xs">{cand.experiencia || '-'}</td>
                              <td className="py-2.5 px-3 align-top">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  cand.status === 'APROVADA'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : cand.status === 'REJEITADA'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {cand.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right align-top">
                                {cand.status === 'PENDENTE' ? (
                                  <div className="inline-flex gap-1.5">
                                    <button 
                                      type="button"
                                      onClick={() => handleAcaoCandidato(cand.id, 'aprovar', proj.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold border-none cursor-pointer shadow-sm transition-colors"
                                    >
                                      Aceitar
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleAcaoCandidato(cand.id, 'rejeitar', proj.id)}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold border-none cursor-pointer shadow-sm transition-colors"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={() => handleAcaoCandidato(cand.id, 'reavaliar', proj.id)}
                                    className="px-2.5 py-1 bg-bg-primary hover:bg-border-color text-text-primary rounded text-xs font-semibold border border-border-color cursor-pointer transition-colors"
                                  >
                                    Reavaliar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* CONTEÚDO DA ABA 4: RECOMENDAÇÕES */}
        {activeTab === 'recomendacoes' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-text-secondary m-0">
              Projetos identificados com base nas áreas de interesse e competências acadêmicas cadastradas no seu perfil:
            </p>

            {recomendacoes.length === 0 ? (
              <div className="p-8 text-center bg-bg-primary rounded-md border border-dashed border-border-color text-text-secondary text-xs sm:text-sm">
                Nenhum projeto específico recomendado no momento. Adicione palavras-chave na sua biografia e interesses para refinar as recomendações!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recomendacoes.map(proj => (
                  <div key={proj.id} className="border border-border-color rounded-md p-4 flex flex-col justify-between bg-bg-primary hover:border-purple-primary/50 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-bg-surface text-text-secondary border border-border-color">
                          {proj.categoria}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          Projeto #{proj.id}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-text-primary m-0 mb-1.5 leading-snug">
                        {proj.titulo}
                      </h4>

                      <p className="text-xs text-text-secondary m-0 mb-4 line-clamp-3 leading-relaxed">
                        {proj.descricao_curta}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-color flex items-center justify-between">
                      <span className="text-[11px] text-text-secondary">
                        Orientador: {proj.professor || 'A definir'}
                      </span>
                      <Link 
                        to={`/projeto/${proj.id}`} 
                        className="inline-flex items-center gap-1 text-xs text-purple-primary hover:text-purple-hover font-bold no-underline"
                      >
                        <span>Conhecer Projeto</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
