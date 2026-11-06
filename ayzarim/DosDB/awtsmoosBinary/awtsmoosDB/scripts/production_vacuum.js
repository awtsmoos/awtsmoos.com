#!/usr/bin/env node
// B"H

/**
 * @file scripts/production_vacuum.js
 * @chapter The Crossing Is Commanded, Never Improvised
 * @description
 * CLI for the §8.4 production vacuum procedure (core/swap/
 * productionVacuum.js). Builds a verified out-of-place candidate and
 * swaps it in through the manifest-gated atomic swap. It never rewrites
 * the live file in place and never runs a live vacuum on its own: the
 * server must already be stopped and writers quiesced — attest with
 * --server-stopped. The API smoke matrix gate must be closed by the
 * operator with --api-matrix-evidence; without it the procedure stops
 * before the swap.
 *
 * Usage:
 *   node scripts/production_vacuum.js LIVE --server-stopped [--work-dir DIR]
 *       [--candidate PATH] [--report PATH] [--api-matrix-evidence TEXT]
 *   node scripts/production_vacuum.js LIVE --dry-run [--api-matrix-evidence TEXT]
 *
 * The archived original is kept at the archive path in the report, and
 * the pre-swap live file is kept at the rollback path. Delete neither
 * until the next successful maintenance window.
 */

const { runProductionVacuum } = require('../core/swap/productionVacuum.js');

function parseArguments(argv) {
	const positional = [];
	const options = { serverStopped: false, dryRun: false, gates: {} };
	for (let index = 0; index < argv.length; index++) {
		const value = argv[index];
		if (value === '--server-stopped') options.serverStopped = true;
		else if (value === '--dry-run') options.dryRun = true;
		else if (value === '--work-dir') options.workDir = argv[++index];
		else if (value === '--candidate') options.candidatePath = argv[++index];
		else if (value === '--report') options.reportPath = argv[++index];
		else if (value === '--api-matrix-evidence') {
			options.gates.apiMatrixPassed = true;
			options.gates.apiMatrixEvidence = argv[++index];
		}
		else positional.push(value);
	}
	if (positional.length !== 1) return null;
	options.livePath = positional[0];
	return options;
}

function usage() {
	console.error('B"H usage: production_vacuum.js LIVE --server-stopped [--work-dir DIR] [--candidate PATH] [--report PATH] [--api-matrix-evidence TEXT]');
	console.error('B"H    or: production_vacuum.js LIVE --dry-run [--api-matrix-evidence TEXT]');
	console.error('The server must be stopped first. The API matrix gate needs --api-matrix-evidence.');
}

function main(argv = process.argv.slice(2)) {
	const options = parseArguments(argv);
	if (!options) {
		usage();
		return 2;
	}
	const report = runProductionVacuum(options);
	console.log(JSON.stringify(report, null, 2));
	return report.ok ? 0 : 1;
}

if (require.main === module) {
	try {
		process.exitCode = main();
	} catch (error) {
		console.error(error.stack || error.message);
		if (error.details) console.error(JSON.stringify(error.details, null, 2));
		process.exitCode = 1;
	}
}

module.exports = {
	main,
	parseArguments
};
