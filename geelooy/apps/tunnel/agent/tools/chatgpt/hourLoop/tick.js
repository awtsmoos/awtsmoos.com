// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Queue = require("./queue.js");
const Lease = require("./workerLease.js");
const Ledger = require("./tickState.js");
const Idle = require("./idle.js");
const Send = require("./send.js");
const Cycle = require("./cycle.js");
const Prompt = require("./prompt.js");
const Reconcile = require("./reconcile.js");
const Policy = require("./workerPolicy.js");

/** The Awtsmoos admits one turn, journals its intent, then waits for returned evidence. */
async function run(input = {}, deps = {}) {
	const base = input.base || process.env.HOME;
	const initial = State.read(base);
	const id = input.conversationId || initial.current || "";
	const session = initial.sessions[id];
	if (!session) return { ok: false, action: "chatgptHourLoopTick", error: "hour_loop_session_not_found" };
	if (Policy.stopped(session) && session.status !== "uncertain") return Ledger.report(base, id, "stopped", { reason: Policy.stopped(session) });
	const lease = Lease.acquire(base, id);
	if (!lease.ok) return { ok: true, phase: "locked", conversationId: id, retryAfterMs: 1000 };
	const browserLease = Lease.acquire(base, "physical-browser");
	if (!browserLease.ok) { lease.release(); return { ok: true, phase: "locked", retryAfterMs: 1000 }; }
	try {
		if (input.userStop) Ledger.update(base, id, (state, saved) => { saved.status = "stopped"; saved.stopReason = "user_stop"; });
		const target = targetPayload(input, session);
		const live = await (deps.readIdle ? deps.readIdle(target) : Idle.read(target));
		if (!lease.valid()) throw new Error("conversation_lease_lost");
		Reconcile.reconcile(base, id, live);
		const outcome = Ledger.inspect(base, id, live);
		if (outcome.phase !== "ready") return Ledger.report(base, id, outcome.phase, { reason: outcome.reason, target: publicTarget(target) });
		const item = Ledger.intent(base, id, lease.fence, live, enqueueNext);
		const current = State.read(base).sessions[id];
		if (!lease.valid() || !browserLease.valid() || current.status !== "active") {
			return Ledger.report(base, id, "stopped", { reason: "stopped_before_send" });
		}
		const payload = { ...target, prompt: item.prompt, turnId: item.id, expectedUrl: item.url, optimizeDom: false };
		let sent;
		try { sent = await (deps.send ? deps.send(payload) : Send.one(payload)); }
		catch (error) { sent = { submitted: false, error: error.message }; }
		Ledger.sent(base, id, item, sent);
		return Ledger.report(base, id, sent.submitted ? "submitted" : "uncertain", { sent, target: publicTarget(target) });
	} catch (error) {
		return Ledger.report(base, id, "failed", { reason: error.message });
	} finally { browserLease.release(); lease.release(); }
}
function targetPayload(input = {}, session = {}) {
	return { ...input, url: session.url, preferUrl: session.url, port: session.port || 9222, inspectShared: false };
}
function publicTarget(input = {}) { return { url: input.url || "", port: input.port || 9222 }; }
function enqueueNext(state, session) {
	const phase = Cycle.current(session.promptCount || 0);
	const packet = { conversationId: session.conversationId, missionId: session.missionId, objective: session.goal,
		evidence: ["cycle:" + phase], nextAction: { action: "chatgptHourLoopTick", conversationId: session.conversationId },
		emergencyExit: ["user_stop", "not_authenticated", "unexpected_navigation"] };
	const item = Queue.create({ conversationId: session.conversationId,
		prompt: Cycle.instruction(phase, packet) + "\n\n" + Prompt.build(packet) });
	return Queue.add(state, item);
}
function advance(state, session) { session.promptCount = Number(session.promptCount || 0) + 1; return session; }
module.exports = { run, targetPayload, publicTarget, enqueueNext, advance, finish: Ledger.report };
