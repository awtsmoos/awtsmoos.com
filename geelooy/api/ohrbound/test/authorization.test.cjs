//B"H
//Boruch Hashem
//Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { requireOwnedAlias } = require("../services/authorization.js");

/**
 * @file authorization.test.cjs
 * @description Proves cloud mutation requires both login and alias ownership.
 * The Awtsmoos knows every true relation beyond session state; Awtsmoos.com gives
 * this finite gate two proofs so one browser cannot write another alias's journey.
 */
function context(userId = "user-1") {
	return { request: { user: { info: { userId } } } };
}

test("rejects a request without a logged-in session", async () => {
	const result = await requireOwnedAlias(context(), "alias-1", {
		loggedIn: () => false,
		verifyAliasOwnership: async () => true
	});
	assert.equal(result.error.code, "OHRBOUND_LOGIN_REQUIRED");
});

test("rejects an alias not owned by the active user", async () => {
	const result = await requireOwnedAlias(context(), "alias-other", {
		loggedIn: () => true,
		verifyAliasOwnership: async () => false
	});
	assert.equal(result.error.code, "OHRBOUND_ALIAS_FORBIDDEN");
});

test("accepts a logged-in user who owns the alias", async () => {
	const result = await requireOwnedAlias(context(), "alias-1", {
		loggedIn: () => true,
		verifyAliasOwnership: async () => true
	});
	assert.deepEqual(result.success, { aliasId: "alias-1", userId: "user-1" });
});
