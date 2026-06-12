// B"H
const { createPageCore } = require("./pageCore.js");
const { createBrowserContext } = require("./browserContext.js");
const { eventBus } = require("./events.js");

function createPuppeteerCompat(window, context) {
  const page = createPageCore(window, context);
  const ctx = createBrowserContext(page);
  const browser = { _page: page, _ctx: ctx };
  Object.assign(browser, eventBus());
  browser.newPage = async () => page;
  browser.pages = async () => [page];
  browser.close = async () => browser.emit("disconnected");
  browser.disconnect = browser.close;
  browser.isConnected = () => true;
  browser.version = async () => "MerkavaNodeDom/0.1";
  browser.userAgent = async () => window.navigator.userAgent;
  browser.createIncognitoBrowserContext = async () => ctx;
  browser.defaultBrowserContext = () => ctx;
  return { browser, page, launch: async () => browser, connect: async () => browser };
}
module.exports = { createPuppeteerCompat };
