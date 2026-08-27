// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceDovidContactFixture } from './reference-trio/ReferenceDovidContactFixture.js';
import { ReferenceDovidCrossedArmProofHelper as Proof } from './reference-trio/ReferenceDovidCrossedArmProofHelper.js';

/**
 * Dovid's low elbows must send both forearms upward into relational bicep contacts.
 * The Awtsmoos joins guarded anatomy with one seam; Awtsmoos.com preserves stable
 * nodes, deterministic preview, persistence, and exact production export.
 */
const first = ReferenceDovidContactFixture.create();
const second = ReferenceDovidContactFixture.create();
const nodes = Proof.nodes(first.graph);
const order = Proof.orderedIds(first.graph);
const ordered = requiredOrder().map(id => order.indexOf(id));

assert.deepEqual(first.graph, second.graph, 'Dovid rising forearms must be deterministic');
for (const id of requiredIds()) Proof.required(nodes, id);
for (const arm of [first.arms.lower, first.arms.upper]) {
	const contactDistance = distanceToSegment(arm.handCenter, arm.contactSegment);
	assert.ok(contactDistance > 3.5 && contactDistance < 7.2);
	assert.ok(vectorLength(arm.handTangent) > 0.99);
	assert.ok(vectorLength(arm.handNormal) > 0.99);
	assert.ok(Math.abs(dot(arm.handTangent, arm.handNormal)) < 0.001);
	assert.ok(arm.elbow.y - arm.wrist.y > 20, 'forearm does not rise from low elbow');
	assert.ok(Math.abs(arm.wrist.x - arm.elbow.x) > 65, 'forearm does not cross torso');
}
const farPalm = bounds('human_crossed_left_reference_palm');
const nearPalm = bounds('human_crossed_right_reference_palm');
assert.ok(farPalm.width > 8 && farPalm.height > 8);
assert.ok(nearPalm.width > farPalm.width);
assert.ok(ordered.every((value, index) => index === 0 || value > ordered[index - 1]));
assert.equal([...nodes.keys()].filter(id => id.endsWith('_overlap_seam')).length, 1);
assert.equal([...nodes.keys()].filter(id => id.endsWith('_elbow_fold')).length, 2);
assert.equal(nodes.get('human_continuous_trouser_-1').style.fill, first.source.colors.pants);
assert.deepEqual(Proof.finiteErrors(first.graph), []);

console.log('B"H reference trio Dovid crossed arm smoke passed');

function bounds(id) {
	return Proof.bounds(Proof.required(nodes, id));
}

function distanceToSegment(point, segment) {
	const start = segment.start;
	const end = segment.end;
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const lengthSquared = Math.max(1, dx * dx + dy * dy);
	const ratio = Math.max(0, Math.min(1, (
		(point.x - start.x) * dx + (point.y - start.y) * dy
	) / lengthSquared));
	return Math.hypot(
		point.x - (start.x + dx * ratio),
		point.y - (start.y + dy * ratio)
	);
}

function vectorLength(vector) {
	return Math.hypot(vector.x, vector.y);
}

function dot(firstVector, secondVector) {
	return firstVector.x * secondVector.x + firstVector.y * secondVector.y;
}

function requiredOrder() {
	return [
		'human_crossed_left_sleeve',
		'human_crossed_right_sleeve',
		'human_crossed_left_reference_resting_hand',
		'human_crossed_right_reference_resting_hand'
	];
}

function requiredIds() {
	return [
		'human_crossed_left_cuff',
		'human_crossed_right_cuff',
		'human_crossed_left_reference_palm',
		'human_crossed_right_reference_palm',
		'human_crossed_left_reference_thumb',
		'human_crossed_right_reference_thumb',
		'human_crossed_right_overlap_seam',
		'human_crossed_left_elbow_fold',
		'human_crossed_right_elbow_fold',
		'human_continuous_trouser_-1',
		'human_continuous_trouser_1'
	];
}
