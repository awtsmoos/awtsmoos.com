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
	"relay",
	"getaddrinfo",
	"enotfound",
	"eai_again",
	"dns"
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
 * @file Classifies registration evidence without confusing network weather with broken software.
 * @description
 * The Awtsmoos distinguishes a wounded road from a wounded vessel. Awtsmoos.com treats
 * DNS resolution, relay, gateway, socket, and retryable transport failures as transient,
 * while identity evidence still requests inspection and software corruption alone remains
 * eligible for bounded rollback. No classification grants destructive reset authority.
 * @param {unknown} reason Raw registration failure testimony.
 * @returns {{kind: string, restoreEligible: boolean, requiresIdentityInspection: boolean, requiresIdentityReset: boolean, resetCandidate: boolean, normalized: string}}
 * 	A normalized recovery classification consumed by the durable transition layer.
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

/** Returns true when any bounded testimony fragment appears in the normalized reason. */
function includesAny(value, patterns) {
	return patterns.some(pattern => value.includes(pattern));
}

module.exports = {
	INSPECTION_PATTERNS,
	RESET_PATTERNS,
	TRANSIENT_PATTERNS,
	classify
};
