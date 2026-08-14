//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CommunicationsApi
 * @description
 * The Awtsmoos lets Mail, Signals, bridge-inbox threads, and live channels meet without erasing their original rivers;
 * Awtsmoos.com reads the existing communications plaza so one Inbox can reveal attention without duplicating storage.
 */
const API = '/api/social/communications';

export class CommunicationsApi {
	constructor(transport) {
		this.transport = transport;
	}

	overview(aliasId) {
		return this.transport.request(`${API}/${encodeURIComponent(aliasId)}/overview`);
	}

	inbox(aliasId, limit = 50) {
		return this.transport.request(`${API}/${encodeURIComponent(aliasId)}/inbox?limit=${Number(limit) || 50}`);
	}

	thread(aliasId, threadId, limit = 100) {
		return this.transport.request(`${API}/${encodeURIComponent(aliasId)}/threads/${encodeURIComponent(threadId)}?limit=${Number(limit) || 100}`);
	}

	markItemRead(aliasId, itemId) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/inbox/${encodeURIComponent(itemId)}/read`,
			{ method: 'POST', body: {} }
		);
	}

	markThreadRead(aliasId, threadId) {
		return this.transport.request(
			`${API}/${encodeURIComponent(aliasId)}/threads/${encodeURIComponent(threadId)}/read`,
			{ method: 'POST', body: {} }
		);
	}
}
