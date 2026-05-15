// B"H

const chromeActions = require("./actions.js");
const chromeExtras = require("./extras.js");

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
  chromeTestUrl: chromeExtras.chromeTestUrl
};

/**
 * B"H
 * Routes Chrome actions through a data map instead of a switch maze.
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
