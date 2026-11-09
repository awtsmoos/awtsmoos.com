// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldPlayablePublisher.test.mjs
 * @description Executes strict publication from the same world-loading predecessor production reaches before ready.
 * The Awtsmoos joins every witness before one truthful word may shine;
 * Awtsmoos.com guards movement, grounding, camera, and the legal boot road that living browsers must actually traverse.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { publishMitzvahWorldPlayable } from '../../launcher/MitzvahWorldPlayablePublisher.js';
import { prepareMitzvahWorldWorldLoading } from './MitzvahWorldBootStateTestHarness.mjs';
import {
	cleanupPlayablePublisherVessel,
	completePlayablePublisherEssentials,
	createPlayableDiagnostics,
	createPlayablePublisherVessel
} from './MitzvahWorldPlayablePublisherHarness.mjs';

test('production-shaped bootstrap diagnostics publish after the movement prime', () => {
	const vessel = readyPublisherVessel();
	let activated = 0;
	const diagnostics = createPlayableDiagnostics();
	diagnostics.activatePostPlayable = () => { activated += 1; };
	assert.equal(diagnostics.runtime.movement, undefined);
	assert.equal(diagnostics.runtime.cameraRig, undefined);
	const first = publishMitzvahWorldPlayable(diagnostics, vessel.options);
	const second = publishMitzvahWorldPlayable(diagnostics, vessel.options);
	assert.equal(first.ready, true);
	assert.equal(first.physical.controlFrames, 1);
	assert.equal(first.physical.cameraMode, 'bootstrap-rig');
	assert.equal(second, first);
	assert.equal(vessel.finishCount(), 1);
	assert.equal(activated, 1);
	assert.equal(vessel.root.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(vessel.root.dataset.awtsmoosGameplay, 'true');
	assert.equal(vessel.overlay.hidden, true);
	cleanupPlayablePublisherVessel(vessel.environment);
});

test('missing grounded proof blocks loader dismissal and publication', () => {
	const vessel = readyPublisherVessel();
	const diagnostics = createPlayableDiagnostics();
	diagnostics.runtime.state.grounded = false;
	assert.throws(
		() => publishMitzvahWorldPlayable(diagnostics, vessel.options),
		/canonical-player-grounded/
	);
	assert.equal(vessel.finishCount(), 0);
	assert.notEqual(vessel.root.dataset.awtsmoosRuntimeState, 'playable');
	cleanupPlayablePublisherVessel(vessel.environment);
});

test('missing top-level movement prime reproduces the original mobile blocker exactly', () => {
	const vessel = readyPublisherVessel();
	const diagnostics = createPlayableDiagnostics();
	diagnostics.movement = null;
	assert.throws(
		() => publishMitzvahWorldPlayable(diagnostics, vessel.options),
		/camera-attached, movement-input-accepted/
	);
	assert.equal(vessel.finishCount(), 0);
	cleanupPlayablePublisherVessel(vessel.environment);
});

function readyPublisherVessel() {
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
	prepareMitzvahWorldWorldLoading(vessel.environment, vessel.options.documentValue);
	return vessel;
}
