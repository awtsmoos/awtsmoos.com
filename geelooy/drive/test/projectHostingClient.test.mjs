//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ProjectHostingClient } from "../transport/projectHostingClient.js";

/**
 * @file Proof for the browser-to-project API vessel.
 * @description
 * The Awtsmoos lets every request carry only path, intent, and session-born authority;
 * Awtsmoos.com proves URLs, methods, bodies, and failures before Studio receives this ability.
 */

function harness(payload = { ok: true }, status = 200) {
	const calls = [];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return { ok: status >= 200 && status < 300, status, json: async () => payload };
	};
	return { calls, client: new ProjectHostingClient({ aliasId: "alpha", projectId: "friend-site", fetchImpl }) };
}

test("hosting request stays same-origin and encodes declared options", async () => {
	const { calls, client } = harness({ hosting: { version: 1 } });
	await client.hosting({ rootPath: "sites/friend", exposure: "public" });
	assert.match(calls[0].url, /^\/api\/social\/drive\/alpha\/projects\/friend-site\/hosting\?/);
	assert.match(calls[0].url, /exposure=public/);
	assert.equal(calls[0].options.credentials, "same-origin");
});

test("database writes and deletes use bounded route methods", async () => {
	const { calls, client } = harness({ database: { ok: true } });
	await client.setKey("me", { name: "Friend" }, "profiles");
	await client.deleteKey("me", "profiles");
	assert.deepEqual(calls.map(call => call.options.method), ["POST", "DELETE"]);
	assert.deepEqual(JSON.parse(calls[0].options.body), { path: "profiles", key: "me", value: { name: "Friend" } });
});

test("database reads encode key and listing limits without request bodies", async () => {
	const { calls, client } = harness({ database: { keys: [] } });
	await client.listKeys("posts", 50);
	await client.readKey("first", "posts");
	assert.match(calls[0].url, /path=posts/);
	assert.match(calls[0].url, /limit=50/);
	assert.match(calls[1].url, /key=first/);
	assert.equal(calls[0].options.body, undefined);
});

test("HTTP failures become structured errors", async () => {
	const { client } = harness({ error: "DENIED" }, 403);
	await assert.rejects(client.listKeys(), error => error.status === 403 && error.message === "DENIED");
});
