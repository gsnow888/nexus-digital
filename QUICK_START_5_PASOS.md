# ⚡ NEXUS DIGITAL - QUICK START (5 PASOS - 2 HORAS)

## 🎯 Objetivo: Tener tu sistema de pagos corriendo en 2 horas

---

## ✅ PASO 1: CREAR CUENTA STRIPE (15 min)

### 1.1 Acceso
- Ve a https://stripe.com/start
- Crea cuenta con email y contraseña
- Completa información básica

### 1.2 Obtener Claves
1. Ve a https://dashboard.stripe.com
2. Haz clic en **Developers** (arriba derecha)
3. Selecciona **API Keys**
4. Copia estas dos claves:

```
STRIPE_PUBLIC_KEY = pk_test_... (empieza con pk_test)
STRIPE_SECRET_KEY = sk_test_... (empieza con sk_test)
```

✅ **Guardadas en archivo de notas**

---

## ✅ PASO 2: CONFIGURAR GMAIL (10 min)

### 2.1 Generar Contraseña de Aplicación
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona: **Correo** → **Windows Computer** (o tu OS)
3. Google genera una contraseña de **16 caracteres**

```
Ejemplo: xxxx xxxx xxxx xxxx
```

✅ **Cópiala exactamente**

### 2.2 Tu Email
Tu email de Gmail es: **[tu_email@gmail.com]**

---

## ✅ PASO 3: CONFIGURAR ARCHIVO .env (5 min)

Descarga `.env.example` de los archivos entregados y renómbralo a `.env`

Dentro, reemplaza:

```env
# STRIPE (de Paso 1)
STRIPE_PUBLIC_KEY=pk_test_[TU_CLAVE_AQUI]
STRIPE_SECRET_KEY=sk_test_[TU_CLAVE_AQUI]
STRIPE_WEBHOOK_SECRET=whsec_[OBTENER ABAJO EN PASO 5]

# EMAIL (de Paso 2)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# WHATSAPP ✅ YA CONFIGURADO
WHATSAPP_NUMBER=+52 443 1009 366

# WEBSITE (cambiar por tu dominio)
WEBSITE_URL=https://tu-dominio.com

# PUERTO
PORT=3000
```

---

## ✅ PASO 4: INSTALAR Y CORRER SERVIDOR (20 min)

### 4.1 Instalar Node.js (si no lo tienes)
- Ve a https://nodejs.org/
- Descarga versión LTS
- Instala

### 4.2 Terminal (en la carpeta de tu proyecto)

```bash
# 1. Instalar dependencias
npm install

# 2. Probar que funciona
npm run dev
```

Deberías ver:
```
🚀 Servidor Nexus Digital corriendo en puerto 3000
📧 Email configurado: tu_email@gmail.com
💬 WhatsApp: +52 443 1009 366
```

✅ **Servidor corriendo**

---

## ✅ PASO 5: CONFIGURAR WEBHOOK STRIPE (10 min)

### 5.1 Si estás en LOCAL (desarrollo)
Descarga ngrok: https://ngrok.com/download

```bash
# En otra terminal
ngrok http 3000
```

Verás algo como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### 5.2 Crear Webhook en Stripe

1. Ve a https://dashboard.stripe.com
2. **Developers** → **Webhooks**
3. Haz clic en **+ Add endpoint**
4. URL del endpoint:
   - Si usas ngrok: `https://abc123.ngrok.io/api/webhook`
   - Si usas dominio real: `https://tu-dominio.com/api/webhook`
5. Selecciona evento: **checkout.session.completed**
6. Crea webhook
7. Ve a **Signing secret** y copia: `whsec_...`

### 5.3 Actualizar .env con webhook secret

```env
STRIPE_WEBHOOK_SECRET=whsec_[COPIA_AQUI]
```

✅ **Webhook configurado**

---

## ✅ PASO 6: PROBAR SISTEMA (20 min)

### 6.1 Tarjeta de Prueba Stripe

```
Número: 4242 4242 4242 4242
Exp: 12/25 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
Nombre: Juan Pérez
```

### 6.2 Abrir Landing Page

1. Abre `NEXUS_landing_upsell.html` en navegador
2. Llena formulario con datos de prueba
3. Haz clic en registrarse
4. Aparece modal: ¿Agregar posts?
5. Haz clic en opción (con o sin posts)
6. Redirige a Stripe
7. Usa tarjeta 4242... y paga

### 6.3 Verificar Email

Deberías recibir email en tu bandeja:
- ✅ Confirmación de pago
- ✅ Detalles del paquete
- ✅ Botón WhatsApp verde con tu número

✅ **¡Sistema funciona!**

---

## 🚀 AHORA: DESPLEGAR A PRODUCCIÓN

### Opción A: Railway (Recomendado - MÁS FÁCIL)

1. Ve a https://railway.app
2. Haz clic en **Start New Project**
3. Conecta tu GitHub
4. Railway detecta automáticamente Node.js
5. Agrega variables de entorno (.env)
6. Deploy automático
7. Railway te da URL: `https://tu-app-random.railway.app`

### Opción B: Heroku

```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Crear app
heroku create nexus-digital

# 4. Agregar variables
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set EMAIL_USER=...
# (repetir para todas las variables)

# 5. Deploy
git push heroku main
```

### Opción C: Render

Similar a Railway, interfaz muy simple.

---

## 🔗 ACTUALIZAR LANDING PAGE

Una vez tengas servidor desplegado:

1. Abre `landing_stripe_integration.html`
2. Busca: `Stripe('pk_test_YOUR_STRIPE_PUBLIC_KEY')`
3. Reemplaza con tu clave pública REAL
4. Busca: `https://tu-dominio.com/api/create-checkout-session`
5. Reemplaza con tu URL de servidor desplegado
6. Copia este código y pégalo al final de `NEXUS_landing_upsell.html` (antes de `</body>`)

---

## 📊 FLUJO FINAL

```
Usuario abre landing
     ↓
Ve cronómetro (⏰ 10:00)
Descuento ROJO ($13k → $4,4k)
     ↓
Llena formulario
     ↓
Modal: ¿Posts? $4,399 o $6,144
     ↓
Clic en opción
     ↓
Redirige a Stripe
     ↓
Paga con tarjeta
     ↓
Stripe confirma
     ↓
Email automático:
✓ Confirmación
✓ Paquete
✓ Botón WhatsApp verde
     ↓
Usuario hace clic
     ↓
Abre WhatsApp contigo
     ↓
✅ ¡VENTA CERRADA!
```

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Crear cuenta Stripe
- [ ] Copiar claves Stripe (pk_test_ y sk_test_)
- [ ] Generar contraseña Gmail
- [ ] Completar archivo .env
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run dev`
- [ ] (Si local) Ejecutar ngrok
- [ ] Crear webhook Stripe
- [ ] Probar con tarjeta 4242...
- [ ] Recibir email de confirmación
- [ ] Desplegar servidor (Railway/Heroku)
- [ ] Actualizar landing page con URL real
- [ ] ¡LANZAR! 🚀

---

## 💬 TU INFORMACIÓN YA CONFIGURADA

```
✅ Nombre: Nexus Digital
✅ WhatsApp: +52 443 1009 366
✅ Branding: Completo (colores, logo, tipografía)
✅ Landing: Profesional con cronómetro
✅ Email: Automático con WhatsApp
✅ Precio: $4,399 web | $6,144 web+posts
✅ Objetivo: 30 clientes en 30 días
```

---

## ❓ PROBLEMAS COMUNES

### "No recibo email"
```
✅ Solución: Verifica contraseña de aplicación Gmail
✅ Solución: Revisa spam/promotiones
✅ Solución: Confirma EMAIL_USER en .env
```

### "Error en Stripe"
```
✅ Solución: Verifica claves (pk_test_, sk_test_)
✅ Solución: Confirma STRIPE_WEBHOOK_SECRET
✅ Solución: Usa tarjeta 4242 para pruebas
```

### "Webhook no funciona"
```
✅ Solución: URL debe ser HTTPS, no HTTP
✅ Solución: Usa ngrok para local
✅ Solución: Verifica que servidor está corriendo
```

---

## 🎊 ¡ESTÁS LISTO PARA LANZAR!

Todo está configurado. Solo necesitas:
1. Crear Stripe (15 min)
2. Configurar Gmail (10 min)
3. Completar .env (5 min)
4. Instalar dependencias (5 min)
5. Correr servidor (2 min)
6. Probar (10 min)
7. Desplegar (30 min)

**TOTAL: ~2 HORAS**

Después, solo promociona tu landing en:
- LinkedIn (principal)
- Instagram
- Facebook
- WhatsApp groups
- Outreach directo

---

## 📞 RECURSOS RÁPIDOS

| Qué | Dónde |
|-----|-------|
| Stripe Dashboard | https://dashboard.stripe.com |
| Gmail Contraseña | https://myaccount.google.com/apppasswords |
| ngrok | https://ngrok.com |
| Railway Deploy | https://railway.app |
| Documentación Stripe | https://stripe.com/docs |

---

## 🚀 ¡VAMOS!

Eres 2 horas de configuración de distancia del sistema más profesional de pagos que jamás haya existido en Nexus Digital.

**Tu número de WhatsApp (+52 443 1009 366) estará en cada email que recibas.**

**Ahora es momento de conquistar el mercado. 💪**

---

*Última actualización: Marzo 2024*  
*Status: ✅ LISTO PARA LANZAR*
