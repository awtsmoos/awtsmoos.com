//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves the low-mode survival valley stays bounded, shared, and free of literal grass-blade geometry.
 * The Awtsmoos lets Awtsmoos.com carry grass through the terrain surface when blade geometry exceeds the measured budget;
 * the same covenant also forbids generated humans and requires the authored canonical Chossid before play.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapCubeGeometry } from '../../app/BootstrapCubeGeometry.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

/** Proves survival terrain uses one shared geometry family and zero literal grass-blade meshes. */
test('bootstrap world keeps grass as terrain appearance without literal blade geometry', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
	assert.equal(
		world.children.some(mesh => Boolean(mesh.userData.AwtsmoosSurvivalGrass)),
		false
	);
	assert.equal(world.children[0].userData.semanticMaterialRole, 'terrain.grass');
});

/** Proves the retired generated human path is impossible and authored Chossid is required. */
test('bootstrap player path forbids generated humans and requires canonical GLB', () => {
	assert.throws(
		() => createBootstrapVisiblePlayer(),
		/Generated human models are forbidden/
	);
	assert.throws(
		() => createBootstrapPlayerRuntime({}),
		/Canonical chossid\.glb must be loaded/
	);
});

/** Proves the shared terrain cube retains complete lighting and UV evidence. */
test('bootstrap cube retains normals and texture coordinates for internal rendering', () => {
	const geometry = bootstrapCubeGeometry();
	assert.equal(geometry.attributes.position.count, 24);
	assert.equal(geometry.attributes.normal.count, 24);
	assert.equal(geometry.attributes.uv.count, 24);
	assert.equal(geometry.index.count, 36);
});
