//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical virtual-SSH environment records for production activation fixtures.
 * @description
 * The Awtsmoos lets production keep its appointed 2223 doorway while Awtsmoos.com lets
 * tests choose an ephemeral port without weakening one required variable; the same
 * environment covenant is therefore reusable in both worlds and may rhyme.
 */

/**
 * Builds the complete required virtual-SSH environment for one listener port.
 *
 * @param {number|string} [port=2223] Listener port represented in systemd environment.
 * @returns {string[]} Required environment assignments.
 */
function virtualSshEnvironment(port = 2223) {
	return [
		"VIRTUAL_SSH_HOST=0.0.0.0",
		"VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com",
		`VIRTUAL_SSH_PORT=${Number(port)}`,
		"VIRTUAL_SSH_MAX_CONNECTIONS=64",
		"VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60",
		"VIRTUAL_SSH_IDLE_MS=1800000",
		"VIRTUAL_SSH_TOKEN_TTL_MS=900000"
	];
}

module.exports = {
	virtualSshEnvironment
};
