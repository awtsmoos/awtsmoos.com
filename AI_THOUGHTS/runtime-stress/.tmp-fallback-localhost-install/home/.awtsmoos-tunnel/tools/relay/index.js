// B"H
const { handleChatgptRelay } = require("./chatgptRelay.js");
const { handleBrowserRelay } = require("./browserApi.js");
const { jsonRelay } = require("./jsonRelay.js");

const ACTIONS = Object.freeze({
  relayHealth: true,
  relayOpenLogin: true,
  relayCookies: true,
  relayFetch: true,
  relayBody: true,
  relayBrowserStatus: true,
  relayBrowserLaunch: true,
  relayBrowserNavigate: true,
  relayBrowserEval: true,
  relayBrowserRun: true,
  relayBrowserFetch: true,
  relayBrowserCdp: true,
  relayBrowserCookies: true,
  relayBrowserSetCookie: true,
  relayBrowserDeleteCookie: true,
  relayBrowserStorage: true,
  relayBrowserStorageSet: true,
  relayBrowserStorageDelete: true,
  relayBrowserSessionExport: true,
  relayBrowserSessionImport: true,
  relayJarList: true,
  relayJarCookies: true,
  relayJarSetCookie: true,
  relayJarDeleteCookie: true,
  relayJarClear: true,
  relaySyncChromeToJar: true,
  relaySyncJarToChrome: true,
  relayChatgptCookieHeader: true,
  jsonRelay: true,
  jasonRelay: true
});

/**
 * Chapter 21: The Relay Crown Held Browser Fetch Beside Node Fetch.
 *
 * ChatGPT fetch, browser-context fetch, raw CDP, full browser API, JSON/Jason,
 * cookie jars, and jar/browser synchronization now meet in one routed action
 * family. The Awtsmoos assigns each action to its proper vessel.
 *
 * @param {object} payload Tunnel payload.
 * @param {object} config Loaded config.
 * @returns {Promise<object>} Relay result.
 */
async function handleRelay(payload = {}, config = {}) {
  const action = payload.action || payload.relayAction || "relayHealth";
  if (action === "jsonRelay" || action === "jasonRelay") return await jsonRelay(payload);
  if (/^(relayBrowser|relayJar|relaySync|relayChatgptCookieHeader)/.test(action)) return await handleBrowserRelay({ ...payload, action });
  return await handleChatgptRelay({ ...payload, action }, config);
}

module.exports = { ACTIONS, handleRelay, jsonRelay };
