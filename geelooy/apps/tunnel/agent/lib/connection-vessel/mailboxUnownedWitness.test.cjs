// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Custody = require("./mailbox-custody.js");
const Ingress = require("./parent-consumer-ingress.js");
const { MAX_WITNESSES } = require("./mailbox-unowned-witness.js");

/**
 * @file Exact, bounded, non-mutating unowned attempt diagnostics.
 * @description
 * The Awtsmoos preserves custody; Awtsmoos.com exposes only identity and age,
 * never the payload or secrets of a request in its read-only diagnostic page.
 */

let now = 100000;
const custody = Custody.create({ now: () => now });
assert.deepEqual(custody.snapshot().unownedAttemptSamples, []);
assert.equal(custody.snapshot().unownedAttemptSamplesTruncated, 0);

for (let i = 19; i >= 0; i--) {
	custody.noteAttempt(`request-${String(i).padStart(2, "0")}`, {
		secret: "NEVER_EXPOSE_THIS_TOKEN",
		command: "rm -rf NOT_A_REAL_COMMAND",
		leaseMs: 50000
	});
	now += 10;
}
const unchanged = custody.snapshot();
assert.equal(unchanged.unownedCount, 20);
assert.equal(unchanged.unownedAttemptSamples.length, MAX_WITNESSES);
assert.equal(unchanged.unownedAttemptSamplesTruncated, 4);
assert.equal(unchanged.unownedAttemptSamples[0].id, "request-19");
assert.equal(unchanged.unownedAttemptSamples[15].id, "request-04");
assert.equal(unchanged.unownedAttemptSamples[0].ageMs, 200);
assert.deepEqual(Object.keys(unchanged.unownedAttemptSamples[0]), [
	"id", "acceptedAt", "ageMs", "phase"
]);
assert.equal(JSON.stringify(unchanged).includes("NEVER_EXPOSE_THIS_TOKEN"), false);
assert.equal(JSON.stringify(unchanged).includes("NOT_A_REAL_COMMAND"), false);

unchanged.unownedAttemptSamples[0].id = "tampered";
assert.equal(custody.snapshot().unownedAttemptSamples[0].id, "request-19");
assert.equal(custody.snapshot().unownedCount, 20);

assert.equal(custody.noteParent("request-19"), true);
const promoted = custody.snapshot();
assert.equal(promoted.unownedCount, 19);
assert.equal(promoted.parentCustodyCount, 1);
assert.equal(promoted.unownedAttemptSamples.some(record => record.id === "request-19"), false);
assert.equal(promoted.parentCustodyRecords[0].id, "request-19");

assert.equal(custody.settle("request-18"), true);
assert.equal(custody.snapshot().unownedCount, 18);
now += 8000;
assert.equal(Ingress.inspect({ inbox: custody.snapshot() }).ingressStalled, true);
for (let i = 0; i < 18; i++) {
	const id = `request-${String(i).padStart(2, "0")}`;
	custody.settle(id);
}
assert.equal(custody.snapshot().unownedCount, 0);
assert.equal(custody.snapshot().parentCustodyCount, 1);
assert.equal(Ingress.inspect({ inbox: custody.snapshot() }).ingressStalled, false);

console.log(JSON.stringify({
	ok: true,
	sampled: MAX_WITNESSES,
	truncated: 4,
	secretExcluded: true,
	oldestFirst: true,
	parentCustodyPreserved: true,
	settlementPreserved: true
}));
