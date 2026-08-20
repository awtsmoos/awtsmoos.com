//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Protected Tunnel POST carrier tests.
 * @description
 * The Awtsmoos lets one action cross native and virtual vessels while Awtsmoos.com proves cleaner JSON POST bodies preserve historical routing aliases;
 * file content leaves the URL, native selection stays explicit, and virtual OS requests remain free to choose their own vessel.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	protectedFsRequest,
	shapePayload
} from "../tunnelPayloadClient.js";

test("shapePayload preserves path aliases and native vessel routing", () => {
	assert.deepEqual(shapePayload("tun-one", {
		action: "read",
		path: "site/app.js"
	}), {
		action: "read",
		path: "site/app.js",
		p: "site/app.js",
		targetVessel: "native-tunnel"
	});
});

test("virtual OS routes are not forced into the native vessel", () => {
	assert.equal(
		shapePayload("awtsmoos-os", { action: "list", p: "/" }).targetVessel,
		undefined
	);
});

test("protected filesystem traffic uses JSON POST rather than query payloads", async () => {
	let request;
	await protectedFsRequest("tun one", {
		action: "write",
		path: "site/app.js",
		content: "large content stays out of URL"
	}, {
		fetchImpl: async (url, options) => {
			request = { url, options };
			return response({ ok: true });
		}
	});
	assert.equal(request.url, "/api/tunnel/control/fs/tun%20one");
	assert.equal(request.options.method, "POST");
	assert.equal(request.options.headers.get("content-type"), "application/json");
	assert.match(request.options.body, /large content stays out of URL/);
	assert.doesNotMatch(request.url, /content/);
});

function response(body) {
	return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}
