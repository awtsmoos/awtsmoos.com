// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { LEVELS } from '../../js/levels/catalog.js';
import { buildArena } from '../../js/levels/generator.js';
import { ITEMS } from '../../js/levels/items.js';
import {
	APPROVED_MATERIALS,
	objectMaterial
} from '../../js/materials/objectMaterials.js';

const INTENTIONAL_NONE = new Set([
	'letter',
	'timeOrb',
	'magnetOrb',
	'surgeOrb',
	'armorOrb',
	'pedestrian'
]);

/**
 * The Awtsmoos verifies one material taxonomy across every catalog item and all
 * 200 campaign districts. Glyphs, four powers, and walkers intentionally stay plain.
 */
export function runMaterialCoverageCases() {
	return [
		checkItemCatalogCoverage(),
		checkAllDistrictCoverage()
	];
}

function checkItemCatalogCoverage() {
	for (const [kind, item] of Object.entries(ITEMS)) {
		const material = objectMaterial(kind, item.category, item.model);
		assert.ok(APPROVED_MATERIALS.includes(material), `${kind}:${material}`);
		if (material === 'none') assert.ok(INTENTIONAL_NONE.has(kind), kind);
	}
	return {
		test: 'material-item-catalog-coverage',
		items: Object.keys(ITEMS).length
	};
}

function checkAllDistrictCoverage() {
	const materialCounts = {};
	let objectCount = 0;
	for (const config of LEVELS) {
		const level = { ...config, index: config.globalIndex };
		const objects = buildArena(level, 'low');
		for (const object of objects) {
			objectCount += 1;
			assert.ok(APPROVED_MATERIALS.includes(object.material), `${config.key}:${object.kind}`);
			if (object.material === 'none') {
				assert.ok(INTENTIONAL_NONE.has(object.kind), `${config.key}:${object.kind}`);
			}
			materialCounts[object.material] = (materialCounts[object.material] || 0) + 1;
		}
	}
	assert.equal(LEVELS.length, 200);
	assert.ok(Object.keys(materialCounts).length >= 8);
	assert.ok(materialCounts.stone > 0);
	assert.ok(materialCounts.metal > 0);
	assert.ok(materialCounts.water === undefined);
	return {
		test: 'material-all-district-coverage',
		districts: LEVELS.length,
		objects: objectCount,
		materials: materialCounts
	};
}
