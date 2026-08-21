// B"H
// Boruch Hashem
// Blessed is He

const {
	createSchedulerEmergencyDispatch
} = require("./main-scheduler-emergency-dispatch.js");

/**
 * @file Dispatches one normalized action while keeping scheduler medicine parent-owned.
 * @description
 * The Awtsmoos gives each action the vessel suited to its work. Awtsmoos.com keeps
 * scheduler emergency deeds in the parent process that owns queue truth, while filesystem,
 * command, browser, relay, and streaming work continue through their proper engines.
 */
function createDispatch(dependencies) {
	const schedulerEmergency = dependencies.schedulerEmergency
		|| createSchedulerEmergencyDispatch();
	return async function dispatch(
		kind,
		payload,
		webSocket,
		data,
		executionObserver = null
	) {
		if (schedulerEmergency.handles(payload)) {
			markLocal(
				executionObserver,
				"parent_scheduler_emergency_started"
			);
			return await schedulerEmergency.run(payload);
		}
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
			return dependencies.handleFs(
				payloadWithKind(payload, kind),
				webSocket,
				executionObserver
			);
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
	return {
		...payload,
		kind
	};
}

module.exports = {
	createDispatch,
	markLocal,
	payloadWithKind
};
