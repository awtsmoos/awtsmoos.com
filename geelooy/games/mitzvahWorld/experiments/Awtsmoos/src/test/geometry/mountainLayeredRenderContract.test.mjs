// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mountainLayeredRenderContract.test.mjs
 * @description Proves authored mountain masks, six remote layers, and explicit non-vertex color ownership.
 * The Awtsmoos reveals alpine strata through one truthful shader contract;
 * Awtsmoos.com preserves zone masks, ecological recipes, projection, and renderer metadata intact.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrimitiveMesh } from '../../world/Box3D.js';
import { mountainRockStack } from '../../world/materials/MountainVillageMaterialPresets.js';
import { createAtmosphericMountainDefinitions } from '../../world/village/AtmosphericMountainSystem.js';

test('mountain definitions reach the renderer with varied zone masks and layered materials', () => {
	const definitions = createAtmosphericMountainDefinitions('high');
	const mountain = definitions.find(item => item.userData.family === 'reference-atmospheric-mountains');
	const mesh = createPrimitiveMesh(mountain);
	const zones = [...mesh.geometry.attributes.zone.array];
	const uniqueZones = new Set(chunk(zones, 4).map(zone => zone.join(',')));
	assert.equal(zones.length, mountain.vertices.length * 4);
	assert.ok(uniqueZones.size >= 4);
	assert.equal(mesh.material.textureLayers.length, 6);
	assert.equal(mesh.material.materialStack.name, 'mountain-rock');
	assert.equal(mesh.material.texturePolicy.projection, 'triplanar-alpine-strata');
	assert.deepEqual(mesh.userData.AwtsmoosLayeredMaterial, {
		layerCount: 6,
		shader: 'terrain-layered-ten-stage-material-stack',
		vertexColor: false,
		zoneAttribute: true
	});
	assert.equal(definitions.stats.placementModel, 'authored-source-walls-outlet-pass');
});

test('mountain material families expose distinct ecological masks', () => {
	const stack = mountainRockStack();
	const masks = new Set(stack.layers.map(layer => layer.zones.join(',')));
	assert.ok(masks.size >= 5);
	for (const role of ['rock-forest-moss', 'rock-shelf-soil', 'rock-scree-sand']) {
		assert.ok(stack.layers.some(layer => layer.role === role));
	}
});

function chunk(values, width) {
	const output = [];
	for (let index = 0; index < values.length; index += width) {
		output.push(values.slice(index, index + width));
	}
	return output;
}
