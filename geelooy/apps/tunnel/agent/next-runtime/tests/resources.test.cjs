// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Runtime = require("../index.js");

function resource(id = "resource-1") {
	return {
		resourceId: id,
		resourceType: "timer",
		ownerType: "agent",
		ownerId: "agent-a",
		missionId: "mission-1",
		agentId: "agent-a",
		cleanupMethod: "clearTimeout",
		metadata: { label: "turn-deadline", secretToken: "must-not-survive" }
	};
}

test("resource registration requires owner and cleanup contract", () => {
	const ledger = Runtime.createResourceLedger();
	assert.throws(() => ledger.register({ resourceId: "bad" }), { code: "missing_cleanup_method" });
	const record = ledger.register(resource());
	assert.equal(record.ownerId, "agent-a");
	assert.equal(record.metadata.secretToken, undefined);
	assert.equal(record.metadata.label, "turn-deadline");
});

test("resource revisions prevent stale cleanup mutation", () => {
	const ledger = Runtime.createResourceLedger();
	let record = ledger.register(resource());
	record = ledger.requestCleanup(record.resourceId, { graceMs: 1000 }, record.revision);
	assert.equal(record.observedState, "cleanup-requested");
	assert.throws(() => ledger.completeCleanup(record.resourceId, { ok: true }, 0), {
		code: "resource_revision_conflict"
	});
	record = ledger.completeCleanup(record.resourceId, { ok: true }, record.revision);
	assert.equal(record.observedState, "cleaned");
	assert.equal(ledger.snapshot().active, 0);
});

test("stale resources are found without exposing handles", () => {
	const ledger = Runtime.createResourceLedger();
	let record = ledger.register(resource());
	record = ledger.update(record.resourceId, {
		lastHeartbeatAt: new Date(Date.now() - 120000).toISOString(),
		metadata: { handle: "raw-object", safe: "visible" }
	}, record.revision);
	const stale = ledger.stale(Date.now(), 60000);
	assert.equal(stale.length, 1);
	assert.deepEqual(stale[0].metadata, { safe: "visible" });
});

test("cleaned records are evicted before active records at capacity", () => {
	const ledger = Runtime.createResourceLedger({ maxResources: 2 });
	let first = ledger.register(resource("one"));
	first = ledger.requestCleanup("one", {}, first.revision);
	ledger.completeCleanup("one", { ok: true }, first.revision);
	ledger.register(resource("two"));
	ledger.register(resource("three"));
	assert.equal(ledger.get("one"), null);
	assert.equal(ledger.snapshot().active, 2);
});
