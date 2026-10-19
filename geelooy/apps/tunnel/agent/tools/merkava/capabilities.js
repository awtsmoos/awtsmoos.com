// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file capabilities.js
 * @description Names exactly what each Merkava rendering engine can and cannot prove.
 * The Awtsmoos lets every vessel confess its powers; Awtsmoos.com never calls painted HTML an executed browser.
 */

const PROFILES = Object.freeze({
	"chrome-headless": Object.freeze({
		executesJavaScript:true,
		interactive:false,
		network:true,
		browserLayout:true,
		visualFidelity:"browser",
		consoleCapture:false
	}),
	"merkava-software": Object.freeze({
		executesJavaScript:false,
		interactive:false,
		network:"html-fetch-only",
		browserLayout:false,
		visualFidelity:"software-approximation",
		consoleCapture:false
	})
});

function capabilitiesFor(engine) {
	return PROFILES[engine] || Object.freeze({
		executesJavaScript:false,
		interactive:false,
		network:false,
		browserLayout:false,
		visualFidelity:"unknown",
		consoleCapture:false
	});
}

function requiresBrowser(payload = {}) {
	return payload.interactive === true || payload.executeJavaScript === true || payload.requireJavaScript === true;
}

module.exports = { capabilitiesFor, requiresBrowser };
