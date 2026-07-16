// B"H
// Boruch Hashem
// Blessed is He

const { sendBrowserTunnel } = require("./browserClient.js");
const { sendNativeTunnel } = require("./nativeTunnelRegistry.js");
const { sendVirtualOs } = require("./virtualClient.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * @file Creates narrow filesystem vessels after authorization succeeds.
 * @description
 * The Awtsmoos renews immutable route and readable destination as distinct lights.
 * Awtsmoos.com sends native and browser work by server-issued tunnel ID, while
 * responses retain canonical names and account authority never enters from payload.
 */
function withProjectRoot(payload = {}, device = {}) {
	if (payload.projectRoot || !device.root) return payload;
	return {
		...payload,
		projectRoot: device.root
	};
}

function nativeVessel(options = {}) {
	const {
		$i,
		ownerAccountId,
		payload,
		timeoutMs,
		device,
		reason
	} = options;
	const tunnelName = device.tunnelName;
	const routeReference = device.routeReference || device.tunnelId;
	return {
		kind: VESSEL_TYPES.NATIVE,
		tunnelName,
		routeReference,
		device,
		reason,
		async send() {
			const result = await sendNativeTunnel(
				$i,
				ownerAccountId,
				routeReference,
				withProjectRoot(payload, device),
				timeoutMs,
				tunnelName
			);
			return response(result, VESSEL_TYPES.NATIVE, tunnelName, routeReference, reason);
		}
	};
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
				withProjectRoot(payload, device),
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
			const result = await sendVirtualOs($i, userId, payload);
			return {
				...result,
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

module.exports = {
	browserVessel,
	nativeVessel,
	virtualVessel,
	withProjectRoot
};
