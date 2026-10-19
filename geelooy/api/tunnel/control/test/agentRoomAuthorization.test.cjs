// B"H
"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const { canWrite } = require("../core/accountRoom/authorization.js");

/** Every voice crosses only its own authenticated door. */
const session = { ok: true, kind: "session" };
const oauth = { ok: true, kind: "oauth", scopes: ["tunnel.mission"] };
const valid = { headers: {
	origin: "https://awtsmoos.com", "sec-fetch-site": "same-origin",
	"content-type": "application/json; charset=utf-8",
	"x-awtsmoos-room-intent": "coordination-message"
} };

test("valid scoped OAuth agents can write", () => {
	assert.equal(canWrite(oauth, {}), true);
	assert.equal(canWrite({ ...oauth, scopes: ["tunnel.read"] }, valid), false);
});

test("signed website session with same-origin explicit intent can write", () => {
	assert.equal(canWrite(session, valid), true);
});

test("cross-site session or missing CSRF headers is rejected", () => {
	for (const change of [
		{ origin: "https://attacker.com" },
		{ "sec-fetch-site": "cross-site" },
		{ "x-awtsmoos-room-intent": "" },
		{ "content-type": "text/plain" }
	]) {
		assert.equal(canWrite(session, { headers: { ...valid.headers, ...change } }), false);
	}
	assert.equal(canWrite(session, {}), false);
	assert.equal(canWrite({ ok: false, kind: "oauth", scopes: ["tunnel.mission"] }, {}), false);
});

test("API keys without a separately defined room policy cannot write", () => {
	assert.equal(canWrite({ ok: true, kind: "apiKey", scopes: ["tunnel.mission"] }, valid), false);
});
