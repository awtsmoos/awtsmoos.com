// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves RemoteFs carries immutable route identity through paths and transport.
 * @description
 * The Awtsmoos lets old URLs survive as garments while every new network path
 * carries the immutable route. Awtsmoos.com keeps browser/native vessel hint beside
 * that route at transport time without letting the hint replace the address itself.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseAwtsmoosPath } from "../remotePath.js";
import {
	remoteNetworkPath,
	remotePathFor
} from "../remoteTunnelPaths.js";
import { remoteTunnelEntries } from "../remoteTunnelEntries.js";
import * as RemoteFs from "../remoteFs.js";

test("network paths decode immutable route while legacy tunnel URLs still parse", () => {
	const network = parseAwtsmoosPath("/network/route%2Fone/folder/file.txt");
	const legacy = parseAwtsmoosPath("awtsmoos://tunnels/Friendly%20Mac/file.txt");
	assert.equal(network.id, "route/one");
	assert.equal(network.innerPath, "folder/file.txt");
	assert.equal(legacy.id, "Friendly Mac");
	assert.equal(legacy.innerPath, "file.txt");
});

test("new generated paths use immutable encoded route", () => {
	assert.equal(
		remoteNetworkPath("route/one", "folder/a.txt"),
		"/network/route%2Fone/folder/a.txt"
	);
	assert.equal(
		remotePathFor("route/one", "folder/a.txt", false),
		"awtsmoos://tunnels/route%2Fone/folder/a.txt"
	);
});

test("remote entries preserve route identity in child paths", () => {
	const entries = remoteTunnelEntries(
		"route-live",
		[{ name: "a.txt", path: "docs/a.txt" }],
		"docs",
		true
	);
	assert.equal(entries[0].path, "/network/route-live/docs/a.txt");
	assert.equal(entries[0].remotePath, "docs/a.txt");
});

test("RemoteFs write uses immutable browser route plus separate browser hint", async () => {
	const oldFetch = globalThis.fetch;
	const oldLocation = globalThis.location;
	let seenUrl = "";
	globalThis.location = { origin: "https://awtsmoos.com" };
	globalThis.fetch = async url => {
		seenUrl = String(url);
		return {
			ok: true,
			status: 200,
			async json() { return { ok: true }; }
		};
	};
	const os = {
		drives: {
			get(route) {
				return route === "browser-route"
					? { routeReference: route, targetVessel: "browser-tab" }
					: null;
			}
		}
	};
	try {
		const result = await RemoteFs.write(
			"/network/browser-route/docs/a.txt",
			"B\"H",
			os
		);
		assert.equal(result.ok, true);
		const url = new URL(seenUrl);
		assert.match(url.pathname, /\/api\/tunnel\/control\/fs\/browser-route$/);
		assert.equal(url.searchParams.get("action"), "write");
		assert.equal(url.searchParams.get("targetVessel"), "browser-tab");
		assert.equal(url.searchParams.get("path"), "docs/a.txt");
		assert.ok(url.searchParams.get("content64"));
	} finally {
		globalThis.fetch = oldFetch;
		globalThis.location = oldLocation;
	}
});
