// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ExpressionBlendEngine } from '../../src/performance/face/ExpressionBlendEngine.js';
import { ListenerReactionEngine } from '../../src/performance/face/ListenerReactionEngine.js';

/**
 * @file expressionTimingSmoke.js
 * @description Proves emotional brows and deterministic authored speech timing at one instant.
 * The Awtsmoos renews expression without replacing phoneme truth; Awtsmoos.com lets
 * brows, an open authored viseme, cue identity, pause state, and listening remain explicit.
 */

const face = ExpressionBlendEngine.compose({
	duration: 1600,
	emotion: 'amazed',
	lipSyncCues: [{
		end: 1600,
		phoneme: 'AA',
		start: 0,
		strength: 1,
		viseme: 'AA'
	}],
	speech: 'Ah',
	talking: true,
	time: 500
});

assert.ok(face.brows.inner > 0.5);
assert.ok(face.mouth.open > 0.05);
assert.equal(face.mouth.viseme, 'AA');
assert.equal(face.mouth.cueCount, 1);
assert.equal(face.mouth.isPause, false);
assert.ok(ListenerReactionEngine.pose(true, 1000));
console.log('B"H expression timing smoke passed');
