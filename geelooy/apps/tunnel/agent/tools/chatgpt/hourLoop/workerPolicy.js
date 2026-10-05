// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Custom = require("./customGpt.js");

/** The Awtsmoos keeps every mission finite and every browser target exact. */
function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(minimum, Math.min(Number.isFinite(number) ? Math.floor(number) : fallback, maximum));
}
function definition(input, previous = {}) {
	const now = Date.now();
	return {
		...previous, status: "active", goal: String(input.goal || input.objective || previous.goal || "").slice(0, 2000),
		missionId: String(input.missionId || previous.missionId || "").slice(0, 200),
		logicalAgentId: String(input.logicalAgentId || previous.logicalAgentId || "").slice(0, 200),
		deadline: input.resume && previous.deadline ? previous.deadline : now + bounded(input.durationMs, 1000, 86400000, 1800000),
		maxTurns: bounded(input.maxTurns, 1, 400, previous.maxTurns || 40),
		maxFailures: bounded(input.maxFailures, 1, 10, previous.maxFailures || 3),
		promotionEvery: bounded(input.promotionEvery, 1, 100, previous.promotionEvery || 6),
		port: bounded(input.port || input.chromePort, 1, 65535, previous.port || 9222),
		promptCount: Number(previous.promptCount || 0), failures: Number(previous.failures || 0),
		startedAt: previous.startedAt || new Date(now).toISOString()
	};
}
function stopped(session) {
	if (!session) return "session_not_found";
	if (session.status !== "active") return session.stopReason || "session_" + session.status;
	if (Date.now() >= session.deadline) return "deadline_reached";
	if (session.promptCount >= session.maxTurns) return "max_turns_reached";
	if (session.failures >= session.maxFailures) return "repeated_failure";
	if (!session.goal) return "missing_bounded_goal";
	return "";
}
function targetMatches(expected, actual) {
	try {
		const a = new URL(expected), b = new URL(actual);
		if (a.origin !== "https://chatgpt.com" || b.origin !== a.origin) return false;
		return a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "") && !!Custom.parse(expected).conversationId;
	} catch { return false; }
}
function hash(text) { return crypto.createHash("sha256").update(String(text || "")).digest("hex"); }
function retryDelay(failures, random = Math.random) {
	return Math.min(60000, 1000 * 2 ** Math.min(6, Math.max(0, failures))) + Math.floor(random() * 500);
}
module.exports = { bounded, definition, stopped, targetMatches, hash, retryDelay };
