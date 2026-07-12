#!/usr/bin/env node
// B"H

/**
 * @file scripts/compact_awtsdb.js
 * @chapter The Misleading Name Is Retired At The Gate
 * @description
 * Compatibility doorway that refuses the historical in-place behavior. True
 * compaction now requires an explicit destination and delegates to the verified
 * out-of-place vacuum command.
 */

const vacuumCli = require('./vacuum_awtsdb.js');

function main(argv = process.argv.slice(2)) {
	if (argv.length < 2 || argv[0].startsWith('-') || argv[1].startsWith('-')) {
		console.error('B"H compact_awtsdb.js no longer mutates a source database in place.');
		console.error('Provide SOURCE and DESTINATION, or invoke vacuum_awtsdb.js directly.');
		return 2;
	}
	return vacuumCli.main(argv);
}

if (require.main === module) {
	try {
		process.exitCode = main();
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = { main };
