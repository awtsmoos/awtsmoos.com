//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { OhrboundResultReporter } from "../src/app/OhrboundResultReporter.js";

const root = path.resolve(import.meta.dirname, "..");
const source = relative => fs.readFileSync(path.join(root, relative), "utf8");

/** Reject space-indented source while permitting conventional JSDoc star alignment. */
function assertTabIndented(lines, relative) {
	for (const [index, line] of lines.entries()) {
		if (!/^ +/.test(line) || /^ \*/.test(line) || !line.trim()) continue;
		assert.fail(`${relative}:${index + 1} uses space indentation`);
	}
}

/** Prove one gate publishes once without requiring shared runtime presence. */
test("gate result reporting is exactly once and locally optional", () => {
	const published = [];
	const reporter = new OhrboundResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	});
	reporter.begin("garden-1");
	const result = reporter.finish("garden-1", 7);
	assert.equal(result.score, 7);
	assert.equal(result.level, "garden-1");	assert.equal(published.length, 1);
	assert.equal(reporter.finish("garden-1", 9), null);
});

test("campaign startup dependencies fail open to guest/local play", () => {
	const identity = source("src/network/AwtsmoosIdentityGateway.js");
	const community = source("src/app/CommunityService.js");
	const progress = source("src/persistence/ProgressRepository.js");
	assert.match(identity, /catch\s*\{[\s\S]*return this\.guest\(\)/);
	assert.match(community, /catch\s*\{[\s\S]*return \[\]/);
	assert.match(progress, /try\s*\{[\s\S]*loadProgress[\s\S]*\}\s*catch\s*\{\}/);
});

test("game loop explicitly suspends hidden-page simulation", () => {
	const loop = source("src/app/GameLoop.js");
	assert.match(loop, /visibilitychange/);
	assert.match(loop, /if \(this\.hidden\)/);
	assert.match(loop, /this\.clock\.reset\(\)/);
});

test("touched Ohrbound source remains modular and documented", () => {
	for (const relative of [
		"src/app/OhrboundApp.js",
		"src/app/OhrboundResultReporter.js",
		"src/app/GameLoop.js"
	]) {
		const text = source(relative);
		const contentLines = text.trimEnd().split(/\r?\n/);
		assert.ok(contentLines.length <= 120, `${relative} exceeds 120 lines`);		assert.equal(contentLines[0], '//B"H');
		assert.equal(contentLines[1], '//Boruch Hashem');
		assert.equal(contentLines[2], '//Blessed be He');
		assert.match(text, /\/\*\*/);
		assertTabIndented(contentLines, relative);
	}
});
