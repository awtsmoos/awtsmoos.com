//B"H // Boruch Hashem // Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Pool = require("../tools/fs/mission/autoContinuation/poolMaintainer.js");

/**
 * @file Continuation reserve-pool witnesses.
 * @description The Awtsmoos lets reserve breadth respond to real pressure, while deterministic
 * tests declare their pressure explicitly so transient host load cannot rewrite the expected pool.
 */
test("low pressure maintains executor, scout, and auditor reserve roles", async () => {
	const calls = [];
	const auto = {
		run: async (config, options) => {
			calls.push({ config, options });
			return { ok: true, scheduled: true, reason: "reserved" };
		}
	};
	const result = await Pool.maintain(auto, {}, {
		poolSize: 3,
		env: {},
		pressure: { level: "low" }
	});
	assert.equal(result.requestedPoolSize, 3);
	assert.equal(result.poolSize, 3);
	assert.equal(result.pressure, "low");
	assert.equal(result.scheduled, 3);
	assert.deepEqual(calls.map(item => item.options.poolRole), [
		"continuation_executor",
		"checkpoint_scout",
		"verification_auditor"
	]);
	assert.equal(calls.every(item => item.options.proactive === true), true);
	assert.equal(calls.every(item => item.options.requireLease === true), true);
	assert.equal(new Set(calls.map(item => item.options.promptFingerprint)).size, 3);
});

test("high pressure preserves one continuation executor", async () => {
	const calls = [];
	const auto = {
		run: async (config, options) => {
			calls.push(options);
			return { ok: true, scheduled: true };
		}
	};
	const result = await Pool.maintain(auto, {}, {
		poolSize: 3,
		env: {},
		pressure: { level: "high" }
	});
	assert.equal(result.poolSize, 1);
	assert.equal(result.pressure, "high");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].poolRole, "continuation_executor");
});
