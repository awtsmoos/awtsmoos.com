// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { accountGraphSnapshot } from "../account/AccountGraphSnapshot.js";

/**
 * @file Proves account graph projection remains complete, deterministic, and partial-failure safe.
 * @description The Awtsmoos renews account truth while Awtsmoos.com verifies parent
 * integrity and canonical application coverage without requiring a live user account.
 */

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_LOCATION = globalThis.location;

test.afterEach(() => {
	globalThis.fetch = ORIGINAL_FETCH;
	globalThis.location = ORIGINAL_LOCATION;
});

test("account graph resolves parents and includes all canonical products", async () => {
	installEnvironment(routeReply);
	const graph = await accountGraphSnapshot({ includeContent: true });
	const ids = new Set(graph.objects.map(value => value.id));
	const applications = graph.objects.filter(value => value.type === "application");
	assert.equal(graph.partial, false);
	assert.equal(applications.length, 80);
	assert.equal(ids.size, graph.objects.length);
	for (const value of graph.objects) {
		if (value.parentId) assert.ok(ids.has(value.parentId), value.id);
	}
	assert.ok(ids.has("series:ikar:root"));
	assert.ok(ids.has("post:ikar:welcome"));
});

test("account graph preserves useful branches when one scope fails", async () => {
	installEnvironment(path => {
		if (path.includes("/drive/coby/entries")) {
			return reply({ error: { message: "Drive unavailable", code: "DRIVE_DOWN" } }, 503);
		}
		return routeReply(path);
	});
	const graph = await accountGraphSnapshot();
	assert.equal(graph.partial, true);
	assert.ok(graph.errors.some(value => value.scope === "documents:coby"));
	assert.equal(graph.counts.application, 80);
	assert.equal(graph.counts.alias, 1);
	assert.equal(graph.counts.heichel, 1);
});

function installEnvironment(router) {
	globalThis.location = { origin: "https://awtsmoos.test" };
	globalThis.fetch = async input => router(String(input));
}

function routeReply(path) {
	if (path === "/api/social/aliases") return reply({ success: ["coby"] });
	if (path === "/api/social/alias/default") return reply({ success: "coby" });
	if (path === "/api/social/alias/coby/heichelos/details") {
		return reply({ success: [{ id: "ikar", name: "Ikar" }] });
	}
	if (path.startsWith("/api/social/drive/coby/entries")) {
		return reply({ entries: [{ path: "Documents/Notes.awtdoc", type: "file" }] });
	}
	if (path === "/api/social/heichelos/ikar/series/") {
		return reply({ success: [{ id: "teachings", name: "Teachings" }] });
	}
	if (path === "/api/social/heichelos/ikar/series/root/posts/details") {
		return reply({ success: [{ id: "welcome", title: "Welcome" }] });
	}
	return reply({ error: { message: `Unexpected route ${path}` } }, 404);
}

function reply(value, status = 200) {
	return new Response(JSON.stringify(value), {
		status,
		headers: { "content-type": "application/json" }
	});
}
