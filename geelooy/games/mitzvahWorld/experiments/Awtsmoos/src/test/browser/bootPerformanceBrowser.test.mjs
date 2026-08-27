// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootPerformanceBrowser.test.mjs
 * @description Enforces bounded cold/warm play, veil release, connection, and rich settlement.
 * The Awtsmoos reveals movement before ornament and cache before repetition; Awtsmoos.com
 * keeps optional modules absent and treats transient observation stalls as missed samples only.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html';
const VEIL_OBSERVATION_BUDGET_MS = 5000;

test('B"H desktop cold and warm boot release play before rich settlement', {
	skip: !browserProofAvailable(),
	timeout: 240000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	try {
		const cold = await measure(browser, `${processValue.baseUrl}${gamePath}?run=cold`);
		const warm = await measure(browser, `${processValue.baseUrl}${gamePath}?run=warm`);
		console.log(`BOOT_RECEIPTS ${JSON.stringify({ cold, warm })}`);
		assert.ok(cold.playable < 45000);
		assert.ok(cold.connected < 35000);
		assert.ok(cold.fullReady < 65000);
		assert.ok(cold.veilReleased - cold.playable < VEIL_OBSERVATION_BUDGET_MS);
		assert.ok(warm.playable < 15000);
		assert.ok(warm.connected < 15000);
		assert.ok(warm.fullReady < 30000);
		assert.ok(warm.veilReleased - warm.playable < VEIL_OBSERVATION_BUDGET_MS);
		for (const receipt of [cold, warm]) {
			assert.equal(receipt.optionalApiLoaded, false);
			assert.equal(receipt.optionalMobileLoaded, false);
			assert.equal(receipt.apiState, 'deferred');
			assert.equal(receipt.mobileState, 'skipped-desktop');
		}
	} finally {
		await browser.stop();
		await processValue.stop();
	}
});

async function measure(browser, url) {
	const target = await browser.createTarget(`${url}-${Date.now()}`);
	const startedAt = Date.now();
	const receipt = {};
	try {
		const deadline = Date.now() + 90000;
		while (Date.now() < deadline) {
			let snapshot;
			try {
				snapshot = await browser.evaluate(
					target,
					snapshotExpression(),
					{ timeoutMs: 5000 }
				);
			} catch {
				await delay(100);
				continue;
			}
			const elapsed = Date.now() - startedAt;
			if (!receipt.playable && snapshot.playable) receipt.playable = elapsed;
			if (!receipt.veilReleased && snapshot.veilHidden) receipt.veilReleased = elapsed;
			if (!receipt.connected && snapshot.connected) receipt.connected = elapsed;
			if (!receipt.fullReady && snapshot.fullReady) receipt.fullReady = elapsed;
			if (receipt.connected && receipt.fullReady && receipt.veilReleased) {
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
		'optionalMobileLoaded'
	]) {
		receipt[key] = snapshot[key];
	}
}

function snapshotExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		const veil = document.querySelector('#menuBoot');
		const resources = performance.getEntriesByType('resource');
		const readiness = document.documentElement.dataset.awtsmoosReadiness;
		return {
			apiState: document.documentElement.dataset.awtsmoosApiExplorer || null,
			connected: value?.multiplayerDiagnostics?.().state === 'connected',
			fullReady: readiness === 'ready' || readiness === 'degraded-ready',
			mobileState: document.documentElement.dataset.awtsmoosMobileIntegration || null,
			optionalApiLoaded: resources.some(entry => entry.name.includes('MinimalUniversalApiExplorer')),
			optionalMobileLoaded: resources.some(entry => entry.name.includes('MinimalMeadowMobileIntegration')),
			playable: Boolean(value?.runtime && canvas?.clientWidth > 0 && canvas?.clientHeight > 0),
			veilHidden: veil ? getComputedStyle(veil).display === 'none' : true
		};
	})()`;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
