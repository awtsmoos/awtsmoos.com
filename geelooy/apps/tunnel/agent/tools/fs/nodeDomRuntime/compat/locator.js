// B"H
const { dispatch } = require("../actions/index.js");

/** B"H: a tiny Playwright-style locator over the Merkava DOM. */
function createLocator(page, selector) {
  return {
    selector,
    async click() { return page.click(selector); },
    async fill(value) { return page.fill(selector, value); },
    async type(value) { return page.type(selector, value); },
    async textContent() { return page.$eval(selector, el => el.textContent); },
    async inputValue() { return page.$eval(selector, el => el.value); },
    async waitFor() { return dispatch("waitForSelector", { selector }, page.window, page.context); }
  };
}

module.exports = { createLocator };
