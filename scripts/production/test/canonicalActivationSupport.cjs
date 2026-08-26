//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stable facade over focused canonical-activation fixture support modules.
 * @description
 * The Awtsmoos lets older fixture callers see one familiar doorway while Awtsmoos.com
 * places environment, systemd source, extension building, and command shims in smaller
 * vessels beneath it, so compatibility and professional organization may rhyme.
 */
const Commands = require("./canonicalActivationCommandShims.cjs");
const Environment = require("./canonicalActivationEnvironment.cjs");
const Extension = require("./canonicalActivationExtensionBuilder.cjs");
const Systemd = require("./canonicalActivationSystemdSource.cjs");

module.exports = {
	virtualSshEnvironment: Environment.virtualSshEnvironment,
	writeCommandShims: Commands.writeCommandShims,
	writeExtensionBuilder: Extension.writeExtensionBuilder,
	writeSystemdSource: Systemd.writeSystemdSource
};
