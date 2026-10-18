#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Installer-direct device pairing (Yaakov 2026-10-14).
 * @description
 * The Awtsmoos lets the installer complete the browser covenant directly, without
 * depending on a candidate agent's poll loop. This script performs pairing
 * operations using raw Node crypto + HTTPS — no agent library dependencies, so
 * it works from the installer shell without complex preconditions.
 *
 * Commands:
 *   request --tunnel-name <name> [--device-name <n>] [--platform <p>] [--origin <url>]
 *     Generates a device keypair + deviceId, calls pairing/request.
 *     Outputs JSON: {ok, pairingId, userCode, requestSecret, expiresAt,
 *                    deviceId, publicKeyPem, privateKeyPem, approvalUrl}
 *
 *   consume --pairing-id <id> --request-secret <s> [--origin <url>]
 *     Calls pairing/status (possession-bound, consumes the pairing).
 *     Outputs JSON: {ok, state, tunnelId, credentialEnvelope}
 *
 *   decrypt --private-key-pem <pem> --envelope <base64>
 *     Decrypts the credential envelope with the device private key.
 *     Outputs the plaintext credential.
 */

const crypto = require("node:crypto");
const https = require("node:https");

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg.startsWith("--")) {
			const key = arg.slice(2);
			const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "1";
			args[key] = value;
		}
	}
	return args;
}

function postJson(origin, path, payload) {
	return new Promise((resolve, reject) => {
		const url = new URL(path, origin);
		const body = JSON.stringify(payload);
		const req = https.request(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(body)
			},
			timeout: 30000
		}, res => {
			let data = "";
			res.on("data", chunk => { data += chunk; });
			res.on("end", () => {
				try {
					if (res.statusCode >= 500) return reject(new Error(`pairing_server_http_${res.statusCode}`));
					resolve(JSON.parse(data));
				} catch (e) {
					reject(new Error(`invalid_json_response:${data.slice(0, 200)}`));
				}
			});
		});
		req.on("error", reject);
		req.on("timeout", () => {
			req.destroy();
			reject(new Error("request_timeout"));
		});
		req.write(body);
		req.end();
	});
}

/** B"H — retry transient network/server failures, never invalid user input.
 * Reuse the same physical public key and device ID for every attempt. */
async function retryPairingRequest(post, attempts = 3, pause = ms => new Promise(r => setTimeout(r, ms))) {
	let last;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			const reply = await post();
			if (reply?.ok || !["service_unavailable", "upstream_unavailable", "temporary_failure"].includes(reply?.error)) return reply;
			last = new Error(`pairing_temporary_${reply.error}`);
		} catch (error) {
			last = error;
		}
		if (attempt < attempts) await pause(attempt * 1000);
	}
	throw last || new Error("pairing_unavailable");
}

function wirePublicKey(publicKeyPem) {
	const key = crypto.createPublicKey(publicKeyPem);
	const der = key.export({ format: "der", type: "spki" });
	return `rsa-spki-base64url:${der.toString("base64url")}`;
}

function fingerprint(publicKeyPem) {
	// B"H — KeyCoherence.fingerprint hashes canonical PEM text, not DER bytes.
	// The metadata witness MUST match that same canonical representation.
	const pem = crypto.createPublicKey(publicKeyPem).export({ format: "pem", type: "spki" });
	return crypto.createHash("sha256").update(pem, "utf8").digest("base64url");
}

async function cmdRequest(args) {
	const tunnelName = args["tunnel-name"];
	if (!tunnelName) {
		console.error(JSON.stringify({ ok: false, error: "missing_tunnel_name" }));
		process.exit(1);
	}
	const origin = args.origin || "https://awtsmoos.com";
	const deviceName = args["device-name"] || require("node:os").hostname();
	const platform = args.platform || `${process.platform}-${process.arch}`;

	// B"H — generate the device identity: RSA keypair + deviceId.
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" }
	});
	const deviceId = `dev_${crypto.randomBytes(18).toString("base64url")}`;

	const payload = {
		deviceId,
		tunnelName,
		deviceName: String(deviceName).slice(0, 160),
		platform: String(platform).slice(0, 80),
		devicePublicKey: wirePublicKey(publicKey)
	};
	const result = await retryPairingRequest(() => postJson(origin, "/api/tunnel/control/pairing/request", payload));

	if (!result.ok) {
		console.error(JSON.stringify({ ok: false, error: result.error || "request_failed", message: result.message }));
		process.exit(1);
	}

	// B"H — Yaakov 2026-10-14: lightweight standalone approval page, not the
	// full tunnel-control app. Instant loading.
	const approvalUrl = new URL("/api/tunnel/control/pairing/page", origin);
	approvalUrl.searchParams.set("pairingId", result.pairingId);
	approvalUrl.searchParams.set("pairingCode", result.userCode);

	console.log(JSON.stringify({
		ok: true,
		pairingId: result.pairingId,
		userCode: result.userCode,
		requestSecret: result.requestSecret,
		expiresAt: result.expiresAt,
		deviceId,
		publicKeyPem: publicKey,
		privateKeyPem: privateKey,
		publicKeyFingerprint: fingerprint(publicKey),
		approvalUrl: approvalUrl.toString()
	}));
}

async function cmdConsume(args) {
	const pairingId = args["pairing-id"];
	const requestSecret = args["request-secret"];
	if (!pairingId || !requestSecret) {
		console.error(JSON.stringify({ ok: false, error: "missing_pairing_id_or_secret" }));
		process.exit(1);
	}
	const origin = args.origin || "https://awtsmoos.com";
	const result = await postJson(origin, "/api/tunnel/control/pairing/status", {
		pairingId,
		requestSecret
	});
	console.log(JSON.stringify(result));
	if (!result.ok) process.exit(1);
}

function cmdDecrypt(args) {
	const privateKeyPem = args["private-key-pem"];
	const envelope = args.envelope;
	if (!privateKeyPem || !envelope) {
		console.error(JSON.stringify({ ok: false, error: "missing_private_key_or_envelope" }));
		process.exit(1);
	}
	try {
		const credential = crypto.privateDecrypt({
			key: privateKeyPem,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256"
		}, Buffer.from(envelope, "base64")).toString("utf8");
		process.stdout.write(credential);
	} catch (e) {
		console.error(JSON.stringify({ ok: false, error: "decrypt_failed", message: e.message }));
		process.exit(1);
	}
}

async function main() {
	const [command, ...rest] = process.argv.slice(2);
	const args = parseArgs(rest);
	try {
		if (command === "request") await cmdRequest(args);
		else if (command === "consume") await cmdConsume(args);
		else if (command === "decrypt") cmdDecrypt(args);
		else {
			console.error(JSON.stringify({ ok: false, error: "unknown_command", command }));
			process.exit(1);
		}
	} catch (e) {
		console.error(JSON.stringify({ ok: false, error: "exception", message: e.message }));
		process.exit(1);
	}
}

if (require.main === module) main();
module.exports = { retryPairingRequest, fingerprint };
