// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { NLECommands } from '../../src/nle/core/NLECommands.js';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { ProjectPackageAssembler } from '../../src/nle/project/ProjectPackageAssembler.js';
import { ReferenceTrioMovie } from '../../src/scenes/ReferenceTrioMovie.js';

/**
 * The Awtsmoos renews character, edit, undo, package, reload, and render graph as
 * one truth. Awtsmoos.com proves the trio survives durable production data without
 * hidden bitmaps, temporary URLs, severed controls, or proof-only substitutions.
 */
function collectIds(node, result = []) {
	if (!node || typeof node !== 'object') {
		return result;
	}
	if (typeof node.id === 'string') {
		result.push(node.id);
	}
	for (const child of node.children || []) {
		collectIds(child, result);
	}
	return result;
}

function verifyCharacter(character, expectedGesture) {
	assert.equal(character.bodyGeometry.gesture.mode, expectedGesture);
	assert.ok(character.rig.controls.length >= 20);
	assert.ok(character.timeline.tracks.length >= 28);
	assert.ok(character.referenceBox.sourceWidth === 1536);
	assert.ok(character.referenceBox.sourceHeight === 864);
	const ids = collectIds(StableCharacterAssembler.assemble(character));
	assert.ok(ids.some(id => id.includes('head')));
	assert.ok(ids.some(id => id.includes('foot')));
	return ids;
}

const plan = ReferenceTrioMovie.create();
assert.equal(plan.settings.width, 1536);
assert.equal(plan.settings.height, 864);
assert.equal(plan.settings.fps, 24);
assert.equal(plan.characters.length, 3);
assert.equal(plan.nle.tracks.length, 12);
assert.ok(plan.nle.clips.length >= 30);

const store = new NLEStore({
	duration: plan.nle.duration,
	tracks: plan.nle.tracks,
	clips: plan.nle.clips,
	keyframes: []
});
const editableClip = store.get().clips.find(clip => clip.type === 'gesture');
assert.ok(editableClip);
const originalStart = editableClip.start;
NLECommands.moveClip(store, editableClip.id, originalStart + 1000);
assert.equal(store.findClip(editableClip.id).start, originalStart + 1000);
assert.equal(store.undo(), true);
assert.equal(store.findClip(editableClip.id).start, originalStart);
assert.equal(store.redo(), true);
assert.equal(store.findClip(editableClip.id).start, originalStart + 1000);

const assembler = new ProjectPackageAssembler({
	moviePlan: plan,
	collector: {
		async collect() {
			return { descriptors: [], files: [] };
		}
	},
	clock: () => '2026-07-17T00:00:00.000Z'
});
const projectPackage = await assembler.assemble(store);
const serialized = JSON.stringify(projectPackage.manifest);
const restored = JSON.parse(serialized);
const restoredCharacters = restored.productionPlan.characters;
const expectedIds = ReferenceCharacterIds.all();

assert.deepEqual(restoredCharacters.map(character => character.id), expectedIds);
assert.deepEqual(restored.timeline.tracks, store.get().tracks);
assert.deepEqual(restored.timeline.clips, store.get().clips);
assert.equal(restored.project.durationMs, 120000);
assert.equal(restored.media.length, 0);
assert.equal(projectPackage.files.length, 0);

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
