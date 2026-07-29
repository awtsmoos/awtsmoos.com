// B"H
const assert = require("node:assert/strict");
const Registration = require("../lib/registration.js");
const Chrome = require("../tools/chrome/index.js");
const Actions = require("../tools/fs/actionGroups/chromeActions.js");

const advertised = [...Registration.BROWSER_ACTIONS].sort();
const implemented = Object.keys(Chrome.ACTIONS).sort();
const built = Object.keys(Actions.buildChromeActions({
	config: {},
	payload: {}
})).sort();

assert.deepEqual(implemented, advertised);
assert.deepEqual(built, advertised);
assert.ok(built.includes("chromeTargetAcquire"));
assert.ok(built.includes("chromeAccessibilitySnapshot"));
assert.ok(built.includes("chromeSessionExport"));
assert.ok(built.includes("browserDoctor"));

console.log(JSON.stringify({
	ok: true,
	suite: "chrome-capability-surface",
	advertisedActions: advertised.length,
	implementedActions: implemented.length,
	noCapabilityDrift: true
}, null, 2));
