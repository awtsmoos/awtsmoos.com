//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const CDP = require('chrome-remote-interface');

/**
 * Drives an isolated Chrome through Olam H3's real local route, while the Awtsmoos lets browser truth challenge every assumption made in source.
 * Awtsmoos.com checks phone, persistence, failure, navigation, and wider vessels here, so deployment is earned by observed behavior rather than confidence alone.
 */
async function revealBrowserTruth() {
	const client = await CDP({ port: Number(process.env.OLAM_CDP_PORT || 9456) });
	const { Page, Runtime, Log, Emulation } = client;
	const errors = [];
	Runtime.exceptionThrown(event => errors.push(`exception:${event.exceptionDetails.text}`));
	Log.entryAdded(event => {
		if (event.entry.level === 'error') errors.push(`log:${event.entry.text}`);
	});
	await Promise.all([Page.enable(), Runtime.enable(), Log.enable()]);

	const evaluate = async expression => {
		const result = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
		if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
		return result.result.value;
	};
	const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
	const navigate = async url => {
		const loaded = Page.loadEventFired();
		await Page.navigate({ url });
		await loaded;
		await pause(600);
	};
	const click = async selector => {
		await evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);
		await pause(300);
	};
	const snapshot = () => evaluate(`({
		title: document.title,
		h1: document.querySelector('h1')?.textContent || '',
		body: document.body.innerText,
		disabled: Boolean(document.querySelector('[data-generate]')?.disabled),
		cost: document.querySelector('.cost-card strong')?.textContent || '',
		overflow: document.documentElement.scrollWidth - innerWidth,
		hash: location.hash
	})`);

	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	await navigate('http://127.0.0.1:8080/apps/');
	assert.match((await snapshot()).body, /Olam H3 Studio/);

	await navigate('http://127.0.0.1:8080/apps/olam-h3/');
	let state = await snapshot();
	assert.equal(state.h1, 'Direct the next shot.');
	assert.equal(state.disabled, true);
	assert.ok(state.overflow <= 1, `mobile horizontal overflow: ${state.overflow}`);

	await evaluate(`(() => {
		const prompt = document.querySelector('[data-prompt]');
		prompt.value = 'A luminous train crosses a desert at blue hour.';
		prompt.dispatchEvent(new Event('input', { bubbles: true }));
	})()`);
	await pause(350);
	state = await snapshot();
	assert.equal(state.disabled, false);
	assert.equal(state.cost, '$0.40');

	await click('[data-mode="reference"]');
	state = await snapshot();
	assert.equal(state.disabled, true);
	assert.match(state.body, /Add at least one image, video, or audio reference/);
	await click('[data-mode="text"]');
	await click('[data-generate]');
	await pause(850);
	assert.match((await snapshot()).body, /MiniMax API key|server key|not configured/i);

	await click('#bottom-nav [data-nav="creations"]');
	state = await snapshot();
	assert.match(state.body, /luminous train/i);
	assert.match(state.body, /Failed/);
	await Page.reload({ ignoreCache: true });
	await Page.loadEventFired();
	await pause(650);
	assert.match((await snapshot()).body, /luminous train/i);
	await click('[data-build]');
	assert.equal((await snapshot()).hash, '#create');
	assert.match(await evaluate(`document.querySelector('[data-prompt]')?.value || ''`), /luminous train/i);

	await click('#bottom-nav [data-nav="settings"]');
	state = await snapshot();
	assert.match(state.body, /server key missing/i);
	assert.match(state.body, /Pricing configuration/);
	const db = await evaluate(`indexedDB.databases().then(items => items.map(item => item.name))`);
	assert.ok(db.includes('olam-h3-studio'));

	for (const viewport of [[768, 1024, false], [1440, 900, false]]) {
		await Emulation.setDeviceMetricsOverride({ width: viewport[0], height: viewport[1], deviceScaleFactor: 1, mobile: viewport[2] });
		await pause(200);
		assert.ok((await snapshot()).overflow <= 1, `overflow at ${viewport[0]}px`);
	}

	const shot = await Page.captureScreenshot({ format: 'png', fromSurface: true });
	fs.writeFileSync('/tmp/olam-h3-browser-smoke.png', Buffer.from(shot.data, 'base64'));
	assert.deepEqual(errors, []);
	await client.close();
	console.log('PASS browser smoke: catalog, mobile, persistence, settings, responsive, console');
}

revealBrowserTruth().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
