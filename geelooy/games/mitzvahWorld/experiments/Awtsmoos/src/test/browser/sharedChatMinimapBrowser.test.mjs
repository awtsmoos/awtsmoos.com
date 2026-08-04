// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sharedChatMinimapBrowser.test.mjs
 * @description Proves two real world pages share optional chat and one remote minimap peer.
 * The Awtsmoos joins distant browser vessels without denying solitary play; Awtsmoos.com
 * verifies collapsed choice, exact world message, local-tab transport, and one living map marker.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const worldPath = '/geelooy/games/mitzvahWorld/index.html?mode=world';
const message = 'B"H shared world chat proof';

test('B"H two real world pages exchange chat and see one remote minimap peer', {
	skip: !browserProofAvailable(),
	timeout: 240000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	const targets = [];
	try {
		for (const name of ['Chat Aleph', 'Chat Bet']) {
			targets.push(await browser.createTarget(
				`${processValue.baseUrl}${worldPath}&displayName=${encodeURIComponent(name)}`
			));
		}
		for (const [index, target] of targets.entries()) {
			const surface = await browser.waitFor(target, readyExpression(), {
				label: `CHAT_WORLD_SURFACE_${index}`,
				timeoutMs: 150000
			});
			assert.equal(surface.chatOpen, false);
			assert.equal(surface.peerMarkers, 1);
			assert.equal(surface.transport, 'local-tab');
			assert.equal(surface.minimapMounted, true);
		}
		await browser.evaluate(targets[0], `(() => {
			const root = document.querySelector('.Awtsmoos-chat');
			root.querySelector('[data-chat-toggle]').click();
			root.querySelector('[data-chat-message]').value = ${JSON.stringify(message)};
			root.querySelector('[data-chat-send]').click();
			return true;
		})()`);
		const received = await browser.waitFor(targets[1], messageExpression(), {
			label: 'REMOTE_CHAT_MESSAGE',
			timeoutMs: 10000
		});
		assert.match(received.text, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
	} finally {
		for (const target of targets) await browser.closeTarget(target).catch(() => {});
		await browser.stop();
		await processValue.stop();
	}
});

function readyExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const status = value?.multiplayerDiagnostics?.() || null;
		const chat = document.querySelector('.Awtsmoos-chat');
		const minimap = document.querySelector('.Awtsmoos-minimap');
		const peerMarkers = document.querySelectorAll('.Awtsmoos-map-marker[data-kind="peer"]').length;
		return {
			chatOpen: chat?.dataset.open === 'true',
			minimapMounted: Boolean(minimap),
			peerMarkers,
			ready: status?.state === 'connected' && Boolean(chat) && Boolean(minimap) && peerMarkers === 1,
			transport: status?.transport || null
		};
	})()`;
}

function messageExpression() {
	return `(() => {
		const text = document.querySelector('[data-chat-history]')?.textContent || '';
		return { ready: text.includes(${JSON.stringify(message)}), text };
	})()`;
}
