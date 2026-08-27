// B"H

"use strict";

const { KeterClient } = require("../../../../ayzarim/ssh/Keter-Client.js");

/**
 * Opens and authenticates a Keter SSH client.
 *
 * @param {object} config - SSH connection config.
 * @returns {Promise<KeterClient>} An authenticated client.
 */
function connect(config) {
  return new Promise((resolve, reject) => {
    const client = new KeterClient();
    let settled = false;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) {
        try { client.end(); } catch (_) {}
        reject(err);
        return;
      }
      resolve(client);
    };

    client.once("authenticated", () => finish());
    client.once("error", finish);
    client.connect(config);
  });
}

/**
 * Runs work with an authenticated client and closes it afterward.
 *
 * @param {object} config - SSH connection config.
 * @param {Function} task - Async function receiving the client.
 * @returns {Promise<*>} Task result.
 */
async function withClient(config, task) {
  const client = await connect(config);
  try {
    return await task(client);
  } finally {
    try { client.end(); } catch (_) {}
  }
}

/**
 * Opens an SFTP session from an authenticated client.
 *
 * @param {KeterClient} client - Authenticated SSH client.
 * @returns {Promise<object>} Ready SFTP client.
 */
function openSftp(client) {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });
}

module.exports = {
  connect,
  withClient,
  openSftp,
};
