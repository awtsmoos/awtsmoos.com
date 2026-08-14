// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

/**
 * Enters through the authenticated runtime handlers rather than service shortcuts.
 * The Awtsmoos renews user, origin, JSON body, process, status, and stop together;
 * Awtsmoos.com exposes no anonymous shell or foreign-origin native authority.
 */

const require = createRequire(import.meta.url);
const {
	runtimeCapabilities,
	runtimeLaunch,
	runtimeStatus,
	runtimeStop
} = require("../../api/runtime/core/handlers.js");


test("rejects unauthenticated capability requests", async () => {
	const response = await runtimeCapabilities(context({
		authenticated: false
	}));
	assert.equal(response.ok, false);
	assert.equal(response.status, 401);
	assert.equal(response.error.code, "AUTHENTICATION_REQUIRED");
});


test("rejects foreign-origin capability requests", async () => {
	const response = await runtimeCapabilities(context({
		origin: "https://foreign.invalid"
	}));
	assert.equal(response.ok, false);
	assert.equal(response.status, 403);
	assert.equal(response.error.code, "ORIGIN_REJECTED");
});


test("reports generic native host capabilities", async () => {
	const response = await runtimeCapabilities(context());
	assert.equal(response.ok, true);
	assert.equal(response.capabilities.hostPlatform, process.platform);
	assert.equal(response.capabilities.hostArchitecture, process.arch);
	assert.ok(response.capabilities.nativeFormats.length > 0);
});


test("launches, polls, and stops through route handlers", async () => {
	const launched = await runtimeLaunch(context({
		body: {
			path: "/bin/sleep",
			arguments: ["30"]
		}
	}));
	assert.equal(launched.ok, true);
	assert.equal(launched.result.state, "running");
	const runtimeId = launched.result.runtimeId;
	const status = await runtimeStatus(context({
		body: { runtimeId }
	}));
	assert.equal(status.ok, true);
	assert.equal(status.result.runtimeId, runtimeId);
	const stopping = await runtimeStop(context({
		body: { runtimeId }
	}));
	assert.equal(stopping.ok, true);
	assert.equal(stopping.result.state, "stopping");
	const final = await waitForExit(runtimeId);
	assert.equal(final.state, "stopped");
});


test("rejects malformed raw JSON before launch", async () => {
	const response = await runtimeLaunch(context({
		rawBody: Buffer.from("{broken")
	}));
	assert.equal(response.ok, false);
	assert.equal(response.error.code, "REQUEST_JSON_INVALID");
});

async function waitForExit(runtimeId) {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		const response = await runtimeStatus(context({
			body: { runtimeId }
		}));
		if (!["running", "stopping"].includes(response.result.state)) {
			return response.result;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error(`API_RUNTIME_WAIT_TIMEOUT:${runtimeId}`);
}

function context(options = {}) {
	const request = {
		headers: {
			host: "127.0.0.1:8080",
			origin: options.origin || "http://127.0.0.1:8080"
		}
	};
	if (options.authenticated !== false) {
		request.user = {
			info: {
				userId: `runtime-test-${Math.random()}`
			}
		};
	}
	return {
		request,
		$_POST: options.rawBody
			? { __raw_body__: options.rawBody }
			: options.body
	};
}
