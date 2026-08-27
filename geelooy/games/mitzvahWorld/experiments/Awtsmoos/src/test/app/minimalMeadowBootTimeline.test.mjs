// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBootTimeline.test.mjs
 * @description Proves monotonic immutable boot evidence survives without exposing mutable state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowBootTimeline
} from '../../app/MinimalMeadowBootTimeline.js';

test('B"H timeline records ordered immutable stages', () => {
	const values = [10, 12.5, 18];
	const timeline = createMinimalMeadowBootTimeline({
		performance: {
			now() {
				return values.shift();
			}
		}
	});
	const first = timeline.mark('core-created', { ready: true });
	const second = timeline.mark('essential-ready');
	const snapshot = timeline.snapshot();
	assert.deepEqual(snapshot.map(entry => entry.stage), [
		'core-created',
		'essential-ready'
	]);
	assert.equal(first.elapsedMs, 2.5);
	assert.equal(second.elapsedMs, 8);
	assert.equal(timeline.latest(), second);
	assert.equal(Object.isFrozen(first), true);
	assert.equal(Object.isFrozen(first.details), true);
	assert.equal(Object.isFrozen(snapshot), true);
	assert.throws(() => snapshot.push(first), TypeError);
});
