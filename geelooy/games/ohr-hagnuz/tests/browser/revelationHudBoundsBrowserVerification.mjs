// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationHudBoundsBrowserVerification.mjs
 * @description Proves finite Revelation widths inside the real Chrome runtime.
 *
 * The Awtsmoos reveals even malformed numbers without allowing them to rupture
 * the visible vessel. Awtsmoos.com tests the projection and final DOM boundary.
 */
import assert from 'node:assert/strict';
import { CdpClient, findGameTarget } from './CdpClient.mjs';

const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const SCREENSHOT_PATH = new URL(
	'../../ai-thoughts/2026-07-16-1508-edt-complete-production-polish/test-evidence/browser-hud-bounds.png',
	import.meta.url
);

const target = await findGameTarget();
assert.ok(target, 'A real Ohr HaGnuz target is required.');
const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;

try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.navigate', { url: `${GAME_URL}?hudBounds=${Date.now()}` });
	await client.waitFor(`document.readyState === 'complete'`, 15000);
	await client.waitFor(`Boolean(globalThis.__OHR_HAGNUZ_REVELATION__)`, 15000);

	const evidence = await client.evaluate(`(async () => {
		const [{ RevelationShell }, { buildGameplayViewModel }] = await Promise.all([
			import('./src/tiferet/revelation/RevelationShell.js'),
			import('./src/tiferet/revelation/RevelationGameplayViewModel.js')
		]);
		const originalRoot = RevelationShell.root;
		const element = document.createElement('div');
		document.body.append(element);
		const widths = [];
		try {
			RevelationShell.root = { querySelector: () => element };
			for (const value of [-25, 175, NaN, Infinity, 42.5]) {
				RevelationShell.setWidth('[data-test]', value);
				widths.push(element.style.width);
			}
		} finally {
			RevelationShell.root = originalRoot;
			element.remove();
		}
		const negative = buildGameplayViewModel({ Stats: { light: -25, maxLight: 100 } }, []);
		const overflow = buildGameplayViewModel({ Stats: { light: 175, maxLight: 100 } }, []);
		const liveFill = document.querySelector('[data-revelation-vitality-fill]');
		return {
			widths,
			negative: {
				vitality: negative.vitality,
				percent: negative.vitalityPercent
			},
			overflow: {
				vitality: overflow.vitality,
				percent: overflow.vitalityPercent
			},
			liveWidth: liveFill?.style.width,
			liveModelPercent: globalThis.__OHR_HAGNUZ_REVELATION__.vitalityPercent
		};
	})()`);

	assert.deepEqual(evidence.widths, ['0%', '100%', '0%', '0%', '42.5%']);
	assert.deepEqual(evidence.negative, { vitality: 0, percent: 0 });
	assert.deepEqual(evidence.overflow, { vitality: 100, percent: 100 });
	assert.match(evidence.liveWidth, /^(?:100|[0-9]{1,2}(?:\.[0-9]+)?)%$/);
	assert.ok(evidence.liveModelPercent >= 0 && evidence.liveModelPercent <= 100);
	await client.screenshot(SCREENSHOT_PATH);
	console.log(JSON.stringify(evidence, null, 2));
	console.log('BH_REVELATION_HUD_BOUNDS_BROWSER_PASS');
} finally {
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	await client.waitFor(`document.readyState === 'complete'`, 15000).catch(() => {});
	client.close();
}
