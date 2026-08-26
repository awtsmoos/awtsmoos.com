// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unifiedWaterSources.test.mjs
 * @description Verifies deterministic continuous source timing, immutable authored intent, and useful vessel-aware defaults.
 * The Awtsmoos renews fountain and rainfall only as time is renewed; Awtsmoos.com lets these witnesses prove that pausing
 * creates no hidden water, source vectors cannot be rewritten afterward, and semantic heights descend with sensible order.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	WaterDynamicsRuntime3d,
	WaterSourceRegistry3d
} from '@awtsmoos/procedural-core/water';

const EPSILON = 1e-9;

test('continuous source emits declared massRate multiplied by explicit delta time', () => {
	const water = runtime();
	water.wellspring({ massRate: 2, particlesPerSecond: 20 });
	water.step(0.25, { solver: 'base' });
	assert.equal(water.lastSourceReports.length, 1);
	const report = water.lastSourceReports[0];
	assert.ok(close(report.requestedMass, 0.5));
	assert.ok(close(report.acceptedMass, 0.5));
	assert.ok(close(water.primaryMass, 0.5));
});

test('zero simulation delta emits nothing and does not advance source sequence', () => {
	const registry = new WaterSourceRegistry3d(613);
	registry.add('spring', { id: 'spring', massRate: 1, particlesPerSecond: 10 });
	assert.deepEqual(registry.emissions(0), []);
	const first = registry.emissions(0.1)[0];
	assert.equal(first.id, 'spring:0');
});

test('source options are cloned and deeply frozen against caller mutation', () => {
	const direction = [1, 0, 0];
	const attributes = { nested: { purity: 'clear' } };
	const water = runtime();
	water.source('jet', { attributes, direction, id: 'hose' });
	direction[0] = -1;
	attributes.nested.purity = 'muddy';
	const snapshot = water.sources[0];
	assert.deepEqual(snapshot.options.direction, [1, 0, 0]);
	assert.equal(snapshot.options.attributes.nested.purity, 'clear');
	assert.ok(Object.isFrozen(snapshot.options.direction));
	assert.ok(Object.isFrozen(snapshot.options.attributes.nested));
});

test('equal seeds and equal event order create equivalent primary particles', () => {
	const left = runtime({ seed: 77 });
	const right = runtime({ seed: 77 });
	left.droplets({ count: 6, mass: 1 });
	right.droplets({ count: 6, mass: 1 });
	assert.deepEqual(left.state.particleSystem.particles, right.state.particleSystem.particles);
});

test('semantic default placement keeps rain high and spring low inside the vessel', () => {
	const rain = runtime({ seed: 1 });
	const spring = runtime({ seed: 1 });
	rain.rain({ count: 8, mass: 1, radius: 0 });
	spring.spring({ count: 8, mass: 1, radius: 0 });
	const rainY = averageY(rain);
	const springY = averageY(spring);
	assert.ok(rainY > springY);
	assertInsideY(rain, rainY);
	assertInsideY(spring, springY);
});

test('friendly continuous aliases register through the same source authority', () => {
	const water = runtime();
	water.wellspring({ id: 'well' });
	water.fountain({ id: 'fountain' });
	water.waterfall({ id: 'fall' });
	water.hose({ id: 'hose' });
	assert.deepEqual(water.sources.map(source => source.id), ['well', 'fountain', 'fall', 'hose']);
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

function averageY(water) {
	const particles = water.state.particleSystem.particles;
	return particles.reduce((sum, particle) => sum + particle.position[1], 0) / particles.length;
}

function assertInsideY(water, y) {
	const grid = water.state.grid;
	assert.ok(y > grid.origin[1]);
	assert.ok(y < grid.origin[1] + grid.height * grid.cellSize);
}

function close(left, right) {
	return Math.abs(left - right) <= EPSILON;
}
