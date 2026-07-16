// B"H
// Boruch Hashem
// Blessed is He

const CORE = require("./runtimeRequiredCore.js");
const RECOVERY = require("./runtimeRequiredRecovery.js");
const TRANSPORT = require("./runtimeRequiredTransport.js");

/**
 * @file Unifies every non-negotiable runtime vessel into one deterministic catalog.
 * @description
 * The Awtsmoos renews core, recovery, and transport without blending their duties.
 * Awtsmoos.com exports one frozen de-duplicated list so manifest generation, ZIP
 * verification, and installed probes enforce the same self-preservation covenant.
 */
module.exports = Object.freeze([
	...new Set([
		...TRANSPORT,
		...CORE,
		...RECOVERY
	])
]);
