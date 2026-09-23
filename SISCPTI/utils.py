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


def email_template_ativacao(username: str, link: str, base_url: str = None) -> str:
    # CDN global de alta disponibilidade para imagens em e-mails institucionais
    # Usa jsDelivr / GitHub Raw CDN para evitar bloqueio por 'no-cache' de proxies (Google Image Proxy) e cold starts de serverless
    cdn_base = "https://cdn.jsdelivr.net/gh/GuilhermeGouveia12/Projeto-Integardor-III@main/SISCPTI"
    logo_url = f"{cdn_base}/static/logoCEUB.png"
    img_url = f"{cdn_base}/static/img/mail/authentication.png"

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Comunicado Institucional – UniCEUB</title>
</head>
<body style="margin:0;padding:40px 15px;background:#f0f2f5;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
    
    <!-- Top Accent Bar (CEUB Colors: Purple & Magenta) -->
    <tr>
      <td style="height:5px;background:linear-gradient(90deg, #3A1346 0%, #3A1346 70%, #A2237D 70%, #A2237D 100%);"></td>
    </tr>

    <!-- Institutional Brand Header -->
    <tr>
      <td style="padding:24px 36px 20px;background:#ffffff;border-bottom:1px solid #edf2f7;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" valign="middle">
              <img src="{logo_url}"
                   alt="CEUB - Centro Universitário de Brasília"
                   width="70"
                   height="42"
                   style="height:42px;width:auto;max-height:42px;display:block;border:0;outline:none;" />
            </td>
            <td align="right" valign="middle">
              <div style="text-align:right;">
                <span style="font-size:13px;font-weight:700;color:#3A1346;letter-spacing:0.5px;text-transform:uppercase;display:block;">SisCPTI</span>
                <span style="font-size:11px;color:#64748b;display:block;margin-top:2px;">Caderno de Projetos de TI</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Title Banner -->
    <tr>
      <td style="background:#3A1346;padding:24px 36px;text-align:left;">
        <span style="display:inline-block;padding:3px 10px;background:rgba(162,35,125,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;">
          Comunicado Oficial · Ativação de Acesso
        </span>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
          Confirmação de Cadastro Institucional
        </h1>
        <p style="margin:4px 0 0;color:#e2d9e6;font-size:13px;">
          Centro Universitário de Brasília — Disciplina de Projeto Integrador
        </p>
      </td>
    </tr>

    <!-- Hero Illustration (Direct HTML Image from Global CDN - NOT an Attachment) -->
    <tr>
      <td align="center" style="padding:32px 36px 12px;background:#ffffff;">
        <img src="{img_url}"
             alt="Autenticação de Conta"
             width="220"
             height="220"
             style="display:block;margin:0 auto;width:220px;max-width:100%;height:auto;border:0;outline:none;" />
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:10px 36px 28px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
          Prezado(a) discente/docente <strong style="color:#3A1346;">{username}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569;">
          Informamos que o seu registro na plataforma institucional <strong>SisCPTI (Caderno de Projetos de TI)</strong> do UniCEUB foi iniciado. Para concluir a validação de suas credenciais acadêmicas e habilitar o seu acesso a submissões, candidaturas e ao Workspace do projeto, confirme sua conta no botão abaixo:
        </p>

        <!-- Formal Metadata Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;border-left:4px solid #3A1346;">
          <tr>
            <td style="padding:14px 18px;">
              <table width="100%" cellpadding="3" cellspacing="0" style="font-size:13px;color:#475569;">
                <tr>
                  <td width="130" style="font-weight:600;color:#1e293b;">Sistema:</td>
                  <td>SisCPTI · UniCEUB</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Identificador:</td>
                  <td>{username}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Finalidade:</td>
                  <td>Ativação de Credencial de Acesso</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Validade do Link:</td>
                  <td><span style="color:#059669;font-weight:600;">24 horas</span> (expira automaticamente)</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Formal Institutional Action Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#3A1346;text-align:center;box-shadow:0 3px 10px rgba(58,19,70,0.25);">
                    <a href="{link}"
                       style="display:inline-block;padding:15px 38px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">
                      Confirmar e Ativar Minha Conta
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Fallback Link Section -->
        <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#475569;">
            Caso não consiga utilizar o botão acima, copie e cole o link institucional abaixo no seu navegador:
          </p>
          <p style="margin:0;font-size:12px;color:#3A1346;word-break:break-all;font-family:Consolas,monospace;">
            {link}
          </p>
        </div>

        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
          <strong>Aviso de Segurança:</strong> Caso você não tenha realizado este cadastro institucional no SisCPTI, favor desconsiderar este e-mail. Nenhuma ação será realizada na sua conta.
        </p>
      </td>
    </tr>

    <!-- Formal Institutional Footer -->
    <tr>
      <td style="background:#f8fafc;border-top:1px solid #edf2f7;padding:24px 36px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3A1346;">
          Centro Universitário de Brasília – UniCEUB
        </p>
        <p style="margin:0 0 10px;font-size:12px;color:#64748b;line-height:1.6;">
          SEPN 707/907 - Campus Universitário Darcy Ribeiro, Asa Norte, Brasília - DF, CEP 70790-075<br/>
          Pró-Reitoria de Graduação · Coordenação de Cursos de Tecnologia da Informação
        </p>
        <p style="margin:0;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;">
          Mensagem institucional automática. Este canal não recebe respostas.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
"""


def email_template_recuperacao(username: str, link: str, base_url: str = None) -> str:
    # CDN global de alta disponibilidade para imagens em e-mails institucionais
    # Usa jsDelivr / GitHub Raw CDN para evitar bloqueio por 'no-cache' de proxies (Google Image Proxy) e cold starts de serverless
    cdn_base = "https://cdn.jsdelivr.net/gh/GuilhermeGouveia12/Projeto-Integardor-III@main/SISCPTI"
    logo_url = f"{cdn_base}/static/logoCEUB.png"
    img_url = f"{cdn_base}/static/img/mail/reset_password.png"

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperação de Senha Institucional – UniCEUB</title>
</head>
<body style="margin:0;padding:40px 15px;background:#f0f2f5;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
    
    <!-- Top Accent Bar (CEUB Colors: Purple & Magenta) -->
    <tr>
      <td style="height:5px;background:linear-gradient(90deg, #3A1346 0%, #3A1346 70%, #A2237D 70%, #A2237D 100%);"></td>
    </tr>

    <!-- Institutional Brand Header -->
    <tr>
      <td style="padding:24px 36px 20px;background:#ffffff;border-bottom:1px solid #edf2f7;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" valign="middle">
              <img src="{logo_url}"
                   alt="CEUB - Centro Universitário de Brasília"
                   width="70"
                   height="42"
                   style="height:42px;width:auto;max-height:42px;display:block;border:0;outline:none;" />
            </td>
            <td align="right" valign="middle">
              <div style="text-align:right;">
                <span style="font-size:13px;font-weight:700;color:#3A1346;letter-spacing:0.5px;text-transform:uppercase;display:block;">SisCPTI</span>
                <span style="font-size:11px;color:#64748b;display:block;margin-top:2px;">Segurança & Credenciais</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Title Banner -->
    <tr>
      <td style="background:#3A1346;padding:24px 36px;text-align:left;">
        <span style="display:inline-block;padding:3px 10px;background:rgba(162,35,125,0.4);border:1px solid rgba(255,255,255,0.2);border-radius:4px;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;">
          Segurança da Informação · Redefinição de Senha
        </span>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
          Solicitação de Nova Senha de Acesso
        </h1>
        <p style="margin:4px 0 0;color:#e2d9e6;font-size:13px;">
          Centro Universitário de Brasília — Disciplina de Projeto Integrador
        </p>
      </td>
    </tr>

    <!-- Hero Illustration (Direct HTML Image from Global CDN - NOT an Attachment) -->
    <tr>
      <td align="center" style="padding:32px 36px 12px;background:#ffffff;">
        <img src="{img_url}"
             alt="Redefinição de Senha"
             width="220"
             height="220"
             style="display:block;margin:0 auto;width:220px;max-width:100%;height:auto;border:0;outline:none;" />
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:10px 36px 28px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
          Prezado(a) <strong style="color:#3A1346;">{username}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569;">
          Recebemos uma solicitação para redefinir a credencial de segurança de sua conta na plataforma institucional <strong>SisCPTI (Caderno de Projetos de TI)</strong> do UniCEUB. Para criar uma nova senha e restabelecer o seu acesso seguro, acione o botão abaixo:
        </p>

        <!-- Formal Metadata Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;border-left:4px solid #3A1346;">
          <tr>
            <td style="padding:14px 18px;">
              <table width="100%" cellpadding="3" cellspacing="0" style="font-size:13px;color:#475569;">
                <tr>
                  <td width="130" style="font-weight:600;color:#1e293b;">Sistema:</td>
                  <td>SisCPTI · UniCEUB</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Identificador:</td>
                  <td>{username}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Finalidade:</td>
                  <td>Alteração de Senha de Acesso</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#1e293b;">Validade do Link:</td>
                  <td><span style="color:#dc2626;font-weight:600;">1 hora</span> (expira após utilização)</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Formal Institutional Action Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#3A1346;text-align:center;box-shadow:0 3px 10px rgba(58,19,70,0.25);">
                    <a href="{link}"
                       style="display:inline-block;padding:15px 38px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">
                      Redefinir Minha Senha de Acesso
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Fallback Link Section -->
        <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#475569;">
            Caso não consiga utilizar o botão acima, copie e cole o link seguro abaixo no seu navegador:
          </p>
          <p style="margin:0;font-size:12px;color:#3A1346;word-break:break-all;font-family:Consolas,monospace;">
            {link}
          </p>
        </div>

        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
          <strong>Aviso de Segurança:</strong> Caso você não tenha solicitado a alteração de sua senha, desconsidere este e-mail imediatamente. A sua senha atual continuará protegida e inalterada.
        </p>
      </td>
    </tr>

    <!-- Formal Institutional Footer -->
    <tr>
      <td style="background:#f8fafc;border-top:1px solid #edf2f7;padding:24px 36px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3A1346;">
          Centro Universitário de Brasília – UniCEUB
        </p>
        <p style="margin:0 0 10px;font-size:12px;color:#64748b;line-height:1.6;">
          SEPN 707/907 - Campus Universitário Darcy Ribeiro, Asa Norte, Brasília - DF, CEP 70790-075<br/>
          Pró-Reitoria de Graduação · Coordenação de Cursos de Tecnologia da Informação
        </p>
        <p style="margin:0;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;">
          Mensagem institucional automática. Este canal não recebe respostas.
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
