const router = require('express').Router();
const uuid = require('uuid');
const path = require('path');

const puppeteer = require('puppeteer');
const uploader = require('./uploader');
const browser = puppeteer.launch({headless: true});

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

	await page.goto('http://localhost:5678/workflows/templates/1149');

	await page.waitForSelector('div.el-loading-mask', {hidden: true});

	const name = uuid.v4();
	const imagePath = `output/${name}.png`;
	await page.screenshot({ path: imagePath });

	const result = await uploader.upload(path.resolve(__dirname, '..', imagePath));

	res.status(200);

	res.send({
		imageUrl: result.Location,
	});
}));

module.exports = router;

