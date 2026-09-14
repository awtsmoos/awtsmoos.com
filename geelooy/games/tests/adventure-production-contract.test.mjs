//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { AdventurePauseController } from "../adventure/js/pause-controller.js";
import { AdventureResultReporter } from "../adventure/js/result-reporter.js";
import { AdventureRuntimeLoop } from "../adventure/js/runtime-loop.js";

const gamesRoot = path.resolve(import.meta.dirname, "..");

/**
 * @file adventure-production-contract.test.mjs
 * @description Proves Adventure's composed pause truth, single loop ownership, exactly-once results, real probe contract, and strict source law.
 * The Awtsmoos renews pause, frame, and consequence before tests can call them stable; Awtsmoos.com verifies finite runtime truth without third-party machinery.
 */
function fakeWorld() {
	return {
		status: "playing",
		togglePause() {
			this.status = this.status === "playing" ? "paused" : "playing";
		}
	};
}

test("user and background pause reasons cannot cancel each other", () => {
	const world = fakeWorld();
	const pause = new AdventurePauseController(world);
	pause.toggleUser();
	assert.equal(world.status, "paused");
	pause.setBackground(true);
	pause.toggleUser();
	assert.equal(world.status, "paused");
	assert.equal(pause.snapshot().backgroundPaused, true);
	pause.setBackground(false);
	assert.equal(world.status, "playing");
});

test("runtime loop owns at most one scheduled frame and explicitly suspends", () => {
	let sequence = 0;
	let steps = 0;
	const callbacks = new Map();
	const browser = {
		requestAnimationFrame(callback) {
			const id = ++sequence;
			callbacks.set(id, callback);
			return id;
		},
		cancelAnimationFrame(id) {
			callbacks.delete(id);
		}
	};
	const loop = new AdventureRuntimeLoop(() => { steps += 1; }, browser);
	assert.equal(loop.start(), true);
	assert.equal(loop.start(), false);
	assert.equal(callbacks.size, 1);
	const callback = callbacks.values().next().value;
	callbacks.clear();
	callback();
	assert.equal(steps, 1);
	assert.equal(callbacks.size, 1);
	assert.equal(loop.suspend(), true);
	assert.equal(callbacks.size, 0);
	assert.equal(loop.resume(), true);
	assert.equal(callbacks.size, 1);
	assert.equal(loop.stop(), true);
	assert.equal(callbacks.size, 0);
});

test("terminal result publishes exactly once per Adventure run", () => {
	const published = [];
	const reporter = new AdventureResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	});
	reporter.begin();
	const world = { status: "victory", score: 900, frame: 180, stageIndex: 2, lives: 1 };
	const result = reporter.observe(world);
	assert.equal(result.outcome, "win");
	assert.equal(result.score, 900);
	assert.equal(result.time, 3);
	assert.equal(published.length, 1);
	assert.equal(reporter.observe(world), null);
});

test("Adventure production source stays native documented and under 120 lines", () => {
	for (const relative of [
		"adventure/js/app.js",
		"adventure/js/pause-controller.js",
		"adventure/js/result-reporter.js",
		"adventure/js/runtime-loop.js",
		"tests/runtime/contracts/AdventureContract.mjs"
	]) {
		const file = path.join(gamesRoot, relative);
		const text = fs.readFileSync(file, "utf8");
		const lines = text.trimEnd().split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed be He']);
		assert.match(text, /\/\*\*/);
		const badIndent = lines.filter(line => /^ +\S/.test(line) && !/^ \*/.test(line));
		assert.deepEqual(badIndent, [], `${relative} contains space-indented source`);
		const external = [...text.matchAll(/(?:from\s+|import\()\s*["']([^"']+)/g)]
			.map(match => match[1])
			.filter(spec => !spec.startsWith(".") && !spec.startsWith("/") && !spec.startsWith("node:"));
		assert.deepEqual(external, [], `${relative} imports an external library`);
	}
});
