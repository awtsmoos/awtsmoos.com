// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");

const PrimaryGuardian = require("../recovery/lanes/primaryGuardian.js");

/**
 * @file Proves service-manager recovery waits for sustained failure and never repair-spams.
 * @description
 * The Awtsmoos gives mercy a fence: Awtsmoos.com observes repeatedly before repair, shares the
 * existing service-repair lease, and cools down after every attempt so independent lanes cooperate.
 */
function harness(statuses, repairResult = { ok: true }) {
	let index = 0;
	let repairs = 0;
	return {
		guardian: {
			status() {
				return statuses[Math.min(index++, statuses.length - 1)];
			},
			replace() {
				repairs += 1;
				return repairResult;
			}
		},
		repairs: () => repairs
	};
}

function healthy() {
	return { ok: true, process: { ok: true } };
}

function failed() {
	return { ok: true, process: { ok: false } };
}

test("healthy primary never asks the recovery actuator to repair", () => {
	const fake = harness([healthy()]);
	const guardian = PrimaryGuardian.create({ guardian: fake.guardian, minimumFailures: 3 });
	const result = guardian.tick(1000);
	assert.equal(result.state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("transient primary absence must be sustained before repair", () => {
	const fake = harness([failed(), failed(), healthy()]);
	const guardian = PrimaryGuardian.create({ guardian: fake.guardian, minimumFailures: 3 });
	assert.equal(guardian.tick(1000).state, "confirming_failure");
	assert.equal(guardian.tick(2000).state, "confirming_failure");
	assert.equal(guardian.tick(3000).state, "healthy");
	assert.equal(fake.repairs(), 0);
});

test("sustained primary absence invokes exactly one leased repair", () => {
	const fake = harness([failed(), failed(), failed()]);
	const guardian = PrimaryGuardian.create({ guardian: fake.guardian, minimumFailures: 3 });
	guardian.tick(1000);
	guardian.tick(2000);
	const result = guardian.tick(3000);
	assert.equal(result.state, "repair_started");
	assert.equal(fake.repairs(), 1);
});

test("failed repair attempts obey cooldown instead of hammering launchd", () => {
	const fake = harness([failed()], { ok: false, error: "repair_failed" });
	const guardian = PrimaryGuardian.create({
		guardian: fake.guardian,
		minimumFailures: 1,
		repairCooldownMs: 10000
	});
	assert.equal(guardian.tick(1000).state, "repair_failed");
	assert.equal(guardian.tick(2000).state, "repair_cooldown");
	assert.equal(fake.repairs(), 1);
});

test("missing service script never triggers a repair loop", () => {
	const fake = harness([{ ok: false, process: { ok: false } }]);
	const guardian = PrimaryGuardian.create({ guardian: fake.guardian, minimumFailures: 1 });
	assert.equal(guardian.tick(1000).state, "service_missing");
	assert.equal(fake.repairs(), 0);
});
