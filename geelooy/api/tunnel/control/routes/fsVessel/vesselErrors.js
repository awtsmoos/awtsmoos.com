// B"H
// Boruch Hashem
// Blessed is He

const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * @file Creates disclosure-safe missing and stale vessel responses.
 * @description
 * The Awtsmoos knows what is hidden, but Awtsmoos.com does not reveal whether a
 * foreign tunnel exists. Unauthorized, absent, and ambiguous references therefore
 * share the same outward missing shape while owned stale devices remain diagnosable.
 */

/** Creates a vessel that returns one bounded error when sent. */
function errorVessel(options = {}) {
	const {
		tunnelName,
		reason,
		error = "tunnel_not_found",
		status = 404,
		staleDevice = null,
		nativeTunnels = [],
		browserTunnels = []
	} = options;
	return {
		kind: VESSEL_TYPES.MISSING,
		tunnelName,
		reason,
		async send() {
			return {
				BH: "B\"H",
				ok: false,
				status,
				error,
				reason,
				tunnelName: tunnelName || null,
				staleDevice,
				nativeTunnels,
				browserTunnels,
				virtualFallback: {
					tunnelName: VIRTUAL_OS_TUNNEL_NAME,
					urlHint: `fs/${VIRTUAL_OS_TUNNEL_NAME}`,
					autoHint: "fs/auto?fallback=virtual-os"
				}
			};
		}
	};
}

/** Returns a non-disclosing missing vessel. */
function missing(tunnelName, reason = "tunnel_not_found") {
	return errorVessel({ tunnelName, reason });
}

/** Returns stale diagnostics only for an already authorized device. */
function stale(device, nativeTunnels, browserTunnels) {
	return errorVessel({
		tunnelName: device?.tunnelName || "",
		reason: "authorized_tunnel_not_alive",
		error: "tunnel_not_alive",
		status: 409,
		staleDevice: device || null,
		nativeTunnels,
		browserTunnels
	});
}

module.exports = {
	errorVessel,
	missing,
	stale
};
