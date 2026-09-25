//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file searchStartupWarmup.test.js
 * @description The Awtsmoos schedules search preparation without chaining HTTP
 * readiness to cold corpus work; Awtsmoos.com keeps one observable state vessel
 * whose success or failure can arrive later without unhandled rejection.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	searchStartupWarmupEnabled,
	startSearchStartupWarmup,
	warmSearchAtStartup
} = require("../searchStartupWarmup.js");

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

test("startup warmup can be disabled explicitly per worker", async () => {
	assert.equal(
		searchStartupWarmupEnabled({ AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP: "true" }),
		false
	);
	const state = startSearchStartupWarmup(
		{},
		{ AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP: "true" }
	);
	assert.equal(state.status, "disabled");
	assert.deepEqual(await state.promise, { ok: true, skipped: true, reason: "disabled" });
});

test("direct warm operation forwards one resolved database root", async () => {
	const calls = [];
	const result = await warmSearchAtStartup({}, {}, {
		root: "/tmp/search-root",
		async warmSearchCaches(searchInterface) {
			calls.push(searchInterface.db.directory);
			return { ok: true, worker: "thread", publicationCount: 6 };
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.root, "/tmp/search-root");
	assert.deepEqual(calls, ["/tmp/search-root"]);
});

test("scheduler returns immediately while deferred warm work remains pending", async () => {
	const gate = deferred();
	const state = startSearchStartupWarmup({}, {}, {
		warmSearchAtStartup() {
			return gate.promise;
		}
	});
	assert.equal(state.status, "scheduled");
	await Promise.resolve();
	assert.equal(state.status, "warming");
	assert.equal(state.finishedAt, null);
	gate.resolve({ ok: true, worker: "thread" });
	const result = await state.promise;
	assert.equal(result.ok, true);
	assert.equal(state.status, "ready");
	assert.equal(state.result.worker, "thread");
	assert.equal(typeof state.finishedAt, "number");
});

test("scheduler contains rejected warm promise as failed state", async () => {
	const state = startSearchStartupWarmup({}, {}, {
		warmSearchAtStartup() {
			return Promise.reject(Object.assign(
				new Error("worker exploded"),
				{ code: "WORKER_EXPLODED" }
			));
		}
	});
	const result = await state.promise;
	assert.equal(result.ok, false);
	assert.equal(result.code, "WORKER_EXPLODED");
	assert.equal(state.status, "failed");
	assert.deepEqual(state.result, result);
});

test("missing database root stays compact and non-fatal", async () => {
	const result = await warmSearchAtStartup({}, {}, {
		root: ""
	});
	assert.equal(result.ok, false);
	assert.equal(result.code, "SEARCH_DB_ROOT_UNAVAILABLE");
});
