#!/usr/bin/env node
// B"H

/**
 * @file scripts/vacuum_awtsdb.js
 * @chapter The Command Builds A Candidate And Refuses To Crown It
 * @description
 * Explicit out-of-place CLI. It never renames, swaps, archives, deletes, or
 * modifies the source database.
 */

const path = require('path');
const AwtsmoosDB = require('../index.js');

function parseArguments(argv) {
	const positional = [];
	const options = { compression: true };
	for (let index = 0; index < argv.length; index++) {
		const value = argv[index];
		if (value === '--manifest') options.manifestPath = path.resolve(argv[++index]);
		else if (value === '--no-compression') options.compression = false;
		else if (value === '--cleanup-on-failure') options.cleanupOnFailure = true;
		else positional.push(value);
	}
	if (positional.length !== 2) return null;
	return { source: positional[0], destination: positional[1], options };
}

function usage() {
	console.error('B"H usage: vacuum_awtsdb.js SOURCE DESTINATION [--manifest FILE] [--no-compression] [--cleanup-on-failure]');
	console.error('This command only builds and verifies an isolated candidate. It never swaps production files.');
}

function main(argv = process.argv.slice(2)) {
	const parsed = parseArguments(argv);
	if (!parsed) {
		usage();
		return 2;
	}
	if (!parsed.options.manifestPath) parsed.options.manifestPath = `${path.resolve(parsed.destination)}.vacuum-manifest.json`;
	const manifest = AwtsmoosDB.vacuumFile(parsed.source, parsed.destination, parsed.options);
	console.log(JSON.stringify(manifest, null, 2));
	return 0;
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
