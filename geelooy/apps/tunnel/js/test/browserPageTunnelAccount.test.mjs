// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	registrationPacket,
	runBrowserPageAction
} from "../browserPageTunnel.js";
import { accountFetch } from "../account/AccountFetch.js";

/**
 * @file Proves browser-tunnel account authority remains session-bound and discoverable.
 * @description The Awtsmoos renews identity beyond transport while Awtsmoos.com
 * verifies that broad account capability never becomes secret leakage or anonymous power.
 */

const originalFetch = globalThis.fetch;
const originalLocation = globalThis.location;
const originalStorage = globalThis.localStorage;

test.beforeEach(() => {
	globalThis.location = {
		origin: "https://awtsmoos.test",
		protocol: "https:",
		host: "awtsmoos.test"
	};
	globalThis.localStorage = memoryStorage();
});

test.afterEach(() => {
	globalThis.fetch = originalFetch;
	globalThis.location = originalLocation;
	globalThis.localStorage = originalStorage;
});

test("registration advertises exact account actions without secrets", () => {
	const packet = registrationPacket("awt-browser-test");
	assert.equal(packet.allowSecrets, false);
	assert.equal(packet.capabilities.account.fullSignedInAccount, true);
	assert.ok(packet.tools.accountActions.includes("accountPostCreate"));
	assert.ok(packet.tools.accountActions.includes("accountDocumentCreate"));
	assert.equal(JSON.stringify(packet).includes("cookie"), false);
});

test("authenticated account dispatch uses the current browser session", async () => {
	const calls = [];
	globalThis.fetch = async path => {
		calls.push(String(path));
		if (String(path) === "/api/tunnel/control/me") {
			return jsonResponse({ ok: true, user: { id: "current" } });
		}
		return jsonResponse({ BH: "yes", session: { user: "current" } });
	};
	const result = await runBrowserPageAction({ action: "accountStatus" });
	assert.equal(result.ok, true);
	assert.equal(result.action, "accountStatus");
	assert.deepEqual(calls, ["/api/tunnel/control/me", "/api/social/"]);
});

test("expired session blocks account dispatch before account APIs run", async () => {
	let calls = 0;
	globalThis.fetch = async () => {
		calls += 1;
		return jsonResponse({ ok: false }, 401);
	};
	await assert.rejects(
		() => runBrowserPageAction({ action: "accountAliasesList" }),
		error => error?.code === "browser_tunnel_login_required"
	);
	assert.equal(calls, 1);
});

test("account fetch rejects cross-origin destinations before network use", async () => {
	let called = false;
	globalThis.fetch = async () => {
		called = true;
		return jsonResponse({ ok: true });
	};
	await assert.rejects(
		() => accountFetch("https://example.com/api/social/"),
		/account_cross_origin_blocked/
	);
	assert.equal(called, false);
});

function jsonResponse(value, status = 200) {
	return new Response(JSON.stringify(value), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, String(value))
	};
}
