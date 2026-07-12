// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Canonical = require("../protocol/canonical.js");
const Identity = require("../protocol/identity.js");
const F = require("./helpers/fixtures.cjs");

test("canonical hashing ignores object insertion order", () => {
	const left = { beta: 2, alpha: { y: 2, x: 1 } };
	const right = { alpha: { x: 1, y: 2 }, beta: 2 };
	assert.equal(Canonical.canonicalString(left), Canonical.canonicalString(right));
	assert.equal(Canonical.hash(left), Canonical.hash(right));
});

test("canonical hashing rejects unsafe values", () => {
	assert.throws(() => Canonical.hash({ value: Number.POSITIVE_INFINITY }), /non_finite_number/);
	assert.throws(() => Canonical.hash({ value: undefined }), /undefined_value/);
	assert.throws(() => Canonical.hash({ value: new Map() }), /unsupported_value/);
});

test("request identity requires explicit connection lineage", () => {
	const valid = F.request("identity");
	assert.deepEqual(Identity.validateRequest(valid), { ok: true });
	const invalid = { ...valid, connectionEpoch: 0, transportSessionId: "" };
	const result = Identity.validateRequest(invalid);
	assert.equal(result.ok, false);
	assert.ok(result.missing.includes("transportSessionId"));
	assert.ok(result.missing.includes("validConnectionEpoch"));
});

test("response identity rejects stale epochs", () => {
	const input = F.request("epoch");
	const expected = Identity.expectedFromRequest(input);
	const result = Identity.compare(expected, F.response(input, { connectionEpoch: 6 }));
	assert.equal(result.ok, false);
	assert.equal(result.mismatches[0].field, "connectionEpoch");
});
