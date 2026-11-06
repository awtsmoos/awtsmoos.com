#!/usr/bin/env node
// B"H

/**
 * @file scripts/maintenance_gc.js
 * @chapter The Scheduled Sweep Has A Door Of Its Own
 * @description
 * Operator/CLI form of the §8.3 scheduled reclamation: opens one packed
 * store exclusively, runs maintenance gc() (verify + adopt complement +
 * seal + fsync), prints the storage-health report, and exits non-zero
 * when verify fails or unreachable bytes cross the alert threshold.
 *
 * Run this from cron or after a big import when the server is stopped
 * or the file is otherwise quiesced — it takes the exclusive process
 * lock, so it refuses to run while the server holds the file. It never
 * rewrites the file in place beyond the engine's own gc() bookkeeping.
 *
 * Usage:
 *   node scripts/maintenance_gc.js FILE [--alert-bytes N] [--alert-fraction F]
 *   node scripts/maintenance_gc.js FILE --check-only
 * `--check-only` prints the health report without running gc().
 */

const path = require('path');
const AwtsmoosDB = require('../index.js');

function parseArguments(argv) {
	const positional = [];
	const options = {};
	for (let index = 0; index < argv.length; index++) {
		const value = argv[index];
		if (value === '--alert-bytes') options.unreachableAlertBytes = Number(argv[++index]);
		else if (value === '--alert-fraction') options.unreachableAlertFraction = Number(argv[++index]);
		else if (value === '--check-only') options.checkOnly = true;
		else positional.push(value);
	}
	if (positional.length !== 1) return null;
	return { file: path.resolve(positional[0]), options };
}

function usage() {
	console.error('B"H usage: maintenance_gc.js FILE [--alert-bytes N] [--alert-fraction F] [--check-only]');
	console.error('Opens FILE exclusively, runs gc() + storage health, exits 1 on alert.');
}

function main(argv = process.argv.slice(2)) {
	const parsed = parseArguments(argv);
	if (!parsed) {
		usage();
		return 2;
	}
	const db = new AwtsmoosDB(parsed.file, { reuseFreedSpace: 'verified' });
	try {
		db.open();
		if (parsed.options.checkOnly) {
			const health = db.checkStorageHealth(parsed.options);
			console.log(JSON.stringify(health, null, 2));
			return health.ok ? 0 : 1;
		}
		const result = db.maintenanceGc({ ...parsed.options, reason: 'cli' });
		console.log(JSON.stringify(result, null, 2));
		return result.ok ? 0 : 1;
	} finally {
		try { db.close(); } catch (_error) {}
	}
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
