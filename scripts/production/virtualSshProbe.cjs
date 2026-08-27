//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Protocol-level readiness probe for the production virtual SSH doorway.
 * @description
 * The Awtsmoos distinguishes a true SSH doorway from an arbitrary occupied socket;
 * Awtsmoos.com accepts release light only when the configured port speaks an actual
 * SSH-2.0 identification line, so deployment evidence and runtime reality rhyme.
 */
const net = require("node:net");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 2223;
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_BANNER_BYTES = 512;

/**
 * Verifies that a TCP listener emits a valid SSH 2.0 identification banner.
 *
 * @param {object} [options={}] Probe configuration.
 * @param {string} [options.host] Host to probe.
 * @param {number} [options.port] Port to probe.
 * @param {number} [options.timeoutMs] Probe deadline.
 * @returns {Promise<string>} Verified first SSH identification line.
 */
function verifyVirtualSshListener(options = {}) {
	const host = String(options.host || DEFAULT_HOST);
	const port = positiveInteger(options.port, DEFAULT_PORT);
	const timeoutMs = positiveInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS);
	return new Promise((resolve, reject) => {
		const socket = net.createConnection({ host, port });
		let bannerBytes = Buffer.alloc(0);
		let settled = false;

		const finish = (error, banner = "") => {
			if (settled) {
				return;
			}
			settled = true;
			socket.destroy();
			error ? reject(error) : resolve(banner);
		};

		socket.setTimeout(timeoutMs);
		socket.on("data", chunk => {
			bannerBytes = Buffer.concat([bannerBytes, chunk]);
			const bannerText = bannerBytes.toString("ascii");
			const lineEnd = bannerText.indexOf("\n");
			if (lineEnd >= 0) {
				const line = bannerText.slice(0, lineEnd).replace(/\r$/, "");
				if (!line.startsWith("SSH-2.0-")) {
					finish(new Error(`virtual_ssh_invalid_banner:${line}`));
					return;
				}
				finish(null, line);
				return;
			}
			if (bannerBytes.length > MAX_BANNER_BYTES) {
				finish(new Error("virtual_ssh_banner_too_large"));
			}
		});
		socket.on("timeout", () => {
			finish(new Error("virtual_ssh_banner_timeout"));
		});
		socket.on("error", finish);
		socket.on("end", () => {
			finish(new Error("virtual_ssh_closed_before_banner"));
		});
	});
}

/**
 * Coerces a positive integer without allowing zero, negative, or NaN values.
 *
 * @param {*} value Candidate value.
 * @param {number} fallback Safe default.
 * @returns {number} Positive integer.
 */
function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	verifyVirtualSshListener
};
