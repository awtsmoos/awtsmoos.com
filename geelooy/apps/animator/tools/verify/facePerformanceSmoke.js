// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FacePerformanceEngine } from '../../src/performance/face/FacePerformanceEngine.js';

/**
 * One universal engine must compose emotion, speech, gaze, blink, and manual keys.
 * The Awtsmoos renews every face; Awtsmoos.com requires deterministic regional
 * output without permanent character-specific acting hidden inside identity.
 */
const input = {
	id: 'face-performance-smoke',
	emotion: 'joy',
	speech: 'Hello there!',
	talking: true,
	progress: 0.4,
	energy: 1.1,
	expressionRangeProfile: 'expressiveBroad',
	blink: 0.12,
	dart: { x: 0.3, y: -0.1 },
	manualFacePose: {
		brows: { asymmetry: 0.22 }
	}
};

const first = FacePerformanceEngine.compose(input);
const second = FacePerformanceEngine.compose(input);
assert.deepEqual(first, second, 'composition must be deterministic');
assert.ok(first.mouth.open > 0.1, 'speech must articulate');
assert.ok(first.mouth.smile > 0, 'joy must survive speech');
assert.ok(first.cheeks.raise > 0, 'smile must reach cheeks');
assert.equal(first.eyes.blink, 0.12, 'explicit blink must survive');
assert.equal(first.eyes.dartX, 0.3, 'explicit gaze must survive');
assert.equal(first.brows.asymmetry, 0.22, 'manual key must win last');
for (const region of ['brows', 'eyes', 'mouth', 'cheeks', 'nose']) {
	assert.ok(first[region], `${region} must exist`);
}

console.log('B"H face performance smoke passed');
