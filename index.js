const puppeteer = require('puppeteer');

const workflow = {
  "name": "My workflow 6",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {
        "options": {}
      },
      "name": "Set",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [
        460,
        220
      ]
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "Set",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "id": 1123
};

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
	await page.setRequestInterception(true);

	page.on('request', (interceptedRequest) => {
    if (interceptedRequest.url().startsWith('https://api.n8n.io/workflows/templates/')) {
			console.log('intercepted');
			interceptedRequest.respond({
				headers: {
					'access-control-allow-origin': '*',
				},
				contentType: 'application/json',
				body: JSON.stringify({id: 1, name: 'test', workflow}),
			});

      return;
    }

    interceptedRequest.continue();
  });

  await page.goto('http://localhost:5678/workflows/templates/1149');

	await page.waitForSelector('div.el-loading-mask', {hidden: true});

  await page.screenshot({ path: 'example.png' });

  // await browser.close();
})();