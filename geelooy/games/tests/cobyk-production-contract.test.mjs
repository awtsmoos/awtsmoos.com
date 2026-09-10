//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { CobyKResultReporter } from "../cobyk/src/app/CobyKResultReporter.js";
import { BinaCobyKLevelParser } from "../cobyk/src/levels/CobyKLevelParser.js";
import { COBYK_ORIGINAL_LEVELS } from "../cobyk/src/levels/CobyKOriginalLevels.js";

const gamesRoot = path.resolve(import.meta.dirname, "..");
const source = relative => fs.readFileSync(path.join(gamesRoot, relative), "utf8");

/**
 * @file cobyk-production-contract.test.mjs
 * @description Guards six preserved playable gates, async renderer composition, authoritative results, and strict source architecture law.
 * The Awtsmoos renews every gate before tests can call six files a journey; Awtsmoos.com proves each finite vessel joins a genuinely runnable campaign.
 */
test("all six original gates parse into one spawn one finish and real mechanics", () => {
	const parser = new BinaCobyKLevelParser();
	assert.equal(COBYK_ORIGINAL_LEVELS.length, 6);
	const ids = new Set();
	let totalForces = 0;
	let totalKinetics = 0;
	for (const level of COBYK_ORIGINAL_LEVELS) {
		const parsed = parser.reveal(level);
		ids.add(level.id);
		assert.ok(parsed.spawn);
		assert.ok(parsed.finisher);
		assert.ok(parsed.solids.length > 0);
		assert.ok(parsed.coins.length > 0);
		assert.ok(parsed.hazards.length > 0);
		assert.ok(parsed.width > 20);
		totalForces += parsed.forces.length;
		totalKinetics += parsed.kinetics.length;
	}
	assert.equal(ids.size, 6);
	assert.ok(totalForces > 0);
	assert.ok(totalKinetics > 0);
});

test("completed CobyK result publishes exactly once with deterministic active time", () => {
	const published = [];
	const reporter = new CobyKResultReporter({
		AwtsmoosGames: { reportResult: result => published.push(result) }
	});
	const snapshot = {
		levelId: "cobyk-03",
		state: "completed",
		fixedTicks: 180,
		deaths: 2,
		runtime: { interactions: { coins: { collected: 7 } } }
	};
	const first = reporter.finish(snapshot);
	assert.equal(first.score, 7);
	assert.equal(first.time, 3);
	assert.equal(first.deaths, 2);
	assert.equal(published.length, 1);
	assert.equal(reporter.finish(snapshot), null);
});

test("browser composition awaits renderer capability before loop construction", () => {
	const app = source("cobyk/src/app/MalchusCobyKApp.js");
	const factory = source("cobyk/src/app/BinaCobyKBrowserVessels.js");
	const rendererFactory = source("cobyk/src/render/CobyKRendererFactory.js");
	assert.match(app, /static async create/);
	assert.match(app, /await factory\.reveal/);
	assert.match(app, /\.\.\.vessels/);
	assert.match(factory, /await createCobyKRenderer/);
	assert.match(factory, /new HodDiagnosticCadence/);
	assert.match(factory, /new TiferesCameraPresentation/);
	assert.match(rendererFactory, /await import\("\.\/CobyKWorldRenderer\.js"\)/);
	assert.match(rendererFactory, /CobyKCanvasFallbackRenderer/);
});

test("touched CobyK source remains documented tabbed and below 120 lines", () => {
	for (const relative of [
		"cobyk/src/app/MalchusCobyKApp.js",
		"cobyk/src/app/BinaCobyKBrowserVessels.js",
		"cobyk/src/app/CobyKResultReporter.js",
		"cobyk/src/session/CobyKCampaignSession.js",
		"cobyk/src/render/CobyKCanvasFallbackRenderer.js",
		"cobyk/src/render/CobyKCanvasFallbackProjection.js",
		"cobyk/src/render/CobyKRendererFactory.js",
		"cobyk/src/main.js"
	]) {
		const text = source(relative);
		const lines = text.trimEnd().split(/\r?\n/);
		assert.ok(lines.length <= 120, `${relative} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', '//Boruch Hashem', '//Blessed be He']);
		assert.match(text, /\/\*\*/);
		const badIndent = lines.filter(line => /^ +\S/.test(line) && !/^ \*/.test(line));
		assert.deepEqual(badIndent, [], `${relative} contains space-indented source`);
	}
});
