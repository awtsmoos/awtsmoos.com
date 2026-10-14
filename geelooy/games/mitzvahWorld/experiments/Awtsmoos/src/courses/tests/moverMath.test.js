// B"H
// Tests mover kinematics: sinusoid oscillation, constant-speed path loops,
// deltas, box extents, and sweeper angles.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	moverBoxAt,
	moverDelta,
	moverPositionAt,
	sweeperAngleAt
} from '../moverMath.js';

const sinusoid = {
	kind: 'sinusoid', axis: 'x',
	base: { x: 10, z: 20, top: 2 }, w: 4, d: 4, thickness: 1,
	amplitude: 5, period: 4, phase: 0
};

test('sinusoid starts at base and oscillates symmetrically', () => {
	const at0 = moverPositionAt(sinusoid, 0);
	assert.equal(at0.x, 10);
	assert.equal(at0.z, 20);
	assert.equal(at0.y, 1.5); // top 2 minus half thickness
	const quarter = moverPositionAt(sinusoid, 1); // period/4 → sin(π/2) = 1
	assert.equal(quarter.x, 15);
	const half = moverPositionAt(sinusoid, 2);
	assert.ok(Math.abs(half.x - 10) < 1e-9);
	const threeQuarter = moverPositionAt(sinusoid, 3);
	assert.equal(threeQuarter.x, 5);
});

test('sinusoid vertical axis moves y only', () => {
	const mover = { ...sinusoid, axis: 'y' };
	const atQuarter = moverPositionAt(mover, 1);
	assert.equal(atQuarter.x, 10);
	assert.equal(atQuarter.y, 1.5 + 5);
});

test('path mover travels at constant speed around the loop', () => {
	const mover = {
		kind: 'path',
		path: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], // [x, z, top]
		w: 2, d: 2, thickness: 1, period: 40, phase: 0
	};
	// Square perimeter 40; period 40 → 1 m/s. At t=10 the mover is 10m along.
	const at10 = moverPositionAt(mover, 10);
	assert.ok(Math.abs(at10.x - 10) < 1e-9, `x=${at10.x}`);
	assert.ok(Math.abs(at10.z - 0) < 1e-9, `z=${at10.z}`);
	const at20 = moverPositionAt(mover, 20);
	assert.ok(Math.abs(at20.x - 10) < 1e-9);
	assert.ok(Math.abs(at20.z - 10) < 1e-9);
	const at40 = moverPositionAt(mover, 40);
	assert.ok(Math.abs(at40.x - 0) < 1e-9 && Math.abs(at40.z - 0) < 1e-9);
});

test('moverDelta equals the difference of positions', () => {
	const delta = moverDelta(sinusoid, 0, 1);
	assert.equal(delta.x, 5);
	assert.equal(delta.z, 0);
	assert.equal(delta.y, 0);
});

test('moverBoxAt centers the box on the mover', () => {
	const box = moverBoxAt(sinusoid, 0);
	assert.equal(box.minX, 8);
	assert.equal(box.maxX, 12);
	assert.equal(box.maxY, 2);
	assert.equal(box.minY, 1);
	assert.equal(box.minZ, 18);
	assert.equal(box.maxZ, 22);
});

test('sweeper angle advances one revolution per period', () => {
	const hazard = { period: 2, phase: 0 };
	assert.equal(sweeperAngleAt(hazard, 0), 0);
	assert.ok(Math.abs(sweeperAngleAt(hazard, 2) - Math.PI * 2) < 1e-9);
	assert.ok(Math.abs(sweeperAngleAt(hazard, 0.5) - Math.PI / 2) < 1e-9);
});
