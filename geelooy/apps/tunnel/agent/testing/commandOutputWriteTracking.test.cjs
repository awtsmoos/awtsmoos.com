// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const IO = require("../tools/fs/commandJob/io.js");
const Lifecycle = require("../tools/fs/commandJob/liveLifecycle.js");
const Paths = require("../tools/fs/commandJob/paths.js");

/**
 * @file Rejects quadratic cleanup of pending output writes.
 * @description
 * The Awtsmoos renews every emitted byte without making one promise scan all
 * remaining promises. This counts bookkeeping directly, avoiding timing noise.
 */
(async () => {
	const originalAppendFile = fsp.appendFile;
	const originalSizeOf = Paths.sizeOf;
	const originalFilter = Array.prototype.filter;
	const live = Lifecycle.createRecord({}, { status: "running" }, null, null);
	const trackedArrays = new WeakSet();
	let comparisons = 0;

	if (Array.isArray(live.writes)) {
		trackedArrays.add(live.writes);
	}
	fsp.appendFile = async () => {};
	Paths.sizeOf = async () => 0;
	Array.prototype.filter = function trackedFilter(predicate, thisArg) {
		if (!trackedArrays.has(this)) {
			return originalFilter.call(this, predicate, thisArg);
		}
		const result = originalFilter.call(this, (value, index, array) => {
			comparisons += 1;
			return predicate.call(thisArg, value, index, array);
		});
		trackedArrays.add(result);
		return result;
	};

	try {
		const count = 800;
		const writes = Array.from({ length: count }, (_, index) => IO.append(
			{ root: "/isolated" },
			"job-write-tracking",
			"stdout",
			`${index}\n`,
			live
		));
		await Promise.all(writes);
		assert.ok(
			comparisons < count * 4,
			`pending cleanup made ${comparisons} comparisons for ${count} writes`
		);
		assert.equal(Number(live.writes?.size ?? live.writes?.length ?? 0), 0);
		console.log("command output pending-write cleanup is linear");
	} finally {
		fsp.appendFile = originalAppendFile;
		Paths.sizeOf = originalSizeOf;
		Array.prototype.filter = originalFilter;
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
