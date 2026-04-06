# NEXUS DIGITAL - CHECKLIST DE PRODUCCION

## Antes de subir

- Completa [`.env.example`](/Users/gregoriosc/nexus%20claude%20/.env.example) como `.env` con `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `EMAIL_USER`, `EMAIL_PASSWORD`, `WEBSITE_URL` y `ADMIN_API_KEY`.
- Verifica que `WEBSITE_URL` apunte al dominio final con `https://`.
- Confirma que el webhook de Stripe use exactamente `/api/webhook`.
- Si vas a usar imagen en Checkout, agrega `logo.png` en la raíz del proyecto.

## Pruebas mínimas

- Abre `GET /api/health` y confirma que responda `"ok": true`.
- Envía una compra de prueba con Stripe y revisa que se cree el checkout.
- Completa un pago de prueba y valida:
  - email recibido,
  - redirección a `/success`,
  - registro en `data/payments.json`.
- Verifica que `data/leads.json` registre intentos de checkout.

## Operación

- Consulta `GET /api/admin/summary` con header `Authorization: Bearer TU_ADMIN_API_KEY`.
- No subas `.env` ni la carpeta `data/` al repositorio.
- Si despliegas en Railway/Render/Heroku, carga las variables de entorno en el panel del servicio.
- Revisa logs del servidor después del primer pago real.
