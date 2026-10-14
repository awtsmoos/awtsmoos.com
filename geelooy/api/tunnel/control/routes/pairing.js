// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { body, query } = require("../core/request.js");
const { html, json } = require("../core/respond.js");
const Pairing = require("../core/tunnelSecurity/pairingStore.js");
const { pairingPageHtml } = require("./pairingPage.js");

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
	// B"H — Level 3 of Yaakov's multi-level approval detection (2026-10-14):
	// push a wake-up to any agent watching this pairing over WebSocket. The
	// push carries no credential — the device still consumes it through the
	// possession-bound pairing/status call. Safe if nobody listens.
	if (result.ok && result.pairingId && $i.ws) {
		try {
			$i.ws.sendToAlias(`pairing:${result.pairingId}`, {
				type: "pairing_approved",
				pairingId: result.pairingId,
				at: Date.now()
			});
		} catch {}
	}
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

/**
 * B"H — Read-only pairing state (Yaakov 2026-10-14, multi-level approval
 * detection level 2). Lets the installer check approval directly without the
 * request secret and WITHOUT consuming the pairing. Never mutates.
 */
async function pairingState($i) {
	const data = await body($i);
	const result = Pairing.describePairing(data.pairingId);
	return json($i, { BH: "B\"H", ...result }, result.ok ? 200 : 404);
}

/**
 * B"H — Standalone instant-loading approval page (Yaakov 2026-10-14).
 * GET /api/tunnel/control/pairing/page?pairingId=...&pairingCode=...
 * A single self-contained HTML page: inline CSS/JS, zero external
 * requests except the approve POST. No tunnel-control app framework.
 * Public to render (approval itself still requires the account session).
 */
async function pairingPage($i) {
	const params = query($i) || {};
	const pairingCode = String(params.pairingCode || params.code || "");
	return html($i, pairingPageHtml({ pairingCode }));
}

module.exports = {
	pairingApprove,
	pairingPage,
	pairingRequest,
	pairingState,
	pairingStatus
};
