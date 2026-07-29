// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredForestBoot.test.mjs
 * @description Proves staged playability and one terrain-to-botany enrichment chain.
 * The Awtsmoos reveals movement before habitation and the road before the leaves;
 * Awtsmoos.com verifies empty startup vessels, playable publication, and single ownership.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createDeferredForestState,
	createDeferredTextLandmarkState
} from '../../world/streaming/DeferredTerrainFeatureState.js';

const SOURCE_ROOT = new URL('../../', import.meta.url);

test('canonical deferred terrain vessels contain no startup geometry', () => {
	const forest = createDeferredForestState();
	const landmark = createDeferredTextLandmarkState();
	assert.equal(forest.group.name, 'Awtsmoos_deferred_forest_vessel');
	assert.deepEqual(forest.colliders, []);
	assert.deepEqual(forest.records, []);
	assert.equal(forest.stats.state, 'deferred');
	assert.equal(forest.stats.treeCount, 0);
	assert.equal(forest.stats.rendering.drawCalls, 0);
	assert.equal(forest.stats.rendering.triangles, 0);
	assert.equal(landmark.mesh.name, 'Awtsmoos_deferred_text_landmark_vessel');
	assert.deepEqual(landmark.colliders, []);
	assert.equal(landmark.stats.state, 'deferred');
	assert.equal(landmark.stats.triangles, 0);
});

test('essential terrain defers forest and sacred landmark generation', async () => {
	const source = await readSource('world/Terrain3D.js');
	assert.equal(source.includes('createProceduralForest'), false);
	assert.equal(source.includes('createProceduralTextLandmark'), false);
	assert.equal(source.includes('createDeferredForestState()'), true);
	assert.equal(source.includes('createDeferredTextLandmarkState()'), true);
	assert.equal(source.includes('deferredTerrainContext'), true);
});

test('bootstrap movement exists before playable publication and district streaming', async () => {
	const entry = await readSource('app/createEretzRuntime.js');
	const assembly = await readSource('app/BootstrapCoreRuntimeAssembly.js');
	const loopIndex = assembly.indexOf('startBootstrapRuntimeLoop(');
	const publishIndex = entry.indexOf('publishRuntime(core.diagnostics, environment)');
	const streamingIndex = entry.indexOf('core.diagnostics.enrichmentPromise = streamDistricts(');
	assert.ok(loopIndex >= 0, 'Bootstrap movement loop must remain present.');
	assert.ok(publishIndex >= 0, 'Playable runtime publication must remain present.');
	assert.ok(streamingIndex > publishIndex, 'District streaming must begin after playability.');
});

test('optional-world streaming is the sole botanical runtime owner', async () => {
	const post = await readSource('app/EretzPostMovementStreaming.js');
	const optional = await readSource('app/EretzOptionalWorldStreaming.js');
	const terrainIndex = optional.indexOf('startEretzTerrainStreaming(');
	const botanicalIndex = optional.indexOf('botanical = startEretzBotanicalStreaming(');
	assert.equal(post.includes('EretzBotanicalStreaming.js'), false);
	assert.equal(post.includes('startEretzBotanicalStreaming('), false);
	assert.equal(countOccurrences(post, 'startEretzOptionalWorldStreaming('), 1);
	assert.equal(countOccurrences(optional, 'botanical = startEretzBotanicalStreaming('), 1);
	assert.ok(terrainIndex >= 0, 'Terrain enrichment must be started.');
	assert.ok(botanicalIndex > terrainIndex, 'Botany must follow terrain enrichment.');
});

test('the botanical gate alone releases deferred world models', async () => {
	const source = await readSource('app/EretzPostMovementStreaming.js');
	const optionalIndex = source.indexOf('startEretzOptionalWorldStreaming(');
	const gateIndex = source.indexOf('diagnostics.botanicalStreamingGatePromise', optionalIndex);
	const modelIndex = source.indexOf('.then(() => startWorldModels(context))');
	const disabledIndex = source.indexOf("state: 'movement-disabled'");
	assert.ok(disabledIndex >= 0, 'No-loop mode must expose a resolved gate.');
	assert.ok(gateIndex > optionalIndex, 'The gate must come from optional-world streaming.');
	assert.ok(modelIndex > gateIndex, 'Models must wait for the botanical gate.');
});

function countOccurrences(source, needle) {
	return source.split(needle).length - 1;
}

async function readSource(relativePath) {
	return readFile(new URL(relativePath, SOURCE_ROOT), 'utf8');
}
