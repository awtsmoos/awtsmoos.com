// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionModelBinding.test.mjs
 * @description Proves fallback and remote model replacement cannot retain old action bones.
 * The Awtsmoos is present before and after hydration; Awtsmoos.com restores the first garment,
 * binds the second Chossid independently, and records any interrupted gesture without disguise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlayerActionSystem } from './PlayerActionSystem.js';

function quaternion(x = 0) {
	return {
		w: 1,
		x,
		y: 0,
		z: 0,
		set(nextX, nextY, nextZ, nextW) {
			Object.assign(this, { w: nextW, x: nextX, y: nextY, z: nextZ });
		}
	};
}

function actorModel(name, initialX) {
	const bone = { name: 'mixamorigSpine', quaternion: quaternion(initialX) };
	return {
		bone,
		name,
		traverse(visitor) {
			visitor(this);
			visitor(bone);
		}
	};
}

test('model rebinding restores old bones and clears interrupted overlay state', () => {
	const fallback = actorModel('fallback-chossid', 0.1);
	const canonical = actorModel('canonical-chossid', 0.4);
	const system = createPlayerActionSystem({ bridge: false, model: fallback });
	system.runtime.composition.basePose.set('spine', { w: 1, x: 0.1, y: 0, z: 0 });
	fallback.bone.quaternion.x = 0.9;
	system.runtime.active = { definition: { id: 'staff-cast' } };
	const result = system.bindModel(canonical);
	assert.equal(fallback.bone.quaternion.x, 0.1);
	assert.equal(system.actor.model, canonical);
	assert.equal(system.runtime.active, null);
	assert.equal(system.runtime.composition.basePose.size, 0);
	assert.equal(result.interruptedActionId, 'staff-cast');
	assert.equal(system.runtime.lastResult.reason, 'model-rebound');
	assert.equal(system.actor.diagnostics().boundBones, 1);
	system.destroy();
});
