// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceMiriamProofHelper as Proof } from './reference-trio/ReferenceMiriamProofHelper.js';

/**
 * Miriam pass five protects wrapped-cloth volume, feature hierarchy, broad garments,
 * anatomical hands, weighted skirt, and readable flats. The Awtsmoos joins every
 * vessel; Awtsmoos.com preserves identity, persistence, preview, and exact export.
 */
const id = ReferenceCharacterIds.calm;
const identity = ReferenceCharacterCatalog.character(id);
const performance = ReferenceTrioScene.create().characters[id];
const first = StableCharacterAssembler.assemble(performance);
const second = StableCharacterAssembler.assemble(performance);
const nodes = Proof.index(first);

assert.equal(identity.emotion, 'neutral');
assert.equal(performance.emotion, 'attention');
assert.deepEqual(Proof.identity(identity), Proof.identity(performance));
assert.deepEqual(first, second, 'Miriam pass five must be deterministic');

const head = box('human_organic_head');
const rearWrap = box('head_wrap_rear_shell');
const crown = box('head_wrap_crown');
const fringe = required('feminine_fringe_mass');
const fringeBox = Proof.bounds(fringe);
const bun = box('head_wrap_bun');
const gather = box('head_wrap_bun_gather');
const leftEar = ellipse('human_reference_ear_-1');
const rightEar = ellipse('human_reference_ear_1');
const earring = circle('earring_visible');
const neck = box('neck_skin_mass');
const leftCollar = box('overshirt_soft_collar_-1');
const rightCollar = box('overshirt_soft_collar_1');
const torso = box('authored_olive_overshirt_front');
const innerPanel = box('overshirt_black_inner_panel');
const freeHand = box('human_left_arm_connected_hand_palm');
const pocketHand = box('human_right_pocket_hidden_hand');
const pocketCuff = box('human_right_pocket_cuff');
const skirt = box('skirt_mass');
const leftShoe = box('human_reference_foot_-1_shoe_upper');
const rightShoe = box('human_reference_foot_1_shoe_upper');
const leftOpening = box('human_reference_foot_-1_flat_opening');
const rightOpening = box('human_reference_foot_1_flat_opening');

assert.ok(rearWrap.width > head.width && rearWrap.height > head.height * 0.78);
assert.ok(crown.width > head.width * 0.85 && crown.height > head.height * 0.34);
assert.equal(fringe.points.filter(point => point.type === 'move').length, 3);
assert.equal(fringe.points.filter(point => point.type === 'close').length, 3);
assert.ok(fringeBox.height < head.height * 0.2);
assert.ok(gather.maxX >= bun.minX && bun.width < head.width * 0.11);
assert.ok(leftEar.rx <= 2.35 && rightEar.rx <= 2.35);
assert.ok(leftEar.ry <= 3.9 && rightEar.ry <= 3.9);
assert.ok(earring.r <= 1.55);
assert.ok(neck.height <= 13 && neck.width >= 18);
assert.ok(neck.minY - head.maxY <= 0.1);
assert.ok(leftCollar.minY <= neck.maxY && rightCollar.minY <= neck.maxY);
assert.ok(torso.width > 125 && torso.width / torso.height > 1.08);
assert.ok(innerPanel.width < torso.width * 0.23);
assert.ok(freeHand.width > 20 && freeHand.height > 28);
assert.ok(pocketHand.width > 20 && pocketHand.height > 17);
assert.ok(overlap(pocketCuff, pocketHand));
assert.ok(skirt.width >= 96 && skirt.height > 90);
assert.ok(leftShoe.width > 46 && rightShoe.width > 52);
assert.ok(leftOpening.width > 18 && rightOpening.width > 21);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass five smoke passed');

function overlap(firstBox, secondBox) {
	return firstBox.maxX >= secondBox.minX
		&& secondBox.maxX >= firstBox.minX
		&& firstBox.maxY >= secondBox.minY
		&& secondBox.maxY >= firstBox.minY;
}
function required(nodeId) { return Proof.required(nodes, nodeId, 'path'); }
function box(nodeId) { return Proof.bounds(required(nodeId)); }
function ellipse(nodeId) { return Proof.required(nodes, nodeId, 'ellipse'); }
function circle(nodeId) { return Proof.required(nodes, nodeId, 'circle'); }
