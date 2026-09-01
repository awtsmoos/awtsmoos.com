//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const CDP = require('chrome-remote-interface');
const { BrowserWaits } = require('./browser-waits.cjs');

/**
 * Measures simplicity where the hand meets the screen; the Awtsmoos lets Prompt and Mode remain ordered even when their glass edges join as one scene.
 * Awtsmoos.com proves semantic sequence, bounded visual fusion, folded wisdom, living glass, and focused creation without mistaking empty space for clean.
 */
async function revealIntuitiveConsole() {
	const port = Number(process.env.OLAM_CDP_PORT || 9521);
	const baseUrl = String(process.env.OLAM_BASE_URL || 'http://127.0.0.1:8216').replace(/\/$/, '');
	const client = await CDP({ port });
	try {
		await verify(client, baseUrl);
	} finally {
		await client.close();
	}
}

/** @param {Object} client CDP client. @param {string} baseUrl Application root. */
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
	const waits = new BrowserWaits(Runtime);
	const loaded = Page.loadEventFired();
	await Page.navigate({ url: `${baseUrl}/apps/olam-h3/` });
	await loaded;
	await waits.forCondition(`document.querySelector('.intuitive-command-surface')`, 'intuitive command surface');
	await waits.forCondition(`document.querySelector('.intuitive-mode-surface')`, 'mode surface');

	const layout = await waits.evaluate(`(()=>{const p=document.querySelector('.intuitive-command-surface');const m=document.querySelector('.intuitive-mode-surface');const d=document.querySelector('.intuitive-director-pulse');const s=document.querySelector('.intuitive-style-lanes');const t=document.querySelector('[data-prompt]');const order=Boolean(p.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_FOLLOWING);return {promptBottom:p.getBoundingClientRect().bottom,modeTop:m.getBoundingClientRect().top,modeBottom:m.getBoundingClientRect().bottom,directorTop:d.getBoundingClientRect().top,textareaHeight:t.getBoundingClientRect().height,directorOpen:d.open,stylesOpen:s.open,moreOpen:document.querySelector('.prompt-more').open,starters:document.querySelectorAll('[data-prompt-template]').length,order,overflow:document.documentElement.scrollWidth-innerWidth}})()`);
	const seam = layout.modeTop - layout.promptBottom;
	assert.equal(layout.order, true, 'Mode must follow Prompt in document order');
	assert.ok(Math.abs(seam) <= 2, `Prompt/Mode seam is too large: ${seam}px`);
	assert.ok(layout.modeTop < 720, `Mode is still too far down: ${layout.modeTop}px`);
	assert.ok(layout.modeBottom <= layout.directorTop + 1, 'Director appears before essential Mode');
	assert.ok(layout.textareaHeight <= 200, `Prompt remains oversized: ${layout.textareaHeight}px`);
	assert.equal(layout.directorOpen, false);
	assert.equal(layout.stylesOpen, false);
	assert.equal(layout.moreOpen, false);
	assert.equal(layout.starters, 4);
	assert.ok(layout.overflow <= 1, `mobile overflow: ${layout.overflow}px`);

	const visual = await waits.evaluate(`(()=>{const c=document.querySelector('.intuitive-command-surface');const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href);const nav=[...document.querySelectorAll('#bottom-nav button')];const active=nav.find(x=>x.matches('.is-active,.active,[aria-current="page"]'));const inactive=nav.find(x=>x!==active);return {blur:getComputedStyle(c).backdropFilter||getComputedStyle(c).webkitBackdropFilter||'',animation:getComputedStyle(c,'::before').animationName,links,activeOpacity:active?parseFloat(getComputedStyle(active).opacity):0,inactiveOpacity:inactive?parseFloat(getComputedStyle(inactive).opacity):1}})()`);
	assert.match(visual.blur, /blur\(13px\)/);
	for (const file of ['intuitive-console.css', 'intuitive-disclosure.css', 'intuitive-glass.css', 'intuitive-motion.css', 'intuitive-nav.css']) {
		assert.ok(visual.links.some(link => link.includes(file)), `${file} was not loaded`);
	}
	assert.notEqual(visual.animation, 'none');
	assert.ok(visual.activeOpacity > visual.inactiveOpacity, 'active navigation is not visually dominant');

	const template = await waits.evaluate(`(()=>{const node=document.querySelector('[data-prompt]');document.querySelector('[data-prompt-template="cinematic"]').click();return {same:node===document.querySelector('[data-prompt]'),focused:document.activeElement===node,value:node.value};})()`);
	assert.equal(template.same, true);
	assert.equal(template.focused, true);
	assert.match(template.value, /windswept desert/);
	await Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
	assert.equal(await waits.evaluate(`getComputedStyle(document.querySelector('.intuitive-command-surface'),'::before').animationName`), 'none');

	await Emulation.setDeviceMetricsOverride({ width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
	await waits.pause(160);
	assert.ok((await waits.evaluate('document.documentElement.scrollWidth-innerWidth')) <= 1, '360px layout overflows');
	assert.deepEqual(errors, []);
	assert.deepEqual(failed, []);
	console.log(`PASS intuitive create: mode ${Math.round(layout.modeTop)}px, seam ${seam.toFixed(2)}px, folded intelligence, live glass`);
}

revealIntuitiveConsole().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
