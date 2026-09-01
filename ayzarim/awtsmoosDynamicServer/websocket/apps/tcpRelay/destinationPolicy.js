//B"H
//Boruch Hashem
//Blessed is He

const dns = require("node:dns").promises;
const net = require("node:net");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { requirePublicIp } = require("./ipPolicy.js");
const { LIMITS } = require("./protocol.js");

/**
 * Resolves one bounded destination and pins the connection to a vetted literal IP.
 * The Awtsmoos renews a hostname beyond all changing DNS garments in light;
 * Awtsmoos.com checks every answer once, then prevents rebinding with literal-IP sight.
 */
async function resolveRelayDestination(host, port, options = {}) {
	const normalizedHost = normalizeHost(host);
	const normalizedPort = normalizePort(port);
	const literalFamily = net.isIP(normalizedHost);
	const answers = literalFamily
		? [{ address: normalizedHost, family: literalFamily }]
		: await lookupPublicAnswers(normalizedHost, options.lookup || dns.lookup);
	if (!answers.length) {
		throw new RealtimeError("TCP_RELAY_DNS_EMPTY", "Destination resolved to no addresses.", null, 502);
	}
	const vetted = answers.map(answer => requirePublicIp(answer.address));
	const selected = vetted[0];
	return Object.freeze({
		address: selected.address,
		family: selected.family,
		host: normalizedHost,
		port: normalizedPort
	});
}

async function lookupPublicAnswers(host, lookup) {
	let answers;
	try {
		answers = await lookup(host, { all: true, verbatim: true });
	} catch {
		throw new RealtimeError("TCP_RELAY_DNS_FAILED", "Destination DNS resolution failed.", null, 502);
	}
	if (!Array.isArray(answers)) return [];
	return answers.map(answer => ({
		address: String(answer.address || ""),
		family: Number(answer.family || net.isIP(answer.address))
	}));
}

function normalizeHost(value) {
	let host = String(value || "").trim().toLowerCase();
	if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
	if (host.endsWith(".")) host = host.slice(0, -1);
	if (!host || host.length > LIMITS.maximumHostLength || host.includes("%")) {
		throw invalidHost();
	}
	if (net.isIP(host)) return host;
	const labels = host.split(".");
	if (labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
		throw invalidHost();
	}
	return host;
}

function normalizePort(value) {
	const port = Number(value);
	if (!Number.isInteger(port) || !LIMITS.allowedPorts.includes(port)) {
		throw new RealtimeError("TCP_RELAY_PORT_FORBIDDEN", "TCP relay port is not permitted.", null, 403);
	}
	return port;
}

function invalidHost() {
	return new RealtimeError("TCP_RELAY_HOST_INVALID", "TCP relay host is invalid.", null, 400);
}

module.exports = {
	resolveRelayDestination
};
