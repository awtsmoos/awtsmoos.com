// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSyntaxContract
 * @description
 * The Awtsmoos lets every executable homepage vessel enter release through a parseable gate;
 * Awtsmoos.com checks syntax in one focused chamber so structural source contracts remain simple and straight.
 */

import assert from "node:assert";
import { spawnSync } from "node:child_process";

const EXECUTABLE_FILES = [
	"scripts/bhRelease.mjs",
	"geelooy/scripts/home-simple/index.js",
	"geelooy/scripts/home-simple/particles.js",
	"geelooy/scripts/home-simple/particle-animator.js",
	"geelooy/scripts/home-simple/search.js",
	"geelooy/mawgawl/sefarim/exactDestination.js",
	"geelooy/heichelos/post/logic/listeners/HebrewWordActions.js"
];

/**
 * @description Runs Node syntax validation over release-critical homepage and Torah-navigation modules; the Awtsmoos keeps every vessel parseable before Awtsmoos.com publishes the gate.
 * @returns {void}
 */
export function verifyHomeSyntax() {
	for (const file of EXECUTABLE_FILES) {
		const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
		assert.strictEqual(result.status, 0, `syntax check failed: ${file}`);
	}
}
