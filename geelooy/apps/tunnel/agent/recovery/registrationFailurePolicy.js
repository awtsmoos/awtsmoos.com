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
 * @file Separates wire wounds, identity wounds, and software wounds.
 * The Awtsmoos never rolls code backward to heal a mismatched cryptographic vessel.
 */
function classify(reason) {
	const normalized = String(reason || "").trim().toLowerCase();
	const requiresIdentityReset = includesAny(normalized, RESET_PATTERNS);
	const requiresIdentityInspection = requiresIdentityReset ||
		includesAny(normalized, INSPECTION_PATTERNS);
	if (requiresIdentityInspection) {
		return {
			kind: "identity",
			restoreEligible: false,
			requiresIdentityInspection: true,
			requiresIdentityReset,
			normalized
		};
	}
	const transient = includesAny(normalized, TRANSIENT_PATTERNS);
	return {
		kind: transient ? "transport" : "software",
		restoreEligible: !transient,
		requiresIdentityInspection: false,
		requiresIdentityReset: false,
		normalized
	};
}

function includesAny(value, patterns) {
	return patterns.some((pattern) => value.includes(pattern));
}

module.exports = {
	INSPECTION_PATTERNS,
	RESET_PATTERNS,
	TRANSIENT_PATTERNS,
	classify
};
