// B"H
const { createConfigLoader } = require('./main-config.js');
const { createPayloadRuntime } = require('./main-payload.js');
const { createDispatch } = require('./main-dispatch.js');
const { createRuntimeState } = require('./main-state.js');
const { createEventEmitter } = require('./main-events.js');
const { createQueueRuntime } = require('./main-queue.js');
const { createRequestRunner } = require('./main-run-request.js');
const { createRegistrationRuntime } = require('./main-registration.js');
const { createConnectionRuntime } = require('./main-connection.js');
const { createStartupRuntime } = require('./main-startup.js');

/** B"H — Components are wired once, while each responsibility remains small. */
function createMainComponents(D, callbacks) {
	const loadConfig = createConfigLoader(D.config, {
		DeviceStateRoot: D.DeviceStateRoot,
		inlineLimit: D.inlineLimit
	});
	const log = D.makeLogger(loadConfig());
	const workers = D.createSupervisor({ log, getConfig: loadConfig });
	const runtime = createRuntimeState({
		Lag: D.Lag,
		Priority: D.Priority,
		workers,
		Limits: D.Limits,
		Circuit: D.Circuit,
		Memory: D.Memory,
		inlineLimit: D.inlineLimit
	});
	const payload = createPayloadRuntime(D.Correlation);
	const streamEvent = createEventEmitter(D.ActionStream, loadConfig);
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
	const queue = createQueueRuntime({
		state: runtime.state,
		stats: runtime.stats,
		routedData: payload.routedData,
		requestPayload: payload.requestPayload,
		streamEvent,
		Priority: D.Priority,
		Circuit: D.Circuit,
		Limits: D.Limits,
		Send: D.Send,
		Correlation: D.Correlation
	});
	queue.setScheduleDrain(callbacks.scheduleDrain);
	const runRequest = createRequestRunner({
		state: runtime.state,
		routedData: payload.routedData,
		streamEvent,
		sendProgress: queue.sendProgress,
		dispatch,
		Kind: D.Kind,
		Continue: D.Continue,
		Limits: D.Limits,
		Send: D.Send,
		Envelope: D.Envelope,
		Correlation: D.Correlation,
		stats: runtime.stats,
		release: callbacks.release
	});
	const registration = createRegistrationRuntime({
		nativeRegistrationPacket: D.nativeRegistrationPacket,
		AGENT_VERSION: D.AGENT_VERSION,
		workers,
		Priority: D.Priority,
		Limits: D.Limits,
		Send: D.Send
	});
	const connection = createConnectionRuntime({
		state: runtime.state,
		loadConfig,
		log,
		TinyWebSocket: D.TinyWebSocket,
		registerReady: registration.registerReady,
		Control: D.Control,
		Replacement: D.Replacement,
		Send: D.Send,
		stats: runtime.stats,
		enqueueRequest: queue.enqueueRequest
	});
	const startup = createStartupRuntime({
		loadConfig,
		log,
		AGENT_VERSION: D.AGENT_VERSION,
		Limits: D.Limits,
		HistoryCleanup: D.HistoryCleanup,
		startLocalApiServer: D.startLocalApiServer,
		Boot: D.Boot,
		Updates: D.Updates,
		connection,
		openHostedControl: D.openHostedControl,
		shouldOpenControl: () => process.argv.includes('--open-control') && process.env.AWTSMOOS_SKIP_OPEN_CONTROL !== '1'
	});
	return { connection, dispatch, loadConfig, log, payload, queue, runRequest, runtime, startup, workers };
}

module.exports = { createMainComponents };
