// B"H

const Tick = require("./tick.js");
const Loop = require("./schedulerLoop.js");
const State = require("./state.js");
const View = require("./schedulerView.js");

function status(config = {}, payload = {}) {
	return View.publicStatus(State.get(config, payload));
}

function start(config, payload = {}, buildActions, tickFunction = Tick.tick) {
	const state = State.ensure(config, payload);
	state.intervalMs = View.intervalFrom(payload);
	state.payload = { ...state.payload, ...payload, action: "missionDaemonTick" };
	state.buildActions = buildActions || state.buildActions;
	state.tickFunction = tickFunction || state.tickFunction || Tick.tick;
	state.removeWhenIdle = false;
	if (!state.running) {
		state.running = true;
		state.startedAt = state.startedAt || new Date().toISOString();
		state.stoppedAt = null;
		state.lastError = null;
		Loop.schedule(state, 0);
	}
	return View.publicStatus(state);
}

function stop(config, payload = {}) {
	const state = State.get(config, payload);
	if (!state) return View.publicStatus(null);
	state.running = false;
	state.nextTickAt = null;
	state.stoppedAt = new Date().toISOString();
	state.removeWhenIdle = true;
	clearTimeout(state.timer);
	state.timer = null;
	const output = View.publicStatus(state);
	if (!state.inFlight) State.remove(config, payload);
	return output;
}

function trigger(config, payload = {}) {
	const state = State.get(config, payload);
	return state ? Loop.pulse(state) : Promise.resolve(View.publicStatus(null));
}

function resetForTests() {
	for (const state of State.all()) {
		state.running = false;
		clearTimeout(state.timer);
		State.remove(state.config, { missionId: state.missionId });
	}
}

module.exports = {
	DEFAULT_INTERVAL_MS: View.DEFAULT_INTERVAL_MS,
	MAX_INTERVAL_MS: View.MAX_INTERVAL_MS,
	MIN_INTERVAL_MS: View.MIN_INTERVAL_MS,
	intervalFrom: View.intervalFrom,
	pulse: Loop.pulse,
	resetForTests,
	snapshot: State.snapshot,
	start,
	status,
	stop,
	trigger
};
