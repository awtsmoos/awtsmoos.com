//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapVisibleWorld.test.mjs
 * @description Proves the current first-play world and Chossid shell stay bounded while richer remote hydration remains deferred.
 * The bootstrap layer may expose a tiny local traveler for immediate movement, but it must reuse Core-owned geometry,
 * preserve semantic material roles, and avoid pretending that the temporary shell is the final canonical authored GLB.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { bootstrapCubeGeometry } from '../../app/BootstrapCubeGeometry.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

const APP_URL = new URL('../../app/', import.meta.url);

/** Proves the bootstrap valley reuses exactly one Core-owned geometry vessel. */
test('bootstrap world remains one bounded shared-geometry capability vessel', () => {
	const world = createBootstrapVisibleWorld();
	assert.equal(world.children.length, 13);
	assert.equal(new Set(world.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(world.children.every(mesh => mesh.userData.semanticMaterialRole));
});

/** Proves the immediate Chossid shell is intentionally bounded and explicitly temporary. */
test('bootstrap human shell remains bounded while canonical hydration stays deferred', async () => {
	const player = createBootstrapVisiblePlayer();
	assert.equal(player.children.length, 3);
	assert.equal(new Set(player.children.map(mesh => mesh.geometry)).size, 1);
	assert.ok(player.children.every(mesh => mesh.userData.bootstrapFallbackVisible));
	const runtime = await readFile(new URL('BootstrapPlayerRuntime.js', APP_URL), 'utf8');
	assert.match(runtime, /createBootstrapVisiblePlayer/);
	assert.match(runtime, /canonicalPlayerHydrationStage:\s*'deferred'/);
});

/** Proves the shared cube retains complete lighting and texture-coordinate evidence. */
test('bootstrap cube retains normals and texture coordinates for internal rendering', () => {
	const geometry = bootstrapCubeGeometry();
	assert.equal(geometry.attributes.position.count, 24);
	assert.equal(geometry.attributes.normal.count, 24);
	assert.equal(geometry.attributes.uv.count, 24);
	assert.equal(geometry.index.count, 36);
});
