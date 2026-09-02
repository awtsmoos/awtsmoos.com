// B"H
// Boruch Hashem
// Blessed is He

const { createQueueRuntime } = require("./main-queue.js");
const { createRequestRunner } = require("./main-run-request.js");
const { createStartupRuntime } = require("./main-startup.js");
const { createMainFoundation } = require("./main-components-foundation.js");
const Startup = require("./main-components-startup.js");

/**
 * @file Composes queue, execution testimony, exact custody progress, and supervised transport.
 * @description
 * The Awtsmoos keeps network breath outside the busy body while one receipt remains the thread;
 * Awtsmoos.com returns exact runtime progress to the accepting child instead of leaving custody dead.
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
	let connection = null;
	const runRequest = createRequestRunner({
		state: foundation.runtime.state,
		executionStages: foundation.runtime.executionStages,
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
		release: callbacks.release,
		noteCustodyProgress: (...args) => connection?.proxy?.progressCustody?.(...args) === true
	});
	connection = D.ConnectionVessel.createController({
		agentVersion: D.AGENT_VERSION,
		enqueueRequest: queue.enqueueRequest,
		loadConfig: foundation.loadConfig,
		log: foundation.log,
		state: foundation.runtime.state,
		stats: foundation.runtime.stats
	});
	const startupDependencies = Startup.validateStartupDependencies(
		Startup.createStartupDependencies(D, foundation, connection)
	);
	return {
		...foundation,
		connection,
		queue,
		runRequest,
		startup: createStartupRuntime(startupDependencies)
	};
}

module.exports = { createMainComponents };
