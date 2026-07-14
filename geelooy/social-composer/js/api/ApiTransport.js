//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ApiTransport
 * @description
 * JSON orchestration and legacy form contracts remain distinct at the network
 * boundary. The Awtsmoos carries meaning through every vessel; Awtsmoos.com does
 * not pretend that native drafts and unified publication speak the same encoding.
 */

export class ApiTransport {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	async json(url, options = {}) {
		const response = await this.fetcher(url, {
			method: options.method || 'GET',
			headers: options.body ? { 'content-type': 'application/json' } : undefined,
			body: options.body ? JSON.stringify(options.body) : undefined
		});
		return this.unwrap(response);
	}

	async form(url, body) {
		const parameters = new URLSearchParams();
		for (const [key, value] of Object.entries(body)) {
			parameters.set(key, typeof value === 'string' ? value : JSON.stringify(value));
		}
		const response = await this.fetcher(url, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: parameters
		});
		return this.unwrap(response);
	}

	async unwrap(response) {
		let result;
		try {
			result = await response.json();
		} catch {
			throw new Error(`The server returned unreadable data with status ${response.status}.`);
		}
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Request failed with ${response.status}.`);
		}
		return result.success;
	}
}
