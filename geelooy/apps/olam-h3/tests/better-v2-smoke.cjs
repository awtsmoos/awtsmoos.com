//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');
const { BrowserWaits } = require('./browser-waits.cjs');

/**
 * Measures the calmer cinematic vessel where Prompt and Mode meet; the Awtsmoos lets many powers become one deck without hiding a single tested choice.
 * Awtsmoos.com proves refinement through geometry, focus, readiness, motion, and thumb-reach evidence rather than through decorative voice.
 */
async function revealBetterV2() {
	const port = Number(process.env.OLAM_CDP_PORT || 9544);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8220').replace(/\/$/, '');
	const client = await CDP({ port });
	try {
		await verify(client, baseUrl);
	} finally {
		await client.close();
	}
}

/** @param {Object} client CDP client. @param {string} baseUrl Olam root. */
async function verify(client, baseUrl) {
	const { Page, Runtime, Network, Log, Emulation } = client;
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
	await Promise.all([Page.enable(), Runtime.enable(), Network.enable(), Log.enable()]);
	await Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
	await Log.clear();
	const waits = new BrowserWaits(Runtime);
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await waits.forCondition(`document.querySelector('.intuitive-mode-surface')`, 'Better V2 mode deck');

	const geometry = await waits.evaluate(`(()=>{const p=document.querySelector('.intuitive-command-surface');const m=document.querySelector('.intuitive-mode-surface');const ps=getComputedStyle(p);const ms=getComputedStyle(m);const starters=[...document.querySelectorAll('.intuitive-starter')].map(n=>n.getBoundingClientRect().width);const active=document.querySelector('#bottom-nav button.is-active,#bottom-nav button[aria-current="page"]');const generate=document.querySelector('[data-generate]');const gs=getComputedStyle(generate);const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href);return {gap:m.getBoundingClientRect().top-p.getBoundingClientRect().bottom,modeTop:m.getBoundingClientRect().top,promptBottomRadius:ps.borderBottomLeftRadius,modeTopRadius:ms.borderTopLeftRadius,starters,modeRadius:getComputedStyle(m.querySelector('.segmented')).borderRadius,aurora:getComputedStyle(p,'::after').animationName,navRail:active?getComputedStyle(active,'::before').content:'none',navRailHeight:active?getComputedStyle(active,'::before').height:'0px',generateDisabled:generate.disabled,generateOpacity:gs.opacity,generateRadius:gs.borderRadius,generateBackground:gs.backgroundImage,links,overflow:document.documentElement.scrollWidth-innerWidth,pageHeight:document.documentElement.scrollHeight}})()`);
	assert.ok(Math.abs(geometry.gap) <= 1.1, `Prompt/Mode seam is ${geometry.gap}px`);
	assert.ok(geometry.modeTop < 675, `Mode is not higher than baseline: ${geometry.modeTop}px`);
	assert.equal(geometry.promptBottomRadius, '0px');
	assert.equal(geometry.modeTopRadius, '0px');
	assert.ok(geometry.starters.every(width => width <= 108), `starter widths ${geometry.starters.join(',')}`);
	assert.equal(geometry.modeRadius, '8px');
	assert.notEqual(geometry.aurora, 'none');
	assert.notEqual(geometry.navRail, 'none');
	assert.equal(geometry.navRailHeight, '1px');
	assert.equal(geometry.generateDisabled, true);
	assert.equal(geometry.generateOpacity, '1');
	assert.equal(geometry.generateRadius, '8px');
	assert.match(geometry.generateBackground, /linear-gradient/);
	for (const file of ['unified-deck.css', 'cinematic-controls.css', 'aurora-depth.css', 'ignition-nav.css']) {
		assert.ok(geometry.links.some(link => link.includes(file)), `${file} was not loaded`);
	}
	assert.ok(geometry.overflow <= 1, `390px overflow: ${geometry.overflow}px`);

	const template = await waits.evaluate(`(()=>{const node=document.querySelector('[data-prompt]');document.querySelector('[data-prompt-template="cinematic"]').click();return {same:node===document.querySelector('[data-prompt]'),focused:document.activeElement===node,value:node.value};})()`);
	assert.equal(template.same, true);
	assert.equal(template.focused, true);
	assert.match(template.value, /windswept desert/);
	await Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
	assert.equal(await waits.evaluate(`getComputedStyle(document.querySelector('.intuitive-command-surface'),'::after').animationName`), 'none');
	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	await waits.pause(140);
	assert.ok((await waits.evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1, '360px layout overflows');
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log(`PASS Better V2: seam ${geometry.gap}px, mode ${Math.round(geometry.modeTop)}px, starters ${geometry.starters.map(Math.round).join('/')}px, page ${geometry.pageHeight}px`);
}

revealBetterV2().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
