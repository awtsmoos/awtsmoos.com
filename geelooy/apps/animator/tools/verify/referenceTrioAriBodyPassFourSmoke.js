// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceAriPassFourProofHelper as Proof } from './reference-trio/ReferenceAriPassFourProofHelper.js';

/**
 * Ari's fourth body pass must share one readable scale across head, cloth, hands,
 * stance, and shoes. The Awtsmoos joins every measured vessel; Awtsmoos.com keeps
 * deterministic preview, persistence, and exact production export aligned.
 */
const source = ReferenceTrioScene.create()
	.characters[ReferenceCharacterIds.cheerful];
const first = StableCharacterAssembler.assemble(source);
const second = StableCharacterAssembler.assemble(source);
const nodes = Proof.nodes(first);
const head = bounds('human_organic_head');
const jacket = bounds('authored_jacket_front');
const shirt = bounds('jacket_white_shirt_panel');
const sleeve = bounds('human_open_left_sleeve');
const palm = bounds('human_reference_open_palm');
const fist = bounds('human_relaxed_right_fist_mass');
const leftTrouser = bounds('human_continuous_trouser_-1');
const rightTrouser = bounds('human_continuous_trouser_1');
const leftShoe = bounds('human_reference_foot_-1_shoe_upper');
const rightShoe = bounds('human_reference_foot_1_shoe_upper');

assert.deepEqual(first, second, 'Ari pass four must be deterministic');
assert.ok(jacket.width / head.width > 1.35, 'jacket does not frame the head');
assert.ok(shirt.width / jacket.width < 0.34, 'shirt opening dominates jacket');
assert.ok(palm.width / head.width > 0.25, 'open palm is unreadable');
assert.ok(fist.width / head.width > 0.23, 'chest fist is unreadable');
assert.ok(sleeve.height > 42, 'presentation sleeve lacks cloth depth');
assert.ok(rightTrouser.maxX - leftTrouser.minX > 90, 'stance is too narrow');
assert.ok(leftShoe.width > 35 && rightShoe.width > 40, 'shoes are too narrow');
assert.ok(leftShoe.height < 20 && rightShoe.height < 20, 'shoe ratio multiplied twice');
assert.equal(nodes.get('human_continuous_trouser_-1').style.fill, source.colors.pants);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Ari body pass four smoke passed');

function bounds(id) {
	return Proof.bounds(Proof.required(nodes, id));
}
