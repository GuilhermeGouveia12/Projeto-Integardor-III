import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Workspace() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Mensagens');
  const [projeto, setProjeto] = useState<any>(null);
  const [membros, setMembros] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    // Fake fetch to avoid blank screen if API fails
    setProjeto({ titulo: 'Projeto de Teste', owner_username: 'admin', professor: 'João', categoria: 'Frontend', status: 'EM EXECUÇÃO' });
    setMembros(['aluno1', 'aluno2']);
    setMensagens([{ id: 1, username: 'admin', texto: 'Olá equipe!', data_envio: '01/09 10:00' }]);
  }, [id]);

  if (!projeto) return <div className="p-10 text-center">Carregando Workspace...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#e5e5e5]">
      
      {/* SIDEBAR LEFT */}
      <aside className={`w-[260px] bg-bg-surface border-r border-border-color flex flex-col shrink-0 transition-all ${leftOpen ? 'ml-0' : '-ml-[260px]'}`}>
        <div className="p-4 border-b border-border-color">
          <Link to="/perfil" className="inline-block text-purple-primary font-bold text-[0.85rem] mb-4 no-underline hover:underline">
            ← Voltar ao Perfil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-bg-primary border border-border-color rounded-full flex items-center justify-center text-xl shrink-0">👤</div>
            <div className="flex flex-col">
              <span className="font-bold text-[0.95rem] text-text-primary">{user?.username || 'Usuário'}</span>
              <span className="text-[0.75rem] text-text-secondary uppercase tracking-wide">{user?.role || 'Membro'}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col gap-2 overflow-y-auto grow">
          <div className="text-[0.8rem] text-text-secondary font-bold uppercase tracking-wider mb-2 flex justify-between">
            <span>Equipe do Projeto</span>
            <span className="bg-[rgba(122,27,181,0.1)] text-purple-primary px-2 rounded-full">{membros.length + 1}</span>
          </div>
          
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-primary/5 cursor-pointer">
            <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#4f46e5]">
              {projeto.owner_username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[0.9rem] text-text-primary">{projeto.owner_username}</span>
              <span className="text-[0.75rem] text-text-secondary">👑 Dono do Projeto</span>
            </div>
          </div>

          {membros.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-primary/5 cursor-pointer">
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#0d9488]">
                {m.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[0.9rem] text-text-primary">{m}</span>
                <span className="text-[0.75rem] text-text-secondary">👤 Integrante</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MIDDLE CONTENT */}
      <section className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        <div className="h-[60px] bg-bg-surface border-b border-border-color flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setLeftOpen(!leftOpen)} className="bg-transparent border-none text-xl cursor-pointer p-1">👥</button>
            <div className="flex flex-col">
              <h2 className="m-0 font-title text-[1.05rem] font-bold text-text-primary">{projeto.titulo}</h2>
              <p className="m-0 text-[0.75rem] text-text-secondary">Área de Trabalho Integrada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[rgba(122,27,181,0.08)] p-1 rounded-lg">
              {['Mensagens', 'Kanban', 'Métricas', 'Participantes', 'Videochamada'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-none px-4 py-1.5 rounded-md text-[0.85rem] font-bold cursor-pointer transition-colors ${activeTab === tab ? 'bg-bg-surface text-purple-primary shadow-sm' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => setRightOpen(!rightOpen)} className="bg-transparent border-none text-xl cursor-pointer p-1 ml-2">📁</button>
          </div>
        </div>

        {activeTab === 'Mensagens' && (
          <div className="flex flex-col flex-1 relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {mensagens.map(msg => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.username === user?.username ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {msg.username !== user?.username && (
                    <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#db2777] shrink-0 mt-2">
                      {msg.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.username === user?.username ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[0.8rem] text-text-secondary">{msg.username}</span>
                      <span className="text-[0.7rem] text-[#9ca3af]">{msg.data_envio}</span>
                    </div>
                    <div className={`p-3 rounded-2xl ${msg.username === user?.username ? 'bg-gradient-to-br from-purple-primary to-purple-hover text-white rounded-tr-none' : 'bg-bg-surface border border-border-color text-text-primary rounded-tl-none'}`}>
                      <p className="m-0 text-[0.95rem] leading-relaxed">{msg.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[70px] bg-bg-surface border-t border-border-color p-3 flex items-center gap-3">
              <button className="bg-transparent border-none text-2xl cursor-pointer text-text-secondary hover:text-purple-primary">📎</button>
              <input type="text" placeholder="Digite sua mensagem..." className="flex-1 bg-bg-primary border border-border-color rounded-full px-5 py-2.5 outline-none focus:border-purple-primary transition-colors text-[0.95rem] text-text-primary" />
              <button className="bg-purple-primary text-white border-none w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-hover transition-colors shadow-sm">
                ✈️
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'Mensagens' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary">
            <h3 className="font-title text-xl text-purple-primary font-bold">{activeTab}</h3>
            <p className="text-text-secondary">Seção de {activeTab} renderizada aqui (simulação do frontend).</p>
          </div>
        )}
      </section>

      {/* SIDEBAR RIGHT */}
      <aside className={`w-[260px] bg-bg-surface border-l border-border-color flex flex-col shrink-0 transition-all ${rightOpen ? 'mr-0' : '-mr-[260px]'}`}>
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h3 className="m-0 font-title text-[0.95rem] font-bold text-text-primary">Arquivos Compartilhados</h3>
        </div>
        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          <div className="rounded-lg overflow-hidden border border-border-color bg-bg-primary">
            <div className="h-[90px] bg-gradient-to-r from-purple-primary to-blue-500"></div>
            <div className="p-3 text-center">
              <h4 className="m-0 font-bold text-[0.95rem] text-text-primary mb-1">{projeto.titulo}</h4>
              <span className="text-[0.75rem] bg-[rgba(122,27,181,0.08)] text-purple-primary px-2 py-0.5 rounded-full font-bold">{projeto.categoria}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg flex flex-col items-center">
              <span className="text-2xl mb-1">📁</span>
              <span className="font-bold text-lg text-teal-800 leading-none">0</span>
              <span className="text-[0.7rem] text-teal-600 font-bold uppercase tracking-wider">Anexos</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex flex-col items-center">
              <span className="text-2xl mb-1">💬</span>
              <span className="font-bold text-lg text-gray-800 leading-none">1</span>
              <span className="text-[0.7rem] text-gray-600 font-bold uppercase tracking-wider">Mensagens</span>
            </div>
          </div>

          <div>
            <h4 className="font-title text-[0.85rem] text-text-secondary uppercase tracking-wider mb-2">Arquivos Recentes</h4>
            <div className="text-[0.8rem] text-text-secondary italic">Nenhum arquivo enviado.</div>
          </div>
        </div>
      </aside>

    </div>
  );
}
