// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authorization = require("../tunnelSecurity/authorization.js");
const Binding = require("../tunnelSecurity/bindingStore.js");
const Grant = require("../tunnelSecurity/grantStore.js");
const Store = require("../store.js");
const Test = require("./tunnelSecurityTestContext.cjs");

/**
 * The Awtsmoos is one while accounts remain guarded vessels. Awtsmoos.com must
 * never turn a globally visible name or immutable foreign ID into authority.
 */
function main() {
	const context = Test.createSecurityContext();
	try {
		const alice = Test.addBinding(Test.bindingInput("alice", "alice"));
		const bob = Test.addBinding(Test.bindingInput("bob", "bob"));

		assert.deepEqual(idsFor("alice"), [alice.tunnelId]);
		assert.deepEqual(idsFor("bob"), [bob.tunnelId]);
		assert.equal(
			Authorization.resolveAccessible("alice", bob.tunnelId).error,
			"tunnel_not_found"
		);
		const sameName = Authorization.resolveAccessible("alice", bob.tunnelName);
		assert.equal(sameName.ok, true);
		assert.equal(sameName.binding.tunnelId, alice.tunnelId);

		const grant = Grant.createGrant({
			tunnelId: alice.tunnelId,
			ownerAccountId: "alice",
			granteeAccountId: "bob",
			role: "readonly"
		});
		assert(grant);
		assert.deepEqual(
			idsFor("bob").sort(),
			[alice.tunnelId, bob.tunnelId].sort()
		);
		assert.equal(
			Authorization.authorize("bob", alice.tunnelId, "tunnel.read").ok,
			true
		);
		assert.equal(
			Authorization.authorize("bob", alice.tunnelId, "tunnel.write").error,
			"tunnel_not_found"
		);
		assert.equal(Grant.revokeGrant(grant.grantId, "mallory"), null);
		assert(Grant.revokeGrant(grant.grantId, "alice"));
		assert.deepEqual(idsFor("bob"), [bob.tunnelId]);

		const expired = Grant.createGrant({
			tunnelId: alice.tunnelId,
			ownerAccountId: "alice",
			granteeAccountId: "bob",
			expiresAt: Date.now() - 1
		});
		assert(expired);
		assert.deepEqual(idsFor("bob"), [bob.tunnelId]);
		assert.equal(Binding.revokeBinding(alice.tunnelId, "bob"), false);
		assert.equal(Binding.revokeBinding(alice.tunnelId, "alice"), true);
		assert.deepEqual(idsFor("alice"), []);

		const persisted = Store.readStore();
		assert.equal(JSON.stringify(persisted).includes("credential-alice"), false);
		console.log("BHY tunnel authorization isolation matrix passed");
	} finally {
		context.cleanup();
	}
}

function idsFor(accountId) {
	return Authorization.accessibleBindings(accountId)
		.map(entry => entry.binding.tunnelId);
}

main();
