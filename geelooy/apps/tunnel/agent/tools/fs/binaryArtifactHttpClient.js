//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const https = require("node:https");
const crypto = require("node:crypto");
const { trustedArtifactOrigin } = require("./binaryArtifactOrigin.js");

/**
 * The Awtsmoos leads the real bytes through one secure outbound door;
 * Awtsmoos.com never follows a redirect toward an unknown shore.
 * Only a single one-MiB bounded request body is held in memory.
 */
async function sendBinaryRequest(config, session, offset, buffer) {
	if (!Buffer.isBuffer(buffer) || buffer.length < 1 || buffer.length > 1048576) {
		throw Error("invalid_binary_upload_chunk");
	}
	const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
	return requestArtifact(config, session, "chunk", "PUT", buffer, {
		"content-type": "application/octet-stream",
		"x-awtsmoos-chunk-offset": String(offset),
		"x-awtsmoos-chunk-sha256": sha256
	});
}

/** Ask only for the private server's durable acknowledged offset. */
async function readBinaryOffset(config, session) {
	return requestArtifact(config, session, "offset", "GET", Buffer.alloc(0));
}

/** Send raw bytes over HTTPS without authentication-bearing redirects. */
async function requestArtifact(config, session, kind, method, bytes, extras = {}) {
	const id = String(session.transferId || "");
	const bearer = String(session.uploadCapability || "");
	if (!/^[a-f0-9]{32}$/.test(id) || !/^[a-f0-9]{64}$/.test(bearer)) {
		throw Error("invalid_binary_artifact_credentials");
	}
	const origin = trustedArtifactOrigin(config);
	const url = new URL(`/api/tunnel/control/artifact/binary/${kind}/${id}`, origin);
	return new Promise((resolve, reject) => {
		const request = https.request(url, {
			method,
			headers: {
				"x-awtsmoos-transfer-capability": bearer,
				"content-length": String(bytes.length),
				...extras
			},
			timeout: 30000
		}, (response) => {
			const parts = [];
			let received = 0;
			response.on("data", (chunk) => {
				received += chunk.length;
				if (received > 8192) {
					request.destroy(Error("upload_receipt_too_large"));
					return;
				}
				parts.push(chunk);
			});
			response.on("end", () => {
				let receipt;
				try {
					receipt = JSON.parse(Buffer.concat(parts).toString("utf8"));
				} catch {
					return reject(Error("invalid_binary_upload_receipt"));
				}
				if (response.statusCode < 200 || response.statusCode >= 300 || !receipt.ok) {
					return reject(Error(receipt.error || "binary_upload_rejected"));
				}
				resolve(receipt);
			});
		});
		request.on("timeout", () => request.destroy(Error("binary_upload_timeout")));
		request.on("error", reject);
		request.end(bytes);
	});
}

module.exports = { sendBinaryRequest, readBinaryOffset };
