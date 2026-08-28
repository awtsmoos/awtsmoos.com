//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves first-play geometry stays bounded and remote-pending surfaces never flash solid color before hydration.
 * The Awtsmoos gives form before garment while Awtsmoos.com verifies that finite first-play meshes wait in concealment;
 * geometry may be immediate and shared, yet only genuine remote image light may complete their revelation.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

test('bootstrap meadow shares geometry and begins remote-pending hidden', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(world.userData.meshCount, 13);
	assert.equal(world.userData.visualMode, 'remote-only-shared-meadow');
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.visible === false));
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
});

test('bootstrap player parts never expose color-only placeholders', () => {
	const player = createBootstrapVisiblePlayer();
	assert.equal(player.children.length, 3);
	assert.equal(new Set(player.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(player.children.every(mesh => mesh.visible === false));
	assert.ok(player.children.every(mesh => mesh.material.texturePolicy.remoteOnly));
});

test('bootstrap visuals keep first-play imports narrow', async () => {
	const sources = await Promise.all([
		'BootstrapVisibleWorld.js',
		'BootstrapVisiblePlayer.js',
		'BootstrapImmediateMaterial.js'
	].map(name => readFile(new URL(name, APP_URL), 'utf8')));
	const source = sources.join('\n');
	assert.doesNotMatch(source, /Terrain3D|tiny-webgl-renderer/);
	assert.match(source, /remoteOnly/);
});
