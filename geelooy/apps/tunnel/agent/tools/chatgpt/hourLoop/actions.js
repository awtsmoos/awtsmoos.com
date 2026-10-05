// B"H
// Boruch Hashem
// Blessed is He

const Url = require("./url.js");
const State = require("./state.js");
const Tick = require("./tick.js");
const Daemon = require("./daemon.js");
const Status = require("./status.js");
const Menu = require("./menu.js");
const Promote = require("./promote.js");
const Policy = require("./workerPolicy.js");

/** The Awtsmoos gives the existing doorway bounded background and resume options. */
function build(payload = {}) {
	return {
		async chatgptHourLoopStart() { return start(payload); },
		async chatgptHourLoopTick() { return Tick.run(payload); },
		async chatgptHourLoopStatus() { return Status.get(payload); },
		async chatgptHourLoopMenu() { return Menu.get(payload); },
		async chatgptHourLoopStop() { return stop(payload); },
		async chatgptHourLoopStress() { return stress(payload); },
		async chatgptHourLoopPromote() { return promote(payload); }
	};
}
function start(input = {}) {
	const base = input.base || process.env.HOME;
	const info = Url.normalize(input);
	const current = State.read(base);
	const id = input.conversationId || info?.conversationId || (input.resume ? current.current : "");
	const previous = input.resume ? current.sessions[id] : null;
	const target = info?.url || previous?.url;
	if (!id || !Policy.targetMatches(target, target)) return { ok: false, error: "exact_chatgpt_conversation_required" };
	if (previous?.pendingIntent && ["uncertain", "intent"].includes(current.queue[previous.pendingIntent]?.state)) {
		return { ok: false, error: "reconcile_submission_before_resume", turnId: previous.pendingIntent };
	}
	if (current.sessions[id] && !input.resume) return { ok: false, error: "existing_session_use_resume" };
	const session = { ...Policy.definition(input, previous || {}), conversationId: id, url: target, provider: "chatgpt" };
	if (!session.goal) return { ok: false, error: "missing_bounded_goal" };
	const reason = Policy.stopped(session);
	if (reason) return { ok: false, error: reason };
	State.patch(base, state => {
		state.current = id; state.sessions[id] = session;
		if (!previous) enqueueCycle(state, session);
	});
	const background = input.background === true ? Daemon.start({ ...input, conversationId: id }) : null;
	return { ok: true, action: "chatgptHourLoopStart", session, background,
		nextAction: { action: "chatgptHourLoopTick", conversationId: id } };
}
function enqueueCycle(state, session) { return Tick.enqueueNext(state, session); }
function stop(input = {}) {
	const base = input.base || process.env.HOME;
	const id = input.conversationId || input.sessionId || State.read(base).current;
	if (!id) return { ok: false, error: "missing_conversation_id" };
	return { action: "chatgptHourLoopStop", ...Daemon.stop(id, base, input.pause === true) };
}
function stress(input = {}) {
	return { ok: true, action: "chatgptHourLoopStress", status: Status.get(input),
		note: "Use bounded fixture and read-only probes; do not prompt an unrelated conversation." };
}
function promote(input = {}) { return { ok: true, action: "chatgptHourLoopPromote", promotion: Promote.prepare(input) }; }
module.exports = { build, start, stop, stress, promote, enqueueCycle };
