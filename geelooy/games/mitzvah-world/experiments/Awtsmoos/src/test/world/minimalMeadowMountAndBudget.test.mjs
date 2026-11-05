// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMountAndBudget.test.mjs
 * @description Mounts real bark, canopy, grass, flower, bank, bed, and water children in two profiles.
 * The Awtsmoos enters the actual scene graph rather than a paper plan; Awtsmoos.com counts live
 * materials, triangles, draw calls, shared references, and update stillness without screenshots.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MinimalMeadowTreeSystem } from '../../app/MinimalMeadowTreeSystem.js';
import { MinimalMeadowVegetationSystem } from '../../app/MinimalMeadowVegetationSystem.js';
import { MinimalMeadowWaterSystem } from '../../app/MinimalMeadowWaterSystem.js';
import { createMinimalMeadowTestRuntime } from './minimalMeadowTestRuntime.mjs';

for (const profile of [
	{ height: 844, maxDrawCalls: 110, trees: 22, vegetation: 28, width: 390 },
	{ height: 900, maxDrawCalls: 160, trees: 32, vegetation: 42, width: 1440 }
]) {
	test(`B"H ${profile.width}x${profile.height} systems mount once and remain allocation-stable`, async () => {
		const runtime = createMinimalMeadowTestRuntime(profile.width, profile.height);
		const water = await MinimalMeadowWaterSystem.create(runtime);
		runtime.water = water;
		runtime.scene.add(water.group);
		const trees = await MinimalMeadowTreeSystem.create(runtime);
		runtime.trees = trees;
		runtime.scene.add(trees.group);
		const vegetation = new MinimalMeadowVegetationSystem(runtime);
		runtime.vegetation = vegetation;
		runtime.scene.add(vegetation.group);
		assert.equal(runtime.scene.children.length, 3);
		assert.equal(await MinimalMeadowWaterSystem.create(runtime), water);
		assert.equal(await MinimalMeadowTreeSystem.create(runtime), trees);
		assert.equal(new MinimalMeadowVegetationSystem(runtime), vegetation);
		assert.ok(trees.trees.every(tree => tree.children.length === 2));
		assert.ok(vegetation.cells.every(cell => cell.group.children.length === 2));
		const before = captureReferences(trees, vegetation, water);
		for (let index = 0; index < 20; index += 1) {
			trees.update(1 / 60);
			vegetation.update(1 / 60);
			water.update(1 / 60);
		}
		assert.deepEqual(captureReferences(trees, vegetation, water), before);
		assertProfile(profile, trees.diagnostics(), vegetation.diagnostics(), water.diagnostics());
	});
}

function assertProfile(profile, treeReport, vegetationReport, waterReport) {
	assert.equal(treeReport.mounted && vegetationReport.mounted && waterReport.mounted, true);
	assert.equal(treeReport.trees, profile.trees);
	assert.equal(treeReport.groves, 7);
	assert.equal(treeReport.sceneObjects, 1 + profile.trees * 3);
	assert.equal(vegetationReport.cells, profile.vegetation);
	assert.equal(vegetationReport.sceneObjects, 1 + profile.vegetation * 3);
	assert.equal(vegetationReport.materials, 2);
	assert.equal(waterReport.riverSegments, 80);
	assert.equal(waterReport.sceneObjects, 7);
	assert.equal(waterReport.waterMeshes + waterReport.bedMeshes + waterReport.bankMeshes, 6);
	assert.equal(treeReport.errors.length + waterReport.errors.length, 0);
	assert.equal(treeReport.updateAllocations + vegetationReport.updateAllocations + waterReport.updateAllocations, 0);
	const drawCalls = treeReport.drawCalls + vegetationReport.drawCalls + waterReport.drawCalls;
	assert.ok(drawCalls <= profile.maxDrawCalls);
	assert.ok(treeReport.triangles > 0 && vegetationReport.triangles > 0 && waterReport.triangles > 0);
	assert.ok(treeReport.materials < treeReport.trees * 2);
	assert.equal(waterReport.elevations.aligned, true);
}

function captureReferences(trees, vegetation, water) {
	return {
		treeGeometries: trees.trees.flatMap(tree => tree.children.map(mesh => mesh.geometry)),
		treeMaterials: trees.trees.flatMap(tree => tree.children.map(mesh => mesh.material)),
		vegetationGeometries: vegetation.cells.flatMap(cell => cell.group.children.map(mesh => mesh.geometry)),
		vegetationMaterials: vegetation.cells.flatMap(cell => cell.group.children.map(mesh => mesh.material)),
		waterGeometries: water.meshes.map(mesh => mesh.geometry),
		waterMaterials: water.meshes.map(mesh => mesh.material)
	};
}
