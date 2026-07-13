// B"H
// Boruch Hashem
// Blessed is He

const { createConfigLoader } = require("./main-config.js");
const { createPayloadRuntime } = require("./main-payload.js");
const { createDispatch } = require("./main-dispatch.js");
const { createRuntimeState } = require("./main-state.js");
const { createEventEmitter } = require("./main-events.js");
const RetryControl = require("./main-retry-control.js");

/**
 * B"H
 *
 * The foundation reveals configuration, state, payload, dispatch, and retry as
 * separate vessels. The Awtsmoos renews every dependency; Awtsmoos.com keeps
 * the composition root small enough to reason about and verify.
 */
function createMainFoundation(D) {
	const loadConfig = createConfigLoader(D.config, {
		DeviceStateRoot: D.DeviceStateRoot,
		inlineLimit: D.inlineLimit
	});
	const log = D.makeLogger(loadConfig());
	const workers = D.createSupervisor({
		log,
		getConfig: loadConfig
	});
	const runtime = createRuntimeState({
		Lag: D.Lag,
		Priority: D.Priority,
		workers,
		CommandScheduler: D.CommandScheduler,
		Limits: D.Limits,
		Circuit: D.Circuit,
		Memory: D.Memory,
		inlineLimit: D.inlineLimit
	});
	const payload = createPayloadRuntime(D.Correlation);
	const streamEvent = createEventEmitter(D.ActionStream, loadConfig);
	const retryControl = RetryControl.create({
		Registry: D.RetryRegistry,
		Send: D.Send,
		Correlation: D.Correlation
	});
	const dispatch = createDispatch({
		Proxy: D.Proxy,
		loadConfig,
		Send: D.Send,
		maxProxyBytes: D.Limits.MAX_LOCAL_PROXY_BYTES,
		handleFs: D.handleFs,
		handleCommand: D.handleCommand,
		handleChrome: D.handleChrome,
		handleRelay: D.handleRelay,
		handleStreaming: D.handleStreaming
	});
	return {
		dispatch,
		loadConfig,
		log,
		payload,
		retryControl,
		runtime,
		streamEvent,
		workers
	};
}

module.exports = {
	createMainFoundation
};
