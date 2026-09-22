import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function CoordenadorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tab-projetos' | 'tab-submissoes'>('tab-projetos');

  const [projetos, setProjetos] = useState<any[]>([]);
  const [submissoes, setSubmissoes] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [satisfacao, setSatisfacao] = useState<{
    nota: number;
    nota_organizacao: number;
    nota_orientacao: number;
    nota_aprendizado: number;
    total: number;
  }>({
    nota: 0,
    nota_organizacao: 0,
    nota_orientacao: 0,
    nota_aprendizado: 0,
    total: 0
  });

  const [selectedProfessores, setSelectedProfessores] = useState<Record<number, string>>({});
  const [selectedSubmProf, setSelectedSubmProf] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [coordRes, satRes] = await Promise.all([
        api.get('/coordenador'),
        api.get('/admin/satisfacao').catch(() => ({ data: { nota: 0, nota_organizacao: 0, nota_orientacao: 0, nota_aprendizado: 0, total: 0 } }))
      ]);

      if (coordRes.data.status === 'success') {
        setProjetos(coordRes.data.projetos || []);
        setSubmissoes(coordRes.data.submissoes || []);
        setProfessores(coordRes.data.professores || []);

        // Initialize selected professors
        const profMap: Record<number, string> = {};
        (coordRes.data.projetos || []).forEach((p: any) => {
          if (p.professor_id) profMap[p.id] = String(p.professor_id);
        });
        setSelectedProfessores(profMap);
      }

      if (satRes.data) {
        setSatisfacao(satRes.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do coordenador:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAtribuirOrientador = async (projId: number) => {
    const profId = selectedProfessores[projId];
    if (!profId) {
      alert('Por favor, selecione um professor orientador.');
      return;
    }

    try {
      setSavingId(projId);
      const res = await api.post(`/coordenador/projeto/${projId}/atribuir`, { professor_id: profId });
      if (res.data.status === 'success') {
        alert(res.data.message || 'Orientador atribuído com sucesso!');
        // Refresh project list
        const coordRes = await api.get('/coordenador');
        if (coordRes.data.projetos) setProjetos(coordRes.data.projetos);
      } else {
        alert(res.data.message || 'Erro ao atribuir orientador');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atribuir professor.');
    } finally {
      setSavingId(null);
    }
  };

  const handleAcaoSubmissao = async (subId: number, acao: 'aprovar' | 'rejeitar') => {
    try {
      setSavingId(subId);
      const profId = selectedSubmProf[subId];
      const res = await api.post(`/admin/submissao/${subId}/${acao}`, { professor_id: profId });
      if (res.data.status === 'success') {
        alert(res.data.message || `Submissão ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`);
        carregarDados();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Erro ao ${acao} submissão.`);
    } finally {
      setSavingId(null);
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
          <p className="text-text-secondary font-medium">Carregando Painel do Coordenador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto my-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-title text-[1.8rem] text-text-primary m-0 font-bold mb-1">Painel do Coordenador Acadêmico</h2>
          <p className="text-text-secondary m-0">Aprovação de propostas de empresas e atribuição de Professores Orientadores, {user?.username}.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
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
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Projetos Ativos</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-purple-primary mt-2">{projetos.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-[#3b82f6] p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Propostas Recebidas</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-[#3b82f6] mt-2">{submissoes.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-[#10b981] p-6 rounded-xl shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[0.95rem] text-text-secondary font-bold uppercase tracking-wider">Professores Disponíveis</h3>
          <h2 className="m-0 font-title text-[2.4rem] font-bold text-[#10b981] mt-2">{professores.length}</h2>
        </div>
      </div>

      {/* MÉTRICAS DE SATISFAÇÃO */}
      <div className="bg-bg-surface border border-border-color rounded-xl p-6 shadow-sm mb-8">
        <h3 className="m-0 mb-4 font-title text-base font-bold text-text-primary flex items-center gap-2">
          ⭐ Estatísticas de Satisfação Multidimensional ({satisfacao.total} avaliações)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-primary p-4 rounded-lg border border-border-color">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wide block mb-1">Média Geral</span>
            <span className="text-2xl font-bold font-title text-purple-primary">{satisfacao.nota || '0.0'} / 5.0</span>
          </div>
          <div className="bg-bg-primary p-4 rounded-lg border border-border-color">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wide block mb-1">Organização</span>
            <span className="text-2xl font-bold font-title text-[#3b82f6]">{satisfacao.nota_organizacao || '0.0'} / 5.0</span>
          </div>
          <div className="bg-bg-primary p-4 rounded-lg border border-border-color">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wide block mb-1">Orientação Docente</span>
            <span className="text-2xl font-bold font-title text-[#10b981]">{satisfacao.nota_orientacao || '0.0'} / 5.0</span>
          </div>
          <div className="bg-bg-primary p-4 rounded-lg border border-border-color">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wide block mb-1">Aprendizado Alunos</span>
            <span className="text-2xl font-bold font-title text-[#f59e0b]">{satisfacao.nota_aprendizado || '0.0'} / 5.0</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border-color mb-6">
        <button 
          onClick={() => setActiveTab('tab-projetos')}
          className={`bg-transparent border-none px-5 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-projetos' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Gestão de Orientadores ({projetos.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-submissoes')}
          className={`bg-transparent border-none px-5 py-2.5 text-sm font-bold cursor-pointer border-b-[3px] transition-all ${activeTab === 'tab-submissoes' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Propostas de Projetos ({submissoes.length})
        </button>
      </div>

      {/* TAB PROJETOS */}
      {activeTab === 'tab-projetos' && (
        <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
          <table className="w-full border-collapse text-left text-sm text-text-primary">
            <thead>
              <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                <th className="p-3.5 font-bold">ID</th>
                <th className="p-3.5 font-bold">Projeto</th>
                <th className="p-3.5 font-bold">Categoria</th>
                <th className="p-3.5 font-bold">Professor Orientador Atual</th>
                <th className="p-3.5 font-bold">Atribuir Orientador</th>
              </tr>
            </thead>
            <tbody>
              {projetos.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-text-secondary">Nenhum projeto registrado.</td></tr>
              ) : (
                projetos.map(p => (
                  <tr key={p.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color">
                    <td className="p-3.5 font-mono text-xs text-text-secondary">#{p.id}</td>
                    <td className="p-3.5 font-bold">{p.titulo}</td>
                    <td className="p-3.5 text-text-secondary">{p.categoria}</td>
                    <td className="p-3.5">
                      {p.orientador ? (
                        <span className="font-semibold text-purple-primary">👨‍🏫 {p.orientador.username}</span>
                      ) : (
                        <em className="text-text-secondary text-xs">Nenhum orientador atribuído</em>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-2 items-center">
                        <select 
                          value={selectedProfessores[p.id] || ''}
                          onChange={(e) => setSelectedProfessores({ ...selectedProfessores, [p.id]: e.target.value })}
                          className="px-2.5 py-1.5 border border-border-color rounded-lg bg-bg-primary text-text-primary text-xs outline-none focus:border-purple-primary"
                        >
                          <option value="">-- Selecione Professor --</option>
                          {professores.map(prof => (
                            <option key={prof.id} value={prof.id}>{prof.username}</option>
                          ))}
                        </select>
                        <button 
                          disabled={savingId === p.id}
                          onClick={() => handleAtribuirOrientador(p.id)}
                          className="bg-[#28a745] text-white border-none px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-50"
                        >
                          {savingId === p.id ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB SUBMISSOES */}
      {activeTab === 'tab-submissoes' && (
        <div className="bg-bg-surface rounded-xl overflow-hidden shadow-sm border border-border-color">
          <table className="w-full border-collapse text-left text-sm text-text-primary">
            <thead>
              <tr className="bg-bg-primary text-text-secondary border-b border-border-color">
                <th className="p-3.5 font-bold">ID</th>
                <th className="p-3.5 font-bold">Proposta</th>
                <th className="p-3.5 font-bold">Proponente</th>
                <th className="p-3.5 font-bold">Orientador a Atribuir</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {submissoes.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-text-secondary">Nenhuma proposta enviada.</td></tr>
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
                      {s.status === 'EM ANÁLISE' ? (
                        <select 
                          value={selectedSubmProf[s.id] || ''}
                          onChange={(e) => setSelectedSubmProf({ ...selectedSubmProf, [s.id]: e.target.value })}
                          className="px-2.5 py-1.5 border border-border-color rounded-lg bg-bg-primary text-text-primary text-xs outline-none focus:border-purple-primary w-full max-w-[200px]"
                        >
                          <option value="">-- Atribuir Professor --</option>
                          {professores.map(prof => (
                            <option key={prof.id} value={prof.id}>{prof.username}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
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
                            disabled={savingId === s.id}
                            onClick={() => handleAcaoSubmissao(s.id, 'aprovar')}
                            className="bg-[#28a745] text-white border-none px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                          >
                            Aprovar
                          </button>
                          <button 
                            disabled={savingId === s.id}
                            onClick={() => handleAcaoSubmissao(s.id, 'rejeitar')}
                            className="bg-[#dc3545] text-white border-none px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
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
      )}

    </div>
  );
}
