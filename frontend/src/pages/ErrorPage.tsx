import { Link } from 'react-router-dom';

export function ErrorPage({ code = 404, title = 'Página não encontrada', message = 'Parece que a página que você está procurando não existe ou foi movida. Verifique o endereço ou retorne ao início.' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-bg-primary relative overflow-hidden box-border">
      
      {/* Background orbs */}
      <div className="absolute rounded-full blur-[80px] opacity-20 pointer-events-none w-[500px] h-[500px] bg-[radial-gradient(circle,#7A1BB5,transparent)] -top-[150px] -left-[150px] animate-[floatOrb_8s_ease-in-out_infinite]" />
      <div className="absolute rounded-full blur-[80px] opacity-20 pointer-events-none w-[400px] h-[400px] bg-[radial-gradient(circle,#6366f1,transparent)] -bottom-[100px] -right-[100px] animate-[floatOrb_8s_ease-in-out_infinite_-4s]" />

      <Link to="/" className="mb-8 relative z-10">
        <img src="/static/logoCEUB.png" alt="CEUB" className="h-[45px] opacity-85" />
      </Link>

      <div className="bg-[rgba(255,255,255,0.45)] dark:bg-[rgba(30,27,75,0.35)] backdrop-blur-md border border-[rgba(255,255,255,0.3)] dark:border-[rgba(255,255,255,0.08)] p-12 px-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] w-full max-w-[550px] relative z-10 flex flex-col items-center transition-all">
        
        <div className="text-[3.5rem] mb-2 animate-[bounce_2s_ease-in-out_infinite]">🔍</div>
        
        <p className="font-title text-[clamp(5rem,15vw,9rem)] font-extrabold leading-none bg-gradient-to-br from-purple-primary to-purple-hover bg-clip-text text-transparent m-0 mb-2 tracking-[-4px] animate-[pulse_3s_ease-in-out_infinite]">
          {code}
        </p>
        
        <div className="w-[50px] h-1 bg-gradient-to-br from-purple-primary to-purple-hover rounded-md my-4 mx-auto" />
        
        <h1 className="font-title text-[1.8rem] font-bold text-text-primary m-0 mt-2 mb-2">{title}</h1>
        
        <p className="font-sans text-[0.95rem] text-text-secondary max-w-[420px] leading-[1.6] m-0 mx-auto mt-2 mb-8">
          {message}
        </p>

        <div className="flex gap-4 flex-wrap justify-center w-full">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-br from-[#4B006E] to-[#7A1BB5] text-white border-none rounded-full font-sans text-[0.9rem] font-semibold cursor-pointer transition-all shadow-[0_4px_16px_rgba(122,27,181,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,27,181,0.4)] hover:brightness-110 no-underline"
          >
            🏠 Ir para o Início
          </Link>
          <Link 
            to="/projetos" 
            className="inline-flex items-center gap-2 px-7 py-3 bg-transparent text-[#4B006E] dark:text-[#a855f7] border-2 border-[#4B006E] dark:border-[#a855f7] rounded-full font-sans text-[0.9rem] font-semibold cursor-pointer transition-all hover:bg-purple-primary hover:text-white hover:-translate-y-0.5 no-underline"
          >
            📂 Ver Projetos
          </Link>
        </div>
      </div>
    </div>
  );
}
