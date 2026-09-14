//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-3d-failure-contract.test.mjs
 * @description Freezes optional-renderer failure behavior so native 3D can never
 * strand a playable game in an ambiguous loading state or hide 2D authority.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { activateNative3DBackdrop } from '../scripts/runtime/native-3d/backdrop-activation.js';

test('activation failure degrades cleanly and disposes failed renderer', () => {
	let disposed = false;
	const body = { dataset: {} };
	const controller = {
		active: true,
		disposed: false,
		backdrop: {},
		canvas: { hidden: false },
		document: { body }
	};
	const backdrop = {
		setActive() {
			throw new Error('GPU activation denied');
		},
		dispose() {
			disposed = true;
		}
	};
	assert.equal(activateNative3DBackdrop(controller, backdrop), false);
	assert.equal(body.dataset.native3dState, 'degraded');
	assert.equal(body.dataset.native3dDegraded, 'true');
	assert.equal(controller.canvas.hidden, true);
	assert.equal(controller.backdrop, null);
	assert.equal(disposed, true);
});
