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
 * Miriam pass-two compatibility protects neutral identity, readable scale, and cloth.
 * The Awtsmoos renews later topology without erasing foundations; Awtsmoos.com
 * preserves deterministic persistence, preview, and exact production export.
 */
const id = ReferenceCharacterIds.calm;
const identity = ReferenceCharacterCatalog.character(id);
const performance = ReferenceTrioScene.create().characters[id];
const first = StableCharacterAssembler.assemble(performance);
const second = StableCharacterAssembler.assemble(performance);
const nodes = Proof.index(first);
const face = performance.renderPerformance.face;

assert.equal(identity.emotion, 'neutral');
assert.equal(performance.emotion, 'attention');
assert.deepEqual(Proof.identity(identity), Proof.identity(performance));
assert.equal(identity.eyeStyle.gazeBiasX, 0);
assert.equal(identity.browStyle.leftVerticalOffset, 0);
assert.equal(identity.browStyle.rightVerticalOffset, 0);
assert.equal(identity.mouthStyle.restCornerTilt, 0);
assert.equal(identity.mouthStyle.restAsymmetry, 0);
assert.equal(face.pupilOffsetX, 0);
assert.equal(face.pupilOffsetY, -0.02);
assert.equal(face.browAsymmetry, 0);
assert.equal(face.mouthSmileAmount, 0);
assert.equal(performance.facePose.mouth.smile, 0);
assert.deepEqual(first, second, 'Miriam compatibility must be deterministic');

const head = box('human_organic_head');
const fringe = box('feminine_fringe_mass');
const crown = box('head_wrap_crown');
const bun = box('head_wrap_bun');
const upperLip = box('human_upper_lip');
const lowerLip = box('human_lower_lip');
const neck = box('neck_skin_mass');
const overshirt = box('authored_olive_overshirt_front');
const innerPanel = box('overshirt_black_inner_panel');
const pocketHand = box('human_right_pocket_hidden_hand');
const skirt = box('skirt_mass');
const leftShoe = box('human_reference_foot_-1_shoe_upper');
const rightShoe = box('human_reference_foot_1_shoe_upper');

assert.ok(head.width > 64 && head.height > 79);
assert.ok(fringe.width / head.width > 0.5);
assert.ok(crown.height / head.height < 0.4);
assert.ok(bun.width / head.width < 0.2);
assert.ok(upperLip.width > 19 && lowerLip.width > 15);
assert.ok(neck.height >= 10);
assert.ok(overshirt.width > 98 && overshirt.height < 118);
assert.ok(innerPanel.width < 30);
assert.ok(pocketHand.width > 12 && pocketHand.height > 10);
assert.ok(skirt.width > 84 && skirt.height > 90);
assert.ok(leftShoe.width > 29 && rightShoe.width > 33);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass two compatibility smoke passed');

function box(nodeId) {
	return Proof.bounds(Proof.required(nodes, nodeId, 'path'));
}
