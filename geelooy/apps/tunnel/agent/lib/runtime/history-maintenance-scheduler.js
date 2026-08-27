// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./history-maintenance-policy.js");

/**
 * @file Schedules one isolated maintenance child at a time with jitter and a hard ceiling.
 * @description
 * The Awtsmoos lets housekeeping breathe beside the living gate without becoming
 * the gate. Awtsmoos.com never overlaps cleanup children, unrefs every timer, and
 * cuts off a runaway worker so ordinary requests keep flowing in their own vessels.
 */
function create(options = {}) {
	const policy = options.policy || Policy.resolve();
	const launch = options.launch;
	const random = options.random || Math.random;
	const setTimer = options.setTimer || setTimeout;
	const clearTimer = options.clearTimer || clearTimeout;
	const state = freshState();

	function start() {
		if (!state.started) {
			state.started = true;
			launchNow();
		}
		return snapshot();
	}

	function launchNow() {
		if (state.child || state.stopped) return false;
		try {
			const child = launch();
			state.child = child || null;
			state.runs += 1;
			state.lastStartedAt = Date.now();
			child?.unref?.();
			armDeadline(child);
			if (typeof child?.once === "function") {
				child.once("exit", finishRun);
				child.once("error", finishRun);
			} else {
				finishRun();
			}
			return true;
		} catch {
			finishRun();
			return false;
		}
	}

	function armDeadline(child) {
		clearTimer(state.deadlineTimer);
		state.deadlineTimer = setTimer(() => {
			state.timeouts += 1;
			try {
				child?.kill?.("SIGTERM");
			} catch {}
			finishRun();
		}, policy.maxRunMs);
		state.deadlineTimer?.unref?.();
	}

	function finishRun() {
		if (!state.child && !state.deadlineTimer) return;
		clearTimer(state.deadlineTimer);
		state.deadlineTimer = null;
		state.child = null;
		state.lastFinishedAt = Date.now();
		scheduleNext();
	}

	function scheduleNext() {
		if (state.stopped || state.timer) return;
		state.nextDelayMs = Policy.nextDelay(policy, random);
		state.timer = setTimer(() => {
			state.timer = null;
			launchNow();
		}, state.nextDelayMs);
		state.timer?.unref?.();
	}

	function stop() {
		state.stopped = true;
		clearTimer(state.timer);
		clearTimer(state.deadlineTimer);
		state.timer = null;
		state.deadlineTimer = null;
		return snapshot();
	}

	function snapshot() {
		return {
			started: state.started,
			running: Boolean(state.child),
			runs: state.runs,
			timeouts: state.timeouts,
			lastStartedAt: state.lastStartedAt,
			lastFinishedAt: state.lastFinishedAt,
			nextDelayMs: state.nextDelayMs,
			policy
		};
	}

	return { launchNow, snapshot, start, stop };
}

function freshState() {
	return {
		child: null,
		deadlineTimer: null,
		lastFinishedAt: 0,
		lastStartedAt: 0,
		nextDelayMs: 0,
		runs: 0,
		started: false,
		stopped: false,
		timeouts: 0,
		timer: null
	};
}

module.exports = { create, freshState };
