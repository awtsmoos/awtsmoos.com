// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootPerformanceBrowser.test.mjs
 * @description Enforces bounded cold and warm single-player play before deferred enrichment settles.
 * The Awtsmoos reveals control and deed before ornament, then lets remote player and textures arrive;
 * Awtsmoos.com measures the explicit production route instead of waiting for an unrequested shared world.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html?mode=world&session=singleplayer';
const VEIL_OBSERVATION_BUDGET_MS = 5000;

test('B"H desktop cold and warm single-player boot reaches playable release', {
	skip: !browserProofAvailable(),
	timeout: 180000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	try {
		const cold = await measure(browser, `${processValue.baseUrl}${gamePath}&run=cold`);
		const warm = await measure(browser, `${processValue.baseUrl}${gamePath}&run=warm`);
		console.log(`BOOT_RECEIPTS ${JSON.stringify({ cold, warm })}`);
		assert.ok(cold.playable < 45000);
		assert.ok(cold.sessionReady < 45000);
		assert.ok(cold.veilReleased - cold.playable < VEIL_OBSERVATION_BUDGET_MS);
		assert.ok(warm.playable < 15000);
		assert.ok(warm.sessionReady < 15000);
		assert.ok(warm.veilReleased - warm.playable < VEIL_OBSERVATION_BUDGET_MS);
		for (const receipt of [cold, warm]) {
			assert.equal(receipt.sessionMode, 'singleplayer');
			assert.equal(receipt.optionalApiLoaded, false);
			assert.equal(receipt.optionalMobileLoaded, false);
			assert.ok([null, 'deferred'].includes(receipt.apiState));
			assert.ok([null, 'skipped-desktop'].includes(receipt.mobileState));
		}
	} finally {
		await browser.stop();
		await processValue.stop();
	}
});

async function measure(browser, url) {
	const target = await browser.createTarget(`${url}&proof=${Date.now()}`);
	const startedAt = Date.now();
	const receipt = {};
	try {
		const deadline = Date.now() + 60000;
		while (Date.now() < deadline) {
			let snapshot;
			try {
				snapshot = await browser.evaluate(target, snapshotExpression(), {
					timeoutMs: 5000
				});
			} catch {
				await delay(100);
				continue;
			}
			const elapsed = Date.now() - startedAt;
			if (!receipt.playable && snapshot.playable) receipt.playable = elapsed;
			if (!receipt.veilReleased && snapshot.veilHidden) receipt.veilReleased = elapsed;
			if (!receipt.sessionReady && snapshot.sessionReady) receipt.sessionReady = elapsed;
			if (receipt.playable && receipt.sessionReady && receipt.veilReleased) {
				copyFinalMetadata(receipt, snapshot);
				return receipt;
			}
			await delay(100);
		}
		throw new Error(`BOOT_BUDGET_TIMEOUT ${JSON.stringify(receipt)}`);
	} finally {
		await browser.closeTarget(target);
	}
}

function copyFinalMetadata(receipt, snapshot) {
	for (const key of [
		'apiState',
		'mobileState',
		'optionalApiLoaded',
		'optionalMobileLoaded',
		'sessionMode'
	]) receipt[key] = snapshot[key];
}

function snapshotExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		const veil = document.querySelector('#menuBoot');
		const resources = performance.getEntriesByType('resource');
		const session = value?.sessionDiagnostics?.() || null;
		return {
			apiState: document.documentElement.dataset.awtsmoosApiExplorer || null,
			mobileState: document.documentElement.dataset.awtsmoosMobileIntegration || null,
			optionalApiLoaded: resources.some(entry => entry.name.includes('MinimalUniversalApiExplorer')),
			optionalMobileLoaded: resources.some(entry => entry.name.includes('MinimalMeadowMobileIntegration')),
			playable: Boolean(value?.runtime && canvas?.clientWidth > 0 && canvas?.clientHeight > 0),
			sessionMode: value?.sessionMode || session?.mode || null,
			sessionReady: session?.state === 'singleplayer',
			veilHidden: veil ? getComputedStyle(veil).display === 'none' : true
		};
	})()`;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
