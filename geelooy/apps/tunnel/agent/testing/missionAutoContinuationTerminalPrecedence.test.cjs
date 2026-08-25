// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const Requests = require("../tools/fs/mission/roomContinuationRequests.js");
const Fixture = require("./missionAutoContinuationSuccessionFixture.cjs");

/**
 * @file Proves a saved terminal handoff outranks generational stale-agent recovery.
 * @description
 * The Awtsmoos lets one unfinished flame have one next vessel; Awtsmoos.com resumes the
 * already-durable terminal successor before its stale-recovery engine may acquire another
 * generation lease, preventing two autonomous continuation paths from manifesting at once.
 */
test("terminal successor recovery prevents generational dispatch", async () => {
	const now = Date.now();
	const oldAt = new Date(now - 10 * 60 * 1000).toISOString();
	const mission = Fixture.mission(oldAt);
	Requests.ensure(mission, {
		agentId: "worker-old",
		logicalAgentId: "worker-old",
		agentSessionId: "session-old",
		generation: 1,
		taskId: "task-open",
		claimId: "claim-open"
	});
	const lock = Fixture.lock(mission.id, oldAt);
	const fake = Fixture.dependencies(mission, lock);
	let recoveryCalls = 0;
	const result = await Auto.run({ root: "/tmp/project" }, {
		now,
		deps: fake.deps,
		owner: "coordinator",
		successorRecovery: {
			async resume() {
				recoveryCalls += 1;
				return {
					handled: true,
					ok: true,
					scheduled: true,
					reason: "terminal_successor_resumed",
					record: { terminalKey: "terminal-one", state: "issued" }
				};
			}
		}
	});
	assert.equal(recoveryCalls, 1);
	assert.equal(result.terminalSuccessorRecovery, true);
	assert.equal(result.recoveryOk, true);
	assert.equal(result.scheduled, true);
	assert.equal(fake.dispatchCount(), 0);
});
