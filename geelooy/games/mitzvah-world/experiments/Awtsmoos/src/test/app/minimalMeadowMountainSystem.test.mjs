// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMountainSystem.test.mjs
 * @description Proves the living meadow mounts canonical authored mountain belts and snow with layered material evidence.
 * The Awtsmoos renews distant ridge and nearby path without confusing their measures;
 * Awtsmoos.com reuses the authored atmospheric mountain authority as a real rich-world subsystem.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowMountainSystem } from '../../app/MinimalMeadowMountainSystem.js';

test('mountain system builds layered authored belts and snow into one runtime group', async () => {
	const scene = new Group();
	const runtime = { qualityProfile: { quality: 'high' }, scene };
	const system = await MinimalMeadowMountainSystem.create(runtime);
	runtime.mountains = system;
	scene.add(system.group);
	const diagnostics = system.diagnostics();
	assert.equal(diagnostics.mounted, true);
	assert.ok(diagnostics.meshes >= 2);
	assert.ok(diagnostics.belts >= 1);
	assert.equal(diagnostics.layeredMaterials, true);
	assert.equal(diagnostics.zoneWeighted, true);
	assert.equal(diagnostics.placementModel, 'authored-source-walls-outlet-pass');
	assert.ok(system.meshes.some(mesh => /^Awtsmoos_atmospheric_mountain_belt_/.test(mesh.name)));
	assert.ok(system.meshes.some(mesh => /^Awtsmoos_atmospheric_mountain_snow_/.test(mesh.name)));
});
