//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Admission = require("../tools/fs/mission/autoContinuation/admissionHealth.js");
const State = require("../tools/fs/mission/autoContinuation/state.js");
const SessionStore = require("../tools/fs/mission/agentSessionStore.js");

/**
 * @file Proves pool coexistence and ghost successor recovery against persisted state.
 * @description The Awtsmoos lets three bounded successors coexist while an unjoined invitation
 * ages into retryable failure; a real session witness upgrades pending admission to running.
 */
function identity(slot, fingerprint = `fp_${slot}`) {
	return {
		missionId: "mission_hardening",
		fingerprint,
		poolSlot: slot,
		poolRole: `role_${slot}`,
		spawnGroupId: `spawn_${slot}`,
		predecessorGeneration: 1,
		successorGeneration: 2,
		generation: 2,
		successorAgentId: `agent:successor:${slot}`,
		successorAgentSessionId: `session_successor_${slot}`
	};
}

async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-admission-hardening-"));
	const config = { root };
	try {
		const admitted = [];
		for (let slot = 1; slot <= 3; slot += 1) {
			const acquired = State.acquire(config, identity(slot), {
				owner: `owner_${slot}`,
				now: 1000
			});
			assert.equal(acquired.ok, true, `pool slot ${slot}`);
			admitted.push(State.mark(config, acquired.record, "accepted", {
				acceptedAt: new Date(1000).toISOString()
			}));
		}
		assert.equal(State.list(config, "mission_hardening").filter(State.pooled).length, 3);
		const ordinaryA = State.acquire(config, identity(0, "ordinary_a"), {
			owner: "ordinary_a",
			now: 2000
		});
		assert.equal(ordinaryA.ok, true);
		State.mark(config, ordinaryA.record, "accepted", {
			acceptedAt: new Date(2000).toISOString()
		});
		const ordinaryB = State.acquire(config, identity(0, "ordinary_b"), {
			owner: "ordinary_b",
			now: 3000
		});
		assert.equal(ordinaryB.ok, false);
		assert.equal(ordinaryB.reason, "mission_continuation_active");
		const timedOut = await Admission.reconcile(
			config,
			State,
			admitted[0],
			identity(1),
			{ now: 300000, admissionTimeoutMs: 15000 }
		);
		assert.equal(timedOut.timedOut, true);
		assert.equal(timedOut.record.status, "failed");
		assert.equal(timedOut.record.lastError, "successor_admission_timeout");
		await SessionStore.save(config, {
			id: "session_successor_2",
			logicalAgentId: "agent:successor:2",
			activeMissionId: "mission_hardening",
			status: "active",
			startedAt: new Date(1500).toISOString(),
			lastSeenAt: new Date(4000).toISOString()
		});
		const joined = await Admission.reconcile(
			config,
			State,
			admitted[1],
			identity(2),
			{ now: 5000, admissionTimeoutMs: 15000 }
		);
		assert.equal(joined.joined, true);
		assert.equal(joined.record.status, "running");
		assert.equal(joined.record.joinedSessionId, "session_successor_2");
		console.log(JSON.stringify({ ok: true, suite: "continuation-admission-hardening" }));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
