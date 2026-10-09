// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const PrimaryGuardian = require("../recovery/lanes/primaryGuardian.js");

/** Proves recovery waits for sustained process or registration failure. */
function harness(statuses, repairResult = { ok: true }) {
	let index = 0;
	let repairs = 0;
	return {
		guardian: {
			status: () => statuses[Math.min(index++, statuses.length - 1)],
			replace: () => { repairs += 1; return repairResult; }
		},
		repairs: () => repairs
	};
}

const processUp = () => ({ ok: true, installRoot: "/tmp/root", process: { ok: true } });
const processDown = () => ({ ok: true, installRoot: "/tmp/root", process: { ok: false } });
const fresh = () => ({ ok: true, reason: "registered_fresh" });
const stale = () => ({ ok: false, reason: "registration_stale" });

function create(fake, probe = fresh, options = {}) {
	return PrimaryGuardian.create({
		guardian: fake.guardian,
		registrationProbe: probe,
		minimumFailures: options.minimumFailures || 3,
		repairCooldownMs: options.repairCooldownMs || 10000
	});
}

test("healthy process with fresh registration never repairs", () => {
	const fake = harness([processUp()]);
	assert.equal(create(fake).tick(1000).state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("transient process failure recovers without repair", () => {
	const fake = harness([processDown(), processDown(), processUp()]);
	const guardian = create(fake);
	assert.equal(guardian.tick(1000).failureKind, "process");
	assert.equal(guardian.tick(2000).state, "confirming_failure");
	assert.equal(guardian.tick(3000).state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("sustained process failure repairs once", () => {
	const fake = harness([processDown()]);
	const guardian = create(fake);
	guardian.tick(1000);
	guardian.tick(2000);
	assert.equal(guardian.tick(3000).state, "repair_started");
	assert.equal(fake.repairs(), 1);
});

test("transient registration loss recovers without repair", () => {
	const fake = harness([processUp()]);
	let probes = 0;
	const guardian = create(fake, () => ++probes < 3 ? stale() : fresh());
	assert.equal(guardian.tick(1000).failureKind, "registration");
	assert.equal(guardian.tick(2000).state, "confirming_failure");
	assert.equal(guardian.tick(3000).state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("sustained stale registration repairs a living process", () => {
	const fake = harness([processUp()]);
	const guardian = create(fake, stale);
	guardian.tick(1000);
	guardian.tick(2000);
	const result = guardian.tick(3000);
	assert.equal(result.state, "repair_started");
	assert.equal(result.failureKind, "registration");
	assert.equal(fake.repairs(), 1);
});

test("live child registration startup never accumulates failures or triggers repair", () => {
	const fake = harness([processUp()]);
	const states = [
		{ ok: false, reason: "receipt_missing" },
		{ ok: false, reason: "not_registered", state: "registration_pending" },
		{ ok: false, reason: "receipt_missing" },
		fresh()
	];
	let probes = 0;
	const guardian = create(fake, () => states[Math.min(probes++, states.length - 1)]);
	assert.equal(guardian.tick(1000).state, "registration_starting");
	assert.equal(guardian.tick(2000).state, "registration_starting");
	assert.equal(guardian.tick(3000).state, "registration_starting");
	assert.equal(guardian.tick(4000).state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("fresh connecting agent survives repeated guardian checks without destructive repair", () => {
	const fake = harness([processUp()]);
	const guardian = create(fake, () => ({ ok: false, reason: "not_registered", state: "connecting", freshnessKnown: true, ageMs: 5000, staleMs: 60000 }));
	for (let i = 0; i < 30; i++) assert.equal(guardian.tick(i * 5000 + 1000).state, "registration_starting");
	assert.equal(fake.repairs(), 0);
});

test("stale connecting agent eventually permits bounded recovery", () => {
	const fake = harness([processUp()]);
	const guardian = create(fake, () => ({ ok: false, reason: "not_registered", state: "connecting", freshnessKnown: true, ageMs: 180000, staleMs: 60000 }));
	guardian.tick(1000); guardian.tick(2000);
	assert.equal(guardian.tick(3000).state, "repair_started");
	assert.equal(fake.repairs(), 1);
});

test("failed repairs obey cooldown", () => {
	const fake = harness([processUp()], { ok: false, error: "repair_failed" });
	const guardian = create(fake, stale, { minimumFailures: 1, repairCooldownMs: 10000 });
	assert.equal(guardian.tick(1000).state, "repair_failed");
	assert.equal(guardian.tick(2000).state, "repair_cooldown");
	assert.equal(fake.repairs(), 1);
});

test("missing service never repairs", () => {
	const fake = harness([{ ok: false, process: { ok: false } }]);
	assert.equal(create(fake).tick(1000).state, "service_missing");
	assert.equal(fake.repairs(), 0);
});
