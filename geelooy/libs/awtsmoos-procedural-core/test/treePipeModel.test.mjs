// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that many branches remain vessels of one conserved tree,
 * while the established seeded generator retains authority over placement.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	calculateTreeChildRadius,
	createTreePipeModelReport
} from "../src/core/geometry/generators/tree/treePipeModel.js";

for (const childCount of [1, 2, 4, 8]) {
	test(`pipe-model radii conserve area for ${childCount} children`, () => {
		const radii = Array.from({ length: childCount }, () => (
			calculateTreeChildRadius(1.2, childCount, 0.82)
		));
		const report = createTreePipeModelReport(1.2, radii);
		assert.equal(report.conserved, true);
		assert.ok(report.child_to_parent_ratio <= 0.78 + 1e-12);
		assert.ok(radii.every((radius) => radius > 0 && radius <= 1.2));
	});
}

test("pipe-model calculations are deterministic and finite at tiny scales", () => {
	const first = calculateTreeChildRadius(0.001, 64, 0.7);
	const second = calculateTreeChildRadius(0.001, 64, 0.7);
	assert.equal(first, second);
	assert.equal(Number.isFinite(first), true);
	assert.ok(first >= 0);
	assert.ok(first <= 0.001);
});
