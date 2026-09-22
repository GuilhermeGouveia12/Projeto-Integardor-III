import { useState, useEffect } from 'react';

export function CoordenadorDashboard() {
  const [activeTab, setActiveTab] = useState('tab-projetos');

  const [projetos, setProjetos] = useState<any[]>([]);
  const [submissoes, setSubmissoes] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake fetch to ensure identical visual display while API is not fully hooked up
    setProjetos([{ id: 1, titulo: 'Projeto Teste', categoria: 'Iniciação', orientador: { username: 'Prof João' } }]);
    setSubmissoes([{ id: 1, nome_projeto: 'Nova Ideia', proponente: 'Empresa X', email: 'contato@x.com', categoria: 'Estágio', status: 'EM ANÁLISE' }]);
    setProfessores([{ id: 1, username: 'Prof João' }, { id: 2, username: 'Prof Maria' }]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Carregando painel coordenador...</div>;
  }

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto my-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-title text-[1.8rem] text-text-primary m-0 font-bold mb-1">Painel do Coordenador Acadêmico</h2>
          <p className="text-text-secondary m-0">Aprovação de propostas de empresas e atribuição de Professores Orientadores.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="bg-[#28a745] text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📄 Relatório Semestral PDF</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📊 Projetos CSV</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">⭐ Satisfação CSV</button>
          <button className="bg-purple-primary text-white border-none px-4 py-2 rounded-md font-bold text-[0.85rem] cursor-pointer">📝 Logs CSV</button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Projetos Ativos</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{projetos.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Propostas Recebidas</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{submissoes.length}</h2>
        </div>
        <div className="bg-bg-surface border-l-4 border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center justify-center">
          <h3 className="m-0 font-title text-[1.1rem] text-text-secondary font-bold uppercase tracking-wide">Professores Disponíveis</h3>
          <h2 className="m-0 font-title text-[2.5rem] font-bold text-purple-primary mt-2">{professores.length}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 gap-5 mb-10 mt-4">
        <div className="bg-bg-surface border-t-[5px] border-purple-primary p-6 rounded-lg shadow-light flex flex-col items-center">
          <h3 className="m-0 mb-4 font-title text-[1.1rem] text-text-primary">Estatísticas de Satisfação Multidimensional</h3>
          <div className="h-[220px] w-full bg-[rgba(122,27,181,0.05)] border border-dashed border-border-color flex items-center justify-center rounded-md text-text-secondary italic">Gráfico Chart.js (Placeholder)</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-border-color mb-8">
        <button 
          onClick={() => setActiveTab('tab-projetos')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-projetos' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Gestão de Orientadores (Projetos)
        </button>
        <button 
          onClick={() => setActiveTab('tab-submissoes')}
          className={`bg-transparent border-none px-5 py-2.5 text-base font-semibold cursor-pointer border-b-[3px] transition-all hover:text-purple-primary ${activeTab === 'tab-submissoes' ? 'text-purple-primary border-purple-primary' : 'text-text-secondary border-transparent'}`}
        >
          Propostas de Projetos ({submissoes.length})
        </button>
      </div>

      {/* TAB PROJETOS */}
      {activeTab === 'tab-projetos' && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Projeto</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Categoria</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Professor Orientador Atual</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Alterar Orientador</th>
                </tr>
              </thead>
              <tbody>
                {projetos.map(p => (
                  <tr key={p.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-3.5 border-b border-border-color">#{p.id}</td>
                    <td className="p-3.5 border-b border-border-color"><strong>{p.titulo}</strong></td>
                    <td className="p-3.5 border-b border-border-color">{p.categoria}</td>
                    <td className="p-3.5 border-b border-border-color">
                      {p.orientador ? `👤 ${p.orientador.username}` : <em className="text-text-secondary">Nenhum orientador atribuído</em>}
                    </td>
                    <td className="p-3.5 border-b border-border-color">
                      <div className="flex gap-2 items-center">
                        <select className="px-2 py-1.5 border border-border-color rounded bg-bg-primary text-text-primary text-[0.85rem]">
                          <option value="">-- Selecione --</option>
                          {professores.map(prof => (
                            <option key={prof.id} value={prof.id}>{prof.username}</option>
                          ))}
                        </select>
                        <button className="bg-[#28a745] text-white border-none px-3 py-1.5 rounded text-[0.85rem] cursor-pointer">Salvar</button>
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
          <div className="bg-bg-surface rounded-lg overflow-hidden shadow-light border border-border-color">
            <table className="w-full border-collapse text-[0.95rem] text-text-primary">
              <thead>
                <tr className="bg-bg-primary text-left">
                  <th className="p-3.5 border-b border-border-color font-bold">ID</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Proposta</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Proponente</th>
                  <th className="p-3.5 border-b border-border-color font-bold">Orientador Recomendado</th>
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
                      {s.status === 'EM ANÁLISE' ? (
                        <select className="px-2 py-1.5 border border-border-color rounded bg-bg-primary text-text-primary text-[0.85rem]">
                          <option value="">-- Selecione --</option>
                          {professores.map(prof => (
                            <option key={prof.id} value={prof.id}>{prof.username}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[0.85rem] text-text-secondary">Processado</span>
                      )}
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

    </div>
  );
}
