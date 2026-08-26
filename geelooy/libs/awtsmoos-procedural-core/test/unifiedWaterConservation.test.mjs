// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unifiedWaterConservation.test.mjs
 * @description Proves that friendly 3D water verbs preserve or explicitly account for conserved primary mass.
 * The Awtsmoos renews every drop while Awtsmoos.com demands finite testimony: emit, splash, explode, drain, and transfer
 * must reveal exactly where primary water entered, moved, or remained, so realism rests on truth before foam catches the eye.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { WaterDynamicsRuntime3d } from '@awtsmoos/procedural-core/water';

const EPSILON = 1e-9;

test('emission reconciles primary particle and PIC/FLIP grid mass', () => {
	const water = runtime({ capacity: 32 });
	const report = water.emit('droplets', {
		count: 8,
		mass: 4,
		radius: 0,
		speed: 0
	});
	assert.equal(report.acceptedCount, 8);
	assert.ok(close(report.acceptedMass, 4));
	assert.ok(close(water.primaryMass, 4));
	assert.ok(close(water.diagnostics.gridMass, 4));
	assert.ok(close(water.diagnostics.gridMassError, 0));
});

test('splash and impulse-only explosion preserve primary mass', () => {
	const water = runtime();
	water.ball({ count: 24, mass: 6, speed: 0 });
	const before = water.primaryMass;
	water.splash({ impulse: 3, radius: 2 });
	assert.ok(close(water.primaryMass, before));
	const explosion = water.explode({ impulse: 5, radius: 2 });
	assert.equal(explosion.spawn, null);
	assert.ok(close(water.primaryMass, before));
	assert.ok(close(water.diagnostics.gridMass, before));
});

test('explicit explosion spawn mass is fully reported and conserved', () => {
	const water = runtime({ capacity: 256 });
	water.droplets({ count: 8, mass: 2 });
	const before = water.primaryMass;
	const result = water.explode({
		impulse: 4,
		radius: 2,
		spawnMass: 3
	});
	assert.ok(result.spawn);
	assert.ok(close(result.spawn.acceptedMass, 3));
	assert.ok(close(water.primaryMass, before + result.spawn.acceptedMass));
	assert.ok(close(water.diagnostics.gridMass, water.primaryMass));
});

test('drain returns an exact conserved parcel and removes the same mass', () => {
	const water = runtime();
	water.emit('droplets', { count: 6, mass: 6, radius: 0, speed: 0 });
	const before = water.primaryMass;
	const parcel = water.drain({ maxCount: 2 });
	assert.equal(parcel.count, 2);
	assert.ok(close(parcel.mass, 2));
	assert.ok(close(water.primaryMass, before - parcel.mass));
	assert.ok(close(water.diagnostics.gridMass, water.primaryMass));
});

test('transfer moves exact mass between runtimes without changing total mass', () => {
	const source = runtime();
	const target = runtime({ origin: [10, 0, 10] });
	source.emit('droplets', { count: 6, mass: 6, radius: 0, speed: 0 });
	const totalBefore = source.primaryMass + target.primaryMass;
	const report = source.transferTo(target, { maxCount: 3 });
	assert.ok(close(report.transferredMass, 3));
	assert.ok(close(source.primaryMass, 3));
	assert.ok(close(target.primaryMass, 3));
	assert.ok(close(source.primaryMass + target.primaryMass, totalBefore));
	assert.ok(close(target.diagnostics.gridMass, target.primaryMass));
});

test('capacity-limited transfer leaves unaccepted source water untouched', () => {
	const source = runtime();
	const target = runtime({ capacity: 2 });
	source.emit('droplets', { count: 5, mass: 5, radius: 0, speed: 0 });
	target.emit('droplets', { count: 1, mass: 1, radius: 0, speed: 0 });
	const totalBefore = source.primaryMass + target.primaryMass;
	const report = source.transferTo(target);
	assert.equal(report.transferredCount, 1);
	assert.ok(close(report.transferredMass, 1));
	assert.ok(close(source.primaryMass, 4));
	assert.ok(close(target.primaryMass, 2));
	assert.ok(close(source.primaryMass + target.primaryMass, totalBefore));
});

function runtime(options = {}) {
	return new WaterDynamicsRuntime3d({
		cellSize: 0.5,
		depth: 8,
		height: 8,
		solver: 'base',
		width: 8,
		...options
	});
}

function close(left, right) {
	return Math.abs(left - right) <= EPSILON;
}
