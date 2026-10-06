// B"H
const test = require("node:test");
const assert = require("node:assert");

/**
 * B"H
 * Harness for the promotion ownership lifecycle and supervisor classification:
 * simulated process tables and recovery states, asserting correct
 * classification plus healthy/unhealthy verdicts.
 *
 * Bug A: a stale connection vessel at promotion time must be an anomaly,
 * never a routine cleanup step; the handoff is predecessor → candidate →
 * promoted-owner → predecessor-retired, recorded in the recovery state.
 * Bug B: the installer must classify every supervisor it sees and only
 * declare healthy on a clean classification — the banner shows roles,
 * never a bare count.
 */

const Policy = require("../lib/runtime/boot-resume-policy.js");
const Registration = require("../lib/runtime/main-registration.js");

function promotedJournal() {
	const recoveryState = {};
	Policy.recordPromotionTransition(recoveryState, {
		from: "predecessor", to: "candidate", pid: 200, replacedPid: 100, reason: "t"
	});
	Policy.recordPromotionTransition(recoveryState, {
		from: "candidate", to: "promoted-owner", pid: 200, replacedPid: 100, reason: "t"
	});
	return recoveryState;
}

test("lifecycle records predecessor → candidate → promoted-owner → predecessor-retired in order", () => {
	const recoveryState = {};
	assert.equal(Policy.recordPromotionTransition(recoveryState, {
		from: "predecessor", to: "candidate", pid: 200, replacedPid: 100, reason: "candidate_registered"
	}).ok, true);
	assert.equal(Policy.recordPromotionTransition(recoveryState, {
		from: "candidate", to: "promoted-owner", pid: 200, replacedPid: 100, reason: "candidate_promoted"
	}).ok, true);
	assert.equal(Policy.finalizePredecessorRetirement(recoveryState, { predecessorPid: 100 }).ok, true);
	const state = Policy.promotionOwnershipState(recoveryState);
	assert.equal(state.journal.length, 3);
	assert.deepEqual(state.journal.map(e => e.to), ["candidate", "promoted-owner", "predecessor-retired"]);
	assert.equal(state.current, "predecessor-retired");
	assert.equal(state.currentOwnerPid, 200);
	assert.equal(state.anomalies.length, 0);
});

test("out-of-order transition is an anomaly and leaves the journal untouched", () => {
	const recoveryState = {};
	const result = Policy.recordPromotionTransition(recoveryState, {
		from: "predecessor", to: "promoted-owner", pid: 200, reason: "skip"
	});
	assert.equal(result.ok, false);
	assert.equal(result.anomaly.kind, "promotion_transition_out_of_order");
	assert.equal(result.anomaly.severity, "anomaly");
	assert.equal(Policy.promotionOwnershipState(recoveryState).journal.length, 0);
	assert.equal(Policy.promotionOwnershipState(recoveryState).anomalies.length, 1);
});

test("finalizing retirement before promotion is an anomaly", () => {
	const recoveryState = {};
	const result = Policy.finalizePredecessorRetirement(recoveryState, { predecessorPid: 100 });
	assert.equal(result.ok, false);
	assert.equal(result.anomaly.kind, "predecessor_retirement_without_promotion");
});

test("promotion asserts the expected single owner and journals the handoff", () => {
	const recoveryState = {};
	const result = Registration.promoteCandidateOwnership(recoveryState, {
		candidatePid: 200, predecessorPid: 100, observedOwnerPids: [200]
	});
	assert.equal(result.ok, true);
	assert.equal(result.ownerPid, 200);
	const state = Policy.promotionOwnershipState(recoveryState);
	assert.deepEqual(state.journal.map(e => e.from + "->" + e.to),
		["predecessor->candidate", "candidate->promoted-owner"]);
	assert.equal(state.currentOwnerPid, 200);
	assert.equal(state.anomalies.length, 0);
});

test("a stale vessel at promotion time is an anomaly, never a routine cleanup", () => {
	const recoveryState = {};
	const result = Registration.promoteCandidateOwnership(recoveryState, {
		candidatePid: 200, predecessorPid: 100, observedOwnerPids: [200, 999]
	});
	assert.equal(result.ok, false);
	assert.equal(result.anomaly.kind, "promotion_owner_violation");
	assert.equal(result.anomaly.severity, "anomaly");
	assert.notEqual(result.anomaly.severity, "routine");
	assert.deepEqual(result.anomaly.observedOwnerPids, [200, 999]);
	assert.equal(result.event.severity, "anomaly");
	assert.equal(result.event.category, "process");
	const state = Policy.promotionOwnershipState(recoveryState);
	assert.deepEqual(state.journal.map(e => e.to), ["candidate"]);
	assert.equal(state.current, "candidate");
	assert.equal(state.anomalies.length, 1);
});

test("promotion with no observed owner is an anomaly, not a silent pass", () => {
	const recoveryState = {};
	const result = Registration.promoteCandidateOwnership(recoveryState, {
		candidatePid: 200, predecessorPid: 100, observedOwnerPids: []
	});
	assert.equal(result.ok, false);
	assert.equal(result.anomaly.kind, "promotion_owner_violation");
});

test("classifySupervisors labels owner, retiring predecessor, candidate, stale duplicate", () => {
	const recoveryState = promotedJournal();
	const table = [
		{ pid: 200, command: "awtsmoos-supervisor.sh" },
		{ pid: 100, command: "awtsmoos-supervisor.sh" },
		{ pid: 300, command: "awtsmoos-supervisor.sh", registrationMode: "candidate-probe" },
		{ pid: 400, command: "awtsmoos-supervisor.sh" }
	];
	const classified = Policy.classifySupervisors(table, {
		expectedOwnerPid: 200,
		journal: Policy.promotionOwnershipState(recoveryState).journal
	});
	assert.deepEqual(classified.map(e => e.role), [
		"current-owner", "retiring-predecessor", "candidate", "stale-duplicate"
	]);
	assert.deepEqual(classified.map(e => e.pid), [200, 100, 300, 400]);
});

test("a retired predecessor is no longer classified as retiring", () => {
	const recoveryState = promotedJournal();
	Policy.finalizePredecessorRetirement(recoveryState, { predecessorPid: 100 });
	const classified = Policy.classifySupervisors(
		[{ pid: 200, command: "s" }, { pid: 100, command: "s" }],
		{ expectedOwnerPid: 200, journal: Policy.promotionOwnershipState(recoveryState).journal }
	);
	assert.deepEqual(classified.map(e => e.role), ["current-owner", "stale-duplicate"]);
});

test("verdict is healthy only with exactly one owner and zero unexplained", () => {
	const clean = [
		{ pid: 200, command: "s", role: "current-owner" },
		{ pid: 100, command: "s", role: "retiring-predecessor" },
		{ pid: 300, command: "s", role: "candidate" }
	];
	const cleanVerdict = Policy.supervisorHealthVerdict(clean);
	assert.equal(cleanVerdict.healthy, true);
	assert.equal(cleanVerdict.reasons.length, 0);

	const stale = clean.concat([{ pid: 400, command: "s", role: "stale-duplicate" }]);
	const staleVerdict = Policy.supervisorHealthVerdict(stale);
	assert.equal(staleVerdict.healthy, false);
	assert.ok(staleVerdict.reasons.some(r => r.includes("stale-duplicate")));

	const twoOwners = clean.concat([{ pid: 500, command: "s", role: "current-owner" }]);
	assert.equal(Policy.supervisorHealthVerdict(twoOwners).healthy, false);

	const noOwner = [{ pid: 400, command: "s", role: "stale-duplicate" }];
	const noOwnerVerdict = Policy.supervisorHealthVerdict(noOwner);
	assert.equal(noOwnerVerdict.healthy, false);
	assert.ok(noOwnerVerdict.reasons.some(r => r.includes("exactly one current-owner")));
});

test("installer banner shows the classification, not a bare count", () => {
	const classified = [
		{ pid: 200, command: "s", role: "current-owner" },
		{ pid: 100, command: "s", role: "retiring-predecessor" }
	];
	const banner = Policy.installerSupervisorBanner(classified);
	assert.ok(banner.includes("current-owner:200"));
	assert.ok(banner.includes("retiring-predecessor:100"));
	assert.ok(banner.includes("verdict=healthy"));
	assert.ok(!/supervisors=\d+\b/.test(banner));

	const bad = classified.concat([{ pid: 400, command: "s", role: "stale-duplicate" }]);
	const badBanner = Policy.installerSupervisorBanner(bad);
	assert.ok(badBanner.includes("stale-duplicate:400"));
	assert.ok(badBanner.includes("verdict=unhealthy"));
	assert.ok(badBanner.includes("reasons="));
});
