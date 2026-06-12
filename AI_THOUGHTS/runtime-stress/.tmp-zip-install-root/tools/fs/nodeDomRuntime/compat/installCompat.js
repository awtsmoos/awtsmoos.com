// B"H
const { createPuppeteerCompat } = require("./puppeteer.js");
const { createPlaywrightCompat } = require("./playwright.js");

function installCompat(context, window) {
  const puppeteer = createPuppeteerCompat(window, context);
  const playwright = createPlaywrightCompat(window, context);
  context.__nodeDomPage = playwright.page;
  context.puppeteer = puppeteer;
  context.playwright = playwright;
  context.chromium = playwright.chromium;
  context.window.__nodeDomPage = playwright.page;
}

module.exports = { installCompat };
