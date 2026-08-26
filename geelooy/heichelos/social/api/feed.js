// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** Chesed expands the social river through global, Heichel, Series, and Alias scopes. */
export class ChesedFeedApi extends YesodEndpointService {
	/** @param {object} query @returns {Promise<object>} Global feed envelope. */
	global(query = {}) {
		return this.yesodClient.get(this.query('/feed', query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Heichel feed envelope. */
	heichel(id, query = {}) {
		return this.yesodClient.get(this.query(`/feed/heichel/${this.identity(id)}`, query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Series feed envelope. */
	series(id, query = {}) {
		return this.yesodClient.get(this.query(`/feed/series/${this.identity(id)}`, query));
	}

	/** @param {string} id @param {object} query @returns {Promise<object>} Alias feed envelope. */
	alias(id, query = {}) {
		return this.yesodClient.get(this.query(`/feed/alias/${this.identity(id)}`, query));
	}
}

/** @param {object} client @returns {ChesedFeedApi} Feed service. */
export function createFeedApi(client) {
	return new ChesedFeedApi(client);
}
