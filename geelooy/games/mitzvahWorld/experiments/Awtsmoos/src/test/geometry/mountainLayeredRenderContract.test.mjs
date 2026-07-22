// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals mountain strata only when authored masks and layered recipes survive
 * the entire path from canonical definition to the Tiny runtime mesh submitted for drawing.
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
	assert.equal(mesh.material.texturePolicy.shader, 'terrain-layered-ten-stage-material-stack');
	assert.deepEqual(mesh.userData.AwtsmoosLayeredMaterial, {
		layerCount: 6,
		shader: 'terrain-layered-ten-stage-material-stack',
		zoneAttribute: true
	});
	assert.equal(definitions.stats.placementModel, 'authored-source-walls-outlet-pass');
});

test('mountain material families expose distinct ecological masks', () => {
	const stack = mountainRockStack();
	const masks = new Set(stack.layers.map(layer => layer.zones.join(',')));
	assert.ok(masks.size >= 5);
	assert.ok(stack.layers.some(layer => layer.role === 'rock-forest-moss'));
	assert.ok(stack.layers.some(layer => layer.role === 'rock-shelf-soil'));
	assert.ok(stack.layers.some(layer => layer.role === 'rock-scree-sand'));
});

function chunk(values, width) {
	const output = [];
	for (let index = 0; index < values.length; index += width) {
		output.push(values.slice(index, index + width));
	}
	return output;
}
