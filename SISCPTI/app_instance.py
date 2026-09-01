from flask import Flask
import os
from models import db

import tempfile

base_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(base_dir, 'templates'),
    static_folder=os.path.join(base_dir, 'static')
)
app.secret_key = os.environ.get('SECRET_KEY', 'sisCPTI_secret_key')

db_url = os.environ.get('DATABASE_URL', 'sqlite:///siscpti.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# No Vercel, o sistema de arquivos é apenas leitura (read-only), exceto a pasta /tmp.
if os.environ.get('VERCEL') == '1':
    UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'uploads')
else:
    UPLOAD_FOLDER = os.path.join(base_dir, 'static', 'img', 'uploads')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Configurações do Supabase (para o frontend usar o Realtime)
app.config['SUPABASE_URL'] = os.environ.get('SUPABASE_URL', '')
app.config['SUPABASE_ANON_KEY'] = os.environ.get('SUPABASE_ANON_KEY', '')

# Expõe as variáveis do Supabase para todos os templates Jinja2
@app.context_processor
def inject_supabase_config():
    return {
        'SUPABASE_URL': app.config['SUPABASE_URL'],
        'SUPABASE_ANON_KEY': app.config['SUPABASE_ANON_KEY'],
    }

# Inicializa o banco de dados no app Flask
db.init_app(app)
