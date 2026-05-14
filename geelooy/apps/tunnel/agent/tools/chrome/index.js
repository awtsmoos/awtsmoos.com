
// B"H
const {
  chromeFind,
  chromeLaunch,
  chromeStatus,
  chromeNavigate,
  chromeEval,
  chromeWaitForSelector,
  chromeClick,
  chromeType,
  chromeRunScript
} = require("./actions.js");

async function handleChrome(payload = {}) {
  if (payload.action === "chromeFind") return await chromeFind(payload);
  if (payload.action === "chromeLaunch") return await chromeLaunch(payload);
  if (payload.action === "chromeStatus") return await chromeStatus(payload);
  if (payload.action === "chromeNavigate") return await chromeNavigate(payload);
  if (payload.action === "chromeEval") return await chromeEval(payload);
  if (payload.action === "chromeWaitForSelector") return await chromeWaitForSelector(payload);
  if (payload.action === "chromeClick") return await chromeClick(payload);
  if (payload.action === "chromeType") return await chromeType(payload);
  if (payload.action === "chromeRunScript") return await chromeRunScript(payload);

  return {
    ok: false,
    action: payload.action,
    error: "unknown_chrome_action"
  };
}

module.exports = { handleChrome };
