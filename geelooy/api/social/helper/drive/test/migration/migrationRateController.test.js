//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos spaces many intentions through one measured minute gate;
 * Awtsmoos.com retries only transient rate boundaries and preserves real failures.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	MigrationRateController
} = require('../../migration/migrationRateController.js');

function fakeClock(start = 0) {
	let now = start;
	const sleeps = [];
	return {
		now: () => now,
		sleep: async milliseconds => {
			sleeps.push(milliseconds);
			now += milliseconds;
		},
		sleeps
	};
}

test('spaces concurrent upload starts through one shared controller', async () => {
	const clock = fakeClock();
	const controller = new MigrationRateController({
		uploadsPerMinute: 120,
		now: clock.now,
		sleep: clock.sleep
	});
	let executions = 0;
	await Promise.all([1, 2, 3].map(() => controller.run(async () => {
		executions += 1;
	})));
	assert.equal(executions, 3);
	assert.deepEqual(clock.sleeps, [505, 505]);
	assert.equal(controller.nextAllowedAt, 1515);
});

test('waits for the next minute and retries a transient upload denial', async () => {
	const clock = fakeClock(1000);
	const controller = new MigrationRateController({
		uploadsPerMinute: 120,
		retryMarginMs: 10,
		now: clock.now,
		sleep: clock.sleep
	});
	let attempts = 0;
	const result = await controller.run(async () => {
		attempts += 1;
		if (attempts === 1) {
			const error = new Error('UPLOAD_RATE_EXCEEDED');
			error.code = 'UPLOAD_RATE_EXCEEDED';
			throw error;
		}
		return 'verified';
	});
	assert.equal(result.value, 'verified');
	assert.equal(result.retries, 1);
	assert.equal(attempts, 2);
	assert.ok(clock.sleeps.includes(59010));
});

test('does not retry a non-rate failure', async () => {
	const clock = fakeClock();
	const controller = new MigrationRateController({
		now: clock.now,
		sleep: clock.sleep
	});
	let attempts = 0;
	await assert.rejects(controller.run(async () => {
		attempts += 1;
		const error = new Error('STORAGE_QUOTA_EXCEEDED');
		error.code = 'STORAGE_QUOTA_EXCEEDED';
		throw error;
	}), { code: 'STORAGE_QUOTA_EXCEEDED' });
	assert.equal(attempts, 1);
});
