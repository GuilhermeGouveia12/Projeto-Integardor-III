import { Link, useParams, useSearchParams } from 'react-router-dom';

interface ErrorConfig {
  code: number;
  badge: string;
  badgeColor: string;
  title: string;
  message: string;
  image: string;
  primaryAction: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    to: string;
  };
}

const ERROR_DETAILS: Record<number, ErrorConfig> = {
  401: {
    code: 401,
    badge: 'ERRO 401 · NÃO AUTORIZADO',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-750 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    title: 'Autenticação Necessária',
    message: 'Para acessar esta seção do SisCPTI, é necessário estar autenticado com sua conta institucional ativa ou renovar sua sessão.',
    image: '/static/img/errors/401.svg',
    primaryAction: {
      label: 'Fazer Login Institucional',
      to: '/login'
    },
    secondaryAction: {
      label: 'Ir para o Início',
      to: '/'
    }
  },
  403: {
    code: 403,
    badge: 'ERRO 403 · ACESSO RESTRITO',
    badgeColor: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50',
    title: 'Permissão Insuficiente',
    message: 'Seu perfil de usuário não possui autorização para acessar este recurso. Se você acredita que isto é um engano, consulte o orientador ou coordenador do projeto.',
    image: '/static/img/errors/403.svg',
    primaryAction: {
      label: 'Retornar ao Início',
      to: '/'
    },
    secondaryAction: {
      label: 'Ver Meus Projetos',
      to: '/perfil'
    }
  },
  404: {
    code: 404,
    badge: 'ERRO 404 · NÃO ENCONTRADO',
    badgeColor: 'bg-purple-primary/10 text-purple-primary border-purple-primary/20',
    title: 'Página Não Localizada',
    message: 'O endereço informado não existe em nossos registros ou o conteúdo acadêmico foi remanejado para outro identificador.',
    image: '/static/img/errors/404.svg',
    primaryAction: {
      label: 'Retornar à Página Inicial',
      to: '/'
    },
    secondaryAction: {
      label: 'Explorar Projetos',
      to: '/projetos'
    }
  },
  500: {
    code: 500,
    badge: 'ERRO 500 · FALHA INTERNA',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    title: 'Instabilidade Temporária no Servidor',
    message: 'Identificamos uma intercorrência no processamento interno da requisição. Nossa equipe técnica monitora os registros para restabelecimento imediato.',
    image: '/static/img/errors/500.svg',
    primaryAction: {
      label: 'Recarregar Página',
      onClick: () => window.location.reload()
    },
    secondaryAction: {
      label: 'Retornar ao Início',
      to: '/'
    }
  }
};

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
}

export function ErrorPage({ code: propCode, title: propTitle, message: propMessage }: ErrorPageProps) {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  
  // Resolve o código de erro a partir de props, params de rota (/erro/:code) ou query string (?status=403)
  const resolvedCode = Number(propCode || paramCode || searchParams.get('status') || searchParams.get('code') || 404);
  const errorData = ERROR_DETAILS[resolvedCode] || ERROR_DETAILS[404];

  const displayTitle = propTitle || errorData.title;
  const displayMessage = propMessage || errorData.message;

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between py-6 md:py-12 px-6 sm:px-10 md:px-16 lg:px-24 bg-bg-primary transition-colors">
      
      {/* Barra Superior / Breadcrumb Institucional */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-border-color">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          <Link to="/" className="text-purple-primary hover:text-purple-hover hover:underline">SisCPTI</Link>
          <span>/</span>
          <span>Status HTTP {errorData.code}</span>
        </div>
        <div className="text-[11px] text-text-secondary/70 hidden sm:block">
          Centro Universitário de Brasília · UniCEUB
        </div>
      </div>

      {/* Conteúdo Central em Tela Cheia */}
      <div className="w-full max-w-7xl mx-auto my-auto py-8 md:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
          
          {/* Coluna da Ilustração SVG em Escala Ampla */}
          <div className="lg:col-span-7 flex justify-center order-1 lg:order-1">
            <div className="w-full max-w-[500px] lg:max-w-[620px] flex items-center justify-center">
              <img 
                src={errorData.image} 
                alt={`Ilustração do Erro ${errorData.code}`}
                className="w-full h-auto max-h-[380px] lg:max-h-[460px] object-contain select-none pointer-events-none drop-shadow-sm"
                loading="eager"
              />
            </div>
          </div>

          {/* Coluna de Textos e Ações Institucionais */}
          <div className="lg:col-span-5 flex flex-col text-left order-2 lg:order-2">
            
            {/* Código Numérico em Destaque Tipográfico */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-6xl lg:text-7xl font-black text-purple-primary/25 tracking-tighter leading-none select-none">
                {errorData.code}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-bold tracking-wider rounded border ${errorData.badgeColor}`}>
                {errorData.badge}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight leading-tight m-0 mb-4">
              {displayTitle}
            </h1>

            {/* Mensagem Detalhada */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed m-0 mb-8 max-w-xl">
              {displayMessage}
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border-color">
              {errorData.primaryAction.onClick ? (
                <button
                  type="button"
                  onClick={errorData.primaryAction.onClick}
                  className="py-3 px-6 bg-purple-primary hover:bg-purple-hover text-white text-sm font-semibold rounded-md shadow-sm transition-colors text-center cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{errorData.primaryAction.label}</span>
                </button>
              ) : (
                <Link
                  to={errorData.primaryAction.to || '/'}
                  className="py-3 px-6 bg-purple-primary hover:bg-purple-hover text-white text-sm font-semibold rounded-md shadow-sm transition-colors text-center no-underline flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{errorData.primaryAction.label}</span>
                </Link>
              )}

              {errorData.secondaryAction && (
                <Link
                  to={errorData.secondaryAction.to}
                  className="py-3 px-6 bg-bg-surface hover:bg-bg-primary border border-border-color hover:border-purple-primary text-text-primary hover:text-purple-primary text-sm font-semibold rounded-md transition-colors text-center no-underline"
                >
                  {errorData.secondaryAction.label}
                </Link>
              )}
            </div>

            {/* Links Rápidos Institucionais */}
            <div className="mt-8 pt-6 border-t border-border-color/60 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary mr-2">Acesso rápido:</span>
              <div className="inline-flex flex-wrap gap-x-4 gap-y-1 mt-1 sm:mt-0">
                <Link to="/" className="text-purple-primary hover:text-purple-hover hover:underline">Página Inicial</Link>
                <span>·</span>
                <Link to="/projetos" className="text-purple-primary hover:text-purple-hover hover:underline">Caderno de Projetos</Link>
                <span>·</span>
                <Link to="/sobre" className="text-purple-primary hover:text-purple-hover hover:underline">Sobre o UniCEUB</Link>
                <span>·</span>
                <Link to="/login" className="text-purple-primary hover:text-purple-hover hover:underline">Área de Login</Link>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Faixa Inferior de Apoio */}
      <div className="w-full max-w-7xl mx-auto pt-6 border-t border-border-color text-xs text-text-secondary/70 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="m-0">SisCPTI · Sistema de Gestão do Caderno de Projetos de Tecnologia da Informação</p>
        <p className="m-0">Suporte Institucional: nucleoti@ceub.edu.br</p>
      </div>

    </div>
  );
}


