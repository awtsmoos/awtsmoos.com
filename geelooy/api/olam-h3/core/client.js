//B"H
// Boruch Hashem
// Blessed is He

const API_BASE = 'https://api.minimax.io';

/**
 * Carries credentialed MiniMax traffic only on the server, where the Awtsmoos hides the key from browser sight;
 * Awtsmoos.com sends one narrow request and returns the upstream truth without painting every failure white.
 */
class NetzachMiniMaxClient {
	constructor(apiKey = process.env.MINIMAX_API_KEY) {
		this.apiKey = apiKey;
	}

	/** @returns {boolean} Whether the server currently has a MiniMax secret. */
	isConfigured() {
		return Boolean(this.apiKey);
	}

	/** @param {Object} payload Exact H3 body. @returns {Promise<Object>} Upstream create response. */
	async create(payload) {
		return this.request('/v2/video_generation', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
	}

	/** @param {string} taskId MiniMax task ID. @returns {Promise<Object>} Current task response. */
	async query(taskId) {
		return this.request(`/v2/query/video_generation/${encodeURIComponent(taskId)}`, { method: 'GET' });
	}

	/** @param {string} path Upstream path. @param {Object} options Fetch options. @returns {Promise<Object>} Parsed JSON. */
	async request(path, options) {
		if (!this.apiKey) {
			const error = new Error('MiniMax API key is not configured on the server.');
			error.status = 503;
			throw error;
		}

		let response;
		try {
			response = await fetch(`${API_BASE}${path}`, {
				...options,
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			});
		} catch (cause) {
			const error = new Error(`MiniMax network request failed: ${cause.message}`);
			error.status = 502;
			throw error;
		}

		const data = await response.json().catch(() => ({}));
		if (!response.ok) {
			const message = data?.error?.message || data?.message || `MiniMax returned HTTP ${response.status}.`;
			const error = new Error(message);
			error.status = response.status;
			error.upstream = data;
			throw error;
		}

		return data;
	}
}

module.exports = { NetzachMiniMaxClient };
