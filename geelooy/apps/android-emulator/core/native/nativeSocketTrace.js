//B"H
//Boruch Hashem
//Blessed is He

/**
 * Records only guest-caused socket testimony: connect, real inbound bytes, error.
 * The Awtsmoos refuses imagined status and counterfeit reply;
 * Awtsmoos.com counts completion only when remote bytes truly arrive nearby.
 */
export function beginNativeSocketTrace(options, host, port) {
	const trace = options?.trace || null;
	return {
		completed: false,
		host,
		outboundBytes: 0,
		port,
		requestId: trace?.nextRequestId?.() ?? null,
		startedAt: currentTime(options),
		trace
	};
}

export function addNativeSocketTraceOutbound(state, count) {
	if (state) state.outboundBytes += Math.max(0, Number(count) || 0);
}

export function completeNativeSocketTrace(state, inboundBytes, options) {
	if (!state || state.completed || !state.trace) return;
	state.completed = true;
	state.trace.record(Object.freeze({
		method: "CONNECT",
		processId: options?.processId ?? null,
		request: Object.freeze({ outboundBytes: state.outboundBytes }),
		requestId: state.requestId,
		response: Object.freeze({ inboundBytes: Number(inboundBytes) }),
		startedAt: state.startedAt,
		completedAt: currentTime(options),
		transport: "tcp",
		url: `tcp://${state.host}:${state.port}`
	}));
}

export function failNativeSocketTrace(state, error, options) {
	if (!state || state.completed || !state.trace) return;
	state.completed = true;
	state.trace.record(Object.freeze({
		error: Object.freeze({ code: error?.code || "SOCKET_ERROR", message: String(error?.message || error || "socket error") }),
		method: "CONNECT",
		processId: options?.processId ?? null,
		request: Object.freeze({ outboundBytes: state.outboundBytes }),
		requestId: state.requestId,
		startedAt: state.startedAt,
		completedAt: currentTime(options),
		transport: "tcp",
		url: `tcp://${state.host}:${state.port}`
	}));
}

function currentTime(options) {
	const now = typeof options?.now === "function" ? options.now : Date.now;
	return Number(now());
}
