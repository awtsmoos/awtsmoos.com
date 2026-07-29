// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableSoftOvalHead2D } from '../../src/character/factory/stable/StableSoftOvalHead2D.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceMiriamProofHelper as Proof } from './reference-trio/ReferenceMiriamProofHelper.js';

/**
 * Miriam pass four protects a dedicated oval, restrained facial scale, filled locks,
 * attached bun, anatomical lips, and clothed neck. The Awtsmoos reveals identity
 * dynamically; Awtsmoos.com preserves persistence, preview, and exact export.
 */
const id = ReferenceCharacterIds.calm;
const identity = ReferenceCharacterCatalog.character(id);
const performance = ReferenceTrioScene.create().characters[id];
const first = StableCharacterAssembler.assemble(performance);
const second = StableCharacterAssembler.assemble(performance);
const nodes = Proof.index(first);

assert.equal(identity.faceStyle.contourKind, 'soft_oval');
assert.equal(identity.emotion, 'neutral');
assert.equal(performance.emotion, 'attention');
assert.deepEqual(Proof.identity(identity), Proof.identity(performance));
assert.deepEqual(first, second, 'Miriam pass four must be deterministic');

const headNode = required('human_organic_head');
const head = Proof.bounds(headNode);
const fringeNode = required('feminine_fringe_mass');
const fringe = Proof.bounds(fringeNode);
const strandNode = required('feminine_fringe_main_edge');
const crown = box('head_wrap_crown');
const gather = box('head_wrap_bun_gather');
const bun = box('head_wrap_bun');
const upperLip = box('human_upper_lip');
const lowerLip = box('human_lower_lip');
const neck = box('neck_skin_mass');
const leftCollar = box('overshirt_soft_collar_-1');
const rightCollar = box('overshirt_soft_collar_1');
const leftEye = ellipse('human_eye_white_-1');
const rightEye = ellipse('human_eye_white_1');
const leftPupil = circle('human_pupil_-1');
const rightPupil = circle('human_pupil_1');
const leftEar = ellipse('human_reference_ear_-1');
const rightEar = ellipse('human_reference_ear_1');

assert.equal(headNode.points.length, 12);
assert.equal(headNode.points.filter(point => point.type === 'bezier').length, 10);
assert.equal(headNode.points.filter(point => point.type === 'line').length, 0);
assert.equal(headNode.points.filter(point => point.type === 'quad').length, 0);
assert.ok(head.height / head.width > 1.2);
assert.equal(fringeNode.points.filter(point => point.type === 'move').length, 3);
assert.equal(fringeNode.points.filter(point => point.type === 'close').length, 3);
assert.equal(strandNode.points.filter(point => point.type === 'move').length, 3);
assert.ok(fringe.width / head.width > 0.5);
assert.ok(leftEye.rx <= 6.1 && rightEye.rx <= 6.1);
assert.ok(leftEye.ry <= 4.6 && rightEye.ry <= 4.6);
assert.equal(leftPupil.x, rightPupil.x);
assert.equal(leftPupil.y, rightPupil.y);
assert.ok(leftPupil.r <= 1.5 && rightPupil.r <= 1.5);
assert.ok(leftEar.rx <= 3 && rightEar.rx <= 3);
assert.ok(leftEar.ry <= 4.7 && rightEar.ry <= 4.7);
assert.ok(gather.minX <= crown.maxX + 0.01);
assert.ok(gather.maxX >= bun.minX);
assert.ok(upperLip.width > 19 && upperLip.height > 1.7);
assert.ok(lowerLip.width > 15 && lowerLip.height > 2.7);
assert.ok(neck.minY - head.maxY <= 0.1);
assert.ok(leftCollar.minY <= neck.maxY && rightCollar.minY <= neck.maxY);
for (const view of ['front', 'threeQuarter', 'side']) assertView(view);
assert.deepEqual(Proof.finiteErrors(first), []);

console.log('B"H reference trio Miriam pass four smoke passed');

function assertView(type) {
	const view = { type, dir: 1 };
	const points = StableSoftOvalHead2D.points(33, 38, view, identity.faceStyle);
	assert.equal(points.length, 12);
	assert.equal(points.filter(point => point.type === 'bezier').length, 10);
	assert.ok(points.every(point => Object.values(point)
		.every(value => typeof value !== 'number' || Number.isFinite(value))));
}

function required(nodeId) { return Proof.required(nodes, nodeId, 'path'); }
function box(nodeId) { return Proof.bounds(required(nodeId)); }
function ellipse(nodeId) { return Proof.required(nodes, nodeId, 'ellipse'); }
function circle(nodeId) { return Proof.required(nodes, nodeId, 'circle'); }
