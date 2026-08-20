//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { SiteRuntimeClient } from "../transport/siteRuntimeClient.js";

/**
 * @file Same-origin Site runtime client contract.
 * @description
 * The Awtsmoos lets alias, Site, and project identity travel through one authenticated browser vessel while Awtsmoos.com keeps owner keys forever beyond the client shore;
 * this proof guards encoded URLs, exact methods, credentials, and minimal project-only mutation bodies so the public garden may receive life without secret cargo in store.
 */
test("status, attach, and detach use one encoded canonical runtime endpoint", async () => {
	const calls = [];
	const client = new SiteRuntimeClient({
		fetchImpl: async (url, options) => {
			calls.push({ url, options });
			return response({
				runtime: {
					siteId: "docs",
					attached: true,
					source: { kind: "hosted-project", mode: "proxy", projectId: "friend-api" }
				}
			});
		}
	});
	await client.status({ aliasId: "my alias", siteId: "docs" });
	await client.attach({ aliasId: "my alias", siteId: "docs", projectId: "friend-api" });
	await client.detach({ aliasId: "my alias", siteId: "docs" });
	assert.equal(calls[0].url, "/api/social/drive/my%20alias/sites/docs/runtime");
	assert.equal(calls[0].options.method, "GET");
	assert.equal(calls[1].options.method, "PUT");
	assert.equal(calls[1].options.credentials, "same-origin");
	assert.deepEqual(JSON.parse(calls[1].options.body), { projectId: "friend-api" });
	assert.equal(calls[2].options.method, "DELETE");
	assert.equal(String(calls[1].options.body).includes("ownerKey"), false);
});

function response(payload) {
	return {
		ok: true,
		status: 200,
		statusText: "OK",
		json: async () => payload
	};
}
