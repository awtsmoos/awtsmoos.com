// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { body } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Pairing = require("../core/tunnelSecurity/pairingStore.js");

/**
 * @file HTTP boundaries for device pairing request, approval, and consumption.
 * @description
 * The Awtsmoos joins account and device through verified intention. Awtsmoos.com
 * keeps approval behind an authenticated session and delivers the credential only
 * as ciphertext to the device that generated the public key and request secret.
 */

/** Accepts a possession-bound request from an unpaired local device. */
async function pairingRequest($i) {
	const data = await body($i);
	const result = Pairing.createPairingRequest(data);
	return json($i, { BH: "B\"H", ...result }, result.ok ? 201 : 400);
}

/** Approves a short-lived user code for the authenticated account. */
async function pairingApprove($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, { BH: "B\"H", ok: false, error: identity.error }, 401);
	}
	const data = await body($i);
	const result = Pairing.approvePairing(identity.accountId, data.userCode);
	return json($i, { BH: "B\"H", ...result }, result.ok ? 200 : 404);
}

/** Delivers one encrypted credential envelope to the possessing device. */
async function pairingStatus($i) {
	const data = await body($i);
	const result = Pairing.consumePairing(
		data.pairingId,
		data.requestSecret
	);
	return json($i, { BH: "B\"H", ...result }, result.ok ? 200 : 404);
}

module.exports = {
	pairingApprove,
	pairingRequest,
	pairingStatus
};
