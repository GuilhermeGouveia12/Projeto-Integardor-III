import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Perfil() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inscricoes');
  
  const [minhasCandidaturas, setMinhasCandidaturas] = useState<any[]>([]);
  const [minhasSubmissoes, setMinhasSubmissoes] = useState<any[]>([]);
  const [meusProjetos, setMeusProjetos] = useState<any[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Tem certeza que deseja cancelar sua candidatura?')) return;
    try {
      const res = await api.post(`/perfil/candidatura/${candId}/cancelar`);
      if (res.data.status === 'success' || res.status === 200) {
        setMinhasCandidaturas(prev => prev.filter(c => c.id !== candId));
        alert('✅ Candidatura cancelada com sucesso!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar candidatura.');
    }
  };

  const handleExcluirSubmissao = async (subId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta proposta?')) return;
    try {
      const res = await api.post(`/submissao/${subId}/excluir`);
      if (res.data.status === 'success' || res.status === 200) {
        setMinhasSubmissoes(prev => prev.filter(s => s.id !== subId));
        alert('✅ Proposta excluída com sucesso!');
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

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    admin: '👑 Administrador do Sistema',
    coordenador: '📋 Coordenador',
    professor: '👨‍🏫 Professor Orientador',
    user: '🎓 Estudante / Membro'
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto my-8">
      
      {/* HEADER DO PERFIL */}
      <div className="flex items-center justify-between flex-wrap gap-4 text-text-primary mb-8">
        <div className="flex items-center gap-5">
          <div className="w-[60px] h-[60px] bg-gradient-to-br from-purple-primary to-purple-hover text-white rounded-full flex items-center justify-center font-title text-2xl font-bold shadow-[0_4px_16px_rgba(122,27,181,0.3)] shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="m-0 mb-1 font-title text-2xl font-bold">{user.username}</h2>
            <p className="m-0 text-text-secondary text-sm">
              {roleLabels[user.role] || '🎓 Estudante / Membro'}
            </p>
          </div>
        </div>
        <Link 
          to="/perfil/editar" 
          className="inline-block bg-purple-primary text-text-on-purple px-5 py-2.5 rounded-md font-bold text-sm hover:bg-purple-hover hover:-translate-y-0.5 transition-all"
        >
          ✏️ Editar Perfil
        </Link>
      </div>

      {/* RECOMENDAÇÕES */}
      {recomendacoes.length > 0 && (
        <div className="mt-6 mb-8 bg-bg-surface border border-border-color rounded-lg p-6 shadow-sm">
          <h3 className="mt-0 mb-2 font-title text-lg text-purple-primary flex items-center gap-2 font-bold">
            ✨ Projetos Recomendados para Você
          </h3>
          <p className="text-text-secondary text-sm m-0 mb-5">
            Encontramos projetos que coincidem com os interesses do seu perfil acadêmico!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recomendacoes.map(proj => (
              <div key={proj.id} className="border border-border-color rounded-md p-4 flex flex-col justify-between bg-bg-primary">
                <div>
                  <h4 className="m-0 mb-2 font-title text-base font-bold text-text-primary">{proj.titulo}</h4>
                  <p className="text-xs text-text-secondary m-0 mb-3 leading-relaxed">
                    {proj.descricao_curta.length > 80 ? proj.descricao_curta.substring(0, 80) + '...' : proj.descricao_curta}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[0.72rem] font-bold bg-bg-surface text-text-secondary uppercase border border-border-color">
                    {proj.categoria}
                  </span>
                  <Link to={`/projeto/${proj.id}`} className="text-sm text-purple-primary font-semibold no-underline hover:text-purple-hover">
                    Conhecer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border-color mb-8">
        <button 
          onClick={() => setActiveTab('inscricoes')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'inscricoes' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Minhas Inscrições ({minhasCandidaturas.length})
        </button>
        <button 
          onClick={() => setActiveTab('propostas')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'propostas' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Minhas Propostas ({minhasSubmissoes.length})
        </button>
        {meusProjetos.length > 0 && (
          <button 
            onClick={() => setActiveTab('meusprojetos')}
            className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'meusprojetos' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
          >
            Gerenciar Meus Projetos ({meusProjetos.length})
          </button>
        )}
      </div>

      {/* CONTEUDO TABS */}
      <div className="animate-[fadeIn_0.4s_ease-out]">
        
        {/* ABA: INSCRIÇÕES */}
        {activeTab === 'inscricoes' && (
          <div>
            <h3 className="font-title text-xl text-purple-primary font-bold mb-4">Projetos que me candidatei</h3>
            <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
              <table className="w-full border-collapse text-[0.95rem] text-text-primary">
                <thead>
                  <tr className="bg-bg-primary text-left">
                    <th className="p-3.5 border-b border-border-color font-bold">Projeto</th>
                    <th className="p-3.5 border-b border-border-color font-bold">Meu Motivo</th>
                    <th className="p-3.5 border-b border-border-color font-bold">Status da Inscrição</th>
                  </tr>
                </thead>
                <tbody>
                  {minhasCandidaturas.length === 0 ? (
                    <tr><td colSpan={3} className="text-center p-4 text-text-secondary">Você ainda não se inscreveu em nenhum projeto.</td></tr>
                  ) : (
                    minhasCandidaturas.map(cand => (
                      <tr key={cand.id} className="hover:bg-purple-primary/5 transition-colors">
                        <td className="p-3.5 border-b border-border-color align-top">
                          <strong>{cand.projeto}</strong><br/>
                          <Link to={`/projeto/${cand.projeto_id}`} className="text-xs text-purple-primary no-underline hover:underline">Ver página</Link>
                        </td>
                        <td className="p-3.5 border-b border-border-color text-sm max-w-[300px] align-top">{cand.motivo || '-'}</td>
                        <td className="p-3.5 border-b border-border-color align-top">
                          {cand.status === 'APROVADA' ? (
                            <>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-bg-primary text-[#28a745]">APROVADA</span><br/>
                              <Link to={`/workspace/${cand.projeto_id}`} className="inline-block mt-2 bg-[#28a745] text-white px-3 py-1.5 rounded text-[0.85rem] no-underline hover:opacity-80 transition-opacity">Acessar Workspace</Link>
                            </>
                          ) : cand.status === 'REJEITADA' ? (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-bg-primary text-[#dc3545]">REJEITADA</span>
                          ) : (
                            <>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-bg-primary text-[#ff9800]">{cand.status}</span>
                              <div className="mt-2 flex gap-1.5">
                                <Link to={`/candidatura/${cand.id}/editar`} className="inline-block bg-[#ff9800] text-white px-3 py-1.5 rounded text-[0.85rem] no-underline hover:opacity-80 transition-opacity">Editar</Link>
                                <button onClick={() => handleCancelarCandidatura(cand.id)} className="border-none bg-[#dc3545] text-white px-3 py-1.5 rounded text-[0.85rem] cursor-pointer hover:opacity-80 transition-opacity">Cancelar</button>
                              </div>
                            </>
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

        {/* ABA: PROPOSTAS */}
        {activeTab === 'propostas' && (
          <div>
            <h3 className="font-title text-xl text-purple-primary font-bold mb-2">Minhas Propostas de Projetos</h3>
            <p className="text-text-secondary text-sm mb-4">Aqui você pode ver, editar ou cancelar as propostas de projetos que você enviou.</p>
            <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
              <table className="w-full border-collapse text-[0.95rem] text-text-primary">
                <thead>
                  <tr className="bg-bg-primary text-left">
                    <th className="p-3.5 border-b border-border-color font-bold">Título do Projeto</th>
                    <th className="p-3.5 border-b border-border-color font-bold">Categoria</th>
                    <th className="p-3.5 border-b border-border-color font-bold">Status</th>
                    <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {minhasSubmissoes.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-4 text-text-secondary">Você ainda não enviou nenhuma proposta de projeto.</td></tr>
                  ) : (
                    minhasSubmissoes.map(subm => (
                      <tr key={subm.id} className="hover:bg-purple-primary/5 transition-colors">
                        <td className="p-3.5 border-b border-border-color align-top"><strong>{subm.nome_projeto}</strong></td>
                        <td className="p-3.5 border-b border-border-color align-top">{subm.categoria || '-'}</td>
                        <td className="p-3.5 border-b border-border-color align-top">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-bg-primary ${subm.status === 'APROVADA' ? 'text-[#28a745]' : subm.status === 'REJEITADA' ? 'text-[#dc3545]' : 'text-[#ff9800]'}`}>
                            {subm.status}
                          </span>
                        </td>
                        <td className="p-3.5 border-b border-border-color align-top">
                          {subm.status === 'EM ANÁLISE' ? (
                            <div className="flex gap-1.5">
                              <Link to={`/submissao/${subm.id}/editar`} className="inline-block bg-[#ff9800] text-white px-3 py-1.5 rounded text-[0.85rem] no-underline hover:opacity-80 transition-opacity">Editar</Link>
                              <button onClick={() => handleExcluirSubmissao(subm.id)} className="border-none bg-[#dc3545] text-white px-3 py-1.5 rounded text-[0.85rem] cursor-pointer hover:opacity-80 transition-opacity">Excluir</button>
                            </div>
                          ) : (
                            <span className="text-[0.85rem] text-text-secondary italic">Já avaliado</span>
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

        {/* ABA: MEUS PROJETOS */}
        {activeTab === 'meusprojetos' && meusProjetos.length > 0 && (
          <div>
            <h3 className="font-title text-xl text-purple-primary font-bold mb-2">Gerenciar Meus Projetos</h3>
            <p className="text-text-secondary text-sm mb-4">Como dono destes projetos, você tem autonomia para aprovar alunos e acessar o Chat da equipe.</p>
            
            {meusProjetos.map(proj => (
              <div key={proj.id} className="bg-bg-surface p-6 rounded-lg mb-6 shadow-light border border-border-color">
                <div className="flex justify-between items-center border-b border-border-color pb-3 mb-4 gap-2.5 flex-wrap">
                  <h4 className="text-purple-primary m-0 font-title text-lg font-bold">Projeto: {proj.titulo}</h4>
                  <div className="flex gap-2.5">
                    <Link to={`/projeto/${proj.id}/editar`} className="inline-block px-4 py-2 rounded-md font-bold text-white bg-[#ff9800] text-sm hover:-translate-y-[1px] transition-transform">Editar Informações</Link>
                    <Link to={`/workspace/${proj.id}`} className="inline-block px-4 py-2 rounded-md font-bold text-white bg-[#28a745] text-sm hover:-translate-y-[1px] transition-transform">Acessar Workspace / Chat</Link>
                  </div>
                </div>
                
                <h5 className="font-title text-base font-bold text-text-primary mb-3">Candidaturas Recebidas:</h5>
                <div className="rounded-lg overflow-hidden border border-border-color">
                  <table className="w-full border-collapse text-[0.95rem] text-text-primary bg-bg-surface">
                    <thead>
                      <tr className="bg-bg-primary text-left">
                        <th className="p-3.5 border-b border-border-color font-bold">Aluno(a)</th>
                        <th className="p-3.5 border-b border-border-color font-bold">Motivo</th>
                        <th className="p-3.5 border-b border-border-color font-bold">Experiência</th>
                        <th className="p-3.5 border-b border-border-color font-bold">Status</th>
                        <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!proj.candidaturas || proj.candidaturas.length === 0) ? (
                        <tr><td colSpan={5} className="text-center p-4 text-text-secondary">Ninguém se inscreveu neste projeto ainda.</td></tr>
                      ) : (
                        proj.candidaturas.map((cand: any) => (
                          <tr key={cand.id} className="hover:bg-purple-primary/5 transition-colors">
                            <td className="p-3.5 border-b border-border-color align-top"><strong>{cand.username}</strong></td>
                            <td className="p-3.5 border-b border-border-color text-sm max-w-[250px] align-top">{cand.motivo}</td>
                            <td className="p-3.5 border-b border-border-color text-sm max-w-[200px] align-top">{cand.experiencia}</td>
                            <td className="p-3.5 border-b border-border-color align-top">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-bg-primary ${cand.status === 'APROVADA' ? 'text-[#28a745]' : cand.status === 'REJEITADA' ? 'text-[#dc3545]' : 'text-[#ff9800]'}`}>
                                {cand.status}
                              </span>
                            </td>
                            <td className="p-3.5 border-b border-border-color align-top">
                              {cand.status === 'PENDENTE' ? (
                                <div className="flex gap-1.5">
                                  <button onClick={() => handleAcaoCandidato(cand.id, 'aprovar', proj.id)} className="border-none bg-[#28a745] text-white px-3 py-1.5 rounded text-[0.85rem] cursor-pointer hover:opacity-80 transition-opacity">Aceitar</button>
                                  <button onClick={() => handleAcaoCandidato(cand.id, 'rejeitar', proj.id)} className="border-none bg-[#dc3545] text-white px-3 py-1.5 rounded text-[0.85rem] cursor-pointer hover:opacity-80 transition-opacity">Recusar</button>
                                </div>
                              ) : (
                                <button onClick={() => handleAcaoCandidato(cand.id, 'reavaliar', proj.id)} className="border-none bg-purple-primary text-white px-3 py-1.5 rounded text-[0.85rem] cursor-pointer hover:opacity-80 transition-opacity">Reavaliar</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
