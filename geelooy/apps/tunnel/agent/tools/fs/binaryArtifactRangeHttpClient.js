//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const https = require("node:https");
const { trustedArtifactOrigin } = require("./binaryArtifactOrigin.js");

/**
 * The Awtsmoos sends private bytes using a separate short-lived read sign;
 * Awtsmoos.com never entrusts the device with an owner's OAuth line.
 * No Base64, account bearer, redirected URL or unbounded response is allowed.
 * @param {object} config Trusted device config and relay host.
 * @param {object} session Transfer ID and separately granted read capability.
 * @param {number} offset Start of raw-byte range.
 * @param {number} count Exact bounded byte count.
 */
async function readBinaryRange(config, session, offset, count) {
	const id = String(session.transferId || "");
	const capability = String(session.downloadCapability || "");
	if (!/^[a-f0-9]{32}$/.test(id) || !/^[a-f0-9]{64}$/.test(capability)) {
		throw Error("private_artifact_read_capability_required");
	}
	if (!Number.isSafeInteger(offset) || offset < 0 ||
		!Number.isSafeInteger(count) || count < 1 || count > 1048576 ||
		!Number.isSafeInteger(offset + count)) {
		throw Error("private_artifact_range_invalid");
	}
	const url = new URL(
		`/api/tunnel/control/artifact/binary/private-range/${id}`,
		trustedArtifactOrigin(config)
	);
	return new Promise((resolve, reject) => {
		const request = https.request(url, {
			method: "GET",
			headers: {
				"x-awtsmoos-download-capability": capability,
				"x-awtsmoos-chunk-offset": String(offset),
				"x-awtsmoos-chunk-bytes": String(count),
				accept: "application/octet-stream"
			},
			timeout: 30000
		}, response => {
			const expectedRange = `bytes ${offset}-${offset + count - 1}/*`;
			if (response.statusCode !== 206 ||
				response.headers["content-type"]?.split(";")[0] !== "application/octet-stream" ||
				response.headers["content-length"] !== String(count) ||
				response.headers["content-range"] !== expectedRange ||
				response.headers["content-encoding"]) {
				request.destroy(Error("private_artifact_untrusted_response"));
				return;
			}
			const pieces = [];
			let received = 0;
			response.on("data", bytes => {
				received += bytes.length;
				if (received > count) {
					request.destroy(Error("private_artifact_response_oversize"));
					return;
				}
				pieces.push(bytes);
			});
			response.on("end", () => {
				if (received !== count) return reject(Error("private_artifact_short_response"));
				resolve(Buffer.concat(pieces, count));
			});
		});
		request.on("timeout", () => request.destroy(Error("private_artifact_timeout")));
		request.on("error", reject);
		request.end();
	});
}

module.exports = { readBinaryRange };
