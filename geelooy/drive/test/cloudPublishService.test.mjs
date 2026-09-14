//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { CloudPublishService } from "../services/cloudPublishService.js";

/**
 * @file Proves Builder-to-Cloud promotion preserves current production until immutable replacement testimony exists.
 * @description The Awtsmoos lets tests model publication ordering without touching an account while Awtsmoos.com verifies source filtering, first launch, immutable republish, and legacy freeze behavior.
 */
function harness(existing = null) {
	const calls = [];
	const client = {
		aliases: async () => ["alpha"],
		listSites: async () => existing ? [existing] : [],
		bootstrap: async input => {
			calls.push(["bootstrap", input]);
			return { site: { id: input.siteId, enabled: input.enabled, source: existing?.source } };
		},
		deploy: async input => {
			calls.push(["deploy", input]);
			const id = calls.filter(call => call[0] === "deploy").length === 1 && existing?.source?.kind !== "drive-deployment" ? "d-freeze" : "d-new";
			return { deployment: { id }, site: { id: input.siteId, enabled: Boolean(existing?.enabled), source: { kind: "drive-deployment", deploymentId: id } } };
		},
		enableSite: async input => {
			calls.push(["enable", input]);
			return { id: input.siteId, enabled: true, source: { kind: "drive-deployment", deploymentId: "d-new" } };
		}
	};
	const canonicalCalls = [];
	const service = new CloudPublishService({
		state: { snapshot: () => ({ currentRoute: "browser-local", currentPath: "remix-demo", transportMode: "browser" }) },
		client,
		canonicalSite: {
			setTarget: value => canonicalCalls.push(["target", value]),
			refresh: async () => canonicalCalls.push(["refresh"])
		},
		bundleService: { async build() { return bundle(); } }
	});
	return { service, calls, canonicalCalls };
}

function bundle() {
	return {
		files: [
			{ path: "index.html", content: "<h1>B H</h1>" },
			{ path: "site.js", content: "//B H" },
			{ path: ".awtsmoos-remix-origin.json", content: "{}" }
		]
	};
}

test("first cloud publication stays disabled until immutable deployment exists", async () => {
	const subject = harness();
	const result = await subject.service.publish({ aliasId: "alpha", siteId: "Demo Site", title: "Demo" });
	assert.deepEqual(subject.calls.map(call => call[0]), ["bootstrap", "deploy", "enable"]);
	assert.equal(subject.calls[0][1].enabled, false);
	assert.equal(subject.calls[1][1].expectedDeploymentId, null);
	assert.deepEqual(subject.calls[0][1].files.map(file => file.path), ["index.html", "site.js"]);
	assert.equal(result.publicUrl, "/sites/alpha/demo-site/");
	assert.equal(result.site.enabled, true);
});

test("immutable republish keeps old revision active until replacement", async () => {
	const existing = { id: "demo", enabled: true, rootPath: "sites/demo", source: { kind: "drive-deployment", deploymentId: "d-old" } };
	const subject = harness(existing);
	await subject.service.publish({ aliasId: "alpha", siteId: "demo" });
	assert.deepEqual(subject.calls.map(call => call[0]), ["bootstrap", "deploy"]);
	assert.equal(subject.calls[0][1].enabled, true);
	assert.equal(subject.calls[1][1].expectedDeploymentId, "d-old");
});

test("legacy mutable Site freezes current public bytes before source replacement", async () => {
	const existing = { id: "demo", enabled: true, rootPath: "legacy/demo" };
	const subject = harness(existing);
	await subject.service.publish({ aliasId: "alpha", siteId: "demo" });
	assert.deepEqual(subject.calls.map(call => call[0]), ["deploy", "bootstrap", "deploy"]);
	assert.equal(subject.calls[0][1].rootPath, "legacy/demo");
	assert.equal(subject.calls[0][1].expectedDeploymentId, null);
	assert.equal(subject.calls[2][1].expectedDeploymentId, "d-freeze");
});

test("cloud publication requires an index entry before any network mutation", async () => {
	const subject = harness();
	subject.service.bundleService = { async build() { return { files: [{ path: "app.js", content: "//B H" }] }; } };
	await assert.rejects(subject.service.publish({ aliasId: "alpha", siteId: "demo" }), error => error.code === "CLOUD_INDEX_REQUIRED");
	assert.equal(subject.calls.length, 0);
});

test("cloud publication carries bounded signed Remix receipt separately from public files", async () => {
	const subject = harness();
	const receipt = { kind: "awtsmoos-site-remix-receipt-v1", payload: "claim", signature: "sig" };
	subject.service.bundleService = { async build() { return { files: [
		{ path: "index.html", content: "<h1>B H</h1>" },
		{ path: ".awtsmoos-remix-origin.json", content: JSON.stringify({ receipt }) }
	] }; } };
	await subject.service.publish({ aliasId: "alpha", siteId: "demo" });
	assert.deepEqual(subject.calls[0][1].remixReceipt, receipt);
	assert.equal(subject.calls[0][1].files.some(file => file.path.startsWith(".awtsmoos-remix-origin")), false);
});
