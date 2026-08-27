// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestInvariantVessels.js
 * @description Holds test-only vessels for one forest renderer and measured trunk collision.
 * The Etz Chaim remains singular; these kelim observe its branches without growing a rival tree,
 * gathering mesh, material, placement, and Gevurah proofs in one transparent decree.
 */

import assert from 'node:assert/strict';

import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { v } from '../../math/Geometry3D.js';
import { createGroundSampler } from '../../world/GroundPlacementSystem.js';
import { terrainHeightAt } from '../../world/TerrainGeometry.js';
import { createProceduralForest } from '../../world/trees/ProceduralForestSystem.js';

/** Creates the deterministic forest fixture shared by invariant stories. */
export function createOlamHaForest() {
	const groundSampler = createGroundSampler({ terrainHeightAt });
	return createProceduralForest({
		groundSampler,
		halfSize: 250,
		obstacleTriangles: fixtureTriangles('house', 35, 55),
		roadTriangles: fixtureTriangles('road', -12, 12, -180, 180)
	});
}

/** Returns unique semantic material families in their generated order. */
export function materialFamilies(records, layer, includeEmpty) {
	const values = records
		.filter(record => includeEmpty || record.tree[layer].indices.length > 0)
		.map(record => record.tree[layer].material?.type)
		.filter(Boolean);
	return [...new Set(values)];
}

/** Collects every merged geometry vessel from the forest group. */
export function collectMeshes(group) {
	const meshes = [];
	group.traverse(object => {
		if (object.geometry?.attributes?.position) meshes.push(object);
	});
	return meshes;
}

/** Captures the deterministic placement signature without geometry noise. */
export function placementSignature(forest) {
	return forest.records.map(record => [
		record.x,
		record.y,
		record.z,
		record.rotationY,
		record.policy.name
	]);
}

/** Proves visible-trunk collision is measured, reduced, and free of proxy shapes. */
export function assertGevurotHaCollision(forest) {
	const gevurot = forest.stats.collision;
	const measuredTriangles = gevurot.perTree.reduce((sum, item) => {
		return sum + item.triangles;
	}, 0);
	assert.equal(forest.colliders.length, gevurot.triangles);
	assert.equal(gevurot.perTree.length, forest.stats.treeCount);
	assert.equal(measuredTriangles, forest.colliders.length);
	assert.equal(gevurot.canopyColliders, 0);
	assert.equal(gevurot.proxyShapes, 0);
	assert.ok(gevurot.candidateTriangles >= gevurot.triangles);
	assert.ok(gevurot.maximumTrianglesPerTree > 0);
	assert.ok(gevurot.reductionRatio > 0 && gevurot.reductionRatio <= 1);
	for (const item of gevurot.perTree) assertMeasuredTree(item);
}

/** Proves every merged mesh position remains finite. */
export function assertFiniteMesh(mesh) {
	for (const value of mesh.geometry.attributes.position.array) {
		assert.ok(Number.isFinite(value));
	}
}

/** Proves every generated record remains valid and physically placeable. */
export function assertFiniteRecord(record) {
	assert.equal(record.validation.ok, true);
	assert.ok(Number.isFinite(record.x));
	assert.ok(Number.isFinite(record.y));
	assert.ok(Number.isFinite(record.z));
	assert.ok(Number.isFinite(record.rotationY));
	assert.ok(record.scale > 0);
	assert.ok(record.validation.height > 0);
}

function fixtureTriangles(kind, minimumX, maximumX, minimumZ = 35, maximumZ = 55) {
	return [
		new TriangleCollider(v(minimumX, 0, minimumZ), v(maximumX, 0, minimumZ), v(minimumX, 0, maximumZ), { kind }),
		new TriangleCollider(v(maximumX, 0, minimumZ), v(maximumX, 0, maximumZ), v(minimumX, 0, maximumZ), { kind })
	];
}

function assertMeasuredTree(item) {
	assert.ok(Number.isInteger(item.index));
	assert.ok(item.measuredRadius > 0);
	assert.ok(item.triangles >= 0);
}
