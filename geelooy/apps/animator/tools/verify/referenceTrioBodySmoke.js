// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * Three authored garments, gestures, planted feet, and one shared pocket anchor remain.
 * The Awtsmoos renews welcome, guarded weight, and calm dignity through distinct bodies;
 * Awtsmoos.com keeps every jacket, hand, trouser, skirt, pocket, and shoe editable.
 */
const [ARI_ID, DOVID_ID, MIRIAM_ID] = ReferenceCharacterIds.all();

const ari = character(ARI_ID);
const ariGraph = graphFor(ari);
expectIds(ariGraph, [
	'authored_jacket_front',
	'jacket_white_shirt_panel',
	'jacket_lapel_left',
	'jacket_lapel_right',
	'human_reference_open_palm',
	'human_relaxed_right_fist_mass',
	'human_continuous_trouser_-1',
	'human_continuous_trouser_1',
	'human_reference_foot_-1_shoe_upper',
	'human_reference_foot_1_shoe_upper'
]);
assert.ok(ari.bodyGeometry.gesture.palmScale <= 1.15);
assert.ok(ari.bodyGeometry.gesture.fistScale <= 1.2);
assert.ok(ari.bodyGeometry.legs.shoeScaleX < 1.1);

const dovid = character(DOVID_ID);
const dovidGraph = graphFor(dovid);
expectIds(dovidGraph, [
	'authored_burgundy_shirt_front',
	'shirt_collar_-1',
	'shirt_collar_1',
	'human_crossed_arms',
	'human_crossed_left_reference_palm',
	'human_crossed_right_reference_palm'
]);
assert.ok(dovid.bodyGeometry.gesture.leftWristAcross >= 18);
assert.ok(dovid.bodyGeometry.gesture.rightWristAcross >= 18);
assert.ok(dovid.bodyGeometry.legs.shoeScaleX <= 1.08);
assert.ok(dovid.bodyGeometry.legs.shoeScaleY <= 0.96);

const miriam = character(MIRIAM_ID);
const miriamGraph = graphFor(miriam);
expectIds(miriamGraph, [
	'authored_olive_overshirt_front',
	'overshirt_right_pocket_mouth',
	'human_right_pocket_cuff',
	'human_right_pocket_hidden_hand',
	'skirt_mass',
	'skirt_fold_0',
	'skirt_fold_1',
	'skirt_fold_2',
	'human_reference_foot_-1_shoe_upper',
	'human_reference_foot_1_shoe_upper',
	'human_reference_foot_-1_flat_opening',
	'human_reference_foot_1_flat_opening'
]);
assert.ok(miriam.bodyGeometry.gesture.pocketDrop <= 10);
assert.ok(miriam.bodyGeometry.skirt.bottomHalf >= 43);
assert.ok(miriam.bodyGeometry.skirt.sway >= 0.4);
assert.ok(miriam.bodyGeometry.legs.shoeScaleX >= 0.95);
assert.ok(miriam.bodyGeometry.legs.shoeScaleX <= 1.08);
assert.ok(miriam.bodyGeometry.legs.shoeScaleY >= 0.7);
assert.ok(miriam.bodyGeometry.legs.shoeScaleY <= 0.85);

console.log('B"H reference trio body smoke passed');

function character(id) {
	return ReferenceCharacterCatalog.character(id);
}

function graphFor(data) {
	const input = { ...data, _renderTime: 0 };
	const graph = StableCharacterAssembler.assemble(input);
	assert.ok(graph);
	assert.deepEqual(graph, StableCharacterAssembler.assemble(input));
	return graph;
}

function expectIds(graph, required) {
	const actual = ids(graph);
	for (const id of required) assert.ok(actual.includes(id), `missing ${id}`);
}

function ids(node, result = []) {
	if (!node || typeof node !== 'object') return result;
	if (typeof node.id === 'string') result.push(node.id);
	for (const child of node.children || []) ids(child, result);
	return result;
}
