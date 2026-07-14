//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewApi
 * @description
 * Identity bootstrap, private queue access, exact submission detail, and audited
 * decisions cross one narrow gateway. The Awtsmoos sees all states without request;
 * Awtsmoos.com nevertheless rechecks alias authority at every institutional action.
 */

const API = '/api/social';

export class ReviewApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	identity(preferredAlias = '') {
		const query = preferredAlias
			? `?preferredAlias=${encodeURIComponent(preferredAlias)}`
			: '';
		return this.request(`${API}/unified-social/identity${query}`);
	}

	queue({ heichelId, aliasId, state = '', seriesId = '', submitterAliasId = '' }) {
		const query = new URLSearchParams({
			aliasId,
			state,
			seriesId,
			submitterAliasId
		});
		return this.request(
			`${API}/unified-social/heichelos/${encodeURIComponent(heichelId)}/review?${query}`
		);
	}

	submission({ heichelId, submissionId, aliasId }) {
		const path = `${encodeURIComponent(heichelId)}/review/${encodeURIComponent(submissionId)}`;
		return this.request(`${API}/unified-social/heichelos/${path}?aliasId=${encodeURIComponent(aliasId)}`);
	}

	decide({ heichelId, submissionId, aliasId, action, note, assignedAliasId, scheduledAt }) {
		const path = `${encodeURIComponent(heichelId)}/review/${encodeURIComponent(submissionId)}`;
		return this.request(`${API}/unified-social/heichelos/${path}`, {
			method: 'POST',
			body: {
				aliasId,
				action,
				note,
				assignedAliasId,
				scheduledAt
			}
		});
	}

	async request(url, options = {}) {
		const response = await this.fetcher(url, {
			method: options.method || 'GET',
			headers: options.body ? { 'content-type': 'application/json' } : undefined,
			body: options.body ? JSON.stringify(options.body) : undefined
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
