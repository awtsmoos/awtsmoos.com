// B"H

const schedulers = new Map();

function missionIdOf(input = {}) {
	return String(input.missionId || input.id || input.target || "default");
}

function keyFor(config = {}, input = {}) {
	return [
		config.root || process.cwd(),
		config.metadataRoot || "local-metadata",
		missionIdOf(input)
	].join("::");
}

function create(config = {}, input = {}) {
	return {
		key: keyFor(config, input),
		missionId: missionIdOf(input),
		config,
		running: false,
		inFlight: false,
		removeWhenIdle: false,
		timer: null,
		intervalMs: 5000,
		startedAt: null,
		stoppedAt: null,
		nextTickAt: null,
		lastTickAt: null,
		lastFinishedAt: null,
		lastError: null,
		lastResult: null,
		tickCount: 0,
		skippedOverlaps: 0,
		payload: {},
		buildActions: null,
		tickFunction: null
	};
}

function ensure(config = {}, input = {}) {
	const key = keyFor(config, input);
	if (!schedulers.has(key)) schedulers.set(key, create(config, input));
	return schedulers.get(key);
}

function get(config = {}, input = {}) {
	return schedulers.get(keyFor(config, input)) || null;
}

function remove(config = {}, input = {}) {
	return schedulers.delete(keyFor(config, input));
}

function all() {
	return [...schedulers.values()];
}

function snapshot() {
	return {
		count: schedulers.size,
		running: all().filter(state => state.running).length,
		inFlight: all().filter(state => state.inFlight).length,
		timers: all().filter(state => Boolean(state.timer)).length,
		keys: [...schedulers.keys()]
	};
}

module.exports = { all, ensure, get, keyFor, missionIdOf, remove, snapshot };
