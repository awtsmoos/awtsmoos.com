// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** TiferesCommentsApi keeps reply depth and root discussion under one balanced contract. */
export class TiferesCommentsApi extends YesodEndpointService {
	comment(id) { return `/comments/${this.identity(id)}`; }

	/** @param {string} id @returns {Promise<object>} Comment envelope. */
	get(id) { return this.yesodClient.get(this.comment(id)); }

	/** @param {string} id @returns {Promise<object>} Comment tree. */
	tree(id) { return this.yesodClient.get(`${this.comment(id)}/tree`); }

	/** @param {string} id @param {object} query @returns {Promise<object>} Reply list. */
	replies(id, query = {}) {
		return this.yesodClient.get(this.query(`${this.comment(id)}/replies`, query));
	}

	/** @param {string} id @returns {Promise<object>} Comment assets. */
	assets(id) { return this.yesodClient.get(`${this.comment(id)}/assets`); }

	/** @param {string} id @param {object} body @returns {Promise<object>} Reply creation envelope. */
	reply(id, body) { return this.yesodClient.post(`${this.comment(id)}/replies`, body); }

	/** @param {object} body @returns {Promise<object>} Root comment creation envelope. */
	create(body) { return this.yesodClient.post('/comments', body); }

	/** @param {string} id @param {object} body @returns {Promise<object>} Updated comment envelope. */
	update(id, body) { return this.yesodClient.put(this.comment(id), body); }

	/** @param {string} id @returns {Promise<object>} Removal envelope. */
	remove(id) { return this.yesodClient.delete(this.comment(id)); }
}

/** @param {object} client @returns {TiferesCommentsApi} Comments service. */
export function createCommentsApi(client) {
	return new TiferesCommentsApi(client);
}
