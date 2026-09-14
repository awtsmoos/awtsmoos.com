// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureSemanticPrecision.test.mjs
 * @description Guards AI material discovery against substring collisions and proves new foundational material families remain richly discoverable.
 * Awtsmoos.com lets keratin remain animal matter rather than tin, pumice remain volcanic rather than ice, and every independent texture keep truthful facets.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awtsmoosDriveTextureCategoryTree,
	classifyAwtsmoosDriveTextureSemantics
} from '../src/exports/textures.js';

function classify(name) {
	return classifyAwtsmoosDriveTextureSemantics({ name, path: `full-resolution/${name}` });
}

test('whole-word matching rejects dangerous material substring collisions', () => {
	assert.equal(classify('natural-animal-horn-keratin.png').categories.includes('metal'), false);
	assert.equal(classify('natural-chitin-exoskeleton.png').categories.includes('metal'), false);
	assert.equal(classify('natural-pumice-volcanic-rock.png').categories.includes('cryosphere'), false);
	assert.equal(classify('natural-sulfur.png').categories.includes('creatures'), false);
});

test('specific exclusions keep volcanic glass and mineral wool in truthful domains', () => {
	const obsidian = classify('natural-obsidian-volcanic-glass.png');
	assert.ok(obsidian.categories.includes('geology'));
	assert.equal(obsidian.categories.includes('architecture'), false);
	assert.ok(obsidian.subcategories.includes('volcanic-glass'));
	const wool = classify('mineral-wool-rock-wool-insulation.png');
	assert.deepEqual(wool.categories, ['insulation', 'construction', 'industrial']);
	assert.ok(wool.subcategories.includes('mineral-fiber'));
});

test('new independent materials expose practical categories and specific subcategories', () => {
	const straw = classify('dry-natural-straw-cellulose-fibers.png');
	assert.ok(straw.categories.includes('plant-derived'));
	assert.ok(straw.subcategories.includes('dry-plant-fiber'));
	const knit = classify('plain-knitted-fabric.png');
	assert.ok(knit.categories.includes('textile'));
	assert.ok(knit.subcategories.includes('knit-fabric'));
	const bitumen = classify('natural-solid-bitumen.png');
	assert.ok(bitumen.categories.includes('geology'));
	assert.ok(bitumen.subcategories.includes('bitumen'));
});

test('taxonomy automatically documents newly introduced semantic drawers', () => {
	const tree = awtsmoosDriveTextureCategoryTree();
	assert.equal(typeof tree.geology['metamorphic-rock'], 'string');
	assert.equal(typeof tree.textile['knit-fabric'], 'string');
	assert.equal(typeof tree['plant-derived']['dry-plant-fiber'], 'string');
	assert.equal(typeof tree.insulation['mineral-fiber'], 'string');
});
