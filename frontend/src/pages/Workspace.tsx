import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TaskItem {
  id: number;
  titulo: string;
  descricao: string;
  status: 'todo' | 'doing' | 'done';
  assigned_username: string;
  deadline: string;
  checklist?: string[];
}

interface MessageItem {
  id: number;
  username: string;
  texto: string;
  arquivo?: string;
  data_envio: string;
}

export function Workspace() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'Mensagens' | 'Kanban' | 'Métricas' | 'Participantes'>('Mensagens');
  const [projeto, setProjeto] = useState<any>(null);
  const [membros, setMembros] = useState<string[]>([]);
  const [mensagens, setMensagens] = useState<MessageItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat message input state
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New task modal/form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitulo, setTaskTitulo] = useState('');
  const [taskDescricao, setTaskDescricao] = useState('');
  const [taskAssigned, setTaskAssigned] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Fetch initial workspace data
  const carregarWorkspace = async () => {
    try {
      setError('');
      const res = await api.get(`/projeto/${id}/workspace`);
      if (res.data.status === 'success' || res.data.projeto) {
        setProjeto(res.data.projeto);
        setMembros(res.data.membros || []);
        setMensagens(res.data.mensagens || []);
      } else {
        setError(res.data.message || 'Erro ao carregar workspace');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao acessar o Workspace do projeto.');
    } finally {
      setLoading(false);
    }
  };

  const carregarTasks = async () => {
    try {
      const res = await api.get(`/projeto/${id}/tasks`);
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar tarefas do Kanban:', err);
    }
  };

  useEffect(() => {
    carregarWorkspace();
    carregarTasks();
  }, [id]);

  // Polling for chat messages every 5 seconds when in Mensagens tab
  useEffect(() => {
    if (activeTab !== 'Mensagens') return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/projeto/${id}/workspace/mensagens`);
        if (Array.isArray(res.data)) {
          setMensagens(res.data);
        }
      } catch (e) {
        // Silent failure on polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'Mensagens') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, activeTab]);

  // Send message
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;

    setEnviando(true);
    try {
      const res = await api.post(`/projeto/${id}/workspace/enviar_ajax`, { texto });
      if (res.data.status === 'success' || res.status === 200) {
        setTexto('');
        // Refresh messages
        const msgRes = await api.get(`/projeto/${id}/workspace/mensagens`);
        if (Array.isArray(msgRes.data)) {
          setMensagens(msgRes.data);
        } else {
          setMensagens(prev => [...prev, {
            id: Date.now(),
            username: user?.username || 'Você',
            texto: texto,
            data_envio: 'Agora'
          }]);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  // Move task status
  const handleMoverTask = async (taskId: number, novoStatus: 'todo' | 'doing' | 'done') => {
    try {
      await api.post(`/projeto/${id}/tasks/${taskId}/mover`, { status: novoStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: novoStatus } : t));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao mover tarefa.');
    }
  };

  // Delete task
  const handleExcluirTask = async (taskId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.post(`/projeto/${id}/tasks/${taskId}/excluir`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir tarefa.');
    }
  };

  // Create task
  const handleCriarTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitulo.trim()) return;

    setCreatingTask(true);
    try {
      const res = await api.post(`/projeto/${id}/tasks/criar`, {
        titulo: taskTitulo,
        descricao: taskDescricao,
        assigned_username: taskAssigned,
        deadline: taskDeadline
      });
      if (res.data.status === 'success' && res.data.task) {
        setTasks(prev => [...prev, res.data.task]);
        setShowNewTaskModal(false);
        setTaskTitulo('');
        setTaskDescricao('');
        setTaskAssigned('');
        setTaskDeadline('');
      } else {
        alert(res.data.error || 'Erro ao criar tarefa');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar tarefa.');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">Carregando Workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] p-6 bg-bg-primary text-center">
        <div className="bg-bg-surface p-8 rounded-2xl shadow-light max-w-md border border-border-color">
          <span className="text-4xl mb-4 block">🔒</span>
          <h3 className="text-xl font-bold font-title text-text-primary mb-2">Acesso Restrito</h3>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            {error || 'Você não tem permissão para acessar o workspace deste projeto.'}
          </p>
          <Link to="/perfil" className="inline-block bg-purple-primary text-white font-bold px-6 py-2.5 rounded-lg no-underline hover:bg-purple-hover transition-colors">
            Voltar ao Perfil
          </Link>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = (projeto.owner_username === user?.username) || (user?.role === 'admin') || (user?.role === 'lider');

  // Filter tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const totalTasks = tasks.length;
  const percentComplete = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg-primary">
      
      {/* SIDEBAR LEFT */}
      <aside className={`w-[260px] bg-bg-surface border-r border-border-color flex flex-col shrink-0 transition-all ${leftOpen ? 'ml-0' : '-ml-[260px]'}`}>
        <div className="p-4 border-b border-border-color">
          <Link to="/perfil" className="inline-block text-purple-primary font-bold text-[0.85rem] mb-4 no-underline hover:underline">
            ← Voltar ao Perfil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-bg-primary border border-border-color rounded-full flex items-center justify-center text-xl shrink-0">
              👤
            </div>
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
          
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-primary/5 transition-colors">
            <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#4f46e5] shrink-0">
              {(projeto.owner_username || 'D').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[0.9rem] text-text-primary truncate">{projeto.owner_username}</span>
              <span className="text-[0.75rem] text-text-secondary">👑 Dono do Projeto</span>
            </div>
          </div>

          {projeto.orientador && (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-primary/5 transition-colors">
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-purple-primary shrink-0">
                {projeto.orientador.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[0.9rem] text-text-primary truncate">{projeto.orientador.username}</span>
                <span className="text-[0.75rem] text-text-secondary">👨‍🏫 Orientador</span>
              </div>
            </div>
          )}

          {membros.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-primary/5 transition-colors">
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#0d9488] shrink-0">
                {m.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[0.9rem] text-text-primary truncate">{m}</span>
                <span className="text-[0.75rem] text-text-secondary">👤 Integrante</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MIDDLE CONTENT */}
      <section className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        <div className="h-[60px] bg-bg-surface border-b border-border-color flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setLeftOpen(!leftOpen)} 
              title="Alternar barra de integrantes"
              className="bg-transparent border-none text-xl cursor-pointer p-1 rounded hover:bg-purple-primary/10 transition-colors"
            >
              👥
            </button>
            <div className="flex flex-col min-w-0">
              <h2 className="m-0 font-title text-[1.05rem] font-bold text-text-primary truncate">{projeto.titulo}</h2>
              <p className="m-0 text-[0.75rem] text-text-secondary">Área de Trabalho Integrada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[rgba(122,27,181,0.08)] p-1 rounded-lg">
              {(['Mensagens', 'Kanban', 'Métricas', 'Participantes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-none px-4 py-1.5 rounded-md text-[0.85rem] font-bold cursor-pointer transition-colors ${activeTab === tab ? 'bg-bg-surface text-purple-primary shadow-sm' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setRightOpen(!rightOpen)} 
              title="Alternar resumo do projeto"
              className="bg-transparent border-none text-xl cursor-pointer p-1 ml-2 rounded hover:bg-purple-primary/10 transition-colors"
            >
              📁
            </button>
          </div>
        </div>

        {/* TAB MENSAGENS */}
        {activeTab === 'Mensagens' && (
          <div className="flex flex-col flex-1 relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {mensagens.length === 0 ? (
                <div className="text-center py-16 text-text-secondary text-sm">
                  💬 Nenhuma mensagem no chat ainda. Seja o primeiro a iniciar a conversa!
                </div>
              ) : (
                mensagens.map((msg, index) => {
                  const isMe = msg.username === user?.username;
                  return (
                    <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      {!isMe && (
                        <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#db2777] shrink-0 mt-1">
                          {(msg.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[0.8rem] text-text-secondary">{msg.username}</span>
                          <span className="text-[0.7rem] text-text-secondary/70">{msg.data_envio}</span>
                        </div>
                        <div className={`p-3.5 rounded-2xl max-w-[500px] break-words ${isMe ? 'bg-purple-primary text-white rounded-tr-none' : 'bg-bg-surface border border-border-color text-text-primary rounded-tl-none shadow-sm'}`}>
                          <p className="m-0 text-[0.95rem] leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                          {msg.arquivo && (
                            <a href={msg.arquivo} target="_blank" rel="noreferrer" className="block mt-2 text-xs underline font-semibold text-white/90">
                              📎 Ver anexo compartilhado
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleEnviarMensagem} className="h-[70px] bg-bg-surface border-t border-border-color p-3 flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Digite sua mensagem para a equipe..." 
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="flex-1 bg-bg-primary border border-border-color rounded-full px-5 py-2.5 outline-none focus:border-purple-primary transition-colors text-[0.95rem] text-text-primary" 
              />
              <button 
                type="submit"
                disabled={enviando || !texto.trim()}
                className="bg-purple-primary text-white border-none w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-hover transition-colors shadow-sm disabled:opacity-50"
                title="Enviar mensagem"
              >
                ✈️
              </button>
            </form>
          </div>
        )}

        {/* TAB KANBAN */}
        {activeTab === 'Kanban' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-title text-xl text-purple-primary font-bold m-0">Quadro Kanban da Equipe</h3>
                <p className="text-text-secondary text-sm m-0">Acompanhe as entregas e tarefas em tempo real.</p>
              </div>
              {isOwnerOrAdmin && (
                <button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="bg-purple-primary text-white border-none px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-purple-hover transition-colors"
                >
                  + Nova Tarefa
                </button>
              )}
            </div>

            {/* KANBAN BOARD COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-[450px]">
              
              {/* COLUNA: A FAZER */}
              <div className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
                  <span className="font-title font-bold text-sm text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                    A Fazer
                  </span>
                  <span className="bg-bg-primary text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {todoTasks.length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {todoTasks.length === 0 ? (
                    <div className="text-xs text-text-secondary italic text-center py-8">Nenhuma tarefa a fazer.</div>
                  ) : (
                    todoTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary border border-border-color rounded-lg p-3.5 shadow-sm hover:border-purple-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="m-0 font-bold text-sm text-text-primary leading-tight">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button onClick={() => handleExcluirTask(task.id)} className="text-text-secondary hover:text-red-500 text-xs bg-transparent border-none cursor-pointer">✕</button>
                          )}
                        </div>
                        {task.descricao && <p className="text-xs text-text-secondary m-0 mb-3 leading-relaxed">{task.descricao}</p>}
                        <div className="flex justify-between items-center text-[0.75rem] text-text-secondary">
                          <span>👤 {task.assigned_username || 'Não atribuído'}</span>
                          {task.deadline && <span>📅 {task.deadline}</span>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border-color flex justify-end">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'doing')}
                            className="bg-transparent border border-purple-primary text-purple-primary px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-purple-primary hover:text-white transition-colors"
                          >
                            Iniciar →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUNA: EM PROGRESSO */}
              <div className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
                  <span className="font-title font-bold text-sm text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                    Em Progresso
                  </span>
                  <span className="bg-bg-primary text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {doingTasks.length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {doingTasks.length === 0 ? (
                    <div className="text-xs text-text-secondary italic text-center py-8">Nenhuma tarefa em progresso.</div>
                  ) : (
                    doingTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary border border-border-color rounded-lg p-3.5 shadow-sm hover:border-purple-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="m-0 font-bold text-sm text-text-primary leading-tight">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button onClick={() => handleExcluirTask(task.id)} className="text-text-secondary hover:text-red-500 text-xs bg-transparent border-none cursor-pointer">✕</button>
                          )}
                        </div>
                        {task.descricao && <p className="text-xs text-text-secondary m-0 mb-3 leading-relaxed">{task.descricao}</p>}
                        <div className="flex justify-between items-center text-[0.75rem] text-text-secondary">
                          <span>👤 {task.assigned_username || 'Não atribuído'}</span>
                          {task.deadline && <span>📅 {task.deadline}</span>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border-color flex justify-between">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'todo')}
                            className="bg-transparent border border-border-color text-text-secondary px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-border-color transition-colors"
                          >
                            ← Voltar
                          </button>
                          <button 
                            onClick={() => handleMoverTask(task.id, 'done')}
                            className="bg-[#28a745] text-white border-none px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            Concluir ✓
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUNA: CONCLUÍDO */}
              <div className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
                  <span className="font-title font-bold text-sm text-text-primary flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    Concluído
                  </span>
                  <span className="bg-bg-primary text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {doneTasks.length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {doneTasks.length === 0 ? (
                    <div className="text-xs text-text-secondary italic text-center py-8">Nenhuma tarefa concluída ainda.</div>
                  ) : (
                    doneTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary border border-border-color rounded-lg p-3.5 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="m-0 font-bold text-sm text-text-primary line-through text-text-secondary leading-tight">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button onClick={() => handleExcluirTask(task.id)} className="text-text-secondary hover:text-red-500 text-xs bg-transparent border-none cursor-pointer">✕</button>
                          )}
                        </div>
                        {task.descricao && <p className="text-xs text-text-secondary m-0 mb-3 leading-relaxed">{task.descricao}</p>}
                        <div className="flex justify-between items-center text-[0.75rem] text-text-secondary">
                          <span>👤 {task.assigned_username || 'Não atribuído'}</span>
                          <span className="text-[#10b981] font-bold">✓ Feito</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-border-color flex justify-start">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'doing')}
                            className="bg-transparent border border-border-color text-text-secondary px-2.5 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-border-color transition-colors"
                          >
                            ← Reabrir
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB MÉTRICAS */}
        {activeTab === 'Métricas' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary">
            <h3 className="font-title text-xl text-purple-primary font-bold mb-4">Métricas do Projeto</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-bg-surface p-5 rounded-xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Total de Tarefas</span>
                <span className="text-3xl font-bold font-title text-text-primary">{totalTasks}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Concluídas</span>
                <span className="text-3xl font-bold font-title text-[#10b981]">{doneTasks.length}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Em Andamento</span>
                <span className="text-3xl font-bold font-title text-[#3b82f6]">{doingTasks.length}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-xs font-bold uppercase tracking-wider block mb-1">Progresso Geral</span>
                <span className="text-3xl font-bold font-title text-purple-primary">{percentComplete}%</span>
              </div>
            </div>

            <div className="bg-bg-surface p-6 rounded-xl border border-border-color shadow-sm mb-6">
              <h4 className="font-title font-bold text-text-primary mb-3">Progresso de Entregas da Equipe</h4>
              <div className="w-full bg-bg-primary h-4 rounded-full overflow-hidden border border-border-color">
                <div 
                  className="bg-purple-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>0% Iniciado</span>
                <span>{percentComplete}% Concluído</span>
                <span>100% Meta</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB PARTICIPANTES */}
        {activeTab === 'Participantes' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary">
            <h3 className="font-title text-xl text-purple-primary font-bold mb-4">Equipe do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-bg-surface p-5 rounded-xl border border-border-color flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-lg">
                  {(projeto.owner_username || 'D').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="m-0 font-bold text-text-primary text-base">{projeto.owner_username}</h4>
                  <span className="text-xs text-purple-primary font-semibold">👑 Criador / Responsável</span>
                </div>
              </div>

              {projeto.orientador && (
                <div className="bg-bg-surface p-5 rounded-xl border border-border-color flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-purple-primary text-white flex items-center justify-center font-bold text-lg">
                    {projeto.orientador.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="m-0 font-bold text-text-primary text-base">{projeto.orientador.username}</h4>
                    <span className="text-xs text-[#28a745] font-semibold">👨‍🏫 Professor Orientador</span>
                  </div>
                </div>
              )}

              {membros.map((m, i) => (
                <div key={i} className="bg-bg-surface p-5 rounded-xl border border-border-color flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-lg">
                    {m.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="m-0 font-bold text-text-primary text-base">{m}</h4>
                    <span className="text-xs text-text-secondary font-medium">🎓 Aluno Integrante</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SIDEBAR RIGHT */}
      <aside className={`w-[260px] bg-bg-surface border-l border-border-color flex flex-col shrink-0 transition-all ${rightOpen ? 'mr-0' : '-mr-[260px]'}`}>
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h3 className="m-0 font-title text-[0.95rem] font-bold text-text-primary">Resumo do Projeto</h3>
        </div>
        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          <div className="rounded-lg overflow-hidden border border-border-color bg-bg-primary">
            <div className="h-[70px] bg-gradient-to-r from-purple-primary to-blue-500"></div>
            <div className="p-3 text-center">
              <h4 className="m-0 font-bold text-[0.95rem] text-text-primary mb-1">{projeto.titulo}</h4>
              <span className="text-[0.75rem] bg-[rgba(122,27,181,0.08)] text-purple-primary px-2 py-0.5 rounded-full font-bold">{projeto.categoria}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-3 rounded-lg flex flex-col items-center">
              <span className="text-2xl mb-1">📋</span>
              <span className="font-bold text-lg text-teal-800 dark:text-teal-300 leading-none">{tasks.length}</span>
              <span className="text-[0.7rem] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Tarefas</span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-3 rounded-lg flex flex-col items-center">
              <span className="text-2xl mb-1">💬</span>
              <span className="font-bold text-lg text-purple-800 dark:text-purple-300 leading-none">{mensagens.length}</span>
              <span className="text-[0.7rem] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Mensagens</span>
            </div>
          </div>

          <div>
            <h4 className="font-title text-[0.85rem] text-text-secondary uppercase tracking-wider mb-2">Sobre</h4>
            <p className="text-xs text-text-secondary leading-relaxed m-0">{projeto.descricao_curta}</p>
          </div>

          <div>
            <h4 className="font-title text-[0.85rem] text-text-secondary uppercase tracking-wider mb-2">Status</h4>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-[rgba(234,88,12,0.1)] text-[#ea580c]">
              {projeto.status}
            </span>
          </div>
        </div>
      </aside>

      {/* MODAL: NOVA TAREFA KANBAN */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-2xl max-w-md w-full p-6 shadow-hover border border-border-color">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title text-lg font-bold text-text-primary m-0">Criar Nova Tarefa</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-text-secondary hover:text-text-primary text-lg bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCriarTask} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Título da Tarefa *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Desenvolver componente do Header" 
                  value={taskTitulo}
                  onChange={(e) => setTaskTitulo(e.target.value)}
                  className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Descrição</label>
                <textarea 
                  rows={3}
                  placeholder="Detalhes ou critérios de aceitação..." 
                  value={taskDescricao}
                  onChange={(e) => setTaskDescricao(e.target.value)}
                  className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Responsável</label>
                  <select 
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple-primary"
                  >
                    <option value="">-- Qualquer --</option>
                    <option value={projeto.owner_username}>{projeto.owner_username} (Dono)</option>
                    {membros.map((m, i) => (
                      <option key={i} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Prazo (Deadline)</label>
                  <input 
                    type="date" 
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewTaskModal(false)}
                  className="bg-transparent border border-border-color text-text-secondary px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-border-color"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creatingTask}
                  className="bg-purple-primary text-white border-none px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-purple-hover disabled:opacity-50"
                >
                  {creatingTask ? 'Criando...' : 'Adicionar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
