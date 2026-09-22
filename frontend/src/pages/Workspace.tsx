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
  
  const [activeTab, setActiveTab] = useState<'Mensagens' | 'Kanban' | 'Métricas' | 'Participantes'>('Kanban');
  const [projeto, setProjeto] = useState<any>(null);
  const [membros, setMembros] = useState<string[]>([]);
  const [mensagens, setMensagens] = useState<MessageItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat input
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Modal nova tarefa
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitulo, setTaskTitulo] = useState('');
  const [taskDescricao, setTaskDescricao] = useState('');
  const [taskAssigned, setTaskAssigned] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Carregar dados do workspace
  const carregarWorkspace = async () => {
    try {
      setError('');
      const res = await api.get(`/projeto/${id}/workspace`);
      if (res.data.status === 'success' || res.data.projeto) {
        setProjeto(res.data.projeto);
        setMembros(res.data.membros || []);
        setMensagens(res.data.mensagens || []);
      } else {
        setError(res.data.message || 'Não foi possível carregar os dados do workspace.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao autenticar acesso ao workspace deste projeto.');
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

  // Polling de mensagens no chat
  useEffect(() => {
    if (activeTab !== 'Mensagens') return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/projeto/${id}/workspace/mensagens`);
        if (Array.isArray(res.data)) {
          setMensagens(res.data);
        }
      } catch (e) {
        // Silencioso
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  useEffect(() => {
    if (activeTab === 'Mensagens') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, activeTab]);

  // Enviar mensagem
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;

    setEnviando(true);
    try {
      const res = await api.post(`/projeto/${id}/workspace/enviar_ajax`, { texto });
      if (res.data.status === 'success' || res.status === 200) {
        setTexto('');
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

  // Mover status de tarefa
  const handleMoverTask = async (taskId: number, novoStatus: 'todo' | 'doing' | 'done') => {
    try {
      await api.post(`/projeto/${id}/tasks/${taskId}/mover`, { status: novoStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: novoStatus } : t));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao mover tarefa.');
    }
  };

  // Excluir tarefa
  const handleExcluirTask = async (taskId: number) => {
    if (!window.confirm('Deseja excluir esta tarefa do quadro Kanban?')) return;
    try {
      await api.post(`/projeto/${id}/tasks/${taskId}/excluir`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir tarefa.');
    }
  };

  // Criar tarefa
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
        alert(res.data.error || 'Erro ao registrar tarefa.');
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
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-purple-primary border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-text-secondary">Conectando ao Workspace institucional...</p>
        </div>
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] p-6 bg-bg-primary text-center">
        <div className="bg-bg-surface p-8 rounded-2xl shadow-sm max-w-md border border-border-color space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold font-title text-text-primary">Acesso Restrito ao Projeto</h3>
          <p className="text-text-secondary text-xs leading-relaxed">
            {error || 'Você precisa ser integrante aprovado, orientador ou administrador para visualizar esta área de trabalho.'}
          </p>
          <Link 
            to="/perfil" 
            className="inline-block bg-purple-primary text-white font-bold px-6 py-2 rounded-xl text-xs no-underline hover:bg-purple-hover transition-colors shadow-sm"
          >
            Retornar ao Meu Perfil
          </Link>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = (projeto.owner_username === user?.username) || (user?.role === 'admin') || (user?.role === 'lider');

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const totalTasks = tasks.length;
  const percentComplete = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-bg-primary">
      
      {/* BARRA LATERAL ESQUERDA: EQUIPE DO PROJETO */}
      <aside className={`w-[270px] bg-bg-surface border-r border-border-color flex flex-col shrink-0 transition-all duration-300 z-10 ${leftOpen ? 'ml-0' : '-ml-[270px]'}`}>
        <div className="p-4 border-b border-border-color">
          <Link 
            to="/perfil" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-primary hover:underline mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar ao Perfil</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-primary/10 text-purple-primary flex items-center justify-center font-bold text-sm border border-purple-primary/20 shrink-0">
              {(user?.username || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-text-primary truncate">{user?.username || 'Usuário'}</span>
              <span className="text-[0.65rem] text-text-secondary uppercase tracking-wider font-semibold">{user?.role || 'Membro'}</span>
            </div>
          </div>
        </div>
        
        {/* LISTA DE INTEGRANTES */}
        <div className="p-4 flex flex-col gap-2 overflow-y-auto grow">
          <div className="flex items-center justify-between text-[0.7rem] text-text-secondary font-bold uppercase tracking-wider mb-2">
            <span>Equipe Acadêmica</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-primary/10 text-purple-primary font-bold">
              {membros.length + 1 + (projeto.orientador ? 1 : 0)}
            </span>
          </div>
          
          {/* Dono / Líder */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-primary transition-colors border border-transparent hover:border-border-color">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-purple-primary shrink-0 shadow-sm">
              {(projeto.owner_username || 'D').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-text-primary truncate">{projeto.owner_username}</span>
              <span className="text-[0.65rem] text-purple-primary font-medium">Líder do Projeto</span>
            </div>
          </div>

          {/* Professor Orientador */}
          {projeto.orientador && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-primary transition-colors border border-transparent hover:border-border-color">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-blue-600 shrink-0 shadow-sm">
                {projeto.orientador.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-text-primary truncate">{projeto.orientador.username}</span>
                <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-medium">Professor Orientador</span>
              </div>
            </div>
          )}

          {/* Membros Alunos */}
          {membros.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-primary transition-colors border border-transparent hover:border-border-color">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-emerald-600 shrink-0 shadow-sm">
                {m.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-text-primary truncate">{m}</span>
                <span className="text-[0.65rem] text-text-secondary font-medium">Pesquisador / Integrante</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ÁREA CENTRAL */}
      <section className="flex-1 flex flex-col min-w-0 bg-bg-primary overflow-hidden">
        
        {/* BARRA SUPERIOR DO WORKSPACE */}
        <div className="h-16 bg-bg-surface border-b border-border-color flex items-center justify-between px-4 sm:px-6 shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setLeftOpen(!leftOpen)} 
              title="Alternar painel de equipe"
              className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="m-0 font-title text-sm sm:text-base font-bold text-text-primary truncate">
                {projeto.titulo}
              </h1>
              <div className="flex items-center gap-2 text-[0.7rem] text-text-secondary">
                <span className="px-1.5 py-0.2 rounded bg-bg-primary font-medium text-text-secondary border border-border-color">
                  {projeto.categoria}
                </span>
                <span>•</span>
                <span>{percentComplete}% concluído</span>
              </div>
            </div>
          </div>

          {/* Abas e botão do resumo lateral */}
          <div className="flex items-center gap-2">
            <div className="bg-bg-primary p-1 rounded-xl border border-border-color flex gap-1">
              {(['Kanban', 'Mensagens', 'Métricas', 'Participantes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-none px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeTab === tab 
                      ? 'bg-purple-primary text-white shadow-sm' 
                      : 'bg-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setRightOpen(!rightOpen)} 
              title="Alternar resumo do projeto"
              className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ABA: KANBAN DE TAREFAS */}
        {activeTab === 'Kanban' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-bg-primary flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-title text-lg font-bold text-text-primary m-0">Quadro de Entregas e Tarefas</h2>
                <p className="text-xs text-text-secondary m-0 mt-0.5">Gestão de atividades ágeis e prazos de execução do projeto.</p>
              </div>

              {isOwnerOrAdmin && (
                <button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="inline-flex items-center gap-2 bg-purple-primary text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-purple-hover transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nova Tarefa</span>
                </button>
              )}
            </div>

            {/* COLUNAS KANBAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-[460px]">
              
              {/* COLUNA: A FAZER */}
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="font-title font-bold text-xs text-text-primary tracking-wide uppercase">A Fazer</span>
                  </div>
                  <span className="bg-bg-primary border border-border-color text-text-secondary text-[0.7rem] px-2.5 py-0.5 rounded-full font-bold">
                    {todoTasks.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {todoTasks.length === 0 ? (
                    <div className="text-[0.75rem] text-text-secondary italic text-center py-12">Nenhuma tarefa pendente nesta etapa.</div>
                  ) : (
                    todoTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary border border-border-color rounded-xl p-3.5 shadow-sm hover:border-purple-primary/40 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="m-0 font-bold text-xs text-text-primary leading-snug">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button 
                              onClick={() => handleExcluirTask(task.id)} 
                              title="Excluir tarefa"
                              className="text-text-secondary hover:text-rose-600 text-xs bg-transparent border-none cursor-pointer p-0.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {task.descricao && (
                          <p className="text-[0.75rem] text-text-secondary m-0 mb-3 leading-relaxed line-clamp-3">{task.descricao}</p>
                        )}
                        <div className="flex justify-between items-center text-[0.7rem] text-text-secondary pt-2 border-t border-border-color">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="w-4 h-4 rounded-full bg-purple-primary/10 text-purple-primary flex items-center justify-center text-[0.6rem] font-bold">
                              {(task.assigned_username || 'N').substring(0, 1).toUpperCase()}
                            </span>
                            {task.assigned_username || 'Geral'}
                          </span>
                          {task.deadline && (
                            <span className="inline-flex items-center gap-1 text-[0.65rem] text-amber-600 dark:text-amber-400 font-semibold">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {task.deadline}
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border-color flex justify-end">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'doing')}
                            className="inline-flex items-center gap-1 bg-purple-primary text-white px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold cursor-pointer hover:bg-purple-hover transition-colors shadow-sm"
                          >
                            <span>Iniciar Atividade</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUNA: EM DESENVOLVIMENTO */}
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <span className="font-title font-bold text-xs text-text-primary tracking-wide uppercase">Em Andamento</span>
                  </div>
                  <span className="bg-bg-primary border border-border-color text-text-secondary text-[0.7rem] px-2.5 py-0.5 rounded-full font-bold">
                    {doingTasks.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {doingTasks.length === 0 ? (
                    <div className="text-[0.75rem] text-text-secondary italic text-center py-12">Nenhuma tarefa em execução.</div>
                  ) : (
                    doingTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary border border-border-color rounded-xl p-3.5 shadow-sm hover:border-purple-primary/40 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="m-0 font-bold text-xs text-text-primary leading-snug">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button 
                              onClick={() => handleExcluirTask(task.id)} 
                              title="Excluir tarefa"
                              className="text-text-secondary hover:text-rose-600 text-xs bg-transparent border-none cursor-pointer p-0.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {task.descricao && (
                          <p className="text-[0.75rem] text-text-secondary m-0 mb-3 leading-relaxed line-clamp-3">{task.descricao}</p>
                        )}
                        <div className="flex justify-between items-center text-[0.7rem] text-text-secondary pt-2 border-t border-border-color">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="w-4 h-4 rounded-full bg-purple-primary/10 text-purple-primary flex items-center justify-center text-[0.6rem] font-bold">
                              {(task.assigned_username || 'N').substring(0, 1).toUpperCase()}
                            </span>
                            {task.assigned_username || 'Geral'}
                          </span>
                          {task.deadline && (
                            <span className="inline-flex items-center gap-1 text-[0.65rem] text-blue-600 dark:text-blue-400 font-semibold">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {task.deadline}
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border-color flex justify-between items-center">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'todo')}
                            className="text-text-secondary hover:text-text-primary text-[0.7rem] font-medium bg-transparent border-none cursor-pointer"
                          >
                            ← Recuar
                          </button>
                          <button 
                            onClick={() => handleMoverTask(task.id, 'done')}
                            className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold cursor-pointer hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <span>Concluir</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUNA: CONCLUÍDO */}
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-color">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                    <span className="font-title font-bold text-xs text-text-primary tracking-wide uppercase">Concluído</span>
                  </div>
                  <span className="bg-bg-primary border border-border-color text-text-secondary text-[0.7rem] px-2.5 py-0.5 rounded-full font-bold">
                    {doneTasks.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {doneTasks.length === 0 ? (
                    <div className="text-[0.75rem] text-text-secondary italic text-center py-12">Nenhuma tarefa finalizada até o momento.</div>
                  ) : (
                    doneTasks.map(task => (
                      <div key={task.id} className="bg-bg-primary/70 border border-border-color rounded-xl p-3.5 shadow-sm hover:border-emerald-500/40 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="m-0 font-medium text-xs text-text-secondary line-through leading-snug">{task.titulo}</h4>
                          {isOwnerOrAdmin && (
                            <button 
                              onClick={() => handleExcluirTask(task.id)} 
                              title="Excluir tarefa"
                              className="text-text-secondary hover:text-rose-600 text-xs bg-transparent border-none cursor-pointer p-0.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[0.7rem] text-text-secondary pt-2 border-t border-border-color">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[0.6rem] font-bold">
                              ✓
                            </span>
                            {task.assigned_username || 'Equipe'}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[0.65rem]">Entregue</span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-border-color flex justify-start">
                          <button 
                            onClick={() => handleMoverTask(task.id, 'doing')}
                            className="text-text-secondary hover:text-purple-primary text-[0.7rem] font-medium bg-transparent border-none cursor-pointer"
                          >
                            ↺ Reabrir Tarefa
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

        {/* ABA: CHAT DA EQUIPE */}
        {activeTab === 'Mensagens' && (
          <div className="flex flex-col flex-1 relative overflow-hidden bg-bg-primary">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
              {mensagens.length === 0 ? (
                <div className="flex flex-col items-center justify-center my-auto py-16 text-center text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-purple-primary/10 text-purple-primary flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-title text-sm font-bold text-text-primary m-0">Canal de Comunicação do Projeto</h3>
                  <p className="text-xs text-text-secondary mt-1 max-w-sm">Inicie uma conversa ou compartilhe alinhamentos com a equipe e orientador.</p>
                </div>
              ) : (
                mensagens.map((msg, index) => {
                  const isMe = msg.username === user?.username;
                  return (
                    <div key={msg.id || index} className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-purple-primary shrink-0 shadow-sm mt-1">
                          {(msg.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs text-text-primary">{msg.username}</span>
                          <span className="text-[0.65rem] text-text-secondary">{msg.data_envio}</span>
                        </div>
                        <div className={`p-3.5 rounded-2xl break-words text-xs sm:text-sm leading-relaxed ${
                          isMe 
                            ? 'bg-purple-primary text-white rounded-tr-none shadow-sm' 
                            : 'bg-bg-surface border border-border-color text-text-primary rounded-tl-none shadow-sm'
                        }`}>
                          <p className="m-0 whitespace-pre-wrap">{msg.texto}</p>
                          {msg.arquivo && (
                            <a 
                              href={msg.arquivo} 
                              target="_blank" 
                              rel="noreferrer" 
                              className={`inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold underline ${isMe ? 'text-white' : 'text-purple-primary'}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>Visualizar Anexo</span>
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

            {/* Input de Mensagem */}
            <form onSubmit={handleEnviarMensagem} className="bg-bg-surface border-t border-border-color p-3.5 sm:p-4 flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Escreva uma mensagem para a equipe acadêmica..." 
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="flex-1 bg-bg-primary border border-border-color rounded-xl px-4 py-2.5 outline-none focus:border-purple-primary transition-colors text-xs sm:text-sm text-text-primary" 
              />
              <button 
                type="submit"
                disabled={enviando || !texto.trim()}
                className="inline-flex items-center justify-center bg-purple-primary text-white border-none w-10 h-10 rounded-xl cursor-pointer hover:bg-purple-hover transition-colors shadow-sm disabled:opacity-50 shrink-0"
                title="Enviar mensagem"
              >
                {enviando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ABA: MÉTRICAS E INDICADORES */}
        {activeTab === 'Métricas' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary space-y-6">
            <div>
              <h2 className="font-title text-lg font-bold text-text-primary m-0">Indicadores e Desempenho</h2>
              <p className="text-xs text-text-secondary m-0 mt-0.5">Progresso quantitativo de tarefas e entregáveis do projeto.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-bg-surface p-5 rounded-2xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider block mb-1">Tarefas Registradas</span>
                <span className="text-3xl font-bold font-title text-text-primary">{totalTasks}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-2xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider block mb-1">Entregas Concluídas</span>
                <span className="text-3xl font-bold font-title text-emerald-600 dark:text-emerald-400">{doneTasks.length}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-2xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider block mb-1">Em Andamento</span>
                <span className="text-3xl font-bold font-title text-blue-600 dark:text-blue-400">{doingTasks.length}</span>
              </div>
              <div className="bg-bg-surface p-5 rounded-2xl border border-border-color shadow-sm">
                <span className="text-text-secondary text-[0.7rem] font-bold uppercase tracking-wider block mb-1">Taxa de Conclusão</span>
                <span className="text-3xl font-bold font-title text-purple-primary">{percentComplete}%</span>
              </div>
            </div>

            <div className="bg-bg-surface p-6 rounded-2xl border border-border-color shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-title font-bold text-sm text-text-primary">Evolução Geral das Entregas</h3>
                <span className="text-xs font-bold text-purple-primary">{percentComplete}%</span>
              </div>
              <div className="w-full bg-bg-primary h-3 rounded-full overflow-hidden border border-border-color">
                <div 
                  className="bg-purple-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[0.7rem] text-text-secondary">
                <span>0% Início</span>
                <span>{doneTasks.length} de {totalTasks} concluídas</span>
                <span>100% Meta Final</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA: PARTICIPANTES */}
        {activeTab === 'Participantes' && (
          <div className="flex-1 p-6 overflow-y-auto bg-bg-primary space-y-6">
            <div>
              <h2 className="font-title text-lg font-bold text-text-primary m-0">Quadro de Membros e Responsáveis</h2>
              <p className="text-xs text-text-secondary m-0 mt-0.5">Integrantes alocados na equipe de pesquisa deste projeto.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Dono */}
              <div className="bg-bg-surface p-5 rounded-2xl border border-border-color flex items-center gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-purple-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {(projeto.owner_username || 'D').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="m-0 font-bold text-text-primary text-xs truncate">{projeto.owner_username}</h4>
                  <span className="text-[0.65rem] text-purple-primary font-semibold block mt-0.5">Líder / Criador da Proposta</span>
                </div>
              </div>

              {/* Orientador */}
              {projeto.orientador && (
                <div className="bg-bg-surface p-5 rounded-2xl border border-border-color flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {projeto.orientador.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="m-0 font-bold text-text-primary text-xs truncate">{projeto.orientador.username}</h4>
                    <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">Professor Orientador</span>
                  </div>
                </div>
              )}

              {/* Membros */}
              {membros.map((m, i) => (
                <div key={i} className="bg-bg-surface p-5 rounded-2xl border border-border-color flex items-center gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {m.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="m-0 font-bold text-text-primary text-xs truncate">{m}</h4>
                    <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Aluno Pesquisador</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* BARRA LATERAL DIREITA: RESUMO DO PROJETO */}
      <aside className={`w-[270px] bg-bg-surface border-l border-border-color flex flex-col shrink-0 transition-all duration-300 z-10 ${rightOpen ? 'mr-0' : '-mr-[270px]'}`}>
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h3 className="m-0 font-title text-xs font-bold text-text-primary tracking-wide uppercase">Resumo Institucional</h3>
        </div>

        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          {/* Header Card */}
          <div className="rounded-xl overflow-hidden border border-border-color bg-bg-primary">
            <div className="h-16 bg-purple-primary/10 border-b border-border-color flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="p-3 text-center">
              <h4 className="m-0 font-bold text-xs text-text-primary mb-1">{projeto.titulo}</h4>
              <span className="text-[0.65rem] px-2 py-0.5 rounded-full font-bold bg-purple-primary/10 text-purple-primary">
                {projeto.categoria}
              </span>
            </div>
          </div>
          
          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-bg-primary border border-border-color p-3 rounded-xl flex flex-col items-center text-center">
              <span className="font-bold text-lg text-text-primary leading-none">{tasks.length}</span>
              <span className="text-[0.65rem] text-text-secondary font-semibold uppercase tracking-wider mt-1">Tarefas</span>
            </div>
            <div className="bg-bg-primary border border-border-color p-3 rounded-xl flex flex-col items-center text-center">
              <span className="font-bold text-lg text-purple-primary leading-none">{mensagens.length}</span>
              <span className="text-[0.65rem] text-text-secondary font-semibold uppercase tracking-wider mt-1">Mensagens</span>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="font-title text-[0.7rem] text-text-secondary uppercase tracking-wider font-bold mb-1.5">Sobre a Pesquisa</h4>
            <p className="text-xs text-text-secondary leading-relaxed m-0">{projeto.descricao_curta}</p>
          </div>

          {/* Situação */}
          <div>
            <h4 className="font-title text-[0.7rem] text-text-secondary uppercase tracking-wider font-bold mb-1.5">Situação Operacional</h4>
            <span className="inline-block px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {projeto.status}
            </span>
          </div>
        </div>
      </aside>

      {/* MODAL: NOVA TAREFA KANBAN */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-color">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title text-base font-bold text-text-primary m-0">Cadastrar Nova Tarefa</h3>
              <button 
                onClick={() => setShowNewTaskModal(false)} 
                className="text-text-secondary hover:text-text-primary text-base bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Título da Tarefa *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Desenvolver fluxo de autenticação" 
                  value={taskTitulo}
                  onChange={(e) => setTaskTitulo(e.target.value)}
                  className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-purple-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Descrição e Critérios</label>
                <textarea 
                  rows={3}
                  placeholder="Detalhes da entrega esperada..." 
                  value={taskDescricao}
                  onChange={(e) => setTaskDescricao(e.target.value)}
                  className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-purple-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Atribuir a</label>
                  <select 
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full bg-bg-primary border border-border-color rounded-xl px-2.5 py-2 text-xs text-text-primary outline-none focus:border-purple-primary transition-colors"
                  >
                    <option value="">Qualquer Membro</option>
                    <option value={projeto.owner_username}>{projeto.owner_username} (Líder)</option>
                    {membros.map((m, i) => (
                      <option key={i} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Prazo Limite</label>
                  <input 
                    type="date" 
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-bg-primary border border-border-color rounded-xl px-2.5 py-2 text-xs text-text-primary outline-none focus:border-purple-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-color">
                <button 
                  type="button" 
                  onClick={() => setShowNewTaskModal(false)}
                  className="bg-bg-primary border border-border-color text-text-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creatingTask}
                  className="bg-purple-primary text-white border-none px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingTask ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
