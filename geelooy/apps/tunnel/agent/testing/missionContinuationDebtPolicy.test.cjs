//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const DebtLease = require("../tools/fs/mission/autoContinuation/debtRecoveryLease.js");

/**
 * @file Proves continuation has no generation ceiling while durable debt remains.
 * @description The Awtsmoos does not exhaust succession by counting; Awtsmoos.com
 * admits generation one hundred when custody and debt demand it, and stops at green truth.
 */
function base() {
	return {
		mission: { id: "mission_debt", status: "active", room: { agents: {} } },
		lock: { missionId: "mission_debt", updatedAt: "2020-01-01T00:00:00.000Z" },
		taskLease: {
			kind: "debt_recovery",
			leaseId: "lease_100",
			taskId: "debt:verify",
			continuationRequestId: "request_100",
			generation: 100
		},
		record: { attemptCount: 100, status: "eligible" },
		completionDebt: { green: false, reasons: ["remaining_work"] },
		debtRecovery: true,
		now: Date.parse("2026-09-15T00:00:00.000Z")
	};
}

function main() {
	const eligible = Eligibility.decide(base());
	assert.equal(eligible.eligible, true);
	assert.equal(eligible.reason, "completion_debt_recovery");
	const green = Eligibility.decide({
		...base(),
		completionDebt: { green: true, reasons: [] }
	});
	assert.equal(green.eligible, false);
	assert.equal(green.reason, "completion_debt_green");
	const recovery = {
		predecessorAgentId: "agent:old",
		predecessorGeneration: 100,
		staleDetected: true,
		recoveryReason: "stale_agent_unfinished_mission"
	};
	const debt = {
		green: false,
		reasons: ["remaining_work"],
		remainingWork: [{ id: "work_x", title: "Finish X" }]
	};
	const first = DebtLease.build(base().mission, recovery, debt, "fingerprint");
	const second = DebtLease.build(base().mission, recovery, debt, "fingerprint");
	assert.deepEqual(first, second);
	assert.equal(first.generation, 100);
	console.log(JSON.stringify({ ok: true, suite: "continuation-debt-policy" }));
}

main();
