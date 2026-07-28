// B"H
const chrome = require("../../chrome/actions.js");
const { wantsVirtualChrome, virtualChrome } = require("./virtualChromeActions.js");
/** B"H — Chapter 930: Chrome yielded real pixels when the vessel allows it. */
function buildChromeActions(ctx) {
  const payload = ctx.payload || {};
  const route = action => wantsVirtualChrome(payload) ? virtualChrome(action, payload) : chrome[action](payload);
  return {
    async chromeFind() { return await route("chromeFind"); }, async chromeLaunch() { return await route("chromeLaunch"); },
    async chromeStop() { return wantsVirtualChrome(payload) ? { ok:true, action:"chromeStop", engine:"node-dom", alreadyStopped:true } : await chrome.chromeStop(payload); },
    async chromeStatus() { return await route("chromeStatus"); }, async chromeTargets() { return await route("chromeTargets"); },
    async chromeTargetSelector() { return await route("chromeTargetSelector"); }, async chromeNewPage() { return await route("chromeNewPage"); },
    async chromeClosePage() { return await route("chromeClosePage"); }, async chromeCloseTabs() { return wantsVirtualChrome(payload) ? { ok:true, action:"chromeCloseTabs", engine:"node-dom", closedCount:0 } : await chrome.chromeCloseTabs(payload); },
    async chromeNavigate() { return await route("chromeNavigate"); }, async chromeEval() { return await route("chromeEval"); },
    async chromeWaitForSelector() { return await route("chromeWaitForSelector"); }, async chromeClick() { return await route("chromeClick"); },
    async chromeType() { return await route("chromeType"); }, async chromeLogs() { return wantsVirtualChrome(payload) ? { ok:true, action:"chromeLogs", engine:"node-dom", logs:[] } : await chrome.chromeLogs(payload); },
    async chromeSnapshot() { return await route("chromeSnapshot"); }, async chromeScreenshot() { return wantsVirtualChrome(payload) ? { ok:false, action:"chromeScreenshot", error:"virtual_chrome_no_pixels" } : await chrome.chromeScreenshot(payload); },
    async chromeRunScript() { return await route("chromeRunScript"); }
  };
}
module.exports = { buildChromeActions };
