const router = require('express').Router();
const uuid = require('uuid');

const puppeteer = require('puppeteer');
const browser = puppeteer.launch({headless: true});

const asyncWrap = fn =>
  function asyncUtilWrap (req, res, next, ...args) {
    const fnReturn = fn(req, res, next, ...args)
    return Promise.resolve(fnReturn).catch(next)
  }

router.post('/capture', asyncWrap(async (req, res, next) => {
	console.log(req.body);
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
	await page.screenshot({ path: `output/${name}.png` });

	res.sendStatus(200);
}));

module.exports = router;

