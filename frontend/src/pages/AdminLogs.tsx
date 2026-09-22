import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtroUser, setFiltroUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake load
    setLogs([
      { id: 1, username: 'admin', acao: 'Login', detalhes: 'Logou no sistema', data: '02/09/2026 10:00' },
      { id: 2, username: 'aluno1', acao: 'Criou Projeto', detalhes: 'Projeto X', data: '02/09/2026 10:05' },
      { id: 3, username: 'professor1', acao: 'Aprovou Submissão', detalhes: 'Submissão #4', data: '02/09/2026 10:30' }
    ]);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate filtering by just updating state or refetching
    // api.get(`/admin/logs?user=${filtroUser}`)
  };

  const limparFiltro = () => {
    setFiltroUser('');
  };

  if (loading) return <div className="p-10 text-center">Carregando logs...</div>;

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto py-8">
      
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <Link to="/admin" className="text-purple-primary no-underline text-[0.9rem] font-semibold hover:underline">
            ← Painel Admin
          </Link>
          <h2 className="m-0 mt-1 font-title text-[1.8rem] text-text-primary font-bold">📋 Logs de Atividade</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <input 
            type="text" 
            placeholder="Filtrar por usuário..."
            value={filtroUser}
            onChange={(e) => setFiltroUser(e.target.value)}
            className="px-3.5 py-2 border-[1.5px] border-border-color rounded-lg bg-bg-surface text-text-primary text-[0.9rem] outline-none focus:border-purple-primary transition-colors"
          />
          <button type="submit" className="bg-purple-primary text-white border-none px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-purple-hover transition-colors">
            Filtrar
          </button>
          {filtroUser && (
            <button type="button" onClick={limparFiltro} className="bg-text-secondary text-white border-none px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-text-primary transition-colors">
              Limpar
            </button>
          )}
        </form>
      </div>

      <div className="bg-bg-surface rounded-2xl shadow-light overflow-hidden border border-border-color">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-bg-primary text-text-primary">
              <th className="p-4 border-b border-border-color font-bold">#</th>
              <th className="p-4 border-b border-border-color font-bold">Usuário</th>
              <th className="p-4 border-b border-border-color font-bold">Ação</th>
              <th className="p-4 border-b border-border-color font-bold">Detalhes</th>
              <th className="p-4 border-b border-border-color font-bold">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-text-secondary">
                  Nenhum log encontrado{filtroUser ? ` para "${filtroUser}"` : ''}.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const acaoLower = log.acao.toLowerCase();
                let badgeClass = "bg-bg-primary border border-border-color text-text-secondary";
                if (acaoLower.includes('exclu') || acaoLower.includes('rejeit')) {
                  badgeClass = "bg-[rgba(220,53,69,0.1)] text-[#dc3545] border border-[rgba(220,53,69,0.2)]";
                } else if (acaoLower.includes('aprov') || acaoLower.includes('atualiz') || acaoLower.includes('criou')) {
                  badgeClass = "bg-[rgba(40,167,69,0.1)] text-[#28a745] border border-[rgba(40,167,69,0.2)]";
                }

                return (
                  <tr key={log.id} className="hover:bg-purple-primary/5 transition-colors">
                    <td className="p-4 border-b border-border-color text-[0.85rem] text-text-secondary">{log.id}</td>
                    <td className="p-4 border-b border-border-color text-text-primary font-bold">{log.username}</td>
                    <td className="p-4 border-b border-border-color">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[0.75rem] font-bold uppercase ${badgeClass}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-4 border-b border-border-color text-[0.85rem] text-text-secondary">{log.detalhes || '—'}</td>
                    <td className="p-4 border-b border-border-color text-[0.82rem] text-text-secondary whitespace-nowrap">{log.data}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
