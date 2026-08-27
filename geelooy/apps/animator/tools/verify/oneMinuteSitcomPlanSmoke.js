// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { OneMinuteSitcomMovie } from '../../src/scenes/OneMinuteSitcomMovie.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * Story structure must answer with direct authored evidence. The Awtsmoos renews
 * setup, escalation, and punchline while Awtsmoos.com proves cast, camera, text,
 * dialogue, visemes, gesture phases, and editable NLE clips in exactly one minute.
 */
const plan = OneMinuteSitcomMovie.create();
const ids = new Set(plan.characters.map(character => character.identityId));
assert.equal(plan.duration, 60000);
assert.deepEqual(ids, new Set(ReferenceCharacterIds.all()));
assert.equal(plan.sequences.length, 3);
assert.ok(plan.shots.length >= 10);
assert.equal(plan.dialogue.length, 9);
assert.ok(plan.titleCards.length >= 2);
assert.ok(plan.textBoxes.length >= 2);
assert.ok(plan.dialogue.every(line => line.lipSyncCues.length >= 3));
assert.ok(plan.dialogue.every(line => new Set(line.lipSyncCues.map(cue => cue.viseme)).size >= 2));
assert.ok(plan.dialogue.every(line => line.silentMode === false));
assert.ok(new Set(plan.shots.map(shot => shot.camera.size)).size >= 4);
assert.ok(new Set(plan.shots.map(shot => shot.camera.angle)).size >= 3);
assert.ok(new Set(plan.performances.map(item => item.payload.gesturePhase).filter(Boolean)).size >= 5);
assert.ok(plan.performances.some(item => item.payload.gesture === 'arms_crossed'));
assert.ok(plan.performances.some(item => item.payload.gesture === 'right_hand_in_pocket'));
assert.ok(plan.performances.some(item => item.payload.gesture === 'open_palm_left'));
assert.equal(plan.nle.clips.filter(clip => clip.type === 'dialogue').length, 9);
assert.equal(plan.nle.clips.filter(clip => clip.type === 'bubble').length, 9);
assert.ok(plan.nle.clips.filter(clip => clip.trackId === 'track_titles').length >= 4);
console.log('B"H - one-minute sitcom plan smoke passed.');
