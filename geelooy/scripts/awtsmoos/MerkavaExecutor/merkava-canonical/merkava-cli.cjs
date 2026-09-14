//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const { parseArguments } = require("./cli/Arguments.js");
const { executeCommand } = require("./cli/Commands.js");

/**
 * Canonical command-line entrypoint. All command handlers return structured
 * data so shell users, CI systems, and future graphical tools consume the same
 * deterministic result contract instead of scraping human-only output.
 */
async function main(argv = process.argv.slice(2)) {
	try {
		const request = parseArguments(argv);
		const result = await executeCommand(request);
		process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
		return result?.ok === false ? 1 : 0;
	} catch (error) {
		process.stderr.write(`${JSON.stringify({
			error: error?.message || String(error),
			ok: false
		}, null, 2)}\n`);
		return 1;
	}
}

if (require.main === module) {
	main().then(code => {
		process.exitCode = code;
	});
}

module.exports = {
	main
};
