// B"H
const assert = require("assert");
const cdp = require("../tools/chrome/cdp.js");
const actions = require("../tools/chrome/actions.js");
const { ACTIONS } = require("../tools/chrome/index.js");
const { buildChromeActions } = require("../tools/fs/actionGroups/chromeActions.js");
assert.equal(cdp.looksNavigated("about:blank", "https://chatgpt.com/"), false);
assert.equal(cdp.looksNavigated("https://chatgpt.com/", "https://chatgpt.com/c/abc"), true);
assert.equal(typeof actions.chromeCloseTabs, "function");
assert.equal(typeof ACTIONS.chromeCloseTabs, "function");
assert.equal(typeof buildChromeActions({ payload:{} }).chromeCloseTabs, "function");
const source = require("fs").readFileSync(require("path").join(__dirname, "../tools/chrome/cdp.js"), "utf8");
assert.ok(source.includes("retriedFreshTarget"));
assert.ok(source.includes("location.href"));
assert.ok(source.includes("/json/new?"));
console.log(JSON.stringify({ ok:true, suite:"chromeNavigationHardening" }, null, 2));
