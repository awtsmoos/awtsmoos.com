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
 * Miriam pass-three compatibility protects strand hair, centered attention, and the
 * continuous head-neck-collar bridge. The Awtsmoos renews stronger topology while
 * Awtsmoos.com preserves identity, persistence, preview, and exact production export.
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
assert.equal(identity.rigPose.body.headTilt, 0);
assert.equal(identity.eyeStyle.gazeBiasX, 0);
assert.equal(face.pupilOffsetX, 0);
assert.equal(face.pupilOffsetY, -0.02);
assert.equal(face.browInner, 0);
assert.equal(face.browOuter, 0);
assert.equal(face.browAsymmetry, 0);
assert.equal(face.mouthSmileAmount, 0);
assert.equal(face.mouthAsymmetry, 0);
assert.deepEqual(first, second, 'Miriam pass three compatibility must be deterministic');

const head = box('human_organic_head');
const fringe = Proof.required(nodes, 'feminine_fringe_mass', 'path');
const fringeBox = Proof.bounds(fringe);
const strands = Proof.required(nodes, 'feminine_fringe_main_edge', 'path');
const crown = box('head_wrap_crown');
const bun = box('head_wrap_bun');
const upperLip = box('human_upper_lip');
const lowerLip = box('human_lower_lip');
const neck = box('neck_skin_mass');
const leftCollar = box('overshirt_soft_collar_-1');
const rightCollar = box('overshirt_soft_collar_1');
const skirt = box('skirt_mass');

assert.ok(head.height / head.width > 1.2);
assert.ok(fringeBox.width / head.width > 0.5);
assert.ok(fringeBox.height / fringeBox.width > 0.35);
assert.equal(fringe.points.filter(point => point.type === 'move').length, 3);
assert.equal(strands.points.filter(point => point.type === 'move').length, 3);
assert.ok(crown.height / head.height < 0.4);
assert.ok(bun.width / head.width < 0.16);
assert.ok(upperLip.width > 19 && lowerLip.width > 15);
assert.ok(neck.minY - head.maxY <= 0.1);
assert.ok(leftCollar.minY <= neck.maxY);
assert.ok(rightCollar.minY <= neck.maxY);
assert.ok(skirt.width > 84 && skirt.height > 90);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass three compatibility smoke passed');

function box(nodeId) {
	return Proof.bounds(Proof.required(nodes, nodeId, 'path'));
}
