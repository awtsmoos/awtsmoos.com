#!/usr/bin/env node
// B"H

const path = require("node:path");
const Bundle = require("../lib/diagnostics/bundle.js");

/**
 * @file Creates one redacted Awtsmoos Tunnel incident bundle.
 * @description
 * The Awtsmoos opens a bounded witness under the private recovery root so diagnosis
 * survives the very process failure it describes. No credential or private key is read.
 */
function main(argumentsList = process.argv.slice(2)) {
	const installRoot = path.resolve(argumentsList[0] || process.env.AWTSMOOS_INSTALL_ROOT || __dirname, "..");
	const recoveryRoot = argumentsList[1] || process.env.AWTSMOOS_RECOVERY_ROOT;
	const result = Bundle.create({ installRoot, recoveryRoot });
	process.stdout.write(`${JSON.stringify(result)}\n`);
	return result;
}

if (require.main === module) {
	try {
		main();
	} catch (error) {
		process.stderr.write(`${error.stack || error.message}\n`);
		process.exitCode = 1;
	}
}

module.exports = {
	main
};
