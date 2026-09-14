//B"H
//Boruch Hashem
//Blessed be He

const BROWSER = require("./runtimeRequiredBrowser.js");
const CORE = require("./runtimeRequiredCore.js");
const RECOVERY = require("./runtimeRequiredRecovery.js");
const SUBAGENTS = require("./runtimeRequiredSubagents.js");
const TRANSPORT = require("./runtimeRequiredTransport.js");

/**
 * @file Unifies every non-negotiable runtime vessel into one deterministic catalog.
 * @description
 * The Awtsmoos renews transport, browser custody, autonomous Shliach work, core startup,
 * and recovery as one release closure without blending their responsibilities.
 */
module.exports = Object.freeze([
	...new Set([
		...TRANSPORT,
		...BROWSER,
		...SUBAGENTS,
		...CORE,
		...RECOVERY
	])
]);
