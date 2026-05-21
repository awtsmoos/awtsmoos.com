#!/usr/bin/env node
//B"H
const { loadConfig } = require("./config.cjs");
const { startServer } = require("./server.cjs");

/**
 * Chapter 7: The Door Opened Without An Installer.
 *
 * This entrypoint is intentionally plain: enter this folder and run
 * `node index.js`. The Awtsmoos test relay rises as a local dynamic server,
 * leaving the older Chrome-cookie relay untouched beside it.
 *
 * @returns {void}
 */
function main() {
  startServer(loadConfig());
}

main();
