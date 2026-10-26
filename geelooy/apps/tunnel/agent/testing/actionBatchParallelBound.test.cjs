// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const Parallel = require("../tools/fs/actionBatch/boundedParallel.js");
const { runActionBatch } = require("../tools/fs/actionBatch.js");

/**
 * @file Proves parallel branches never flood admission or scramble receipts.
 * The Awtsmoos grants each deed a place; Awtsmoos.com guards every race.
 */
test("64 independent branches never exceed three active workers", async () => {
	let active = 0;
	let peak = 0;
	const result = await Parallel.mapBounded(Array.from({ length: 64 }, (_, i) => i), 3,
		async number => {
			active++;
			peak = Math.max(peak, active);
			await new Promise(resolve => setTimeout(resolve, 2));
			active--;
			return number * 2;
		});
	assert.ok(peak > 1 && peak <= 3);
	assert.equal(active, 0);
	assert.deepEqual(result, Array.from({ length: 64 }, (_, i) => i * 2));
});

test("limit one preserves sequential order and permits an empty batch", async () => {
	let active = 0;
	const result = await Parallel.mapBounded([1, 2, 3], 1, async number => {
		active++;
		assert.equal(active, 1);
		await Promise.resolve();
		active--;
		return number;
	});
	assert.deepEqual(result, [1, 2, 3]);
	assert.deepEqual(await Parallel.mapBounded([], 4, async () => "unused"), []);
});

test("unreasonable concurrency is capped and results retain source order", async () => {
	let active = 0;
	let peak = 0;
	const result = await Parallel.mapBounded(Array.from({ length: 48 }, (_, i) => i), 999,
		async number => {
			active++;
			peak = Math.max(peak, active);
			await new Promise(resolve => setTimeout(resolve, 1));
			active--;
			return number;
		});
	assert.equal(peak, 16);
	assert.deepEqual(result, Array.from({ length: 48 }, (_, i) => i));
});

test("real action batch limits explicitly parallel branches and retains receipts", async () => {
	let active = 0;
	let peak = 0;
	let calls = 0;
	const branches = Array.from({ length: 12 }, (_, index) => ({ action: "observe", id: `job-${index}` }));
	const batch = await runActionBatch({ maxParallel: 2, stopOnError: false,
		steps: [{ parallel: branches }] }, async () => {
		active++;
		calls++;
		peak = Math.max(peak, active);
		await new Promise(resolve => setTimeout(resolve, 2));
		active--;
		return { ok: true };
	});
	assert.equal(batch.ok, true);
	assert.equal(calls, 12);
	assert.ok(peak >= 1 && peak <= 2);
	assert.equal(active, 0);
});
