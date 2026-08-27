// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fullScreenMapModerationBrowser.test.mjs
 * @description Proves full-screen map modes and message-selected local-tab mute/unmute.
 * The Awtsmoos lets two real pages share place and speech while each vessel keeps choice;
 * Awtsmoos.com verifies evidence selection, filtered history, restored delivery, and Escape return.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html';

test('B"H real pages use full map and personal chat protection', {
	skip: !browserProofAvailable(),
	timeout: 240000
}, async () => {
	const processValue = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
	const targets = [];
	try {
		for (const name of ['Map Aleph', 'Map Bet']) {
			targets.push(await browser.createTarget(
				`${processValue.baseUrl}${gamePath}?displayName=${encodeURIComponent(name)}`
			));
		}
		for (const target of targets) {
			await browser.waitFor(target, readyExpression(), {
				label: 'MAP_MODERATION_SURFACE',
				timeoutMs: 150000
			});
		}
		await browser.evaluate(targets[1], mapModeExpression());
		const map = await browser.waitFor(targets[1], fullscreenExpression(), {
			label: 'FULLSCREEN_MAP',
			timeoutMs: 5000
		});
		assert.equal(map.mode, 'fullscreen');
		await browser.evaluate(targets[1], escapeMapExpression());
		assert.equal(
			(await browser.evaluate(targets[1], mapSnapshotExpression())).mode,
			'expanded'
		);
		await send(browser, targets[0], 'first protected message');
		await browser.waitFor(targets[1], messageExpression('first protected message'), {
			label: 'FIRST_MESSAGE',
			timeoutMs: 10000
		});
		await browser.evaluate(targets[1], selectAndMuteExpression());
		await browser.waitFor(targets[1], mutedExpression(), {
			label: 'MUTED_SENDER',
			timeoutMs: 5000
		});
		await send(browser, targets[0], 'second hidden message');
		await new Promise(resolve => setTimeout(resolve, 500));
		assert.equal(
			(await browser.evaluate(targets[1], historyTextExpression()))
				.includes('second hidden message'),
			false
		);
		await browser.evaluate(targets[1], unmuteExpression());
		await send(browser, targets[0], 'third visible message');
		await browser.waitFor(targets[1], messageExpression('third visible message'), {
			label: 'UNMUTED_MESSAGE',
			timeoutMs: 10000
		});
	} finally {
		for (const target of targets) await browser.closeTarget(target).catch(() => {});
		await browser.stop();
		await processValue.stop();
	}
});

function readyExpression() {
	return `(() => ({
		ready: globalThis.AwtsmoosMitzvahWorld?.multiplayerDiagnostics?.().state === 'connected'
			&& Boolean(document.querySelector('.Awtsmoos-chat'))
			&& Boolean(document.querySelector('.Awtsmoos-minimap'))
			&& document.querySelectorAll('[data-kind="peer"]').length === 1
	}))()`;
}

function mapModeExpression() {
	return `(() => { document.querySelector('[data-map-fullscreen]').click(); return true; })()`;
}

function fullscreenExpression() {
	return `(() => { const mode = document.querySelector('.Awtsmoos-minimap')?.dataset.mode; return { mode, ready: mode === 'fullscreen' }; })()`;
}

function escapeMapExpression() {
	return `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true; })()`;
}

function mapSnapshotExpression() {
	return `({ mode: document.querySelector('.Awtsmoos-minimap')?.dataset.mode || null })`;
}

async function send(browser, target, message) {
	await browser.evaluate(target, `(() => { const root = document.querySelector('.Awtsmoos-chat'); if (root.dataset.open !== 'true') root.querySelector('[data-chat-toggle]').click(); root.querySelector('[data-chat-message]').value = ${JSON.stringify(message)}; root.querySelector('[data-chat-send]').click(); return true; })()`);
}

function messageExpression(message) {
	return `(() => { const text = document.querySelector('[data-chat-history]')?.textContent || ''; return { ready: text.includes(${JSON.stringify(message)}), text }; })()`;
}

function selectAndMuteExpression() {
	return `(() => { const root = document.querySelector('.Awtsmoos-chat'); if (root.dataset.open !== 'true') root.querySelector('[data-chat-toggle]').click(); const line = root.querySelector('[data-player-address]'); line.click(); root.querySelector('[data-chat-moderation-action="mute"]').click(); return true; })()`;
}

function mutedExpression() {
	return `(() => { const text = document.querySelector('[data-chat-moderation-status]')?.textContent || ''; return { ready: text.startsWith('1 muted'), text }; })()`;
}

function unmuteExpression() {
	return `(() => { document.querySelector('[data-chat-moderation-action="unmute"]').click(); return true; })()`;
}

function historyTextExpression() {
	return `document.querySelector('[data-chat-history]')?.textContent || ''`;
}
