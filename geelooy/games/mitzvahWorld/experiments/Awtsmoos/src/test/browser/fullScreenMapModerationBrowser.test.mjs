// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fullScreenMapModerationBrowser.test.mjs
 * @description Proves concurrent readiness, map modes, and local moderation with explicit page focus.
 * The Awtsmoos lets two real pages share place and speech while each vessel receives its visible turn;
 * Awtsmoos.com foregrounds every mutation and check so hidden renderers cannot swallow finite replies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { browserProofAvailable, startBrowserProof } from './BrowserProofProcess.mjs';
import {
	escapeMapExpression,
	fullscreenExpression,
	historyTextExpression,
	mapModeExpression,
	mapSnapshotExpression,
	messageExpression,
	mutedExpression,
	readyExpression,
	selectAndMuteExpression,
	sendExpression,
	unmuteExpression
} from './FullScreenMapModerationExpressions.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const gamePath = '/geelooy/games/mitzvahWorld/index.html';

test('B"H real pages use full map and personal chat protection', {
	skip: !browserProofAvailable(),
	timeout: 300000
}, async () => {
	const proof = await startBrowserProof(repositoryRoot);
	const browser = await new BrowserCdpHarness(proof.cdpPort).start();
	const targets = [];
	try {
		for (const name of ['Map Aleph', 'Map Bet']) {
			targets.push(await browser.createTarget(
				`${proof.baseUrl}${gamePath}?displayName=${encodeURIComponent(name)}`
			));
		}
		await Promise.all(targets.map(target => browser.waitFor(target, readyExpression(), {
			label: 'MAP_MODERATION_SURFACE', timeoutMs: 150000
		})));
		stage('surfaces-ready');
		await focus(browser, targets[1]);
		await browser.evaluate(targets[1], mapModeExpression());
		assert.equal((await browser.waitFor(targets[1], fullscreenExpression(), {
			label: 'FULLSCREEN_MAP', timeoutMs: 5000
		})).mode, 'fullscreen');
		await browser.evaluate(targets[1], escapeMapExpression());
		assert.equal((await browser.evaluate(targets[1], mapSnapshotExpression())).mode, 'expanded');
		stage('map-modes-ready');
		await send(browser, targets[0], 'first protected message');
		await focus(browser, targets[1]);
		await browser.waitFor(targets[1], messageExpression('first protected message'), {
			label: 'FIRST_MESSAGE', timeoutMs: 10000
		});
		await browser.evaluate(targets[1], selectAndMuteExpression());
		await browser.waitFor(targets[1], mutedExpression(), {
			label: 'MUTED_SENDER', timeoutMs: 5000
		});
		stage('sender-muted');
		await send(browser, targets[0], 'second hidden message');
		await new Promise(resolve => setTimeout(resolve, 500));
		await focus(browser, targets[1]);
		assert.equal((await browser.evaluate(targets[1], historyTextExpression())).includes('second hidden message'), false);
		await browser.evaluate(targets[1], unmuteExpression());
		await send(browser, targets[0], 'third visible message');
		await focus(browser, targets[1]);
		await browser.waitFor(targets[1], messageExpression('third visible message'), {
			label: 'UNMUTED_MESSAGE', timeoutMs: 10000
		});
		stage('moderation-restored');
	} finally {
		for (const target of targets) await browser.closeTarget(target).catch(() => {});
		await browser.stop();
		await proof.stop();
	}
});

async function send(browser, target, message) {
	await focus(browser, target);
	return browser.evaluate(target, sendExpression(message));
}

function focus(browser, target) {
	return browser.bringToFront(target);
}

function stage(name) {
	console.log(`MAP_MODERATION_STAGE ${name}`);
}
