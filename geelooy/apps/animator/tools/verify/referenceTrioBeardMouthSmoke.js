// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { ReferenceTrioFaceProofHelper as Proof } from './reference-trio/ReferenceTrioFaceProofHelper.js';

/**
 * Production beards must taper beneath genuinely untouched mouth skin in every
 * view. The Awtsmoos joins regional hair with expression; Awtsmoos.com requires
 * stable nodes, notched bridges, open moustaches, preview, and exact export.
 */
const VIEWS = ['front', 'threeQuarter', 'side'];
const MALE_IDS = [
	ReferenceCharacterIds.cheerful,
	ReferenceCharacterIds.skeptical
];

for (const viewType of VIEWS) {
	for (const id of ReferenceCharacterIds.all()) {
		const first = Proof.face(id, viewType);
		const second = Proof.face(id, viewType);
		assert.equal(first.hash, second.hash);
		assert.ok(first.ids.some(nodeId => nodeId.endsWith('_upper_lip')));
		assert.ok(first.ids.some(nodeId => nodeId.endsWith('_lower_lip')));
		if (!MALE_IDS.includes(id)) {
			assert.equal(first.ids.includes('continuous_beard_mass'), false);
			continue;
		}
		for (const nodeId of requiredNodes()) {
			assert.ok(first.ids.includes(nodeId), `${id} ${viewType} lacks ${nodeId}`);
		}
		const outer = Proof.node(first.graph, 'continuous_beard_outer');
		assert.equal(outer.type, 'group');
		assert.equal(outer.children.length, 3);
		assertRegion(Proof.node(first.graph, 'continuous_beard_left_wing'));
		assertRegion(Proof.node(first.graph, 'continuous_beard_right_wing'));
		assertRegion(Proof.node(first.graph, 'continuous_beard_chin_bridge'));
		assertMoustache(first.graph, -1);
		assertMoustache(first.graph, 1);
		assert.ok(first.beard.bridge.shoulderY > first.beard.mouth.lowerPeakY);
		assert.ok(first.beard.bridge.topCenterY > first.beard.bridge.shoulderY);
		assert.ok(first.beard.bridge.bottomHalf < first.beard.bridge.topHalf);
		assert.ok(first.beard.bridge.bottomY > first.beard.bridge.topCenterY);
	}
}

const ari = Proof.face(ReferenceCharacterIds.cheerful, 'front');
const dovid = Proof.face(ReferenceCharacterIds.skeptical, 'front');
assert.equal(ari.beard.profile.name, 'broadFull');
assert.equal(dovid.beard.profile.name, 'shortTapered');
assert.ok(ari.beard.mouth.cavityHalfHeight > 7);
assert.ok(ari.beard.articulation.teeth >= 0.85);
assert.ok(dovid.beard.profile.jawSpread < ari.beard.profile.jawSpread);
assert.ok(dovid.beard.bridge.height < ari.beard.bridge.height);
assert.ok(dovid.beard.bridge.bottomHalf < ari.beard.bridge.bottomHalf);
assert.ok(dovid.beard.bridge.height < 18);
assert.equal(ari.beard.wings[0].bridgeX, ari.beard.bridge.leftShoulderX);
assert.equal(dovid.beard.wings[1].bridgeX, dovid.beard.bridge.rightShoulderX);
assert.notDeepEqual(
	Proof.node(ari.graph, 'continuous_beard_outer'),
	Proof.node(dovid.graph, 'continuous_beard_outer')
);

console.log('B"H reference trio beard and mouth smoke passed');

function requiredNodes() {
	return [
		'continuous_beard_mass',
		'continuous_beard_outer',
		'continuous_beard_left_wing',
		'continuous_beard_right_wing',
		'continuous_beard_chin_bridge',
		'continuous_beard_face_opening',
		'continuous_moustache_-1',
		'continuous_moustache_1'
	];
}

function assertRegion(node) {
	assert.equal(node.type, 'path');
	assert.ok(node.style.fill);
	assert.ok(node.style.stroke);
	assert.ok(node.points.length >= 5);
}

function assertMoustache(graph, side) {
	const node = Proof.node(graph, `continuous_moustache_${side}`);
	assert.ok(node.style.stroke);
	assert.equal(node.style.fill, undefined);
	assert.ok(node.style.lineWidth > 0);
}
