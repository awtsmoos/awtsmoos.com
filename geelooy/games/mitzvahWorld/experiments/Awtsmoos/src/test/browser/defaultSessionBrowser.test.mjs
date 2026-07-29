// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file defaultSessionBrowser.test.mjs
 * @description Proves shared core parity, default multiplayer, solo purity, map, and optional chat.
 * The Awtsmoos gives movement, combat, quests, inventory, and direction to one or many;
 * Awtsmoos.com adds connection, peers, and voluntary conversation only to the shared road.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import {
	multiplayerSurfaceExpression,
	singleplayerSurfaceExpression
} from './DefaultSessionBrowserExpressions.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html';

test('B"H solo and default multiplayer share the same core gameplay surface', {
	skip: !browserProofAvailable(),
	timeout: 240000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	try {
		const shared = await browser.createTarget(`${processValue.baseUrl}${gamePath}`);
		const sharedSurface = await browser.waitFor(shared, multiplayerSurfaceExpression(), {
			label: 'DEFAULT_MULTIPLAYER_SURFACE',
			timeoutMs: 150000
		});
		assert.equal(sharedSurface.session, 'multiplayer');
		assert.equal(sharedSurface.hasReadyPromise, true);
		assert.equal(sharedSurface.status.transport, 'local-tab');
		assert.equal(sharedSurface.status.state, 'connected');
		assert.equal(sharedSurface.minimapMounted, true);
		assert.equal(sharedSurface.chatMounted, true);
		assert.equal(sharedSurface.chatOpen, false);
		assert.equal(sharedSurface.fatal, null);
		assertCore(sharedSurface.capabilities.core);
		await browser.closeTarget(shared);

		const solo = await browser.createTarget(
			`${processValue.baseUrl}${gamePath}?session=singleplayer`
		);
		const soloSurface = await browser.waitFor(solo, singleplayerSurfaceExpression(), {
			label: 'EXPLICIT_SINGLEPLAYER_SURFACE',
			timeoutMs: 150000
		});
		assert.equal(soloSurface.session, 'singleplayer');
		assert.equal(soloSurface.hasMultiplayer, false);
		assert.equal(soloSurface.hasReadyPromise, false);
		assert.equal(soloSurface.minimapMounted, true);
		assert.equal(soloSurface.chatMounted, false);
		assert.equal(soloSurface.fatal, null);
		assertCore(soloSurface.capabilities.core);
		await browser.closeTarget(solo);
	} finally {
		await browser.stop();
		await processValue.stop();
	}
});

function assertCore(core) {
	assert.deepEqual(core, {
		combat: true,
		inventory: true,
		minimap: true,
		movement: true,
		quests: true
	});
}
