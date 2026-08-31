//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');

/**
 * Challenges the compressed Create room in a real phone viewport while the Awtsmoos lets geometry, focus, guidance, and action answer together.
 * Awtsmoos.com proves that less scrolling still carries the full Director intelligence without breaking the hand that writes.
 */
async function revealCompactDirector() {
	const port = Number(process.env.OLAM_CDP_PORT || 9475);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8080')
		.replace(/\/$/, '');
	const client = await CDP({ port });
	try {
		await verify(client, baseUrl);
	} finally {
		await client.close();
	}
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
	await Log.clear();
	const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
	const evaluate = async expression => {
		const result = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text);
		}
		return result.result.value;
	};

	await Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await pause(850);
	const geometry = await evaluate(`(()=>{const p=document.querySelector('.prompt-section').getBoundingClientRect();return {promptTop:Math.round(p.top),scrollHeight:document.documentElement.scrollHeight}})()`);
	assert.ok(geometry.promptTop < 300, `prompt still begins too low: ${geometry.promptTop}`);
	assert.ok(geometry.scrollHeight < 2200, `page still too tall: ${geometry.scrollHeight}`);
	assert.equal(await evaluate('document.querySelector(".quick-guide").open'), false);
	assert.equal(await evaluate('document.querySelectorAll(".reference-recipe").length'), 0);
	assert.equal(await evaluate('document.querySelector("[data-coverage-score]").textContent'), '0%');

	const suggestion = await evaluate(`(()=>{const t=document.querySelector('[data-prompt]');const b=document.querySelector('[data-director-brief]');document.querySelector('[data-director-suggestion="camera"]').click();return {value:t.value,sameText:t===document.querySelector('[data-prompt]'),sameBrief:b===document.querySelector('[data-director-brief]'),focused:document.activeElement===t}})()`);
	assert.match(suggestion.value, /slow cinematic push-in/);
	assert.equal(suggestion.sameText && suggestion.sameBrief && suggestion.focused, true);
	assert.equal(await evaluate('document.querySelector("[data-ingredient=camera]").disabled'), true);

	await evaluate(`(()=>{const t=document.querySelector('[data-prompt]');t.value='A lone astronaut walks through fog as the camera slowly dollies forward, neon light tracing the suit, tense cinematic atmosphere, ambient wind and distant radio voice.';t.dispatchEvent(new Event('input',{bubbles:true}))})()`);
	assert.equal(await evaluate('document.querySelector("[data-coverage-score]").textContent'), '100%');
	assert.equal(await evaluate('document.querySelectorAll(".ingredient-chip.is-present").length'), 6);
	await evaluate(`document.querySelector('[data-style-lane="golden"]').click()`);
	assert.match(await evaluate('document.querySelector("[data-prompt]").value'), /Golden-hour sunlight/);
	await evaluate(`document.querySelector('[data-reference-recipe-mode="frames"]').click()`);
	await pause(300);
	assert.equal(await evaluate('document.querySelector("[data-mode=frames]").classList.contains("is-active")'), true);
	assert.equal(await evaluate('document.querySelectorAll(".reference-recipe").length'), 1);
	assert.ok((await evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1);
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log(`PASS compact Director: prompt ${geometry.promptTop}px, page ${geometry.scrollHeight}px, suggestions, focus, contextual recipes`);
}

revealCompactDirector().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
