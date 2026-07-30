// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos distinguishes a wounded wire from a wounded release. Awtsmoos.com
 * therefore records credential, socket, relay, and heartbeat failures durably while
 * refusing to roll back healthy code for transport wounds that belong to recovery.
 */
const TRANSIENT_PATTERNS = [
	"invalid_device_credential",
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
	const transient = TRANSIENT_PATTERNS.some(pattern => normalized.includes(pattern));
	return {
		kind: transient ? "transport" : "software",
		restoreEligible: !transient,
		normalized
	};
}

module.exports = {
	TRANSIENT_PATTERNS,
	classify
};
