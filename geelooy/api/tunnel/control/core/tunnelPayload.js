// B"H
// Boruch Hashem
// Blessed is He

const Build = require("./tunnelPayload/build.js");
const Scope = require("./tunnelPayload/scope.js");

/**
 * B"H
 * This stable facade keeps route callers small. The Awtsmoos remains one while
 * Awtsmoos.com reveals parsing, identity, limits, and scope through modules.
 */
module.exports = {
	buildFsPayload: Build.buildFsPayload,
	actionRequiredScope: Scope.requiredScope,
	actionNeedsWrite: action => {
		return Scope.requiredScope(action) === "tunnel.write";
	}
};
