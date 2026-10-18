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
	// B"H — ANSI styling for TTY (Yaakov 2026-10-15)
	const isTTY = process.stdout && process.stdout.isTTY;
	const C = isTTY ? {
		reset: "\x1b[0m",
		bold: "\x1b[1m",
		green: "\x1b[38;2;0;255;136m",
		cyan: "\x1b[38;2;0;238;255m",
		gold: "\x1b[38;2;255;204;0m",
		red: "\x1b[38;2;255;68;68m",
		dim: "\x1b[2m"
	} : { reset: "", bold: "", green: "", cyan: "", gold: "", red: "", dim: "" };
	const logInfo = (msg) => {
		if (isTTY) console.log(msg);
		else options.log?.("info", msg.replace(/\x1b\[[0-9;]*m/g, ""));
	};
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
					logInfo(`${C.bold}${C.cyan}B"H Waiting for approval on your phone...${C.reset} ${C.dim}(code: ${response.userCode})${C.reset}`);
				}
			} catch (error) {
				// B"H — a single failed poll (network blip, timeout, transient
				// server error) must NEVER kill the pairing wait. Keep polling
				// silently until the deadline. Only terminal states abort early.
				// B"H — Yaakov 2026-10-14: NO attempt spam. Only log on success/failure.
				consecutiveErrors += 1;
				await sleepUnlessPush(push, options.pollIntervalMs || POLL_INTERVAL_MS);
				continue;
			}
			consecutiveErrors = 0;
			// B"H — Yaakov 2026-10-14: Only when read-only state shows "approved"
			// do we do the ONE destructive consume. Never poll with consume.
			if (state.state === "approved") {
				logInfo(`${C.bold}${C.green}B"H ✓ Approval received!${C.reset} ${C.cyan}Fetching your secure credential...${C.reset}`);
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
					logInfo(`${C.bold}${C.green}B"H ✓ Credential received!${C.reset} ${C.gold}Starting tunnel...${C.reset}`);
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

/** Presents one bounded approval panel and keeps the raw URL available to headless logs. */
function announce(log, response, approval) {
    const isTTY = Boolean(process.stdout?.isTTY);
    const colored = isTTY && !("NO_COLOR" in process.env) && process.env.TERM !== "dumb";
    const C = colored ? {
        reset: "\x1b[0m", bold: "\x1b[1m", green: "\x1b[1;32m",
        cyan: "\x1b[1;36m", purple: "\x1b[1;35m", gold: "\x1b[1;33m", dim: "\x1b[2m"
    } : { reset: "", bold: "", green: "", cyan: "", purple: "", gold: "", dim: "" };
    const url = String(approval || "").replace(/[\x00-\x1f\x7f]/g, "").slice(0, 2048);
    log?.("info", `B"H Pairing code: ${response.userCode}`);
    log?.("info", "Open this URL in a browser. Do not paste it into a shell:");
    if (isTTY) {
        const width = Math.max(24, Math.min(78, Number(process.stdout.columns) || 78));
        const inner = width - 4;
        const border = "─".repeat(width - 2);
        const row = (text, ink = C.cyan) => {
            for (let i = 0; i < Math.max(text.length, 1); i += inner) {
                const slice = text.slice(i, i + inner);
                console.log(`${C.purple}│${C.reset} ${ink}${slice.padEnd(inner)}${C.reset} ${C.purple}│${C.reset}`);
            }
        };
        console.log("");
        console.log(`${C.purple}╭${border}╮${C.reset}`);
        row("APPROVE ON YOUR PHONE", C.gold);
        console.log(`${C.purple}├${border}┤${C.reset}`);
        row(url);
        console.log(`${C.purple}╰${border}╯${C.reset}`);
        console.log(`${C.green}Full URL:${C.reset} ${url}`);
        console.log("");
    } else if (typeof log === "function") {
        // B"H — console-only output bypassed the authorized headless log collector.
        log("info", url);
    } else {
        console.log(url);
    }
    log?.("info", "Leave this terminal running after approval.");
    log?.("info", `Pairing expires: ${new Date(response.expiresAt).toISOString()}`);
    log?.("info", "The code stays valid while this installer keeps running — take your time.");
    if (isTTY) console.log(`${C.dim}Copy the URL, then continue in this terminal.${C.reset}`);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { MAX_PAIRING_WAIT_MS, POLL_INTERVAL_MS, announce, delay, pairingFailure, wait };
