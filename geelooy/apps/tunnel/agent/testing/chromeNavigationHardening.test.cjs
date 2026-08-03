// B"H
const assert = require("assert");
const cdp = require("../tools/chrome/cdp.js");
const actions = require("../tools/chrome/actions.js");
const { ACTIONS } = require("../tools/chrome/index.js");
const { buildChromeActions } = require("../tools/fs/actionGroups/chromeActions.js");
assert.equal(cdp.looksNavigated("about:blank", "https://chatgpt.com/"), false);
assert.equal(cdp.looksNavigated("https://chatgpt.com/", "https://chatgpt.com/c/abc"), true);
assert.equal(cdp.navigationLocationMatches(
  "https://chatgpt.com/c/old",
  "https://chatgpt.com/c/new",
  "https://chatgpt.com/c/old"
), false, "an unchanged same-origin page is not proof of navigation");
assert.equal(cdp.navigationLocationMatches(
  "https://chatgpt.com/c/new",
  "https://chatgpt.com/c/new",
  "https://chatgpt.com/c/old"
), true);
assert.equal(actions.urlOf({ url:" ", p:"data:text/html,P_ALIAS" }, ""), "data:text/html,P_ALIAS");
assert.equal(actions.urlOf({ params:{ path:"data:text/html,PATH_ALIAS" } }, ""), "data:text/html,PATH_ALIAS");
assert.equal(typeof actions.chromeCloseTabs, "function");
assert.equal(typeof ACTIONS.chromeCloseTabs, "function");
assert.equal(typeof buildChromeActions({ payload:{} }).chromeCloseTabs, "function");
const source = require("fs").readFileSync(require("path").join(__dirname, "../tools/chrome/cdp.js"), "utf8");
assert.ok(source.includes("retriedFreshTarget"));
assert.ok(source.includes("retriedSameTarget"));
assert.ok(source.includes("navigationLocationMatches"));
assert.ok(source.includes("createNewIfUnbound"));
assert.ok(source.includes("location.href"));
assert.ok(source.includes("/json/new?"));
console.log(JSON.stringify({ ok:true, suite:"chromeNavigationHardening" }, null, 2));
