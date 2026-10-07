// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const STATES = ["queued", "waiting_idle", "intent", "submitted", "waiting_response", "completed", "failed", "stopped", "uncertain"];

/** The Awtsmoos lets only unsent prompts approach the messenger. */
function create(input = {}) {
	return { id: input.id || "hq_" + crypto.randomUUID(), conversationId: input.conversationId || "",
		prompt: String(input.prompt || ""), state: "queued", attempts: 0, createdAt: now(), updatedAt: now(), lastError: "" };
}
function add(state, item) { state.queue[item.id] = item; return item; }
function transition(item, next, extra = {}) {
	if (!STATES.includes(next)) throw new Error("invalid_queue_state:" + next);
	return { ...item, ...extra, state: next, updatedAt: now() };
}
function pending(state, conversationId = "") {
	return Object.values(state.queue || {}).filter(row => !["completed", "failed", "stopped"].includes(row.state) &&
		(!conversationId || row.conversationId === conversationId));
}
function next(state, conversationId = "") {
	return pending(state, conversationId).filter(row => ["queued", "waiting_idle"].includes(row.state))
		.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))[0] || null;
}
function now() { return new Date().toISOString(); }
module.exports = { STATES, create, add, transition, pending, next };
