// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { KeyframeEngine } from '../../src/nle/core/KeyframeEngine.js';
import { NLECommands } from '../../src/nle/core/NLECommands.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';

/**
 * The Awtsmoos renews edited time; this proof verifies professional operations
 * through public contracts rather than clicking disconnected demonstrations.
 */
const store = new NLEStore({
	tracks: NLEStore.defaultTracks(),
	clips: [
		{
			id: 'clip_primary',
			trackId: 'track_action',
			start: 0,
			duration: 1000,
			type: 'action',
			name: 'Primary',
			payload: {},
			transform: {}
		},
		{
			id: 'clip_following',
			trackId: 'track_action',
			start: 1400,
			duration: 500,
			type: 'action',
			name: 'Following',
			payload: {},
			transform: {}
		}
	]
});

NLECommands.selectClip(store, 'clip_primary');
NLECommands.moveClip(store, 'clip_primary', 400);
assert.equal(store.findClip('clip_primary').start, 400);
assert.equal(store.get().history.canUndo, true);
assert.equal(store.undo(), true);
assert.equal(store.findClip('clip_primary').start, 0);
assert.equal(store.redo(), true);
assert.equal(store.findClip('clip_primary').start, 400);

const right = NLECommands.splitClip(store, 'clip_primary', 600);
assert.ok(right);
assert.equal(store.findClip('clip_primary').duration, 200);
assert.equal(right.start, 600);
assert.equal(right.duration, 800);

const duplicate = NLECommands.duplicateClip(store, right.id, 300);
assert.ok(duplicate.id !== right.id);
assert.equal(duplicate.start, 900);
NLECommands.updateTransform(store, right.id, 'x', 42);
NLECommands.updateTransform(store, right.id, 'rotation', 15);
const frame = NLECommands.addTransformKeyframe(store, right.id, 650);
assert.equal(frame.value.x, 42);
assert.equal(frame.value.rotation, 15);

const halfway = KeyframeEngine.sample([
	{ time: 0, value: { x: 0, opacity: 0 }, easing: 'linear' },
	{ time: 1000, value: { x: 100, opacity: 1 }, easing: 'linear' }
], 500);
assert.equal(halfway.x, 50);
assert.equal(halfway.opacity, 0.5);

NLECommands.rippleDelete(store, 'clip_primary');
assert.equal(store.findClip(right.id).start, 400);
assert.equal(store.findClip('clip_following').start, 1200);
console.log('B"H professional NLE editing smoke passed');
