const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = path.join(__dirname);

const posts = [
  // Posts individuales (1080x1080)
  { file: 'posts_individuales/post_01_hook.html', out: 'posts_individuales/post_01_hook.jpg' },
  { file: 'posts_individuales/post_02_precio.html', out: 'posts_individuales/post_02_precio.jpg' },
  { file: 'posts_individuales/post_03_entrega.html', out: 'posts_individuales/post_03_entrega.jpg' },
  { file: 'posts_individuales/post_04_para_quien.html', out: 'posts_individuales/post_04_para_quien.jpg' },
  { file: 'posts_individuales/post_05_onboarding.html', out: 'posts_individuales/post_05_onboarding.jpg' },
  { file: 'posts_individuales/post_06_cta.html', out: 'posts_individuales/post_06_cta.jpg' },
  // Carrusel 01
  { file: 'carruseles/carrusel_01_razones/slide_01_cover.html', out: 'carruseles/carrusel_01_razones/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_01_razones/slide_02.html', out: 'carruseles/carrusel_01_razones/slide_02.jpg' },
  { file: 'carruseles/carrusel_01_razones/slide_03.html', out: 'carruseles/carrusel_01_razones/slide_03.jpg' },
  { file: 'carruseles/carrusel_01_razones/slide_04.html', out: 'carruseles/carrusel_01_razones/slide_04.jpg' },
  { file: 'carruseles/carrusel_01_razones/slide_05.html', out: 'carruseles/carrusel_01_razones/slide_05.jpg' },
  { file: 'carruseles/carrusel_01_razones/slide_06_cta.html', out: 'carruseles/carrusel_01_razones/slide_06_cta.jpg' },
  // Carrusel 02
  { file: 'carruseles/carrusel_02_incluye/slide_01_cover.html', out: 'carruseles/carrusel_02_incluye/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_02_incluye/slide_02.html', out: 'carruseles/carrusel_02_incluye/slide_02.jpg' },
  { file: 'carruseles/carrusel_02_incluye/slide_03.html', out: 'carruseles/carrusel_02_incluye/slide_03.jpg' },
  { file: 'carruseles/carrusel_02_incluye/slide_04.html', out: 'carruseles/carrusel_02_incluye/slide_04.jpg' },
  { file: 'carruseles/carrusel_02_incluye/slide_05_cta.html', out: 'carruseles/carrusel_02_incluye/slide_05_cta.jpg' },
  // Carrusel 03
  { file: 'carruseles/carrusel_03_proceso/slide_01_cover.html', out: 'carruseles/carrusel_03_proceso/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_03_proceso/slide_02.html', out: 'carruseles/carrusel_03_proceso/slide_02.jpg' },
  { file: 'carruseles/carrusel_03_proceso/slide_03.html', out: 'carruseles/carrusel_03_proceso/slide_03.jpg' },
  { file: 'carruseles/carrusel_03_proceso/slide_04.html', out: 'carruseles/carrusel_03_proceso/slide_04.jpg' },
  { file: 'carruseles/carrusel_03_proceso/slide_05_cta.html', out: 'carruseles/carrusel_03_proceso/slide_05_cta.jpg' },
  // Carrusel 04
  { file: 'carruseles/carrusel_04_sinweb_conweb/slide_01_cover.html', out: 'carruseles/carrusel_04_sinweb_conweb/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_04_sinweb_conweb/slide_02.html', out: 'carruseles/carrusel_04_sinweb_conweb/slide_02.jpg' },
  { file: 'carruseles/carrusel_04_sinweb_conweb/slide_03.html', out: 'carruseles/carrusel_04_sinweb_conweb/slide_03.jpg' },
  { file: 'carruseles/carrusel_04_sinweb_conweb/slide_04.html', out: 'carruseles/carrusel_04_sinweb_conweb/slide_04.jpg' },
  { file: 'carruseles/carrusel_04_sinweb_conweb/slide_05_cta.html', out: 'carruseles/carrusel_04_sinweb_conweb/slide_05_cta.jpg' },
  // Carrusel 05
  { file: 'carruseles/carrusel_05_faq/slide_01_cover.html', out: 'carruseles/carrusel_05_faq/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_05_faq/slide_02.html', out: 'carruseles/carrusel_05_faq/slide_02.jpg' },
  { file: 'carruseles/carrusel_05_faq/slide_03.html', out: 'carruseles/carrusel_05_faq/slide_03.jpg' },
  { file: 'carruseles/carrusel_05_faq/slide_04.html', out: 'carruseles/carrusel_05_faq/slide_04.jpg' },
  { file: 'carruseles/carrusel_05_faq/slide_05.html', out: 'carruseles/carrusel_05_faq/slide_05.jpg' },
  { file: 'carruseles/carrusel_05_faq/slide_06_cta.html', out: 'carruseles/carrusel_05_faq/slide_06_cta.jpg' },
  // Carrusel 06
  { file: 'carruseles/carrusel_06_combo/slide_01_cover.html', out: 'carruseles/carrusel_06_combo/slide_01_cover.jpg' },
  { file: 'carruseles/carrusel_06_combo/slide_02.html', out: 'carruseles/carrusel_06_combo/slide_02.jpg' },
  { file: 'carruseles/carrusel_06_combo/slide_03.html', out: 'carruseles/carrusel_06_combo/slide_03.jpg' },
  { file: 'carruseles/carrusel_06_combo/slide_04.html', out: 'carruseles/carrusel_06_combo/slide_04.jpg' },
  { file: 'carruseles/carrusel_06_combo/slide_05_cta.html', out: 'carruseles/carrusel_06_combo/slide_05_cta.jpg' },
  // Historias destacadas (1080x1920)
  { file: 'historias_destacadas/faq.html', out: 'historias_destacadas/faq.jpg', w: 1080, h: 1920 },
  { file: 'historias_destacadas/testimonios.html', out: 'historias_destacadas/testimonios.jpg', w: 1080, h: 1920 },
  { file: 'historias_destacadas/quienes_somos.html', out: 'historias_destacadas/quienes_somos.jpg', w: 1080, h: 1920 },
  { file: 'historias_destacadas/para_quien_es.html', out: 'historias_destacadas/para_quien_es.jpg', w: 1080, h: 1920 },
];

(async () => {
  console.log('🚀 Iniciando generación de JPGs...');
  const browser = await puppeteer.launch({ headless: 'new' });

  for (const item of posts) {
    const filePath = path.join(BASE, item.file);
    const outPath = path.join(BASE, item.out);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  No encontrado: ${item.file}`);
      continue;
    }

    const w = item.w || 1080;
    const h = item.h || 1080;

    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle2' });

    // Ocultar instrucciones antes de screenshot
    await page.evaluate(() => {
      const el = document.querySelector('.instructions');
      if (el) el.style.display = 'none';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#0F1419';
      document.body.style.display = 'block';
    });

    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 95,
      clip: { x: 0, y: 0, width: w, height: h }
    });

    await page.close();
    console.log(`✅ ${item.out}`);
  }

  await browser.close();
  console.log('\n🎉 ¡Todos los JPGs generados en la carpeta instagram/');
})();
