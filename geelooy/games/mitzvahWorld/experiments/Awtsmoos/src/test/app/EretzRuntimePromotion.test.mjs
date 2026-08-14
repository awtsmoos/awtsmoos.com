// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimePromotion.test.mjs
 * @description Proves canonical readiness retires bootstrap scheduling and publishes exactly one rich runtime controller.
 * The Awtsmoos does not appoint two clocks over one traveler; Awtsmoos.com tests start-before-stop safety,
 * UI preservation, idempotence, diagnostics replacement, headless disablement, and canonical promotion ordering.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzCanonicalWorldPromotion } from '../../app/EretzCanonicalWorldPromotion.js';
import { promoteEretzRuntimeLoop } from '../../app/EretzRuntimePromotion.js';

test('runtime promotion starts rich loop then retires bootstrap exactly once', () => {
	const events = [];
	const bootstrap = controller('BootstrapMovementController', options => {
		events.push(['stop', options]);
	});
	const rich = controller('EretzMovementController');
	const context = liveContext(bootstrap);
	const result = promoteEretzRuntimeLoop(context, {
		startRuntime(runtime, diagnostics, environment) {
			events.push(['start', runtime, diagnostics, environment]);
			return rich;
		}
	});
	assert.equal(events[0][0], 'start');
	assert.equal(events[1][0], 'stop');
	assert.deepEqual(events[1][1], { preserveUi: true });
	assert.equal(context.movement, rich);
	assert.equal(context.diagnostics.movement, rich);
	assert.equal(context.diagnostics.bootstrap, false);
	assert.equal(context.runtime.bootstrapLoopStopped, true);
	assert.equal(result.receipt.status, 'ready');
	assert.equal(result.receipt.from, 'BootstrapMovementController');
	assert.equal(result.receipt.to, 'EretzMovementController');
	assert.equal(promoteEretzRuntimeLoop(context).receipt, result.receipt);
	assert.equal(events.length, 2);
});

test('headless startLoop false never starts or stops a scheduler', () => {
	let starts = 0;
	let stops = 0;
	const bootstrap = controller('BootstrapMovementController', () => { stops += 1; });
	const context = liveContext(bootstrap);
	context.options.startLoop = false;
	const result = promoteEretzRuntimeLoop(context, {
		startRuntime() { starts += 1; }
	});
	assert.equal(result.receipt.status, 'disabled-for-test');
	assert.equal(starts, 0);
	assert.equal(stops, 0);
});

test('canonical world becomes ready only after runtime promotion', async () => {
	const order = [];
	const context = liveContext(controller('BootstrapMovementController'));
	const receipt = Object.freeze({ status: 'ready', villageDefinitions: 2 });
	const result = await startEretzCanonicalWorldPromotion(context, {
		async build() { order.push('build'); return { terrain: { group: {} } }; },
		apply() { order.push('apply'); return receipt; },
		promoteRuntime() {
			order.push('promote');
			assert.equal(context.diagnostics.canonicalWorldPromotionStage, 'promoting-runtime');
			return { receipt: Object.freeze({ status: 'ready' }) };
		}
	});
	order.push(context.diagnostics.canonicalWorldPromotionStage);
	assert.deepEqual(order, ['build', 'apply', 'promote', 'ready']);
	assert.equal(result, receipt);
});

function liveContext(movement) {
	const runtime = richRuntime();
	const diagnostics = { movement, runtime };
	return { diagnostics, movement, options: { environment: { id: 'test-env' } }, runtime };
}

function richRuntime() {
	const update = () => {};
	return {
		camera: {}, ground: {}, houseVisibility: { update }, input: {}, jumpPhysics: {},
		lava: { update }, model: {}, mover: {}, orbit: { apply: update }, player: {},
		renderer: { render: update, setInteractor: update }, shadows: { update }
	};
}

function controller(name, stop = () => {}) {
	return { constructor: { name }, scheduler: () => ({ active: true }), stop };
}
