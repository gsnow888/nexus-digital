# Deploy Railway y Render

## Variables de entorno

Carga estas variables en Railway o Render:

- `STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `WHATSAPP_NUMBER`
- `WEBSITE_URL`
- `ADMIN_API_KEY`
- `NODE_ENV=production`

## Railway

1. Crea un nuevo proyecto desde tu repo.
2. Railway detectará Node automáticamente por [package.json](/Users/gregoriosc/nexus%20claude%20/package.json).
3. En `Variables`, pega todas las variables de entorno.
4. En `Networking`, copia la URL pública que Railway te asigne.
5. Actualiza `WEBSITE_URL` con esa URL o con tu dominio final.
6. En Stripe, configura el webhook apuntando a:
   `https://TU_DOMINIO_O_URL/api/webhook`
7. Haz una compra de prueba y revisa:
   - `GET /api/health`
   - `GET /api/admin/summary`
   - email de confirmación

## Render

1. Crea un `Web Service` desde tu repo.
2. Render puede usar automáticamente [render.yaml](/Users/gregoriosc/nexus%20claude%20/render.yaml).
3. Si lo configuras manualmente:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
4. Agrega todas las variables de entorno.
5. Copia la URL pública generada por Render.
6. Actualiza `WEBSITE_URL` con esa URL o con tu dominio final.
7. En Stripe, configura el webhook apuntando a:
   `https://TU_DOMINIO_O_URL/api/webhook`

## Verificación final

1. Abre `GET /api/health` y confirma `"ok": true`.
2. Ejecuta una compra de prueba en la landing.
3. Comprueba que el pago aparezca en Stripe.
4. Comprueba que exista registro en `data/leads.json` y `data/payments.json`.
5. Consulta `GET /api/admin/summary` con:

```bash
curl -H "Authorization: Bearer TU_ADMIN_API_KEY" https://TU_DOMINIO_O_URL/api/admin/summary
```

## Nota importante

- La carpeta `data/` sirve para persistencia simple, pero en muchos despliegues PaaS el filesystem no es permanente. Esta versión funciona para pruebas y operación ligera, pero para producción seria conviene mover leads y pagos a una base de datos.
