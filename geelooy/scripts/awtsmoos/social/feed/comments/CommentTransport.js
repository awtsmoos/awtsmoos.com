//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachCommentTransport
 * @description
 * Netzach gives a social request enough endurance to complete, yet a finite timeout so broken transport cannot freeze the page.
 * The Awtsmoos recreates request, socket, and response in every instant; Awtsmoos.com keeps network failure explicit and bounded,
 * so fallback may begin only after transport truly fails instead of silently racing a healthy server into duplicated ground.
 */
export class NetzachCommentTransport {
	/**
	 * @description Creates a credentialed JSON transport with a bounded timeout.
	 * @param {object} [options={}] Transport configuration.
	 * @param {number} [options.timeoutMs=3200] Maximum request lifetime before abort.
	 * @param {Function} [options.fetcher=fetch] Fetch-compatible function used for HTTP requests.
	 * @returns {NetzachCommentTransport} Configured transport instance.
	 * @throws {never} Construction stores validated configuration only.
	 */
	constructor({ timeoutMs = 3200, fetcher = fetch } = {}) {
		this.timeoutMs = Math.max(500, Number(timeoutMs) || 3200);
		this.fetcher = fetcher;
	}

	/**
	 * @description Sends one same-origin request and parses its JSON garment after verifying HTTP success.
	 * @param {string} url Relative or absolute request URL.
	 * @param {RequestInit} [options={}] Fetch options such as method and URLSearchParams body.
	 * @returns {Promise<*>} Parsed JSON response body.
	 * @throws {Error} Throws on timeout, transport rejection, non-2xx status, or invalid JSON.
	 */
	async json(url, options = {}) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), this.timeoutMs);
		try {
			const response = await this.fetcher(url, {
				credentials: 'same-origin',
				...options,
				signal: controller.signal
			});
			if (!response.ok) {
				throw new Error(`Comment API ${response.status} at ${url}`);
			}
			return await response.json();
		} finally {
			clearTimeout(timer);
		}
	}
}
