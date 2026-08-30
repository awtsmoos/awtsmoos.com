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

	/** @param {string} path Proxy path. @param {Object} options Fetch options. @returns {Promise<Object>} Parsed response. */
	async request(path, options = {}) {
		let response;
		try {
			response = await fetch(`${this.base}${path}`, {
				...options,
				headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
			});
		} catch (cause) {
			throw new Error(navigator.onLine === false
				? 'You are offline. Reconnect and Olam H3 will resume tracked jobs.'
				: `The Olam H3 server proxy is unavailable: ${cause.message}`);
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
