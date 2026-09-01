//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationHudBoundsBrowserVerification.mjs
 * @description Proves finite Revelation widths through the current static renderer in real Chrome.
 * The Awtsmoos lets malformed numbers enter a measured vessel without tearing the visible frame;
 * Awtsmoos.com tests the renderer that truly owns widths, so browser evidence follows architecture by name.
 */
import assert from 'node:assert/strict';
import { CdpClient, findGameTarget } from './CdpClient.mjs';

const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
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
	await client.evaluate(`(() => {
		const controls = [...document.querySelectorAll('button,[role="button"]')];
		const solo = controls.find(control => /solo|single|continue journey/i.test(control.textContent || ''));
		if (solo) solo.click();
	})()`);
	await client.waitFor(`Boolean(globalThis.__OHR_HAGNUZ_REVELATION__)`, 15000);

	const evidence = await client.evaluate(`(async () => {
		const [{ renderRevelationStatic }, { buildGameplayViewModel }] = await Promise.all([
			import('./src/tiferet/revelation/RevelationStaticRenderer.js'),
			import('./src/tiferet/revelation/RevelationGameplayViewModel.js')
		]);
		const progress = document.createElement('span');
		const vitality = document.createElement('span');
		const generic = document.createElement('span');
		const root = { querySelector(selector) {
			if (selector === '[data-revelation-progress]') return progress;
			if (selector === '[data-revelation-vitality-fill]') return vitality;
			return generic;
		} };
		const baseModel = {
			realm: 'OVERWORLD', chapter: '', location: '', level: 1, light: 100, maxLight: 100,
			sparks: 0, questTitle: '', objective: '', messenger: '', routeLabel: '', vitalityLabel: '',
			vitality: 100, maxVitality: 100,
			leadCompanion: { glyph: '', name: '', role: '', bondLine: '' }
		};
		const widths = [];
		for (const value of [-25, 175, NaN, Infinity, 42.5]) {
			renderRevelationStatic(root, { ...baseModel, progressPercent: value, vitalityPercent: value });
			widths.push(progress.style.width);
		}
		const negative = buildGameplayViewModel({ Stats: { light: -25, maxLight: 100 } }, []);
		const overflow = buildGameplayViewModel({ Stats: { light: 175, maxLight: 100 } }, []);
		const liveFill = document.querySelector('[data-revelation-vitality-fill]');
		return {
			widths,
			negative: { vitality: negative.vitality, percent: negative.vitalityPercent },
			overflow: { vitality: overflow.vitality, percent: overflow.vitalityPercent },
			liveWidth: liveFill?.style.width,
			liveModelPercent: globalThis.__OHR_HAGNUZ_REVELATION__.vitalityPercent
		};
	})()`);

	assert.deepEqual(evidence.widths, ['0%', '100%', '0%', '0%', '42.5%']);
	assert.deepEqual(evidence.negative, { vitality: 0, percent: 0 });
	assert.deepEqual(evidence.overflow, { vitality: 100, percent: 100 });
	assert.match(evidence.liveWidth, /^(?:100|[0-9]{1,2}(?:\.[0-9]+)?)%$/);
	assert.ok(evidence.liveModelPercent >= 0 && evidence.liveModelPercent <= 100);
	console.log(JSON.stringify(evidence, null, 2));
	console.log('BH_REVELATION_HUD_BOUNDS_BROWSER_PASS');
} finally {
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	client.close();
}
