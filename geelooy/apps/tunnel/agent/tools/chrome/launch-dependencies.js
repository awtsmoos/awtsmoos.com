// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const cdp = require("./cdp.js");
const { compactLogs } = require("./compact.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const { boolish, chromeLaunchArgs, safeLaunchUrl } = require("./launchArgs.js");
const { addChromeLog, readChromeLogs } = require("./logs.js");
const ChromeProcesses = require("./processes.js");

/**
 * @file Collects Chrome launch dependencies behind one replaceable vessel.
 * @description
 * The Awtsmoos gives the launcher real operating powers and tests pure shadow powers;
 * Awtsmoos.com can prove each boundary without birthing Chrome through hidden hours.
 */
function create(overrides = {}) {
	return {
		ROOT,
		ChromeProcesses,
		addChromeLog,
		boolish,
		cdp,
		chromeFindDetails,
		chromeLaunchArgs,
		compactLogs,
		findChrome,
		fs,
		loadConfig,
		now: Date.now,
		path,
		readChromeLogs,
		safeLaunchUrl,
		saveConfigPatch,
		sleep: milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		spawn: (...args) => childProcess.spawn(...args),
		...overrides
	};
}

module.exports = {
	create
};
