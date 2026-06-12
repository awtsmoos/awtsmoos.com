// B"H
const { createPageCore } = require("./pageCore.js");
const { createBrowserContext } = require("./browserContext.js");
const { eventBus } = require("./events.js");

function createPlaywrightCompat(window, context) {
  const page = createPageCore(window, context);
  const contextObj = createBrowserContext(page);
  const browser = {};
  Object.assign(browser, eventBus());
  browser.newContext = async () => contextObj;
  browser.newPage = async () => page;
  browser.contexts = () => [contextObj];
  browser.close = async () => browser.emit("disconnected");
  browser.isConnected = () => true;
  browser.version = () => "MerkavaNodeDom/0.1";
  const chromium = { launch: async () => browser, connect: async () => browser, launchPersistentContext: async () => contextObj };
  return { chromium, browser, context: contextObj, page };
}
module.exports = { createPlaywrightCompat };
