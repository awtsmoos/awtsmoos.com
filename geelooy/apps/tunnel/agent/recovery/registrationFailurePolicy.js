// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos distinguishes a wounded wire from a rejected identity. Socket and relay
 * failures remain transient; an invalid device credential demands local identity
 * quarantine and supervised re-pairing rather than endless reconnect or code rollback.
 */
const TRANSIENT_PATTERNS = [
	"socket_closed",
	"waiting_for_pong_or_frame",
	"tunnel_not_alive",
	"clientresponseerror",
	"bad gateway",
	"transport_",
	"relay"
];

function classify(reason) {
	const normalized = String(reason || "").trim().toLowerCase();
	if (normalized.includes("invalid_device_credential")) {
		return {
			kind: "identity",
			restoreEligible: false,
			requiresIdentityReset: true,
			normalized
		};
	}
	const transient = TRANSIENT_PATTERNS.some(pattern => normalized.includes(pattern));
	return {
		kind: transient ? "transport" : "software",
		restoreEligible: !transient,
		requiresIdentityReset: false,
		normalized
	};
}

module.exports = { TRANSIENT_PATTERNS, classify };
