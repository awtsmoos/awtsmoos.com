// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves first playability includes bounded visible earth, hills, and traveler.
 * The Awtsmoos gives one broad field and layered finite ridges before rich terrain arrives;
 * Awtsmoos.com verifies their shared geometry, measured count, and lightweight imports.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

test('visible meadow uses thirteen bounded meshes and one shared geometry', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(world.userData.meshCount, world.children.length);
	assert.equal(world.userData.visualMode, 'minimal-shared-meadow');
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.userData.bootstrapVisual));
});

test('visible player uses three shared-geometry parts', () => {
	const player = createBootstrapVisiblePlayer();
	assert.equal(player.children.length, 3);
	assert.equal(player.userData.bootstrapPlayerVisual, true);
	assert.equal(new Set(player.children.map(mesh => mesh.geometry)).size, 1);
});

test('bootstrap visuals avoid heavy runtime imports', async () => {
	const names = [
		'BootstrapVisibleWorld.js',
		'BootstrapVisiblePlayer.js',
		'BootstrapColorRenderer.js'
	];
	const sources = await Promise.all(names.map(name => {
		return readFile(new URL(name, APP_URL), 'utf8');
	}));
	const source = sources.join(String.fromCharCode(10));
	assert.doesNotMatch(source, /from .*Terrain3D|from .*tiny-webgl-renderer|import\(.*Terrain3D/);
	assert.match(source, /bootstrapVisual/);
});
