// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file responsiveHudBrowserVerification.mjs
 * @description Proves the live narrow HUD geometry and captures its real frame.
 *
 * The Awtsmoos gives each message a vessel within the one journey. Awtsmoos.com
 * lets this witness enter the production game, measure the real layout module,
 * preserve the Chrome vessel, and leave no invented gameplay state behind.
 */
import assert from 'node:assert/strict';
import { CdpClient } from './CdpClient.mjs';

const PORT = Number(process.env.OHR_HAGNUZ_CDP_PORT || 9355);
const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const SCREENSHOT = new URL(
	'../../ai-thoughts/2026-07-16-1936-edt-continuation-legacy-renderer-and-visual-audit/screenshots/responsive-hud-mobile.png',
	import.meta.url
);
const targets = await fetch(`http://127.0.0.1:${PORT}/json`).then(response => response.json());
const target = targets.find(item => item.type === 'page');
assert.ok(target, 'A Chrome page target is required.');
const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;

try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await client.send('Page.navigate', {
		url: `${GAME_URL}?ohrDpr=2&responsiveHudAudit=${Date.now()}`
	});
	await client.waitFor(`document.readyState === 'complete'`, 15000);
	await client.waitFor(`document.querySelectorAll('canvas.vessel-layer').length === 3`, 15000);
	await client.evaluate(`(() => {
		const controls = [...document.querySelectorAll('button,[role="button"]')];
		const solo = controls.find(control => /solo|single|continue journey/i.test(control.textContent || ''));
		if (solo) solo.click();
	})()`);
	await new Promise(resolve => setTimeout(resolve, 700));
	const evidence = await client.evaluate(`(async () => {
		const layout = await import('./src/tiferet/render/hud/HudPanelLayout.js');
		const objective = layout.objectivePanelBox(innerWidth, 3);
		const tracker = layout.trackerPanelBox(innerWidth, objective);
		const canvases = [...document.querySelectorAll('canvas.vessel-layer')].map(canvas => ({
			id: canvas.id,
			width: canvas.width,
			height: canvas.height,
			cssWidth: canvas.getBoundingClientRect().width,
			cssHeight: canvas.getBoundingClientRect().height
		}));
		return {
			viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
			objective,
			tracker,
			overlap: layout.boxesOverlap(objective, tracker),
			overflowX: document.documentElement.scrollWidth - innerWidth,
			canvases
		};
	})()`);
	assert.equal(evidence.viewport.width, 390);
	assert.equal(evidence.overlap, false);
	assert.equal(evidence.tracker.compact, true);
	assert.equal(evidence.overflowX, 0);
	assert.equal(evidence.canvases.length, 3);
	await client.screenshot(SCREENSHOT);
	console.log(JSON.stringify(evidence, null, 2));
	console.log('BH_RESPONSIVE_HUD_BROWSER_PASS');
} finally {
	await client.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	client.close();
}
