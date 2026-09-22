import os
import smtplib
import uuid
import requests
from email.mime.text import MIMEText
from models import db, ActivityLog


def get_frontend_url():
    """Retorna a URL base do frontend. Configurável via variável de ambiente APP_URL."""
    return os.environ.get('APP_URL', '').rstrip('/') or ''


def email_template_ativacao(username: str, link: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ative sua conta – SisCPTI</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">SisCPTI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.80);font-size:13px;">Sistema de Gestão do Caderno de Projetos de TI · UniCEUB</p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 44px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1c1c1c;">Olá, {username}! 👋</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
                Obrigado por se cadastrar na plataforma <strong style="color:#4B006E;">SisCPTI</strong>!<br/>
                Sua conta foi criada com sucesso. Para ativá-la e ter acesso completo ao sistema,
                clique no botão abaixo:
              </p>

              <!-- Botão de Ativação -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);">
                    <a href="{link}"
                       style="display:inline-block;padding:16px 40px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:12px;">
                      ✅ Ativar minha conta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caixa de informação -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ff;border-left:4px solid #7A1BB5;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#4B006E;font-weight:600;">⏰ Link válido por 24 horas</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#666666;line-height:1.6;">
                      Se não conseguir clicar no botão, copie e cole o endereço abaixo no seu navegador:
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:#7A1BB5;word-break:break-all;">{link}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">
                Se você não criou uma conta no SisCPTI, pode ignorar este e-mail com segurança.
                Nenhuma ação será tomada.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #eeeeee;padding:20px 44px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                © 2025 UniCEUB · SisCPTI — Sistema de Gestão do Caderno de Projetos de TI<br/>
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def email_template_recuperacao(username: str, link: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperação de Senha – SisCPTI</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">SisCPTI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.80);font-size:13px;">Sistema de Gestão do Caderno de Projetos de TI · UniCEUB</p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px 44px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1c1c1c;">Redefinição de Senha 🔐</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
                Olá, <strong>{username}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta.<br/>
                Clique no botão abaixo para criar uma nova senha:
              </p>

              <!-- Botão de Redefinição -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);">
                    <a href="{link}"
                       style="display:inline-block;padding:16px 40px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:12px;">
                      🔑 Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caixa de informação -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ff;border-left:4px solid #7A1BB5;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#4B006E;font-weight:600;">⏰ Link válido por 1 hora</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#666666;line-height:1.6;">
                      Se não conseguir clicar no botão, copie e cole o endereço abaixo no seu navegador:
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:#7A1BB5;word-break:break-all;">{link}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">
                Se você não solicitou a redefinição de senha, pode ignorar este e-mail.
                Sua senha permanecerá a mesma.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #eeeeee;padding:20px 44px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                © 2025 UniCEUB · SisCPTI — Sistema de Gestão do Caderno de Projetos de TI<br/>
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def upload_file_to_supabase(file):
    # Carrega do ambiente ou usa padrão do usuário se disponível
    supabase_url = os.environ.get('SUPABASE_URL', 'https://uzawtegjjnlqwjswzxrw.supabase.co').strip()
    supabase_key = os.environ.get('SUPABASE_KEY', '').strip()
    supabase_bucket = os.environ.get('SUPABASE_BUCKET', 'uploads').strip()
    
    # Se não configurado a chave do API do Supabase, salva localmente (fallback)
    if not supabase_key:
        return save_file_locally(file)
        
    try:
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4())[:8] + "_" + filename
        
        # Tenta criar o bucket caso nao exista (auto-inicializacao)
        try:
            bucket_headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json"
            }
            bucket_data = {
                "id": supabase_bucket,
                "name": supabase_bucket,
                "public": True
            }
            requests.post(f"{supabase_url}/storage/v1/bucket", headers=bucket_headers, json=bucket_data)
        except Exception:
            pass
            
        # Endpoint REST do Supabase Storage
        url = f"{supabase_url}/storage/v1/object/{supabase_bucket}/{unique_filename}"
        
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": file.content_type or "application/octet-stream"
        }
        
        file.seek(0)
        file_content = file.read()
        
        res = requests.post(url, headers=headers, data=file_content)
        if res.status_code == 200:
            # Retorna URL pública do bucket
            return f"{supabase_url}/storage/v1/object/public/{supabase_bucket}/{unique_filename}"
        else:
            print(f"Erro no Supabase Storage: {res.status_code} - {res.text}")
            file.seek(0)
            return save_file_locally(file)
    except Exception as e:
        print(f"Erro ao enviar arquivo para o Supabase: {e}")
        try:
            file.seek(0)
        except Exception:
            pass
        return save_file_locally(file)

def save_file_locally(file):
    from werkzeug.utils import secure_filename
    import tempfile
    
    filename = secure_filename(file.filename)
    unique_filename = str(uuid.uuid4())[:8] + "_" + filename
    
    if os.environ.get('VERCEL') == '1':
        upload_folder = os.path.join(tempfile.gettempdir(), 'uploads')
    else:
        upload_folder = os.path.join('SISCPTI', 'static', 'img', 'uploads')
        
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        
    save_path = os.path.join(upload_folder, unique_filename)
    file.save(save_path)
    
    return "img/uploads/" + unique_filename

def enviar_email(destinatario, assunto, corpo):
    mail_server = os.environ.get('MAIL_SERVER', '').strip()
    mail_user = os.environ.get('MAIL_USER', '').strip()
    mail_pass = os.environ.get('MAIL_PASS', '').strip()
    try:
        mail_port = int(os.environ.get('MAIL_PORT', '587').strip())
    except Exception:
        mail_port = 587
        
    if not mail_server or not mail_user:
        return False
    try:
        msg = MIMEText(corpo, 'html', 'utf-8')
        msg['Subject'] = assunto
        msg['From'] = mail_user
        msg['To'] = destinatario
        
        if mail_port == 465:
            with smtplib.SMTP_SSL(mail_server, 465) as srv:
                srv.login(mail_user, mail_pass)
                srv.sendmail(mail_user, [destinatario], msg.as_string())
        else:
            with smtplib.SMTP(mail_server, mail_port) as srv:
                srv.starttls()
                srv.login(mail_user, mail_pass)
                srv.sendmail(mail_user, [destinatario], msg.as_string())
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False

def log_atividade(username, acao, detalhes=None):
    try:
        log = ActivityLog(username=username, acao=acao, detalhes=detalhes)
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()
