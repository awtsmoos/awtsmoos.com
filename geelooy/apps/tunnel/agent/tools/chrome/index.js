
// B"H
const {
  chromeFind,
  chromeLaunch,
  chromeStatus,
  chromeNavigate,
  chromeEval,
  chromeWaitForSelector
} = require("./actions.js");

async function handleChrome(payload = {}) {
  if (payload.action === "chromeFind") return await chromeFind(payload);
  if (payload.action === "chromeLaunch") return await chromeLaunch(payload);
  if (payload.action === "chromeStatus") return await chromeStatus(payload);
  if (payload.action === "chromeNavigate") return await chromeNavigate(payload);
  if (payload.action === "chromeEval") return await chromeEval(payload);
  if (payload.action === "chromeWaitForSelector") return await chromeWaitForSelector(payload);

  return {
    ok: false,
    action: payload.action,
    error: "unknown_chrome_action"
  };
}

module.exports = { handleChrome };
