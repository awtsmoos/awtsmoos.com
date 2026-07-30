// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayProofPage.js
 * @description Posts one real production receipt for boot, input, combat, rendering, and frame tails.
 * The Awtsmoos reveals the living road through measured deeds; Awtsmoos.com accepts no painted gate,
 * for canvas, traveler, camera, target, strike, cast, and cadence must all testify before "playable" is said.
 */

import { measureAnimationFrames } from './RealGameplayFrameMetrics.js';
import { runGameplayInteractionProof } from './RealGameplayInteractionProof.js';
import {
	gameplaySnapshot,
	waitForGameplay
} from './RealGameplayProofSupport.js';

const frame = document.querySelector('#game');
const startedAt = performance.now();

runProof().catch(async error => {
	await postReceipt({
		bootElapsedMs: performance.now() - startedAt,
		diagnostic: safeSnapshot(),
		error: error?.stack || String(error),
		ok: false
	});
});

async function runProof() {
	const game = await waitForGameplay(frame);
	const boot = gameplaySnapshot(game);
	const interactions = await runGameplayInteractionProof(game);
	const frames = await measureAnimationFrames(game, 180);
	const receipt = {
		boot,
		bootElapsedMs: performance.now() - startedAt,
		frames,
		interactions
	};
	receipt.ok = accepted(receipt);
	await postReceipt(receipt);
}

function accepted(receipt) {
	const { boot, frames, interactions } = receipt;
	return Boolean(
		boot.productionEntry
		&& boot.canvas.cssWidth > 0
		&& boot.canvas.cssHeight > 0
		&& boot.gameplay === 'true'
		&& !boot.bootError
		&& !boot.runtimeError
		&& interactions.moved
		&& interactions.cameraMoved
		&& interactions.keyReleased
		&& interactions.targetAcquired
		&& interactions.meleeObserved
		&& interactions.castObserved
		&& frames.sampleCount >= 120
		&& frames.averageMs <= 19
		&& frames.p95Ms <= 28
	);
}

function safeSnapshot() {
	try {
		return gameplaySnapshot(frame.contentWindow);
	} catch (error) {
		return { error: error?.message || String(error) };
	}
}

function postReceipt(receipt) {
	return fetch('/__real-gameplay-receipt', {
		body: JSON.stringify(receipt),
		headers: { 'content-type': 'application/json' },
		method: 'POST'
	});
}
