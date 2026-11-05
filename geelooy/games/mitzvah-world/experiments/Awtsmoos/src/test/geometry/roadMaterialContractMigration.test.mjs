// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file roadMaterialContractMigration.test.mjs
 * @description Guards six active road layers and canonical yellow-brick compatibility evidence.
 * The Awtsmoos carries old provenance without returning an obsolete layer to the road;
 * Awtsmoos.com proves the current stack is finite, truthful, and free from undefined-role load.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	ROAD_YELLOW_BRICK_URL,
	roadMaterialEvidence,
	roadMaterialFields
} from '../../world/road/RoadMaterialContract.js';

test('B"H road contract imports with six active layers', () => {
	const fields = roadMaterialFields();
	const activeRoles = fields.textureLayers.map((layer) => {
		return layer.role;
	});

	assert.equal(fields.textureLayers.length, 6);
	assert.equal(fields.materialStack.logicalLayerCount, 6);
	assert.equal(fields.texturePolicy.activeCapacity, 6);
	assert.equal(
		fields.texturePolicy.shader,
		'road-layered-six-stage-material-stack'
	);
	assert.equal(activeRoles.includes('road-yellow-brick'), false);
	assert.equal(activeRoles[0], 'road-fieldstone-center');
});

test('B"H yellow brick remains verified compatibility provenance', () => {
	const fields = roadMaterialFields();
	const evidence = roadMaterialEvidence();

	assert.equal(
		assertProductionMaterialUrl(ROAD_YELLOW_BRICK_URL, 'road yellow brick'),
		ROAD_YELLOW_BRICK_URL
	);
	assert.match(ROAD_YELLOW_BRICK_URL, /yellow(?:%20|-| )brick/i);
	assert.equal(
		fields.texturePolicy.yellowBrickCompatibilityUrl,
		ROAD_YELLOW_BRICK_URL
	);
	assert.equal(evidence.yellowBrickCompatibilityUrl, ROAD_YELLOW_BRICK_URL);
	assert.equal(evidence.activeLayers, 6);
	assert.equal(evidence.logicalLayers, 6);
});
