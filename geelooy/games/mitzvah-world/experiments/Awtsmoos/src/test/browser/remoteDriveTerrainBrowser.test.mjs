// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteDriveTerrainBrowser.test.mjs
 * @description Proves world districts attempt only canonical Drive textures after first control.
 * The Awtsmoos reveals color before pixels yet sends every real garment through one remote door;
 * Awtsmoos.com verifies manifest authority, settled attempts, finite degradation, and zero Git images.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { RUNTIME_MATERIALS } from '../../assets/RuntimeMaterialManifest.js';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html?mode=world';
const driveRoot = 'https://awtsmoos.com/sites/firebase_drive_migration/';

test('B"H ready multiplayer settles canonical Drive district texture attempts', {
	skip: !browserProofAvailable(),
	timeout: 180000
}, async () => {
	assertManifestAuthority();
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	let target = null;
	try {
		target = await browser.createTarget(
			`${processValue.baseUrl}${gamePath}&remoteDrive=${Date.now()}`
		);
		const receipt = await browser.waitFor(target, receiptExpression(), {
			label: 'REMOTE_DRIVE_DISTRICT_TEXTURES',
			timeoutMs: 120000,
			intervalMs: 200
		});
		console.log(`REMOTE_DRIVE_RECEIPT ${JSON.stringify(receipt)}`);
		assert.equal(receipt.session, 'multiplayer');
		assert.equal(receipt.status, 'connected');
		assert.equal(receipt.minimapMounted, true);
		assert.equal(receipt.chatMounted, true);
		assert.equal(receipt.districtStatus, 'ready');
		assert.equal(receipt.districtsCompleted, 3);
		assert.ok(receipt.attemptedRoles > 0);
		assert.equal(receipt.settledRoles, receipt.attemptedRoles);
		assert.deepEqual(receipt.remotePolicies, ['attempted']);
		assert.deepEqual(receipt.localTextureResources, []);
		assert.equal(receipt.loadedRoles > 0, receipt.remoteBindings > 0);
	} finally {
		if (target) await browser.closeTarget(target).catch(() => {});
		await browser.stop();
		await processValue.stop();
	}
});

function assertManifestAuthority() {
	assert.ok(RUNTIME_MATERIALS.length > 0);
	for (const material of RUNTIME_MATERIALS) {
		assert.equal(material.primaryUrl.startsWith(driveRoot), true, material.role);
		for (const fallback of material.fallbackUrls) {
			assert.equal(fallback.startsWith(driveRoot), true, material.role);
		}
	}
}

function receiptExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const runtime = value?.runtime || null;
		const state = runtime?.districtStreaming || null;
		const districts = Object.values(state?.districts || {});
		const receipts = districts.map(district => district.textures).filter(Boolean);
		const remoteRecords = receipts.flatMap(receipt => receipt.remote?.records || []);
		const resources = performance.getEntriesByType('resource').map(entry => entry.name);
		const remotePolicies = [...new Set(receipts.map(receipt => receipt.remote?.policy).filter(Boolean))];
		const attemptedRoles = remoteRecords.length;
		const settledRoles = remoteRecords.filter(record => record.loaded || record.error).length;
		const loadedRoles = remoteRecords.filter(record => record.loaded).length;
		return {
			attemptedRoles,
			chatMounted: Boolean(document.querySelector('.Awtsmoos-chat')),
			districtsCompleted: state?.completed || 0,
			districtStatus: state?.status || null,
			loadedRoles,
			localTextureResources: resources.filter(name => {
				return name.includes('local-textures')
					|| name.includes('/assets/materials/local/world/');
			}),
			minimapMounted: Boolean(document.querySelector('.Awtsmoos-minimap')),
			ready: value?.multiplayerDiagnostics?.().state === 'connected'
				&& state?.status === 'ready'
				&& receipts.length === state?.total
				&& receipts.every(receipt => receipt.remote?.status !== 'pending'),
			remoteBindings: receipts.reduce((sum, receipt) => {
				return sum + (receipt.remote?.mapImagesBound || 0);
			}, 0),
			remotePolicies,
			session: value?.sessionMode || null,
			settledRoles,
			status: value?.multiplayerDiagnostics?.().state || null
		};
	})()`;
}
