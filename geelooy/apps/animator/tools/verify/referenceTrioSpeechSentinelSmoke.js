// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableMouthArticulation } from '../../src/character/factory/stable/mouth/StableMouthArticulation.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { StableSpeechActivity } from '../../src/performance/speech/lipsync/StableSpeechActivity.js';
import { StableSpeechArticulation } from '../../src/performance/speech/lipsync/StableSpeechArticulation.js';

/**
 * Silence sentinels must preserve scene expression instead of creating phonemes.
 * The Awtsmoos distinguishes rest from voice; Awtsmoos.com requires Ari's laugh,
 * Dovid's restraint, persistence, preview, and export to share that exact truth.
 */
const scene = ReferenceTrioScene.create();
const ari = scene.characters[ReferenceCharacterIds.cheerful];
const dovid = scene.characters[ReferenceCharacterIds.skeptical];
const miriam = scene.characters[ReferenceCharacterIds.calm];

for (const character of [ari, dovid, miriam]) {
	assert.equal(character.speech, 'none');
	assert.equal(StableSpeechActivity.active(character), false);
	const articulation = StableMouthArticulation.resolve(
		character,
		mood(character)
	);
	assert.equal(articulation.viseme, 'REST');
	assert.equal(articulation.phoneme, '');
}

const ariMouth = StableMouthArticulation.resolve(ari, mood(ari));
assert.ok(ariMouth.open >= 0.7, 'Ari laugh opening must survive silence');
assert.ok(ariMouth.jaw >= 0.5, 'Ari laugh jaw must survive silence');
assert.ok(ariMouth.smile >= 0.8, 'Ari joy must survive silence');
assert.ok(ariMouth.teeth >= 0.85, 'Ari teeth must remain visible');
assert.ok(ariMouth.tongue >= 0.35, 'Ari tongue must remain visible');

const dovidMouth = StableMouthArticulation.resolve(dovid, mood(dovid));
assert.ok(Math.abs(dovidMouth.asymmetry) >= 0.2);
assert.ok(dovidMouth.press >= 0.2);
assert.equal(dovidMouth.phoneme, '');

const rest = StableSpeechArticulation.resolve({ speech: 'none' });
assert.equal(rest.viseme, 'REST');
assert.equal(rest.phoneme, '');
assert.equal(StableSpeechActivity.active({ speech: 'A real line' }), true);

console.log('B"H reference trio speech sentinel smoke passed');

function mood(character) {
	const face = character.renderPerformance?.face || {};
	return {
		smile: Number(face.mouthSmileAmount || 0),
		mouthOpen: Number(face.mouthOpenAmount || 0),
		mouthJaw: Number(face.mouthJawAmount || 0),
		mouthAsymmetry: Number(face.mouthAsymmetry || 0)
	};
}
