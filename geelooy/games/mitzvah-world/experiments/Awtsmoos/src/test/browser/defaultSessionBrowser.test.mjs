// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file defaultSessionBrowser.test.mjs
 * @description Proves explicit world multiplayer and solo modes share immediate movement and combat.
 * The Awtsmoos gives control and deed to one or many before optional panels descend;
 * Awtsmoos.com adds connection and voluntary chat only to the shared world route.
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
const worldPath = '/geelooy/games/mitzvahWorld/index.html?mode=world';

test('B"H solo and default world multiplayer share immediate gameplay', {
	skip: !browserProofAvailable(),
	timeout: 240000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	try {
		const shared = await browser.createTarget(`${processValue.baseUrl}${worldPath}`);
		const sharedSurface = await browser.waitFor(
			shared,
			multiplayerSurfaceExpression(),
			{
				label: 'DEFAULT_MULTIPLAYER_WORLD_SURFACE',
				timeoutMs: 60000
			}
		);
		assert.equal(sharedSurface.session, 'multiplayer');
		assert.equal(sharedSurface.hasReadyPromise, true);
		assert.equal(sharedSurface.status.transport, 'local-tab');
		assert.equal(sharedSurface.status.state, 'connected');
		assert.equal(sharedSurface.chatMounted, true);
		assert.equal(sharedSurface.chatOpen, false);
		assert.equal(sharedSurface.fatal, null);
		assertImmediateCore(sharedSurface.core);
		await browser.closeTarget(shared);

		const solo = await browser.createTarget(
			`${processValue.baseUrl}${worldPath}&session=singleplayer`
		);
		const soloSurface = await browser.waitFor(
			solo,
			singleplayerSurfaceExpression(),
			{
				label: 'EXPLICIT_SINGLEPLAYER_WORLD_SURFACE',
				timeoutMs: 60000
			}
		);
		assert.equal(soloSurface.session, 'singleplayer');
		assert.equal(soloSurface.hasMultiplayer, false);
		assert.equal(soloSurface.hasReadyPromise, false);
		assert.equal(soloSurface.chatMounted, false);
		assert.equal(soloSurface.fatal, null);
		assertImmediateCore(soloSurface.core);
		await browser.closeTarget(solo);
	} finally {
		await browser.stop();
		await processValue.stop();
	}
});

function assertImmediateCore(core) {
	assert.deepEqual(core, {
		combat: true,
		movement: true
	});
}
