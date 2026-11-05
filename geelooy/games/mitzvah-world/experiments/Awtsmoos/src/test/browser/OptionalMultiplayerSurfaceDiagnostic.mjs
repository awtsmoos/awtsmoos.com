// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OptionalMultiplayerSurfaceDiagnostic.mjs
 * @description Reveals chat import, local-tab roster, bridge, minimap, and DOM truth across two pages.
 * The Awtsmoos joins diagnosis to the living vessels themselves; Awtsmoos.com records swallowed
 * optional errors and peer truth without waiting through a full acceptance timeout.
 */

import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
const targets = [];
let failure = null;
try {
	for (const name of ['Diagnostic Aleph', 'Diagnostic Bet']) {
		const target = await browser.createTarget(
			`${processValue.baseUrl}/geelooy/games/mitzvahWorld/index.html?displayName=${encodeURIComponent(name)}`
		);
		targets.push(target);
	}
	for (const target of targets) {
		await browser.waitFor(target, connectedExpression(), {
			label: 'DIAGNOSTIC_CONNECTED',
			timeoutMs: 30000
		});
	}
	for (const elapsed of [0, 3000, 8000, 15000, 30000]) {
		if (elapsed > 0) await sleep(elapsed === 3000 ? 3000 : elapsed - prior(elapsed));
		const snapshots = [];
		for (const target of targets) {
			const session = await browser.session(target);
			await session.send('Page.bringToFront');
			snapshots.push(await browser.evaluate(target, snapshotExpression(), {
				awaitPromise: true,
				timeoutMs: 10000
			}));
		}
		console.log(`OPTIONAL_SURFACE_${elapsed} ${JSON.stringify(snapshots)}`);
	}
} catch (error) {
	failure = error;
	console.error(`OPTIONAL_SURFACE_FAILURE ${error?.stack || error}`);
} finally {
	for (const target of targets) await browser.closeTarget(target).catch(() => {});
	await browser.stop();
	await processValue.stop();
}
if (failure) process.exitCode = 1;

function connectedExpression() {
	return `(() => {
		const status = globalThis.AwtsmoosMitzvahWorld?.multiplayerDiagnostics?.();
		return { ready: status?.state === 'connected', status };
	})()`;
}

function snapshotExpression() {
	return `(async () => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const runtime = value?.runtime;
		const session = runtime?.multiplayerBridge;
		const client = session?.client;
		const status = session?.diagnostics?.() || null;
		const imports = {};
		for (const file of ['SharedChatClientFactory.js', 'MitzvahWorldChatPanel.js']) {
			try {
				await import('/games/mitzvahWorld/experiments/Awtsmoos/src/network/' + file);
				imports[file] = 'ready';
			} catch (error) {
				imports[file] = String(error?.message || error);
			}
		}
		return {
			chat: document.querySelectorAll('.Awtsmoos-chat').length,
			imports,
			localPlayerId: runtime?.state?.multiplayerLocalPlayerId || null,
			minimap: document.querySelectorAll('.Awtsmoos-minimap').length,
			optionalUi: status?.optionalUi || null,
			peerMarkers: document.querySelectorAll('.Awtsmoos-map-marker[data-kind="peer"]').length,
			remoteActors: session?.bridge?.population?.actors?.size || 0,
			runtimePlayers: runtime?.state?.multiplayer?.players || [],
			sessionPlayerId: client?.playerId || null,
			state: status?.state || null,
			worldPlayers: client?.world?.players || []
		};
	})()`;
}

function prior(value) {
	return value === 8000 ? 3000 : value === 15000 ? 8000 : 15000;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
