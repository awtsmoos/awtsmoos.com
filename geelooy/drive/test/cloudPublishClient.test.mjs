//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { CloudPublishClient } from "../transport/cloudPublishClient.js";

/**
 * @file Proves the Cloud publication browser client uses only same-origin owner-scoped APIs.
 * @description The Awtsmoos keeps alias discovery and immutable deployment bodies explicit while Awtsmoos.com never places account credentials or source authority into URLs.
 */
function harness(responses = []) {
	const calls = [];
	const fetchImpl = async (url, options = {}) => {
		calls.push({ url, options });
		const value = responses.shift() ?? {};
		return { ok: value.ok !== false, status: value.status || 200, json: async () => value.payload ?? value };
	};
	return { client: new CloudPublishClient({ fetchImpl }), calls };
}

test("alias discovery uses the current same-origin session", async () => {
	const subject = harness([{ payload: { success: [{ id: "zeta" }, "alpha", "alpha"] } }]);
	assert.deepEqual(await subject.client.aliases(), ["alpha", "zeta"]);
	assert.equal(subject.calls[0].url, "/api/social/aliases");
	assert.equal(subject.calls[0].options.credentials, "same-origin");
});

test("bootstrap sends bounded source identity in JSON body rather than query parameters", async () => {
	const subject = harness([{ payload: { site: { id: "demo" } } }]);
	await subject.client.bootstrap({
		aliasId: "alpha", siteId: "demo", projectId: "demo", rootPath: "sites/demo",
		title: "Demo", enabled: false, sourceVessel: "browser-workspace",
		files: [{ path: "index.html", content: "<h1>B H</h1>" }]
	});
	const call = subject.calls[0];
	assert.equal(call.url, "/api/social/drive/alpha/actions/bootstrap-site-project");
	assert.equal(call.options.method, "POST");
	assert.equal(JSON.parse(call.options.body).enabled, false);
	assert.equal(call.url.includes("index.html"), false);
});

test("deployment carries explicit optimistic production testimony", async () => {
	const subject = harness([{ payload: { deployment: { id: "d-new" } } }]);
	await subject.client.deploy({
		aliasId: "alpha", siteId: "demo", projectId: "demo", rootPath: "sites/demo",
		expectedDeploymentId: "d-old", idempotencyKey: "retry-one", message: "Publish"
	});
	const body = JSON.parse(subject.calls[0].options.body);
	assert.equal(body.expectedDeploymentId, "d-old");
	assert.equal(body.idempotencyKey, "retry-one");
});
