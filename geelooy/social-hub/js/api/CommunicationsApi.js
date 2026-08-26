//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class CommunicationsApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets Mail, Signals, bridge inbox, and live channels meet through one communications root;
 * Awtsmoos.com keeps attention unified while every thread remains encoded, bounded, and true to its original fruit.
 */
export class CommunicationsApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.communications;

	/**
	 * Loads the canonical communication overview for one verified alias without duplicating unread or presence state locally.
	 * @param {string} aliasId - Verified alias identity whose communication summary is requested.
	 * @returns {Promise<unknown>} Server-owned overview payload spanning supported communication sources.
	 */
	overview(aliasId) {
		return this.read(`${this.coordinate(aliasId)}/overview`);
	}

	/**
	 * Loads the bounded unified inbox while preserving the historical numeric fallback used by existing callers.
	 * @param {string} aliasId - Verified alias identity whose inbox is requested.
	 * @param {number} [limit=50] - Desired maximum item count; nonnumeric/zero values retain the legacy 50 fallback.
	 * @returns {Promise<unknown>} Server-owned unified inbox payload.
	 */
	inbox(aliasId, limit = 50) {
		const gevurahLimit = Number(limit) || 50;
		return this.read(`${this.coordinate(aliasId)}/inbox`, { limit: gevurahLimit });
	}

	/**
	 * Loads one encoded communication thread while leaving message ordering and canonical history ownership to the server.
	 * @param {string} aliasId - Verified alias identity viewing the thread.
	 * @param {string} threadId - Canonical thread identity encoded at the path boundary.
	 * @param {number} [limit=100] - Desired history window; invalid/zero values retain the established 100 fallback.
	 * @returns {Promise<unknown>} Server-owned thread/history payload.
	 */
	thread(aliasId, threadId, limit = 100) {
		const gevurahLimit = Number(limit) || 100;
		return this.read(`${this.coordinate(aliasId)}/threads/${this.coordinate(threadId)}`, { limit: gevurahLimit });
	}

	/**
	 * Marks one inbox item read through the server-owned watermark/state machine rather than optimistic client fabrication.
	 * @param {string} aliasId - Verified alias identity performing the read action.
	 * @param {string} itemId - Canonical inbox item identity encoded at the path boundary.
	 * @returns {Promise<unknown>} Server acknowledgment and any canonical read-state result.
	 */
	markItemRead(aliasId, itemId) {
		return this.write(`${this.coordinate(aliasId)}/inbox/${this.coordinate(itemId)}/read`, {});
	}

	/**
	 * Marks one complete communication thread read while preserving server authority over the resulting watermark.
	 * @param {string} aliasId - Verified alias identity performing the read action.
	 * @param {string} threadId - Canonical communication thread identity.
	 * @returns {Promise<unknown>} Server acknowledgment and canonical thread-read result.
	 */
	markThreadRead(aliasId, threadId) {
		return this.write(`${this.coordinate(aliasId)}/threads/${this.coordinate(threadId)}/read`, {});
	}
}
