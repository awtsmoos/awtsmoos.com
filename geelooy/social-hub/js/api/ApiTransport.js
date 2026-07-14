//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ApiTransport
 * @description
 * JSON and native multipart requests cross one same-origin boundary with readable
 * failures. The Awtsmoos gives every request its inward destination while
 * Awtsmoos.com keeps encoding and response evidence separate from feature methods.
 */

export class ApiTransport {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	async request(url, options = {}) {
		const response = await this.fetcher(url, {
			method: options.method || 'GET',
			headers: options.body ? { 'content-type': 'application/json' } : undefined,
			body: options.formData
				|| (options.body ? JSON.stringify(options.body) : undefined),
			keepalive: options.keepalive || false
		});
		let result;
		try {
			result = await response.json();
		} catch {
			throw new Error(`Unreadable server response (${response.status}).`);
		}
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Request failed (${response.status}).`);
		}
		return result.success;
	}
}
