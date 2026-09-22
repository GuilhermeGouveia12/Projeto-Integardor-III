import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tab-projetos');

  const [projetos, setProjetos] = useState<any[]>([]);
  const [submissoes, setSubmissoes] = useState<any[]>([]);
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake fetch to avoid API failure during layout phase
    setProjetos([{ id: 1, titulo: 'Sistema ABC', status: 'EM EXECUÇÃO' }]);
    setSubmissoes([{ id: 1, nome_projeto: 'Nova Proposta', proponente: 'João', email: 'joao@ceub.br', categoria: 'Frontend', status: 'EM ANÁLISE' }]);
    setCandidaturas([{ id: 1, projeto: { titulo: 'Sistema ABC' }, username: 'aluno1', motivo: 'Interesse', experiencia: 'React', status: 'PENDENTE' }]);
    setUsuarios([{ id: 1, username: 'admin', role: 'admin' }, { id: 2, username: 'aluno1', role: 'user' }]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Carregando painel admin...</div>;
  }

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto my-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-title text-[1.8rem] text-text-primary m-0 font-bold mb-1">Painel Administrativo Corporativo</h2>
          <p className="text-text-secondary m-0">Gestão e controle do ecossistema de projetos, {user?.username}.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="bg-[#28a745] text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📄 Relatório Semestral PDF</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📊 Projetos CSV</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">⭐ Satisfação CSV</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📝 Logs CSV</button>
          <button className="bg-text-secondary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📋 Logs de Atividade</button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-4">
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Projetos Ativos</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{projetos.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Propostas Pendentes</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{submissoes.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Candidaturas</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{candidaturas.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Usuários</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{usuarios.length}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 mt-4">
        <div className="bg-bg-surface border-t-[5px] border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center">
          <h3 className="m-0 mb-4 font-title text-[1.1rem] text-text-primary">Projetos por Categoria</h3>
          <div className="h-[220px] w-full bg-[rgba(122,27,181,0.05)] border border-dashed border-border-color flex items-center justify-center rounded-md text-text-secondary italic">Gráfico Chart.js (Placeholder)</div>
        </div>
        <div className="bg-bg-surface border-t-[5px] border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center">
          <h3 className="m-0 mb-4 font-title text-[1.1rem] text-text-primary">Status dos Projetos</h3>
          <div className="h-[220px] w-full bg-[rgba(122,27,181,0.05)] border border-dashed border-border-color flex items-center justify-center rounded-md text-text-secondary italic">Gráfico Chart.js (Placeholder)</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border-color mb-8">
        <button 
          onClick={() => setActiveTab('tab-projetos')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-projetos' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Projetos Ativos
        </button>
        <button 
          onClick={() => setActiveTab('tab-submissoes')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-submissoes' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Propostas Recebidas ({submissoes.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-candidaturas')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-candidaturas' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Candidaturas ({candidaturas.length})
        </button>
        <button 
          onClick={() => setActiveTab('tab-usuarios')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-usuarios' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Usuários ({usuarios.length})
        </button>
      </div>

      {/* TAB PROJETOS */}
      {activeTab === 'tab-projetos' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <div className="flex gap-2.5 mb-4 flex-wrap items-center">
            <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-purple-hover">+ Novo Projeto</button>
            <button className="bg-[#28a745] text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">⬇️ Exportar Usuários CSV</button>
          </div>
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Título</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Status</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projetos.map(p => (
                  <tr key={p.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-3.5 border-b border-border-color">{p.id}</td>
                    <td className="p-3.5 border-b border-border-color">{p.titulo}</td>
                    <td className="p-3.5 border-b border-border-color">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-[rgba(234,88,12,0.1)] text-[#ea580c]">{p.status}</span>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <div className="flex gap-1.5">
                        <button className="bg-purple-primary text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Editar</button>
                        <button className="bg-[#dc3545] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB SUBMISSOES */}
      {activeTab === 'tab-submissoes' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
            <h3 className="m-0 text-text-primary font-bold">Propostas de Novos Projetos</h3>
            <button className="bg-[#28a745] text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">⬇️ Exportar CSV</button>
          </div>
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Projeto</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Proponente</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Status</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {submissoes.map(s => (
                  <tr key={s.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-3.5 border-b border-border-color">#{s.id}</td>
                    <td className="p-3.5 border-b border-border-color">
                      <strong>{s.nome_projeto}</strong><br/>
                      <small className="text-text-secondary">{s.categoria}</small>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      {s.proponente}<br/>
                      <small className="text-text-secondary">{s.email}</small>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-[rgba(234,88,12,0.1)] text-[#ea580c]">{s.status}</span>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <div className="flex gap-1.5">
                        <button className="bg-[#28a745] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Aprovar</button>
                        <button className="bg-[#dc3545] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Rejeitar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CANDIDATURAS */}
      {activeTab === 'tab-candidaturas' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
            <h3 className="m-0 text-text-primary font-bold">Candidaturas de Alunos</h3>
            <button className="bg-[#28a745] text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">⬇️ Exportar CSV</button>
          </div>
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Projeto Alvo</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Usuário</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Motivo/Exp</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Status</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidaturas.map(c => (
                  <tr key={c.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-3.5 border-b border-border-color">#{c.id}</td>
                    <td className="p-3.5 border-b border-border-color">{c.projeto.titulo}</td>
                    <td className="p-3.5 border-b border-border-color">{c.username}</td>
                    <td className="p-3.5 border-b border-border-color text-sm max-w-[300px]">
                      <strong>Motivo:</strong> {c.motivo}<br/>
                      <strong>Exp:</strong> {c.experiencia}
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase bg-[rgba(234,88,12,0.1)] text-[#ea580c]">{c.status}</span>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <div className="flex gap-1.5">
                        <button className="bg-[#28a745] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Aprovar</button>
                        <button className="bg-[#dc3545] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Rejeitar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB USUARIOS */}
      {activeTab === 'tab-usuarios' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <div className="mb-4">
            <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-purple-hover">+ Novo Usuário</button>
          </div>
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Usuário</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Papel (Role)</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-3.5 border-b border-border-color">#{u.id}</td>
                    <td className="p-3.5 border-b border-border-color"><strong>{u.username}</strong></td>
                    <td className="p-3.5 border-b border-border-color">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745]' : 'bg-bg-primary text-text-secondary border border-border-color'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <div className="flex gap-1.5">
                        <button className="bg-purple-primary text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Editar</button>
                        <button className="bg-[#dc3545] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
