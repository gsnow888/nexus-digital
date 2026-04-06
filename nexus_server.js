// ============================================
// NEXUS DIGITAL - SERVIDOR DE PAGOS
// ============================================
// npm install express stripe nodemailer dotenv cors body-parser

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const app = express();
const logoPath = path.join(__dirname, 'logo.png');
const hasCheckoutLogo = fs.existsSync(logoPath);
const dataDirectory = path.join(__dirname, 'data');
const leadsFilePath = path.join(dataDirectory, 'leads.json');
const paymentsFilePath = path.join(dataDirectory, 'payments.json');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'NEXUS_landing_upsell.html'));
});

// Middleware
app.use(cors());
app.use((req, res, next) => {
  if (req.path === '/api/webhook') {
    return next();
  }

  return bodyParser.json()(req, res, (jsonError) => {
    if (jsonError) {
      return next(jsonError);
    }

    return bodyParser.urlencoded({ extended: true })(req, res, next);
  });
});

// ============================================
// CONFIGURACIÓN DE EMAIL
// ============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // tu email
    pass: process.env.EMAIL_PASSWORD // contraseña app
  }
});

// ============================================
// VARIABLES DE CONFIGURACIÓN
// ============================================
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+52 443 1009 366';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://nexus-digital.com';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

function ensureDataFile(filePath) {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]\n', 'utf8');
  }
}

function readJsonArray(filePath) {
  ensureDataFile(filePath);

  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error al leer ${filePath}:`, error);
    return [];
  }
}

function writeJsonArray(filePath, items) {
  ensureDataFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n', 'utf8');
}

function appendJsonRecord(filePath, record) {
  const currentItems = readJsonArray(filePath);
  currentItems.push(record);
  writeJsonArray(filePath, currentItems);
}

function createLeadRecord({ name, email, phone, profession, hasUpsell, stage, sessionId }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    profession,
    hasUpsell,
    stage,
    sessionId: sessionId || null
  };
}

function getPublicConfig() {
  return {
    stripePublicKey: STRIPE_PUBLIC_KEY,
    whatsappNumber: WHATSAPP_NUMBER,
    websiteUrl: WEBSITE_URL
  };
}

function getConfigStatus() {
  return {
    stripePublicKey: Boolean(STRIPE_PUBLIC_KEY),
    stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    emailUser: Boolean(process.env.EMAIL_USER),
    emailPassword: Boolean(process.env.EMAIL_PASSWORD),
    websiteUrl: Boolean(WEBSITE_URL),
    whatsappNumber: Boolean(WHATSAPP_NUMBER),
    adminApiKey: Boolean(ADMIN_API_KEY)
  };
}

function getMissingConfig() {
  return Object.entries(getConfigStatus())
    .filter(([, isPresent]) => !isPresent)
    .map(([key]) => key);
}

function getWhatsappLink(message) {
  const normalizedNumber = WHATSAPP_NUMBER.replace(/[^\d]/g, '');
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

function requireAdminApiKey(req, res, next) {
  if (!ADMIN_API_KEY) {
    return res.status(503).json({ error: 'ADMIN_API_KEY no está configurada en el servidor.' });
  }

  const authHeader = req.headers.authorization || '';
  const bearerPrefix = 'Bearer ';
  const providedToken = authHeader.startsWith(bearerPrefix)
    ? authHeader.slice(bearerPrefix.length).trim()
    : '';

  if (providedToken !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  return next();
}

// ============================================
// RUTA 1: CREAR SESIÓN DE PAGO STRIPE
// ============================================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { name, email, phone, profession, hasUpsell } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedProfession = typeof profession === 'string' ? profession.trim() : '';
    const wantsUpsell = hasUpsell === true || hasUpsell === 'true';

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedProfession) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del cliente.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe no está configurado en el servidor.' });
    }

    // Definir precio basado en upsell
    const basePrice = 4399 * 100; // Stripe maneja en centavos
    const upsellPrice = wantsUpsell ? (1745 * 100) : 0;
    const totalPrice = basePrice + upsellPrice;
    const productData = {
      name: 'Página Web Profesional',
      description: wantsUpsell
        ? 'Diseño Web + 15 Posts para Redes'
        : 'Diseño Web + Dominio + Hosting (Año 1)'
    };

    if (hasCheckoutLogo) {
      productData.images = [`${WEBSITE_URL}/logo.png`];
    }

    // Crear sesión Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: productData,
            unit_amount: totalPrice
          },
          quantity: 1
        }
      ],
      customer_email: trimmedEmail,
      metadata: {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        profession: trimmedProfession,
        hasUpsell: String(wantsUpsell)
      },
      success_url: `${WEBSITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${WEBSITE_URL}/cancel`,
      mode: 'payment'
    });

    appendJsonRecord(leadsFilePath, createLeadRecord({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      profession: trimmedProfession,
      hasUpsell: wantsUpsell,
      stage: 'checkout_created',
      sessionId: session.id
    }));

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTA 2: WEBHOOK STRIPE (confirmación de pago)
// ============================================
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Falta STRIPE_WEBHOOK_SECRET en el servidor.');
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Si pago fue exitoso
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { name, email, phone, profession, hasUpsell } = session.metadata;
      const wantsUpsell = hasUpsell === 'true';

      // Enviar email de confirmación
      await enviarEmailConfirmacion(name, email, phone, profession, wantsUpsell);

      appendJsonRecord(paymentsFilePath, {
        id: session.id,
        createdAt: new Date().toISOString(),
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerDetails: session.customer_details || null,
        metadata: session.metadata || {},
        hasUpsell: wantsUpsell
      });

      console.log(`✅ Pago exitoso: ${email}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ============================================
// FUNCIÓN: ENVIAR EMAIL DE CONFIRMACIÓN
// ============================================
async function enviarEmailConfirmacion(name, email, phone, profession, hasUpsell) {
  const whatsappLink = getWhatsappLink('Hola, acabo de comprar mi pagina web en Nexus Digital');

  const packageInfo = hasUpsell
    ? `<strong>✅ Página Web Profesional</strong><br>
       • Diseño profesional y responsivo<br>
       • Dominio + Hosting (Año 1) incluido<br>
       • Formulario de contacto + SEO<br><br>
       <strong>✅ 15 Posts para Redes Sociales</strong><br>
       • LinkedIn, Instagram, Facebook<br>
       • Copywriting optimizado<br>
       • Listos para publicar inmediatamente<br><br>
       <strong>💰 Total: $6,144 MXN</strong>`
    : `<strong>✅ Página Web Profesional</strong><br>
       • Diseño profesional y responsivo<br>
       • Dominio + Hosting (Año 1) incluido<br>
       • Formulario de contacto + SEO<br><br>
       <strong>💰 Total: $4,399 MXN</strong>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pago - Nexus Digital</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background-color: #f8fafc;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #0F1419 0%, #1A202C 100%);
                padding: 32px 24px;
                text-align: center;
            }
            .logo-text {
                color: #00D9FF;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -1px;
                margin: 0;
                font-family: 'Poppins', sans-serif;
            }
            .content {
                padding: 40px 32px;
            }
            .success-badge {
                text-align: center;
                margin-bottom: 24px;
                font-size: 48px;
            }
            .greeting {
                font-size: 20px;
                color: #0F1419;
                font-weight: 700;
                margin-bottom: 16px;
                font-family: 'Poppins', sans-serif;
            }
            .body-text {
                font-size: 14px;
                line-height: 1.8;
                color: #64748B;
                margin-bottom: 20px;
            }
            .package-box {
                background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%);
                border: 1px solid #00D9FF;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
            }
            .package-title {
                font-weight: 700;
                color: #0F1419;
                margin-bottom: 8px;
            }
            .package-content {
                font-size: 13px;
                color: #64748B;
            }
            .whatsapp-section {
                background: #25D366;
                color: white;
                padding: 24px;
                border-radius: 8px;
                text-align: center;
                margin: 32px 0;
            }
            .whatsapp-text {
                font-size: 14px;
                margin-bottom: 16px;
                line-height: 1.6;
            }
            .whatsapp-button {
                display: inline-block;
                background: white;
                color: #25D366;
                padding: 12px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .whatsapp-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .next-steps {
                background: #f8fafc;
                border-left: 4px solid #00D9FF;
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
            }
            .next-steps-title {
                font-weight: 700;
                color: #0F1419;
                margin-bottom: 12px;
            }
            .step {
                font-size: 13px;
                color: #64748B;
                padding: 8px 0;
                padding-left: 24px;
                position: relative;
            }
            .step:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #39FF14;
                font-weight: 700;
            }
            .footer {
                background-color: #0F1419;
                color: #ffffff;
                padding: 24px;
                text-align: center;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
            }
            .footer-text {
                margin: 8px 0;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- HEADER -->
            <div class="header">
                <p class="logo-text">◇ NEXUS DIGITAL</p>
            </div>

            <!-- CONTENT -->
            <div class="content">
                <div class="success-badge">✅</div>
                
                <p class="greeting">¡Felicidades ${name}!</p>
                
                <p class="body-text">
                    Tu pago fue procesado correctamente. Estamos muy emocionados de trabajar contigo en tu transformación digital.
                </p>

                <!-- PACKAGE INFO -->
                <div class="package-box">
                    <div class="package-title">Paquete Adquirido</div>
                    <div class="package-content">
                        ${packageInfo}
                    </div>
                </div>

                <p class="body-text">
                    <strong>Próximos pasos:</strong>
                </p>

                <div class="next-steps">
                    <div class="next-steps-title">¿Qué sucede ahora?</div>
                    <div class="step">Te contactamos para agendar tu onboarding</div>
                    <div class="step">Onboarding exprés: llamada de menos de 20 minutos</div>
                    <div class="step">Al día siguiente recibes tu página web lista</div>
                    <div class="step">Revisión y ajustes finales</div>
                    <div class="step">¡Tu página está publicada!</div>
                </div>

                <!-- WHATSAPP CTA -->
                <div class="whatsapp-section">
                    <div class="whatsapp-text">
                        <strong>¿No quieres esperar?</strong><br>
                        Contáctanos por WhatsApp para agilizar el proceso
                    </div>
                    <a href="${whatsappLink}" class="whatsapp-button">💬 Enviar Mensaje en WhatsApp</a>
                </div>

                <!-- CONFIRMATION DETAILS -->
                <p class="body-text" style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
                    <strong>Datos de tu Registro:</strong><br>
                    📧 Email: ${email}<br>
                    📱 Teléfono: ${phone}<br>
                    💼 Profesión: ${profession}<br>
                </p>

                <p class="body-text" style="font-size: 12px; color: #a1a5b1; margin-top: 24px;">
                    <em>Si tienes preguntas, responde a este email o contáctanos por WhatsApp. ¡Estamos aquí para ayudarte!</em>
                </p>
            </div>

            <!-- FOOTER -->
            <div class="footer">
                <p class="footer-text">
                    © 2024 Nexus Digital. Todos los derechos reservados.
                </p>
                <p class="footer-text">
                    Equipo Nexus Digital<br>
                    ${WHATSAPP_NUMBER}
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Pago Confirmado - Nexus Digital',
      html: htmlContent
    });

    console.log(`📧 Email enviado a ${email}`);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

// ============================================
// RUTA 3: VERIFICAR SESIÓN DE PAGO
// ============================================
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config', (_req, res) => {
  res.json(getPublicConfig());
});

app.get('/api/health', (_req, res) => {
  const missingConfig = getMissingConfig();
  const payload = {
    ok: missingConfig.length === 0,
    timestamp: new Date().toISOString(),
    config: getConfigStatus(),
    storage: {
      dataDirectory,
      leadsFilePath,
      paymentsFilePath
    }
  };

  if (missingConfig.length > 0) {
    return res.status(503).json({
      ...payload,
      missingConfig
    });
  }

  return res.json(payload);
});

app.get('/api/admin/summary', requireAdminApiKey, (_req, res) => {
  const leads = readJsonArray(leadsFilePath);
  const payments = readJsonArray(paymentsFilePath);
  const paidRevenue = payments.reduce((sum, payment) => {
    return sum + (typeof payment.amountTotal === 'number' ? payment.amountTotal : 0);
  }, 0);

  res.json({
    leads: leads.length,
    payments: payments.length,
    revenueMxn: paidRevenue / 100,
    latestLead: leads[leads.length - 1] || null,
    latestPayment: payments[payments.length - 1] || null
  });
});

// ============================================
// RUTA: PÁGINA DE ÉXITO
// ============================================
app.get('/success', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Pago Exitoso! - Nexus Digital</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; font-family: 'Inter', sans-serif; background: #0F1419; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1A202C; border: 1px solid rgba(0,217,255,0.2); border-radius: 16px; padding: 48px 40px; max-width: 500px; text-align: center; }
    .icon { font-size: 64px; margin-bottom: 24px; }
    h1 { font-family: 'Poppins', sans-serif; color: #00D9FF; font-size: 28px; margin-bottom: 16px; }
    p { color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 12px; }
    .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>¡Pago Exitoso!</h1>
    <p>Tu compra fue procesada correctamente.</p>
    <p>Revisa tu correo — te enviamos una confirmación con todos los detalles de tu pedido.</p>
    <p>Nos pondremos en contacto en las próximas <strong>24 horas</strong> para comenzar con tu proyecto.</p>
    <a href="${getWhatsappLink('Hola, acabo de comprar mi pagina web en Nexus Digital')}" class="whatsapp-btn">💬 Contactar por WhatsApp</a>
  </div>
</body>
</html>`);
});

app.get('/cancel', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Cancelado - Nexus Digital</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; font-family: 'Inter', sans-serif; background: #0F1419; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1A202C; border: 1px solid rgba(0,217,255,0.2); border-radius: 16px; padding: 48px 40px; max-width: 500px; text-align: center; }
    h1 { font-family: 'Poppins', sans-serif; color: #00D9FF; font-size: 28px; margin-bottom: 16px; }
    p { color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 12px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%); color: #0F1419; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Pago Cancelado</h1>
    <p>No se realizó ningún cobro.</p>
    <p>Si quieres, puedes volver a la landing y retomar el proceso cuando estés listo.</p>
    <a href="/" class="cta">Volver a la oferta</a>
  </div>
</body>
</html>`);
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en la solicitud.' });
  }

  return res.status(500).json({ error: 'Error interno del servidor.' });
});

// ============================================
// PUERTO
// ============================================
const PORT = process.env.PORT || 3000;
ensureDataFile(leadsFilePath);
ensureDataFile(paymentsFilePath);

app.listen(PORT, () => {
  const missingConfig = getMissingConfig();
  console.log(`🚀 Servidor Nexus Digital corriendo en puerto ${PORT}`);
  console.log(`📧 Email configurado: ${process.env.EMAIL_USER}`);
  console.log(`💬 WhatsApp: ${WHATSAPP_NUMBER}`);
  console.log(`🗂️  Data dir: ${dataDirectory}`);

  if (missingConfig.length > 0) {
    console.warn(`⚠️  Configuración faltante: ${missingConfig.join(', ')}`);
  }
});
