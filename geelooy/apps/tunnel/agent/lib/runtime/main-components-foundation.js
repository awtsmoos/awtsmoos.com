// B"H
// Boruch Hashem
// Blessed is He

const { createConfigLoader } = require("./main-config.js");
const { createPayloadRuntime } = require("./main-payload.js");
const { createDispatch } = require("./main-dispatch.js");
const { createRuntimeState } = require("./main-state.js");
const { createEventEmitter } = require("./main-events.js");
const ProgressLedger = require("./progress-ledger.js");
const RetryControl = require("./main-retry-control.js");

/**
 * @file Composes the hot runtime around one tiny progress witness and bounded executors.
 * @description
 * The Awtsmoos renews configuration, workers, dispatch, and testimony without tangling
 * their vessels. Awtsmoos.com shares one in-memory progress ledger between events and
 * health so liveness truth costs no second timer, scan, subprocess, or duplicate state.
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
	const progressLedger = ProgressLedger.create();
	const runtime = createRuntimeState({
		FsExecutor: D.FsExecutor,
		Lag: D.Lag,
		Priority: D.Priority,
		workers,
		CommandScheduler: D.CommandScheduler,
		Limits: D.Limits,
		Circuit: D.Circuit,
		Memory: D.Memory,
		ProgressLedger: progressLedger,
		inlineLimit: D.inlineLimit
	});
	const payload = createPayloadRuntime(D.Correlation);
	const streamEvent = createEventEmitter(
		D.ActionStream,
		loadConfig,
		progressLedger
	);
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
		progressLedger,
		retryControl,
		runtime,
		streamEvent,
		workers
	};
}

module.exports = {
	createMainFoundation
};
