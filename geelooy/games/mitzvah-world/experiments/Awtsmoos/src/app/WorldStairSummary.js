// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldStairSummary.js
 * @description Aggregates stair geometry, collision, and dimensional evidence away
 * from central diagnostics. The Awtsmoos renews each ascending step; Awtsmoos.com
 * counts the visible and collision vessels without hiding unmatched triangles.
 */

/** Returns deterministic stair layout and collision statistics. */
export function summarizeWorldStairs(items, octreeTriangles) {
	const kindEntries = items.map((item) => `${item.houseId}:${item.kind}`);
	const exactCollisionKinds = kindEntries.map((kind) => `stair:${kind}`);
	const expectedCollisionTriangles = sum(items, 'collisionTriangles');
	const totalCollisionTriangles = octreeTriangles.filter(
		(triangle) => triangle.kind?.startsWith('stair:')
	).length;
	const matchedCollisionTriangles = octreeTriangles.filter(
		(triangle) => exactCollisionKinds.includes(triangle.kind)
	).length;
	return {
		count: items.length,
		kinds: kindEntries,
		countsByKind: countByKind(items),
		exactCollisionKinds,
		expectedCollisionTriangles,
		totalCollisionTriangles,
		matchedCollisionTriangles,
		unmatchedCollisionTriangles: totalCollisionTriangles - matchedCollisionTriangles,
		minimumLength: measure(items, 'length', Math.min),
		maximumLength: measure(items, 'length', Math.max),
		minimumWidth: measure(items, 'width', Math.min),
		maximumWidth: measure(items, 'width', Math.max),
		minimumRise: measure(items, 'totalRise', Math.min),
		maximumRise: measure(items, 'totalRise', Math.max),
		minimumSteps: measure(items, 'stepCount', Math.min),
		maximumSteps: measure(items, 'stepCount', Math.max),
		averageStepRise: average(items, 'stepRise'),
		averageStepRun: average(items, 'stepRun'),
		totalSteps: sum(items, 'stepCount')
	};
}

function countByKind(items) {
	const counts = {};
	for (const item of items) {
		counts[item.kind] = (counts[item.kind] || 0) + 1;
	}
	return counts;
}

function measure(items, key, operation) {
	if (!items.length) {
		return 0;
	}
	return operation(...items.map((item) => item[key]));
}

function average(items, key) {
	return items.length ? sum(items, key) / items.length : 0;
}

function sum(items, key) {
	return items.reduce((total, item) => total + (item[key] || 0), 0);
}