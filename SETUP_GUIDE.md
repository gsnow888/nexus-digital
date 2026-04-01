# 🚀 NEXUS DIGITAL - GUÍA DE INTEGRACIÓN STRIPE + EMAIL + WHATSAPP

## Descripción General

Este sistema integra:
✅ **Stripe** para procesar pagos  
✅ **Nodemailer** para enviar emails de confirmación  
✅ **WhatsApp** con botón directo en el email  
✅ **Webhooks** para validar pagos  

---

## 📋 REQUISITOS PREVIOS

1. **Node.js** v14+ instalado (https://nodejs.org/)
2. **Cuenta Stripe** (https://stripe.com)
3. **Gmail** con contraseña de aplicación
4. **Dominio** con SSL (https://)
5. **Servidor** para alojar (Heroku, Railway, Render, etc.)

---

## ⚙️ PASO 1: CONFIGURAR STRIPE

### 1.1 Crear Cuenta Stripe
1. Ve a https://stripe.com
2. Crea una cuenta o inicia sesión
3. Ve a **Dashboard** → **Developers** → **API Keys**

### 1.2 Obtener Claves
- Copia tu **Publishable Key** (pk_test_...)
- Copia tu **Secret Key** (sk_test_...)

### 1.3 Configurar Webhook
1. Ve a **Developers** → **Webhooks**
2. Haz clic en **Add endpoint**
3. URL: `https://tu-dominio.com/api/webhook`
4. Selecciona eventos: `checkout.session.completed`
5. Copia el **Signing Secret** (whsec_...)

---

## 📧 PASO 2: CONFIGURAR GMAIL

### 2.1 Habilitar Contraseña de Aplicación
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona: **Mail** → **Windows Computer** (o tu dispositivo)
3. Google te generará una contraseña de **16 caracteres**
4. Cópiala (es la que necesitas)

### 2.2 Notas Importantes
- ⚠️ Usa la contraseña de aplicación, NO tu contraseña de Gmail
- El email de origen será el que configuraste

---

## 📱 PASO 3: PREPARAR TU NÚMERO WHATSAPP

Tu número debe estar en formato internacional:
```
❌ INCORRECTO:  4431009366
❌ INCORRECTO:  443 1009 366
✅ CORRECTO:   +52 443 1009 366
✅ CORRECTO:   +524431009366
```

**Tu número es: +52 443 1009 366**

---

## 🛠️ PASO 4: INSTALACIÓN

### 4.1 Clonar/Descargar Archivos
```bash
# Copiar estos archivos en una carpeta:
- nexus_server.js
- package.json
- .env.example (renombrar a .env)
```

### 4.2 Instalar Dependencias
```bash
cd tu_carpeta_nexus
npm install
```

### 4.3 Configurar .env
Copia `.env.example` a `.env` y completa:

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# WhatsApp ✅ YA CONFIGURADO
WHATSAPP_NUMBER=+52 443 1009 366

# Website
WEBSITE_URL=https://tu-dominio.com

# Puerto
PORT=3000
```

---

## 🚀 PASO 5: EJECUTAR SERVIDOR

### Desarrollo (local)
```bash
npm run dev
```
Verás: `🚀 Servidor Nexus Digital corriendo en puerto 3000`

### Producción (Heroku/Railway/etc)
```bash
npm start
```

---

## 🌐 PASO 6: INTEGRAR EN LANDING PAGE

### 6.1 En el `<head>` de tu HTML
```html
<!-- STRIPE LIBRARY -->
<script src="https://js.stripe.com/v3/"></script>
```

### 6.2 Actualizar JavaScript
En el archivo `landing_stripe_integration.html`:
- Reemplaza `pk_test_YOUR_STRIPE_PUBLIC_KEY` con tu clave Stripe
- Reemplaza `https://tu-dominio.com` con tu dominio real

### 6.3 Copiar/Pegar Código
Copia el contenido de `landing_stripe_integration.html` al final de tu landing page (antes de `</body>`)

---

## ✅ PASO 7: FLUJO COMPLETO

```
1. Usuario llena formulario
   ↓
2. Aparece modal de upsell ($4,399 o $6,144)
   ↓
3. Usuario elige opción y hace clic
   ↓
4. Se crea sesión en Stripe
   ↓
5. Redirige a página de pago Stripe
   ↓
6. Usuario paga con tarjeta
   ↓
7. Stripe confirma pago (webhook)
   ↓
8. Servidor envía email de confirmación
   ↓
9. Email incluye botón WhatsApp directo
   ↓
10. ✅ CLIENTE LISTO PARA CONTACTO
```

---

## 🔧 CONFIGURACIÓN DE URLS

### Local (desarrollo)
```
API: http://localhost:3000/api/create-checkout-session
Webhook: http://localhost:3000/api/webhook (usar ngrok)
```

### Producción (ejemplo Heroku)
```
API: https://nexus-digital-app.herokuapp.com/api/create-checkout-session
Webhook: https://nexus-digital-app.herokuapp.com/api/webhook
```

---

## 📧 EMAIL PERSONALIZADO

El email que recibe el cliente incluye:
- ✅ Confirmación de pago
- ✅ Detalles del paquete adquirido
- ✅ Próximos pasos
- ✅ **BOTÓN WHATSAPP DIRECTO** (verde y prominente)
- ✅ Datos de confirmación

---

## 🐛 TROUBLESHOOTING

### Email no se envía
```
❌ Problema: Contraseña incorrecta
✅ Solución: Usa contraseña de APLICACIÓN (16 caracteres), no la de Gmail

❌ Problema: "Less secure app access"
✅ Solución: Habilita contraseña de aplicación en Google
```

### Pago no procesa
```
❌ Problema: Clave Stripe incorrecta
✅ Solución: Usa pk_test para frontend, sk_test para backend

❌ Problema: URL del webhook mal configurada
✅ Solución: Debe ser https://, no http://
```

### Webhook no funciona
```
❌ Problema: No recibe confirmación
✅ Solución: Asegúrate que el servidor está corriendo
✅ Solución: URL en Stripe apunta al endpoint correcto
✅ Solución: Usa `ngrok` si estás en local
```

---

## 🚀 DESPLIEGUE A PRODUCCIÓN

### Opción 1: Heroku
```bash
# 1. Crear cuenta en heroku.com
# 2. Instalar Heroku CLI
# 3. Login
heroku login

# 4. Crear app
heroku create nexus-digital-app

# 5. Establecer variables de entorno
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set EMAIL_USER=...
# ... resto de variables

# 6. Deploy
git push heroku main
```

### Opción 2: Railway (más fácil)
```bash
# 1. Ve a railway.app
# 2. Conecta tu GitHub
# 3. Railway detecta automáticamente package.json
# 4. Agrega variables de entorno en dashboard
# 5. Deploy automático
```

### Opción 3: Render
```bash
# Similar a Railway, muy intuitivo
```

---

## 📞 ENDPOINTS API

### POST `/api/create-checkout-session`
```javascript
// Request
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+52 555 1234 5678",
  "profession": "Abogado",
  "hasUpsell": true
}

// Response
{
  "sessionId": "cs_test_..."
}
```

### POST `/api/webhook`
```
Escucha eventos de Stripe automáticamente
Envía email cuando pago es completado
```

### GET `/api/checkout-session/:sessionId`
```
Verifica estado de una sesión de pago
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Configurar Stripe
2. ✅ Configurar Gmail
3. ✅ Instalar dependencias
4. ✅ Completar .env
5. ✅ Ejecutar servidor
6. ✅ Integrar en landing page
7. ✅ Probar con pago de prueba Stripe
8. ✅ Desplegar a producción
9. ✅ Configurar webhook en Stripe (URL de producción)
10. ✅ ¡LANZAR! 🚀

---

## 💡 NOTAS IMPORTANTES

- **Modo TEST**: pk_test_ y sk_test_ funcionan con tarjeta 4242 4242 4242 4242
- **Modo PRODUCCIÓN**: Necesitas cambiar a pk_live_ y sk_live_ en Stripe
- **Emails**: Solo funciona con Gmail o servicios SMTP configurados
- **WhatsApp**: El botón abre WhatsApp Web del usuario, no es automático
- **Seguridad**: Nunca expongas sk_test o credenciales en el frontend

---

## 🆘 SOPORTE

Si algo no funciona:
1. Revisa los logs del servidor (`npm run dev`)
2. Verifica que todas las variables .env estén correctas
3. Prueba con el webhook de Stripe usando eventos de prueba
4. Usa Postman para testear los endpoints

---

**¡Tu sistema de pagos está listo! 🎉**

Cuando todo funcione:
- Usuarios → Pagan en Stripe → Reciben email → Contactan por WhatsApp
- ¡Conversión 100% automatizada!
