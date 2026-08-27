// B"H

"use strict";

const { call } = require("./callbacks.js");
const { quote } = require("./posix.js");

/**
 * Executes a command and returns the full command result.
 *
 * @param {object} client - Authenticated SSH client.
 * @param {string} command - Remote command.
 * @param {object} options - Exec options.
 * @returns {Promise<object>} Command result.
 */
async function execCommand(client, command, options = {}) {
  return await call((cb) => client.exec(command, options, cb));
}

/**
 * Removes a remote path using the shell because SFTP v3 has no recursive remove.
 *
 * @param {object} client - Authenticated SSH client.
 * @param {string} remotePath - Remote path to delete.
 * @returns {Promise<object>} Command result.
 */
async function removePath(client, remotePath) {
  return await execCommand(client, `rm -rf -- ${quote(remotePath)}`);
}

module.exports = {
  execCommand,
  removePath,
};
