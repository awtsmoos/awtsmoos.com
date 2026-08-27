// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteDriveTerrainBrowser.test.mjs
 * @description Proves gameplay is ready before canonical remote terrain enrichment begins.
 * The Awtsmoos reveals one playable meadow before distant images settle; Awtsmoos.com verifies
 * multiplayer, core systems, map, chat, remote URL authority, delayed hydration, and no Git assets.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html';
const driveBase = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/';

test('B"H ready multiplayer begins remote Drive terrain without Git asset substitution', {
	skip: !browserProofAvailable(),
	timeout: 180000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	let target = null;
	try {
		target = await browser.createTarget(
			`${processValue.baseUrl}${gamePath}?remoteDrive=${Date.now()}`
		);
		const receipt = await browser.waitFor(target, receiptExpression(), {
			label: 'REMOTE_DRIVE_POST_READY',
			timeoutMs: 120000,
			intervalMs: 200
		});
		assert.equal(receipt.session, 'multiplayer');
		assert.equal(receipt.status, 'connected');
		assert.equal(receipt.minimapMounted, true);
		assert.equal(receipt.chatMounted, true);
		assert.equal(receipt.canonicalRemote, true);
		assert.equal(receipt.urlCount, 13);
		assert.deepEqual(receipt.localTextureResources, []);
		assert.equal(receipt.transport.fallbackAssetFiles, 0);
		assert.equal(receipt.transport.origin, 'https://awtsmoos.com');
		assert.equal(receipt.transport.policy, 'remote-authoritative-fallback-colors-only');
	} finally {
		if (target) await browser.closeTarget(target).catch(() => {});
		await browser.stop();
		await processValue.stop();
	}
});

function receiptExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const runtime = value?.runtime;
		const ui = runtime?.ui?.diagnostics?.() || null;
		const phase = runtime?.terrain?.textureHydration?.diagnostics?.().phase || null;
		const resources = performance.getEntriesByType('resource').map(entry => entry.name);
		const urls = runtime?.terrain?.stats?.textureSources?.urls || [];
		const core = ui?.coordinated?.capabilities?.core || null;
		return {
			canonicalRemote: urls.length > 0 && urls.every(name => name.startsWith(${JSON.stringify(driveBase)})),
			chatMounted: Boolean(document.querySelector('.Awtsmoos-chat')),
			core,
			localTextureResources: resources.filter(name => name.includes('/assets/materials/local/world/full-resolution/')),
			minimapMounted: Boolean(document.querySelector('.Awtsmoos-minimap')),
			phase,
			readiness: document.documentElement.dataset.awtsmoosReadiness || null,
			ready: Boolean(core)
				&& Object.values(core).every(Boolean)
				&& ['ready', 'degraded-ready'].includes(document.documentElement.dataset.awtsmoosReadiness)
				&& phase !== 'deferred'
				&& urls.length === 13,
			session: document.documentElement.dataset.awtsmoosSession || null,
			status: value?.multiplayerDiagnostics?.().state || null,
			transport: runtime?.terrain?.stats?.textureSources?.transport || null,
			urlCount: urls.length
		};
	})()`;
}
