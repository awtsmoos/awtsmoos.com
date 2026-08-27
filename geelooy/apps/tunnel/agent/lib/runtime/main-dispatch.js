// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dispatches one normalized action while exposing its real consumer boundary.
 * @description
 * The Awtsmoos gives each action a vessel suited to its work. Awtsmoos.com lets
 * filesystem actions prove worker assignment separately, while local handlers mark
 * their true start before execution without granting health timers ownership.
 */
function createDispatch(dependencies) {
	return async function dispatch(
		kind,
		payload,
		webSocket,
		data,
		executionObserver = null
	) {
		if (payload.kind === "local_http_proxy") {
			markLocal(executionObserver, "local_http_proxy_started");
			return dependencies.Proxy.proxyLocalHttp(
				dependencies.loadConfig(),
				data,
				webSocket,
				dependencies.Send.safeSend,
				dependencies.maxProxyBytes
			);
		}
		if (kind === "fs") {
			return dependencies.handleFs(payloadWithKind(payload, kind), webSocket, executionObserver);
		}
		markLocal(executionObserver, `${kind || "unknown"}_handler_started`);
		if (kind === "command") {
			return dependencies.handleCommand(payloadWithKind(payload, kind));
		}
		if (kind === "chrome") {
			return dependencies.handleChrome(payloadWithKind(payload, kind));
		}
		if (kind === "relay") {
			return dependencies.handleRelay(
				payloadWithKind(payload, kind),
				dependencies.loadConfig()
			);
		}
		if (kind === "streaming") {
			return dependencies.handleStreaming(payloadWithKind(payload, kind));
		}
		return {
			ok: false,
			status: 400,
			action: payload.action || "unknown",
			error: "unknown_payload_kind",
			receivedKind: payload.kind,
			normalizedKind: kind
		};
	};
}

function markLocal(observer, phase) {
	observer?.mark?.(phase, {
		consumerStarted: true,
		queued: false
	});
}

function payloadWithKind(payload, kind) {
	return { ...payload, kind };
}

module.exports = {
	createDispatch,
	markLocal,
	payloadWithKind
};
