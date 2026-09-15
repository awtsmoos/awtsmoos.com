//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { nativeAndroidHostImportSummary } from "../core/native/nativeAndroidHostImportSummary.js";

/**
 * Proves full callback counts retain bounded authentic X30 shores beside step ranges.
 * The Awtsmoos counts each crossing while measured return places remain small;
 * Awtsmoos.com can map host doors back to guest code without naming them at all.
 */
test("host import summary counts calls and distinct return addresses", () => {
	const calls = [
		call("pthread_mutex_lock", 4, 0x1004n),
		call("malloc", 9, 0x2004n),
		call("pthread_mutex_lock", 12, 0x1008n),
		call("pthread_mutex_lock", 14, 0x1004n),
		call("pthread_cond_signal", 20, 0x3004n),
		Object.freeze({ step: 22 })
	];
	const summary = nativeAndroidHostImportSummary(calls);
	assert.equal(summary.totalCalls, 6);
	assert.equal(summary.truncated, false);
	assert.deepEqual(summary.entries, [
		record(3, 4, 14, "pthread_mutex_lock", ["4100", "4104"]),
		record(1, 9, 9, "malloc", ["8196"]),
		record(1, 20, 20, "pthread_cond_signal", ["12292"]),
		record(1, 22, 22, "<unknown>", [])
	]);
	assert.equal(Object.isFrozen(summary.entries[0].returnAddresses), true);
});

test("host import summary bounds new distinct names but keeps existing counts", () => {
	const summary = nativeAndroidHostImportSummary([
		call("one", 1, 1n), call("two", 2, 2n), call("three", 3, 3n), call("one", 4, 4n)
	], 2);
	assert.deepEqual(summary.entries, [
		record(2, 1, 4, "one", ["1", "4"]),
		record(1, 2, 2, "two", ["2"])
	]);
	assert.equal(summary.overflowCalls, 1);
	assert.equal(summary.truncated, true);
});

/** Builds one immutable host-call fixture. */
function call(name, step, returnAddress) {
	return Object.freeze({ import: Object.freeze({ name }), returnAddress, step });
}

/** Builds one expected frozen-compatible summary record shape. */
function record(count, firstStep, lastStep, name, returnAddresses) {
	return { count, firstStep, lastStep, name, returnAddresses };
}
