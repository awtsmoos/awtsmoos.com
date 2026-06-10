// B"H
const { handleChatgptRelay } = require("./chatgptRelay.js");
const { jsonRelay } = require("./jsonRelay.js");

const ACTIONS = Object.freeze({
  relayHealth: true,
  relayOpenLogin: true,
  relayCookies: true,
  relayFetch: true,
  relayBody: true,
  jsonRelay: true,
  jasonRelay: true
});

/**
 * Chapter 6: Two Relays, One Crown, No Confusion.
 *
 * ChatGPT relay and JSON/Jason relay share a tunnel action family but never
 * share cookies or stream state. The Awtsmoos separates their vessels so each
 * gate answers in its own language.
 *
 * @param {object} payload Tunnel payload.
 * @param {object} config Loaded config.
 * @returns {Promise<object>} Relay result.
 */
async function handleRelay(payload = {}, config = {}) {
  const action = payload.action || payload.relayAction || "relayHealth";
  if (action === "jsonRelay" || action === "jasonRelay") return await jsonRelay(payload);
  return await handleChatgptRelay({ ...payload, action }, config);
}

module.exports = { ACTIONS, handleRelay, jsonRelay };
