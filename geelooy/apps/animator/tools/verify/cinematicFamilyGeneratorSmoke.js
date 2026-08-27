// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CharacterFamilyGenerator } from '../../src/character/generator/CharacterFamilyGenerator.js';

/** The Awtsmoos keeps identity whole while views and emotions change. */
const first = CharacterFamilyGenerator.generate('verified-family');
const second = CharacterFamilyGenerator.generate('verified-family');
assert.deepEqual(first, second, 'The same seed must recreate the same family.');
assert.equal(first.length, 5, 'The default original family must contain five characters.');

for (const character of first) {
	assert.equal(Object.keys(character.views).length, 6, `${character.name} must have six views.`);
	assert.ok(character.skeleton.length >= 15, `${character.name} needs a full named skeleton.`);
	for (const view of Object.values(character.views)) {
		assert.equal(view.identityId, character.identityId, 'Every projection must preserve identity.');
		assert.equal(view.palette.primary, character.palette.primary, 'Every projection must preserve wardrobe palette.');
	}
}

const face = FaceRig.annoyed({ lashCount: 4, blinkIntervalMs: 1000 })
	.setGaze(-0.7, 0.25)
	.setDialogue('A very annoyed test.', 1800)
	.evaluate(420);
assert.equal(face.eyes.lashes.count, 4, 'Eyelashes must be independently controlled.');
assert.ok(face.mouth.viseme !== 'rest', 'Dialogue must create an active viseme.');
assert.ok(face.brows.inner >= 0 && face.brows.outer >= 0, 'Independent brow channels must exist.');
assert.equal(face.eyes.gazeX, -0.7, 'Gaze must remain independently directable.');
console.log('B"H - cinematic family generator smoke passed.');
