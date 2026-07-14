//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ActivityApi
 * @description
 * Private ledger reads, writes, sharing, preferences, export, and deletion remain
 * one bounded transport family. The Awtsmoos remembers without endpoints while
 * Awtsmoos.com keeps every user-controlled memory operation explicit.
 */

const API = '/api/social/unified-social/activity';

export class ActivityApi {
	constructor(transport) {
		this.transport = transport;
	}

	timeline(aliasId, limit = 200) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}?limit=${limit}`
		);
	}

	record(aliasId, event) {
		return this.transport.request(`${API}/${encodeURIComponent(aliasId)}`, {
			method: 'POST',
			body: event,
			keepalive: true
		});
	}

	savePreferences(aliasId, preferences) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/preferences`,
			{ method: 'POST', body: preferences }
		);
	}

	update(aliasId, eventId, patch) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/events/${encodeURIComponent(eventId)}`,
			{ method: 'POST', body: patch }
		);
	}

	remove(aliasId, eventId) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/events/${encodeURIComponent(eventId)}`,
			{ method: 'DELETE' }
		);
	}

	clear(aliasId) {
		return this.transport.request(`${API}/${encodeURIComponent(aliasId)}`, {
			method: 'DELETE'
		});
	}

	export(aliasId) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/export`
		);
	}
}
