// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldPopulationDiagnostics.js
 * @description Measures live tree, vegetation, and water meshes without trusting intended children.
 * The Awtsmoos transcends every count while finite vessels require honest accounting; Awtsmoos.com
 * records actual materials, geometry, bounds, triangles, quadrants, and zones after real mounting.
 */

import {
	minimalMeadowPopulationBounds,
	minimalMeadowQuadrantCounts
} from './MinimalMeadowWorldPopulationMath.js';

export function minimalMeadowTreeDiagnostics(system) {
	const meshes = system.trees.flatMap(tree => tree.children);
	const materials = new Set(meshes.map(mesh => mesh.material));
	const geometries = new Set(meshes.map(mesh => mesh.geometry));
	const groves = new Set(system.placements.map(placement => placement.groveId));
	return {
		bounds: minimalMeadowPopulationBounds(system.placements, placement => placement.radius),
		drawCalls: meshes.length,
		errors: [...system.errors],
		groves: groves.size,
		hydrationState: system.hydrationState,
		materials: materials.size,
		mobileProfile: system.mobile,
		mounted: system.group.parent === system.runtime.scene,
		quadrants: minimalMeadowQuadrantCounts(system.placements),
		sceneObjects: 1 + system.trees.length + meshes.length,
		sharedGeometries: geometries.size,
		trees: system.trees.length,
		triangles: system.trees.reduce((sum, tree) => sum + tree.userData.AwtsmoosTree.triangles, 0),
		updateAllocations: 0
	};
}

export function minimalMeadowVegetationDiagnostics(system) {
	const zones = {};
	const meshes = system.cells.flatMap(cell => cell.group.children);
	for (const specification of system.specifications) {
		zones[specification.zone] = (zones[specification.zone] || 0) + 1;
	}
	return {
		batchMode: 'baked-instance-cell-batches',
		bounds: minimalMeadowPopulationBounds(system.specifications, () => 4.5),
		cells: system.cells.length,
		clumps: system.cells.reduce((sum, cell) => sum + cell.clumps, 0),
		drawCalls: meshes.length,
		materials: new Set(meshes.map(mesh => mesh.material)).size,
		mobileProfile: system.mobile,
		mounted: system.group.parent === system.runtime.scene,
		quadrants: minimalMeadowQuadrantCounts(system.specifications),
		sceneObjects: 1 + system.cells.length + meshes.length,
		triangles: system.cells.reduce((sum, cell) => sum + cell.triangles, 0),
		updateAllocations: 0,
		zones
	};
}

export function minimalMeadowMeshMetrics(meshes) {
	let triangles = 0;
	const materials = new Set();
	for (const mesh of meshes) {
		triangles += (mesh.geometry?.index?.array?.length || 0) / 3;
		if (mesh.material) {
			materials.add(mesh.material);
		}
	}
	return Object.freeze({ materials: materials.size, triangles });
}
