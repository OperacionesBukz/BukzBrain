// src/services/emailService.ts
/**
 * Servicio para enviar emails usando Brevo API
 * Reemplaza EmailJS con mayor flexibilidad
 */

interface EmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface BrevoEmailParams {
  to: Array<{ email: string; name?: string }>;
  sender: { name: string; email: string };
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
}

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || "noreply@tuempresa.com";
const SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || "Tu Empresa";

/**
 * Envía un email usando Brevo
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!BREVO_API_KEY) {
      throw new Error("VITE_BREVO_API_KEY no está configurada");
    }

    const brevoParams: BrevoEmailParams = {
      to: [{ email: params.to }],
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent,
    };

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(brevoParams),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error de Brevo:", error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error en sendEmail:", error);
    throw error;
  }
}

/**
 * Plantillas HTML para diferentes tipos de solicitudes
 */

export function getVacacionesTemplate(data: {
  solicitante: string;
  cargo: string;
  sede: string;
  documento: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_reingreso: string;
  jefe_inmediato: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Solicitud de Vacaciones</h2>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">Solicitante:</span>
              <span class="value">${data.solicitante}</span>
            </div>
            
            <div class="field">
              <span class="label">Documento:</span>
              <span class="value">${data.documento}</span>
            </div>
            
            <div class="field">
              <span class="label">Cargo:</span>
              <span class="value">${data.cargo}</span>
            </div>
            
            <div class="field">
              <span class="label">Sede:</span>
              <span class="value">${data.sede}</span>
            </div>
            
            <div class="field">
              <span class="label">Jefe Inmediato:</span>
              <span class="value">${data.jefe_inmediato}</span>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <div class="field">
              <span class="label">Fecha de Inicio:</span>
              <span class="value">${data.fecha_inicio}</span>
            </div>
            
            <div class="field">
              <span class="label">Fecha de Finalización:</span>
              <span class="value">${data.fecha_fin}</span>
            </div>
            
            <div class="field">
              <span class="label">Fecha de Reingreso:</span>
              <span class="value">${data.fecha_reingreso}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un email automático. Por favor no responder directamente a este correo.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getCumpleanosTemplate(data: {
  solicitante: string;
  cargo: string;
  sede: string;
  documento: string;
  fecha: string;
  jefe_inmediato: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎂 Solicitud de Reconocimiento de Cumpleaños</h2>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">Solicitante:</span>
              <span class="value">${data.solicitante}</span>
            </div>
            
            <div class="field">
              <span class="label">Documento:</span>
              <span class="value">${data.documento}</span>
            </div>
            
            <div class="field">
              <span class="label">Cargo:</span>
              <span class="value">${data.cargo}</span>
            </div>
            
            <div class="field">
              <span class="label">Sede:</span>
              <span class="value">${data.sede}</span>
            </div>
            
            <div class="field">
              <span class="label">Jefe Inmediato:</span>
              <span class="value">${data.jefe_inmediato}</span>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <div class="field">
              <span class="label">Fecha de Cumpleaños:</span>
              <span class="value">${data.fecha}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un email automático. Por favor no responder directamente a este correo.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
