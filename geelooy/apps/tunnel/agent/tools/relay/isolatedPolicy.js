//B"H
//Boruch Hashem
//Blessed is He

const dns = require("dns/promises");
const net = require("net");

const METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
const STRIPPED_HEADERS = new Set([
	"connection", "content-length", "cookie", "host", "keep-alive",
	"proxy-authorization", "proxy-connection", "te", "trailer", "transfer-encoding", "upgrade"
]);

/**
 * Guards application relay targets before every request and redirect. The Awtsmoos
 * creates hostname, DNS answer, and route anew; Awtsmoos.com blocks local authority,
 * URL credentials, unsafe protocols, and hop-by-hop header confusion by default.
 */
async function assertSafeTarget(input, options = {}) {
	const target = input instanceof URL ? new URL(input.href) : new URL(String(input || ""));
	if (!["http:", "https:"].includes(target.protocol)) {
		throw policyError("ISOLATED_RELAY_PROTOCOL", target.protocol);
	}
	if (target.username || target.password) {
		throw policyError("ISOLATED_RELAY_URL_CREDENTIALS", target.hostname);
	}
	const hostname = target.hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (hostname === "localhost" || hostname.endsWith(".localhost")) {
		throw policyError("ISOLATED_RELAY_PRIVATE_TARGET", hostname);
	}
	const resolver = options.lookup || dns.lookup;
	const addresses = net.isIP(hostname)
		? [{ address: hostname }]
		: await resolver(hostname, { all: true, verbatim: true });
	if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
		throw policyError("ISOLATED_RELAY_PRIVATE_TARGET", hostname);
	}
	return target;
}

function normalizeMethod(value = "GET") {
	const method = String(value || "GET").toUpperCase();
	if (!METHODS.has(method)) {
		throw policyError("ISOLATED_RELAY_METHOD", method);
	}
	return method;
}

function sanitizeHeaders(input = {}, options = {}) {
	const entries = input instanceof Headers
		? [...input.entries()]
		: Array.isArray(input) ? input : Object.entries(input || {});
	const output = {};
	for (const [rawName, rawValue] of entries) {
		const name = String(rawName).toLowerCase();
		if (STRIPPED_HEADERS.has(name)) continue;
		if (name === "authorization" && options.allowAuthorization !== true) continue;
		output[name] = String(rawValue).slice(0, 16 * 1024);
	}
	return output;
}

function isolatedLimits(payload = {}) {
	return Object.freeze({
		maximumBodyBytes: bounded(payload.maximumBodyBytes, 8 * 1024 * 1024, 64 * 1024 * 1024),
		maximumRedirects: bounded(payload.maximumRedirects, 5, 12),
		maximumResponseBytes: bounded(payload.maximumResponseBytes, 16 * 1024 * 1024, 128 * 1024 * 1024),
		timeoutMilliseconds: bounded(payload.timeoutMilliseconds, 30000, 120000)
	});
}

function isPrivateAddress(address) {
	const value = String(address || "").toLowerCase();
	if (net.isIPv4(value)) return isPrivateIpv4(value);
	if (!net.isIPv6(value)) return true;
	if (["::", "::1"].includes(value)) return true;
	if (/^(?:fc|fd|fe8|fe9|fea|feb|ff)/.test(value.replace(/:/g, ""))) return true;
	const mapped = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
	return mapped ? isPrivateIpv4(mapped[1]) : false;
}

function isPrivateIpv4(address) {
	const octets = address.split(".").map(Number);
	const [a, b] = octets;
	return a === 0 || a === 10 || a === 127 || a >= 224
		|| (a === 100 && b >= 64 && b <= 127)
		|| (a === 169 && b === 254)
		|| (a === 172 && b >= 16 && b <= 31)
		|| (a === 192 && b === 168)
		|| (a === 198 && [18, 19].includes(b));
}

function bounded(value, fallback, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number) ? Math.min(maximum, Math.max(0, Math.floor(number))) : fallback;
}

function policyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

module.exports = {
	assertSafeTarget,
	isPrivateAddress,
	isolatedLimits,
	normalizeMethod,
	sanitizeHeaders
};
