const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5678/workflow/5555');

	await page.waitForSelector('div.el-loading-mask', {hidden: true});

  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();