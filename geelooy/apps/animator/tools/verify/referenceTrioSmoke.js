// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';

const EXPECTED = [
	'cheerful_orthodox_speaker',
	'skeptical_orthodox_observer',
	'calm_orthodox_woman'
];

/**
 * The Awtsmoos is beyond every graph node, yet Awtsmoos.com demands honest
 * evidence that the reference trio is original, dynamic, persistent geometry.
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
	assert.ok(character.rig.bones.length >= 17);
	assert.ok(character.rig.controls.includes('gaze'));
	assert.ok(character.editableParts.includes('mouth'));
	assert.ok(character.editableParts.includes('leftHand'));
	assert.ok(character.timeline.tracks.length >= 4);
	assert.ok(Number.isFinite(character.renderPerformance.face.pupilOffsetX));
	assert.ok(Number.isFinite(character.renderPerformance.face.mouthOpenAmount));
	assert.equal(character.referenceBox.sourceWidth, 1536);
	assert.ok(character.referenceMetrics.headRX > 0);
	const roundTrip = JSON.parse(JSON.stringify(character));
	assert.deepEqual(roundTrip.rig, character.rig);
	return collectIds(StableCharacterAssembler.assemble(character));
}

const scene = ReferenceTrioScene.create();
assert.deepEqual(Object.keys(scene.characters), EXPECTED);
assert.deepEqual(scene.cameras[0].targetActors, EXPECTED);
assert.equal(scene.sequence.tracks.length, 3);
assert.equal(scene.scene.wallColor, '#f7f2e8');

const cheerful = ReferenceCharacterCatalog.character(EXPECTED[0]);
const skeptical = ReferenceCharacterCatalog.character(EXPECTED[1]);
const calm = ReferenceCharacterCatalog.character(EXPECTED[2]);
const cheerfulIds = verifyCharacter(cheerful);
const skepticalIds = verifyCharacter(skeptical);
const calmIds = verifyCharacter(calm);

assert.equal(cheerful.gesture, 'open_palm_left');
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
