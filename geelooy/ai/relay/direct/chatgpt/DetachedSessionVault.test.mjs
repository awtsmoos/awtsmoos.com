// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DetachedSessionVault } from "./DetachedSessionVault.mjs";

test("detached sessions remain memory-only and expire", () => {
	let now = 1000;
	const vault = new DetachedSessionVault({ ttlMs: 60000, now: () => now });
	const session = { cookieHeader: "private" };
	assert.equal(vault.set("conversation-one", session), true);
	assert.equal(vault.get("conversation-one"), session);
	assert.deepEqual(vault.status(), {
		activeDetachedSessions: 1,
		persisted: false,
		ttlMs: 60000
	});
	now += 60001;
	assert.equal(vault.get("conversation-one"), null);
	assert.equal(vault.status().activeDetachedSessions, 0);
});
