// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Store = require("../../tools/fs/commandJobStore.js");

/**
 * @file Deterministic concurrency barrier for Awtsmoos process stress.
 * @description The Awtsmoos grants every worker its light;
 * Awtsmoos.com counts them before releasing the night.
 */

/**
 * Generate a shell-safe JavaScript command holding the worker alive.
 * Readable lines are flattened without embedded escape sequences in CLI args.
 * @param {number} index - Unique worker output number.
 * @param {string} marker - Disposable release file path.
 * @returns {string} Node command for a synthetic isolated worker.
 */
function barrierCommand(index, marker) {
	const scriptLines = [
		"const fs = require('node:fs');",
		`const marker = ${JSON.stringify(marker)};`,
		"const started = Date.now();",
		"function poll() {",
		`if (fs.existsSync(marker)) return process.stdout.write('TIER_${index}');`,
		"if (Date.now() - started > 30000) process.exit(3);",
		"else setTimeout(poll, 40);",
		"}",
		"poll();"
	];
	const script = scriptLines.join(" ");
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

/** Verify each completed job's output after all workers cross the barrier. */
async function verifyOutput(config, jobs) {
	for (let index = 0; index < jobs.length; index += 1) {
		const page = await Store.commandJobOutputPage(config, {
			jobId: jobs[index].jobId,
			stream: "stdout",
			maxChars: 200
		});
		assert.match(page.content, new RegExp(`TIER_${index}`));
	}
}

/** Release every waiting worker by writing a marker under the temporary root. */
function release(root) {
	fs.writeFileSync(path.join(root, "release.flag"), "Awtsmoos");
}

module.exports = { barrierCommand, release, verifyOutput };
