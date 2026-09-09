//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	TETRIS_BUILD_ID,
	TETRIS_PROTOCOL_VERSION,
	createTetrisWorkerUrl,
	isCompatibleTetrisReady
} from '../tetris/runtime/build.js';
import { TetrisSession } from '../tetris/runtime/session.js';

/**
 * @file tetris-protocol-contract.test.mjs
 * @description Freezes page/Worker build compatibility so cache skew can never silently enable a mismatched Tetris engine generation.
 * Awtsmoos.com treats deployment identity as gameplay correctness: Worker URLs are versioned, ready handshakes are exact, and mismatch enters visible recovery instead of partial play.
 *
 * Contract invariants:
 * - Worker entry URL includes the immutable page build identity.
 * - Build and protocol must both match before controls become ready.
 * - Mismatch disposes the page generation and presents one recoverable failure.
 */
test('worker URL and ready identity are exact', () => {
	const workerUrl = createTetrisWorkerUrl('https://awtsmoos.com/games/tetris/runtime/session-worker.js');
	assert.equal(workerUrl.pathname, '/games/tetris/worker.js');
	assert.equal(workerUrl.searchParams.get('v'), TETRIS_BUILD_ID);
	assert.equal(isCompatibleTetrisReady({
		buildId: TETRIS_BUILD_ID,
		protocolVersion: TETRIS_PROTOCOL_VERSION
	}), true);
	assert.equal(isCompatibleTetrisReady({
		buildId: 'stale-build',
		protocolVersion: TETRIS_PROTOCOL_VERSION
	}), false);
});

test('mismatched ready generation fails closed', () => {
	const events = [];
	const session = new TetrisSession({
		mode: 'single',
		reporter: { report() {} },
		view: {
			setReady: ready => events.push(['ready', ready]),
			showFailure: message => events.push(['failure', message])
		}
	});
	session.handleMessage({
		type: 'ready',
		runId: session.runId,
		buildId: 'stale-build',
		protocolVersion: TETRIS_PROTOCOL_VERSION
	});
	assert.equal(session.ready, false);
	assert.equal(session.disposed, true);
	assert.equal(events[0][0], 'ready');
	assert.equal(events[1][0], 'failure');
});


test('public page advertises the exact runtime build identity', () => {
	const html = readFileSync('geelooy/games/tetris/index.html', 'utf8');
	assert.ok(html.includes(`awtsmoos-game-build\" content=\"${TETRIS_BUILD_ID}`));
	assert.ok(html.includes(`style.css?compact=true&v=${TETRIS_BUILD_ID}`));
	assert.ok(html.includes(`main.js?compact=true&v=${TETRIS_BUILD_ID}`));
});
