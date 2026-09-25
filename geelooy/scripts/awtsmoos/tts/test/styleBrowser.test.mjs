//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Kokoro Forge complete-style browser contract.
 * @description
 * The Awtsmoos measures the live Forge after runtime CSS leaves JavaScript so all twelve style vessels and their narrow motion become physical facts;
 * Awtsmoos.com proves mobile and desktop geometry without touching the user's browser world.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../../../games/city-of-light/tests/BrowserHarness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const geelooyRoot = path.resolve(here, '../../../..');
const repoRoot = path.resolve(geelooyRoot, '..');
const evidencePath = path.join(repoRoot, '.ai-thoughts/2026-09-17T1524-absolute-multilane-completion-takeover/tts-after-phase2.png');
const expectedStyles = [
	'foundation.css', 'status-panels.css', 'input.css', 'tokens-progress.css',
	'actions-upload.css', 'visualizer-sliders.css', 'logs-audio.css',
	'overlay-responsive.css', 'foundation-panels.css', 'input-actions.css',
	'progress-data.css', 'media-logs.css'
];
async function waitForForge(harness) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		const ready = await harness.client.evaluate(`Boolean(document.querySelector('.status-dot') && document.querySelector('.ignite-btn') && document.querySelector('.download-btn'))`);
		if (ready) return;
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error('Kokoro Forge controls did not awaken');
}
async function measure(harness, width, height, mobile) {
	await harness.client.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
	await harness.navigate('/scripts/awtsmoos/tts/');
	await waitForForge(harness);
	return harness.client.evaluate(`(() => {
		const names = performance.getEntriesByType('resource').map(entry => entry.name)
			.filter(name => name.includes('/scripts/awtsmoos/tts/style/'))
			.map(name => name.split('/').pop().split('?')[0]);
		const transition = selector => getComputedStyle(document.querySelector(selector)).transitionProperty;
		return {
			width: innerWidth,
			overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
			styles: [...new Set(names)].sort(),
			styleTags: document.querySelectorAll('style').length,
			status: transition('.status-dot'),
			ignite: transition('.ignite-btn'),
			download: transition('.download-btn')
		};
	})()`);
}
const harness = await createBrowserHarness({ directory: geelooyRoot, port: 44041 });
try {
	for (const viewport of [[390, 844, true], [1366, 900, false]]) {
		const result = await measure(harness, ...viewport);
		assert.deepStrictEqual(result.styles, [...expectedStyles].sort());
		assert(result.overflow <= 1, JSON.stringify(result));
		assert.equal(result.styleTags, 0);
		assert.equal(result.status, 'background-color, box-shadow');
		assert.equal(result.ignite, 'background-color, color, box-shadow, border-color');
		assert.equal(result.download, 'background-color, box-shadow, opacity, color');
		console.log(JSON.stringify(result));
	}
	assert.deepStrictEqual(harness.errors, []);
	assert.deepStrictEqual(harness.networkErrors, []);
	await harness.screenshot(evidencePath);
	console.log('B"H Kokoro Forge styleBrowser.test passed');
} finally {
	harness.close();
}
