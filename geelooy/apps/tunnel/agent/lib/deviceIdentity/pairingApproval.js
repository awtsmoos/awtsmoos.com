// B"H
// Boruch Hashem
// Blessed is He

const PairingClient = require("./pairingClient.js");
const PairingPush = require("./pairingPush.js");

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
	// B"H — Level 3 of Yaakov's multi-level approval detection (2026-10-14):
	// a WebSocket push watcher runs beside polling. It is best-effort only:
	// any failure yields silently to polling, which stays authoritative.
	let push = null;
	try {
		push = PairingPush.watchForApproval(config, response.pairingId, {
			log: options.log,
			signal: options.signal
		});
	} catch {
		push = null;
	}
	try {
		let firstPoll = true;
		while (Date.now() < deadline) {
			if (options.signal?.aborted) throw pairingFailure("pairing_cancelled");
			let state;
			try {
				// B"H — Yaakov 2026-10-14: READ-ONLY polling. Never consumes.
				// The destructive status() is called exactly once, below.
				state = await PairingClient.state(config, response.pairingId);
				if (firstPoll) {
					firstPoll = false;
					options.log?.("info", `B"H Waiting for approval on your phone... (code: ${response.userCode})`);
				}
			} catch (error) {
				// B"H — a single failed poll (network blip, timeout, transient
				// server error) must NEVER kill the pairing wait. Log it and keep
				// polling until the deadline. Only terminal states abort early.
				consecutiveErrors += 1;
				// B"H — Yaakov 2026-10-14: NEVER log [object Object]. Show real error.
				// Only log every 5th failure to avoid spam; the user needs to copy the URL.
				const errMsg = error instanceof Error ? error.message
					: (error && typeof error === "object" ? JSON.stringify(error) : String(error));
				if (consecutiveErrors === 1 || consecutiveErrors % 5 === 0) {
					options.log?.(
						"warn",
						`B"H waiting for approval... (attempt ${consecutiveErrors}, last error: ${errMsg})`
					);
				}
				await sleepUnlessPush(push, options.pollIntervalMs || POLL_INTERVAL_MS);
				continue;
			}
			consecutiveErrors = 0;
			// B"H — Yaakov 2026-10-14: Only when read-only state shows "approved"
			// do we do the ONE destructive consume. Never poll with consume.
			if (state.state === "approved") {
				options.log?.("info", `B"H ✓ Approval received! Fetching your secure credential...`);
				let final;
				try {
					final = await PairingClient.status(
						config,
						response.pairingId,
						response.requestSecret
					);
				} catch (error) {
					throw pairingFailure("pairing_consume_failed");
				}
				if (final.state === "approved" && final.credentialEnvelope) {
					options.log?.("info", `B"H ✓ Credential received! Starting tunnel...`);
					return final;
				}
				// Consume did not return a credential; do not retry (would get "consumed").
				throw pairingFailure(`pairing_${final.state || "consume_failed"}`);
			}
			// B"H — "consumed" means another process (usually a stale candidate
			// agent from an interrupted install) already claimed this pairing's
			// credential. It will never become "approved" for us; fail fast with
			// a clear message instead of polling forever.
			if (["expired", "cancelled", "rejected", "consumed"].includes(state.state)) {
				throw pairingFailure(`pairing_${state.state}`);
			}
			// The server slides the expiry forward on every healthy poll; follow it
			// so the installer never dies while it is alive and polling.
			const refreshed = Number(state.expiresAt || 0);
			if (refreshed > deadline) deadline = refreshed;
			await sleepUnlessPush(push, options.pollIntervalMs || POLL_INTERVAL_MS);
		}
		throw pairingFailure("pairing_expired");
	} finally {
		try { push?.close(); } catch {}
	}
}

/**
 * B"H — Sleeps between polls, but wakes the instant the WebSocket push fires
 * so approval is confirmed without waiting out the poll interval. Falls back
 * to a plain sleep when the push watcher is absent or already finished.
 */
async function sleepUnlessPush(push, ms) {
	if (!push || !push.state.active) {
		await delay(ms);
		return;
	}
	if (push.takeFired()) return;
	await Promise.race([delay(ms), push.notified]);
	push.takeFired();
}

function announce(log, response, approval) {
	// B"H — Yaakov 2026-10-14: URL on its own line, intense CLI styling!
	const isTTY = process.stdout && process.stdout.isTTY;
	const C = isTTY ? {
		reset: "\x1b[0m",
		bold: "\x1b[1m",
		green: "\x1b[38;2;0;255;136m",
		cyan: "\x1b[38;2;0;238;255m",
		gold: "\x1b[38;2;255;204;0m",
		dim: "\x1b[2m"
	} : { reset: "", bold: "", green: "", cyan: "", gold: "", dim: "" };

	log?.("info", `${C.bold}${C.green}B"H Pairing code: ${response.userCode}${C.reset}`);
	log?.("info", "Open this URL in a browser. Do not paste it into a shell:");
	// URL on its own line, no log prefix, with intense styling
	if (isTTY) {
		console.log("");
		console.log(`${C.cyan}${C.bold}╔${"═".repeat(60)}╗${C.reset}`);
		console.log(`${C.cyan}${C.bold}║${C.reset}  ${C.gold}✦ APPROVAL URL ✦${C.reset}${" ".repeat(41)}${C.cyan}${C.bold}║${C.reset}`);
		console.log(`${C.cyan}${C.bold}╠${"═".repeat(60)}╣${C.reset}`);
		// Split URL across lines for readability
		const url = String(approval);
		const maxLen = 56;
		for (let i = 0; i < url.length; i += maxLen) {
			const chunk = url.slice(i, i + maxLen);
			const pad = " ".repeat(Math.max(0, 60 - chunk.length - 2));
			console.log(`${C.cyan}${C.bold}║${C.reset} ${C.cyan}${chunk}${C.reset}${pad}${C.cyan}${C.bold}║${C.reset}`);
		}
		console.log(`${C.cyan}${C.bold}╚${"═".repeat(60)}╝${C.reset}`);
		console.log("");
	} else {
		console.log(approval);
	}
	log?.("info", "Leave this terminal running after approval.");
	log?.("info", `Pairing expires: ${new Date(response.expiresAt).toISOString()}`);
	log?.("info", "The code stays valid while this installer keeps running — take your time.");
	// B"H — Yaakov 2026-10-14: Pause to let user copy the URL before polls scroll the screen.
	if (isTTY) {
		console.log(`${C.dim}─── Copy the URL above, then press Enter to start waiting for approval ───${C.reset}`);
	} else {
		console.log("─── Copy the URL above ───");
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { MAX_PAIRING_WAIT_MS, POLL_INTERVAL_MS, announce, delay, pairingFailure, wait };
