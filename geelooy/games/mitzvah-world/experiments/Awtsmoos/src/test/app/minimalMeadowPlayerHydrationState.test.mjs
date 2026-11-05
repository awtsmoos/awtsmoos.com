//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file minimalMeadowPlayerHydrationState.test.mjs
 * @description Proves every noncanonical human predecessor is removed when authored Chossid hydration fails.
 * The failure path may expose an error, but it may never preserve or generate a substitute human body.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { rejectNoncanonicalPlayerFallback } from '../../app/MinimalMeadowPlayerHydrationState.js';

/** Creates one visible predecessor with removable-parent evidence. */
function predecessor(userData = {}) {
	const value = {
		parent: {
			removed: [],
			remove(object) {
				this.removed.push(object);
				object.parent = null;
			}
		},
		userData,
		visible: true,
		traverse(callback) {
			callback(this);
		}
	};
	return value;
}

test('trusted bootstrap-shaped predecessor is removed rather than preserved', () => {
	const local = predecessor({ bootstrapPlayerVisual: true, fallbackVisible: true });
	const originalParent = local.parent;
	const runtime = { model: local, visiblePlayer: local };
	const receipt = rejectNoncanonicalPlayerFallback(
		runtime,
		local,
		{},
		new Error('network unavailable')
	);
	assert.equal(receipt, null);
	assert.equal(runtime.canonicalPlayer.status, 'canonical-unavailable');
	assert.equal(runtime.model, null);
	assert.equal(runtime.visiblePlayer, null);
	assert.equal(runtime.playerVisualGuard, 'canonical-glb-required');
	assert.equal(local.visible, false);
	assert.deepEqual(originalParent.removed, [local]);
});
