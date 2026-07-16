// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationQuestProjectionBrowserVerification.mjs
 * @description Verifies canonical Shlichus projection in the real browser runtime.
 *
 * The Awtsmoos lets an event speak without stealing the mission's name.
 * Awtsmoos.com therefore tests both vessels inside a freshly loaded game page.
 */
import assert from 'node:assert/strict';
import { CdpClient, findGameTarget } from './CdpClient.mjs';

const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const SCREENSHOT_PATH = new URL(
	'../../ai-thoughts/2026-07-16-1508-edt-complete-production-polish/test-evidence/browser-quest-projection.png',
	import.meta.url
);

const target = await findGameTarget();
assert.ok(target, 'A real Ohr HaGnuz CDP target is required.');

const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;
try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.navigate', {
		url: `${GAME_URL}?questProjection=${Date.now()}`
	});
	await client.waitFor(`document.readyState === 'complete'`, 15000);
	await client.waitFor(`Boolean(globalThis.__OHR_HAGNUZ_REVELATION__)`, 15000);

	const evidence = await client.evaluate(`(async () => {
		const nonce = Date.now();
		const [{ State }, { buildRevelationViewModel }, sourceResponse] = await Promise.all([
			import('./src/binah/State.js'),
			import('./src/tiferet/revelation/RevelationViewModel.js'),
			fetch('./src/tiferet/revelation/RevelationViewModel.js?source=' + nonce, {
				cache: 'no-store'
			})
		]);
		const saveMessage = 'Save restored from 2026-07-16T20:21:40.244Z.';
		const projection = buildRevelationViewModel({
			...State,
			Campaign: { chapterIndex: 0 },
			Stats: { ...State.Stats, sparks: 0 },
			Message: saveMessage
		}, []);
		const source = await sourceResponse.text();
		return {
			saveMessage,
			projection,
			domTitle: document.querySelector('[data-revelation-quest-title]')?.textContent?.trim(),
			domObjective: document.querySelector('[data-revelation-objective]')?.textContent?.trim(),
			liveModel: globalThis.__OHR_HAGNUZ_REVELATION__,
			sourceSignature: {
				hasMissionImport: source.includes('RevelationMissionProjection.js'),
				hasMessageSubstitution: source.includes('state.Message')
			}
		};
	})()`);

	assert.equal(evidence.sourceSignature.hasMissionImport, true);
	assert.equal(evidence.sourceSignature.hasMessageSubstitution, false);
	assert.notEqual(evidence.projection.questTitle, evidence.saveMessage);
	assert.notEqual(evidence.projection.objective, evidence.saveMessage);
	assert.ok(evidence.projection.events.some(event => event.text === evidence.saveMessage));
	assert.ok(evidence.domTitle);
	assert.ok(evidence.domObjective);
	assert.doesNotMatch(evidence.domTitle, /^Save Restored/i);
	assert.doesNotMatch(evidence.domObjective, /^Save restored from/i);
	await client.screenshot(SCREENSHOT_PATH);
	console.log(JSON.stringify(evidence, null, 2));
	console.log('BH_REVELATION_QUEST_BROWSER_PASS');
} finally {
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) {
		await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
		await client.waitFor(`document.readyState === 'complete'`, 15000).catch(() => {});
	}
	client.close();
}
