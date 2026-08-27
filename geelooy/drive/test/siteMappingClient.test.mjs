//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves canonical mapping requests ride the same-origin session and carry no secret invention;
 * Awtsmoos.com keeps alias/site identity encoded, methods exact, and HTTP authority failures visible to the caller.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { SiteMappingClient } from "../transport/siteMappingClient.js";

function response(status, payload, statusText = "") {
	return {
		ok: status >= 200 && status < 300,
		status,
		statusText,
		json: async () => payload
	};
}

function harness(replies) {
	const calls = [];
	const queue = [...replies];
	const fetchImpl = async (url, options) => {
		calls.push({ url, options });
		return queue.shift();
	};
	return {
		client: new SiteMappingClient({ fetchImpl }),
		calls
	};
}

test("lists mappings with same-origin credentials and encoded alias", async () => {
	const subject = harness([response(200, { sites: [{ id: "main" }] })]);
	const sites = await subject.client.listSites("my alias");
	assert.deepEqual(sites, [{ id: "main" }]);
	assert.equal(subject.calls[0].url, "/api/social/drive/my%20alias/sites");
	assert.equal(subject.calls[0].options.method, "GET");
	assert.equal(subject.calls[0].options.credentials, "same-origin");
	assert.equal(subject.calls[0].options.headers.accept, "application/json");
	assert.equal(subject.calls[0].options.headers.authorization, undefined);
});

test("upsert sends only the canonical mapping body", async () => {
	const subject = harness([response(200, { site: { id: "docs", canonicalPath: "/sites/a/docs/" } })]);
	const site = await subject.client.upsertSite({
		aliasId: "a",
		siteId: "docs v2",
		rootPath: "sites/light",
		enabled: true
	});
	assert.equal(site.id, "docs");
	const call = subject.calls[0];
	assert.equal(call.url, "/api/social/drive/a/sites/docs%20v2");
	assert.equal(call.options.method, "PUT");
	assert.equal(call.options.headers["content-type"], "application/json");
	assert.deepEqual(JSON.parse(call.options.body), {
		rootPath: "sites/light",
		enabled: true
	});
});

test("delete sends no body and preserves item identity", async () => {
	const subject = harness([response(200, { site: { deleted: true, siteId: "docs" } })]);
	const site = await subject.client.deleteSite({ aliasId: "alpha", siteId: "docs" });
	assert.equal(site.deleted, true);
	assert.equal(subject.calls[0].options.method, "DELETE");
	assert.equal(subject.calls[0].options.body, undefined);
	assert.equal(subject.calls[0].options.headers["content-type"], undefined);
});

test("authority failures retain status, code, and needed scope", async () => {
	const subject = harness([response(403, {
		error: {
			code: "DRIVE_SCOPE_REQUIRED",
			message: "Write scope required.",
			neededScope: "drive.write"
		}
	})]);
	await assert.rejects(
		() => subject.client.listSites("alpha"),
		error => {
			assert.equal(error.status, 403);
			assert.equal(error.code, "DRIVE_SCOPE_REQUIRED");
			assert.equal(error.neededScope, "drive.write");
			return true;
		}
	);
});

test("invalid success shapes fail loudly", async () => {
	const subject = harness([response(200, { ok: true })]);
	await assert.rejects(
		() => subject.client.listSites("alpha"),
		error => error.code === "SITE_MAPPING_INVALID_RESPONSE"
	);
});
