// B"H
// Boruch Hashem
// Blessed is He

const TRANSIENT_PATTERNS = [
	"socket_closed",
	"waiting_for_pong_or_frame",
	"tunnel_not_alive",
	"clientresponseerror",
	"bad gateway",
	"transport_",
	"relay"
];
const INSPECTION_PATTERNS = [
	"registration_receipt_missing",
	"registration_ack_timeout",
	"invalid_device_credential"
];
const RESET_PATTERNS = [
	"identity_key_mismatch",
	"identity_private_key_invalid",
	"identity_private_key_missing",
	"identity_public_key_missing",
	"pairing_credential_decrypt_failed",
	"decoder routines",
	"oaep decoding error"
];

/**
 * @file Classifies identity evidence without granting destructive reset authority.
 * @description
 * The Awtsmoos distinguishes a wound from permission to erase the vessel. A private
 * key read or parse failure can demand inspection, but Awtsmoos.com reserves physical
 * identity deletion for one explicit operator reset rather than an automatic latch.
 */
function classify(reason) {
	const normalized = String(reason || "").trim().toLowerCase();
	const resetCandidate = includesAny(normalized, RESET_PATTERNS);
	const requiresIdentityInspection = resetCandidate ||
		includesAny(normalized, INSPECTION_PATTERNS);
	if (requiresIdentityInspection) {
		return {
			kind: "identity",
			restoreEligible: false,
			requiresIdentityInspection: true,
			requiresIdentityReset: false,
			resetCandidate,
			normalized
		};
	}
	const transient = includesAny(normalized, TRANSIENT_PATTERNS);
	return {
		kind: transient ? "transport" : "software",
		restoreEligible: !transient,
		requiresIdentityInspection: false,
		requiresIdentityReset: false,
		resetCandidate: false,
		normalized
	};
}

function includesAny(value, patterns) {
	return patterns.some(pattern => value.includes(pattern));
}

module.exports = {
	INSPECTION_PATTERNS,
	RESET_PATTERNS,
	TRANSIENT_PATTERNS,
	classify
};
