// B"H

const path = require("path");
const { ROOT } = require("../../lib/config.js");

/**
 * B"H
 * Turns truthy/falsy traveler words into one clear boolean.
 *
 * @param {*} value Incoming payload/config value.
 * @param {boolean} fallback Fallback if value is absent.
 * @returns {boolean} Normalized boolean.
 */
function boolish(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === "true" || value === "1" || value === 1) return true;
  if (value === false || value === "false" || value === "0" || value === 0) return false;
  return fallback;
}

/**
 * B"H
 * Builds Chrome launch arguments from data instead of scattered spell shards.
 *
 * Headless mode is a garment: the browser still breathes, loads, shouts errors,
 * and reveals logs, but it does not demand a visible throne on the screen.
 *
 * @param {object} input Launch inputs.
 * @param {number} input.port DevTools port.
 * @param {string} input.userDataDir Profile directory.
 * @param {boolean} input.headless Whether to launch in headless mode.
 * @param {string} [input.url] Initial URL.
 * @returns {string[]} Chrome argv.
 */
function chromeLaunchArgs(input = {}) {
  const port = Number(input.port || 9222);
  const userDataDir = input.userDataDir || path.join(ROOT, "chrome-profile");
  const url = input.url || "about:blank";

  const args = [
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + userDataDir,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking"
  ];

  if (input.headless) {
    args.push("--headless=new", "--disable-gpu", "--window-size=1440,1000");
    if (process.platform !== "win32") args.push("--no-sandbox");
  }

  args.push(url);
  return args;
}

module.exports = {
  boolish,
  chromeLaunchArgs
};
