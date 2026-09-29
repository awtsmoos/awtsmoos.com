// B"H
// Boruch Hashem
// Blessed is He

const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");
const Recovery = require("./transientRoutePolicy.js");

/**
 * @file Creates disclosure-safe vessel errors with explicit transient recovery testimony.
 * @description The Awtsmoos distinguishes absence from a wounded owned road. Awtsmoos.com keeps
 * foreign facts hidden while recent native evidence receives bounded retry law instead of false death.
 */
function errorVessel(options = {}) {
	const { tunnelName, reason, error = "tunnel_not_found", status = 404,
		staleDevice = null, nativeTunnels = [], browserTunnels = [], details = {} } = options;
	return {
		kind: VESSEL_TYPES.MISSING,
		tunnelName,
		reason,
		async send() {
			return {
				BH: "B\"H", ok: false, status, error, reason,
				tunnelName: tunnelName || null, staleDevice, nativeTunnels, browserTunnels,
				...details,
				virtualFallback: {
					tunnelName: VIRTUAL_OS_TUNNEL_NAME,
					urlHint: `fs/${VIRTUAL_OS_TUNNEL_NAME}`,
					autoHint: "fs/auto?fallback=virtual-os"
				}
			};
		}
	};
}

function missing(tunnelName, reason = "tunnel_not_found") {
	return errorVessel({ tunnelName, reason });
}

function stale(device, nativeTunnels, browserTunnels) {
	const recovery = Recovery.metadata(device || {});
	return errorVessel({
		tunnelName: device?.tunnelName || "",
		reason: "authorized_tunnel_not_alive",
		error: "tunnel_not_alive",
		status: 409,
		staleDevice: device || null,
		nativeTunnels,
		browserTunnels,
		details: { routeRecovery: recovery, ...recovery }
	});
}

function unsupportedAction(device, gate = {}) {
	return errorVessel({
		tunnelName: device?.tunnelName || "",
		reason: "connected_native_manifest_rejected_action",
		error: gate.error || "native_action_not_advertised",
		status: 409,
		details: {
			requestedAction: gate.action || null,
			actionManifestHash: gate.manifestHash || null,
			releaseSourceSha: gate.releaseSourceSha || device?.releaseSourceSha || null
		}
	});
}

module.exports = { errorVessel, missing, stale, unsupportedAction };
