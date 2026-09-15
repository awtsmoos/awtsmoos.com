//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actions.js");
const Debt = require("../tools/fs/mission/autoContinuation/completionDebt.js");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const Pool = require("../tools/fs/mission/autoContinuation/poolMaintainer.js");

/**
 * @file Proves non-runnable debt, pressure-aware pool controls, and discoverable speed guidance.
 * @description The Awtsmoos runs quickly only where action is real; Awtsmoos.com stops spinning on
 * human blockers, sheds optional reserve roles under pressure, and exposes one safe lightning covenant.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-lightning-gov-"));
	const config = { root };
	try {
		const mission = {
			id: "mission_wait",
			status: "active",
			waitingForUser: true,
			work: [{ id: "work_a", status: "open", title: "Needs answer" }]
		};
		const lock = { missionId: mission.id, lastMustCallNext: { action: "missionStepExecute" } };
		const debt = await Debt.assess(config, mission, lock, {}, {
			Mission: { finalizeVerdict: () => ({ ok: false, issues: ["unfinished"] }) }
		});
		assert.equal(debt.green, false);
		assert.equal(debt.runnable, false);
		assert.equal(debt.disposition, "waiting_user");
		const decision = Eligibility.decide({
			mission,
			lock,
			taskLease: { taskId: "t", leaseId: "l", continuationRequestId: "r" },
			completionDebt: debt,
			debtRecovery: true
		});
		assert.equal(decision.eligible, false);
		assert.equal(decision.reason, "completion_debt_waiting_user");
		const calls = [];
		const fakeAuto = { run: async (_config, options) => {
			calls.push(options);
			return { ok: true, scheduled: true };
		} };
		const pressured = await Pool.maintain(fakeAuto, config, {
			poolSize: 3,
			pressure: { level: "high" },
			env: {}
		});
		assert.equal(pressured.poolSize, 1);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].poolRole, "continuation_executor");
		const actions = Actions.buildActions(config, { action: "tunnelVelocityGuidance", normalized: true }, null);
		const guidance = await actions.tunnelVelocityGuidance();
		assert.equal(guidance.ok, true);
		assert.match(guidance.text, /parallelize/i);
		assert.match(guidance.text, /never wait idly/i);
		assert.match(guidance.text, /never authorizes bypassing correctness/i);
		console.log(JSON.stringify({ ok: true, suite: "lightning-governance" }));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
