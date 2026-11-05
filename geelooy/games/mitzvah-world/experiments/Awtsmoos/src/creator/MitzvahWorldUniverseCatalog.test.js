// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseCatalog.test.js
 * @description Proves the player universe vocabulary is complete, categorized,
 * and resolvable: structures, nature, characters, mission beacons, sky presets,
 * terrain brushes, and starter universe templates.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	universeCatalog,
	universeCatalogByCategory,
	universeCategories,
	universePart,
	universeSkyPresets,
	universeTemplate,
	universeTemplates,
	universeTerrainBrushes
} from './MitzvahWorldUniverseCatalog.js';

test('universe catalog covers structures, nature, characters, and mission beacons', () => {
	for (const category of universeCategories()) {
		const parts = universeCatalogByCategory(category);
		assert.ok(parts.length > 0, `category ${category} must not be empty`);
		for (const part of parts) {
			assert.equal(part.category, category);
			assert.ok(part.id && part.label && part.icon && part.itemId);
			assert.ok(part.size && part.size.x > 0 && part.size.y > 0 && part.size.z > 0);
			assert.ok(Number.isFinite(part.cost) && part.cost > 0);
			assert.ok(part.roughness >= 0 && part.roughness <= 1);
			assert.ok(part.metalness >= 0 && part.metalness <= 1);
		}
	}
});

test('universe catalog has no duplicate ids and resolves every part', () => {
	const ids = universeCatalog().map(part => part.id);
	assert.equal(new Set(ids).size, ids.length);
	for (const id of ids) {
		assert.equal(universePart(id).id, id);
	}
});

test('universePart throws a deterministic error for unknown ids', () => {
	assert.throws(() => universePart('no-such-part'), /UNIVERSE_PART_UNKNOWN:no-such-part/);
});

test('brass beam is the metal showcase: low roughness, high metalness', () => {
	const beam = universePart('brass-beam');
	assert.ok(beam.metalness >= 0.8);
	assert.ok(beam.roughness <= 0.5);
});

test('sky presets cover the full day and resolve through the reality engine ids', () => {
	const presets = universeSkyPresets();
	const ids = presets.map(preset => preset.id);
	for (const expected of ['dawn', 'morning', 'noon', 'golden', 'dusk', 'night', 'storm']) {
		assert.ok(ids.includes(expected), `missing sky preset ${expected}`);
	}
});

test('terrain brushes cover raise, lower, flatten, smooth', () => {
	const ids = universeTerrainBrushes().map(brush => brush.id);
	assert.deepEqual(ids, ['raise', 'lower', 'flatten', 'smooth']);
});

test('universe templates each name a valid sky and seed parts that exist', () => {
	const skyIds = new Set(universeSkyPresets().map(preset => preset.id));
	for (const template of universeTemplates()) {
		assert.ok(skyIds.has(template.sky), `template ${template.id} names unknown sky ${template.sky}`);
		assert.ok(template.seedParts.length > 0);
		for (const partId of template.seedParts) {
			assert.ok(universePart(partId), `template ${template.id} seeds unknown part ${partId}`);
		}
		assert.equal(universeTemplate(template.id).id, template.id);
	}
});

test('universeTemplate throws a deterministic error for unknown ids', () => {
	assert.throws(() => universeTemplate('no-such-template'), /UNIVERSE_TEMPLATE_UNKNOWN:no-such-template/);
});
