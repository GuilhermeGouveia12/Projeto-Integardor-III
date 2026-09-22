from flask import Flask
import os
import tempfile
from models import db

base_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    static_folder=os.path.join(base_dir, 'static')
)

try:
    from flask_cors import CORS
    CORS(app, supports_credentials=True)
except ImportError:
    pass

app.secret_key = os.environ.get('SECRET_KEY', 'sisCPTI_secret_key')

db_url = os.environ.get('DATABASE_URL', 'sqlite:///siscpti.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# No Vercel, o sistema de arquivos é apenas leitura (read-only), exceto /tmp.
if os.environ.get('VERCEL') == '1' and db_url.startswith('sqlite'):
    db_url = f"sqlite:///{os.path.join(tempfile.gettempdir(), 'siscpti.db')}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if os.environ.get('VERCEL') == '1':
    UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'uploads')
else:
    UPLOAD_FOLDER = os.path.join(base_dir, 'static', 'img', 'uploads')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configurações do Supabase
app.config['SUPABASE_URL'] = os.environ.get('SUPABASE_URL', '')
app.config['SUPABASE_ANON_KEY'] = os.environ.get('SUPABASE_ANON_KEY', '')

# Inicializa o banco de dados no app Flask
db.init_app(app)
