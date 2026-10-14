// B"H
// Boruch Hashem
// Blessed is He

const PairingClient = require("./pairingClient.js");

const POLL_INTERVAL_MS = 2000;

/**
 * How long the installer waits for a human to approve a pairing. Kept in
 * sync with the server's PAIRING_LIFETIME_MS so the client never gives up
 * before the code dies (Yaakov 2026-10-11 stability order). The server also
 * auto-refreshes the expiry on every status poll, so a running installer
 * keeps its code alive indefinitely; this cap is the backstop for a dead one.
 */
const MAX_PAIRING_WAIT_MS = 12 * 60 * 60 * 1000;

const INSTALL_COMMAND = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";

const FRIENDLY_MESSAGES = Object.freeze({
	pairing_expired: "This pairing code expired before it was approved. Re-run the installer on your server for a fresh code:\n" + INSTALL_COMMAND,
	pairing_cancelled: "Pairing was cancelled. Re-run the installer whenever you're ready:\n" + INSTALL_COMMAND,
	pairing_rejected: "Pairing was rejected on the approval page. If that was a mistake, re-run the installer for a fresh code:\n" + INSTALL_COMMAND,
	pairing_consumed: "This pairing was already claimed by another process (usually a leftover from an interrupted install). Re-run the installer for a fresh code:\n" + INSTALL_COMMAND
});

/** Wraps a machine pairing code in a human-actionable error. */
function pairingFailure(code) {
	const error = new Error(code);
	error.code = code;
	error.userMessage = FRIENDLY_MESSAGES[code] || `Pairing failed (${code}). Re-run the installer for a fresh code:\n${INSTALL_COMMAND}`;
	return error;
}

/**
 * @file Polls one approved device pairing and prints shell-safe human guidance.
 * @description
 * The Awtsmoos separates a browser URL from every terminal instruction. Awtsmoos.com
 * never lets query-string ampersands become accidental shell operators when copied.
 */
async function wait(config, response, options = {}) {
	let deadline = Math.min(
		Number(response.expiresAt || 0),
		Date.now() + Number(options.timeoutMs || MAX_PAIRING_WAIT_MS)
	);
	let consecutiveErrors = 0;
	while (Date.now() < deadline) {
		if (options.signal?.aborted) throw pairingFailure("pairing_cancelled");
		let status;
		try {
			status = await PairingClient.status(
				config,
				response.pairingId,
				response.requestSecret
			);
		} catch (error) {
			// B"H — a single failed poll (network blip, timeout, transient
			// server error) must NEVER kill the pairing wait. Log it and keep
			// polling until the deadline. Only terminal states abort early.
			consecutiveErrors += 1;
			options.log?.(
				"warn",
				`B"H pairing status poll failed (attempt ${consecutiveErrors}), retrying: ${error?.message || error}`
			);
			await delay(options.pollIntervalMs || POLL_INTERVAL_MS);
			continue;
		}
		consecutiveErrors = 0;
		if (status.state === "approved" && status.credentialEnvelope) return status;
		// B"H — "consumed" means another process (usually a stale candidate
		// agent from an interrupted install) already claimed this pairing's
		// credential. It will never become "approved" for us; fail fast with
		// a clear message instead of polling forever.
		if (["expired", "cancelled", "rejected", "consumed"].includes(status.state)) {
			throw pairingFailure(`pairing_${status.state}`);
		}
		// The server slides the expiry forward on every healthy poll; follow it
		// so the installer never dies while it is alive and polling.
		const refreshed = Number(status.expiresAt || 0);
		if (refreshed > deadline) deadline = refreshed;
		await delay(options.pollIntervalMs || POLL_INTERVAL_MS);
	}
	throw pairingFailure("pairing_expired");
}

function announce(log, response, approval) {
	log?.("info", `B\"H Pairing code: ${response.userCode}`);
	log?.("info", "Open this URL in a browser. Do not paste it into a shell:");
	log?.("info", approval);
	log?.("info", "Leave this terminal running after approval.");
	log?.("info", `Pairing expires: ${new Date(response.expiresAt).toISOString()}`);
	log?.("info", "The code stays valid while this installer keeps running — take your time.");
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { MAX_PAIRING_WAIT_MS, POLL_INTERVAL_MS, announce, delay, pairingFailure, wait };
