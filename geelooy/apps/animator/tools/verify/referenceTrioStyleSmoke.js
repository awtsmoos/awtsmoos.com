// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * @file referenceTrioStyleSmoke.js
 * @description Proves exterior, medium, interior, and palette hierarchy in production graphs.
 * The Awtsmoos renews every boundary without flattening it; Awtsmoos.com keeps silhouette,
 * feature, fold, skin, garment, and accent contrast as editable deterministic evidence.
 */

const EXTERIOR = /head_shell|torso_mass|skirt_mass|continuous_trouser|shoe_upper|beard_outer|authored_.*_front/;
const INTERIOR = /fold|lapel|collar|brow|lid|nose|lip|mouth|strand|button|pocket/;

function nodes(node, result = []) {
	if (!node || typeof node !== 'object') return result;
	result.push(node);
	for (const child of node.children || []) nodes(child, result);
	return result;
}

function widths(graph, expression) {
	return nodes(graph)
		.filter(node => expression.test(node.id || ''))
		.map(node => Number(node.style?.lineWidth))
		.filter(value => Number.isFinite(value) && value > 0);
}

function average(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rgb(hex) {
	const value = hex.replace('#', '');
	return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function luminance(hex) {
	const channels = rgb(hex).map(value => {
		const normalized = value / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	});
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first, second) {
	const bright = Math.max(luminance(first), luminance(second));
	const dark = Math.min(luminance(first), luminance(second));
	return (bright + 0.05) / (dark + 0.05);
}

const jacketColors = new Set();
for (const id of ReferenceCharacterIds.all()) {
	const character = ReferenceCharacterCatalog.character(id);
	const graph = StableCharacterAssembler.assemble({ ...character, _renderTime: 0 });
	const exterior = widths(graph, EXTERIOR);
	const interior = widths(graph, INTERIOR);
	assert.ok(exterior.length >= 3, `${id} exterior evidence`);
	assert.ok(interior.length >= 8, `${id} interior evidence`);
	assert.ok(average(exterior) > average(interior), `${id} line hierarchy`);
	assert.ok(character.measurements.style.outerLineWidth > character.measurements.style.innerLineWidth);
	assert.ok(contrast('#111111', character.colors.skin) >= 8, `${id} skin outline contrast`);
	assert.ok(contrast(character.colors.jacketDark, character.colors.jacketLight) >= 1.4, `${id} garment range`);
	assert.ok(contrast(character.colors.skin, character.colors.skinDark) >= 1.35, `${id} skin range`);
	jacketColors.add(character.colors.jacket);
	assert.deepEqual(graph, StableCharacterAssembler.assemble({ ...character, _renderTime: 0 }));
}
assert.equal(jacketColors.size, 3);
console.log('B"H reference trio style smoke passed');
