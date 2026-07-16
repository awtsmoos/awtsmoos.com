// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationVisibilityBrowserVerification.mjs
 * @description Measures hidden suspension in the tunnel-managed Chrome runtime.
 *
 * This Chrome vessel remains genuinely hidden even when brought forward. The
 * Awtsmoos uses that concealment as direct evidence, while Awtsmoos.com exercises
 * awakening through the same lifecycle with Chrome's real timer engine.
 */
import assert from 'node:assert/strict';
import { CdpClient, findGameTarget } from './CdpClient.mjs';

const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const SCREENSHOT_PATH = new URL(
	'../../ai-thoughts/2026-07-16-1508-edt-complete-production-polish/test-evidence/browser-visibility-hidden.png',
	import.meta.url
);
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const target = await findGameTarget();
assert.ok(target, 'A real Ohr HaGnuz target is required.');
const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;

try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.navigate', { url: `${GAME_URL}?visibility=${Date.now()}` });
	await client.waitFor(`document.readyState === 'complete'`, 15000);
	await client.waitFor(`Boolean(globalThis.__OHR_HAGNUZ_REVELATION__)`, 15000);
	const installed = await client.evaluate(`(async () => {
		const { RevelationShell } = await import('./src/tiferet/revelation/RevelationShell.js');
		const original = RevelationShell.update;
		globalThis.__VISIBILITY_WITNESS__ = { count: 0, original, RevelationShell };
		RevelationShell.update = function(...args) {
			globalThis.__VISIBILITY_WITNESS__.count += 1;
			return original.apply(this, args);
		};
		return {
			hidden: document.hidden,
			runtimeHidden: globalThis.__OHR_HAGNUZ_VISIBILITY__?.hidden,
			timerCleared: RevelationShell.refreshLifecycle?.timer === null
		};
	})()`);
	assert.deepEqual(installed, { hidden: true, runtimeHidden: true, timerCleared: true });
	await sleep(650);
	const hiddenCount = await client.evaluate(`globalThis.__VISIBILITY_WITNESS__.count`);
	assert.equal(hiddenCount, 0, 'mounted hidden shell must perform no periodic updates');
	const lifecycleEvidence = await client.evaluate(`(async () => {
		const { RevelationRefreshLifecycle } = await import(
			'./src/tiferet/revelation/RevelationRefreshLifecycle.js'
		);
		const page = { hidden: true };
		const subscribers = new Set();
		const visibility = {
			shouldProcess: () => !page.hidden,
			subscribe(callbacks) {
				subscribers.add(callbacks);
				return () => subscribers.delete(callbacks);
			}
		};
		let count = 0;
		const lifecycle = new RevelationRefreshLifecycle({
			callback: () => count += 1,
			intervalMs: 50,
			scheduler: window,
			page,
			visibility
		});
		lifecycle.start();
		const hiddenStart = { count, timerCleared: lifecycle.timer === null };
		page.hidden = false;
		for (const callbacks of subscribers) callbacks.onResume?.();
		const resumeCount = count;
		await new Promise(resolve => setTimeout(resolve, 80));
		const visibleCount = count;
		page.hidden = true;
		for (const callbacks of subscribers) callbacks.onHide?.();
		const pausedCount = count;
		await new Promise(resolve => setTimeout(resolve, 120));
		const hiddenEnd = count;
		lifecycle.stop();
		return {
			hiddenStart,
			resumeCount,
			visibleCount,
			pausedCount,
			hiddenEnd,
			timerCleared: lifecycle.timer === null,
			subscriberCount: subscribers.size
		};
	})()`);
	assert.deepEqual(lifecycleEvidence.hiddenStart, { count: 0, timerCleared: true });
	assert.equal(lifecycleEvidence.resumeCount, 1);
	assert.ok(lifecycleEvidence.visibleCount >= 2);
	assert.equal(lifecycleEvidence.hiddenEnd, lifecycleEvidence.pausedCount);
	assert.equal(lifecycleEvidence.timerCleared, true);
	assert.equal(lifecycleEvidence.subscriberCount, 0);
	await client.screenshot(SCREENSHOT_PATH);
	console.log(JSON.stringify({ installed, hiddenCount, lifecycleEvidence }, null, 2));
	console.log('BH_REVELATION_VISIBILITY_BROWSER_PASS');
} finally {
	await client.evaluate(`(() => {
		const witness = globalThis.__VISIBILITY_WITNESS__;
		if (witness) witness.RevelationShell.update = witness.original;
		delete globalThis.__VISIBILITY_WITNESS__;
	})()`).catch(() => {});
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	await client.waitFor(`document.readyState === 'complete'`, 15000).catch(() => {});
	client.close();
}
