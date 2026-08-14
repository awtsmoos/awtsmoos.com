// B"H
// Boruch Hashem
// Blessed is He

const PairingClient = require("./pairingClient.js");

const POLL_INTERVAL_MS = 2000;

/**
 * @file Polls one approved device pairing and prints shell-safe human guidance.
 * @description
 * The Awtsmoos separates a browser URL from every terminal instruction. Awtsmoos.com
 * never lets query-string ampersands become accidental shell operators when copied.
 */
async function wait(config, response, options = {}) {
	const deadline = Math.min(
		Number(response.expiresAt || 0),
		Date.now() + Number(options.timeoutMs || 10 * 60 * 1000)
	);
	while (Date.now() < deadline) {
		if (options.signal?.aborted) throw new Error("pairing_cancelled");
		const status = await PairingClient.status(
			config,
			response.pairingId,
			response.requestSecret
		);
		if (status.state === "approved" && status.credentialEnvelope) return status;
		if (["expired", "cancelled", "rejected"].includes(status.state)) {
			throw new Error(`pairing_${status.state}`);
		}
		await delay(options.pollIntervalMs || POLL_INTERVAL_MS);
	}
	throw new Error("pairing_expired");
}

function announce(log, response, approval) {
	log?.("info", `B\"H Pairing code: ${response.userCode}`);
	log?.("info", "Open this URL in a browser. Do not paste it into a shell:");
	log?.("info", approval);
	log?.("info", "Leave this terminal running after approval.");
	log?.("info", `Pairing expires: ${new Date(response.expiresAt).toISOString()}`);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { POLL_INTERVAL_MS, announce, delay, wait };
