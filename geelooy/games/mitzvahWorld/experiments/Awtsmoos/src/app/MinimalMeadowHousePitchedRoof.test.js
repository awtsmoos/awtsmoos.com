// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePitchedRoof.test.js
 * @description Proves stepped roof massing becomes true pitched geometry: gable roofs
 * become triangular prisms, hip roofs become outward-wound sloped quads, flat roofs
 * pass through untouched, and non-roof definitions survive the replacement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	countSteppedRoofBoxes,
	withPitchedRoofDefinitions
} from './MinimalMeadowHousePitchedRoof.js';

function profile(overrides = {}) {
	return {
		family: 'minimal-meadow-house',
		floorThickness: 0.4,
		floors: 2,
		id: 'test-house',
		metadataIdKey: 'houseId',
		roofHeight: 4,
		roofOverhang: 1,
		roofStyle: 'gable',
		storyHeight: 3,
		depth: 12,
		width: 20,
		x: 10,
		yaw: 0,
		z: -20,
		...overrides
	};
}

const materials = { roof: { color: '#743a32', houseMaterialRole: 'roof' } };

function steppedRoofDefinitions(style) {
	return [
		{ id: 'test-house-roof-layer-1', shape: 'box', userData: { role: `weather-roof:${style}` }, position: { x: 10, y: 8, z: -20 }, size: { x: 20, y: 1, z: 12 } },
		{ id: 'test-house-roof-layer-2', shape: 'box', userData: { role: `weather-roof:${style}` }, position: { x: 10, y: 9, z: -20 }, size: { x: 16, y: 1, z: 9 } },
		{ id: 'test-house-roof-eave-front', shape: 'box', userData: { role: `roof-eave:${style}` }, position: { x: 10, y: 7, z: -13 }, size: { x: 22, y: 0.14, z: 1 } },
		{ id: 'test-house-wall-1', shape: 'box', userData: { role: 'wall' }, position: { x: 10, y: 3, z: -20 }, size: { x: 20, y: 6, z: 12 } }
	];
}

test('gable roof becomes one triangular prism with the ridge along the long axis', () => {
	const out = withPitchedRoofDefinitions(steppedRoofDefinitions('gable'), profile(), materials, 0);
	const prism = out.find(definition => definition.shape === 'triPrism');
	assert.ok(prism, 'a triPrism replaces the stepped boxes');
	assert.equal(countSteppedRoofBoxes(out), 0, 'no stepped roof boxes remain');
	// width (20) >= depth (12): ridge along X, so the prism is rotated 90 degrees
	// and its local z-extent carries the house width.
	assert.equal(prism.rotation.y, Math.PI / 2);
	assert.equal(prism.size.z, 20 + 2);
	assert.equal(prism.size.y, 4);
	// Base sits exactly at the wall top; apex reaches wall top + roof height.
	const wallTop = 0 + 0.4 + 3 * 2;
	assert.equal(prism.position.y, wallTop + 2);
	assert.equal(prism.position.x, 10);
	assert.equal(prism.position.z, -20);
});

test('hip roof becomes an outward-wound sloped manual mesh', () => {
	const out = withPitchedRoofDefinitions(
		steppedRoofDefinitions('hip'),
		profile({ roofStyle: 'hip' }),
		materials,
		0
	);
	const hip = out.find(definition => definition.shape === 'manual');
	assert.ok(hip, 'a manual hip mesh replaces the stepped boxes');
	assert.equal(hip.vertices.length, 6);
	assert.equal(hip.faces.length, 4);
	assert.equal(hip.userData.role, 'weather-roof:hip');
	assert.ok(hip.userData.pitchedRoof);
});

test('shed roof becomes a single sloped slab', () => {
	const out = withPitchedRoofDefinitions(
		steppedRoofDefinitions('shed'),
		profile({ roofStyle: 'shed' }),
		materials,
		0
	);
	const shed = out.find(definition => definition.id === 'test-house-roof-pitched-shed');
	assert.ok(shed);
	assert.equal(shed.shape, 'box');
	assert.ok(shed.rotation.x > 0, 'the slab tilts along the depth axis');
});

test('flat roofs pass through untouched', () => {
	const input = steppedRoofDefinitions('flat');
	const out = withPitchedRoofDefinitions(input, profile({ roofStyle: 'flat' }), materials, 0);
	assert.equal(out, input, 'deliberate flat roofs keep their single slab');
});

test('non-roof definitions survive replacement untouched', () => {
	const out = withPitchedRoofDefinitions(steppedRoofDefinitions('gable'), profile(), materials, 0);
	const wall = out.find(definition => definition.id === 'test-house-wall-1');
	assert.ok(wall, 'wall definition survives');
	assert.equal(wall.shape, 'box');
	const plate = out.find(definition => definition.id === 'test-house-roof-eave-plate');
	assert.ok(plate, 'a fascia eave plate is added');
});

test('pitched replacements carry the roof material and house identity', () => {
	const out = withPitchedRoofDefinitions(steppedRoofDefinitions('gable'), profile(), materials, 0);
	const prism = out.find(definition => definition.shape === 'triPrism');
	assert.equal(prism.color, '#743a32');
	assert.equal(prism.houseMaterialRole, 'roof');
	assert.equal(prism.userData.houseId, 'test-house');
	assert.equal(prism.solid, true);
	assert.equal(prism.walkable, false);
});

test('missing roof material leaves definitions unchanged', () => {
	const input = steppedRoofDefinitions('gable');
	const out = withPitchedRoofDefinitions(input, profile(), {}, 0);
	assert.equal(out, input);
});
