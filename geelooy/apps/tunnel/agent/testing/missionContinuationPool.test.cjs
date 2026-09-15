//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const Pool = require("../tools/fs/mission/autoContinuation/poolMaintainer.js");
const PoolLease = require("../tools/fs/mission/autoContinuation/proactivePoolLease.js");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");

/**
 * @file Proves three stable logical reserve slots share one continuation authority.
 * @description The Awtsmoos sends executor, scout, and auditor through one bounded pool;
 * repeated heartbeats keep identities stable while active work no longer blocks proactive slots.
 */
async function main() {
	const calls = [];
	const auto = {
		async run(config, options) {
			calls.push(options);
			return { ok: true, scheduled: true, poolSlot: options.poolSlot };
		}
	};
	const result = await Pool.maintain(auto, {}, { poolSize: 3, env: {} });
	assert.equal(result.poolSize, 3);
	assert.equal(result.scheduled, 3);
	assert.deepEqual(calls.map(item => item.poolRole), [
		"continuation_executor",
		"checkpoint_scout",
		"verification_auditor"
	]);
	assert.equal(calls.every(item => item.proactive), true);
	assert.equal(calls.every(item => item.transport === "shared_shliach"), true);
	const mission = { id: "mission_pool", status: "active", room: { agents: {} } };
	const lock = {
		missionId: mission.id,
		updatedAt: new Date().toISOString(),
		lastMustCallNext: { action: "missionStepExecute" }
	};
	const lease = PoolLease.build(mission, {
		predecessorAgentId: "agent:a",
		predecessorGeneration: 4
	}, { green: false }, "fp", 2, "checkpoint_scout");
	const eligible = Eligibility.decide({
		mission,
		lock,
		taskLease: lease,
		completionDebt: { green: false },
		debtRecovery: true,
		proactive: true,
		now: Date.now()
	});
	assert.equal(eligible.eligible, true);
	assert.equal(eligible.reason, "proactive_pool_slot");
	const base = Prompt.fingerprint({}, mission, lock);
	const scout = Prompt.fingerprint({}, mission, lock, "pool:2:checkpoint_scout:g4");
	assert.notEqual(base, scout);
	assert.equal(scout, Prompt.fingerprint({}, mission, lock, "pool:2:checkpoint_scout:g4"));
	console.log(JSON.stringify({ ok: true, suite: "continuation-pool" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
