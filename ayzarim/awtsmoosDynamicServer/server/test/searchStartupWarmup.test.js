//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	DEFAULT_STARTUP_WARMUP_DELAY_MS,
	searchStartupWarmupDelay,
	searchStartupWarmupEnabled,
	startSearchStartupWarmup,
	warmSearchAtStartup
} = require("../searchStartupWarmup.js");

function manualTimer() {
	const scheduled = [];
	return {
		scheduled,
		setTimeout(callback, delayMs) {
			scheduled.push({ callback, delayMs });
			return { unref() {} };
		}
	};
}

test("startup warmup can be disabled explicitly per worker", async () => {
	assert.equal(searchStartupWarmupEnabled({ AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP: "true" }), false);
	const state = startSearchStartupWarmup({}, { AWTSMOOS_DISABLE_SEARCH_STARTUP_WARMUP: "true" });
	assert.equal(state.status, "disabled");
	assert.deepEqual(await state.promise, { ok: true, skipped: true, reason: "disabled" });
});

test("startup warmup uses a real quiet window by default", async () => {
	const timer = manualTimer();
	let calls = 0;
	const state = startSearchStartupWarmup({}, {}, {
		setTimeout: timer.setTimeout,
		async warmSearchAtStartup() {
			calls += 1;
			return { ok: true, worker: "thread" };
		}
	});
	assert.equal(state.status, "scheduled");
	assert.equal(state.delayMs, DEFAULT_STARTUP_WARMUP_DELAY_MS);
	assert.equal(timer.scheduled[0].delayMs, 30000);
	await Promise.resolve();
	assert.equal(calls, 0);
	timer.scheduled[0].callback();
	const result = await state.promise;
	assert.equal(calls, 1);
	assert.equal(result.ok, true);
	assert.equal(state.status, "ready");
});

test("startup warmup delay can be configured without changing code", () => {
	assert.equal(searchStartupWarmupDelay({ AWTSMOOS_SEARCH_STARTUP_WARMUP_DELAY_MS: "45000" }), 45000);
	assert.equal(searchStartupWarmupDelay({ AWTSMOOS_SEARCH_STARTUP_WARMUP_DELAY_MS: "0" }), 0);
	assert.equal(searchStartupWarmupDelay({ AWTSMOOS_SEARCH_STARTUP_WARMUP_DELAY_MS: "bad" }), 30000);
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

test("scheduled warm rejection becomes compact failed state", async () => {
	const timer = manualTimer();
	const state = startSearchStartupWarmup({}, {}, {
		setTimeout: timer.setTimeout,
		warmSearchAtStartup() {
			return Promise.reject(Object.assign(new Error("worker exploded"), { code: "WORKER_EXPLODED" }));
		}
	});
	timer.scheduled[0].callback();
	const result = await state.promise;
	assert.equal(result.ok, false);
	assert.equal(result.code, "WORKER_EXPLODED");
	assert.equal(state.status, "failed");
});

test("missing database root stays compact and non-fatal", async () => {
	const result = await warmSearchAtStartup({}, {}, { root: "" });
	assert.equal(result.ok, false);
	assert.equal(result.code, "SEARCH_DB_ROOT_UNAVAILABLE");
});
