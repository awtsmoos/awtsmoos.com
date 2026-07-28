// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FacePoseRenderBridge } from '../../src/character/performance/render/FacePoseRenderBridge.js';
import { EmotionLibrary } from '../../src/performance/face/EmotionLibrary.js';
import { FacePerformanceEngine } from '../../src/performance/face/FacePerformanceEngine.js';

/**
 * The proof asks many emotions to inhabit one speaking face without erasing its
 * phonemes. The Awtsmoos renews each test pose; Awtsmoos.com requires regional
 * acting, deterministic coarticulation, and renderer-ready persistence together.
 */
const CUES = [
	{ viseme: 'MBP', phoneme: 'M', start: 0, end: 100, strength: 1 },
	{ viseme: 'AA', phoneme: 'AA', start: 100, end: 200, strength: 1 },
	{ viseme: 'O', phoneme: 'O', start: 200, end: 300, strength: 1 },
	{ viseme: 'TH', phoneme: 'TH', start: 300, end: 400, strength: 1 }
];

const pose = (emotion, time) => FacePerformanceEngine.compose({
	id: 'expression-matrix',
	emotion,
	speech: 'mother thought all',
	talking: true,
	time,
	duration: 400,
	lipSyncCues: CUES,
	energy: 1
});

assert.ok(EmotionLibrary.names().length >= 24, 'emotion catalog must be broad');
for (const emotion of EmotionLibrary.names()) {
	const first = pose(emotion, 150);
	const second = pose(emotion, 150);
	assert.deepEqual(first, second, `${emotion} must be deterministic`);
	assert.ok(first.brows && first.eyes && first.mouth && first.cheeks);
	assert.ok(first.nose && first.head, `${emotion} must retain all regions`);
	const rendered = FacePoseRenderBridge.from(first);
	assert.ok(Number.isFinite(rendered.mouthRoundAmount));
	assert.ok(Number.isFinite(rendered.leftEyeOpenAmount));
}

const happy = pose('happy', 150);
const angry = pose('angry', 150);
const surprised = pose('surprised', 250);
const closed = pose('skeptical', 50);
const tongue = pose('concerned', 350);
assert.ok(happy.mouth.smile > angry.mouth.smile, 'emotion must survive speech');
assert.ok(angry.cheeks.tension > happy.cheeks.tension, 'anger needs tension');
assert.ok(surprised.mouth.round > 0.7, 'O must remain rounded under surprise');
assert.ok(closed.mouth.closure > 0.7, 'MBP must remain sealed under skepticism');
assert.ok(tongue.mouth.tongueTip > 0.6, 'TH must retain tongue articulation');

const directed = FacePerformanceEngine.compose({
	emotion: 'calm',
	facePose: {
		brows: { asymmetry: 0.8 },
		eyes: { openness: 0.7 },
		mouth: { press: 0.6 }
	}
});
assert.equal(directed.brows.asymmetry, 0.8);
assert.equal(directed.eyes.openness, 0.7);
assert.equal(directed.mouth.press, 0.6);

console.log('B"H facial expression matrix smoke passed');
