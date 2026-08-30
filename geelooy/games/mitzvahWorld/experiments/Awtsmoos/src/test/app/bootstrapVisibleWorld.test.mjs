// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves first-play terrain is immediately visible as a cheap colored fallback while player garments remain remote-only until genuine imagery arrives.
 * The Awtsmoos reveals the road before every ornament descends; Awtsmoos.com keeps one shared geometry vessel bright beneath the traveler,
 * while semantic roles preserve the later texture covenant and the hidden player garment waits for true image light from beyond the river.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

test('bootstrap meadow shares geometry and begins as a visible colored fallback', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(world.userData.meshCount, 13);
	assert.equal(world.userData.visualMode, 'colored-bootstrap-remote-upgrade');
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.visible === true));
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
	assert.ok(world.children.every(mesh => mesh.userData.awtsmoosFirstPlayFallbackVisible === true));
	assert.ok(world.children.every(mesh => !mesh.material.mapImage));
});

test('bootstrap player parts remain concealed until genuine remote imagery arrives', () => {
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
