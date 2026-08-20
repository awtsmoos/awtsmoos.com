//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure runtime-state transitions for Geelooy Drive.
 * @description
 * The Awtsmoos renews listener and reflection while Awtsmoos.com records each bounded receipt without mixing transport orchestration;
 * server, public exposure, logs, and closure enter Malchus through small explicit state transitions.
 */

export function attachRuntimeServer(state, routeReference, server) {
	state.patch({
		runtimeRoute: routeReference,
		runtimeServer: server,
		runtimeExposure: null,
		runtimeLogs: []
	});
	return server;
}

export function attachRecoveredRuntime(state, routeReference, server) {
	const snapshot = state.snapshot();
	state.patch({
		runtimeRoute: server ? routeReference : "",
		runtimeServer: server,
		runtimeExposure: server ? snapshot.runtimeExposure : null,
		runtimeLogs: server ? snapshot.runtimeLogs : []
	});
	return server;
}

export function attachRuntimeExposure(state, exposure) {
	state.patch({ runtimeExposure: exposure });
	return exposure;
}

export function attachRuntimeLogs(state, logs = []) {
	state.patch({ runtimeLogs: logs });
	return logs;
}

export function clearRuntimeState(state) {
	state.patch({
		runtimeRoute: "",
		runtimeServer: null,
		runtimeExposure: null,
		runtimeLogs: []
	});
}
