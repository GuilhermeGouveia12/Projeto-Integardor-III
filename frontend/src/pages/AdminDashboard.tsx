import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'tab-projetos' | 'tab-submissoes' | 'tab-candidaturas' | 'tab-usuarios'>('tab-projetos');
  const [projetos, setProjetos] = useState<any[]>([]);
  const [submissoes, setSubmissoes] = useState<any[]>([]);
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [stats, setStats] = useState<{ status: Record<string, number>; categoria: Record<string, number> }>({ status: {}, categoria: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dashRes, statsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/stats').catch(() => ({ data: { status: {}, categoria: {} } }))
      ]);

      if (dashRes.data.status === 'success' && dashRes.data.data) {
        setProjetos(dashRes.data.data.projetos || []);
        setSubmissoes(dashRes.data.data.submissoes || []);
        setCandidaturas(dashRes.data.data.candidaturas || []);
        setUsuarios(dashRes.data.data.usuarios || []);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do painel admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Excluir projeto
  const handleExcluirProjeto = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este projeto e todos os seus dados associados?')) return;
    try {
      setActionLoading(`proj-${id}`);
      await api.post(`/admin/projeto/${id}/excluir`);
      setProjetos(prev => prev.filter(p => p.id !== id));
      alert('✅ Projeto excluído com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir projeto.');
    } finally {
      setActionLoading(null);
    }
  };

  // Ação em Submissão (aprovar / rejeitar)
  const handleAcaoSubmissao = async (id: number, acao: 'aprovar' | 'rejeitar') => {
    try {
      setActionLoading(`sub-${id}`);
      const res = await api.post(`/admin/submissao/${id}/${acao}`);
      if (res.data.status === 'success') {
        setSubmissoes(prev => prev.map(s => s.id === id ? { ...s, status: res.data.new_status } : s));
        if (acao === 'aprovar') {
          // Atualiza lista de projetos
          const dashRes = await api.get('/admin/dashboard');
          if (dashRes.data.data?.projetos) {
            setProjetos(dashRes.data.data.projetos);
          }
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Erro ao ${acao} submissão.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Ação em Candidatura (aprovar / rejeitar)
  const handleAcaoCandidatura = async (id: number, acao: 'aprovar' | 'rejeitar') => {
    try {
      setActionLoading(`cand-${id}`);
      const res = await api.post(`/admin/candidatura/${id}/${acao}`);
      if (res.data.status === 'success') {
        setCandidaturas(prev => prev.map(c => c.id === id ? { ...c, status: res.data.new_status } : c));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Erro ao ${acao} candidatura.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Excluir usuário
  const handleExcluirUsuario = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      setActionLoading(`user-${id}`);
      await api.delete(`/admin/usuario/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      alert('✅ Usuário excluído com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir usuário.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = (endpoint: string) => {
    const baseURL = (api.defaults.baseURL || '').replace(/\/api$/, '');
    window.open(`${baseURL}${endpoint}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">Carregando Painel Administrativo...</p>
        </div>
      </div>
    );
  }

  const categoryEntries = Object.entries(stats.categoria || {});
  const statusEntries = Object.entries(stats.status || {});

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto my-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-title text-[1.8rem] text-text-primary m-0 font-bold mb-1">Painel Administrativo Corporativo</h2>
          <p className="text-text-secondary m-0">Gestão e controle do ecossistema de projetos, {user?.username}.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => handleDownload('/admin/relatorio/pdf')}
            className="bg-[#28a745] text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            📄 Relatório PDF
          </button>
          <button 
            onClick={() => handleDownload('/api/admin/exportar/projetos')}
            className="bg-purple-primary text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-purple-hover transition-colors flex items-center gap-1.5 shadow-sm"
          >
            📊 Projetos CSV
          </button>
          <button 
            onClick={() => handleDownload('/api/admin/exportar/satisfacao')}
            className="bg-purple-primary text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-purple-hover transition-colors flex items-center gap-1.5 shadow-sm"
          >
            ⭐ Satisfação CSV
          </button>
          <button 
            onClick={() => handleDownload('/api/admin/exportar/logs')}
            className="bg-purple-primary text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-purple-hover transition-colors flex items-center gap-1.5 shadow-sm"
          >
            📝 Logs CSV
          </button>
          <Link 
            to="/admin/logs"
            className="bg-text-secondary text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs no-underline hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            📋 Logs de Atividade
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Projetos Ativos</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-purple-primary mt-2">{projetos.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-[#3b82f6] p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Propostas Pendentes</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-[#3b82f6] mt-2">
            {submissoes.filter(s => s.status === 'EM ANÁLISE').length}
          </h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-[#f59e0b] p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Candidaturas</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-[#f59e0b] mt-2">{candidaturas.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-[#10b981] p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Usuários</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-[#10b981] mt-2">{usuarios.length}</h2>
        </div>
      </div>

      {/* CHARTS / DISTRIBUIÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Distribuição por Categoria */}
        <div className="bg-bg-surface border border-border-color p-6 rounded-xl shadow-sm">
          <h3 className="m-0 mb-4 font-title text-base font-bold text-text-primary flex items-center gap-2">
            🏷️ Projetos por Categoria
          </h3>
          <div className="flex flex-col gap-3">
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-text-secondary italic">Nenhum dado de categoria disponível.</p>
            ) : (
              categoryEntries.map(([cat, count]) => {
                const total = projetos.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>{cat}</span>
                      <span className="text-text-secondary">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-color">
                      <div className="bg-purple-primary h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribuição por Status */}
        <div className="bg-bg-surface border border-border-color p-6 rounded-xl shadow-sm">
          <h3 className="m-0 mb-4 font-title text-base font-bold text-text-primary flex items-center gap-2">
            📌 Status dos Projetos
          </h3>
          <div className="flex flex-col gap-3">
            {statusEntries.length === 0 ? (
              <p className="text-sm text-text-secondary italic">Nenhum dado de status disponível.</p>
            ) : (
              statusEntries.map(([status, count]) => {
                const total = projetos.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>{status}</span>
                      <span className="text-text-secondary">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-color">
                      <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b-2 border-border-color mb-6">
        <button 
          onClick={() => setActiveTab('tab-projetos')}
          className={`bg-transparent border-none px-4 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-projetos' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Projetos Ativos ({projetos.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-submissoes')}
          className={`bg-transparent border-none px-4 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-submissoes' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Propostas Recebidas ({submissoes.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-candidaturas')}
          className={`bg-transparent border-none px-4 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-candidaturas' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Candidaturas ({candidaturas.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-usuarios')}
          className={`bg-transparent border-none px-4 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-usuarios' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Usuários ({usuarios.length})
        </button>
      </div>

      {/* TAB PROJETOS */}
      {activeTab === 'tab-projetos' && (
        <div>
          <div className="flex gap-2.5 mb-4 flex-wrap items-center">
            <button 
              onClick={() => navigate('/admin/projeto/novo')}
              className="bg-purple-primary text-white border-none px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-purple-hover shadow-sm"
            >
              + Novo Projeto
            </button>
            <button 
              onClick={() => handleDownload('/api/admin/exportar/projetos')}
              className="bg-[#28a745] text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 shadow-sm"
            >
              ⬇️ Exportar CSV
            </button>
          </div>
          <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                  <th className="p-3.5 font-bold">ID</th>
                  <th className="p-3.5 font-bold">Título</th>
                  <th className="p-3.5 font-bold">Categoria</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projetos.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-8 text-text-secondary">Nenhum projeto cadastrado.</td></tr>
                ) : (
                  projetos.map(p => (
                    <tr key={p.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color">
                      <td className="p-3.5 font-mono text-xs text-text-secondary">#{p.id}</td>
                      <td className="p-3.5 font-bold">
                        <Link to={`/projeto/${p.id}`} className="text-text-primary no-underline hover:text-purple-primary">
                          {p.titulo}
                        </Link>
                      </td>
                      <td className="p-3.5 text-text-secondary">{p.categoria}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[rgba(234,88,12,0.1)] text-[#ea580c]">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex gap-2">
                          <Link 
                            to={`/admin/projeto/${p.id}/editar`}
                            className="bg-purple-primary text-white px-2.5 py-1 rounded text-xs font-semibold no-underline hover:bg-purple-hover"
                          >
                            Editar
                          </Link>
                          <button 
                            disabled={actionLoading === `proj-${p.id}`}
                            onClick={() => handleExcluirProjeto(p.id)}
                            className="bg-[#dc3545] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                          >
                            Excluir
                          </button>
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

      {/* TAB SUBMISSOES */}
      {activeTab === 'tab-submissoes' && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
            <h3 className="m-0 text-text-primary font-bold text-base">Propostas de Novos Projetos</h3>
            <button 
              onClick={() => handleDownload('/api/admin/exportar/submissoes')}
              className="bg-[#28a745] text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 shadow-sm"
            >
              ⬇️ Exportar CSV
            </button>
          </div>
          <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                  <th className="p-3.5 font-bold">ID</th>
                  <th className="p-3.5 font-bold">Projeto</th>
                  <th className="p-3.5 font-bold">Proponente</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {submissoes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-8 text-text-secondary">Nenhuma proposta recebida.</td></tr>
                ) : (
                  submissoes.map(s => (
                    <tr key={s.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color">
                      <td className="p-3.5 font-mono text-xs text-text-secondary">#{s.id}</td>
                      <td className="p-3.5">
                        <strong className="block text-text-primary">{s.nome_projeto}</strong>
                        <small className="text-text-secondary">{s.categoria}</small>
                      </td>
                      <td className="p-3.5">
                        <span className="block font-semibold">{s.proponente}</span>
                        <small className="text-text-secondary">{s.email}</small>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${s.status === 'APROVADA' ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745]' : s.status === 'REJEITADA' ? 'bg-[rgba(220,53,69,0.1)] text-[#dc3545]' : 'bg-[rgba(234,88,12,0.1)] text-[#ea580c]'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {s.status === 'EM ANÁLISE' ? (
                          <div className="flex gap-2">
                            <button 
                              disabled={actionLoading === `sub-${s.id}`}
                              onClick={() => handleAcaoSubmissao(s.id, 'aprovar')}
                              className="bg-[#28a745] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                            <button 
                              disabled={actionLoading === `sub-${s.id}`}
                              onClick={() => handleAcaoSubmissao(s.id, 'rejeitar')}
                              className="bg-[#dc3545] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            >
                              Rejeitar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary italic">Avaliado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CANDIDATURAS */}
      {activeTab === 'tab-candidaturas' && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
            <h3 className="m-0 text-text-primary font-bold text-base">Candidaturas de Alunos</h3>
            <button 
              onClick={() => handleDownload('/api/admin/exportar/candidaturas')}
              className="bg-[#28a745] text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 shadow-sm"
            >
              ⬇️ Exportar CSV
            </button>
          </div>
          <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                  <th className="p-3.5 font-bold">ID</th>
                  <th className="p-3.5 font-bold">Projeto Alvo</th>
                  <th className="p-3.5 font-bold">Usuário</th>
                  <th className="p-3.5 font-bold">Motivo / Exp</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidaturas.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-8 text-text-secondary">Nenhuma candidatura registrada.</td></tr>
                ) : (
                  candidaturas.map(c => (
                    <tr key={c.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color">
                      <td className="p-3.5 font-mono text-xs text-text-secondary">#{c.id}</td>
                      <td className="p-3.5 font-semibold">{c.projeto?.titulo || c.projeto || '—'}</td>
                      <td className="p-3.5 font-semibold text-purple-primary">{c.username}</td>
                      <td className="p-3.5 text-xs max-w-[280px]">
                        <strong>Motivo:</strong> {c.motivo}<br/>
                        {c.experiencia && <span><strong>Exp:</strong> {c.experiencia}</span>}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${c.status === 'APROVADA' ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745]' : c.status === 'REJEITADA' ? 'bg-[rgba(220,53,69,0.1)] text-[#dc3545]' : 'bg-[rgba(234,88,12,0.1)] text-[#ea580c]'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {c.status === 'PENDENTE' ? (
                          <div className="flex gap-2">
                            <button 
                              disabled={actionLoading === `cand-${c.id}`}
                              onClick={() => handleAcaoCandidatura(c.id, 'aprovar')}
                              className="bg-[#28a745] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                            <button 
                              disabled={actionLoading === `cand-${c.id}`}
                              onClick={() => handleAcaoCandidatura(c.id, 'rejeitar')}
                              className="bg-[#dc3545] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            >
                              Rejeitar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary italic">Avaliado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB USUARIOS */}
      {activeTab === 'tab-usuarios' && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
            <button 
              onClick={() => navigate('/admin/usuario/novo')}
              className="bg-purple-primary text-white border-none px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-purple-hover shadow-sm"
            >
              + Novo Usuário
            </button>
            <button 
              onClick={() => handleDownload('/api/admin/exportar/usuarios')}
              className="bg-[#28a745] text-white border-none px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 shadow-sm"
            >
              ⬇️ Exportar CSV
            </button>
          </div>
          <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                  <th className="p-3.5 font-bold">ID</th>
                  <th className="p-3.5 font-bold">Usuário</th>
                  <th className="p-3.5 font-bold">Papel (Role)</th>
                  <th className="p-3.5 font-bold">E-mail</th>
                  <th className="p-3.5 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-8 text-text-secondary">Nenhum usuário cadastrado.</td></tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color">
                      <td className="p-3.5 font-mono text-xs text-text-secondary">#{u.id}</td>
                      <td className="p-3.5 font-bold">{u.username}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-bg-primary border border-border-color text-text-primary">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-text-secondary">{u.email || '—'}</td>
                      <td className="p-3.5">
                        <div className="flex gap-2">
                          <Link 
                            to={`/admin/usuario/${u.id}/editar`}
                            className="bg-purple-primary text-white px-2.5 py-1 rounded text-xs font-semibold no-underline hover:bg-purple-hover"
                          >
                            Editar
                          </Link>
                          {u.username !== user?.username && (
                            <button 
                              disabled={actionLoading === `user-${u.id}`}
                              onClick={() => handleExcluirUsuario(u.id)}
                              className="bg-[#dc3545] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            >
                              Excluir
                            </button>
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

    </div>
  );
}
