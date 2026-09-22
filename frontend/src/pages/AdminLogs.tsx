import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtroUser, setFiltroUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1, userQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get('/admin/logs', {
        params: {
          page: page,
          user: userQuery
        }
      });
      if (res.data.status === 'success') {
        setLogs(res.data.logs || []);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.pages || 1);
        setTotalLogs(res.data.total || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, '');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, filtroUser);
  };

  const limparFiltro = () => {
    setFiltroUser('');
    fetchLogs(1, '');
  };

  return (
    <div className="w-[90%] max-w-[1200px] mx-auto py-8">
      
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <Link to="/admin" className="text-purple-primary no-underline text-[0.9rem] font-semibold hover:underline">
            ← Painel Admin
          </Link>
          <h2 className="m-0 mt-1 font-title text-[1.8rem] text-text-primary font-bold">
            📋 Logs de Atividade do Sistema ({totalLogs})
          </h2>
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary"></div>
        </div>
      ) : (
        <div className="bg-bg-surface rounded-xl shadow-sm overflow-hidden border border-border-color">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-bg-primary text-text-secondary border-b border-border-color text-sm">
                <th className="p-4 font-bold">#</th>
                <th className="p-4 font-bold">Usuário</th>
                <th className="p-4 font-bold">Ação</th>
                <th className="p-4 font-bold">Detalhes</th>
                <th className="p-4 font-bold">Data/Hora</th>
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
                  const acaoLower = (log.acao || '').toLowerCase();
                  let badgeClass = "bg-bg-primary border border-border-color text-text-secondary";
                  if (acaoLower.includes('exclu') || acaoLower.includes('rejeit')) {
                    badgeClass = "bg-[rgba(220,53,69,0.1)] text-[#dc3545] border border-[rgba(220,53,69,0.2)]";
                  } else if (acaoLower.includes('aprov') || acaoLower.includes('atualiz') || acaoLower.includes('criou') || acaoLower.includes('login')) {
                    badgeClass = "bg-[rgba(40,167,69,0.1)] text-[#28a745] border border-[rgba(40,167,69,0.2)]";
                  }

                  return (
                    <tr key={log.id} className="hover:bg-purple-primary/5 transition-colors border-b border-border-color text-sm">
                      <td className="p-4 font-mono text-xs text-text-secondary">#{log.id}</td>
                      <td className="p-4 text-text-primary font-bold">{log.username}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[0.75rem] font-bold uppercase ${badgeClass}`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary">{log.detalhes || '—'}</td>
                      <td className="p-4 text-text-secondary whitespace-nowrap text-xs">{log.data}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-border-color bg-bg-primary text-sm">
              <span className="text-text-secondary">Página {currentPage} de {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => fetchLogs(currentPage - 1, filtroUser)}
                  className="px-3 py-1.5 rounded border border-border-color bg-bg-surface text-text-primary text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => fetchLogs(currentPage + 1, filtroUser)}
                  className="px-3 py-1.5 rounded border border-border-color bg-bg-surface text-text-primary text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
