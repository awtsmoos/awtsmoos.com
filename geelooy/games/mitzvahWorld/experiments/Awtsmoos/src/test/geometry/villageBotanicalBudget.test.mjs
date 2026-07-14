// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalBudget.test.mjs
 * @description Proves the richer reference garden remains six bounded draws.
 * Repetition reveals visual abundance while disciplined vessels honor Awtsmoos.
 */
import assert from 'node:assert/strict';
import { listBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { villageBotanicalQuality } from '../../world/botany/VillageBotanicalQuality.js';
import {
	botanicalBatchStats,
	createVillageBotanicalBatchDefinitions
} from '../../world/village/VillageBotanicalBatchGeometry.js';

const report = {};

for (const quality of ['low', 'medium', 'high', 'cinematic']) {
	const definitions = createVillageBotanicalBatchDefinitions(groundHeight, quality);
	const stats = botanicalBatchStats(definitions);
	const policy = villageBotanicalQuality(quality);
	assert.ok(definitions.length <= 6, `${quality} should remain at most six material draws`);
	assert.ok(definitions.stats.placements <= policy.maxPlacements);
	assert.ok(stats.triangles <= policy.maxTriangles, `${quality} exceeded its botanical triangle budget`);
	assert.equal(new Set(definitions.map((definition) => definition.id)).size, definitions.length);
	assert.equal(definitions.stats.composition.placements, definitions.stats.placements);
	for (const definition of definitions) assertDefinition(definition);
	report[quality] = definitions.stats;
}

assert.equal(report.high.catalogSpecies, listBotanicalSpecies().length);
assert.equal(report.cinematic.catalogSpecies, listBotanicalSpecies().length);
assert.ok(report.high.composition.repeatedPlacements >= 20);
assert.ok(report.low.placements < report.medium.placements);
assert.ok(report.medium.placements < report.high.placements);
assert.ok(report.high.triangles < report.cinematic.triangles);

console.log(JSON.stringify({ ok: true, report }, null, 2));

function assertDefinition(definition) {
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.solid, false);
	assert.equal(definition.userData.staticBatch, true);
	assert.equal(definition.userData.family, 'village-botanical-garden');
	assert.ok(definition.textureUrl.startsWith('https://awtsmoos-docs-base.web.app/'));
	for (const point of definition.vertices) {
		assert.equal(point.length, 3);
		assert.ok(point.every(Number.isFinite));
	}
	for (const face of definition.faces) {
		assert.equal(face.length, 3);
		assert.ok(face.every((index) => Number.isInteger(index)
			&& index >= 0
			&& index < definition.vertices.length));
	}
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
