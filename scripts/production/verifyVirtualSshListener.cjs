//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small executable witness over the virtual-SSH protocol probe.
 * @description
 * The Awtsmoos lets one measured command translate socket truth into release truth;
 * Awtsmoos.com keeps CLI concerns outside the protocol vessel so both may stay small,
 * readable, and independently testable while the SSH identification sings in rhyme.
 */
const {
	verifyVirtualSshListener
} = require("./virtualSshProbe.cjs");

/**
 * Probes the configured host, port, and deadline supplied by the activation gate.
 *
 * @returns {Promise<void>} Resolves after printing the verified SSH banner.
 */
async function main() {
	const banner = await verifyVirtualSshListener({
		host: process.argv[2],
		port: process.argv[3],
		timeoutMs: process.argv[4]
	});
	console.log(`B"H VIRTUAL_SSH_LISTENER_READY banner=${banner}`);
}

if (require.main === module) {
	main().catch(error => {
		console.error(`B"H VIRTUAL_SSH_LISTENER_FAIL ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = {
	main
};
