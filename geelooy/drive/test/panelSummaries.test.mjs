//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves closed panels reveal concise truth without source or credentials. */

import test from "node:test";
import assert from "node:assert/strict";
import { panelSummary } from "../ui/panelSummaries.js";

test("editor summary exposes dirty state without source content", () => {
	const result = panelSummary("editor", {
		document: { name: "index.html", dirty: true, content: "private source" }
	});
	assert.deepEqual(result, { text: "index.html · Unsaved", badge: "•" });
	assert.equal(JSON.stringify(result).includes("private source"), false);
});

test("runtime and publish summaries surface live state concisely", () => {
	assert.deepEqual(panelSummary("runtime", { runtimeServer: { port: 8123 } }), { text: "Port 8123", badge: "LIVE" });
	assert.deepEqual(panelSummary("cloud", { transportCanPublish: true, previews: [{}, {}, {}] }), { text: "3 published previews", badge: "3" });
});

test("access summary distinguishes OS VFS from session and scoped key", () => {
	assert.deepEqual(panelSummary("access", { transportMode: "os" }), { text: "OS VFS", badge: "SAFE" });
	assert.deepEqual(panelSummary("access", { transportMode: "standalone", mutationCredentialConfigured: true }), { text: "Scoped key loaded", badge: "KEY" });
	assert.deepEqual(panelSummary("access", { transportMode: "standalone" }), { text: "Read session", badge: "" });
});
