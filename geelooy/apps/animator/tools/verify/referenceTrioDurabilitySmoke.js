// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { NLECommands } from '../../src/nle/core/NLECommands.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { ProjectPackageAssembler } from '../../src/nle/project/ProjectPackageAssembler.js';
import { ReferenceTrioMovie } from '../../src/scenes/ReferenceTrioMovie.js';

/**
 * The Awtsmoos renews character, edit, package, reload, cues, and render graph as
 * one truth. Awtsmoos.com proves IDs, controls, tracks, keyframes, phonemes, face
 * pose, and mouth-performance metadata survive without bitmap substitutions.
 */
function graph(character) {
	return StableCharacterAssembler.assemble(character);
}

function graphHash(character) {
	return createHash('sha256').update(JSON.stringify(graph(character))).digest('hex');
}

function collectIds(node, result = []) {
	if (!node || typeof node !== 'object') return result;
	if (typeof node.id === 'string') result.push(node.id);
	for (const child of node.children || []) collectIds(child, result);
	return result;
}

function verifyCharacter(character, expectedGesture) {
	assert.equal(character.bodyGeometry.gesture.mode, expectedGesture);
	assert.ok(character.rig.controls.length >= 20);
	assert.ok(character.timeline.tracks.length >= 28);
	assert.ok(character.timeline.tracks.every(track => track.keyframes.length >= 2));
	assert.ok(character.facePose?.eyes && character.facePose?.brows);
	assert.equal(character.referenceBox.sourceWidth, 1536);
	assert.equal(character.referenceBox.sourceHeight, 864);
	return collectIds(graph(character));
}

const plan = ReferenceTrioMovie.create();
assert.deepEqual([plan.settings.width, plan.settings.height, plan.settings.fps], [1536, 864, 24]);
assert.equal(plan.characters.length, 3);
assert.equal(plan.nle.tracks.length, 12);
assert.ok(plan.nle.clips.length >= 30);
assert.ok(plan.dialogue.every(line => line.lipSyncCues.length > 4));
assert.ok(plan.dialogue.flatMap(line => line.lipSyncCues).every(cue => (
	Number.isFinite(cue.start) && Number.isFinite(cue.end)
	&& typeof cue.phoneme === 'string' && typeof cue.viseme === 'string'
	&& Number.isFinite(cue.strength)
)));

const proofKeyframe = {
	id: 'proof_keyframe_ari_x', entityId: plan.characters[0].id,
	property: 'position.x', time: 2400, value: plan.characters[0].position.x
};
const store = new NLEStore({
	duration: plan.nle.duration, tracks: plan.nle.tracks,
	clips: plan.nle.clips, keyframes: [proofKeyframe]
});
const editableClip = store.get().clips.find(clip => clip.type === 'gesture');
const originalStart = editableClip.start;
NLECommands.moveClip(store, editableClip.id, originalStart + 1000);
assert.equal(store.findClip(editableClip.id).start, originalStart + 1000);
assert.equal(store.undo(), true);
assert.equal(store.findClip(editableClip.id).start, originalStart);
assert.equal(store.redo(), true);

const assembler = new ProjectPackageAssembler({
	moviePlan: plan,
	collector: { async collect() { return { descriptors: [], files: [] }; } },
	clock: () => '2026-07-17T00:00:00.000Z'
});
const projectPackage = await assembler.assemble(store);
const serialized = JSON.stringify(projectPackage.manifest);
const restored = JSON.parse(serialized);
const restoredCharacters = restored.productionPlan.characters;

assert.deepEqual(restoredCharacters.map(character => character.id), ReferenceCharacterIds.all());
assert.deepEqual(restored.timeline.tracks, store.get().tracks);
assert.deepEqual(restored.timeline.clips, store.get().clips);
assert.deepEqual(restored.timeline.keyframes, [proofKeyframe]);
assert.equal(restored.project.durationMs, 120000);
assert.equal(restored.media.length, 0);
assert.ok(restored.productionPlan.dialogue.every(line => (
	line.lipSyncCues.length === line.mouthPerformanceData.cueCount
)));
for (let index = 0; index < plan.characters.length; index += 1) {
	assert.deepEqual(restoredCharacters[index].facePose, plan.characters[index].facePose);
	assert.equal(graphHash(restoredCharacters[index]), graphHash(plan.characters[index]));
}

const ariIds = verifyCharacter(restoredCharacters[0], 'open_palm_left');
const dovidIds = verifyCharacter(restoredCharacters[1], 'arms_crossed');
const miriamIds = verifyCharacter(restoredCharacters[2], 'right_hand_in_pocket');
assert.ok(ariIds.some(id => id.includes('continuous_beard')));
assert.ok(dovidIds.some(id => id.includes('continuous_beard')));
assert.ok(miriamIds.some(id => id.includes('head_wrap')));
assert.ok(miriamIds.some(id => id.includes('skirt')));
for (const forbidden of ['blob:', '/mnt/data/', 'imageBitmap', '1000137569.png']) {
	assert.equal(serialized.includes(forbidden), false);
}

console.log('B"H reference trio durability smoke passed');
