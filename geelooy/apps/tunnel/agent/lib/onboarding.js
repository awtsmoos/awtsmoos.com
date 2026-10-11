// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tunnel onboarding greeting (Yaakov 2026-10-11).
 * @description
 * When a new user just says "hi" to the tunnel, they meet a real
 * introduction — what the Awtsmoos tunnel is, what it does, and how the
 * site says to use it — never silence and never a raw prompt.
 */

const GREETING_LINES = [
	`B"H — Shalom! I am the Awtsmoos Tunnel, the secure doorway to your machines.`,
	``,
	`WHAT I AM`,
	`  The tunnel joins your devices to Awtsmoos.com without erasing their identity:`,
	`  one installed agent per machine, each with its own immutable tunnel id. Your`,
	`  files stay yours; every remote deed is permission-scoped to you.`,
	``,
	`WHAT I DO`,
	`  • Run commands and manage files on your machines from anywhere.`,
	`  • Move big files and videos with resumable, verifiable transfers.`,
	`  • Manage your Awtsmoos content: posts, heichelos, your library and search.`,
	`  • Send and read your Awtsmoos email, and reach every Awtsmoos API as you.`,
	`  • Heal myself: supervised processes, automatic restart, verified recovery.`,
	``,
	`HOW THE SITE SAYS TO USE ME`,
	`  1. Install on any machine: curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash`,
	`  2. Check me anytime: awt status        (awt --help lists everything)`,
	`  3. If I ever break: awt diagnose       (safe, non-destructive first step)`,
	`  4. Web control room: https://awtsmoos.com/apps/tunnel-control/`,
	`  5. Say hi anytime: awt hello`,
	``,
	`  Press Ctrl+C at any moment to cancel cleanly — I always clean up after myself.`,
	``,
	`What shall we do first?`,
];

/** The full onboarding greeting text. */
function greeting() {
	return GREETING_LINES.join("\n");
}

/** True when a user's message is a greeting that deserves the onboarding intro. */
function isGreeting(text) {
	const clean = String(text || "").trim().toLowerCase().replace(/[!.,…]+$/, "");
	return ["hi", "hello", "hey", "shalom", "yo", "ahoy", "greetings", "howdy", "sup"].includes(clean);
}

/** Answer a user's message: onboarding greeting for greetings, null otherwise. */
function answerMessage(text) {
	if (isGreeting(text)) return greeting();
	return null;
}

module.exports = { GREETING_LINES, greeting, isGreeting, answerMessage };
