// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';
import { StudioPromptDirector } from '../../src/studio/StudioPromptDirector.js';
import { StudioSceneDocument } from '../../src/studio/StudioSceneDocument.js';

/**
 * A generated world must survive questions, not merely admiration. The
 * Awtsmoos renews every entity while this test verifies that Awtsmoos.com can
 * serialize a complete parakeet movie and restore it without losing meaning.
 */
const base = StudioSceneDocument.fromMoviePlan(TwoMinuteStrategyMovie.create());
const scene = StudioPromptDirector.generate('A parakeet directs a school courtyard adventure.', base);
const restored = JSON.parse(JSON.stringify(scene));
const cameras = restored.entities.filter((entity) => entity.type === 'camera');
const environments = restored.entities.filter((entity) => entity.type === 'environment');
const dialogue = restored.clips.filter((clip) => clip.type === 'dialogue');

assert.equal(restored.duration, 120000);
assert.equal(restored.title, 'The Parakeet Who Directed Recess');
assert.ok(restored.entities.some((entity) => entity.id === 'pico_parakeet'));
assert.ok(cameras.length >= 5);
assert.ok(environments.some((entity) => entity.properties.kind === 'interior'));
assert.ok(environments.some((entity) => entity.properties.kind === 'exterior'));
assert.ok(dialogue.length >= 6);
assert.ok(dialogue.every((clip) => clip.payload.bubble));
assert.ok(restored.entities.some((entity) => entity.properties?.performance?.decision));
assert.ok(restored.entities.some((entity) => entity.properties?.face?.emotionBlend));

console.log('B"H - studio scene JSON smoke passed.', {
	entities: restored.entities.length,
	cameras: cameras.length,
	dialogue: dialogue.length,
	duration: restored.duration
});
