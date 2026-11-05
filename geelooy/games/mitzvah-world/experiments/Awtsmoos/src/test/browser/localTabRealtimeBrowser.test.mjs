// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localTabRealtimeBrowser.test.mjs
 * @description Proves the production local-tab client across two real browser documents.
 * The Awtsmoos gives each tab a distinct vessel within one shared world; Awtsmoos.com verifies
 * discovery, exact movement, and departure through native BroadcastChannel behavior.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const harnessPath = '/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/browser/LocalTabRealtimeHarness.html';
const modulePath = '/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/network/LocalTabRealtimeClient.js';

test('B"H two real tabs exchange exact production realtime state', {
	skip: !browserProofAvailable(),
	timeout: 60000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	const worldId = `browser-contract-${Date.now()}`;
	const targets = {};
	try {
		for (const name of ['Aleph', 'Bet']) {
			targets[name] = await browser.createTarget(
				`${processValue.baseUrl}${harnessPath}?tab=${name}`
			);
			await browser.waitFor(targets[name], `({
				ready: document.readyState === 'complete' && location.search.includes('tab=${name}')
			})`, { label: `${name}_DOCUMENT`, timeoutMs: 10000 });
			await browser.evaluate(targets[name], `(async () => {
				const module = await import(${JSON.stringify(`${processValue.baseUrl}${modulePath}`)});
				const client = new module.LocalTabRealtimeClient({
					heartbeatIntervalMs: 100,
					identityScope: globalThis
				});
				globalThis.proofClient = client;
				await client.join({
					displayName: ${JSON.stringify(name)},
					playerState: { position: { x: 0, y: 0, z: 0 }, facing: 0, moving: false },
					worldId: ${JSON.stringify(worldId)}
				});
				return true;
			})()`, { awaitPromise: true });
		}
		const snapshots = {};
		for (const name of ['Aleph', 'Bet']) {
			snapshots[name] = await browser.waitFor(targets[name], `(() => ({
				id: proofClient.playerId,
				ready: proofClient.world.players.length === 2,
				world: proofClient.world
			}))()`, { label: `${name}_DISCOVERY`, timeoutMs: 10000 });
		}
		assert.notEqual(snapshots.Aleph.id, snapshots.Bet.id);
		await browser.evaluate(targets.Aleph, `proofClient.updatePlayerState({
			position: { x: 12.5, y: 3, z: -7.25 },
			facing: 1.1,
			moving: true,
			runMode: true
		})`, { awaitPromise: true });
		const replicated = await browser.waitFor(targets.Bet, `(() => {
			const remote = proofClient.world.players.find(value => value.id !== proofClient.playerId);
			return {
				ready: remote?.position?.x === 12.5
					&& remote?.position?.y === 3
					&& remote?.position?.z === -7.25
					&& remote?.facing === 1.1
					&& remote?.moving === true,
				remote
			};
		})()`, { label: 'TRANSFORM', timeoutMs: 5000 });
		assert.equal(replicated.remote.runMode, true);
		await browser.evaluate(targets.Aleph, 'proofClient.stop(); true');
		const left = await browser.waitFor(targets.Bet, `({
			ready: proofClient.world.players.length === 1,
			world: proofClient.world
		})`, { label: 'LEAVE', timeoutMs: 5000 });
		assert.equal(left.world.players[0].id, snapshots.Bet.id);
	} finally {
		await browser.stop();
		await processValue.stop();
	}
});
