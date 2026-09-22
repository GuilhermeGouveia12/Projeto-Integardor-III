import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Projetos } from './pages/Projetos';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Perfil } from './pages/Perfil';
import { ProjetoDetalhes } from './pages/ProjetoDetalhes';
import { Sobre } from './pages/Sobre';
import { Candidatura } from './pages/Candidatura';
import { Submissao } from './pages/Submissao';
import { Workspace } from './pages/Workspace';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { VerificarConta } from './pages/VerificarConta';
import { AdminDashboard } from './pages/AdminDashboard';
import { CoordenadorDashboard } from './pages/CoordenadorDashboard';
import { PerfilEditar } from './pages/PerfilEditar';
import { SubmissaoEditar } from './pages/SubmissaoEditar';
import { CandidaturaEditar } from './pages/CandidaturaEditar';
import { AdminForm } from './pages/AdminForm';
import { AdminUserForm } from './pages/AdminUserForm';
import { AdminLogs } from './pages/AdminLogs';
import { ErrorPage } from './pages/ErrorPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/perfil/editar" element={<PerfilEditar />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
              <Route path="/verificar-conta/:token" element={<VerificarConta />} />
              <Route path="/submissao" element={<Submissao />} />
              <Route path="/submissao/:id/editar" element={<SubmissaoEditar />} />
              <Route path="/candidatura/:id/editar" element={<CandidaturaEditar />} />
              <Route path="/projeto/:id" element={<ProjetoDetalhes />} />
              <Route path="/projeto/:id/editar" element={<AdminForm />} />
              <Route path="/projeto/:id/candidatar" element={<Candidatura />} />
              <Route path="/workspace/:id" element={<Workspace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/projeto/novo" element={<AdminForm />} />
              <Route path="/admin/projeto/:id/editar" element={<AdminForm />} />
              <Route path="/admin/usuario/novo" element={<AdminUserForm />} />
              <Route path="/admin/usuario/:id/editar" element={<AdminUserForm />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/coordenador" element={<CoordenadorDashboard />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
