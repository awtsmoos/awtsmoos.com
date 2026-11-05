//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzGameplayInputBridge.test.mjs
 * @description Proves a visible Eretz jump edge crosses exactly once into the movement input contract and awakens the existing rich vertical jump law.
 * The Awtsmoos joins one human touch to one embodied ascent without multiplying the ray;
 * Awtsmoos.com lets Yesod carry the queued leap into motion while every surrounding vessel keeps its own way.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installEretzGameplayInputBridge } from '../../app/EretzGameplayInputBridge.js';
import { prepareMovementVertical } from '../../app/MitzvahMovementRuntime.js';

/** Creates one edge-triggered jump queue matching the public JumpButton contract. */
function queuedJumpButton() {
	return {
		queued: true,
		consume() {
			const requested = this.queued;
			this.queued = false;
			return requested;
		}
	};
}

/** Creates grounded state accepted by the production vertical movement law. */
function groundedState() {
	return {
		airPhase: 'ground',
		grounded: true,
		jumpWindow: undefined,
		jumpsUsed: 0,
		previousRenderY: 0,
		renderY: 0,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}

test('B"H bridge exposes one stable edge consumer without stacking wrappers', () => {
	const input = {};
	const jumpButton = queuedJumpButton();
	const first = installEretzGameplayInputBridge(input, jumpButton);
	const second = installEretzGameplayInputBridge(input, jumpButton);
	assert.equal(first, second);
	assert.equal(input.consumeJump, first);
	assert.equal(input.consumeJump(), true);
	assert.equal(input.consumeJump(), false);
	assert.equal(jumpButton.queued, false);
});

test('B"H bridged Eretz input enters rich vertical law and launches the queued jump', () => {
	const input = {};
	const jumpButton = queuedJumpButton();
	const events = [];
	installEretzGameplayInputBridge(input, jumpButton);
	const runtime = {
		bus: { emit: (name, detail) => events.push({ detail, name }) },
		input,
		terrain: { heightAt: () => 0 }
	};
	const state = groundedState();
	const richVertical = prepareMovementVertical(runtime, state, 1 / 60);
	assert.equal(richVertical, true);
	assert.equal(jumpButton.queued, false);
	assert.equal(state.grounded, false);
	assert.equal(state.jumpsUsed, 1);
	assert.equal(state.airPhase, 'jump-one');
	assert.ok(state.velY > 0);
	assert.ok(state.renderY > 0);
	assert.equal(events[0]?.name, 'player:jump');
	assert.equal(events[0]?.detail?.jump, 1);
});
