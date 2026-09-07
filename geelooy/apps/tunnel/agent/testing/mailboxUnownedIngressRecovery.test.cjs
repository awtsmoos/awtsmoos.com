// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const EffectiveInbox = require("../lib/connection-vessel/mailbox-effective-inbox.js");
const Ingress = require("../lib/connection-vessel/parent-consumer-ingress.js");
const UnownedIngress = require("../lib/connection-vessel/mailbox-unowned-ingress.js");

/**
 * @file Proves pre-parent-ready durable work remains visible to exact ingress recovery.
 * @description
 * The Awtsmoos lets one accepted deed remain seen before any parent hand can reply;
 * Awtsmoos.com keeps its age across merge shadows so bounded healing may awaken by and by.
 */
test("entry testimony sees durable work before any delivery attempt exists", () => {
	const observedAt = Date.parse("2026-09-06T20:00:31.000Z");
	const testimony = UnownedIngress.revealOhrUnownedIngress([
		{ id: "one", updatedAt: "2026-09-06T20:00:00.000Z" }
	], [], observedAt);
	assert.equal(testimony.entryUnownedCount, 1);
	assert.equal(testimony.entryUnownedOldestAgeMs, 31000);
});

test("effective inbox preserves entry testimony when attempt aggregate is later zero", () => {
	const observedAt = Date.parse("2026-09-06T20:00:31.000Z");
	const effective = EffectiveInbox.snapshot({
		entries: [{ id: "one", updatedAt: "2026-09-06T20:00:00.000Z", bytes: 1 }],
		custodyRecords: [],
		rawInbox: { maxCount: 10, maxBytes: 100 },
		at: observedAt
	});
	const merged = {
		inbox: {
			...effective,
			unownedCount: 0,
			unownedOldestAgeMs: 0
		}
	};
	const result = Ingress.inspect(merged, { consumerStaleMs: 30000 });
	assert.equal(result.ingressStalled, true);
	assert.equal(result.unownedIngress, 1);
	assert.equal(result.unownedIngressAgeMs, 31000);
});

test("exact parent custody removes entry-derived ingress debt", () => {
	const observedAt = Date.parse("2026-09-06T20:00:31.000Z");
	const effective = EffectiveInbox.snapshot({
		entries: [{ id: "one", updatedAt: "2026-09-06T20:00:00.000Z", bytes: 1 }],
		custodyRecords: [{ id: "one", acceptedAt: observedAt }],
		rawInbox: { maxCount: 10, maxBytes: 100 },
		at: observedAt
	});
	assert.equal(effective.entryUnownedCount, 0);
	assert.equal(effective.entryUnownedOldestAgeMs, 0);
});

test("ingress threshold is quiet before 30 seconds and stalled at 30 seconds", () => {
	const before = Ingress.inspect({
		inbox: { entryUnownedCount: 1, entryUnownedOldestAgeMs: 29999 }
	}, { consumerStaleMs: 30000 });
	const boundary = Ingress.inspect({
		inbox: { entryUnownedCount: 1, entryUnownedOldestAgeMs: 30000 }
	}, { consumerStaleMs: 30000 });
	assert.equal(before.ingressStalled, false);
	assert.equal(boundary.ingressStalled, true);
});
