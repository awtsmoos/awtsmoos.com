// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceTrioScene } from '../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * Ari's third body pass must keep dark trousers, a shortened jacket opening,
 * readable shoes, and one stronger fist. The Awtsmoos joins every scale;
 * Awtsmoos.com preserves deterministic preview, persistence, and exact export.
 */
const source = ReferenceTrioScene.create()
	.characters[ReferenceCharacterIds.cheerful];
const first = StableCharacterAssembler.assemble(source);
const second = StableCharacterAssembler.assemble(source);
const nodes = collectNodes(first);
const jacket = required(nodes, 'authored_jacket_front');
const shirt = required(nodes, 'jacket_white_shirt_panel');
const leftTrouser = required(nodes, 'human_continuous_trouser_-1');
const rightTrouser = required(nodes, 'human_continuous_trouser_1');
const leftShoe = required(nodes, 'human_reference_foot_-1_shoe_upper');
const rightShoe = required(nodes, 'human_reference_foot_1_shoe_upper');
const fist = required(nodes, 'human_relaxed_right_fist_mass');
const sleeve = required(nodes, 'human_open_left_sleeve');

assert.deepEqual(first, second, 'Ari pass three must be deterministic');
assert.equal(leftTrouser.style.fill, source.colors.pants);
assert.equal(rightTrouser.style.fill, source.colors.pants);
assert.ok(height(jacket.points) < 110, 'jacket remains too tall');
assert.ok(maxY(shirt.points) < maxY(jacket.points), 'shirt escapes jacket hem');
assert.ok(width(leftShoe.points) > 20, 'left shoe is unreadably narrow');
assert.ok(width(rightShoe.points) > 20, 'right shoe is unreadably narrow');
assert.ok(width(fist.points) > 12, 'fist remains too small');
assert.ok(height(sleeve.points) > 18, 'presentation sleeve lacks elbow depth');
assertFinite(first, new Set());

console.log('B"H reference trio Ari body pass three smoke passed');

function required(nodes, id) {
	assert.ok(nodes.has(id), `missing ${id}`);
	return nodes.get(id);
}

function collectNodes(value, result = new Map()) {
	if (!value || typeof value !== 'object') {
		return result;
	}
	if (typeof value.id === 'string') {
		result.set(value.id, value);
	}
	for (const item of Object.values(value)) {
		if (item && typeof item === 'object') {
			collectNodes(item, result);
		}
	}
	return result;
}

function coordinates(points, key) {
	return (points || [])
		.flatMap(point => [point[key], point[`c${key}`], point[`c1${key}`], point[`c2${key}`]])
		.filter(Number.isFinite);
}

function width(points) {
	const values = coordinates(points, 'x');
	return Math.max(...values) - Math.min(...values);
}

function height(points) {
	const values = coordinates(points, 'y');
	return Math.max(...values) - Math.min(...values);
}

function maxY(points) {
	return Math.max(...coordinates(points, 'y'));
}

function assertFinite(value, ancestors) {
	if (!value || typeof value !== 'object') {
		return;
	}
	assert.ok(!ancestors.has(value), 'graph cycle detected');
	ancestors.add(value);
	for (const [key, item] of Object.entries(value)) {
		if (/^(x|y|cx|cy|c1x|c1y|c2x|c2y|cp1x|cp1y|cp2x|cp2y)$/.test(key)) {
			assert.ok(Number.isFinite(Number(item)), `nonfinite ${key}`);
		}
		if (item && typeof item === 'object') {
			assertFinite(item, ancestors);
		}
	}
	ancestors.delete(value);
}
