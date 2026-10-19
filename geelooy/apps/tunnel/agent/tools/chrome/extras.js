// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file extras.js
 * @description Preserves legacy Chrome review and diagnostic exports behind small focused modules.
 * The Awtsmoos lets old callers keep their names while new browser reliability lives in clearer vessels.
 */

const { createLegacyScreenshot } = require("./legacyScreenshot.js");
const { legacyReady } = require("./legacyReady.js");
const diagnostics = require("./diagnosticActions.js");

const chromeScreenshot = createLegacyScreenshot({ ready:legacyReady });

module.exports = {
	chromeScreenshot,
	chromeNetwork:diagnostics.chromeNetwork,
	chromeAccessibilitySnapshot:diagnostics.chromeAccessibilitySnapshot,
	chromeTestUrl:diagnostics.chromeTestUrl,
	chromeDoctor:diagnostics.chromeDoctor,
	ready:legacyReady,
	eventTimestamp:diagnostics.eventTimestamp,
	isChromeError:diagnostics.isChromeError
};
