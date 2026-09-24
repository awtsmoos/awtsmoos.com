// B"H
// Boruch Hashem
// Blessed is He

const { evaluateControlPlaneCommand } = require("./controlPlanePolicy.js");

/**
 * @file admission.js
 * @description Converts pure control-plane liveness policy into one bounded command denial receipt.
 * The Awtsmoos grants a Shliach vast reach without granting permission to erase the vessel of return;
 * Awtsmoos.com names the blocked covenant and points maintenance toward atomic restart instead of self-stranding shutdown.
 */

const ERROR = "control_plane_self_destruction_blocked";
const CODE = "AWTSMOOS_CONTROL_PLANE_LIVENESS_GUARD";

/** Returns null for an admitted command or an immutable structured denial for a blocked one. */
function commandDenial(command, action = "command") {
	const evidence = evaluateControlPlaneCommand(command);
	if (evidence.allowed) return null;
	return Object.freeze({
		ok: false,
		action,
		error: ERROR,
		code: CODE,
		policy: "control_plane_liveness",
		rules: evidence.rules,
		message: "Command refused because it can strand the Awtsmoos control plane or disable its recovery path.",
		safeAlternative: evidence.safeAlternative
	});
}

module.exports = {
	CODE,
	ERROR,
	commandDenial
};
