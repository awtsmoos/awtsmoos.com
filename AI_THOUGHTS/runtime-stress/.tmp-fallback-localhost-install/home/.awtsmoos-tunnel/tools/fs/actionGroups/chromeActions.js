// B"H
const chrome = require("../../chrome/actions.js");
const { wantsVirtualChrome, virtualChrome } = require("./virtualChromeActions.js");

/**
 * B"H
 * Chapter 413: One browser tongue, two bodies.
 * By default these actions use real Chrome/CDP. With engine=node-dom,
 * runtime=node-dom, or virtualDom=true, the same verbs run in the virtual DOM.
 */
function buildChromeActions(ctx) {
  const payload = ctx.payload || {};
  const route = action => wantsVirtualChrome(payload) ? virtualChrome(action, payload) : chrome[action](payload);
  return {
    async chromeFind() { return await route("chromeFind"); },
    async chromeLaunch() { return await route("chromeLaunch"); },
    async chromeStatus() { return await route("chromeStatus"); },
    async chromeNavigate() { return await route("chromeNavigate"); },
    async chromeEval() { return await route("chromeEval"); },
    async chromeWaitForSelector() { return await route("chromeWaitForSelector"); },
    async chromeClick() { return await route("chromeClick"); },
    async chromeType() { return await route("chromeType"); },
    async chromeLogs() { return wantsVirtualChrome(payload) ? { ok: true, action: "chromeLogs", engine: "node-dom", logs: [] } : await chrome.chromeLogs(payload); },
    async chromeSnapshot() { return await route("chromeSnapshot"); },
    async chromeRunScript() { return await route("chromeRunScript"); }
  };
}

module.exports = { buildChromeActions };
