// B"H
const { many, one } = require("../actions/selectors.js");
const { dispatch } = require("../actions/index.js");
const { createLocator } = require("./locator.js");
const { eventBus } = require("./events.js");
const { keyboardMouse } = require("./keyboardMouse.js");

/**
 * B"H
 * A broader Playwright/Puppeteer-shaped page facade. It is intentionally honest:
 * navigation/network/video/PDF are synthetic, while DOM/action APIs operate on
 * the live Merkava virtual page.
 */
function createPageCore(window, context) {
  const page = { window, context, _routes: [], _viewport: { width: window.innerWidth, height: window.innerHeight } };
  Object.assign(page, eventBus(), keyboardMouse(window));
  page.locator = selector => createLocator(page, selector);
  page.$ = async selector => one(window, selector);
  page.$$ = async selector => many(window, selector);
  page.$eval = async (selector, fn, ...args) => fn(one(window, selector), ...args);
  page.$$eval = async (selector, fn, ...args) => fn(many(window, selector), ...args);
  page.evaluate = async (source, ...args) => typeof source === "function" ? source(...args) : dispatch("evaluate", { source }, window, context);
  page.evaluateHandle = async (...args) => ({ jsonValue: async () => page.evaluate(...args), asElement: () => null });
  page.click = async selector => dispatch("click", { selector }, window, context);
  page.tap = page.click;
  page.fill = async (selector, value) => dispatch("fill", { selector, value }, window, context);
  page.type = async (selector, text) => dispatch("type", { selector, text }, window, context);
  page.waitForSelector = async selector => dispatch("waitForSelector", { selector }, window, context);
  page.waitForTimeout = async ms => dispatch("waitForTimeout", { ms }, window, context);
  page.waitForFunction = async fn => page.evaluate(fn);
  page.waitForLoadState = async () => true;
  page.goto = async url => { window.location = new URL(url, window.location.href); page.emit("framenavigated", { url: () => window.location.href }); return { ok: () => true, status: () => 200, url: () => window.location.href }; };
  page.url = () => window.location.href;
  page.setContent = async html => { window.document.body.innerHTML = html; return true; };
  page.content = async () => window.document.documentElement.outerHTML || JSON.stringify(window.document.toJSON());
  page.title = async () => window.document.title || "";
  page.setViewportSize = async size => { page._viewport = size; window.innerWidth = size.width; window.innerHeight = size.height; };
  page.viewportSize = () => page._viewport;
  page.screenshot = async () => Buffer.from(JSON.stringify(window.snapshot()), "utf8");
  page.pdf = async () => Buffer.from(JSON.stringify({ virtualPdf: true, snapshot: window.snapshot() }), "utf8");
  page.addScriptTag = async ({ content = "" } = {}) => page.evaluate(content);
  page.addStyleTag = async ({ content = "" } = {}) => window.addStyleSheet(content);
  page.route = async (pattern, handler) => page._routes.push({ pattern, handler });
  page.unroute = async pattern => { page._routes = page._routes.filter(r => r.pattern !== pattern); };
  page.close = async () => page.emit("close");
  page.isClosed = () => false;
  return page;
}
module.exports = { createPageCore };
