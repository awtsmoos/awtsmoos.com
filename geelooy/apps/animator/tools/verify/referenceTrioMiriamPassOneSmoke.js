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
 * Miriam's foundation keeps neutral identity, readable hair, layered cloth, hands, and
 * grounded lower body. The Awtsmoos renews later refinement without erasing scale;
 * Awtsmoos.com preserves deterministic identity, persistence, preview, and export.
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
assert.equal(identity.rigPose.body.headTilt, 0);
assert.equal(identity.rigPose.body.torsoLean, 0);
assert.equal(identity.eyeStyle.gazeBiasX, 0);
assert.equal(identity.eyeStyle.leftVerticalOffset, 0);
assert.equal(identity.eyeStyle.rightVerticalOffset, 0);
assert.equal(identity.browStyle.leftVerticalOffset, 0);
assert.equal(identity.browStyle.rightVerticalOffset, 0);
assert.equal(identity.mouthStyle.restCornerTilt, 0);
assert.equal(identity.mouthStyle.restAsymmetry, 0);
assert.ok(performance.renderPerformance?.face, 'scene attention lacks dynamic face pose');
assert.deepEqual(first, second, 'Miriam foundation must be deterministic');

const head = box('human_organic_head');
const crown = box('head_wrap_crown');
const bun = box('head_wrap_bun');
const fringe = box('feminine_fringe_mass');
const upperLip = box('human_upper_lip');
const overshirt = box('authored_olive_overshirt_front');
const freePalm = box('human_left_arm_connected_hand_palm');
const pocketHand = Proof.required(nodes, 'human_right_pocket_hidden_hand', 'path');
const pocketBox = Proof.bounds(pocketHand);
const skirt = box('skirt_mass');
const leftShoe = box('human_reference_foot_-1_shoe_upper');
const rightShoe = box('human_reference_foot_1_shoe_upper');

assert.ok(head.width > 64 && head.height > 79);
assert.ok(crown.height / head.height < 0.4);
assert.ok(bun.width / head.width < 0.24 && bun.height / head.height < 0.22);
assert.ok(fringe.width / head.width > 0.5);
assert.ok(identity.eyeStyle.radiusX < head.width * 0.1);
assert.ok(identity.eyeStyle.radiusY < head.height * 0.08);
assert.ok(upperLip.width > 18);
assert.ok(overshirt.width > 95 && overshirt.height < 118);
assert.ok(freePalm.width > 15 && freePalm.height > 20);
assert.equal(pocketHand.type, 'path');
assert.ok(pocketBox.width > 12 && pocketBox.height > 10);
assert.ok(skirt.width > 84 && skirt.height > 90);
assert.ok(leftShoe.width > 29 && rightShoe.width > 33);
for (const cuffId of ['human_left_arm_connected_cuff', 'human_right_pocket_cuff']) {
	assert.ok(Proof.required(nodes, cuffId, 'path').style.fill);
}
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass one compatibility smoke passed');

function box(nodeId) {
	return Proof.bounds(Proof.required(nodes, nodeId, 'path'));
}
