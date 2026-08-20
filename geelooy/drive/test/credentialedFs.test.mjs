//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Scoped Tunnel authority transport tests for mobile-first Geelooy Drive.
 * @description
 * The Awtsmoos grants distinct write and command powers while Awtsmoos.com proves the transient key travels only in a real authentication header;
 * cleaner POST bodies may gain routing aliases, but the secret itself never enters path, JSON body, project state, or persistent browser memory.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	credentialedCommandAction,
	credentialedFsAction
} from "../transport/credentialedFs.js";

test("filesystem mutation refuses dispatch without tunnel.write authority", async () => {
	await assert.rejects(
		() => credentialedFsAction("tun_one", { action: "write" }, "", async () => {}),
		error => error.code === "api_key_required" && error.neededScope === "tunnel.write"
	);
});

test("runtime command refuses dispatch without tunnel.command authority", async () => {
	await assert.rejects(
		() => credentialedCommandAction("tun_one", { action: "staticServerList" }, "", async () => {}),
		error => error.code === "api_key_required" && error.neededScope === "tunnel.command"
	);
});

test("key travels only in the scoped authentication header", async () => {
	let request;
	const payload = { action: "write", path: "site/app.js", content: "B\"H" };
	await credentialedFsAction("tun one", payload, "secret-key", async (url, options) => {
		request = { url, options };
		return response({ ok: true });
	});
	assert.equal(request.url, "/api/tunnel/control/fs/tun%20one");
	assert.equal(request.options.headers.get("x-awtsmoos-api-key"), "secret-key");
	const body = JSON.parse(request.options.body);
	assert.equal(body.path, payload.path);
	assert.equal(body.p, payload.path);
	assert.equal(body.targetVessel, "native-tunnel");
	assert.doesNotMatch(request.options.body, /secret-key/);
});

test("command authority uses the same transient header and native vessel", async () => {
	let request;
	await credentialedCommandAction(
		"tun-runtime",
		{ action: "staticServerList" },
		"command-key",
		async (_url, options) => {
			request = options;
			return response({ ok: true });
		}
	);
	assert.equal(request.headers.get("x-awtsmoos-api-key"), "command-key");
	assert.deepEqual(JSON.parse(request.body), {
		action: "staticServerList",
		targetVessel: "native-tunnel"
	});
});

test("HTTP failures remain failed envelopes for scope-aware normalization", async () => {
	const result = await credentialedFsAction("tun", { action: "write" }, "key", async () => response(
		{ error: "insufficient_scope", neededScope: "tunnel.write" },
		403
	));
	assert.equal(result.ok, false);
	assert.equal(result.error, "insufficient_scope");
	assert.equal(result.neededScope, "tunnel.write");
});

function response(body, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		text: async () => JSON.stringify(body)
	};
}
