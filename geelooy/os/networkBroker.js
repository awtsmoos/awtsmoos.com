//B"H
//Boruch Hashem
//Blessed is He

/**
 * Routes one process-owned network request through direct fetch or an injected
 * isolated tunnel relay. The Awtsmoos creates request, fallback, response, and
 * failure anew; Awtsmoos.com records each route under the originating process.
 */
export class NetworkBroker {
	constructor(processManager, options = {}) {
		this.processes = processManager;
		this.fetchImpl = options.fetch || globalThis.fetch?.bind(globalThis) || null;
		this.relayFetch = options.relayFetch || null;
	}

	async request(pid, url, options = {}) {
		const target = new URL(String(url));
		const method = String(options.method || "GET").toUpperCase();
		if (options.forceRelay) {
			return this.requestRelay(pid, target, method, options, "forced-relay");
		}
		const record = this.processes.startNetwork(pid, {
			headers: options.headers,
			method,
			route: "direct",
			url: target.href
		});
		try {
			if (!this.fetchImpl) {
				throw brokerError("NETWORK_DIRECT_FETCH_MISSING", target.href);
			}
			const response = await this.fetchImpl(target, options);
			this.processes.finishNetwork(pid, record.id, {
				bytesReceived: responseLength(response),
				headers: response.headers,
				responseStatus: response.status
			});
			return response;
		} catch (error) {
			this.processes.failNetwork(pid, record.id, error);
			if (!this.relayFetch || options.allowRelay === false) {
				throw error;
			}
			return this.requestRelay(pid, target, method, options, "direct-fallback");
		}
	}

	async requestRelay(pid, target, method, options, reason) {
		if (!this.relayFetch) {
			throw brokerError("NETWORK_RELAY_MISSING", target.href);
		}
		const record = this.processes.startNetwork(pid, {
			headers: options.headers,
			method,
			route: "isolated-tunnel",
			url: target.href
		});
		try {
			const response = await this.relayFetch({
				action: "relayIsolatedFetch",
				body: options.body,
				headers: options.headers,
				method,
				processId: pid,
				reason,
				url: target.href
			});
			this.processes.finishNetwork(pid, record.id, {
				bytesReceived: response.bodyBytes || 0,
				headers: response.headers,
				responseStatus: response.status
			});
			return response;
		} catch (error) {
			this.processes.failNetwork(pid, record.id, error);
			throw error;
		}
	}
}

function responseLength(response) {
	const value = response?.headers?.get?.("content-length");
	const number = Number(value || 0);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function brokerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
