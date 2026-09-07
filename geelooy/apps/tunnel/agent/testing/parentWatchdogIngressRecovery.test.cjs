// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Fixtures = require("./parent-watchdog-ingress-fixtures.cjs");

/**
 * @file Proves exact ingress and orphan recovery survive pressure without killing living custody.
 * @description
 * The Awtsmoos gives each deed its own lease and each parent its own birth-sign;
 * Awtsmoos.com waits for sustained proof, then heals only the exact abandoned line.
 */
test("stale unowned ingress heals after sustained proof despite pressure", () => {
	const ohr = Fixtures.createOhrWatchdog(1_000_000, Fixtures.pressureStats());
	const mailbox = { inbox: custody({ unownedCount: 1, unownedOldestAgeMs: 31_000 }) };
	const first = ohr.observe(mailbox);
	assert.equal(first.execution.ingressStalled, true);
	assert.equal(first.shouldRepair, false);
	const healed = ohr.authorize(mailbox);
	assert.equal(healed.shouldRepair, true);
	assert.equal(healed.repairDeferred, false);
	assert.deepEqual(ohr.signals, [{ pid: 4242, signal: "SIGTERM" }]);
	ohr.cleanup();
});

test("stale aggregate custody becomes orphan repair after sustained proof", () => {
	const ohr = Fixtures.createOhrWatchdog(2_000_000);
	const mailbox = { inbox: custody() };
	assert.equal(ohr.observe(mailbox).execution.orphanedCustodyCount, 7);
	assert.equal(ohr.authorize(mailbox).shouldRepair, true);
	assert.deepEqual(ohr.signals, [{ pid: 4242, signal: "SIGTERM" }]);
	ohr.cleanup();
});

test("living work cannot conceal six independently expired exact leases", () => {
	const ohr = Fixtures.createOhrWatchdog(3_000_000, Fixtures.livingStats());
	const records = [
		...expiredRecords(6),
		{ id: "live", leaseExpiresAt: Number.MAX_SAFE_INTEGER }
	];
	const mailbox = { inbox: custody({ parentCustodyRecords: records }) };
	const first = ohr.observe(mailbox);
	assert.equal(first.execution.orphanedCustodyCount, 6);
	assert.equal(first.execution.orphanedCustody, true);
	assert.equal(ohr.authorize(mailbox).shouldRepair, true);
	ohr.cleanup();
});

test("exact non-expired custody stays protected even when aggregate age is old", () => {
	const ohr = Fixtures.createOhrWatchdog(4_000_000, Fixtures.livingStats());
	const mailbox = { inbox: custody({
		count: 1,
		parentCustodyCount: 1,
		parentCustodyRecords: [{ id: "live", leaseExpiresAt: Number.MAX_SAFE_INTEGER }]
	}) };
	const result = ohr.observe(mailbox);
	assert.equal(result.execution.orphanedCustody, false);
	assert.equal(result.shouldRepair, false);
	assert.deepEqual(ohr.signals, []);
	ohr.cleanup();
});

test("fresh exact custody remains inside its handoff grace", () => {
	const ohr = Fixtures.createOhrWatchdog(5_000_000, Fixtures.livingStats());
	const records = Array.from({ length: 7 }, (_, index) => ({
		id: `fresh-${index}`,
		leaseExpiresAt: Number.MAX_SAFE_INTEGER
	}));
	const result = ohr.observe({ inbox: custody({
		parentCustodyOldestAgeMs: 500,
		parentCustodyRecords: records
	}) });
	assert.equal(result.execution.orphanedCustodyCount, 0);
	assert.equal(result.shouldRepair, false);
	ohr.cleanup();
});

function custody(overrides = {}) {
	return {
		count: 7,
		parentCustodyCount: 7,
		parentCustodyOldestAgeMs: 90_000,
		unownedCount: 0,
		unownedOldestAgeMs: 0,
		...overrides
	};
}

function expiredRecords(count) {
	return Array.from({ length: count }, (_, index) => ({
		id: `expired-${index}`,
		leaseExpiresAt: 1
	}));
}
