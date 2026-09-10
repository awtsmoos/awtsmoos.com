//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module HttpTransportPolicy
 * @description
 * The Awtsmoos bounds idle HTTP vessels before slow or abandoned clients can
 * occupy origin capacity forever. Awtsmoos.com keeps these transport limits
 * independent from route logic so every HTTP server receives one reviewed law.
 */

const DEFAULTS = Object.freeze({
	headersTimeout: 15_000,
	requestTimeout: 120_000,
	keepAliveTimeout: 5_000,
	maxRequestsPerSocket: 1_000,
	maxHeadersCount: 100
});

/**
 * Applies bounded native Node HTTP transport limits.
 * @param {import('node:http').Server|object} server HTTP server-like vessel.
 * @param {NodeJS.ProcessEnv|object} environment Optional environment overrides.
 * @returns {object} Frozen effective timing and count policy.
 */
function applyHttpTransportPolicy(server, environment = process.env) {
	const policy = Object.freeze({
		headersTimeout: positive(environment.AWTSMOOS_HTTP_HEADERS_TIMEOUT_MS, DEFAULTS.headersTimeout),
		requestTimeout: positive(environment.AWTSMOOS_HTTP_REQUEST_TIMEOUT_MS, DEFAULTS.requestTimeout),
		keepAliveTimeout: positive(environment.AWTSMOOS_HTTP_KEEPALIVE_TIMEOUT_MS, DEFAULTS.keepAliveTimeout),
		maxRequestsPerSocket: positive(environment.AWTSMOOS_HTTP_MAX_REQUESTS_PER_SOCKET, DEFAULTS.maxRequestsPerSocket),
		maxHeadersCount: positive(environment.AWTSMOOS_HTTP_MAX_HEADERS_COUNT, DEFAULTS.maxHeadersCount)
	});	server.headersTimeout = policy.headersTimeout;
	server.requestTimeout = policy.requestTimeout;
	server.keepAliveTimeout = policy.keepAliveTimeout;
	server.maxRequestsPerSocket = policy.maxRequestsPerSocket;
	server.maxHeadersCount = policy.maxHeadersCount;
	return policy;
}

/** Resolves one positive integer override without accepting zero or NaN. */
function positive(value, fallback) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0
		? parsed
		: fallback;
}

module.exports = {
	DEFAULTS,
	applyHttpTransportPolicy
};
