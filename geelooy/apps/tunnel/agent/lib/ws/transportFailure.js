// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Classifies transport endings by network phase and probable ownership.
	* @description
	* The Awtsmoos distinguishes DNS, TCP, TLS, proxy, protocol, reset, timeout, and
	* local liveness so Awtsmoos.com can heal the right layer instead of saying drop.
	*/
function classify(input, phase = "unknown") {
	if (input?.transportFailure) return input.transportFailure;
	const code = String(input?.code || "").trim();
	const message = String(input?.message || input || "transport_failure").trim();
	const normalized = `${code} ${message}`.toLowerCase();
	const category = categoryFor(normalized, phase);
	return {
		at: new Date().toISOString(),
		category,
		phase: phaseFor(category, phase),
		code: code || codeFor(category),
		message: message.slice(0, 500),
		retryable: !["configuration", "certificate", "protocol"].includes(category),
		upstreamLikely: ["dns", "network", "proxy", "reset", "timeout"].includes(category),
		localLikely: ["liveness", "configuration"].includes(category)
	};
}

function categoryFor(value, phase) {
	if (/enotfound|eai_again|dns/.test(value)) return "dns";
	if (/cert_|err_tls_|certificate|self signed/.test(value)) return "certificate";
	if (/502|503|504|bad gateway|service unavailable|gateway timeout/.test(value)) return "proxy";
	if (/ehostunreach|enetunreach|econnrefused/.test(value)) return "network";
	if (/econnreset|epipe|socket hang up/.test(value)) return "reset";
	if (/etimedout|timeout|idle_timeout/.test(value)) return "timeout";
	if (/handshake_rejected|accept_mismatch|frame|protocol/.test(value)) return "protocol";
	if (/unsupported_websocket_protocol|invalid url/.test(value)) return "configuration";
	if (/event_loop|scheduler|stall/.test(value)) return "liveness";
	if (phase === "tls") return "certificate";
	if (phase === "connect") return "network";
	return "unknown";
}

function phaseFor(category, fallback) {
	if (category === "dns") return "dns";
	if (category === "certificate") return "tls";
	if (category === "proxy" || category === "protocol") return "websocket_handshake";
	if (["network", "reset", "timeout"].includes(category)) return fallback === "unknown" ? "socket" : fallback;
	if (category === "liveness") return "liveness";
	return fallback;
}

function codeFor(category) {
	return `transport_${category}`;
}

module.exports = { categoryFor, classify, codeFor, phaseFor };
