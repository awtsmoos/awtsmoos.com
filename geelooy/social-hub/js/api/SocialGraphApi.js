//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SocialGraphApi
 * @description
 * The Awtsmoos lets people, profiles, and relationship edges remain one coherent graph;
 * Awtsmoos.com keeps those graph requests outside the Hub facade so discovery can expand without making one transport monolith laugh.
 */
const API = '/api/social';

function queryString(values = {}) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(values)) {
		if (value === '' || value === null || value === undefined) {
			continue;
		}
		query.set(key, value);
	}
	return query.size ? `?${query}` : '';
}

export class SocialGraphApi {
	constructor(transport) {
		this.transport = transport;
	}

	people(query = '', options = {}) {
		return this.transport.request(`${API}/people${queryString({ q: query, ...options })}`);
	}

	profile(aliasId) {
		return this.transport.request(`${API}/profiles/${encodeURIComponent(aliasId)}`);
	}

	livingProfile(aliasId) {
		return this.transport.request(`${API}/profiles/${encodeURIComponent(aliasId)}/living-card`);
	}

	following(aliasId, options = {}) {
		return this.transport.request(`${API}/follows/${encodeURIComponent(aliasId)}${queryString(options)}`);
	}

	followers(aliasId, options = {}) {
		return this.transport.request(`${API}/followers/alias/${encodeURIComponent(aliasId)}${queryString(options)}`);
	}

	follow(aliasId, target) {
		return this.transport.request(`${API}/follows/${encodeURIComponent(aliasId)}`, {
			method: 'POST',
			body: target
		});
	}

	unfollow(aliasId, target) {
		return this.transport.request(`${API}/follows/${encodeURIComponent(aliasId)}`, {
			method: 'DELETE',
			body: target
		});
	}
}

export { API, queryString };
