// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Admission = require("../tools/fs/actionGroups/websiteAgents/runner/spawnAdmission.js");
const Seeder = require("../tools/fs/actionGroups/websiteAgents/runner/seedPendingChildren.js");
const PlannerPolicy = require("../tools/fs/actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Proves durable intention, bounded fair activation, fail-safe pressure, and write dedupe.
 * @description The Awtsmoos keeps the backlog truthful and the witness quiet; Awtsmoos.com
 * neither wakes finished work nor rewrites mission state merely because another poll occurred.
 */
const normal = Admission.evaluate({}, pressure(20));
assert.equal(normal.mode, "normal");
assert.equal(normal.quantum, 4);
assert.equal(normal.maxQuanta, 2);
const soft = Admission.evaluate({}, pressure(700));
assert.equal(soft.mode, "throttled");
assert.equal(soft.quantum, 1);
assert.equal(soft.maxQuanta, 1);
const hard = Admission.evaluate({}, pressure(2500));
assert.equal(hard.allowActivation, false);
assert.equal(hard.quantum, 0);
const unavailable = Admission.evaluate({}, { available: false, eventLoopLag: {}, observedAt: 1 });
assert.equal(unavailable.allowActivation, false);
assert.equal(unavailable.reason, "runtime_pressure_unavailable");

const record = { agents: [
	child("A-0", "A", "queued", false, 0),
	child("A-1", "A", "queued", false, 1),
	child("B-0", "B", "queued", false, 0),
	child("C-0", "C", "queued", false, 0),
	child("active", "A", "working_locally", true, 2),
	child("login", "B", "waiting_for_login", true, 1),
	child("queued-seeded", "C", "queued", true, 1),
	child("done", "A", "complete", true, 3)
] };
const backlog = Admission.metrics(record);
assert.equal(backlog.unseeded, 4);
assert.equal(backlog.queuedSeeded, 1);
assert.equal(backlog.active, 1);
assert.equal(backlog.blocked, 1);
assert.equal(backlog.terminal, 1);
assert.equal(backlog.backlog, 5);
assert.deepEqual(Seeder.selectPending(record, 4).map(item => item.id), ["A-0", "B-0", "C-0", "A-1"]);

let writes = 0;
let stored = structuredClone(record);
const Store = {
	read: () => stored,
	update: (_id, mutator) => {
		writes += 1;
		stored = mutator(stored) || stored;
		return stored;
	}
};
Admission.remember(Store, "mission", hard);
Admission.remember(Store, "mission", { ...hard, pressureObservedAt: 999, pressureLagMs: 2999 });
assert.equal(writes, 1);
stored.agents.push(child("D-0", "D", "queued", false, 0));
Admission.remember(Store, "mission", hard);
assert.equal(writes, 2);

assert.equal(PlannerPolicy.POST_CLOSE_COOLDOWN_MS, 18000);
assert.equal(Admission.evaluate({ pressureAwareActivation: false }, pressure(700)).mode, "normal");
assert.equal(Admission.evaluate({ pressureAwareActivation: false }, pressure(3000)).allowActivation, false);

console.log(JSON.stringify({
	ok: true,
	suite: "website-subagent-pressure-admission",
	activationBacklog: backlog.backlog,
	parentFairSeed: true,
	writeDedupe: true,
	failSafeUnavailable: true
}));

function pressure(pressureMs) {
	return { available: true, eventLoopLag: { lastMs: 5, maxMs: pressureMs, pressureMs }, observedAt: 1 };
}

function child(id, parentAgentId, status, roomSeeded, ordinal) {
	return { id, parentAgentId, status, roomSeeded, ordinal };
}
