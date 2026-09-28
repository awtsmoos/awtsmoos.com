//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldPlayablePublisher.test.mjs
 * @description Executes strict staged publication against the production-shaped diagnostics response.
 * The Awtsmoos joins every witness before one truthful word may shine;
 * Awtsmoos.com guards the exact top-level movement vessel that reaches phones and browsers in the living release.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { publishMitzvahWorldPlayable } from '../../launcher/MitzvahWorldPlayablePublisher.js';
import {
	cleanupPlayablePublisherVessel,
	completePlayablePublisherEssentials,
	createPlayableDiagnostics,
	createPlayablePublisherVessel
} from './MitzvahWorldPlayablePublisherHarness.mjs';

test('production-shaped diagnostics publish after the bootstrap movement prime', () => {
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
	let activated = 0;
	const diagnostics = createPlayableDiagnostics();
	diagnostics.activatePostPlayable = () => { activated += 1; };
	assert.equal(diagnostics.runtime.movement, undefined);
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
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
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

test('missing top-level movement prime reproduces the mobile blocker exactly', () => {
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
	const diagnostics = createPlayableDiagnostics();
	diagnostics.movement = null;
	assert.throws(
		() => publishMitzvahWorldPlayable(diagnostics, vessel.options),
		/camera-attached, movement-input-accepted/
	);
	assert.equal(vessel.finishCount(), 0);
	cleanupPlayablePublisherVessel(vessel.environment);
});
