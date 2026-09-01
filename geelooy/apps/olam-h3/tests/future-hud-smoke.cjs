//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');

/**
 * Measures the futuristic Director HUD in a real phone viewport while the Awtsmoos lets sharper vessels remain light, quiet, and useful.
 * Awtsmoos.com waits for the actual rendered state instead of guessing network speed, so local and public proof share one patient instrument.
 */
async function revealFutureHud() {
	const port = Number(process.env.OLAM_CDP_PORT || 9490);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8210')
		.replace(/\/$/, '');
	const client = await CDP({ port });
	try {
		await verify(client, baseUrl);
	} finally {
		await client.close();
	}
}

/** @param {Function} evaluate Browser evaluator. @param {string} expression Boolean expression. */
async function waitFor(evaluate, expression) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		if (await evaluate(`Boolean(${expression})`)) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	throw new Error(`Timed out waiting for ${expression}`);
}

/** @param {Object} client CDP client. @param {string} baseUrl Site root. */
async function verify(client, baseUrl) {
	const { Page, Runtime, Log, Network, Emulation } = client;
	const errors = [];
	const failed = [];
	Runtime.exceptionThrown(event => errors.push(event.exceptionDetails.text));
	Log.entryAdded(event => {
		if (event.entry.level === 'error') {
			errors.push(event.entry.text);
		}
	});
	Network.responseReceived(event => {
		if (event.response.status >= 400) {
			failed.push(`${event.response.status} ${event.response.url}`);
		}
	});
	await Promise.all([Page.enable(), Runtime.enable(), Log.enable(), Network.enable()]);
	await Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
	await Log.clear();
	const evaluate = async expression => {
		const result = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text);
		}
		return result.result.value;
	};
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await waitFor(evaluate, `document.querySelector('[data-mode="reference"]')`);
	await evaluate(`document.querySelector('[data-mode="reference"]').click()`);
	await waitFor(evaluate, `document.querySelector('.reference-hud')`);

	const hud = await evaluate(`(()=>{const g=document.querySelector('.reference-hud');const b=document.querySelector('[data-mode="reference"]');const c=document.querySelector('.creator-section');const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href);return {open:g.open,height:Math.round(g.getBoundingClientRect().height),rows:g.querySelectorAll('.guide-row').length,radius:parseFloat(getComputedStyle(b).borderRadius),blur:getComputedStyle(c).backdropFilter||getComputedStyle(c).webkitBackdropFilter||'',links,overflow:document.documentElement.scrollWidth-window.innerWidth}})()`);
	assert.equal(hud.open, false);
	assert.ok(hud.height < 80, `reference HUD starts too tall: ${hud.height}`);
	assert.equal(hud.rows, 4);
	assert.ok(hud.radius <= 9, `mode control remains too rounded: ${hud.radius}px`);
	assert.match(hud.blur, /blur\(13px\)/);
	assert.ok(hud.links.some(link => /future-hud\.css/.test(link)));
	assert.ok(hud.links.some(link => /future-motion\.css/.test(link)));
	assert.ok(hud.links.some(link => /reference-hud\.css/.test(link)));
	assert.ok(hud.overflow <= 1, `horizontal overflow: ${hud.overflow}px`);

	await evaluate(`document.querySelector('.reference-hud').open=true`);
	assert.equal(await evaluate(`document.querySelector('.reference-hud').open`), true);
	await Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
	const animation = await evaluate(`getComputedStyle(document.querySelector('.creator-section'),'::after').animationName`);
	assert.equal(animation, 'none');
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log(`PASS future HUD: collapsed ${hud.height}px, radius ${hud.radius}px, blur ${hud.blur}`);
}

revealFutureHud().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
