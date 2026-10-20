//B"H
// Boruch Hashem
// Blessed is He

/**
 * Speaks only to the same-origin Awtsmoos.com proxy, where the Awtsmoos keeps browser state near and bearer secrets far.
 * Every error keeps its useful MiniMax message intact, so a blocked generation explains what happened instead of becoming a scar.
 */
export class MinimaxProxyClient {
	constructor(base = '/api/olam-h3') {
		this.base = base;
	}

	/** @returns {Promise<Object>} Safe server configuration state. */
	status() {
		return this.request('/status');
	}

	/** @param {Object} generation Transport-ready H3 generation. @returns {Promise<Object>} Created task data. */
	create(generation) {
		return this.request('/create', { method: 'POST', body: JSON.stringify({ generation }) });
	}

	/** @param {string} taskId MiniMax task ID. @returns {Promise<Object>} Normalized task response. */
	task(taskId) {
		return this.request('/task', { method: 'POST', body: JSON.stringify({ taskId }) });
	}

	/** @param {string} path Proxy path. @param {Object} options Fetch options; timeoutMs bounds the wait (default 10s) so a stalled proxy can never hang boot or polling forever. @returns {Promise<Object>} Parsed response. */
	async request(path, options = {}) {
		const { timeoutMs = 10_000, signal: callerSignal, ...fetchOptions } = options;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		const onCallerAbort = () => controller.abort();
		if (callerSignal) {
			if (callerSignal.aborted) controller.abort();
			else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
		}
		let response;
		try {
			response = await fetch(`${this.base}${path}`, {
				...fetchOptions,
				signal: controller.signal,
				headers: { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) }
			});
		} catch (cause) {
			throw new Error(controller.signal.aborted && !callerSignal?.aborted
				? `The Olam H3 server proxy did not answer within ${Math.round(timeoutMs / 1000)}s.`
				: navigator.onLine === false
					? 'You are offline. Reconnect and Olam H3 will resume tracked jobs.'
					: `The Olam H3 server proxy is unavailable: ${cause.message}`);
		} finally {
			clearTimeout(timer);
			callerSignal?.removeEventListener('abort', onCallerAbort);
		}
		const data = await response.json().catch(() => null);
		if (!data) throw new Error(`The Olam H3 proxy returned an unreadable response (${response.status}).`);
		if (!response.ok || data.ok === false) {
			const error = new Error(data.error || `MiniMax proxy returned HTTP ${response.status}.`);
			error.status = data.status || response.status;
			error.type = data.type || null;
			error.requestId = data.requestId || null;
			throw error;
		}
		return data;
	}
}
