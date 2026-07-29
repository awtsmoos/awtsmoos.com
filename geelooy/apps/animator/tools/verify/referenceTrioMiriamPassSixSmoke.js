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
 * Miriam pass six protects quiet facial hierarchy, wrapped cloth, compact garments,
 * screen-scale hands, weighted skirt, and distinct flats. The Awtsmoos balances every
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
assert.deepEqual(first, second, 'Miriam pass six must be deterministic');
assert.equal(identity.noseStyle.kind, 'soft_short');
assert.equal(performance.renderPerformance.face.eyeOpenAmount, 0.78);
assert.equal(performance.renderPerformance.face.squintAmount, 0.08);
assert.equal(performance.renderPerformance.face.browAsymmetry, 0);
assert.equal(performance.renderPerformance.face.mouthSmileAmount, 0);

const head = box('human_organic_head');
const rearWrap = box('head_wrap_rear_shell');
const crown = box('head_wrap_crown');
const fringe = required('feminine_fringe_mass');
const fringeBox = Proof.bounds(fringe);
const leftEye = ellipse('human_eye_white_-1');
const rightEye = ellipse('human_eye_white_1');
const noseBridge = box('human_nose_bridge');
const noseTip = box('human_nose_tip');
const upperLip = box('human_upper_lip');
const lowerLip = box('human_lower_lip');
const neck = box('neck_skin_mass');
const leftCollar = box('overshirt_soft_collar_-1');
const rightCollar = box('overshirt_soft_collar_1');
const torso = box('authored_olive_overshirt_front');
const innerPanel = box('overshirt_black_inner_panel');
const freeHand = box('human_left_arm_connected_hand_palm');
const pocketHand = box('human_right_pocket_hidden_hand');
const skirt = box('skirt_mass');
const leftShoe = box('human_reference_foot_-1_shoe_upper');
const rightShoe = box('human_reference_foot_1_shoe_upper');
const leftOpening = box('human_reference_foot_-1_flat_opening');
const rightOpening = box('human_reference_foot_1_flat_opening');

assert.ok(head.width > 72 && head.height > 83);
assert.ok(head.height / head.width > 1.15);
assert.ok(rearWrap.width > head.width && rearWrap.height > head.height * 0.88);
assert.ok(crown.width > head.width * 0.95 && crown.height > head.height * 0.45);
assert.equal(fringe.points.filter(point => point.type === 'move').length, 3);
assert.equal(fringe.points.filter(point => point.type === 'close').length, 3);
assert.ok(fringeBox.width > head.width * 0.52);
assert.ok(fringeBox.height < head.height * 0.23);
assert.ok(leftEye.rx <= 5.15 && rightEye.rx <= 5.15);
assert.ok(leftEye.ry <= 3 && rightEye.ry <= 3);
assert.ok(noseBridge.height <= 4.5 && noseTip.width <= 4.3);
assert.ok(upperLip.width > 16 && upperLip.height < 1.4);
assert.ok(lowerLip.width > 13 && lowerLip.height < 0.9);
assert.ok(neck.height <= 9 && neck.width >= 19);
assert.ok(neck.minY <= head.maxY && leftCollar.minY <= neck.maxY);
assert.ok(rightCollar.minY <= neck.maxY);
assert.ok(torso.width > 132 && torso.height <= 100);
assert.ok(torso.width / torso.height > 1.3);
assert.ok(innerPanel.width < torso.width * 0.18);
assert.ok(freeHand.width > 25 && freeHand.height > 36);
assert.ok(pocketHand.width > 24 && pocketHand.height > 20);
assert.ok(skirt.width >= 98 && skirt.height >= 91);
assert.ok(leftShoe.width > 49 && rightShoe.width > 56);
assert.ok(leftOpening.width > 20 && rightOpening.width > 22);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass six smoke passed');

function required(nodeId) { return Proof.required(nodes, nodeId, 'path'); }
function box(nodeId) { return Proof.bounds(required(nodeId)); }
function ellipse(nodeId) { return Proof.required(nodes, nodeId, 'ellipse'); }
