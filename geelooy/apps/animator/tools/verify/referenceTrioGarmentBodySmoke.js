// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { LineArtStyle } from '../../src/character/style/LineArtStyle.js';

/**
 * @file referenceTrioGarmentBodySmoke.js
 * @description Proves authored garments, gestures, pocket ownership, footwear, and line hierarchy.
 * The Awtsmoos renews every clothed body through one production graph; Awtsmoos.com demands
 * deterministic nodes, natural overlap, one pocket vessel, distinct shoes, and quiet seams.
 */
const cheerful = graphFor(ReferenceCharacterIds.cheerful);
const skeptical = graphFor(ReferenceCharacterIds.skeptical);
const calm = graphFor(ReferenceCharacterIds.calm);

verifyDeterministic(ReferenceCharacterIds.cheerful, cheerful.hash);
verifyDeterministic(ReferenceCharacterIds.skeptical, skeptical.hash);
verifyDeterministic(ReferenceCharacterIds.calm, calm.hash);

for (const id of [
	'authored_jacket_front',
	'jacket_lapel_left',
	'jacket_lapel_right',
	'jacket_weighted_hem'
]) {
	assert.ok(cheerful.ids.includes(id), `Ari lacks ${id}`);
}
assert.ok(cheerful.ids.some(id => id.endsWith('_relaxed_right_thumb_fold')));
assert.equal(countEnding(cheerful.ids, '_heel'), 2);
assert.equal(countEnding(cheerful.ids, '_flat_opening'), 0);

for (const id of [
	'authored_burgundy_shirt_front',
	'shirt_compact_collar_stand',
	'shirt_placket_authored'
]) {
	assert.ok(skeptical.ids.includes(id), `Dovid lacks ${id}`);
}
assert.ok(skeptical.ids.some(id => id.endsWith('_crossed_arms')));
assert.equal(countEnding(skeptical.ids, '_overlap_seam'), 1);
assert.equal(countContaining(skeptical.ids, '_reference_resting_hand'), 2);
assert.equal(countEnding(skeptical.ids, '_heel'), 2);

for (const id of [
	'authored_olive_overshirt_front',
	'overshirt_right_pocket_body',
	'overshirt_right_pocket_mouth',
	'skirt_mass',
	'skirt_weighted_hem'
]) {
	assert.ok(calm.ids.includes(id), `Miriam lacks ${id}`);
}
assert.equal(countContaining(calm.ids, 'right_pocket_rim'), 0);
assert.equal(countEnding(calm.ids, '_right_pocket_hidden_hand'), 1);
assert.equal(countEnding(calm.ids, '_flat_opening'), 2);
assert.equal(countEnding(calm.ids, '_heel'), 0);

const line = LineArtStyle.forCharacter(
	ReferenceCharacterCatalog.character(ReferenceCharacterIds.cheerful)
);
assert.ok(line.exterior > line.medium);
assert.ok(line.medium > line.seam);
assert.ok(line.seam > line.interior);
assert.ok(line.interior > line.far);
console.log('B"H reference trio garment and body smoke passed');

function graphFor(id) {
	const character = ReferenceCharacterCatalog.clone(
		ReferenceCharacterCatalog.character(id)
	);
	const graph = StableCharacterAssembler.assemble(character);
	return {
		graph,
		hash: hash(graph),
		ids: collectIds(graph)
	};
}

function verifyDeterministic(id, expectedHash) {
	assert.equal(graphFor(id).hash, expectedHash);
}

function collectIds(node, result = []) {
	if (!node || typeof node !== 'object') return result;
	if (typeof node.id === 'string') result.push(node.id);
	for (const child of node.children || []) collectIds(child, result);
	return result;
}

function countEnding(ids, suffix) {
	return ids.filter(id => id.endsWith(suffix)).length;
}

function countContaining(ids, token) {
	return ids.filter(id => id.includes(token)).length;
}

function hash(value) {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
