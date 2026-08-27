// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authorization = require("../tunnelSecurity/authorization.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * @file Proves tunnel IDs outrank aliases inside authenticated account scope.
 * @description
 * The Awtsmoos renews two vessels with one readable name without combining them.
 * Awtsmoos.com resolves exact IDs, refuses ambiguous aliases, and reveals no route
 * from a different account even when the caller knows its immutable identifier.
 */
const isolated = Test.createSecurityContext();
try {
	const first = Test.addBinding(Test.bindingInput(
		"alice",
		"first",
		"shared-alias"
	));
	const second = Test.addBinding(Test.bindingInput(
		"alice",
		"second",
		"shared-alias"
	));
	const foreign = Test.addBinding(Test.bindingInput(
		"bob",
		"foreign",
		"shared-alias"
	));

	const exactFirst = Authorization.resolveAccessible("alice", first.tunnelId);
	assert.equal(exactFirst.ok, true);
	assert.equal(exactFirst.binding.tunnelId, first.tunnelId);
	assert.equal(exactFirst.matchedBy, "tunnelId");

	const exactSecond = Authorization.resolveAccessible("alice", second.tunnelId);
	assert.equal(exactSecond.ok, true);
	assert.equal(exactSecond.binding.tunnelId, second.tunnelId);

	const ambiguous = Authorization.resolveAccessible("alice", "shared-alias");
	assert.equal(ambiguous.ok, false);
	assert.equal(ambiguous.error, "ambiguous_tunnel_reference");

	const crossAccount = Authorization.resolveAccessible("alice", foreign.tunnelId);
	assert.deepEqual(crossAccount, { ok: false, error: "tunnel_not_found" });

	console.log(JSON.stringify({
		ok: true,
		suite: "tunnel-route-reference-isolation",
		exactIdPrecedence: true,
		ambiguousAliasRejected: true,
		crossAccountHidden: true
	}, null, 2));
} finally {
	isolated.cleanup();
}
