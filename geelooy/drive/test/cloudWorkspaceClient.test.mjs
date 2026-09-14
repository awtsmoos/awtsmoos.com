//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { CloudWorkspaceClient } from "../transport/cloudWorkspaceClient.js";

/** Proves browser-native cloud CRUD stays same-origin, private, and path-bound. */
function harness(responses) {
	const calls = [];
	const fetchImpl = async (url, options = {}) => {
		calls.push({ url: String(url), options });
		const next = responses.shift();
		return new Response(next.body, {
			status: next.status || 200,
			headers: { "content-type": next.type || "application/json" }
		});
	};
	return { client: new CloudWorkspaceClient({ fetchImpl }), calls };
}

test("cloud aliases and bounded list use the current same-origin session", async () => {
	const subject = harness([
		{ body: JSON.stringify(["beta", "alpha", "alpha"]) },
		{ body: JSON.stringify({ entries: [{ path: "demo/index.html", type: "file" }] }) }
	]);
	assert.deepEqual(await subject.client.aliases(), ["alpha", "beta"]);
	await subject.client.list("alpha", "demo");
	assert.equal(subject.calls[0].options.credentials, "same-origin");
	assert.match(subject.calls[1].url, /\/api\/social\/drive\/alpha\/entries\?path=demo&limit=250$/);
});

test("cloud file writes and folders remain private by default", async () => {
	const subject = harness([
		{ body: JSON.stringify({ entry: { path: "demo/index.html" } }) },
		{ body: JSON.stringify({ entry: { path: "demo" } }) }
	]);
	await subject.client.write("alpha", "demo/index.html", "B\"H");
	await subject.client.mkdir("alpha", "demo");
	const writeBody = JSON.parse(subject.calls[0].options.body);
	const folderBody = JSON.parse(subject.calls[1].options.body);
	assert.deepEqual(writeBody, { text: "B\"H", visibility: "private" });
	assert.deepEqual(folderBody, { type: "folder", path: "demo", visibility: "private" });
	assert.match(subject.calls[0].url, /\/drive\/alpha\/entry\/demo\/index\.html$/);
});

test("cloud private read returns exact text bytes", async () => {
	const subject = harness([{ body: "<main>B\"H</main>", type: "text/html" }]);
	assert.equal(await subject.client.read("alpha", "demo/index.html"), "<main>B\"H</main>");
	assert.match(subject.calls[0].url, /\/entry\/demo\/index\.html\?content=true$/);
});

test("legacy HTTP-200 error envelopes still fail closed", async () => {
	const subject = harness([{
		body: JSON.stringify({ ok: false, error: { code: "ALIAS_FORBIDDEN" } })
	}]);
	await assert.rejects(
		subject.client.list("alpha"),
		error => error.code === "ALIAS_FORBIDDEN"
	);
});
