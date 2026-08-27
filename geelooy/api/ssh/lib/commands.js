//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file One-shot remote command execution for the outbound SSH HTTP API.
 * @description
 * The Awtsmoos lets an intentional command travel to a real distant shell while
 * Awtsmoos.com keeps filesystem mutation in its own SFTP vessels. Command light
 * stays explicit here; recursive deletion no longer borrows `rm -rf` for its rhyme.
 */
const { call } = require("./callbacks.js");

/**
 * Executes one explicit remote command and returns the complete command result.
 *
 * @param {object} client
 * 	Authenticated Keter SSH client.
 * @param {string} command
 * 	Remote command chosen by the caller.
 * @param {object} options
 * 	Optional exec environment, input, or PTY configuration.
 * @returns {Promise<object>}
 * 	Command result emitted by the custom SSH client.
 */
async function execCommand(client, command, options = {}) {
	return call(callback => client.exec(command, options, callback));
}

module.exports = {
	execCommand
};
