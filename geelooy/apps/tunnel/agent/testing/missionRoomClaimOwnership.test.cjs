// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Claims = require("../tools/fs/mission/roomClaims.js");
const Work = require("../tools/fs/mission/roomRuntime/work.js");

/**
 * @file Proves claim reuse, conflict, expiry cleanup, takeover, and peer-claim isolation.
 * @description The Awtsmoos leaves one living ownership witness per task; Awtsmoos.com
 * supersedes expired testimony before replacement and never schedules it as normal owner work.
 */
const now = "2026-08-13T18:00:00.000Z";
const recent = "2026-08-13T17:59:50.000Z";
let idCounter = 0;
const env = {
	RoomState: {
		agentId: input => String(input.agentId || ""),
		id: prefix => `${prefix}_${++idCounter}`,
		list: value => Array.isArray(value) ? value : [],
		now: () => now,
		text: value => String(value || "").trim()
	}
};
const room = roomFixture();
const first = Claims.claimTask(room, { agentId: "alpha", taskId: "task-1" }, env);
assert.equal(first.status, "active");
assert.equal(room.claims.length, 1);
assert.equal(room.agents.alpha.currentClaim.id, first.id);
assert.equal(room.agentRuntime.alpha.currentClaim.id, first.id);

const reused = Claims.claimTask(room, { agentId: "alpha", taskId: "task-1" }, env);
assert.equal(reused.reused, true);
assert.equal(reused.id, first.id);
assert.equal(room.claims.length, 1);

const conflict = Claims.claimTask(room, { agentId: "beta", taskId: "task-1" }, env);
assert.equal(conflict.ok, false);
assert.equal(conflict.conflict, true);
assert.equal(conflict.ownerAgentId, "alpha");
assert.equal(room.claims.length, 1);

first.expiresAt = "2026-08-13T17:59:59.000Z";
const takeover = Claims.claimTask(room, { agentId: "beta", taskId: "task-1" }, env);
assert.equal(takeover.takeover, true);
assert.equal(takeover.replacesClaimId, first.id);
assert.equal(first.status, "superseded");
assert.equal(room.claims.filter(claim => claim.status === "active").length, 1);
assert.equal(room.agents.alpha.currentClaim, null);
assert.equal(room.agents.beta.currentClaim.id, takeover.id);

const ownExpiryRoom = roomFixture();
const ownFirst = Claims.claimTask(ownExpiryRoom, { agentId: "alpha", taskId: "task-1" }, env);
ownFirst.expiresAt = "2026-08-13T17:59:59.000Z";
const ownReplacement = Claims.claimTask(ownExpiryRoom, { agentId: "alpha", taskId: "task-1" }, env);
assert.equal(ownReplacement.takeover, true);
assert.equal(ownReplacement.replacesClaimId, ownFirst.id);
assert.equal(ownFirst.status, "superseded");
assert.equal(ownExpiryRoom.claims.filter(claim => claim.status === "active").length, 1);

const expiredSchedulerRoom = roomFixture();
expiredSchedulerRoom.claims.push({
	id: "expired-scheduler", status: "active", agentId: "alpha",
	taskId: "scheduler-task", title: "Expired scheduler claim",
	expiresAt: "2026-08-13T17:59:59.000Z"
});
const expiredCandidate = Work.candidates(expiredSchedulerRoom, Date.parse(now))
	.find(candidate => candidate.item.id === "expired-scheduler");
assert.equal(expiredCandidate.kind, "claim_takeover");
assert.equal(expiredCandidate.runnable, false);
assert.equal(Claims.claimExpired({ status: "active" }, now), false);

const loopSource = fs.readFileSync(path.join(__dirname, "../tools/fs/mission/roomLoop/work.js"), "utf8");
assert.match(loopSource, /Claims\.claimForAgent\(room, agentId\)/);
assert.doesNotMatch(loopSource, /room\.claims\.find\(item => item\.status === "active"\)/);
console.log(JSON.stringify({
	ok: true,
	suite: "mission-room-claim-ownership",
	reused: true,
	conflictBlocked: true,
	peerTakeover: true,
	ownExpirySuperseded: true,
	expiredSchedulerClaimNonRunnable: true,
	peerClaimLeakageRemoved: true
}, null, 2));

function roomFixture() {
	return {
		claims: [],
		agents: {
			alpha: { status: "working", lastSeenAt: recent },
			beta: { status: "working", lastSeenAt: recent }
		},
		agentRuntime: {
			alpha: runtime(recent),
			beta: runtime(recent)
		},
		splitProposals: [{
			id: "split",
			tasks: [{ id: "task-1", title: "Own the task", agentId: "alpha", files: ["a.js"], status: "open" }]
		}]
	};
}
function runtime(heartbeat) {
	return {
		heartbeat,
		lease: { active: true, status: "active" },
		futureQueue: [], dependencyQueue: [], blockedQueue: [], researchQueue: [],
		reviewQueue: [], verificationQueue: [], watchQueue: []
	};
}