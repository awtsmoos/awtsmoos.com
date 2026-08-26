//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Validation and error vocabulary for the production virtual-SSH protocol probe.
 * @description
 * The Awtsmoos lets one network eye remain simple by placing its bounds and failure names
 * in a separate vessel; Awtsmoos.com turns raw CLI values into measured policy so network
 * truth is readable, stable, and reusable while the protocol doorway may rhyme.
 */

const DEFAULT_TIMEOUT_MS = 3000;
const MAX_TIMEOUT_MS = 30000;
const MAX_BANNER_BYTES = 512;
const SSH_BANNER_PATTERN = /^SSH-2\.0-[!-~]+$/;

/**
 * Normalizes and validates TCP probe configuration.
 *
 * @param {object} [options={}] Raw probe options.
 * @returns {{host:string,port:number,timeoutMs:number}} Valid probe configuration.
 */
function revealProbeConfig(options = {}) {
	const host = String(options.host || "127.0.0.1");
	const port = Number(options.port);
	const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw revealProbeError("virtual_ssh_probe_invalid_port");
	}
	if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) {
		throw revealProbeError("virtual_ssh_probe_invalid_timeout");
	}
	return Object.freeze({
		host,
		port,
		timeoutMs
	});
}

/**
 * Creates one stable tagged error for API, CLI, and deployment diagnostics.
 *
 * @param {string} code Stable failure identity.
 * @returns {Error} Tagged probe error.
 */
function revealProbeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

/** @param {string} banner First protocol line. @returns {boolean} SSH-2.0 validity. */
function isSshBanner(banner) {
	return SSH_BANNER_PATTERN.test(banner);
}

module.exports = {
	MAX_BANNER_BYTES,
	isSshBanner,
	revealProbeConfig,
	revealProbeError
};
