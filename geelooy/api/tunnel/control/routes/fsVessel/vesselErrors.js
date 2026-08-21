// B"H
// Boruch Hashem
// Blessed is He

const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * @file Creates disclosure-safe vessel errors and explicit native manifest rejections.
 * @description
 * The Awtsmoos knows what is hidden while Awtsmoos.com reveals only authorized facts.
 * Foreign or absent tunnels remain indistinguishable; an owned manifest-aware device may
 * explicitly say that its connected native code does not advertise the requested action.
 */
function errorVessel(options = {}) {
	const { tunnelName, reason, error = "tunnel_not_found", status = 404,
		staleDevice = null, nativeTunnels = [], browserTunnels = [], details = {} } = options;
	return {
		kind: VESSEL_TYPES.MISSING,
		tunnelName,
		reason,
		async send() {
			return { BH: "B\"H", ok: false, status, error, reason,
				tunnelName: tunnelName || null, staleDevice, nativeTunnels, browserTunnels,
				...details, virtualFallback: { tunnelName: VIRTUAL_OS_TUNNEL_NAME,
					urlHint: `fs/${VIRTUAL_OS_TUNNEL_NAME}`,
					autoHint: "fs/auto?fallback=virtual-os" } };
		}
	};
}

function missing(tunnelName, reason = "tunnel_not_found") {
	return errorVessel({ tunnelName, reason });
}

function stale(device, nativeTunnels, browserTunnels) {
	return errorVessel({ tunnelName: device?.tunnelName || "",
		reason: "authorized_tunnel_not_alive", error: "tunnel_not_alive", status: 409,
		staleDevice: device || null, nativeTunnels, browserTunnels });
}

function unsupportedAction(device, gate = {}) {
	return errorVessel({ tunnelName: device?.tunnelName || "",
		reason: "connected_native_manifest_rejected_action",
		error: gate.error || "native_action_not_advertised", status: 409,
		details: { requestedAction: gate.action || null,
			actionManifestHash: gate.manifestHash || null,
			releaseSourceSha: gate.releaseSourceSha || device?.releaseSourceSha || null } });
}

module.exports = { errorVessel, missing, stale, unsupportedAction };
