// B"H
const path = require("path");
const { ROOT } = require("../../lib/config.js");

const CHATGPT = "https://chatgpt.com";
const STREAM_TTL_MS = 30 * 60 * 1000;

/**
 * Chapter 1: The Relay Crown Found Its Chamber In The Tunnel.
 *
 * Settings are the measured vessels. The Awtsmoos pours the same ChatGPT relay
 * light through tunnel config, environment variables, and safe defaults without
 * letting any one layer swallow the others.
 *
 * @param {object} config Loaded tunnel configuration.
 * @returns {object} Relay settings for ports, profile, and verbosity.
 */
function relaySettings(config = {}) {
  const relay = config.relayTools || {};
  const chrome = config.chrome || {};
  const debugPort = number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || relay.debugPort || chrome.port, 9223);
  return {
    chatgptOrigin: CHATGPT,
    port: number(process.env.AWTSMOOS_CHATGPT_RELAY_PORT || relay.port, 38487),
    debugPort,
    debugPortCandidates: unique([process.env.AWTSMOOS_CHROME_DEBUG_PORT, relay.debugPort, chrome.port, 9223, 9222, 9224, 9225]),
    profile: process.env.AWTSMOOS_CHROME_PROFILE || relay.profile || chrome.userDataDir || path.join(ROOT, "chrome-profile"),
    chromePath: process.env.CHROME_PATH || relay.chromePath || chrome.chromePath || chrome.path || "",
    chromeReadyMs: number(process.env.AWTSMOOS_CHROME_READY_MS || relay.chromeReadyMs, 12000),
    verbose: process.env.AWTSMOOS_RELAY_VERBOSE !== "0" && relay.verbose !== false
  };
}

function number(value, fallback) {
  const n = Number(value || fallback);
  return Number.isFinite(n) ? Math.max(1, Math.floor(n)) : fallback;
}

function unique(values) {
  return [...new Set(values.map(Number).filter(Number.isFinite))];
}

module.exports = { CHATGPT, STREAM_TTL_MS, relaySettings };
