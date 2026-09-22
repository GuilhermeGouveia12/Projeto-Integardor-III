from flask import jsonify
from app_instance import app

# =========================
# Rotas de Health e Informações
# =========================
@app.route('/api/health')
def health():
    return jsonify({"status": "online", "message": "SisCPTI API operational"})

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
