// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalBudget.test.mjs
 * @description Proves complete botanical coverage remains six bounded draws,
 * letting the village receive abundance without concealing the Awtsmoos in waste.
 */
import assert from 'node:assert/strict';
import { listBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	botanicalBatchStats,
	createVillageBotanicalBatchDefinitions
} from '../../world/village/VillageBotanicalBatchGeometry.js';

const budgets = {
	low: { placements: 50, triangles: 2000 },
	medium: { placements: 70, triangles: 3200 },
	high: { placements: 120, triangles: 7000 },
	cinematic: { placements: 120, triangles: 8500 }
};
const report = {};

for (const [quality, budget] of Object.entries(budgets)) {
	const definitions = createVillageBotanicalBatchDefinitions(groundHeight, quality);
	const stats = botanicalBatchStats(definitions);
	assert.ok(definitions.length <= 6, `${quality} should remain at most six material draws`);
	assert.ok(definitions.stats.placements <= budget.placements);
	assert.ok(stats.triangles <= budget.triangles, `${quality} exceeded its botanical triangle budget`);
	assert.equal(new Set(definitions.map((definition) => definition.id)).size, definitions.length);
	for (const definition of definitions) {
		assert.equal(definition.shape, 'manual');
		assert.equal(definition.solid, false);
		assert.equal(definition.userData.staticBatch, true);
		assert.equal(definition.userData.family, 'village-botanical-garden');
		assert.ok(definition.textureUrl.startsWith('https://awtsmoos-docs-base.web.app/'));
		assertGeometry(definition);
	}
	report[quality] = definitions.stats;
}

assert.equal(report.high.catalogSpecies, listBotanicalSpecies().length);
assert.equal(report.cinematic.catalogSpecies, listBotanicalSpecies().length);
assert.ok(report.low.catalogSpecies < report.high.catalogSpecies);
assert.ok(report.low.triangles < report.medium.triangles);
assert.ok(report.medium.triangles < report.high.triangles);

console.log(JSON.stringify({ ok: true, report }, null, 2));

function assertGeometry(definition) {
	for (const point of definition.vertices) {
		assert.equal(point.length, 3);
		assert.ok(point.every(Number.isFinite));
	}
	for (const face of definition.faces) {
		assert.equal(face.length, 3);
		assert.ok(face.every((index) => (
			Number.isInteger(index)
			&& index >= 0
			&& index < definition.vertices.length
		)));
	}
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
