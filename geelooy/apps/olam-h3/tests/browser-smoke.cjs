//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');
const { BrowserWaits } = require('./browser-waits.cjs');

/**
 * Drives the real studio while the Awtsmoos lets browser geometry, onboarding, glass, and provider truth challenge source assumptions.
 * Awtsmoos.com waits for concrete UI states instead of fixed network delays, so local speed and public latency are tested by the same truthful vessel.
 */
async function revealBrowserTruth() {
	const port = Number(process.env.OLAM_CDP_PORT || 9460);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8080')
		.replace(/\/$/, '');
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
	const waits = new BrowserWaits(Runtime);
	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await waits.forCondition(
		`document.body.innerText.includes('Three moves to a stronger shot')`,
		'director guide'
	);
	assert.equal(await waits.evaluate('document.querySelectorAll(".workflow-step").length'), 3);
	const glass = await waits.evaluate(`(()=>{const s=getComputedStyle(document.querySelector('.creator-section'));return s.backdropFilter||s.webkitBackdropFilter||'';})()`);
	assert.ok(glass && glass !== 'none', `glass blur missing: ${glass}`);
	assert.notEqual(await waits.evaluate('getComputedStyle(document.querySelector(".brand-orb")).animationName'), 'none');
	assert.equal(await waits.evaluate('document.documentElement.scrollWidth-innerWidth'), 0);
	assert.equal(
		await waits.evaluate('document.querySelector(".provider-key-link")?.href || ""'),
		'https://platform.minimax.io/console/access'
	);

	const template = await waits.evaluate(`(()=>{const node=document.querySelector('[data-prompt]');document.querySelector('[data-prompt-template="cinematic"]').click();return {value:node.value,focused:document.activeElement===node,same:node===document.querySelector('[data-prompt]')};})()`);
	assert.match(template.value, /windswept desert/);
	assert.equal(template.focused, true);
	assert.equal(template.same, true);

	await waits.evaluate(`document.querySelector('[data-mode="reference"]').click()`);
	await waits.forCondition(`document.querySelector('.references-section')`, 'reference section');
	assert.match(
		await waits.evaluate('document.querySelector(".references-section").innerText'),
		/Images[\s\S]*Video[\s\S]*Audio/
	);
	await waits.evaluate(`document.querySelector('[data-mode="text"]').click()`);
	await waits.forCondition(`document.querySelector('[data-submission-panel]')`, 'submission panel');
	const geometry = await waits.evaluate(`(()=>{const panel=document.querySelector('[data-submission-panel]');panel.scrollIntoView({block:'end'});const cost=panel.querySelector('.cost-card').getBoundingClientRect();const generate=panel.querySelector('[data-generate]').getBoundingClientRect();const nav=document.querySelector('#bottom-nav').getBoundingClientRect();return {costBottom:cost.bottom,generateTop:generate.top,panelBottom:panel.getBoundingClientRect().bottom,navTop:nav.top};})()`);
	assert.ok(geometry.costBottom <= geometry.generateTop, 'cost overlaps Generate');
	assert.ok(geometry.panelBottom <= geometry.navTop, 'submission panel is hidden by bottom nav');

	await waits.evaluate(`document.querySelector('[data-open-settings]').click()`);
	await waits.forCondition(`document.body.innerText.includes('Create a pay-as-you-go key')`, 'settings guide');
	const settingsText = await waits.evaluate('document.body.innerText');
	assert.match(settingsText, /MINIMAX_API_KEY/);
	assert.match(settingsText, /Never expose the MiniMax key/);
	assert.equal(await waits.evaluate('document.querySelectorAll("input[type=password]").length'), 0);
	const officialLink = await waits.evaluate(`Array.from(document.querySelectorAll('a')).some(link => link.href === 'https://platform.minimax.io/console/access' && link.textContent.includes('Get API key'))`);
	assert.equal(officialLink, true);

	for (const [width, height] of [[360, 800], [768, 1024], [1440, 900]]) {
		await Emulation.setDeviceMetricsOverride({ width, height, deviceScaleFactor: 1, mobile: width === 360 });
		await waits.pause(140);
		assert.ok((await waits.evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1, `overflow at ${width}px`);
	}
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log('PASS browser smoke: glass, motion, onboarding, MiniMax setup, templates, references, no overlap');
}

revealBrowserTruth().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
