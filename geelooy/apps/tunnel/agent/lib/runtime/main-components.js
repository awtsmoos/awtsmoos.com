// B"H
// Boruch Hashem
// Blessed is He

const { createQueueRuntime } = require("./main-queue.js");
const { createRequestRunner } = require("./main-run-request.js");
const { createRegistrationRuntime } = require("./main-registration.js");
const { createConnectionRuntime } = require("./main-connection.js");
const { createStartupRuntime } = require("./main-startup.js");
const { createMainFoundation } = require("./main-components-foundation.js");

/**
 * B"H
 *
 * The final composition joins focused vessels without hiding ownership. The
 * Awtsmoos renews queue, request, registration, connection, and startup;
 * Awtsmoos.com keeps each boundary explicit and independently testable.
 */
function createMainComponents(D, callbacks) {
	const foundation = createMainFoundation(D);
	const queue = createQueueRuntime({
		state: foundation.runtime.state,
		stats: foundation.runtime.stats,
		routedData: foundation.payload.routedData,
		requestPayload: foundation.payload.requestPayload,
		streamEvent: foundation.streamEvent,
		retryControl: foundation.retryControl,
		Priority: D.Priority,
		Circuit: D.Circuit,
		Limits: D.Limits,
		Send: D.Send,
		Correlation: D.Correlation
	});
	queue.setScheduleDrain(callbacks.scheduleDrain);

	const runRequest = createRequestRunner({
		state: foundation.runtime.state,
		routedData: foundation.payload.routedData,
		streamEvent: foundation.streamEvent,
		sendProgress: queue.sendProgress,
		retryControl: foundation.retryControl,
		dispatch: foundation.dispatch,
		Kind: D.Kind,
		Continue: D.Continue,
		Limits: D.Limits,
		Send: D.Send,
		Envelope: D.Envelope,
		Correlation: D.Correlation,
		stats: foundation.runtime.stats,
		release: callbacks.release
	});
	const registration = createRegistrationRuntime({
		nativeRegistrationPacket: D.nativeRegistrationPacket,
		DeviceIdentity: D.DeviceIdentity,
		AGENT_VERSION: D.AGENT_VERSION,
		workers: foundation.workers,
		Priority: D.Priority,
		Limits: D.Limits,
		Send: D.Send
	});
	const connection = createConnectionRuntime({
		state: foundation.runtime.state,
		loadConfig: foundation.loadConfig,
		log: foundation.log,
		agentVersion: D.AGENT_VERSION,
		TinyWebSocket: D.TinyWebSocket,
		registerReady: registration.registerReady,
		Control: D.Control,
		Replacement: D.Replacement,
		Receipt: D.ConnectionReceipt,
		Send: D.Send,
		stats: foundation.runtime.stats,
		enqueueRequest: queue.enqueueRequest
	});
	const startup = createStartupRuntime({
		loadConfig: foundation.loadConfig,
		log: foundation.log,
		AGENT_VERSION: D.AGENT_VERSION,
		Limits: D.Limits,
		HistoryCleanup: D.HistoryCleanup,
		CommandReconciliation: D.CommandReconciliation,
		startLocalApiServer: D.startLocalApiServer,
		Boot: D.Boot,
		Updates: D.Updates,
		DeviceIdentity: D.DeviceIdentity,
		connection,
		openHostedControl: D.openHostedControl,
		shouldOpenControl: () => process.argv.includes("--open-control") &&
			process.env.AWTSMOOS_SKIP_OPEN_CONTROL !== "1"
	});
	return {
		...foundation,
		connection,
		queue,
		runRequest,
		startup
	};
}

module.exports = {
	createMainComponents
};
