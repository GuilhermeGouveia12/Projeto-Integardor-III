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
    return Promise.reject(error);
  }
);

