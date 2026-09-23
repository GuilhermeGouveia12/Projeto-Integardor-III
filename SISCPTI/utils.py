import os
import smtplib
import uuid
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from models import db, ActivityLog


def get_frontend_url():
    """Retorna a URL base do frontend. Configurável via variável de ambiente APP_URL."""
    return os.environ.get('APP_URL', '').rstrip('/') or ''


def email_template_ativacao(username: str, link: str, img_src: str = None, base_url: str = None) -> str:
    if not img_src:
        if base_url and not any(h in base_url for h in ['localhost', '127.0.0.1']):
            img_src = f"{base_url.rstrip('/')}/static/img/mail/authentication.png"
        else:
            img_src = "https://projeto-integardor-ii.vercel.app/static/img/mail/authentication.png"

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ative sua conta – SisCPTI</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
    
    <!-- Top Gradient Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#3B0054 0%,#6A0DAD 50%,#7A1BB5 100%);padding:36px 30px 32px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <div style="display:inline-block;padding:6px 14px;background:rgba(255,255,255,0.15);border-radius:20px;margin-bottom:12px;">
                <span style="color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Plataforma Oficial UniCEUB</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">SisCPTI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:400;">Sistema de Gestão do Caderno de Projetos de TI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Hero Illustration Section -->
    <tr>
      <td align="center" style="padding:32px 30px 12px;background:#ffffff;">
        <img src="{img_src}"
             alt="Autenticação SisCPTI"
             width="240"
             style="display:block;margin:0 auto;width:240px;max-width:100%;height:auto;border:0;outline:none;" />
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding:10px 40px 36px;">
        <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;text-align:center;letter-spacing:-0.3px;">
          Ative sua conta de acesso ✨
        </h2>
        <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;text-align:center;">
          Olá, <strong style="color:#4B006E;">{username}</strong>! 👋<br/>
          Seu cadastro na plataforma <strong style="color:#4B006E;">SisCPTI</strong> foi realizado com sucesso.
          Para validar seu e-mail e liberar seu acesso imediato a projetos, candidaturas e ao Workspace institucional, confirme no botão abaixo:
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);box-shadow:0 4px 16px rgba(122,27,181,0.35);text-align:center;">
                    <a href="{link}"
                       style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:12px;font-family:'Segoe UI',Arial,sans-serif;">
                      ✅ Ativar Minha Conta
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Security / Validity Info Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ff;border-left:4px solid #7A1BB5;border-radius:0 10px 10px 0;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#4B006E;font-weight:700;">⏰ Link válido por 24 horas</p>
              <p style="margin:6px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">
                Caso o botão não funcione, copie e cole o link direto no seu navegador:
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#7A1BB5;word-break:break-all;font-family:monospace;background:#ede4ff;padding:8px 12px;border-radius:6px;">
                {link}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;text-align:center;">
          Se você não solicitou este cadastro no SisCPTI, por favor desconsidere este e-mail. Nenhuma ação será realizada na sua conta.
        </p>
      </td>
    </tr>

    <!-- Institutional Footer -->
    <tr>
      <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:24px 30px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6b7280;">
          Centro Universitário de Brasília – UniCEUB
        </p>
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
          SisCPTI · Caderno de Projetos de TI<br/>
          Este é um e-mail automático gerado pelo sistema. Por favor, não responda.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
"""


def email_template_recuperacao(username: str, link: str, img_src: str = None, base_url: str = None) -> str:
    if not img_src:
        if base_url and not any(h in base_url for h in ['localhost', '127.0.0.1']):
            img_src = f"{base_url.rstrip('/')}/static/img/mail/reset_password.png"
        else:
            img_src = "https://projeto-integardor-ii.vercel.app/static/img/mail/reset_password.png"

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperação de Senha – SisCPTI</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
    
    <!-- Top Gradient Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#3B0054 0%,#6A0DAD 50%,#7A1BB5 100%);padding:36px 30px 32px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <div style="display:inline-block;padding:6px 14px;background:rgba(255,255,255,0.15);border-radius:20px;margin-bottom:12px;">
                <span style="color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Segurança & Acesso UniCEUB</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">SisCPTI</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:400;">Sistema de Gestão do Caderno de Projetos de TI</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Hero Illustration Section -->
    <tr>
      <td align="center" style="padding:32px 30px 12px;background:#ffffff;">
        <img src="{img_src}"
             alt="Recuperação de Senha SisCPTI"
             width="240"
             style="display:block;margin:0 auto;width:240px;max-width:100%;height:auto;border:0;outline:none;" />
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding:10px 40px 36px;">
        <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;text-align:center;letter-spacing:-0.3px;">
          Redefinição de Senha 🔐
        </h2>
        <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;text-align:center;">
          Olá, <strong style="color:#4B006E;">{username}</strong>!<br/>
          Recebemos um pedido para alterar a senha da sua conta no <strong style="color:#4B006E;">SisCPTI</strong>.
          Para cadastrar uma nova senha e retomar suas atividades na plataforma, clique no botão seguro abaixo:
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#4B006E 0%,#7A1BB5 100%);box-shadow:0 4px 16px rgba(122,27,181,0.35);text-align:center;">
                    <a href="{link}"
                       style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:12px;font-family:'Segoe UI',Arial,sans-serif;">
                      🔑 Criar Nova Senha
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Security / Validity Info Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ff;border-left:4px solid #7A1BB5;border-radius:0 10px 10px 0;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#4B006E;font-weight:700;">⏰ Link temporário válido por 1 hora</p>
              <p style="margin:6px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">
                Por motivos de segurança, este link expira automaticamente. Caso o botão não funcione, use o link direto:
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#7A1BB5;word-break:break-all;font-family:monospace;background:#ede4ff;padding:8px 12px;border-radius:6px;">
                {link}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;text-align:center;">
          Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua senha continuará segura e inalterada.
        </p>
      </td>
    </tr>

    <!-- Institutional Footer -->
    <tr>
      <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:24px 30px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6b7280;">
          Centro Universitário de Brasília – UniCEUB
        </p>
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
          SisCPTI · Caderno de Projetos de TI<br/>
          Este é um e-mail automático gerado pelo sistema. Por favor, não responda.
        </p>
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

def enviar_email(destinatario, assunto, corpo, inline_images=None):
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
        if inline_images:
            msg = MIMEMultipart('related')
            msg['Subject'] = assunto
            msg['From'] = mail_user
            msg['To'] = destinatario
            
            alt_part = MIMEMultipart('alternative')
            msg.attach(alt_part)
            alt_part.attach(MIMEText(corpo, 'html', 'utf-8'))
            
            for item in inline_images:
                cid = item.get('cid')
                img_path = item.get('path')
                if img_path and os.path.exists(img_path):
                    with open(img_path, 'rb') as f:
                        img_data = f.read()
                        img_mime = MIMEImage(img_data)
                        img_mime.add_header('Content-ID', f'<{cid}>')
                        img_mime.add_header('Content-Disposition', 'inline', filename=os.path.basename(img_path))
                        msg.attach(img_mime)
        else:
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
