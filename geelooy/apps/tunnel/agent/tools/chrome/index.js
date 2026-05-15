// B"H

const chromeActions = require("./actions.js");
const chromeExtras = require("./extras.js");
const chromeSession = require("./session.js");

const ACTIONS = {
  chromeFind: chromeActions.chromeFind,
  chromeLaunch: chromeActions.chromeLaunch,
  chromeStatus: chromeActions.chromeStatus,
  chromeNavigate: chromeActions.chromeNavigate,
  chromeEval: chromeActions.chromeEval,
  chromeWaitForSelector: chromeActions.chromeWaitForSelector,
  chromeClick: chromeActions.chromeClick,
  chromeType: chromeActions.chromeType,
  chromeLogs: chromeActions.chromeLogs,
  chromeSnapshot: chromeActions.chromeSnapshot,
  chromeRunScript: chromeActions.chromeRunScript,

  chromeScreenshot: chromeExtras.chromeScreenshot,
  chromeNetwork: chromeExtras.chromeNetwork,
  chromeAccessibilitySnapshot: chromeExtras.chromeAccessibilitySnapshot,
  chromeTestUrl: chromeExtras.chromeTestUrl,

  chromeCookies: chromeSession.chromeCookies,
  chromeCookieSet: chromeSession.chromeCookieSet,
  chromeCookieDelete: chromeSession.chromeCookieDelete,
  chromeStorage: chromeSession.chromeStorage,
  chromeStorageSet: chromeSession.chromeStorageSet,
  chromeStorageDelete: chromeSession.chromeStorageDelete,
  chromeSessionExport: chromeSession.chromeSessionExport,
  chromeSessionImport: chromeSession.chromeSessionImport,
  httpUseChromeCookies: chromeSession.httpUseChromeCookies,
  chromeUseHttpCookies: chromeSession.chromeUseHttpCookies
};

/**
 * B"H
 * Routes Chrome actions through a data map instead of a brittle switch maze.
 *
 * @param {object} payload Browser payload.
 * @returns {Promise<object>} Action result.
 */
async function handleChrome(payload = {}) {
  const fn = ACTIONS[payload.action];

  if (fn) return await fn(payload);

  return {
    ok: false,
    action: payload.action,
    error: "unknown_chrome_action",
    availableActions: Object.keys(ACTIONS)
  };
}

module.exports = { handleChrome };
