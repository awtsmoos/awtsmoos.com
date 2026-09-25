// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
const Policy = require("../tools/fs/executor/policy.js");
const Pool = require("../tools/fs/executor/pool.js");

/**
 * @file Proves filesystem worker running timeouts follow the job's lane class.
 * @description
 * The Awtsmoos gives urgent light deeds a short rope and patient heavy deeds a
 * long one. Awtsmoos.com bounds a wedged light-lane worker in minutes instead of
 * letting one poisoned requester hold every vessel for the full heavy timeout,
 * while heavy and bulk lanes keep their long bound for legitimate long labor.
 */
function runPolicyChecks() {
	const policy = Policy.resolve({
		JOB_TIMEOUT_MS: 60000,
		JOB_TIMEOUT_LIGHT_MS: 1200
	});
	assert.equal(Policy.runningTimeoutMs(policy, "p1_fs_light"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p0_control"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p0_wait"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p0_observe"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p1_command_admission"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p2_chrome_light"), 1200);
	assert.equal(Policy.runningTimeoutMs(policy, "p3_heavy"), 60000);
	assert.equal(Policy.runningTimeoutMs(policy, "p4_bulk"), 60000);
	assert.equal(Policy.runningTimeoutMs(policy, "unknown_lane"), 60000);
	assert.equal(Policy.runningTimeoutMs(policy, ""), 60000);

	// Defaults: five minutes for light lanes, thirty minutes for heavy.
	const defaults = Policy.resolve({});
	assert.equal(defaults.JOB_TIMEOUT_LIGHT_MS, 5 * 60 * 1000);
	assert.equal(Policy.runningTimeoutMs(defaults, "p1_fs_light"), 5 * 60 * 1000);
	assert.equal(Policy.runningTimeoutMs(defaults, "p3_heavy"), 30 * 60 * 1000);
}

async function runPoolChecks() {
	const pool = Pool.createPool({
		FAMILY_FAILURE_COOLDOWN_MS: 250,
		FAMILY_FAILURE_THRESHOLD: 4,
		FAMILY_FAILURE_WINDOW_MS: 2000,
		JOB_TIMEOUT_MS: 60000,
		JOB_TIMEOUT_LIGHT_MS: 1200,
		MAX_PER_REQUESTER: 4,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		QUEUE_START_TIMEOUT_MS: 2000,
		READY_TIMEOUT_MS: 15000,
		WORKERS: 3
	});
	try {
		const warm = await pool.warmReady({ minimum: 2, timeoutMs: 30000 });
		assert.equal(warm.warmReady, true, JSON.stringify(warm));

		// A wedged light-lane deed fails fast with the short bound.
		await assert.rejects(
			pool.execute(
				{ action: "executorTestBlock", blockMs: 5000, logicalAgentId: "lane-light" },
				{ lane: "p1_fs_light" }
			),
			error => error.code === "FS_EXECUTOR_TIMEOUT"
		);

		// The same wedge on a heavy lane survives the light bound (60s heavy bound).
		const heavy = await pool.execute(
			{ action: "executorTestBlock", blockMs: 400, logicalAgentId: "lane-heavy" },
			{ lane: "p3_heavy" }
		);
		assert.equal(heavy.ok, true, JSON.stringify(heavy));
	} finally {
		pool.shutdown();
	}
}

async function run() {
	runPolicyChecks();
	await runPoolChecks();
	console.log(JSON.stringify({
		ok: true,
		suite: "fs-executor-lane-running-timeout",
		lightLanesBounded: true,
		heavyLanesPatient: true
	}, null, 2));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
