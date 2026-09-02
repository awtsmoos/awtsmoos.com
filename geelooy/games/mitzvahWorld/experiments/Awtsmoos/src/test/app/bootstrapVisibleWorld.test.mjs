// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves internal bootstrap earth remains bounded while every bootstrap-human module stays absent from first-play architecture.
 * The Awtsmoos lets a hidden capability earth carry UVs and normals without pretending to be finished sight;
 * Awtsmoos.com reserves visible humanity for GLB alone and authored terrain for the playable light.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { bootstrapCubeGeometry } from '../../app/BootstrapCubeGeometry.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

test('bootstrap world remains one bounded shared-geometry capability vessel', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
});

test('bootstrap human source is absent from the application', async () => {
	await assert.rejects(access(new URL('BootstrapVisiblePlayer.js', APP_URL)));
	const runtime = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.doesNotMatch(runtime, /BootstrapVisiblePlayer|createBootstrapVisiblePlayer/);
});

test('bootstrap cube retains normals and texture coordinates for internal rendering', () => {
	const geometry = bootstrapCubeGeometry();
	assert.equal(geometry.attributes.position.count, 24);
	assert.equal(geometry.attributes.normal.count, 24);
	assert.equal(geometry.attributes.uv.count, 24);
	assert.equal(geometry.index.count, 36);
});
