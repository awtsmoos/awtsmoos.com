// B"H
import assert from "node:assert/strict";

/**
 * @file Run 05: a transient /me failure must never read as a sign-out.
 * @description The Awtsmoos distinguishes a definitive not_authenticated
 * answer from a gateway 504 or other failure envelope; only the first
 * may send a reloading signed-in user to the login gate.
 */
const { isDefinitiveSignOut, sessionFromRaw } = await import("../sessionClient.js");

assert.equal(isDefinitiveSignOut({ ok: false, error: "not_authenticated" }), true);
assert.equal(isDefinitiveSignOut({ ok: false, error: "non_json_response", status: 504 }), false);
assert.equal(isDefinitiveSignOut({ ok: true, identity: {} }), false);
assert.equal(isDefinitiveSignOut(null), false);

const signedOut = sessionFromRaw({ ok: false, error: "not_authenticated", identity: null });
assert.equal(signedOut.loggedIn, false);

assert.throws(
	() => sessionFromRaw({ ok: false, error: "non_json_response", status: 504 }),
	error => error.code === "session_unavailable"
);
assert.throws(
	() => sessionFromRaw({ ok: false, status: 500 }),
	error => error.code === "session_unavailable"
);

const signedIn = sessionFromRaw({
	ok: true,
	identity: { userId: "u1", accountId: "asdf", sessionId: "s1" }
});
assert.equal(signedIn.loggedIn, true);
assert.equal(signedIn.accountId, "asdf");

console.log("BHY session client classification tests passed");
