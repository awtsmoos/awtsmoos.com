// B"H
const Identity = require("./identity.js");
const ProcessObserve = require("./processObserve.js");
const Transitions = require("./transitions.js");

/** B"H — Recovery distinguishes a living original from a recycled PID. */
function decide(meta = {}, options = {}) {
	const state = String(meta.status || meta.state || "created");
	if (Transitions.isTerminal(state)) return { action: "keep_terminal", state, meta };
	if (["cancelling", "cleaning"].includes(state) || meta.desiredState === "cancelled") {
		return { action: "resume_cleanup", state, processIdentity: expectedIdentity(meta) };
	}
	const observe = options.observe || ProcessObserve.observeProcess;
	const observed = observe(meta.pid || meta.processIdentity?.pid);
	const comparison = Identity.compareProcess(expectedIdentity(meta), observed);
	if (comparison.state === "dead") return terminal(meta, "stale_lost_worker", "process_missing");
	if (!comparison.ok) return terminal(meta, "identity_unverified", comparison.reason || comparison.state);
	return {
		action: "adopt",
		state: "detached_running",
		meta: transitionSafe(meta, "detached_running", "startup_exact_process_match"),
		observed
	};
}

function expectedIdentity(meta) {
	return Identity.processIdentity({
		pid: meta.pid || meta.processIdentity?.pid,
		processGroupId: meta.processGroupId || meta.processIdentity?.processGroupId,
		birthToken: meta.birthToken || meta.processIdentity?.birthToken,
		platform: meta.platform || meta.processIdentity?.platform
	});
}

function terminal(meta, state, reason) {
	return { action: "finalize", state, meta: transitionSafe(meta, state, reason), reason };
}

function transitionSafe(meta, state, reason) {
	const current = String(meta.status || meta.state || "created");
	if (current === state) return structuredClone(meta);
	try { return Transitions.transition(meta, state, { expectedRevision: Number(meta.revision || 0), reason }); }
	catch {
		return {
			...meta,
			status: state,
			state,
			revision: Number(meta.revision || 0) + 1,
			updatedAt: new Date().toISOString(),
			transitionReason: reason
		};
	}
}

module.exports = { decide, expectedIdentity, transitionSafe };
