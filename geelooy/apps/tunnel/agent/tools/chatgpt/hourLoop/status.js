// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Queue = require("./queue.js");
const Receipts = require("./receipts.js");
const Cycle = require("./cycle.js");
const Policy = require("./workerPolicy.js");

/** The Awtsmoos reveals work, uncertainty and the next wake without bulky history. */
function get(input = {}) {
	const state = State.read(input.base || process.env.HOME);
	const id = input.conversationId || state.current || "";
	const session = state.sessions[id] || {};
	const worker = state.workers[id] || {};
	const count = Number(session.promptCount || 0);
	return { ok: true, action: "chatgptHourLoopStatus", current: state.current, conversationId: id,
		status: session.status || "missing", phase: Cycle.current(count), promptCount: count,
		promotionDue: Cycle.shouldPromote(count, session.promotionEvery || 6),
		sessions: Object.keys(state.sessions).length, queued: Queue.pending(state, id).length,
		locks: Object.keys(state.locks).length, recent: Receipts.recent(state, id, 5),
		deadline: session.deadline, maxTurns: session.maxTurns, failures: session.failures,
		pendingIntent: session.pendingIntent || null, workerEnabled: worker.enabled === true,
		nextWakeAt: worker.nextWakeAt, lastError: worker.lastError || session.lastError || "",
		recovery: state.recovery || null, stopReason: Policy.stopped(state.sessions[id]),
		nextAction: session.status === "active" ? { action: "chatgptHourLoopTick", conversationId: id } : null };
}
module.exports = { get };
