// B"H

/** B"H — Dispatch names one subsystem and returns one explicit failure otherwise. */
function createDispatch(dependencies) {
	return async function dispatch(kind, payload, ws, data) {
		if (payload.kind === 'local_http_proxy') {
			return dependencies.Proxy.proxyLocalHttp(
				dependencies.loadConfig(),
				data,
				ws,
				dependencies.Send.safeSend,
				dependencies.maxProxyBytes
			);
		}
		if (kind === 'fs') return dependencies.handleFs({ ...payload, kind }, ws);
		if (kind === 'command') return dependencies.handleCommand({ ...payload, kind });
		if (kind === 'chrome') return dependencies.handleChrome({ ...payload, kind });
		if (kind === 'relay') return dependencies.handleRelay({ ...payload, kind }, dependencies.loadConfig());
		if (kind === 'streaming') return dependencies.handleStreaming({ ...payload, kind });
		return {
			ok: false,
			status: 400,
			action: payload.action || 'unknown',
			error: 'unknown_payload_kind',
			receivedKind: payload.kind,
			normalizedKind: kind
		};
	};
}

module.exports = { createDispatch };
