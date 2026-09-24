//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Ledger = require("./parent-consumer-repair-ledger.js");
const Repair = require("./parent-watchdog-repair.js");

/**
 * @file Proves phantom repair claims refund budget while proven repairs keep counting.
 * @description
 * The Awtsmoos spends Gevurah only for force that truly went out to heal;
 * Awtsmoos.com unremembers a claim whose repair never executed, yet a proven
 * repair still consumes the bounded budget and an unsettled claim still guards the storm.
 */

const identity = {
	parentPid: 4321,
	generation: 7,
	processGroupId: 4321,
	birthToken: "parent-birth-a",
	platform: "darwin"
};

function makeLedger(overrides = {}) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-ledger-settle-"));
	const file = path.join(root, "repair.json");
	let now = 100000;
	const ledger = Ledger.create({
		file,
		now: () => now,
		cooldownMs: 10000,
		windowMs: 60000,
		maxRepairs: 2,
		...overrides
	});
	return {
		ledger,
		file,
		root,
		get now() { return now; },
		setNow(value) { now = value; }
	};
}

function destroy(t) {
	fs.rmSync(t.root, { recursive: true, force: true });
}

function readFileJson(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Phantom settle removes the claim and fully restores the budget.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(first.allowed, true);
		assert.equal(typeof first.claimId, "string");
		assert.ok(first.claimId.length > 0);

		const settled = t.ledger.settle(first.claimId, "phantom");
		assert.equal(settled.settled, true);
		assert.equal(settled.outcome, "phantom");
		assert.equal(settled.claimId, first.claimId);

		const after = t.ledger.status();
		assert.equal(after.history.length, 0);
		assert.equal(after.claimedCount, 0);
		assert.equal(after.provenCount, 0);
		assert.equal(after.lastRepairAt, 0);

		// Budget fully restored: maxRepairs fresh claims are all allowed.
		const one = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(one.allowed, true);
		t.setNow(t.now + 10000);
		const two = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(two.allowed, true);
		t.setNow(t.now + 10000);
		const three = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(three.allowed, false);
		assert.equal(three.reason, "repair_rate_limited");
		assert.equal(three.claimId, null);
	} finally {
		destroy(t);
	}
}

// Proven settle keeps consuming the budget.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		const settled = t.ledger.settle(first.claimId, "proven");
		assert.equal(settled.settled, true);
		assert.equal(settled.outcome, "proven");

		const after = t.ledger.status();
		assert.equal(after.history.length, 1);
		assert.equal(after.claimedCount, 0);
		assert.equal(after.provenCount, 1);
		assert.equal(after.history[0].state, "proven");
		assert.equal(after.history[0].claimId, first.claimId);

		t.setNow(t.now + 10000);
		const second = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(second.allowed, true);
		t.ledger.settle(second.claimId, "proven");
		t.setNow(t.now + 10000);
		const third = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(third.allowed, false);
		assert.equal(third.reason, "repair_rate_limited");
	} finally {
		destroy(t);
	}
}

// Settling an unknown claim id is a no-op and never touches the ledger.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		const before = fs.readFileSync(t.file, "utf8");
		const unknown = t.ledger.settle("claim-that-never-existed", "proven");
		assert.equal(unknown.settled, false);
		assert.equal(fs.readFileSync(t.file, "utf8"), before);
		assert.equal(t.ledger.settle("", "phantom").settled, false);
		assert.equal(t.ledger.settle(null, "phantom").settled, false);
		assert.equal(t.ledger.settle(first.claimId, "bogus-outcome").settled, false);
		assert.equal(fs.readFileSync(t.file, "utf8"), before);
	} finally {
		destroy(t);
	}
}

// Settling twice is a no-op: the second settle changes nothing.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(t.ledger.settle(first.claimId, "proven").settled, true);
		const before = fs.readFileSync(t.file, "utf8");
		const again = t.ledger.settle(first.claimId, "proven");
		assert.equal(again.settled, false);
		assert.equal(again.reason, "already_settled");
		assert.equal(fs.readFileSync(t.file, "utf8"), before);
		assert.equal(t.ledger.status().provenCount, 1);
	} finally {
		destroy(t);
	}
}

// A phantom refund recomputes lastRepairAt so the cooldown is not extended.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(first.allowed, true);
		t.setNow(t.now + 10000);
		const second = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(second.allowed, true);
		assert.equal(t.ledger.status().lastRepairAt, t.now);

		assert.equal(t.ledger.settle(second.claimId, "phantom").settled, true);
		const after = t.ledger.status();
		assert.equal(after.lastRepairAt, 100000);
		assert.equal(after.history.length, 1);
		assert.equal(after.history[0].claimId, first.claimId);

		// Neither budget nor cooldown was burned: a fresh claim is allowed at once.
		const third = t.ledger.claim("execution_consumer_stalled", identity);
		assert.equal(third.allowed, true);
	} finally {
		destroy(t);
	}
}

// Legacy entries without state count as proven and are never downgraded.
{
	const t = makeLedger();
	try {
		const legacyAt = 50000;
		fs.writeFileSync(t.file, JSON.stringify({
			version: 1,
			lastRepairAt: legacyAt,
			history: [{ at: legacyAt, reason: "execution_consumer_stalled", identity }]
		}) + "\n");
		const reading = Ledger.create({
			file: t.file,
			now: () => 90000,
			cooldownMs: 10000,
			windowMs: 60000,
			maxRepairs: 1
		});
		const st = reading.status();
		assert.equal(st.history.length, 1);
		assert.equal(st.history[0].state, "proven");
		assert.equal(st.claimedCount, 0);
		assert.equal(st.provenCount, 1);
		assert.equal(typeof st.history[0].claimId, "string");

		const legacyId = st.history[0].claimId;
		const attempt = reading.settle(legacyId, "phantom");
		assert.equal(attempt.settled, false);
		assert.equal(attempt.reason, "already_settled");

		const denied = reading.claim("execution_consumer_stalled", identity);
		assert.equal(denied.allowed, false);
		assert.equal(denied.reason, "repair_rate_limited");
	} finally {
		destroy(t);
	}
}

// Claim ids are deterministic: a second handle on the same file settles the same claim.
{
	const t = makeLedger();
	try {
		const first = t.ledger.claim("execution_consumer_stalled", identity);
		const other = Ledger.create({
			file: t.file,
			now: () => 100000,
			cooldownMs: 10000,
			windowMs: 60000,
			maxRepairs: 2
		});
		assert.equal(other.status().history[0].claimId, first.claimId);
		assert.equal(other.settle(first.claimId, "proven").settled, true);
		assert.equal(readFileJson(t.file).history[0].state, "proven");
	} finally {
		destroy(t);
	}
}

// The watchdog reports whether the claimed repair truly executed.
function repairWith(overrides = {}) {
	const calls = [];
	const repair = Repair.create({
		parentPid: 4321,
		identity: { matches: () => true },
		requestChildRepair: () => true,
		signalParent: () => true,
		recordLifecycle: () => {},
		setTimer: () => ({ unref() {} }),
		clearTimer: () => {},
		onRepairSettled: (claimId, executed) => { calls.push([claimId, executed]); },
		...overrides
	});
	return { repair, calls };
}

{
	// Child-level repair dispatched.
	const { repair, calls } = repairWith();
	const ok = repair.request(
		"execution_consumer_stalled",
		{ allowed: true, identity: { parentPid: 1 }, claimId: "claim-1" }
	);
	assert.equal(ok, true);
	assert.deepEqual(calls, [["claim-1", true]]);
}

{
	// Identity mismatch: the repair never runs, so the claim is phantom.
	const { repair, calls } = repairWith({ identity: { matches: () => false } });
	const ok = repair.request(
		"execution_consumer_stalled",
		{ allowed: true, identity: { parentPid: 1 }, claimId: "claim-2" }
	);
	assert.equal(ok, false);
	assert.deepEqual(calls, [["claim-2", false]]);
}

{
	// Parent signal dispatched.
	const { repair, calls } = repairWith({ requestChildRepair: undefined });
	const ok = repair.request(
		"execution_parent_repair",
		{ allowed: true, identity: { parentPid: 1 }, claimId: "claim-3" }
	);
	assert.equal(ok, true);
	assert.deepEqual(calls, [["claim-3", true]]);
}

{
	// Signal threw: the repair never runs, so the claim is phantom.
	const { repair, calls } = repairWith({
		requestChildRepair: undefined,
		signalParent: () => { throw new Error("boom"); }
	});
	const ok = repair.request(
		"execution_parent_repair",
		{ allowed: true, identity: { parentPid: 1 }, claimId: "claim-4" }
	);
	assert.equal(ok, false);
	assert.deepEqual(calls, [["claim-4", false]]);
}

{
	// Already repairing: the second attempt never runs.
	const { repair, calls } = repairWith();
	assert.equal(repair.request(
		"execution_consumer_stalled",
		{ allowed: true, identity: {}, claimId: "claim-5a" }
	), true);
	assert.equal(repair.request(
		"execution_consumer_stalled",
		{ allowed: true, identity: {}, claimId: "claim-5b" }
	), false);
	assert.deepEqual(calls, [["claim-5a", true], ["claim-5b", false]]);
}

{
	// Without the hook, behavior is identical to today.
	const { repair, calls } = repairWith({ onRepairSettled: undefined });
	assert.equal(repair.request(
		"execution_consumer_stalled",
		{ allowed: true, identity: {}, claimId: "claim-6" }
	), true);
	assert.deepEqual(calls, []);
	const seen = [];
	const bare = Repair.create({
		parentPid: 4321,
		identity: { matches: () => true },
		requestChildRepair: () => true,
		signalParent: () => true,
		recordLifecycle: () => {},
		setTimer: () => ({ unref() {} }),
		clearTimer: () => {},
		onRepairSettled: (claimId, executed) => { seen.push([claimId, executed]); }
	});
	assert.equal(bare.request("execution_consumer_stalled", { allowed: true, identity: {} }), true);
	assert.deepEqual(seen, [[null, true]]);
}

console.log("BHY phantom repair claims refund budget while proven repairs keep their count");
