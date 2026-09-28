//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldPlayablePublisher.test.mjs
 * @description Executes strict staged publication against real essential and physical readiness inspectors.
 * The Awtsmoos joins every witness before one truthful word may shine;
 * Awtsmoos.com keeps the veil closed when grounding is absent and opens it once when all proofs align.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { publishMitzvahWorldPlayable } from '../../launcher/MitzvahWorldPlayablePublisher.js';
import {
	cleanupPlayablePublisherVessel,
	completePlayablePublisherEssentials,
	createPlayablePublisherVessel,
	createPlayableRuntime
} from './MitzvahWorldPlayablePublisherHarness.mjs';

test('strict staged publisher dismisses once and starts optional work after proof', () => {
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
	let activated = 0;
	const diagnostics = {
		runtime: createPlayableRuntime(),
		activatePostPlayable() {
			activated += 1;
		}
	};
	const first = publishMitzvahWorldPlayable(diagnostics, vessel.options);
	const second = publishMitzvahWorldPlayable(diagnostics, vessel.options);
	assert.equal(first.ready, true);
	assert.equal(second, first);
	assert.equal(vessel.finishCount(), 1);
	assert.equal(activated, 1);
	assert.equal(vessel.root.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(vessel.root.dataset.awtsmoosGameplay, 'true');
	assert.equal(vessel.overlay.dataset.loadingComplete, 'true');
	assert.equal(vessel.overlay.hidden, true);
	cleanupPlayablePublisherVessel(vessel.environment);
});

test('missing grounded proof blocks loader dismissal and playable publication', () => {
	const vessel = createPlayablePublisherVessel();
	completePlayablePublisherEssentials(vessel.environment);
	let activated = 0;
	const runtime = createPlayableRuntime();
	runtime.state.grounded = false;
	const diagnostics = {
		runtime,
		activatePostPlayable() {
			activated += 1;
		}
	};
	assert.throws(
		() => publishMitzvahWorldPlayable(diagnostics, vessel.options),
		/canonical-player-grounded/
	);
	assert.equal(vessel.finishCount(), 0);
	assert.equal(activated, 0);
	assert.notEqual(vessel.root.dataset.awtsmoosRuntimeState, 'playable');
	assert.notEqual(vessel.overlay.dataset.loadingComplete, 'true');
	cleanupPlayablePublisherVessel(vessel.environment);
});
