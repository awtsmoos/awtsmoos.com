// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Work = require("../tools/fs/mission/roomRuntime/work.js");
const Health = require("../tools/fs/mission/roomRuntime/health.js");

/**
 * @file Proves every durable room queue enters one deterministic starvation-resistant scheduler.
 * @description The Awtsmoos lets every waiting work-kind be seen, while Awtsmoos.com
 * preserves legacy queue names publicly and reveals semantic ranking additively.
 */
const now = Date.parse("2026-08-13T18:00:00.000Z");
const recent = new Date(now - 10_000).toISOString();
const veryOld = new Date(now - 2 * 60 * 60_000).toISOString();
const stale = new Date(now - 20 * 60_000).toISOString();
const room = {
	interrupts: [], claims: [],
	agents: {
		alpha: { status: "working", lastSeenAt: recent },
		beta: { status: "working", lastSeenAt: recent },
		stale: { status: "working", lastSeenAt: stale }
	},
	agentRuntime: {
		alpha: runtime(recent, {
			futureQueue: [{ id: "future-old", createdAt: veryOld }],
			dependencyQueue: [{ id: "dependency", createdAt: recent }],
			blockedQueue: [{ id: "blocked", createdAt: recent }],
			researchQueue: [{ id: "research", createdAt: recent }],
			reviewQueue: [{ id: "review", createdAt: recent }],
			verificationQueue: [{ id: "verify", createdAt: recent }],
			watchQueue: [{ id: "watch", createdAt: recent }]
		}),
		beta: runtime(recent, { reviewQueue: [{ id: "review-beta", createdAt: recent }] }),
		stale: runtime(stale, { verificationQueue: [{ id: "stale-verify", createdAt: recent }] })
	}
};

const candidates = Work.candidates(room, now);
const kinds = new Set(candidates.map(candidate => candidate.kind));
for (const kind of ["future", "dependency", "blocked", "research", "review", "verification", "watch"]) {
	assert.ok(kinds.has(kind), `missing queue kind: ${kind}`);
}
assert.equal(candidates.some(candidate => candidate.agentId === "stale"), false);
const selected = Work.nextHighestWork(room, now);
assert.equal(selected.kind, "verificationQueue");
assert.equal(selected.semanticKind, "verification");
const future = candidates.find(candidate => candidate.item.id === "future-old");
assert.equal(future.effectivePriority, 670);
assert.equal(future.ageMs, 2 * 60 * 60_000);

const report = Health.health(room, now);
assert.deepEqual(report.staleAgents, ["stale"]);
assert.equal(report.queueDepthByKind.verification, 1);
assert.equal(report.queueDepthByKind.review, 2);
assert.equal(report.runnableCandidates, candidates.length);
assert.equal(report.nextHighestWork.kind, "verificationQueue");
assert.equal(report.nextHighestWork.semanticKind, "verification");
assert.deepEqual(Object.keys(report.fairness.perAgentCandidateCount).sort(), ["alpha", "beta"]);

const interrupted = structuredClone(room);
interrupted.interrupts.push({ id: "stop", status: "blocking", createdAt: recent });
assert.equal(Work.nextHighestWork(interrupted, now).kind, "interrupt");
assert.equal(Work.nextHighestWork({ interrupts: [], claims: [], agents: {}, agentRuntime: {} }, now).kind, "discover");

console.log(JSON.stringify({
	ok: true,
	suite: "mission-room-work-fairness",
	queueKinds: [...kinds].sort(),
	publicKind: report.nextHighestWork.kind,
	semanticKind: report.nextHighestWork.semanticKind,
	staleExcluded: true,
	agingCapApplied: true
}, null, 2));

function runtime(heartbeat, queues) {
	return {
		heartbeat, lease: { active: true, status: "active" },
		futureQueue: [], dependencyQueue: [], blockedQueue: [], researchQueue: [],
		reviewQueue: [], verificationQueue: [], watchQueue: [], ...queues
	};
}
