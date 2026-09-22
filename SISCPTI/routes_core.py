from flask import jsonify, send_from_directory, abort
import os
from app_instance import app, base_dir

dist_dir = os.path.join(base_dir, 'dist')

# =========================
# Rotas de Assets Compilados (React)
# =========================
@app.route('/assets/<path:path>')
def serve_react_assets(path):
    assets_dir = os.path.join(dist_dir, 'assets')
    if os.path.exists(os.path.join(assets_dir, path)):
        return send_from_directory(assets_dir, path)
    abort(404)

# =========================
# Rotas de Health e Informações
# =========================
@app.route('/api/health')
def health():
    return jsonify({"status": "online", "message": "SisCPTI API operational"})

# =========================
# Rota Principal e SPA Fallback (React)
# =========================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # Nunca intercepta rotas que comecem com api ou static
    if path.startswith('api') or path.startswith('static'):
        abort(404)
        
    # Se o arquivo existir dentro de dist (ex: favicon, manifesto), serve direto
    target = os.path.join(dist_dir, path)
    if path != "" and os.path.exists(target):
        return send_from_directory(dist_dir, path)
        
    # Para qualquer rota SPA (/projetos, /sobre, /login, etc.), serve o index.html compilado do React
    if os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
        
    return jsonify({"status": "error", "message": "Frontend build não encontrado"}), 404

# =========================
# Handlers de Erro JSON
# =========================
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"status": "error", "message": "Endpoint não encontrado"}), 404

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"status": "error", "message": "Acesso negado"}), 403

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"status": "error", "message": "Erro interno do servidor"}), 500
