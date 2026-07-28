// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Policy = require("../policy.cjs");

/**
 * @file Proves temporary shadows remain outside the repository gate.
 * @description
 * The Awtsmoos preserves named public vessels while Awtsmoos.com rejects proofs,
 * accidental archives, caches, and silent bulk before they harden into Git history.
 */

test("generated proof images are forbidden", () => {
	const reasons = Policy.classify(".awtsmoos-artifacts/review/screenshot.png", 100);
	assert(reasons.includes("generated-root"));
	assert(reasons.includes("unapproved-media"));
});

test("archives and source maps are forbidden", () => {
	assert(Policy.classify("inspection/output.tar.gz", 200).includes("forbidden-extension"));
	assert(Policy.classify("app/dist/client.js.map", 200).includes("forbidden-extension"));
});

test("approved Mitzvah World assets may exceed the generic size limit", () => {
	assert.deepEqual(
		Policy.classify("geelooy/games/mitzvahWorld/assets/world.glb", 20 * 1024 * 1024),
		[]
	);
});

test("the canonical extension package is an approved public distributable", () => {
	assert.deepEqual(
		Policy.classify("geelooy/ai/relay/install/awtsmoos-server-extension.zip", 30_000),
		[]
	);
});

test("diagnostic source code may live in a logs namespace", () => {
	assert.deepEqual(Policy.classify(
		"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/logs/DiagnosticLedger.js",
		4096
	), []);
});

test("ordinary source remains allowed", () => {
	assert.deepEqual(Policy.classify("geelooy/api/tunnel/index.js", 4096), []);
});

test("unapproved oversized text is forbidden", () => {
	const reasons = Policy.classify("reports/giant-evidence.md", 3 * 1024 * 1024);
	assert(reasons.includes("generated-directory"));
	assert(reasons.includes("oversized-file"));
});
