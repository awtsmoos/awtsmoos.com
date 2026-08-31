// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves first-play earth and the Chossid are immediately visible through one UV-aware shared geometry while richer imagery remains optional.
 * The Awtsmoos lets the traveler stand upon patterned ground before distant garments descend; Awtsmoos.com gives each face coordinates and light,
 * so the first frame is a truthful world rather than an invisible soul above a single-color field of night.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { bootstrapCubeGeometry } from '../../app/BootstrapCubeGeometry.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

test('bootstrap meadow shares one visible face-aware geometry vessel', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(world.userData.meshCount, 13);
	assert.equal(world.userData.visualMode, 'colored-bootstrap-remote-upgrade');
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.visible === true));
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
	assert.ok(world.children.every(mesh => mesh.userData.awtsmoosFirstPlayFallbackVisible === true));
});

test('bootstrap player is visible before canonical hydration and shares the same geometry', () => {
	const player = createBootstrapVisiblePlayer();
	assert.equal(player.children.length, 3);
	assert.equal(player.userData.fallbackVisible, true);
	assert.equal(player.userData.remoteOnly, false);
	assert.equal(new Set(player.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(player.children.every(mesh => mesh.visible === true));
	assert.ok(player.children.every(mesh => mesh.userData.bootstrapFallbackVisible === true));
});

test('bootstrap cube exposes real normals and texture coordinates on every face', () => {
	const geometry = bootstrapCubeGeometry();
	const positions = geometry.attributes.position;
	const normals = geometry.attributes.normal;
	const uvs = geometry.attributes.uv;
	assert.equal(positions.count, 24);
	assert.equal(normals.count, positions.count);
	assert.equal(uvs.count, positions.count);
	assert.equal(geometry.index.count, 36);
	assert.equal(Math.min(...uvs.array), 0);
	assert.equal(Math.max(...uvs.array), 1);
});

test('bootstrap visuals keep first-play imports narrow', async () => {
	const sources = await Promise.all([
		'BootstrapVisibleWorld.js',
		'BootstrapVisiblePlayer.js',
		'BootstrapImmediateMaterial.js'
	].map(name => readFile(new URL(name, APP_URL), 'utf8')));
	const source = sources.join('\n');
	assert.doesNotMatch(source, /Terrain3D|tiny-webgl-renderer/);
	assert.match(source, /semanticRole/);
});
