// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

const EXPECTED = ReferenceCharacterIds.all();
const LEGACY = [
	'cheerful_orthodox_speaker',
	'skeptical_orthodox_observer',
	'calm_orthodox_woman'
];

/**
 * The Awtsmoos is beyond every graph node, yet Awtsmoos.com demands evidence
 * that the supplied trio is original editable geometry whose identity, rig,
 * timeline, serialization, aliases, and production render graph all agree.
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

function verifyCharacter(character) {
	assert.match(character.documentVersion, /\.v2$/);
	assert.ok(character.rig.bones.length >= 17);
	assert.ok(character.rig.controls.length >= 20);
	assert.ok(character.rig.controls.includes('gaze'));
	assert.ok(character.editableParts.length >= 40);
	assert.ok(character.editableParts.includes('mouth'));
	assert.ok(character.editableParts.includes('leftHand'));
	assert.ok(character.timeline.tracks.length >= 28);
	assert.ok(character.timeline.tracks.some(track => track.property === 'position.rotation'));
	assert.ok(character.timeline.tracks.some(track => track.property === 'renderPerformance.face.pupilOffsetX'));
	assert.ok(Number.isFinite(character.renderPerformance.face.pupilOffsetX));
	assert.ok(Number.isFinite(character.renderPerformance.face.mouthOpenAmount));
	assert.equal(character.referenceBox.sourceWidth, 1536);
	assert.equal(character.referenceBox.sourceHeight, 864);
	assert.ok(character.referenceMetrics.headRX > 0);
	assert.ok(character.measurements.body.headWidth > 0);
	assert.deepEqual(JSON.parse(JSON.stringify(character)).rig, character.rig);
	return collectIds(StableCharacterAssembler.assemble(character));
}

const scene = ReferenceTrioScene.create();
assert.deepEqual(Object.keys(scene.characters), EXPECTED);
assert.deepEqual(scene.cameras[0].targetActors, EXPECTED);
assert.equal(scene.sequence.tracks.length, 3);
assert.equal(scene.scene.wallColor, '#f7f2e8');
assert.ok(scene.sequence.tracks.every(track => track.keyframes.length >= 56));

for (let index = 0; index < EXPECTED.length; index += 1) {
	assert.equal(ReferenceCharacterCatalog.character(LEGACY[index]).id, EXPECTED[index]);
}

const cheerful = ReferenceCharacterCatalog.character(EXPECTED[0]);
const skeptical = ReferenceCharacterCatalog.character(EXPECTED[1]);
const calm = ReferenceCharacterCatalog.character(EXPECTED[2]);
const cheerfulIds = verifyCharacter(cheerful);
const skepticalIds = verifyCharacter(skeptical);
const calmIds = verifyCharacter(calm);

assert.equal(cheerful.rigPose.arms.left.handPose, 'open');
assert.equal(skeptical.gesture, 'arms_crossed');
assert.equal(calm.gesture, 'right_hand_in_pocket');
assert.ok(cheerfulIds.some(id => id.includes('kippah')));
assert.ok(cheerfulIds.some(id => id.includes('payos')));
assert.ok(cheerfulIds.some(id => id.includes('beard')));
assert.ok(skepticalIds.some(id => id.includes('kippah')));
assert.ok(calmIds.some(id => id.includes('head_wrap')));
assert.ok(calmIds.some(id => id.includes('earring')));
assert.ok(calmIds.some(id => id.includes('skirt')));

const serialized = JSON.stringify(scene);
assert.equal(serialized.includes('1000137569.png'), false);
assert.equal(serialized.includes('/mnt/data/'), false);
assert.equal(serialized.includes('imageBitmap'), false);
console.log('B"H reference trio smoke passed');
