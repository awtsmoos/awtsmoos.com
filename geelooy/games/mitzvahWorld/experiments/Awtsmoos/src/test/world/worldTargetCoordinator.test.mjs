// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTargetCoordinator.test.mjs
 * @description Proves that friendly and hostile actors share one pointer ownership vessel.
 * The Awtsmoos joins many meetings beneath one choice; Awtsmoos.com prevents duplicate
 * listeners from racing while dialogue and combat retain their distinct meanings.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { WorldTargetCoordinator } from '../../world/targeting/WorldTargetCoordinator.js';

function actor(id, hit, dialogue = false) {
	return {
		clearCount: 0,
		dialogueCount: 0,
		hitPointer: () => hit,
		profile: { id },
		selected: false,
		targetCount: 0,
		clear() {
			this.clearCount += 1;
			this.selected = false;
		},
		dialogue: dialogue ? function openDialogue() {
			this.dialogueCount += 1;
		} : undefined,
		target() {
			this.targetCount += 1;
			this.selected = true;
		}
	};
}

test('one listener arbitrates friendly and hostile candidates', () => {
	const listeners = new Map();
	const canvas = {
		addEventListener: (type, listener) => listeners.set(type, listener),
		removeEventListener: type => listeners.delete(type)
	};
	const friendly = actor('friendly', false, true);
	const hostile = actor('hostile', true);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		populations: [{ actors: [friendly] }, { actors: [hostile] }]
	});
	assert.equal(listeners.size, 1);
	listeners.get('pointerdown')({
		preventDefault() {},
		stopImmediatePropagation() {},
		stopPropagation() {}
	});
	assert.equal(hostile.targetCount, 1);
	assert.equal(hostile.selected, true);
	assert.equal(friendly.selected, false);
	coordinator.destroy();
	assert.equal(listeners.size, 0);
});

test('a second click opens dialogue only for an already selected friendly actor', () => {
	const friendly = actor('friendly', true, true);
	const coordinator = new WorldTargetCoordinator({
		canvas: { addEventListener() {}, removeEventListener() {} },
		populations: [{ actors: [friendly] }]
	});
	coordinator.selectFromPointer({ preventDefault() {}, stopPropagation() {} });
	coordinator.selectFromPointer({ preventDefault() {}, stopPropagation() {} });
	assert.equal(friendly.targetCount, 1);
	assert.equal(friendly.dialogueCount, 1);
});
