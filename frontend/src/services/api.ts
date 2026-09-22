import axios from 'axios';

// Cria uma instância do axios configurada para o nosso backend Flask
export const api = axios.create({
  // No Vercel ou local, as chamadas /api baterão no Flask devido ao vercel.json
  // No dev mode do Vite, precisamos configurar um proxy no vite.config.ts
  baseURL: '/api',
  withCredentials: true, // Importante para enviar os cookies da sessão do Flask
});

// Interceptador para lidar com respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config ? error.config.url : '';

    // Ignora endpoints de sondagem e auth inicial para evitar redirecionamento em loop
    const isAuthProbe = url?.includes('/me') || url?.includes('/login') || url?.includes('/notificacoes');

    if (!isAuthProbe) {
      if (status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/401')) {
        // Redireciona para a tela de erro 401
        window.location.href = '/401';
      } else if (status === 403 && !window.location.pathname.startsWith('/403')) {
        // Redireciona para a tela de erro 403
        window.location.href = '/403';
      }
    }

    return Promise.reject(error);
  }
);
