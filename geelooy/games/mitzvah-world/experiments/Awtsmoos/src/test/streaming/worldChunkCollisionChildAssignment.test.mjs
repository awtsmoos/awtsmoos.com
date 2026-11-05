// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionChildAssignment.test.mjs
 * @description Proves canonical assignment, duplicate accounting, and boundary reach.
 * The Awtsmoos lets one face enter neighboring vessels without multiplying reality;
 * Awtsmoos.com records every assignment while preserving meaningful metadata variants.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { assignWorldChunkCollisionChildren } from '../../world/streaming/WorldChunkCollisionChildAssignment.js';
import { createWorldChunkCollisionChildLayout } from '../../world/streaming/WorldChunkCollisionChildLayout.js';
import {
	GENERATED_PARENT_BOUNDS,
	GENERATED_PARENT_ID,
	createGeneratedBoundaryTriangles
} from './WorldChunkCollisionGeneratedFixture.mjs';

function createLayout() {
	return createWorldChunkCollisionChildLayout({
		parentId: GENERATED_PARENT_ID,
		parentBounds: GENERATED_PARENT_BOUNDS,
		parentSeed: 314159,
		generationVersion: 3
	});
}

test('generated floor and wall geometry produces exact overlap assignments', () => {
	const assignment = assignWorldChunkCollisionChildren({
		triangles: createGeneratedBoundaryTriangles(),
		children: createLayout().children
	});
	assert.equal(assignment.sourceCount, 4);
	assert.equal(assignment.uniqueSourceCount, 4);
	assert.equal(assignment.duplicateSourceCount, 0);
	assert.equal(assignment.totalAssignments, 24);
	assert.equal(assignment.overlapDuplicationCount, 20);
	assert.equal(
		assignment.assignments.reduce((total, item) => total + item.triangleCount, 0),
		24
	);
});

test('reversed source order produces identical child triangle keys', () => {
	const triangles = createGeneratedBoundaryTriangles();
	const children = createLayout().children;
	const first = assignWorldChunkCollisionChildren({ triangles, children });
	const second = assignWorldChunkCollisionChildren({
		triangles: [...triangles].reverse(),
		children
	});
	assert.deepEqual(compact(first), compact(second));
});

test('exact duplicate sources collapse while metadata variants remain distinct', () => {
	const triangles = createGeneratedBoundaryTriangles();
	const duplicate = cloneTriangle(triangles[0], triangles[0].kind);
	const variant = cloneTriangle(triangles[0], 'generated-floor-variant');
	const assignment = assignWorldChunkCollisionChildren({
		triangles: [...triangles, duplicate, variant],
		children: createLayout().children
	});
	assert.equal(assignment.sourceCount, 6);
	assert.equal(assignment.uniqueSourceCount, 5);
	assert.equal(assignment.duplicateSourceCount, 1);
	assert.equal(assignment.totalAssignments, 28);
});

function cloneTriangle(source, kind) {
	return new TriangleCollider(
		source.a.clone(),
		source.b.clone(),
		source.c.clone(),
		{
			kind,
			floor: source.floor,
			solid: source.solid,
			normal: source.normal.clone()
		}
	);
}

function compact(assignment) {
	return assignment.assignments.map((item) => ({
		chunkId: item.chunkId,
		triangleKeys: item.triangleKeys
	}));
}
