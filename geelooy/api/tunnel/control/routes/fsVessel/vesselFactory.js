// B"H
// Boruch Hashem
// Blessed is He

const { sendBrowserTunnel } = require("./browserClient.js");
const { sendNativeTunnel } = require("./nativeTunnelRegistry.js");
const { sendVirtualOs } = require("./virtualClient.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("./virtualNames.js");

/**
 * @file Creates narrow filesystem vessels after authorization has succeeded.
 * @description
 * The Awtsmoos renews route and destination as one deed. Awtsmoos.com keeps
 * authorization outside these vessels, so they can carry only server-derived
 * owner accounts and canonical tunnel names into the relay.
 */

/** Adds a known project root without accepting a foreign authority hint. */
function withProjectRoot(payload = {}, device = {}) {
	if (payload.projectRoot || !device.root) {
		return payload;
	}
	return { ...payload, projectRoot: device.root };
}

/** Creates an account-scoped native relay vessel. */
function nativeVessel(options = {}) {
	const { $i, ownerAccountId, tunnelName, payload, timeoutMs, device, reason } = options;
	return {
		kind: VESSEL_TYPES.NATIVE,
		tunnelName,
		device,
		reason,
		async send() {
			const result = await sendNativeTunnel(
				$i,
				ownerAccountId,
				tunnelName,
				withProjectRoot(payload, device),
				timeoutMs
			);
			return { ...result, vessel: VESSEL_TYPES.NATIVE, tunnelName, routeReason: reason };
		}
	};
}

/** Creates a same-account browser relay vessel. */
function browserVessel(options = {}) {
	const { $i, accountId, tunnelName, payload, timeoutMs, device, reason } = options;
	return {
		kind: VESSEL_TYPES.BROWSER,
		tunnelName,
		device,
		reason,
		async send() {
			const result = await sendBrowserTunnel(
				$i,
				accountId,
				tunnelName,
				withProjectRoot(payload, device),
				timeoutMs
			);
			return { ...result, vessel: VESSEL_TYPES.BROWSER, tunnelName, routeReason: reason };
		}
	};
}

/** Creates the authenticated hosted Virtual OS vessel. */
function virtualVessel($i, userId, payload, reason) {
	return {
		kind: VESSEL_TYPES.VIRTUAL_OS,
		tunnelName: VIRTUAL_OS_TUNNEL_NAME,
		reason,
		async send() {
			const result = await sendVirtualOs($i, userId, payload);
			return { ...result, routeReason: reason };
		}
	};
}

module.exports = {
	browserVessel,
	nativeVessel,
	virtualVessel,
	withProjectRoot
};
