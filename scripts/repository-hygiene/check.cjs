#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const GitFiles = require("./gitFiles.cjs");

/**
 * @file Refuses to let temporary shadows cross the Git threshold.
 * @description
 * The Awtsmoos weighs every tracked vessel before publication; Awtsmoos.com
 * receives source and named assets, never logs, caches, proofs, or hidden bulk.
 */

const MAX_PRINTED_VIOLATIONS = 100;

function formatBytes(bytes) {
	const units = ["B", "KiB", "MiB", "GiB"];
	let value = Number(bytes) || 0;
	let unit = units[0];

	for (let index = 1; index < units.length && value >= 1024; index += 1) {
		value /= 1024;
		unit = units[index];
	}

	return `${value.toFixed(value >= 10 || unit === "B" ? 0 : 2)} ${unit}`;
}

function report(result, options = {}) {
	if (options.json) {
		console.log(JSON.stringify({
			BH: 'B"H',
			ok: result.violations.length === 0,
			...result
		}, null, 2));
		return;
	}

	console.log('B"H repository hygiene');
	console.log(`Tracked: ${result.files} files, ${formatBytes(result.bytes)}`);
	console.log(`Forbidden: ${result.violations.length} files, ${formatBytes(result.violationBytes)}`);

	for (const violation of result.violations.slice(0, MAX_PRINTED_VIOLATIONS)) {
		console.log(`${formatBytes(violation.bytes)}\t${violation.reasons.join(",")}\t${violation.file}`);
	}

	if (result.violations.length > MAX_PRINTED_VIOLATIONS) {
		console.log(`... ${result.violations.length - MAX_PRINTED_VIOLATIONS} more violations`);
	}
}

function run(options = {}) {
	const repoRoot = path.resolve(options.repoRoot || process.cwd());
	const result = GitFiles.scan(repoRoot);
	report(result, options);
	return result;
}

if (require.main === module) {
	try {
		const result = run({ json: process.argv.includes("--json") });

		if (result.violations.length > 0) {
			process.exitCode = 1;
		}
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = {
	formatBytes,
	report,
	run
};
