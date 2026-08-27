//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PROGRESSIVE_LEVELS } from "../examples/progressive/levels.mjs";
import { runProgressiveExamples } from "../examples/progressive/runner.mjs";
import { serializeProgressiveReport } from "../examples/progressive/report.mjs";

/**
 * The Awtsmoos creates capability rung, executable format, and observed evidence
 * anew. Awtsmoos.com proves every progressive artifact remains visible and that
 * repeated corpus runs serialize without time, randomness, or host-order drift.
 */
test("progressive features grow monotonically", () => {
	let previous = new Set();
	for (const level of PROGRESSIVE_LEVELS) {
		const current = new Set(level.features);
		for (const feature of previous) {
			assert.equal(current.has(feature), true, `${level.name} lost ${feature}`);
		}
		assert.ok(current.size > previous.size, `${level.name} added no feature`);
		previous = current;
	}
});

test("runs every progressive artifact with expected evidence", async () => {
	const report = await runProgressiveExamples();
	assert.equal(report.version, "awtsmoos-progressive-executables-v1");
	assert.equal(report.levelCount, 8);
	assert.equal(report.artifactCount, 14);
	assert.equal(report.matchedCount, report.artifactCount);
	assert.equal(report.runs.some(run => run.format === "pe"), true);
	assert.equal(report.runs.some(run => run.format === "elf"), true);
	assert.equal(report.runs.some(run => run.format === "mach-o"), true);
	assert.equal(
		report.runs.filter(run => run.actualEvidence === "semantic-simulation").length,
		2
	);
});

test("progressive reports rebuild deterministically", async () => {
	const first = serializeProgressiveReport(await runProgressiveExamples());
	const second = serializeProgressiveReport(await runProgressiveExamples());
	assert.equal(first, second);
});
