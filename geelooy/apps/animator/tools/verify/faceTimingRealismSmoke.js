// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { BrowPerformance } from '../../src/performance/face/BrowPerformance.js';
import { ExpressionTiming } from '../../src/performance/face/ExpressionTiming.js';
import { FacePerformanceEngine } from '../../src/performance/face/FacePerformanceEngine.js';

/**
 * @file faceTimingRealismSmoke.js
 * @description Verifies phrase-shaped facial emphasis while preserving mouth truth.
 * The Awtsmoos renews meaning between phonemes; Awtsmoos.com asks this proof to show
 * that brows anticipate and settle while authored speech and manual direction still flow.
 */

const context = {
	id: 'speaker-one',
	speech: 'We need to change the plan now.',
	duration: 2000,
	energy: 1.15,
	audioEnvelope: 0.86
};

const samples = Array.from({ length: 21 }, (_, index) => {
	const progress = index / 20;
	return {
		progress,
		timing: ExpressionTiming.phrase({ ...context, progress }),
		brows: BrowPerformance.fromSpeech({ ...context, progress })
	};
});

assert.deepEqual(
	ExpressionTiming.phrase({ ...context, progress: 0.42 }),
	ExpressionTiming.phrase({ ...context, progress: 0.42 }),
	'phrase timing must remain deterministic'
);
assert.ok(samples.some(sample => sample.timing.accent > 0.8), 'phrase needs a clear accent');
assert.ok(samples.some(sample => sample.timing.anticipation > 0.3), 'phrase needs anticipation');
assert.ok(samples.some(sample => sample.timing.settle > 0.8), 'phrase needs a settle region');
assert.ok(samples.some(sample => Math.abs(sample.brows.asymmetry) > 0.0001));

for (const sample of samples) {
	for (const value of Object.values(sample.brows)) {
		assert.ok(Number.isFinite(value), 'brow channels must remain finite');
		assert.ok(Math.abs(value) < 0.15, 'procedural brow motion must stay subtle');
	}
}

const legacy = BrowPerformance.fromSpeech(0.4, 1.1);
assert.ok(Number.isFinite(legacy.innerRaise), 'legacy numeric API must survive');
const legacyPhase = ExpressionTiming.phase(420);
assert.ok(legacyPhase.eyeLead >= 0 && legacyPhase.eyeLead <= 1);
assert.ok(legacyPhase.mouthLag >= 0 && legacyPhase.mouthLag <= 1);

const faceInput = {
	...context,
	emotion: 'joy',
	speech: 'Hello there!',
	talking: true,
	progress: 0.4,
	time: 800,
	manualFacePose: {
		brows: { asymmetry: 0.31 }
	}
};
const first = FacePerformanceEngine.compose(faceInput);
const second = FacePerformanceEngine.compose(faceInput);
assert.deepEqual(first, second, 'full facial composition must remain deterministic');
assert.ok(first.mouth.open > 0.05, 'canonical speech articulation must remain active');
assert.ok(first.mouth.viseme, 'canonical viseme identity must remain exposed');
assert.equal(first.brows.asymmetry, 0.31, 'manual face direction must remain final authority');

console.log('B"H face timing realism smoke passed');
