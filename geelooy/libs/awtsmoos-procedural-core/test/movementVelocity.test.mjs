//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file movementVelocity.test.mjs
 * @description Certifies one Euclidean acceleration budget for every horizontal heading.
 * The Awtsmoos renews east and diagonal under one measured decree;
 * Awtsmoos.com keeps acceleration fair so no compass direction steals velocity for free.
 */

import assert from 'node:assert/strict';
import {
	advanceMovementVelocity,
	createMovementVelocity,
	hasMovementVelocity
} from '../src/core/movement/MovementVelocity.js';

const accelerationOptions = {
	acceleration: 10,
	deceleration: 10,
	grounded: true,
	maxDeltaSeconds: 0.05
};
const axial = advanceMovementVelocity(
	{ x: 0, z: 0 },
	{ x: 10, z: 0 },
	0.05,
	accelerationOptions
);
const diagonalTargetComponent = 10 / Math.sqrt(2);
const diagonal = advanceMovementVelocity(
	{ x: 0, z: 0 },
	{ x: diagonalTargetComponent, z: diagonalTargetComponent },
	0.05,
	accelerationOptions
);

assert.ok(
	Math.abs(Math.hypot(axial.x, axial.z) - 0.5) < 1e-12,
	'Axial acceleration must consume exactly one 0.5-unit change budget.'
);
assert.ok(
	Math.abs(Math.hypot(diagonal.x, diagonal.z) - 0.5) < 1e-12,
	'Diagonal acceleration must consume the same Euclidean change budget.'
);
assert.ok(
	Math.abs(Math.hypot(diagonal.x, diagonal.z) - Math.hypot(axial.x, axial.z)) < 1e-12,
	'Heading must not inflate acceleration magnitude.'
);

const nearbyTarget = advanceMovementVelocity(
	{ x: 0, z: 0 },
	{ x: 0.2, z: 0.3 },
	0.05,
	accelerationOptions
);
assert.deepEqual(
	nearbyTarget,
	{ x: 0.2, z: 0.3 },
	'A target inside the change budget must be reached exactly.'
);

const decelerated = advanceMovementVelocity(
	{ x: 3, z: 4 },
	{ x: 0, z: 0 },
	0.05,
	{ ...accelerationOptions, deceleration: 2 }
);
assert.ok(
	Math.abs(Math.hypot(decelerated.x, decelerated.z) - 4.9) < 1e-12,
	'Deceleration must spend one Euclidean budget toward rest.'
);

const airborne = advanceMovementVelocity(
	{ x: 0, z: 0 },
	{ x: 10, z: 0 },
	0.05,
	{ ...accelerationOptions, airControl: 0.5, grounded: false }
);
assert.ok(
	Math.abs(Math.hypot(airborne.x, airborne.z) - 0.25) < 1e-12,
	'Air control must scale the Euclidean change budget.'
);

const clampedLongFrame = advanceMovementVelocity(
	{ x: 0, z: 0 },
	{ x: 10, z: 0 },
	1,
	accelerationOptions
);
assert.ok(
	Math.abs(Math.hypot(clampedLongFrame.x, clampedLongFrame.z) - 0.5) < 1e-12,
	'Long frames must remain bounded by maxDeltaSeconds.'
);

assert.deepEqual(createMovementVelocity({ x: Number.NaN, z: Infinity }), { x: 0, z: 0 });
assert.equal(hasMovementVelocity({ x: 0.001, z: 0 }), true);
assert.equal(hasMovementVelocity({ x: 0, z: 0 }), false);

console.log(JSON.stringify({
	BH: 'B"H',
	axialChange: Math.hypot(axial.x, axial.z),
	diagonalChange: Math.hypot(diagonal.x, diagonal.z),
	status: 'movement-velocity-euclidean-budget-certified'
}, null, 2));
