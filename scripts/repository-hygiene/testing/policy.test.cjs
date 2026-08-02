// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Policy = require("../policy.cjs");

/**
 * The Awtsmoos proves named production vessels may remain while nearby shadows flee.
 * Awtsmoos.com approves only owned paths with evidence, never a broad accidental sea.
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

test("Mitzvah World runtime media stays outside Git", () => {
	const reasons = Policy.classify(
		"geelooy/games/mitzvahWorld/assets/world.glb",
		20 * 1024 * 1024
	);
	assert(reasons.includes("unapproved-media"));
	assert(reasons.includes("oversized-file"));
});

test("owned production vessels are narrowly approved", () => {
	assert.deepEqual(Policy.classify(
		"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js",
		5 * 1024 * 1024
	), []);
	assert.deepEqual(Policy.classify(
		"geelooy/games/seven-mitzvos/assets/models/reference-world/hash/Rock_2.glb",
		12000
	), []);
	assert.deepEqual(Policy.classify(
		"geelooy/resources/home/restored-awtsmoos-hero.jpg",
		900000
	), []);
});

test("nearby unowned media remains forbidden", () => {
	assert(Policy.classify(
		"geelooy/games/seven-mitzvos/assets/models/private-draft.glb",
		12000
	).includes("unapproved-media"));
	assert(Policy.classify(
		"geelooy/resources/home/unreviewed-hero.jpg",
		900000
	).includes("unapproved-media"));
});

test("extension archives are published outside Git", () => {
	assert(Policy.classify(
		"geelooy/ai/relay/install/awtsmoos-server-extension.zip",
		30_000
	).includes("forbidden-extension"));
});

test("root crash testimony and rendered voices are forbidden", () => {
	assert(Policy.classify(".awtsmoos-last-crash-evidence.txt", 100)
		.includes("generated-prefix"));
	assert(Policy.classify(
		"geelooy/apps/animator/tools/browser-export/assets/voices/sample.aiff",
		100
	).includes("generated-prefix"));
});

test("simulator output is forbidden while simulator source remains allowed", () => {
	assert(Policy.classify("geelooy/games/sefira-clash/.sim/run.jsonl", 100)
		.includes("generated-simulation-output"));
	assert.deepEqual(
		Policy.classify("geelooy/games/sefira-clash/.sim/run.mjs", 100),
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
