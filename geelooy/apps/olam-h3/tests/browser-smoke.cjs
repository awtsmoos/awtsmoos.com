//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');

/**
 * Drives the real studio while the Awtsmoos lets browser geometry challenge visual assumptions; Awtsmoos.com proves templates, reference teaching, provider safety, and mobile submission hierarchy in the actual rendered vessel.
 */
async function revealBrowserTruth() {
	const port = Number(process.env.OLAM_CDP_PORT || 9458);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
	const client = await CDP({ port });

	try {
		await verifyStudio(client, baseUrl);
	} finally {
		await client.close();
	}
}

/** @param {Object} client CDP client. @param {string} baseUrl Awtsmoos root. */
async function verifyStudio(client, baseUrl) {
	const { Page, Runtime, Log, Network, Emulation } = client;
	const errors = [];
	const failed = [];
	Runtime.exceptionThrown(event => errors.push(event.exceptionDetails.text));
	Log.entryAdded(event => {
		if (event.entry.level === 'error') errors.push(event.entry.text);
	});
	Network.responseReceived(event => {
		if (event.response.status >= 400) failed.push(`${event.response.status} ${event.response.url}`);
	});
	await Promise.all([Page.enable(), Runtime.enable(), Log.enable(), Network.enable()]);
	await Log.clear();
	const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
	const evaluate = async expression => {
		const result = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
		if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
		return result.result.value;
	};

	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await pause(700);
	assert.match(await evaluate('document.body.innerText'), /Generation paused/);
	assert.equal(await evaluate('document.documentElement.scrollWidth-innerWidth'), 0);

	const template = await evaluate(`(()=>{
		const node=document.querySelector('[data-prompt]');
		document.querySelector('[data-prompt-template="cinematic"]').click();
		return {value:node.value,focused:document.activeElement===node,same:node===document.querySelector('[data-prompt]')};
	})()`);
	assert.match(template.value, /windswept desert/);
	assert.equal(template.focused, true);
	assert.equal(template.same, true);
	assert.equal(await evaluate('document.querySelector(".cost-card strong").textContent'), '$0.40');

	await evaluate(`document.querySelector('[data-mode="reference"]').click()`);
	await pause(350);
	const guide = await evaluate('document.querySelector(".references-section").innerText');
	assert.match(guide, /Images/);
	assert.match(guide, /Video/);
	assert.match(guide, /Audio/);
	assert.match(guide, /character consistency/i);

	await evaluate(`document.querySelector('[data-mode="text"]').click()`);
	await pause(300);
	const geometry = await evaluate(`(()=>{
		const panel=document.querySelector('[data-submission-panel]');
		panel.scrollIntoView({block:'end'});
		const cost=panel.querySelector('.cost-card').getBoundingClientRect();
		const generate=panel.querySelector('[data-generate]').getBoundingClientRect();
		const nav=document.querySelector('#bottom-nav').getBoundingClientRect();
		return {costBottom:cost.bottom,generateTop:generate.top,panelBottom:panel.getBoundingClientRect().bottom,navTop:nav.top};
	})()`);
	assert.ok(geometry.costBottom <= geometry.generateTop, 'cost overlaps Generate');
	assert.ok(geometry.panelBottom <= geometry.navTop, 'submission panel is hidden by bottom nav');

	for (const [width, height] of [[360, 800], [768, 1024], [1440, 900]]) {
		await Emulation.setDeviceMetricsOverride({ width, height, deviceScaleFactor: 1, mobile: width === 360 });
		await pause(150);
		assert.ok((await evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1, `overflow at ${width}px`);
	}
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log('PASS browser smoke: templates, references guide, no submission overlap, provider gate, responsive');
}

revealBrowserTruth().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
