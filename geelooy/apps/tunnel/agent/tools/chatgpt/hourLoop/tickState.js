// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Queue = require("./queue.js");
const Receipts = require("./receipts.js");
const Policy = require("./workerPolicy.js");

/** The Awtsmoos records intent before a send and forbids uncertain replay. */
function update(base, id, change) {
	let output;
	State.patch(base, state => {
		const session = state.sessions[id];
		if (!session) throw new Error("hour_loop_session_not_found");
		output = change(state, session);
	});
	return output;
}
function inspect(base, id, live) {
	return update(base, id, (state, session) => {
		const reason = Policy.stopped(session);
		if (reason) {
			if (session.status === "uncertain") return { phase: "uncertain", reason, turnId: session.pendingIntent };
			if (session.status === "active") { session.status = "stopped"; session.stopReason = reason; }
			return { phase: session.status === "paused" ? "paused" : "stopped", reason };
		}
		if (session.pendingIntent) {
			const row = state.queue[session.pendingIntent];
			if (!row || ["intent", "uncertain"].includes(row.state)) {
				session.status = "uncertain"; session.stopReason = "reconcile_submission";
				return { phase: "uncertain", reason: "reconcile_submission", turnId: session.pendingIntent };
			}
			if (row.state === "waiting_response") {
				if (!live.idle) { row.sawBusy = true; return { phase: "waiting_response" }; }
				const changed = Policy.hash(live.assistantTextPreview) !== row.assistantBefore;
				if (!changed) return { phase: "waiting_response" };
				state.queue[row.id] = Queue.transition(row, "completed");
				delete session.pendingIntent;
			}
		}
		if (live.ok === false) return { phase: "failed", reason: live.error || "browser_probe_failed" };
		if (!Policy.targetMatches(session.url, live.href)) {
			session.status = "stopped"; session.stopReason = "unexpected_navigation";
			return { phase: "stopped", reason: session.stopReason };
		}
		if (!live.promptFound) { session.status = "paused"; return { phase: "paused", reason: "composer_or_login_missing" }; }
		return live.idle ? { phase: "ready" } : { phase: "waiting_response" };
	});
}
function intent(base, id, fence, live, enqueue) {
	return update(base, id, (state, session) => {
		const reason = Policy.stopped(session);
		if (reason || session.pendingIntent) throw new Error(reason || "submission_already_pending");
		const item = Queue.next(state, id) || enqueue(state, session);
		state.queue[item.id] = Queue.transition(item, "intent", {
			fence, attempts: item.attempts + 1, assistantBefore: Policy.hash(live.assistantTextPreview)
		});
		session.pendingIntent = item.id;
		return { ...state.queue[item.id], url: session.url, port: session.port };
	});
}
function sent(base, id, item, result) {
	return update(base, id, (state, session) => {
		const row = state.queue[item.id];
		if (!row || row.fence !== item.fence) throw new Error("stale_submission_fence");
		const submitted = result.submitted === true;
		state.queue[item.id] = Queue.transition(row, submitted ? "waiting_response" : "uncertain", {
			lastError: result.error || "", sentAt: new Date().toISOString()
		});
		session.promptCount += submitted ? 1 : 0;
		if (!submitted && session.status === "active") session.status = "uncertain";
		session.lastResult = { submitted, turnId: item.id, error: result.error || "" };
		session.failures = submitted ? 0 : session.failures + 1;
	});
}
function report(base, id, phase, extra = {}) {
	return update(base, id, (state, session) => {
		if (phase === "stopped" && session.status === "active") { session.status = "stopped"; session.stopReason = extra.reason || "stopped"; }
		if (session.status !== "active" && state.workers[id]) state.workers[id].enabled = false;
		if (phase === "failed") {
			session.failures++;
			session.lastError = extra.reason || extra.error || "tick_failed";
			session.nextWakeAt = Date.now() + Policy.retryDelay(session.failures);
		}
		const receipt = Receipts.create({ conversationId: id, phase, ok: !["failed", "uncertain"].includes(phase),
			error: extra.reason || "", evidence: [phase] });
		Receipts.add(state, receipt);
		return { ok: receipt.ok, action: "chatgptHourLoopTick", phase, conversationId: id,
			promptCount: session.promptCount, status: session.status, receipt, retryAt: session.nextWakeAt,
			nextAction: session.status === "active" ? { action: "chatgptHourLoopTick", conversationId: id } : null, ...extra };
	});
}
module.exports = { inspect, intent, sent, report, update };
