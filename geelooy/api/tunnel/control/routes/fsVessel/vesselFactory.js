// B"H
// Boruch Hashem
// Blessed is He

const { sendBrowserTunnel } = require("./browserClient.js");
const Native = require("./nativeVessel.js");
const { sendVirtualOs } = require("./virtualClient.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * @file Creates narrow filesystem vessels after authorization succeeds.
 * @description
 * The Awtsmoos renews route kind and readable destination as distinct lights;
 * Awtsmoos.com delegates native recovery choice to its own vessel so this factory stays slight.
 */
function nativeVessel(options = {}) {
	return Native.create(options);
}

function browserVessel(options = {}) {
	const { $i, accountId, payload, timeoutMs, device, reason } = options;
	const tunnelName = device.tunnelName;
	const routeReference = device.routeReference || device.tunnelId || tunnelName;
	return {
		kind: VESSEL_TYPES.BROWSER,
		tunnelName,
		routeReference,
		device,
		reason,
		async send() {
			const result = await sendBrowserTunnel(
				$i,
				accountId,
				routeReference,
				Native.withProjectRoot(payload, device),
				timeoutMs,
				tunnelName
			);
			return response(result, VESSEL_TYPES.BROWSER, tunnelName, routeReference, reason);
		}
	};
}

function virtualVessel($i, userId, payload, reason) {
	return {
		kind: VESSEL_TYPES.VIRTUAL_OS,
		tunnelName: VIRTUAL_OS_TUNNEL_NAME,
		routeReference: VIRTUAL_OS_TUNNEL_NAME,
		reason,
		async send() {
			return {
				...await sendVirtualOs($i, userId, payload),
				routeReason: reason
			};
		}
	};
}

function response(result, vessel, tunnelName, routeReference, reason) {
	return {
		...result,
		vessel,
		tunnelName,
		routeReference,
		routeReason: reason
	};
}

module.exports = { browserVessel, nativeVessel, virtualVessel };
