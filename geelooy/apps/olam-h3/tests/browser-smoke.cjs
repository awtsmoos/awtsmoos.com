//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');

/**
 * Drives the real studio while the Awtsmoos lets browser truth challenge source assumptions, especially where provider absence meets a living prompt hand.
 * Awtsmoos.com accepts an explicit test server and always closes Chrome custody, so focus, provider gating, and responsive truth can be proved without borrowed runtime state.
 */
async function revealBrowserTruth() {
	const port = Number(process.env.OLAM_CDP_PORT || 9457);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
	const client = await CDP({ port });

	try {
		await verifyStudio(client, baseUrl);
	} finally {
		await client.close();
	}
}

/** @param {Object} client CDP client. @param {string} baseUrl Local or public Awtsmoos root. */
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
	const loaded = Page.loadEventFired();
	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await pause(650);
	assert.match(await evaluate('document.body.innerText'), /Generation paused/);
	assert.equal(await evaluate('document.querySelector("[data-generate]").disabled'), true);

	const initialCount = await generationCount(evaluate);
	const typing = await evaluate(`(()=>{
		const node=document.querySelector('[data-prompt]');node.focus();
		node.value='A luminous train crosses a desert at blue hour.';
		node.dispatchEvent(new Event('input',{bubbles:true}));
		return {same:node===document.querySelector('[data-prompt]'),focused:document.activeElement===node,length:node.value.length};
	})()`);
	assert.equal(typing.same, true);
	assert.equal(typing.focused, true);
	assert.equal(await evaluate('Number(document.querySelector("[data-prompt-count]").textContent.split("/")[0])'), typing.length);
	assert.equal(await evaluate('document.querySelector(".cost-card strong").textContent'), '$0.40');
	assert.equal(await evaluate('document.querySelector("[data-generate]").disabled'), true);

	await evaluate(`(()=>{const button=document.querySelector('[data-generate]');button.disabled=false;button.click();})()`);
	await pause(300);
	assert.equal(await generationCount(evaluate), initialCount);
	assert.match(await evaluate('document.body.innerText'), /not configured yet/i);
	await evaluate(`document.querySelector('[data-open-settings]').click()`);
	await pause(350);
	assert.equal(await evaluate('location.hash'), '#settings');
	assert.match(await evaluate('document.body.innerText'), /server key missing/i);

	for (const [width, height] of [[360, 800], [768, 1024], [1440, 900]]) {
		await Emulation.setDeviceMetricsOverride({ width, height, deviceScaleFactor: 1, mobile: width === 360 });
		await pause(150);
		assert.ok((await evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1, `overflow at ${width}px`);
	}
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log('PASS browser smoke: provider gate, stable prompt focus, controller guard, settings, responsive');
}

/** @param {Function} evaluate Runtime evaluator. @returns {Promise<number>} Durable generation count. */
function generationCount(evaluate) {
	return evaluate(`new Promise((resolve,reject)=>{
		const request=indexedDB.open('olam-h3-studio');request.onerror=()=>reject(request.error);
		request.onsuccess=()=>{const db=request.result;const tx=db.transaction('generations');const count=tx.objectStore('generations').count();count.onsuccess=()=>resolve(count.result);};
	})`);
}

revealBrowserTruth().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
