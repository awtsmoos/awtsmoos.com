// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./nativeRecoveryRegistry.js");
const { sendNativeTunnel } = require("./nativeTunnelRegistry.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Creates one native vessel that chooses independent recovery only for exact recovery deeds.
 * @description
 * The Awtsmoos gives ordinary work its durable road and medicine its separate road;
 * Awtsmoos.com never promotes filesystem or shell work merely because the consumer bears a load.
 */
function create(options = {}) {
	const { $i, ownerAccountId, payload, timeoutMs, device, reason } = options;
	const tunnelName = device.tunnelName;
	const routeReference = device.routeReference || device.tunnelId;
	return {
		kind: VESSEL_TYPES.NATIVE,
		tunnelName,
		routeReference,
		device,
		reason,
		async send() {
			const recovery = await Recovery.send({
				$i,
				accountId: ownerAccountId,
				routeReference,
				payload,
				timeoutMs,
				device
			});
			const result = recovery || await sendNativeTunnel(
				$i,
				ownerAccountId,
				routeReference,
				withProjectRoot(payload, device),
				timeoutMs,
				tunnelName
			);
			return response(result, tunnelName, routeReference, reason,
				Boolean(recovery));
		}
	};
}

function withProjectRoot(payload = {}, device = {}) {
	if (payload.projectRoot || !device.root) return payload;
	return { ...payload, projectRoot: device.root };
}

function response(result, tunnelName, routeReference, reason, recoveryWire) {
	return {
		...result,
		vessel: VESSEL_TYPES.NATIVE,
		tunnelName,
		routeReference,
		routeReason: reason,
		recoveryWire
	};
}

module.exports = { create, response, withProjectRoot };
