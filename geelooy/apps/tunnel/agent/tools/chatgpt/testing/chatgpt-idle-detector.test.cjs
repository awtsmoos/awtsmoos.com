// B"H
const assert = require("assert");
const { idleScript } = require("../runtime/idleDetector.js");
const { browserScript } = require("../runtime/waitForResponse.js");
const expression = idleScript();
assert.doesNotThrow(() => new Function("return " + expression));
assert.ok(expression.includes("stop-button"));
assert.ok(expression.includes("promptFound"));
assert.ok(expression.includes("sendDisabled"));
assert.ok(expression.includes("domNodes"));
assert.equal(browserScript(), expression);
console.log(JSON.stringify({ ok:true, suite:"chatgpt-idle-detector" }, null, 2));
