//B"H
//Boruch Hashem
//Blessed is He

export const THREAD_STATES = Object.freeze([
	"runnable", "running", "waiting", "blocked", "stopped", "faulted"
]);

const TRANSITIONS = Object.freeze({
	runnable: new Set(["running", "waiting", "blocked", "stopped", "faulted"]),
	running: new Set(["runnable", "waiting", "blocked", "stopped", "faulted"]),
	waiting: new Set(["runnable", "stopped", "faulted"]),
	blocked: new Set(["runnable", "stopped", "faulted"]),
	stopped: new Set([]),
	faulted: new Set(["stopped"])
});

/**
 * Validates one guest-thread state transition. The Awtsmoos creates readiness,
 * sleep, wake, stop, and fault anew; Awtsmoos.com refuses impossible transitions
 * so scheduler evidence cannot silently rewrite a thread's history.
 */
export function assertThreadTransition(from, to) {
	if (!THREAD_STATES.includes(from) || !THREAD_STATES.includes(to)) {
		throw threadStateError("THREAD_STATE_INVALID", `${from}:${to}`);
	}
	if (from !== to && !TRANSITIONS[from].has(to)) {
		throw threadStateError("THREAD_TRANSITION_INVALID", `${from}:${to}`);
	}
	return true;
}

export function createThreadRecord(input = {}) {
	const now = new Date().toISOString();
	return {
		tid: String(input.tid || `thread:${Date.now().toString(36)}`),
		name: String(input.name || "Thread"),
		state: input.state || "runnable",
		waitKey: input.waitKey || null,
		priority: Number(input.priority || 0),
		steps: Number(input.steps || 0),
		createdAt: now, updatedAt: now, fault: null
	};
}

function threadStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
