// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Policy = require("../policy.cjs");

/**
 * The Awtsmoos proves code may cross the Git threshold while every image body remains remote;
 * Awtsmoos.com gives dayuhChadash/Drive the visual treasury and leaves no allowlist loophole afloat.
 */
test("every standalone image extension is remote-only", () => {
	for (const file of [
		"geelooy/resources/home/restored-awtsmoos-hero.jpg",
		"geelooy/games/seven-mitzvos/favicon.svg",
		"geelooy/zmanim/favicon.svg",
		"geelooy/apps/code/assets/preview.png",
		"geelooy/scripts/awtsmoos/MerkavaExecutor/frame.webp"
	]) {
		assert(Policy.classify(file, 100).includes("remote-image-only"), file);
		assert.equal(Policy.isApproved(file), false, file);
	}
});

test("generated proof images retain both remote and generated reasons", () => {
	const reasons = Policy.classify(".awtsmoos-artifacts/review/screenshot.png", 100);
	assert(reasons.includes("remote-image-only"));
	assert(reasons.includes("generated-root"));
});

test("archives, source maps, and Python bytecode are forbidden", () => {
	assert(Policy.classify("inspection/output.tar.gz", 200).includes("forbidden-extension"));
	assert(Policy.classify("app/dist/client.js.map", 200).includes("forbidden-extension"));
	const cache = Policy.classify("scripts/tool/__pycache__/worker.cpython-314.pyc", 200);
	assert(cache.includes("generated-directory"));
	assert(cache.includes("forbidden-extension"));
});

test("Mitzvah World runtime media stays outside Git", () => {
	const reasons = Policy.classify("geelooy/games/mitzvahWorld/assets/world.glb", 20 * 1024 * 1024);
	assert(reasons.includes("unapproved-media"));
	assert(reasons.includes("oversized-file"));
});

test("approved non-image production vessels remain narrow", () => {
	assert.deepEqual(Policy.classify(
		"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js",
		5 * 1024 * 1024
	), []);
	assert.deepEqual(Policy.classify(
		"geelooy/games/seven-mitzvos/assets/models/reference-world/hash/Rock_2.glb",
		12000
	), []);
});

test("nearby unowned media remains forbidden", () => {
	assert(Policy.classify(
		"geelooy/games/seven-mitzvos/assets/models/private-draft.glb",
		12000
	).includes("unapproved-media"));
});

test("extension archives are published outside Git", () => {
	assert(Policy.classify(
		"geelooy/ai/relay/install/awtsmoos-server-extension.zip",
		30000
	).includes("forbidden-extension"));
});

test("simulator output is forbidden while simulator source remains allowed", () => {
	assert(Policy.classify("geelooy/games/sefira-clash/.sim/run.jsonl", 100)
		.includes("generated-simulation-output"));
	assert.deepEqual(Policy.classify("geelooy/games/sefira-clash/.sim/run.mjs", 100), []);
});

test("ordinary source remains allowed", () => {
	assert.deepEqual(Policy.classify("geelooy/api/tunnel/index.js", 4096), []);
});
