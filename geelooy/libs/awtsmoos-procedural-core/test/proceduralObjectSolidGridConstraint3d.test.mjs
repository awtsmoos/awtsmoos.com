// B"H
// Boruch Hashem
// Blessed is He
/** Grid constraint evidence proves solid velocity and approximate no-penetration. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const declaration = {
	width: 5,
	height: 5,
	depth: 5,
	origin: [-1, -1, -1],
	cellSize: 0.5
};
const floor = {
	id: "solid.floor",
	field: {
		kind: "plane",
		parameters: { normal: [0, 1, 0], offset: 0 }
	}
};
const downward = api.createVectorGrid3d({ ...declaration, fillY: -3 });
const constrained = api.constrainLiquidGridToSolids3d(
	downward,
	[floor],
	{ solidBoundaryWidth: 0 }
);
const index = (x, y, z) => api.gridIndex3d(downward, x, y, z);
assert.equal(constrained.velocityGrid.y[index(2, 0, 2)], 0);
assert.equal(constrained.velocityGrid.y[index(2, 2, 2)], 0);
assert.equal(constrained.velocityGrid.y[index(2, 4, 2)], -3);
assert.ok(constrained.interiorCellCount > 0);
assert.ok(constrained.constrainedCellCount > constrained.interiorCellCount);

const moving = api.constrainLiquidGridToSolids3d(
	downward,
	[{ ...floor, velocity: [0, 1, 0] }],
	{ solidBoundaryWidth: 0 }
);
assert.equal(moving.velocityGrid.y[index(2, 0, 2)], 1);
assert.equal(moving.velocityGrid.y[index(2, 2, 2)], 1);

const outward = api.createVectorGrid3d({ ...declaration, fillY: 2 });
const preserved = api.constrainLiquidGridToSolids3d(
	outward,
	[floor],
	{ solidBoundaryWidth: 0 }
);
assert.equal(preserved.velocityGrid.y[index(2, 2, 2)], 2);
assert.equal(preserved.velocityGrid.y[index(2, 4, 2)], 2);

console.log('B"H | proceduralObjectSolidGridConstraint3d.test passed');
