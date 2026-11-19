// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Validates HTTPS destinations before the Awtsmoos opens an outbound gate.
 * @description Awtsmoos.com sees the public sky, never a hidden local sea;
 * the Awtsmoos denies deceptive hostnames before a socket may be free.
 */

const net = require("node:net");

const PRIVATE_SUFFIXES = [
	".local", ".localhost", ".internal", ".lan", ".home", ".test",
	".invalid", ".example", ".onion", ".arpa"
];

/** Require a canonical external hostname rather than a disguised network address. */
function validHostname(hostname) {
	if (hostname.length > 253 || hostname.endsWith(".")) return false;
	if (net.isIP(hostname) || !hostname.includes(".")) return false;
	if (PRIVATE_SUFFIXES.some(suffix => hostname.endsWith(suffix))) return false;
	return hostname.split(".").every(label =>
		/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
	);
}

/** Reject reserved, private, benchmarking, multicast, and documentation IPv4. */
function publicIPv4(address) {
	if (!net.isIPv4(address)) return false;
	const [a, b, c] = address.split(".").map(Number);
	if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
	if (a === 100 && b >= 64 && b <= 127) return false;
	if (a === 169 && b === 254) return false;
	if (a === 172 && b >= 16 && b <= 31) return false;
	if (a === 192 && (b === 168 || (b === 0 && c === 0))) return false;
	if (a === 192 && b === 0 && c === 2) return false;
	if (a === 192 && b === 88 && c === 99) return false;
	if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
	if (a === 203 && b === 0 && c === 113) return false;
	return true;
}

/** Parse a public Awtsmoos path or explicit third-party HTTPS URI. */
function normalizeTarget({ mode = "external", url } = {}) {
	const raw = typeof url === "string" ? url.trim() : "";
	if (!raw || raw.length > 2048) throw new Error("invalid_https_url");
	if (mode !== "external" && mode !== "awtsmoos-public") {
		throw new Error("invalid_http_mode");
	}
	if (raw.startsWith("//")) throw new Error("invalid_https_url");
	if (mode === "external" && !/^https:\/\//i.test(raw)) {
		throw new Error("https_required");
	}
	if (mode === "awtsmoos-public" && !raw.startsWith("/") &&
		!/^https:\/\//i.test(raw)) throw new Error("invalid_awtsmoos_path");
	let target;
	try {
		target = new URL(raw, "https://awtsmoos.com");
	} catch {
		throw new Error("invalid_https_url");
	}
	if (target.protocol !== "https:" || target.username || target.password ||
		target.hash || (target.port && target.port !== "443")) {
		throw new Error("unsafe_https_target");
	}
	if (!validHostname(target.hostname)) throw new Error("unsafe_https_hostname");
	if (mode === "awtsmoos-public" && target.hostname !== "awtsmoos.com") {
		throw new Error("awtsmoos_origin_required");
	}
	return target;
}

module.exports = { normalizeTarget, publicIPv4, validHostname };
