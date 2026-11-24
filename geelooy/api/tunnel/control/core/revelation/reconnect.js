//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconnection policy: exponential backoff with jitter + presence states.
 * @description A momentary network interruption must not destroy a session.
 * Device identity survives reconnects; stale presence is never shown as
 * confidently online.
 */

const PRESENCE = Object.freeze([
	"connected", "connecting", "reconnecting", "offline",
	"auth_required", "update_required", "permission_required", "degraded", "unreachable"
]);

/**
 * Delay before reconnect attempt `attempt` (0-based), capped, with jitter.
 * @param {number} attempt
 * @param {{baseMs?:number, capMs?:number, random?:Function}} [opts]
 * @returns {number} Milliseconds.
 */
function backoffMs(attempt, opts = {}) {
	const base = opts.baseMs || 500, cap = opts.capMs || 30_000;
	const random = opts.random || Math.random;
	const exp = Math.min(cap, base * 2 ** Math.max(0, attempt));
	return Math.floor(exp / 2 + random() * (exp / 2));
}

/**
 * Classifies presence from heartbeat age — stale is not "online".
 * @param {{lastHeartbeatAt:number, now?:number, staleMs?:number, deadMs?:number, authOk?:boolean}} s
 * @returns {string} One of PRESENCE.
 */
function classifyPresence(s) {
	if (s.authOk === false) return "auth_required";
	const now = s.now || Date.now();
	const age = now - Number(s.lastHeartbeatAt || 0);
	if (!Number.isFinite(age) || age < 0) return "connecting";
	if (age <= (s.staleMs || 15_000)) return "connected";
	if (age <= (s.deadMs || 90_000)) return "degraded";
	return "offline";
}

module.exports = { PRESENCE, backoffMs, classifyPresence };
