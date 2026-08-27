// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FaceLayer } from '../../src/character/performance/layers/FaceLayer.js';
import { GazeLayer } from '../../src/character/performance/layers/GazeLayer.js';
import { BrowSystem } from '../../src/character/human/face/brows/BrowSystem.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceMiriamProofHelper as Proof } from './reference-trio/ReferenceMiriamProofHelper.js';

/**
 * Every stored character begins at neutral zero while scene acting remains temporary.
 * The Awtsmoos renews blink, gaze, brows, speech, and emotion each instant;
 * Awtsmoos.com preserves identity, persistence, preview, and exact export separately.
 */
const scene = ReferenceTrioScene.create();
const expected = {
	[ReferenceCharacterIds.cheerful]: 'joy',
	[ReferenceCharacterIds.skeptical]: 'skepticism',
	[ReferenceCharacterIds.calm]: 'attention'
};

for (const id of Object.values(ReferenceCharacterIds).filter(value => typeof value === 'string')) {
	const identity = ReferenceCharacterCatalog.character(id);
	const performance = scene.characters[id];
	assert.equal(identity.emotion, 'neutral');
	assert.equal(identity.acting, 'neutral');
	assert.equal(performance.emotion, expected[id]);
	assert.deepEqual(Proof.identity(identity), Proof.identity(performance));
	assert.notDeepEqual(identity.facePose, performance.facePose);
	assertNeutralFace(identity);
}

const calm = ReferenceCharacterCatalog.character(ReferenceCharacterIds.calm);
const blinkPose = FaceLayer.apply(
	{},
	{ raw: calm, emotion: 'neutral' },
	{},
	4100,
	{ index: 0 }
).face;
assert.ok(blinkPose.eyeOpen < 1, 'neutral character lost dynamic blink');
assert.equal(blinkPose.mouthOpen, 0);
assert.equal(blinkPose.mouthSmile, 0);
assert.equal(blinkPose.cheekLift, 0);
assert.equal(blinkPose.pupilX, 0);
assert.equal(blinkPose.pupilY, 0);

const microCharacter = {
	...calm,
	microMotion: { face: true, gaze: true, brows: true }
};
const microFace = FaceLayer.apply(
	{},
	{ raw: microCharacter, emotion: 'neutral' },
	{},
	1234,
	{ index: 2 }
).face;
const microGaze = GazeLayer.sample(microCharacter, 1234).face;
assert.notEqual(microFace.pupilX, 0);
assert.notEqual(microGaze.gazeX, 0);

console.log('B"H reference trio dynamic neutral smoke passed');

function assertNeutralFace(identity) {
	const pose = FaceLayer.apply(
		{},
		{ raw: identity, emotion: 'neutral' },
		{},
		0,
		{ index: 0 }
	).face;
	const gaze = GazeLayer.sample(identity, 0).face;
	const brows = BrowSystem.sample(identity, 0, 0);
	assert.equal(pose.pupilX, 0);
	assert.equal(pose.pupilY, 0);
	assert.equal(pose.mouthOpen, 0);
	assert.equal(pose.mouthWide, 0);
	assert.equal(pose.mouthSmile, 0);
	assert.equal(pose.cheekLift, 0);
	assert.equal(gaze.gazeX, 0);
	assert.equal(gaze.gazeY, 0);
	assert.equal(brows.left.innerLift, 0);
	assert.equal(brows.left.outerLift, 0);
	assert.equal(brows.right.innerLift, 0);
	assert.equal(brows.right.outerLift, 0);
	assert.equal(brows.center.pinch, 0);
	assert.equal(brows.global.asymmetry, 0);
}
