const router = require('express').Router();
const uuid = require('uuid');
const path = require('path');

const puppeteer = require('puppeteer');
const uploader = require('./uploader');
const browser = puppeteer.launch({
	headless: true,
	args: [`--window-size=1920,1080`, '--no-sandbox', '--disable-setuid-sandbox'],
	defaultViewport: {
		width:1920,
		height:1080,
		deviceScaleFactor: 2,
	}
});

const cache = {};

const asyncWrap = fn =>
  function asyncUtilWrap (req, res, next, ...args) {
    const fnReturn = fn(req, res, next, ...args)
    return Promise.resolve(fnReturn).catch(next)
  }

router.post('/capture', asyncWrap(async (req, res, next) => {
	const workflow = req.body.workflow;

	if (!workflow) {
		throw new Error('Missing workflow');
	}

	if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
		throw new Error('Must have an array of nodes');
	}

	const cacheKey = JSON.stringify(workflow);

	if (!cache[cacheKey]) {
		const page = await (await browser).newPage();
		await page.setRequestInterception(true);

		page.on('request', (interceptedRequest) => {
			if (interceptedRequest.url().startsWith('https://api.n8n.io/workflows/templates/')) {
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

		await page.goto('https://n8n-mutasem.herokuapp.com/workflows/templates/1149');

		await page.waitForSelector('div.el-loading-mask', {hidden: true});

		const name = uuid.v4();
		const imagePath = `output/${name}.png`;
		await page.screenshot({ path: imagePath });

		const result = await uploader.upload(path.resolve(__dirname, '..', imagePath));
		cache[cacheKey] = result.Location;
	}

	res.status(200);

	res.send({
		imageUrl: cache[cacheKey],
	});
}));

module.exports = router;

