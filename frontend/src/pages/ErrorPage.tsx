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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 bg-bg-primary transition-colors">
      <div className="w-full max-w-4xl bg-bg-surface border border-border-color rounded-md shadow-sm p-8 md:p-12 transition-colors">
        
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Ilustração SVG Institucional */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[340px] md:max-w-[380px] p-2 flex items-center justify-center">
              <img 
                src={errorData.image} 
                alt={`Ilustração do Erro ${errorData.code}`}
                className="w-full h-auto max-h-[320px] object-contain drop-shadow-sm select-none pointer-events-none"
                loading="eager"
              />
            </div>
          </div>

          {/* Conteúdo e Informações do Erro */}
          <div className="w-full md:w-1/2 flex flex-col text-left">
            
            {/* Badge Institucional do Código */}
            <div className="mb-3">
              <span className={`inline-block px-2.5 py-1 text-[11px] font-bold tracking-wider rounded border ${errorData.badgeColor}`}>
                {errorData.badge}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight m-0 mb-3">
              {displayTitle}
            </h1>

            {/* Mensagem Explicativa */}
            <p className="text-sm text-text-secondary leading-relaxed m-0 mb-6 max-w-md">
              {displayMessage}
            </p>

            {/* Ações / Botões Sóbrios */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-border-color">
              {errorData.primaryAction.onClick ? (
                <button
                  type="button"
                  onClick={errorData.primaryAction.onClick}
                  className="py-2.5 px-5 bg-purple-primary hover:bg-purple-hover text-white text-xs font-semibold rounded-md shadow-sm transition-colors text-center cursor-pointer border-none"
                >
                  {errorData.primaryAction.label}
                </button>
              ) : (
                <Link
                  to={errorData.primaryAction.to || '/'}
                  className="py-2.5 px-5 bg-purple-primary hover:bg-purple-hover text-white text-xs font-semibold rounded-md shadow-sm transition-colors text-center no-underline"
                >
                  {errorData.primaryAction.label}
                </Link>
              )}

              {errorData.secondaryAction && (
                <Link
                  to={errorData.secondaryAction.to}
                  className="py-2.5 px-5 bg-transparent border border-border-color hover:border-purple-primary text-text-primary hover:text-purple-primary text-xs font-semibold rounded-md transition-colors text-center no-underline"
                >
                  {errorData.secondaryAction.label}
                </Link>
              )}
            </div>

            {/* Suporte Institucional */}
            <div className="mt-6 pt-4 text-xs text-text-secondary/80 border-t border-border-color/60">
              <p className="m-0">
                Precisa de assistência acadêmica?{' '}
                <Link to="/sobre" className="text-purple-primary hover:text-purple-hover hover:underline font-medium">
                  Consulte as informações institucionais
                </Link>
                .
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

