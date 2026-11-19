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
import { bootstrapFrustumGeometry } from '../../app/BootstrapFrustumGeometry.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

/** Proves survival terrain uses shared geometry families and zero literal grass-blade meshes. */
test('bootstrap world keeps grass as terrain appearance without literal blade geometry', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	// B"H round 2: the grass field keeps the shared cube; the hills are tapered
	// frustums, not flat boxes. Still exactly two shared geometries, every mesh
	// on one of them, so the valley stays bounded and shared.
	const geometries = new Set(world.children.map(mesh => mesh.geometry));
	assert.equal(geometries.size, 2);
	assert.ok(geometries.has(bootstrapCubeGeometry()));
	assert.ok(geometries.has(bootstrapFrustumGeometry()));
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

/** Proves the shared hill frustum is a tapered five-face mound, not a box. */
test('bootstrap frustum tapers toward its crown for internal rendering', () => {
	const geometry = bootstrapFrustumGeometry();
	assert.equal(geometry.attributes.position.count, 20);
	assert.equal(geometry.attributes.normal.count, 20);
	assert.equal(geometry.attributes.uv.count, 20);
	assert.equal(geometry.index.count, 30);
	const positions = geometry.attributes.position.array;
	const spanAt = (y) => {
		let min = Infinity;
		let max = -Infinity;
		for (let i = 0; i < positions.length; i += 3) {
			if (positions[i + 1] !== y) continue;
			min = Math.min(min, positions[i], positions[i + 2]);
			max = Math.max(max, positions[i], positions[i + 2]);
		}
		return max - min;
	};
	assert.ok(spanAt(0.5) < spanAt(-0.5), 'crown is narrower than the base');
});
