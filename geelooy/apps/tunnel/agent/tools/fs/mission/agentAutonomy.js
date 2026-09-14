//B"H
//Boruch Hashem
//Blessed be He

const Environment = require("../../../lib/deviceIdentity/environment.js");
const View = require("./agentAutonomyView.js");

const STATES = new Map();
const DEFAULT_INTERVAL_MS = 5000;

/**
 * @file Maintains autonomous disposable Shliach capacity independently from mission locks.
 * @description
 * One parent-process timer recovers exhausted sessions and fills useful worker slots. It
 * coalesces overlap, never owns Chrome itself, and stays dormant during candidate probes.
 */
function start(config, options = {}) {
	if (Environment.isCandidateProbe()) {
		return { ok: true, running: false, skipped: true, reason: "candidate_probe_read_only" };
	}
	const state = ensure(config);
	state.runAction = options.runAction || state.runAction;
	state.intervalMs = View.bounded(options.intervalMs, 1000, 30000, DEFAULT_INTERVAL_MS);
	state.desiredAgents = View.bounded(options.desiredAgents, 1, 7, 3);
	state.maxRecoveryAgents = View.bounded(options.maxRecoveryAgents, 1, 7, 3);
	if (!state.runAction) throw new Error("agent_autonomy_missing_action_runner");
	if (!state.running) {
		state.running = true;
		state.startedAt ||= new Date().toISOString();
		schedule(state, 0);
	}
	return View.publicState(state);
}

function ensure(config) {
	const key = View.keyFor(config);
	if (!STATES.has(key)) STATES.set(key, createState(config, key));
	return STATES.get(key);
}

function createState(config, key) {
	return {
		key,
		config,
		running: false,
		inFlight: false,
		timer: null,
		intervalMs: DEFAULT_INTERVAL_MS,
		desiredAgents: 3,
		maxRecoveryAgents: 3,
		startedAt: null,
		lastTickAt: null,
		lastFinishedAt: null,
		lastError: null,
		lastRecovery: null,
		lastPool: null,
		tickCount: 0,
		skippedOverlaps: 0,
		runAction: null
	};
}

function schedule(state, delayMs) {
	if (!state.running) return;
	clearTimeout(state.timer);
	state.timer = setTimeout(() => pulse(state), delayMs);
	state.timer.unref?.();
}

/** Runs recovery before refill so dead sessions keep logical continuity whenever possible. */
async function pulse(state) {
	if (!state.running) return View.publicState(state);
	if (state.inFlight) {
		state.skippedOverlaps += 1;
		schedule(state, state.intervalMs);
		return View.publicState(state);
	}
	state.inFlight = true;
	state.lastTickAt = new Date().toISOString();
	try {
		state.lastRecovery = await state.runAction({
			action: "missionAgentRecoverySweep",
			maxNewAgents: state.maxRecoveryAgents,
			spawn: true
		});
		state.lastPool = await state.runAction({
			action: "missionAgentEnsurePool",
			desiredAgents: state.desiredAgents
		});
		state.lastError = null;
		state.tickCount += 1;
	} catch (error) {
		state.lastError = String(error?.stack || error?.message || error).slice(0, 4000);
	} finally {
		state.inFlight = false;
		state.lastFinishedAt = new Date().toISOString();
		schedule(state, state.intervalMs);
	}
	return View.publicState(state);
}

function status(config) {
	return View.publicState(STATES.get(View.keyFor(config)) || null);
}

function stop(config) {
	const state = STATES.get(View.keyFor(config));
	if (!state) return View.publicState(null);
	state.running = false;
	clearTimeout(state.timer);
	state.timer = null;
	return View.publicState(state);
}

module.exports = { DEFAULT_INTERVAL_MS, pulse, start, status, stop };
