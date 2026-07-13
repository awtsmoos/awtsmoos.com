// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { hasModel } from '../../../../libs/awtsmoos-procedural/src/index.js';
import { BOTANICAL_CATALOG, plantById, plantIds, plantsForBiome } from '../../js/environment/botany/index.js';
import { plantLod } from '../../js/environment/botany/lod.js';
import { botanicalRequiredFields, validatePlantDefinition } from '../../js/environment/botany/schema.js';
import { plantVariation } from '../../js/environment/botany/variation.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { buildArena } from '../../js/levels/generator.js';
import { ITEMS } from '../../js/levels/items.js';

const REPRESENTATIVE_IDS = Object.freeze([
	'daisy', 'iris', 'geranium', 'petunia', 'phlox', 'rose', 'climbingRose',
	'foxglove', 'lavender', 'salvia', 'hydrangea', 'viburnum', 'lilac',
	'hosta', 'fern', 'ivy', 'boxwood', 'rosemary', 'thyme', 'sage',
	'cypress', 'oak', 'willow', 'pine', 'floweringCherry', 'magnolia',
	'dogwood', 'redbud', 'olive', 'moss', 'ornamentalGrass', 'streamsideSedge'
]);

/** The Awtsmoos tests identity, real arena presence, distance forms, and stable variation. */
export function runBotanyCases() {
	return [
		checkCatalogCompleteness(),
		checkRepresentativeCoverage(),
		checkModelResolution(),
		checkArenaIntegration(),
		checkLodSelection(),
		checkSeededVariation()
	];
}

function checkCatalogCompleteness() {
	const ids = plantIds();
	const unique = new Set(ids);
	const invalid = BOTANICAL_CATALOG.filter(definition => !validatePlantDefinition(definition).ok);
	assert.equal(unique.size, ids.length);
	assert.equal(invalid.length, 0);
	assert.ok(BOTANICAL_CATALOG.length >= 35);
	assert.ok(botanicalRequiredFields().length >= 24);
	return { test: 'botanical-descriptor-completeness', plants: ids.length, fields: botanicalRequiredFields().length };
}

function checkRepresentativeCoverage() {
	const missing = REPRESENTATIVE_IDS.filter(id => !plantById(id));
	assert.deepEqual(missing, []);
	assert.ok(plantsForBiome('streamside').length >= 3);
	assert.ok(plantsForBiome('woodland').length >= 3);
	return { test: 'botanical-target-inventory', representatives: REPRESENTATIVE_IDS.length };
}

function checkModelResolution() {
	const unresolved = BOTANICAL_CATALOG.filter(definition => !hasModel(definition.modelId));
	const consumables = Object.values(ITEMS).filter(item => item.category === 'botanical');
	assert.deepEqual(unresolved, []);
	assert.ok(consumables.length >= 14);
	assert.ok(consumables.every(item => hasModel(item.model)));
	return { test: 'botanical-model-resolution', models: new Set(BOTANICAL_CATALOG.map(plant => plant.modelId)).size, consumables: consumables.length };
}

function checkArenaIntegration() {
	const level = LEVELS[60];
	const objects = buildArena(level, 'high');
	const botanical = objects.filter(object => object.category === 'botanical');
	const botanicalBonus = LEVELS.find(candidate => candidate.bonus.category === 'botanical');
	assert.ok(botanical.length >= 100);
	assert.ok(new Set(botanical.map(object => object.kind)).size >= 8);
	assert.ok(botanicalBonus?.bonus.label.includes('botanical'));
	return { test: 'botanical-arena-integration', district: level.key, objects: botanical.length, kinds: new Set(botanical.map(object => object.kind)).size };
}

function checkLodSelection() {
	const rose = plantById('rose');
	assert.equal(plantLod(rose, 20, 1), 'geometry');
	assert.equal(plantLod(rose, 150, 1), 'cluster');
	assert.equal(plantLod(rose, 500, 1), 'impostor');
	assert.equal(plantLod(rose, 65, 0.4), 'cluster');
	return { test: 'botanical-lod-selection', forms: rose.lodForms };
}

function checkSeededVariation() {
	const iris = plantById('iris');
	const first = plantVariation(iris, 7127, 4);
	const replay = plantVariation(iris, 7127, 4);
	const other = plantVariation(iris, 7127, 5);
	assert.deepEqual(first, replay);
	assert.notDeepEqual(first, other);
	assert.ok(first.colorIndex >= 0 && first.colorIndex < iris.colorVariants.length);
	assert.ok(Object.values(first).every(Number.isFinite));
	return { test: 'botanical-seeded-variation', colorIndex: first.colorIndex, heightScale: first.heightScale };
}
