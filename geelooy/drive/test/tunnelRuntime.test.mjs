//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded managed-runtime transport tests for Geelooy Drive.
 * @description
 * The Awtsmoos lets a folder listen while Awtsmoos.com proves Drive sends only purpose-built static lifecycle actions through the native vessel;
 * no arbitrary shell text enters this transport, and public exposure must derive from one known managed-server port.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { NetzachTunnelRuntime } from "../transport/tunnelRuntime.js";

function harness() {
	const payloads = [];
	const runtime = new NetzachTunnelRuntime({
		keyProvider: () => "command-key",
		fetchImpl: async (_url, options) => {
			const payload = JSON.parse(options.body);
			payloads.push(payload);
			return {
				ok: true,
				status: 200,
				text: async () => JSON.stringify(resultFor(payload))
			};
		}
	});
	return { runtime, payloads };
}

test("start uses a bounded static-server action with ephemeral port", async () => {
	const { runtime, payloads } = harness();
	const result = await runtime.start("tun-one", "projects/site");
	assert.equal(result.serverId, "server-1");
	assert.deepEqual(payloads[0], native({
		action: "staticServerStart",
		path: "projects/site",
		p: "projects/site",
		port: 0,
		index: "index.html",
		spaFallback: true,
		cors: false
	}));
});

test("list logs and stop use dedicated native lifecycle actions", async () => {
	const { runtime, payloads } = harness();
	await runtime.list("tun-one");
	await runtime.logs("tun-one", "server-1", 37);
	await runtime.stop("tun-one", "server-1");
	assert.deepEqual(payloads, [
		native({ action: "staticServerList" }),
		native({ action: "staticServerLogs", serverId: "server-1", maxLogs: 37 }),
		native({ action: "staticServerStop", serverId: "server-1" })
	]);
});

test("public exposure uses only the known server port and route", async () => {
	const { runtime, payloads } = harness();
	const exposure = await runtime.expose(
		"tun-one",
		{ serverId: "server-1", port: 43123 },
		{ title: "Friend Site" }
	);
	assert.equal(exposure.publicUrl, "https://awtsmoos.com/view/runtime-1");
	assert.deepEqual(payloads[0], native({
		action: "previewExposeLocalServer",
		tunnelName: "tun-one",
		port: 43123,
		proxyPath: "/",
		title: "Friend Site",
		visibility: "private",
		verifyPublic: true
	}));
});

function native(payload) {
	return { ...payload, targetVessel: "native-tunnel" };
}

function resultFor(payload) {
	if (payload.action === "staticServerStart") {
		return { ok: true, serverId: "server-1", port: 43123, path: payload.path, ready: true };
	}
	if (payload.action === "staticServerList") return { ok: true, servers: [] };
	if (payload.action === "staticServerLogs") return { ok: true, logs: [] };
	if (payload.action === "previewExposeLocalServer") {
		return { ok: true, previewId: "runtime-1", publicUrl: "https://awtsmoos.com/view/runtime-1", publicVerified: true };
	}
	return { ok: true, stopped: true };
}
